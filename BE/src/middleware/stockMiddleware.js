import Inventory from '../models/inventory.model.js';

// Middleware to check stock availability
export const checkStockAvailability = async (req, res, next) => {
  try {
    const { items } = req.body; // Expecting array of {productId, quantity}
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }
    
    const stockCheckResults = [];
    let hasStockIssues = false;
    
    for (const item of items) {
      const { productId, quantity } = item;
      
      const stockCheck = await Inventory.checkStock(productId, quantity);
      stockCheckResults.push({
        productId,
        requestedQuantity: quantity,
        ...stockCheck
      });
      
      if (!stockCheck.available) {
        hasStockIssues = true;
      }
    }
    
    if (hasStockIssues) {
      return res.status(400).json({
        success: false,
        message: 'Some items are out of stock or have insufficient quantity',
        stockStatus: stockCheckResults
      });
    }
    
    // Attach stock check results to request for use in next middleware
    req.stockCheckResults = stockCheckResults;
    next();
  } catch (error) {
    console.error('Stock check middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking stock availability',
      error: error.message
    });
  }
};

// Middleware to reserve stock for order
export const reserveStock = async (req, res, next) => {
  try {
    const { items } = req.body;
    const orderId = req.orderId || `ORDER_${Date.now()}`;
    const userId = req.user?.id;
    
    const reservationResults = [];
    
    for (const item of items) {
      const { productId, quantity } = item;
      
      try {
        await Inventory.reserveStock(productId, quantity, orderId, userId);
        reservationResults.push({
          productId,
          quantity,
          status: 'reserved'
        });
      } catch (error) {
        // If reservation fails, release all previously reserved stock
        for (const reservation of reservationResults) {
          await Inventory.releaseStock(
            reservation.productId,
            reservation.quantity,
            orderId,
            userId
          );
        }
        
        return res.status(400).json({
          success: false,
          message: `Failed to reserve stock for product ${productId}: ${error.message}`,
          error: error.message
        });
      }
    }
    
    req.stockReservations = reservationResults;
    next();
  } catch (error) {
    console.error('Stock reservation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reserving stock',
      error: error.message
    });
  }
};

// Middleware to release reserved stock (for order cancellation)
export const releaseReservedStock = async (req, res, next) => {
  try {
    const { items, orderId } = req.body;
    const userId = req.user?.id;
    
    for (const item of items) {
      const { productId, quantity } = item;
      
      try {
        await Inventory.releaseStock(productId, quantity, orderId, userId);
      } catch (error) {
        console.error(`Failed to release stock for product ${productId}:`, error);
        // Continue with other items even if one fails
      }
    }
    
    next();
  } catch (error) {
    console.error('Stock release middleware error:', error);
    next(); // Don't block the request if stock release fails
  }
};

// Middleware to confirm stock out (for order fulfillment)
export const confirmStockOut = async (req, res, next) => {
  try {
    const { items, orderId } = req.body;
    const userId = req.user?.id;
    
    for (const item of items) {
      const { productId, quantity } = item;
      
      try {
        await Inventory.confirmStockOut(productId, quantity, orderId, userId);
      } catch (error) {
        console.error(`Failed to confirm stock out for product ${productId}:`, error);
        // Continue with other items even if one fails
      }
    }
    
    next();
  } catch (error) {
    console.error('Stock confirmation middleware error:', error);
    next(); // Don't block the request if stock confirmation fails
  }
};

export default {
  checkStockAvailability,
  reserveStock,
  releaseReservedStock,
  confirmStockOut
};