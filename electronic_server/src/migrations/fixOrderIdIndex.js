import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixOrderIdIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('orders');

    // Drop existing orderId index if it exists
    try {
      await collection.dropIndex('orderId_1');
      console.log('Dropped existing orderId index');
    } catch (error) {
      console.log('No existing orderId index found or already dropped');
    }

    // Remove any orders with null orderId
    const deleteResult = await collection.deleteMany({ orderId: null });
    console.log(`Deleted ${deleteResult.deletedCount} orders with null orderId`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixOrderIdIndex();