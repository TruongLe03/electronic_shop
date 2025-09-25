# Admin API Documentation

## Base URL
All admin endpoints require authentication with Bearer token and admin role.
Base URL: `/api/admin`

## Authentication
All endpoints require:
- Header: `Authorization: Bearer <jwt_token>`
- User role must be `admin`

## Dashboard Endpoints

### GET /api/admin/stats
Get dashboard statistics
- Response: `{ success: true, data: { totalUsers, totalProducts, totalOrders, totalRevenue } }`

### GET /api/admin/recent-orders?limit=5
Get recent orders for dashboard
- Query params: `limit` (default: 5)
- Response: `{ success: true, data: [{ id, customer, amount, status, createdAt }] }`

### GET /api/admin/recent-users?limit=5
Get recent users for dashboard
- Query params: `limit` (default: 5)
- Response: `{ success: true, data: [{ name, email, status, createdAt }] }`

## User Management

### GET /api/admin/users
Get all users with pagination and filters
- Query params: `page`, `limit`, `search`, `role`, `status`
- Response: `{ success: true, data: { users: [], pagination: {} } }`

### GET /api/admin/users/:userId
Get user by ID
- Response: `{ success: true, data: user }`

### PATCH /api/admin/users/:userId/status
Update user status
- Body: `{ status: "active|inactive|suspended" }`
- Response: `{ success: true, message, data: user }`

### PATCH /api/admin/users/:userId/role
Update user role
- Body: `{ role: "admin|customer" }`
- Response: `{ success: true, message, data: user }`

### DELETE /api/admin/users/:userId
Delete user (cannot delete self)
- Response: `{ success: true, message }`

## Order Management

### GET /api/admin/orders
Get all orders with pagination and filters
- Query params: `page`, `limit`, `status`, `paymentStatus`, `startDate`, `endDate`
- Response: `{ success: true, data: { orders: [], pagination: {} } }`

### GET /api/admin/orders/:orderId
Get order by ID
- Response: `{ success: true, data: order }`

### PATCH /api/admin/orders/:orderId/status
Update order status
- Body: `{ status: "pending|confirmed|processing|shipping|delivered|cancelled" }`
- Response: `{ success: true, message, data: order }`

## Product Management (Reuses existing controllers)

### GET /api/admin/products
Get all products (same as public endpoint but admin access)

### GET /api/admin/products/:id
Get product by ID

### POST /api/admin/products
Create new product

### PUT /api/admin/products/:id
Update product

### DELETE /api/admin/products/:id
Delete product

## Inventory Management

### GET /api/admin/inventory
Get all inventory items with pagination and filters

### GET /api/admin/inventory/stats
Get inventory dashboard statistics

### GET /api/admin/inventory/product/:productId
Get inventory for specific product

### GET /api/admin/inventory/movements/:productId
Get stock movement history for product

### PUT /api/admin/inventory/product/:productId
Update inventory settings for product

### POST /api/admin/inventory/adjustment
Create inventory adjustment (add/remove stock)

## Analytics

### GET /api/admin/analytics/sales?period=30d
Get sales analytics
- Query params: `period` (7d, 30d, 90d, 1y)
- Response: Daily sales data for the period

### GET /api/admin/analytics/users?period=30d
Get user registration analytics
- Query params: `period` (7d, 30d, 90d, 1y)
- Response: Daily new user registrations

### GET /api/admin/analytics/products?period=30d
Get product performance analytics
- Query params: `period` (7d, 30d, 90d, 1y)
- Response: Top selling products data

## Error Responses
All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Optional detailed error message"
}
```

## HTTP Status Codes
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not admin)
- 404: Not Found
- 500: Internal Server Error