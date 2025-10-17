import axiosInstance from '../utils/axiosConfig'
import { extractResponseData } from '../utils/responseUtils'

// Get all inventories with filters and pagination
export const getInventories = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/inventory', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching inventories:', error)
    throw error
  }
}

// Get inventory by product ID
export const getInventoryByProduct = async (productId) => {
  try {
    const response = await axiosInstance.get(`/inventory/product/${productId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching inventory by product:', error)
    throw error
  }
}

// Update inventory
export const updateInventory = async (productId, inventoryData) => {
  try {
    const response = await axiosInstance.put(`/inventory/product/${productId}`, inventoryData)
    return response.data
  } catch (error) {
    console.error('Error updating inventory:', error)
    throw error
  }
}

// Add stock
export const addStock = async (productId, stockData) => {
  try {
    const response = await axiosInstance.post(`/inventory/add/${productId}`, stockData)
    return response.data
  } catch (error) {
    console.error('Error adding stock:', error)
    throw error
  }
}

// Remove stock
export const removeStock = async (productId, stockData) => {
  try {
    const response = await axiosInstance.post(`/inventory/remove/${productId}`, stockData)
    return response.data
  } catch (error) {
    console.error('Error removing stock:', error)
    throw error
  }
}

// Check stock availability
export const checkStock = async (productId, quantity = 1) => {
  try {
    const response = await axiosInstance.get(`/inventory/check/products/${productId}`, {
      params: { quantity }
    })
    return extractResponseData(response)
  } catch (error) {
    console.error('Error checking stock:', error)
    throw error
  }
}

// Get stock movements history
export const getStockMovements = async (productId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/inventory/movements/${productId}`, { params })
    return response.data
  } catch (error) {
    console.error('Error fetching stock movements:', error)
    throw error
  }
}

// Get inventory dashboard stats
export const getInventoryStats = async () => {
  try {
    const response = await axiosInstance.get('/api/inventory/stats')
    return response.data
  } catch (error) {
    console.error('Error fetching inventory stats:', error)
    throw error
  }
}

export default {
  getInventories,
  getInventoryByProduct,
  updateInventory,
  addStock,
  removeStock,
  checkStock,
  getStockMovements,
  getInventoryStats
}