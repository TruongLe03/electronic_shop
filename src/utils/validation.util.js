import mongoose from "mongoose";

/**
 * Validation utility functions
 */
export class ValidationUtil {
  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number (Vietnamese format)
  static isValidPhoneNumber(phone) {
    const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;
    return phoneRegex.test(phone);
  }

  // Validate MongoDB ObjectId
  static isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  // Validate password strength
  static isValidPassword(password) {
    // At least 6 characters, contain at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
  }

  // Validate required fields
  static validateRequiredFields(data, requiredFields) {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  // Validate product data
  static validateProductData(productData) {
    const errors = [];
    
    if (!productData.name || productData.name.trim() === '') {
      errors.push('Tên sản phẩm là bắt buộc');
    }
    
    if (!productData.price || productData.price <= 0) {
      errors.push('Giá sản phẩm phải lớn hơn 0');
    }
    
    if (productData.discount_price && productData.discount_price >= productData.price) {
      errors.push('Giá khuyến mãi phải nhỏ hơn giá gốc');
    }
    
    if (!this.isValidObjectId(productData.category_id)) {
      errors.push('Category ID không hợp lệ');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate user registration data
  static validateUserRegistration(userData) {
    const errors = [];
    
    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Email không hợp lệ');
    }
    
    if (!userData.password || !this.isValidPassword(userData.password)) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số');
    }
    
    if (!userData.phone_number || !this.isValidPhoneNumber(userData.phone_number)) {
      errors.push('Số điện thoại không hợp lệ');
    }
    
    if (!userData.username || userData.username.trim().length < 2) {
      errors.push('Tên người dùng phải có ít nhất 2 ký tự');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate pagination parameters
  static validatePagination(page, limit) {
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    
    return {
      page: validatedPage,
      limit: validatedLimit,
      skip: (validatedPage - 1) * validatedLimit
    };
  }

  // Sanitize string (remove HTML tags, trim spaces)
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .trim(); // Remove leading/trailing spaces
  }

  // Validate sort parameters
  static validateSortParams(sortBy, allowedFields) {
    if (!allowedFields.includes(sortBy)) {
      return allowedFields[0]; // Return default sort field
    }
    return sortBy;
  }

  // Validate date format (YYYY-MM-DD or Date object)
  static isValidDate(date) {
    if (!date) return false;
    
    // If it's already a Date object
    if (date instanceof Date) {
      return !isNaN(date.getTime());
    }
    
    // If it's a string, try to parse it
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }
    
    return false;
  }

  // Validate price range
  static isValidPriceRange(minPrice, maxPrice) {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Number.MAX_VALUE;
    
    return min >= 0 && max >= 0 && min <= max;
  }

  // Check if number is positive
  static isPositiveNumber(num) {
    return typeof num === 'number' && num > 0 && !isNaN(num);
  }
}