// Placeholder order controller cho demo
// Trong thực tế sẽ cần tạo Order model và implement đầy đủ

export const getUserOrders = async (req, res) => {
  try {
    // Mock data cho demo
    const orders = [
      {
        _id: "order_001",
        orderNumber: "DH001",
        status: "delivered",
        totalAmount: 1500000,
        items: [
          {
            product: {
              name: "iPhone 13",
              image: "https://via.placeholder.com/100",
            },
            quantity: 1,
            price: 1500000
          }
        ],
        shippingAddress: {
          name: "Nguyễn Văn A",
          phone: "0123456789",
          address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
        },
        createdAt: new Date("2024-01-15"),
        deliveredAt: new Date("2024-01-20")
      },
      {
        _id: "order_002",
        orderNumber: "DH002",
        status: "shipping",
        totalAmount: 2500000,
        items: [
          {
            product: {
              name: "MacBook Air M1",
              image: "https://via.placeholder.com/100",
            },
            quantity: 1,
            price: 2500000
          }
        ],
        shippingAddress: {
          name: "Nguyễn Văn A",
          phone: "0123456789",
          address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
        },
        createdAt: new Date("2024-01-18"),
        estimatedDelivery: new Date("2024-01-25")
      },
      {
        _id: "order_003",
        orderNumber: "DH003",
        status: "pending",
        totalAmount: 800000,
        items: [
          {
            product: {
              name: "AirPods Pro",
              image: "https://via.placeholder.com/100",
            },
            quantity: 1,
            price: 800000
          }
        ],
        shippingAddress: {
          name: "Nguyễn Văn A",
          phone: "0123456789",
          address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
        },
        createdAt: new Date("2024-01-20")
      }
    ];

    // Lọc theo status nếu có
    const { status } = req.query;
    let filteredOrders = orders;
    
    if (status && status !== 'all') {
      filteredOrders = orders.filter(order => order.status === status);
    }

    res.json({
      success: true,
      data: filteredOrders
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Mock data - trong thực tế sẽ query từ database
    const order = {
      _id: orderId,
      orderNumber: "DH001",
      status: "delivered",
      totalAmount: 1500000,
      items: [
        {
          product: {
            name: "iPhone 13",
            image: "https://via.placeholder.com/100",
            sku: "IP13-128GB"
          },
          quantity: 1,
          price: 1500000
        }
      ],
      shippingAddress: {
        name: "Nguyễn Văn A",
        phone: "0123456789",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
      },
      paymentMethod: "COD",
      shippingFee: 30000,
      discount: 0,
      createdAt: new Date("2024-01-15"),
      deliveredAt: new Date("2024-01-20"),
      trackingHistory: [
        {
          status: "pending",
          description: "Đơn hàng đã được tạo",
          timestamp: new Date("2024-01-15")
        },
        {
          status: "confirmed",
          description: "Đơn hàng đã được xác nhận",
          timestamp: new Date("2024-01-16")
        },
        {
          status: "shipping",
          description: "Đơn hàng đang được giao",
          timestamp: new Date("2024-01-18")
        },
        {
          status: "delivered",
          description: "Đơn hàng đã được giao thành công",
          timestamp: new Date("2024-01-20")
        }
      ]
    };

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Get order detail error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Trong thực tế sẽ kiểm tra trạng thái đơn hàng và update database
    res.json({
      success: true,
      message: "Hủy đơn hàng thành công"
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
