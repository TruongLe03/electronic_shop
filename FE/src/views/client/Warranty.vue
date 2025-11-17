<script setup>
import { ref } from "vue";

const policies = [
  {
    icon: "fas fa-shield-alt",
    title: "Chính sách bảo hành",
    content: `
      <h3>Điều kiện bảo hành:</h3>
      <ul>
        <li>Sản phẩm còn trong thời gian bảo hành ghi trên phiếu bảo hành</li>
        <li>Sản phẩm bị lỗi do nhà sản xuất</li>
        <li>Sản phẩm không có dấu hiệu va đập, rơi vỡ, cháy nổ</li>
        <li>Không tháo dỡ, sửa chữa bởi bên thứ ba</li>
      </ul>

      <h3>Thời gian bảo hành:</h3>
      <ul>
        <li>Arduino, vi điều khiển: 6 tháng</li>
        <li>Module điện tử: 6 tháng</li>
        <li>Cảm biến: 3 tháng</li>
        <li>Linh kiện điện tử: 1 tháng</li>
      </ul>

      <h3>Quy trình bảo hành:</h3>
      <ol>
        <li>Liên hệ hotline: 0848 123 456 hoặc email: warranty@lntelectronics.com</li>
        <li>Gửi sản phẩm về địa chỉ: Ngõ 89, Từ Liêm, Hà Nội</li>
        <li>Kiểm tra và xử lý trong 3-7 ngày làm việc</li>
        <li>Gửi trả sản phẩm đã sửa/thay thế</li>
      </ol>

      <p><strong>Lưu ý:</strong> Miễn phí vận chuyển 2 chiều cho sản phẩm bảo hành.</p>
    `,
  },
  {
    icon: "fas fa-exchange-alt",
    title: "Chính sách đổi trả",
    content: `
      <h3>Điều kiện đổi trả:</h3>
      <ul>
        <li>Trong vòng 30 ngày kể từ ngày nhận hàng</li>
        <li>Sản phẩm lỗi do nhà sản xuất hoặc không đúng mô tả</li>
        <li>Sản phẩm còn nguyên vẹn, chưa qua sử dụng</li>
        <li>Còn đầy đủ hộp, phụ kiện, tài liệu kèm theo</li>
        <li>Có hóa đơn, phiếu bảo hành</li>
      </ul>

      <h3>Đổi trong 7 ngày đầu:</h3>
      <ul>
        <li>Sản phẩm lỗi: Đổi sản phẩm mới tương đương</li>
        <li>Không đúng mô tả: Đổi hoặc hoàn tiền 100%</li>
        <li>Shop chịu chi phí vận chuyển</li>
      </ul>

      <h3>Trả hàng từ ngày 8-30:</h3>
      <ul>
        <li>Sản phẩm lỗi: Hoàn tiền 90% giá trị đơn hàng</li>
        <li>Thay đổi ý định: Hoàn tiền 80% (trừ phí vận chuyển)</li>
        <li>Khách hàng chịu phí vận chuyển</li>
      </ul>

      <h3>Quy trình đổi trả:</h3>
      <ol>
        <li>Liên hệ hotline: 0848 123 456 trong vòng 24h</li>
        <li>Cung cấp thông tin đơn hàng và lý do đổi/trả</li>
        <li>Đóng gói sản phẩm và gửi về shop</li>
        <li>Kiểm tra và xử lý trong 2-3 ngày làm việc</li>
        <li>Hoàn tiền qua tài khoản hoặc gửi sản phẩm mới</li>
      </ol>
    `,
  },
  {
    icon: "fas fa-shipping-fast",
    title: "Chính sách giao hàng",
    content: `
      <h3>Thời gian giao hàng:</h3>
      <ul>
        <li><strong>Nội thành Hà Nội:</strong> 1-2 ngày làm việc</li>
        <li><strong>Các tỉnh thành khác:</strong> 3-5 ngày làm việc</li>
        <li><strong>Khu vực xa:</strong> 5-7 ngày làm việc</li>
      </ul>

      <h3>Phí vận chuyển:</h3>
      <ul>
        <li><strong>Miễn phí:</strong> Đơn hàng từ 500,000đ trở lên</li>
        <li><strong>Nội thành Hà Nội:</strong> 20,000đ</li>
        <li><strong>Ngoại thành & tỉnh:</strong> 30,000đ - 50,000đ</li>
        <li><strong>Vùng xa, hải đảo:</strong> Liên hệ để báo giá</li>
      </ul>

      <h3>Đơn vị vận chuyển:</h3>
      <ul>
        <li>Giao hàng nhanh (GHN)</li>
        <li>Giao hàng tiết kiệm (GHTK)</li>
        <li>Viettel Post</li>
        <li>J&T Express</li>
      </ul>

      <h3>Kiểm tra hàng:</h3>
      <ul>
        <li>Khách hàng được kiểm tra hàng trước khi thanh toán (COD)</li>
        <li>Nếu sản phẩm không đúng/lỗi, có quyền từ chối nhận</li>
        <li>Quay video mở hộp để làm bằng chứng khi cần khiếu nại</li>
      </ul>
    `,
  },
  {
    icon: "fas fa-lock",
    title: "Chính sách bảo mật",
    content: `
      <h3>Cam kết bảo mật:</h3>
      <ul>
        <li>Bảo mật tuyệt đối thông tin cá nhân của khách hàng</li>
        <li>Không chia sẻ thông tin cho bên thứ ba</li>
        <li>Chỉ sử dụng thông tin cho mục đích giao dịch</li>
        <li>Áp dụng công nghệ mã hóa SSL</li>
      </ul>

      <h3>Thông tin được thu thập:</h3>
      <ul>
        <li>Họ tên, số điện thoại, email</li>
        <li>Địa chỉ giao hàng</li>
        <li>Thông tin thanh toán</li>
        <li>Lịch sử đơn hàng</li>
      </ul>

      <h3>Mục đích sử dụng:</h3>
      <ul>
        <li>Xử lý và giao đơn hàng</li>
        <li>Thông báo tình trạng đơn hàng</li>
        <li>Hỗ trợ khách hàng</li>
        <li>Gửi thông tin khuyến mãi (nếu đồng ý)</li>
      </ul>

      <h3>Quyền của khách hàng:</h3>
      <ul>
        <li>Yêu cầu xem, sửa, xóa thông tin cá nhân</li>
        <li>Từ chối nhận email marketing</li>
        <li>Khiếu nại về việc lộ thông tin</li>
      </ul>

      <p><strong>Liên hệ bảo mật:</strong> privacy@lntelectronics.com</p>
    `,
  },
  {
    icon: "fas fa-credit-card",
    title: "Chính sách thanh toán",
    content: `
      <h3>Phương thức thanh toán:</h3>
      
      <h4>1. Thanh toán khi nhận hàng (COD):</h4>
      <ul>
        <li>Thanh toán bằng tiền mặt khi nhận hàng</li>
        <li>Được kiểm tra hàng trước khi thanh toán</li>
        <li>Phí COD: 10,000đ - 20,000đ tùy khu vực</li>
      </ul>

      <h4>2. Chuyển khoản ngân hàng:</h4>
      <ul>
        <li>Ngân hàng: Vietcombank</li>
        <li>Số tài khoản: 1234567890</li>
        <li>Chủ tài khoản: LNT ELECTRONICS</li>
        <li>Nội dung: Mã đơn hàng + Số điện thoại</li>
      </ul>

      <h4>3. Ví điện tử:</h4>
      <ul>
        <li>VNPay</li>
        <li>Momo</li>
        <li>ZaloPay</li>
      </ul>

      <h4>4. Thẻ tín dụng/ghi nợ:</h4>
      <ul>
        <li>Visa, Mastercard, JCB</li>
        <li>Thanh toán qua cổng VNPay an toàn</li>
      </ul>

      <h3>Chính sách hoàn tiền:</h3>
      <ul>
        <li>Hoàn tiền trong 3-5 ngày làm việc</li>
        <li>Qua tài khoản ngân hàng của khách hàng</li>
        <li>Miễn phí phí chuyển khoản</li>
      </ul>
    `,
  },
];

const activeTab = ref(0);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16"
    >
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            Chính sách & Điều khoản
          </h1>
          <p class="text-xl text-blue-100">
            Quy định và cam kết của chúng tôi với khách hàng
          </p>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-16">
      <div class="grid lg:grid-cols-4 gap-8">
        <!-- Sidebar Menu -->
        <div class="lg:col-span-1">
          <div
            class="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24"
          >
            <div
              class="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white"
            >
              <h3 class="font-bold">Danh mục</h3>
            </div>
            <nav class="divide-y divide-gray-100">
              <button
                v-for="(policy, index) in policies"
                :key="index"
                @click="activeTab = index"
                :class="[
                  'w-full px-4 py-4 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left',
                  {
                    'bg-blue-50 border-l-4 border-blue-600':
                      activeTab === index,
                  },
                ]"
              >
                <i :class="policy.icon" class="text-blue-600 text-lg w-6"></i>
                <span class="font-medium text-gray-900">{{
                  policy.title
                }}</span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Content -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl shadow-sm p-8">
            <div class="flex items-center gap-4 mb-6 pb-6 border-b">
              <div
                class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center"
              >
                <i
                  :class="policies[activeTab].icon"
                  class="text-2xl text-blue-600"
                ></i>
              </div>
              <h2 class="text-3xl font-bold text-gray-900">
                {{ policies[activeTab].title }}
              </h2>
            </div>

            <div
              class="prose prose-blue max-w-none policy-content"
              v-html="policies[activeTab].content"
            ></div>

            <!-- Contact for more info -->
            <div class="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <i class="fas fa-info-circle text-blue-600"></i>
                Cần thêm thông tin?
              </h3>
              <p class="text-gray-700 mb-4">
                Nếu bạn có thắc mắc về chính sách này, vui lòng liên hệ với
                chúng tôi.
              </p>
              <div class="flex flex-wrap gap-3">
                <a
                  href="tel:0848123456"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i class="fas fa-phone mr-2"></i>
                  0848 123 456
                </a>
                <router-link
                  to="/contact"
                  class="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <i class="fas fa-envelope mr-2"></i>
                  Liên hệ
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
