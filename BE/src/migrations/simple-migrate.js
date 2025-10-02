import mongoose from 'mongoose';
import Product from '../models/products.model.js';
import Inventory from '../models/inventory.model.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    console.log('Fetching products...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);
    
    for (const product of products) {
      console.log(`Product: ${product.name}, Stock: ${product.stock}`);
      
      // Check if inventory exists
      const existingInventory = await Inventory.findOne({ productId: product._id });
      console.log(`Existing inventory: ${existingInventory ? 'YES' : 'NO'}`);
      
      if (!existingInventory && product.stock > 0) {
        const newInventory = new Inventory({
          productId: product._id,
          quantity: product.stock,
          reservedQuantity: 0,
          minStockLevel: 10,
          maxStockLevel: 1000,
          reorderPoint: 20,
          cost: product.price * 0.7,
          location: {
            warehouse: 'Main Warehouse',
            zone: 'A',
            shelf: '001'
          },
          stockMovements: [{
            type: 'IN',
            quantity: product.stock,
            reason: 'Migration from Product model',
            reference: `MIG_${Date.now()}`,
            createdAt: new Date()
          }],
          isActive: true
        });
        
        await newInventory.save();
        console.log(`✅ Created inventory for ${product.name}: ${product.stock} units`);
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

migrate();