import nodemailer from 'nodemailer';

// Hàm tạo mã OTP ngẫu nhiên 6 số
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hàm tạo transporter cho nodemailer
const createTransporter = () => {
  // Kiểm tra cấu hình email
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email configuration missing: EMAIL_USER or EMAIL_PASSWORD not set');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Thêm cấu hình bảo mật
    secure: true, // true for 465, false for other ports
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log('🚀 Starting email send process...');
    console.log('📧 Email config:', {
      user: process.env.EMAIL_USER ? 'configured' : 'missing',
      pass: process.env.EMAIL_PASSWORD ? 'configured' : 'missing',
      to: email
    });

    const transporter = createTransporter();
    
    // Verify transporter connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    const mailOptions = {
      from: `"Electronic Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã OTP xác thực",
      text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Electronic Shop</h2>
          <h3>Mã OTP xác thực</h3>
          <p>Mã OTP của bạn là:</p>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 5px; margin: 10px 0;">
            ${otp}
          </div>
          <p style="color: #666;">Mã này có hiệu lực trong 10 phút.</p>
          <p style="color: #666;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        </div>
      `
    };

    console.log('📨 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      command: error.command
    });
    return { success: false, error: error.message };
  }
};
