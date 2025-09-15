// Utility functions for processing product data

/**
 * Extract technical specifications from product description
 * @param {string} description - Product description text
 * @param {object} existingSpecs - Existing specifications object
 * @returns {object} - Extracted specifications
 */
export const extractSpecifications = (description, existingSpecs = {}) => {
  if (existingSpecs && Object.keys(existingSpecs).length > 0) {
    return existingSpecs;
  }

  if (!description) return {};

  const specifications = {};
  
  // Very detailed patterns for better extraction
  const detailedPatterns = [
    // CPU/Processor patterns - more specific
    {
      pattern: /(?:CPU|Processor|Bộ xử lý|Vi xử lý)[:\s-]*([^\n\r,;.!?]{3,})/gi,
      category: 'Bộ xử lý'
    },
    {
      pattern: /(?:Intel|AMD|Snapdragon|MediaTek|Apple|Qualcomm|Ryzen|Core)\s+[^\n\r,;.!?]{3,}/gi,
      category: 'Bộ xử lý'
    },
    
    // Memory patterns - separate RAM and Storage
    {
      pattern: /(?:RAM|Memory|Bộ nhớ RAM)[:\s-]*([0-9]+\s*(?:GB|MB)[^\n\r,;.!?]*)/gi,
      category: 'RAM'
    },
    {
      pattern: /(?:ROM|Storage|Lưu trữ|SSD|HDD|eMMC)[:\s-]*([0-9]+\s*(?:GB|TB|MB)[^\n\r,;.!?]*)/gi,
      category: 'Bộ nhớ trong'
    },
    
    // Display patterns - more detailed
    {
      pattern: /(?:Màn hình|Display|Screen|LCD|LED|OLED|AMOLED)[:\s-]*([^\n\r,;.!?]{5,})/gi,
      category: 'Màn hình'
    },
    {
      pattern: /([0-9]+\.?[0-9]*)\s*(?:inch|"|'')/gi,
      category: 'Kích thước màn hình'
    },
    {
      pattern: /([0-9]+\s*x\s*[0-9]+)\s*(?:pixels?|px)?/gi,
      category: 'Độ phân giải'
    },
    {
      pattern: /(?:HD|FHD|Full HD|4K|2K|QHD|UHD|1080p|720p|4320p)/gi,
      category: 'Chất lượng màn hình'
    },
    
    // Battery patterns
    {
      pattern: /(?:Pin|Battery|Dung lượng pin)[:\s-]*([0-9]+\s*(?:mAh|Wh)[^\n\r,;.!?]*)/gi,
      category: 'Pin'
    },
    
    // Camera patterns - detailed
    {
      pattern: /(?:Camera|Máy ảnh)[:\s-]*([0-9]+\s*MP[^\n\r,;.!?]*)/gi,
      category: 'Camera'
    },
    {
      pattern: /(?:Camera trước|Front Camera)[:\s-]*([0-9]+\s*MP[^\n\r,;.!?]*)/gi,
      category: 'Camera trước'
    },
    {
      pattern: /(?:Camera sau|Rear Camera|Main Camera)[:\s-]*([0-9]+\s*MP[^\n\r,;.!?]*)/gi,
      category: 'Camera sau'
    },
    
    // OS patterns
    {
      pattern: /(?:OS|Hệ điều hành|Operating System)[:\s-]*([^\n\r,;.!?]{3,})/gi,
      category: 'Hệ điều hành'
    },
    {
      pattern: /(?:Android|iOS|Windows|macOS|Linux|MIUI|ColorOS|HarmonyOS)\s+[^\n\r,;.!?]{0,}/gi,
      category: 'Hệ điều hành'
    },
    
    // Graphics patterns
    {
      pattern: /(?:GPU|Graphics|Card đồ họa|VGA)[:\s-]*([^\n\r,;.!?]{3,})/gi,
      category: 'Card đồ họa'
    },
    {
      pattern: /(?:NVIDIA|AMD|Intel|Mali|Adreno|PowerVR)\s+[^\n\r,;.!?]{3,}/gi,
      category: 'Card đồ họa'
    },
    
    // Physical specs
    {
      pattern: /(?:Trọng lượng|Weight)[:\s-]*([0-9]+\.?[0-9]*\s*(?:g|kg)[^\n\r,;.!?]*)/gi,
      category: 'Trọng lượng'
    },
    {
      pattern: /(?:Kích thước|Dimensions|Size)[:\s-]*([^\n\r,;.!?]{5,})/gi,
      category: 'Kích thước'
    },
    
    // Connectivity - detailed
    {
      pattern: /(?:WiFi|Wi-Fi)[:\s-]*([^\n\r,;.!?]{3,})/gi,
      category: 'WiFi'
    },
    {
      pattern: /(?:Bluetooth)[:\s-]*([^\n\r,;.!?]{3,})/gi,
      category: 'Bluetooth'
    },
    {
      pattern: /(?:4G|5G|LTE|3G)[^\n\r,;.!?]{0,}/gi,
      category: 'Mạng di động'
    },
    {
      pattern: /(?:USB|Type-C|Micro USB|Lightning)[^\n\r,;.!?]{0,}/gi,
      category: 'Cổng kết nối'
    },
    
    // Brand and model
    {
      pattern: /(?:Thương hiệu|Brand)[:\s-]*([^\n\r,;.!?]{2,})/gi,
      category: 'Thương hiệu'
    },
    {
      pattern: /(?:Model|Mẫu)[:\s-]*([^\n\r,;.!?]{2,})/gi,
      category: 'Model'
    },
    
    // Color
    {
      pattern: /(?:Màu sắc|Color)[:\s-]*([^\n\r,;.!?]{2,})/gi,
      category: 'Màu sắc'
    },
    
    // Additional specs
    {
      pattern: /(?:Chipset)[:\s-]*([^\n\r,;.!?]{3,})/gi,
      category: 'Chipset'
    },
    {
      pattern: /(?:Tần số|Frequency)[:\s-]*([^\n\r,;.!?]{3,})/gi,
      category: 'Tần số'
    },
    
    // General key-value pairs
    {
      pattern: /([A-Za-zÀ-ỹ\s]{3,20}):\s*([^\n\r,;.!?]{3,})/gi,
      category: null // Will be determined dynamically
    }
  ];

  // Process each detailed pattern
  detailedPatterns.forEach(patternObj => {
    const matches = description.match(patternObj.pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.trim();
        let category = patternObj.category;
        let value = cleaned;
        
        // For general patterns, extract key and value
        if (!category) {
          const colonIndex = cleaned.indexOf(':');
          if (colonIndex > 0) {
            category = cleaned.substring(0, colonIndex).trim();
            value = cleaned.substring(colonIndex + 1).trim();
          }
        } else {
          // Remove category prefix from value
          value = cleaned.replace(new RegExp(`^(${patternObj.category}|${category})[:\s-]*`, 'i'), '');
        }
        
        // Clean and validate
        value = value
          .replace(/[\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (category && value && value.length >= 2 && !/^\d+$/.test(value)) {
          // Avoid duplicates
          if (!specifications[category] || specifications[category].length < value.length) {
            specifications[category] = value;
          }
        }
      });
    }
  });

  return specifications;
};

/**
 * Clean description by removing extracted specifications
 * @param {string} description - Original description
 * @param {object} specifications - Extracted specifications
 * @returns {string} - Cleaned description
 */
export const cleanDescription = (description, specifications) => {
  if (!description) return '';
  
  let cleaned = description;
  
  // Remove specifications that we've extracted
  Object.values(specifications).forEach(spec => {
    if (spec && spec.length > 5) {
      // Create regex to remove this specification
      const regex = new RegExp(spec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      cleaned = cleaned.replace(regex, '');
    }
  });
  
  // Remove common specification prefixes
  const prefixesToRemove = [
    /^(Thông số kỹ thuật|Technical Specifications|Specifications)[:\s]*/gi,
    /^(Chi tiết sản phẩm|Product Details)[:\s]*/gi,
    /(CPU|RAM|ROM|Màn hình|Pin|Camera|OS)[:\s]*[^\n\r,;.]+[,;.\n\r]/gi
  ];
  
  prefixesToRemove.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up extra whitespace and punctuation
  cleaned = cleaned
    .replace(/\s*[,;]\s*/g, '. ')
    .replace(/\.+/g, '. ')
    .replace(/\s+/g, ' ')
    .replace(/^\.\s*/, '')
    .trim();
  
  return cleaned;
};

/**
 * Categorize specifications into logical groups
 * @param {object} specifications - Raw specifications object
 * @returns {object} - Categorized specifications
 */
export const categorizeSpecifications = (specifications) => {
  const categorized = {
    'Hiệu năng': {},
    'Màn hình': {},
    'Camera': {},
    'Pin & Sạc': {},
    'Kết nối': {},
    'Thiết kế': {},
    'Khác': {}
  };

  Object.entries(specifications).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    
    // Performance category
    if (lowerKey.includes('bộ xử lý') || lowerKey.includes('cpu') || 
        lowerKey.includes('processor') || lowerKey.includes('chipset') ||
        lowerKey.includes('tần số') || lowerKey.includes('frequency')) {
      categorized['Hiệu năng'][key] = value;
    }
    // Memory category  
    else if (lowerKey.includes('ram') || lowerKey.includes('memory') ||
             lowerKey.includes('bộ nhớ trong') || lowerKey.includes('storage') ||
             lowerKey.includes('rom') || lowerKey.includes('card đồ họa') ||
             lowerKey.includes('gpu') || lowerKey.includes('graphics')) {
      categorized['Hiệu năng'][key] = value;
    }
    // Display category
    else if (lowerKey.includes('màn hình') || lowerKey.includes('display') ||
             lowerKey.includes('screen') || lowerKey.includes('kích thước màn hình') ||
             lowerKey.includes('độ phân giải') || lowerKey.includes('chất lượng màn hình')) {
      categorized['Màn hình'][key] = value;
    }
    // Camera category
    else if (lowerKey.includes('camera') || lowerKey.includes('máy ảnh') ||
             lowerKey.includes('camera trước') || lowerKey.includes('camera sau')) {
      categorized['Camera'][key] = value;
    }
    // Battery category
    else if (lowerKey.includes('pin') || lowerKey.includes('battery') ||
             lowerKey.includes('sạc') || lowerKey.includes('charging')) {
      categorized['Pin & Sạc'][key] = value;
    }
    // Connectivity category
    else if (lowerKey.includes('wifi') || lowerKey.includes('bluetooth') ||
             lowerKey.includes('4g') || lowerKey.includes('5g') ||
             lowerKey.includes('lte') || lowerKey.includes('mạng di động') ||
             lowerKey.includes('cổng kết nối') || lowerKey.includes('usb') ||
             lowerKey.includes('kết nối')) {
      categorized['Kết nối'][key] = value;
    }
    // Design category
    else if (lowerKey.includes('trọng lượng') || lowerKey.includes('weight') ||
             lowerKey.includes('kích thước') || lowerKey.includes('dimensions') ||
             lowerKey.includes('màu sắc') || lowerKey.includes('color') ||
             lowerKey.includes('chất liệu') || lowerKey.includes('material')) {
      categorized['Thiết kế'][key] = value;
    }
    // Other category
    else {
      categorized['Khác'][key] = value;
    }
  });

  // Remove empty categories
  Object.keys(categorized).forEach(category => {
    if (Object.keys(categorized[category]).length === 0) {
      delete categorized[category];
    }
  });

  return categorized;
};

/**
 * Format specifications for display
 * @param {object} specifications - Specifications object
 * @returns {array} - Array of formatted spec items
 */
export const formatSpecifications = (specifications) => {
  if (!specifications || typeof specifications !== 'object') {
    return [];
  }
  
  const order = [
    'Bộ xử lý',
    'RAM', 
    'Bộ nhớ trong',
    'Card đồ họa',
    'Màn hình',
    'Camera',
    'Pin',
    'Hệ điều hành',
    'Kết nối',
    'Trọng lượng',
    'Kích thước'
  ];
  
  const formatted = [];
  
  // Add ordered specs first
  order.forEach(key => {
    if (specifications[key]) {
      formatted.push({
        label: key,
        value: specifications[key]
      });
    }
  });
  
  // Add remaining specs
  Object.keys(specifications).forEach(key => {
    if (!order.includes(key)) {
      formatted.push({
        label: key,
        value: specifications[key]
      });
    }
  });
  
  return formatted;
};
