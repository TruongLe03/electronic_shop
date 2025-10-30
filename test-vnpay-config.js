// Test VNPay configuration
import dotenv from 'dotenv';
dotenv.config();

console.log('=== VNPay Configuration Test ===');
console.log('VNP_TMNCODE:', process.env.VNP_TMNCODE);
console.log('VNP_HASHSECRET exists:', !!process.env.VNP_HASHSECRET);
console.log('VNP_URL:', process.env.VNP_URL);
console.log('VNP_RETURNURL:', process.env.VNP_RETURNURL);

if (!process.env.VNP_TMNCODE) {
  console.error('❌ VNP_TMNCODE is missing!');
}
if (!process.env.VNP_HASHSECRET) {
  console.error('❌ VNP_HASHSECRET is missing!');
}
if (!process.env.VNP_URL) {
  console.error('❌ VNP_URL is missing!');
}
if (!process.env.VNP_RETURNURL) {
  console.error('❌ VNP_RETURNURL is missing!');
}

console.log('=== Test Complete ===');