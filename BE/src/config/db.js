import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      connectTimeoutMS: 20000, // 20 seconds timeout for initial connection
      heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
      retryWrites: true, // Retry failed writes
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    console.log("MongoDB Connected...");
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (err) {
    console.error("Error connecting MongoDB:", err.message);
    
    // Thử connect lại sau 5 giây
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
