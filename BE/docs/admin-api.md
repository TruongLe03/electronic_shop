# Admin API Documentation

## Xác thực và Phân quyền

Tất cả API admin đều yêu cầu:
- **Authentication**: Bearer token trong header `Authorization`
- **Authorization**: User phải có role = "admin"

## Base URL
```
/api/admin
```

## 1. Dashboard & Analytics

### 1.1 Lấy thống kê tổng quan
```http
GET /dashboard/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalProducts": 45,
      "totalOrders": 234,
      "totalCategories": 8,
      "totalRevenue": 15450000
    },
    "ordersByStatus": [...],
    "topProducts": [...],
    "monthlyRevenue": [...]
  }
}
```

### 1.2 Lấy thống kê tăng trưởng
```http
GET /dashboard/growth
```

### 1.3 Thống kê sản phẩm theo danh mục
```http
GET /products/category-stats  
```

### 1.4 Thống kê đơn hàng theo ngày trong tuần
```http
GET /orders/day-stats
```

## 2. User Management

### 2.1 Lấy danh sách người dùng
```http
GET /users?page=1&limit=10&search=&role=&status=&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng per page (default: 10)
- `search` (optional): Tìm kiếm theo tên hoặc email
- `role` (optional): Lọc theo role (admin/customer)
- `status` (optional): Lọc theo status (active/inactive)
- `sortBy` (optional): Sắp xếp theo field (default: createdAt)
- `sortOrder` (optional): Thứ tự sắp xếp (asc/desc, default: desc)

### 2.2 Lấy thông tin chi tiết user
```http
GET /users/:id
```

### 2.3 Cập nhật thông tin user
```http
PUT /users/:id
```
**Body:**
```json
{
  "name": "Tên mới",
  "phone_number": "0123456789",
  "role": "customer",
  "status": "active"
}
```

### 2.4 Thay đổi trạng thái user
```http
PATCH /users/:id/toggle-status
```

### 2.5 Xóa user
```http
DELETE /users/:id
```

### 2.6 Lấy danh sách khách hàng VIP
```http
GET /users/vip/customers?limit=10
```

## 3. Product Management

### 3.1 Lấy danh sách sản phẩm (Admin view)
```http
GET /products?page=1&limit=10&search=&category=&status=&sortBy=createdAt&sortOrder=desc
```

### 3.2 Sản phẩm sắp hết hàng
```http
GET /products/low-stock?threshold=10
```

## 4. Order Management

### 4.1 Lấy danh sách đơn hàng
```http
GET /orders?page=1&limit=10&status=&startDate=&endDate=&userId=&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `status` (optional): Lọc theo trạng thái (pending/confirmed/processing/shipped/delivered/cancelled)
- `startDate` & `endDate` (optional): Lọc theo khoảng thời gian (YYYY-MM-DD)
- `userId` (optional): Lọc theo user ID

### 4.2 Cập nhật trạng thái đơn hàng
```http
PATCH /orders/:id/status
```
**Body:**
```json
{
  "status": "confirmed",
  "note": "Ghi chú của admin (optional)"
}
```

**Valid statuses:** `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

## 5. Inventory Management

### 5.1 Lấy danh sách tồn kho
```http
GET /inventory?page=1&limit=10&search=&lowStock=false&sortBy=createdAt&sortOrder=desc
```

### 5.2 Cập nhật tồn kho
```http
PUT /inventory/:productId
```
**Body:**
```json
{
  "quantity": 50,
  "action": "set"
}
```

**Actions:**
- `set`: Đặt số lượng cụ thể
- `add`: Cộng thêm số lượng
- `subtract`: Trừ số lượng

## 6. Reports & Analytics

### 6.1 Báo cáo doanh thu
```http
GET /reports/revenue?startDate=2023-01-01&endDate=2023-12-31
```

### 6.2 Báo cáo sản phẩm bán chạy
```http
GET /reports/products?limit=20
```

## 7. System Management

### 7.1 Thông tin hệ thống
```http
GET /system/info
```

## Error Responses

Tất cả API đều trả về format error chuẩn:

```json
{
  "success": false,
  "message": "Mô tả lỗi người dùng",
  "error": "Chi tiết lỗi kỹ thuật (chỉ trong development)"
}
```

**Các HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (dữ liệu không hợp lệ)
- `401`: Unauthorized (chưa đăng nhập)
- `403`: Forbidden (không có quyền admin)
- `404`: Not Found (không tìm thấy resource)
- `500`: Internal Server Error (lỗi server)

## Middleware Chain

```
Request → authMiddleware → adminMiddleware → Controller
```

1. **authMiddleware**: Xác thực JWT token
2. **adminMiddleware**: Kiểm tra role admin và status active
3. **Controller**: Xử lý business logic

## Examples

### Lấy dashboard stats với curl:
```bash
curl -X GET "http://localhost:6789/api/admin/dashboard/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Cập nhật trạng thái đơn hàng:
```bash
curl -X PATCH "http://localhost:6789/api/admin/orders/ORDER_ID/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed", "note": "Đã xác nhận đơn hàng"}'
```