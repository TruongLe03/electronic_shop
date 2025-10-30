import { createApp } from "vue";
import { createPinia } from 'pinia';
import "./style.css";
import "./assets/css/auth-forms.css";
import App from "./App.vue";
import router from "@/routes/index.js";
import axiosInstance from "@utils/axiosConfig.js";
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import { LoadingPlugin } from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import { useAuthStore } from '@stores/auth.js';

const pinia = createPinia();
const app = createApp(App);

app.config.globalProperties.$axios = axiosInstance;

app.use(pinia);
app.use(router);
app.use(ToastPlugin);
app.use(LoadingPlugin);

// Initialize auth store and check token validity
const authStore = useAuthStore();
authStore.checkTokenValidity();

app.mount("#app");
