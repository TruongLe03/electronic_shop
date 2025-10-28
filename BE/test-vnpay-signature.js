// Test VNPay signature generation
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      sorted[key] = obj[key];
    }
  });
  return sorted;
}

// Test signature generation with sample data
const testParams = {
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_TmnCode: process.env.VNP_TMNCODE,
  vnp_Amount: '7779000',
  vnp_CurrCode: 'VND',
  vnp_TxnRef: '68f9f128854c6d8d2b95f874',
  vnp_OrderInfo: 'Thanh toan don hang #2b95f864',
  vnp_OrderType: 'other',
  vnp_Locale: 'vn',
  vnp_ReturnUrl: 'http://localhost:6789/api/v1/vnpay/return',
  vnp_IpAddr: '127.0.0.1',
  vnp_CreateDate: '20251023161104',
  vnp_ExpireDate: '20251023162604'
};

console.log('=== VNPay Signature Test ===');
console.log('Original params:', testParams);

const sortedParams = sortObject(testParams);
console.log('\nSorted params:', sortedParams);

const signData = Object.keys(sortedParams)
  .map(key => `${key}=${sortedParams[key]}`)
  .join('&');
console.log('\nSign data:', signData);

const hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
const signature = hmac.update(signData, 'utf8').digest('hex');
console.log('\nGenerated signature:', signature);

// Test with URL encoding
const urlEncodedSignData = Object.keys(sortedParams)
  .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
  .join('&');
console.log('\nURL encoded sign data:', urlEncodedSignData);

const hmac2 = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
const signature2 = hmac2.update(urlEncodedSignData, 'utf8').digest('hex');
console.log('Signature with URL encoding:', signature2);

console.log('\n=== Test Complete ===');