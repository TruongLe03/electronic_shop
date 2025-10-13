// Re-export tất cả từ admin/index.js
export * from "./admin/index.js";

// Import default để tạo adminService object
import adminServices from "./admin/index.js";

export const adminService = adminServices;
export default adminServices;
