// Migration script to fix Payment collection index issue
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixPaymentIndexes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('payments');

    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    console.log(indexes);

    // Check if paymentId_1 index exists and drop it
    const hasPaymentIdIndex = indexes.some(index => index.name === 'paymentId_1');
    
    if (hasPaymentIdIndex) {
      console.log('🗑️ Dropping old paymentId_1 index...');
      await collection.dropIndex('paymentId_1');
      console.log('✅ Old index dropped successfully');
    } else {
      console.log('ℹ️ No paymentId_1 index found');
    }

    // Check if there are any payments with null paymentId
    const paymentsWithNullId = await collection.countDocuments({ paymentId: null });
    console.log(`📊 Found ${paymentsWithNullId} payments with null paymentId`);

    if (paymentsWithNullId > 0) {
      console.log('🔄 Updating payments with null paymentId...');
      
      const paymentsToUpdate = await collection.find({ paymentId: null }).toArray();
      
      for (const payment of paymentsToUpdate) {
        const newPaymentId = 'PAY' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        await collection.updateOne(
          { _id: payment._id },
          { $set: { paymentId: newPaymentId } }
        );
        
        console.log(`✅ Updated payment ${payment._id} with paymentId: ${newPaymentId}`);
      }
    }

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run migration
fixPaymentIndexes();