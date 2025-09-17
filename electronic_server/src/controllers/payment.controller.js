import Payment from '../models/payment.model.js';
import Order from '../models/orders.model.js';
import crypto from 'crypto';
import querystring from 'querystring';
import axios from 'axios';

// VNPay configuration
const VNP_TMN_CODE = process.env.VNP_TMN_CODE;
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET;
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/vnpay/return';

// MoMo configuration
const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY;
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn';

// Create payment for order
export const createPayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Create payment record
    const payment = new Payment({
      orderId: order._id,
      amount: order.total,
      method,
      customerInfo: {
        name: order.shippingAddress.fullName,
        email: order.shippingAddress.email,
        phone: order.shippingAddress.phone
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await payment.save();

    let paymentUrl = null;

    switch (method) {
      case 'vnpay':
        paymentUrl = await createVNPayPayment(payment, order, req.ip);
        break;
      case 'momo':
        paymentUrl = await createMoMoPayment(payment, order);
        break;
      case 'cod':
        // COD doesn't need payment URL
        payment.status = 'pending';
        await payment.save();
        break;
      default:
        return res.status(400).json({ message: 'Unsupported payment method' });
    }

    res.json({
      message: 'Payment created successfully',
      paymentId: payment.paymentId,
      paymentUrl,
      method
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// VNPay payment creation
const createVNPayPayment = async (payment, order, ipAddr) => {
  try {
    const createDate = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
    const orderId = payment.paymentId;
    
    let vnp_Params = {
      'vnp_Version': '2.1.0',
      'vnp_Command': 'pay',
      'vnp_TmnCode': VNP_TMN_CODE,
      'vnp_Locale': 'vn',
      'vnp_CurrCode': 'VND',
      'vnp_TxnRef': orderId,
      'vnp_OrderInfo': `Thanh toan don hang ${order.orderId}`,
      'vnp_OrderType': 'other',
      'vnp_Amount': Math.round(payment.amount * 100), // VNPay uses amount * 100
      'vnp_ReturnUrl': VNP_RETURN_URL,
      'vnp_IpAddr': ipAddr,
      'vnp_CreateDate': createDate
    };

    // Sort parameters
    vnp_Params = sortObject(vnp_Params);
    
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    // Update payment with VNPay info
    payment.vnp_TxnRef = orderId;
    payment.gatewayProvider = 'vnpay';
    payment.status = 'processing';
    await payment.save();

    return VNP_URL + '?' + querystring.stringify(vnp_Params, { encode: false });
  } catch (error) {
    throw new Error('VNPay payment creation failed: ' + error.message);
  }
};

// MoMo payment creation
const createMoMoPayment = async (payment, order) => {
  try {
    const orderId = payment.paymentId;
    const requestId = orderId;
    const amount = payment.amount.toString();
    const orderInfo = `Thanh toan don hang ${order.orderId}`;
    const redirectUrl = process.env.MOMO_RETURN_URL || 'http://localhost:3000/payment/momo/return';
    const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:3001/api/payment/momo/ipn';
    const extraData = '';

    const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
    
    const signature = crypto
      .createHmac('sha256', MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: MOMO_PARTNER_CODE,
      accessKey: MOMO_ACCESS_KEY,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType: 'captureWallet',
      signature,
      lang: 'en'
    };

    const response = await axios.post(`${MOMO_ENDPOINT}/v2/gateway/api/create`, requestBody);
    
    if (response.data.resultCode === 0) {
      // Update payment with MoMo info
      payment.partnerCode = MOMO_PARTNER_CODE;
      payment.gatewayProvider = 'momo';
      payment.status = 'processing';
      payment.momoSignature = signature;
      await payment.save();
      
      return response.data.payUrl;
    } else {
      throw new Error(`MoMo error: ${response.data.message}`);
    }
  } catch (error) {
    throw new Error('MoMo payment creation failed: ' + error.message);
  }
};

// VNPay return handler
export const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
    
    vnp_Params = sortObject(vnp_Params);
    
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    const payment = await Payment.findOne({ vnp_TxnRef: vnp_Params.vnp_TxnRef });
    
    if (secureHash === signed) {
      if (payment && vnp_Params.vnp_ResponseCode === '00') {
        // Payment successful
        payment.status = 'success';
        payment.vnp_TransactionNo = vnp_Params.vnp_TransactionNo;
        payment.vnp_ResponseCode = vnp_Params.vnp_ResponseCode;
        payment.vnp_SecureHash = secureHash;
        payment.completedAt = new Date();
        payment.callbackVerified = true;
        payment.callbackData = vnp_Params;
        await payment.save();
        
        // Update order payment status
        await Order.findByIdAndUpdate(payment.orderId, {
          paymentStatus: 'paid',
          status: 'confirmed'
        });
        
        res.redirect(`${process.env.CLIENT_URL}/order-success?orderId=${payment.paymentId}`);
      } else {
        // Payment failed
        if (payment) {
          payment.status = 'failed';
          payment.vnp_ResponseCode = vnp_Params.vnp_ResponseCode;
          payment.callbackData = vnp_Params;
          await payment.save();
        }
        
        res.redirect(`${process.env.CLIENT_URL}/order-failed?orderId=${payment?.paymentId}`);
      }
    } else {
      res.redirect(`${process.env.CLIENT_URL}/order-failed?error=invalid_signature`);
    }
  } catch (error) {
    console.error('VNPay return error:', error);
    res.redirect(`${process.env.CLIENT_URL}/order-failed?error=system_error`);
  }
};

// MoMo IPN handler
export const momoIpn = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = req.body;

    // Verify signature
    const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    const payment = await Payment.findOne({ paymentId: orderId });
    
    if (signature === expectedSignature && payment) {
      if (resultCode === 0) {
        // Payment successful
        payment.status = 'success';
        payment.momoTransId = transId;
        payment.completedAt = new Date();
        payment.callbackVerified = true;
        payment.callbackData = req.body;
        await payment.save();
        
        // Update order payment status
        await Order.findByIdAndUpdate(payment.orderId, {
          paymentStatus: 'paid',
          status: 'confirmed'
        });
      } else {
        // Payment failed
        payment.status = 'failed';
        payment.callbackData = req.body;
        await payment.save();
      }
    }
    
    res.json({ resultCode: 0 });
  } catch (error) {
    console.error('MoMo IPN error:', error);
    res.json({ resultCode: -1 });
  }
};

// Confirm COD payment (when delivered)
export const confirmCodPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.method !== 'cod') {
      return res.status(400).json({ message: 'Not a COD payment' });
    }
    
    payment.status = 'success';
    payment.completedAt = new Date();
    await payment.save();
    
    // Update order
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: 'paid',
      status: 'delivered'
    });
    
    res.json({ message: 'COD payment confirmed' });
  } catch (error) {
    console.error('Confirm COD error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findOne({ paymentId })
      .populate('orderId', 'orderId status paymentStatus');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json({
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      order: payment.orderId
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to sort VNPay parameters
const sortObject = (obj) => {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
};