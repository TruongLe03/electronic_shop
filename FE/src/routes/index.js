import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@views/client/Home.vue";
import Login from "@views/client/Login.vue";
import Signup from "@views/client/Signup.vue";
import Product from "@views/client/Product.vue";
import Cart from "@views/client/Cart.vue";
import { useAuthStore } from "@stores/auth";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/login", name: "login", component: Login },
  { path: "/signup", name: "signup", component: Signup },
  { path: "/products", name: "product", component: Product },
  {
    path: "/product/:id",
    name: "productDetail",
    component: () => import("@views/client/ProductDetail.vue"),
  },
  {
    path: "/cart",
    name: "cart",
    component: Cart,
  },
  {
    path: "/payment/:orderId?",
    name: "Payment",
    component: () => import("@views/client/Payment.vue"),
  },
  {
    path: "/order-success",
    name: "orderSuccess",
    component: () => import("@views/client/OrderSuccess.vue"),
  },
  {
    path: "/order-detail/:orderId",
    name: "orderDetail",
    component: () => import("../views/client/OrderDetail.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/notifications",
    name: "notifications",
    component: () => import("@views/client/Notifications.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/account",
    name: "account",
    component: () => import("@views/client/Account.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/forgot-password",
    name: "forgotPassword",
    component: () => import("@views/client/ForgotPassword.vue"),
  },
  {
    path: "/deals",
    name: "deals",
    component: () => import("@views/client/Deals.vue"),
  },
  {
    path: "/brands",
    name: "brands",
    component: () => import("@views/client/Brands.vue"),
  },
  {
    path: "/support",
    name: "support",
    component: () => import("@views/client/Support.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("@views/client/Search.vue"),
  },
  // Admin Routes
  {
    path: "/admin",
    name: "adminDashboard",
    component: () => import("@views/admin/Dashboard.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/products",
    name: "adminProducts",
    component: () => import("../views/admin/Products.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/products/add",
    name: "adminProductAdd",
    component: () => import("@views/admin/ProductForm.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/products/edit/:id",
    name: "adminProductEdit",
    component: () => import("@views/admin/ProductForm.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/orders",
    name: "adminOrders",
    component: () => import("@views/admin/Orders.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/users",
    name: "adminUsers",
    component: () => import("@views/admin/Users.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/inventory",
    name: "adminInventory",
    component: () => import("@views/admin/Inventory.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/statistics",
    name: "adminStatistics",
    component: () => import("@views/admin/Statistics.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/analytics",
    name: "adminAnalytics",
    component: () => import("@views/admin/Analytics.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/categories",
    name: "adminCategories",
    component: () => import("@views/admin/Categories.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/payments",
    name: "adminPayments",
    component: () => import("@views/admin/Payments.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/settings",
    name: "adminSettings",
    component: () => import("@views/admin/Settings.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating to a different route
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  },
});

// Kiểm tra xác thực trước khi vào các route yêu cầu đăng nhập
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  console.log('Router guard - navigating to:', to.path)
  console.log('Router guard - isAuthenticated:', authStore.isAuthenticated)
  console.log('Router guard - user role:', authStore.user?.role)
  console.log('Router guard - requiresAuth:', to.meta.requiresAuth)
  console.log('Router guard - requiresAdmin:', to.meta.requiresAdmin)

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login - no auth')
    // Lưu route muốn truy cập để redirect sau khi đăng nhập
    localStorage.setItem("intendedRoute", to.fullPath);
    next("/login");
  } else if (
    to.meta.requiresAdmin &&
    (!authStore.isAuthenticated || authStore.user?.role !== "admin")
  ) {
    console.log('Redirecting to home - no admin rights')
    // Kiểm tra quyền admin
    next("/"); // Redirect về trang chủ nếu không phải admin
  } else {
    console.log('Navigation allowed')
    next();
  }
});

export default router;
