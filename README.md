# 🛒 Electronic Shop - E-commerce Platform

## 📋 Mô tả dự án
Ứng dụng thương mại điện tử hiện đại cho cửa hàng điện tử, được xây dựng với Vue 3 và Node.js/Express.

## 🛠️ Công nghệ sử dụng

### Frontend
- **Vue 3** - Framework JavaScript progressive
- **Vue Router** - Routing cho SPA
- **Tailwind CSS** - Framework CSS utility-first
- **Vite** - Build tool nhanh
- **Vue Loading Overlay** - Component loading chuyên nghiệp

### Backend  
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **MongoDB** - Cơ sở dữ liệu NoSQL
- **Mongoose** - ODM cho MongoDB
- **JWT** - JSON Web Tokens cho authentication
- **bcrypt** - Mã hóa password

## 🏗️ Cấu trúc dự án

```
electronic_shop/
├── electronic_client/     # Frontend Vue 3 application
│   ├── src/
│   │   ├── api/           # API service layer
│   │   ├── components/    # Vue components
│   │   ├── views/         # Page components
│   │   ├── stores/        # State management
│   │   ├── routes/        # Router configuration
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── electronic_server/     # Backend Express application
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/        # Mongoose models
    │   ├── routes/        # Express routes
    │   ├── middleware/    # Custom middleware
    │   └── config/        # Configuration files
```

## ✨ Tính năng chính

### 🎯 Người dùng
- ✅ Đăng ký/Đăng nhập tài khoản
- ✅ Xem danh sách sản phẩm với phân trang
- ✅ Chi tiết sản phẩm với gallery ảnh
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Quản lý giỏ hàng (thêm, sửa, xóa)
- ✅ Quản lý tài khoản cá nhân
- ✅ Đổi mật khẩu

### 🏪 Giao diện
- ✅ Responsive design cho mọi thiết bị
- ✅ Hero section với slider
- ✅ Flash sale và sản phẩm nổi bật
- ✅ Danh mục sản phẩm với hình ảnh
- ✅ Loading states chuyên nghiệp
- ✅ Thông báo toast messages
- ✅ Trải nghiệm UX mượt mà

### 🔧 Kỹ thuật
- ✅ Authentication với JWT
- ✅ State management hiệu quả
- ✅ API service layer
- ✅ Error handling toàn diện
- ✅ Image optimization
- ✅ Guest cart functionality

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm hoặc yarn

### Backend Setup
```bash
cd electronic_server
npm install
npm start
```

### Frontend Setup  
```bash
cd electronic_client
npm install
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/electronic_shop
JWT_SECRET=your_jwt_secret_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Screenshots

### Trang chủ
- Hero section với animation
- Statistics và categories nổi bật
- Flash sale và sản phẩm mới
- Newsletter signup

### Chi tiết sản phẩm
- Gallery ảnh với zoom
- Thông tin chi tiết sản phẩm
- Specifications tabs
- Related products

### Giỏ hàng
- Quản lý số lượng sản phẩm
- Tính toán tổng tiền tự động
- Guest cart support
- Responsive design

## 🤝 Đóng góp
Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ
- **Author**: [Your Name]
- **Email**: [your.email@example.com]
- **Project Link**: [https://github.com/yourusername/electronic_shop](https://github.com/yourusername/electronic_shop)

## 🎉 Acknowledgments
- Vue.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the powerful database
- All contributors and testers

---
⭐ **Nếu dự án hữu ích, hãy cho một star nhé!** ⭐
