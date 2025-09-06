import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/Home.vue";
import Login from "../views/Login.vue";
import Signup from "../views/Signup.vue";
import Product from "../views/Product.vue";
import Cart from "../views/Cart.vue";
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/login", name: "login", component: Login },
  { path: "/signup", name: "signup", component: Signup },
  { path: "/products", name: "product", component: Product },
  { 
    path: "/product/:id", 
    name: "productDetail", 
    component: () => import("../views/ProductDetail.vue") 
  },
  {
    path: "/cart",
    name: "cart",
    component: Cart,
  },
  {
    path: "/notifications",
    name: "notifications",
    component: () => import("../views/Notifications.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/account",
    name: "account",
    component: () => import("../views/Account.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/forgot-password",
    name: "forgotPassword",
    component: () => import("../views/ForgotPassword.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Kiểm tra xác thực trước khi vào các route yêu cầu đăng nhập
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Lưu route muốn truy cập để redirect sau khi đăng nhập
    localStorage.setItem("intendedRoute", to.fullPath);
    next("/login");
  } else {
    next();
  }
});

export default router;
