// Utility functions for extracting and parsing product specifications

export const extractSpecifications = (description) => {
  if (!description) return {};

  const specs = {};
  
  // Find specifications section - tìm phần "Thông Số Kĩ Thuật:"
  const specsMatch = description.match(/Thông Số Kĩ Thuật:?\s*([^]*?)(?=\n\n|\n[A-Z]|$)/i);
  if (!specsMatch) {
    // Nếu không tìm thấy section, thử tìm toàn bộ text
    return parseSpecsFromText(description);
  }
  
  const specsText = specsMatch[1];
  return parseSpecsFromText(specsText);
};

const parseSpecsFromText = (text) => {
  const specs = {};
  
  // Pattern để tìm các cặp key: value
  // Tìm text có dạng "Key: Value" hoặc "Key : Value"
  const lines = text.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    
    // Bỏ qua dòng trống hoặc dòng chỉ có ký tự đặc biệt
    if (!line || line.match(/^[-•\s]*$/)) return;
    
    // Tìm dấu ':' để tách key và value
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    let key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Clean up key - loại bỏ bullet points, số thứ tự
    key = key.replace(/^[-•\d+\.\s]+/, '').trim();
    
    // Bỏ qua nếu key hoặc value rỗng
    if (!key || !value) return;
    
    // Bỏ qua nếu value quá ngắn (có thể là lỗi parsing)
    if (value.length < 2) return;
    
    specs[key] = value;
  });
  
  return specs;
};

export const categorizeSpecifications = (specs) => {
  const categories = {
    'Thông số chung': {},
    'Thông số kỹ thuật': {},
    'Kích thước & Trọng lượng': {},
    'Kết nối': {},
    'Nguồn điện': {},
    'Môi trường hoạt động': {}
  };

  Object.entries(specs).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('kích thước') || lowerKey.includes('size') || 
        lowerKey.includes('trọng lượng') || lowerKey.includes('weight') ||
        lowerKey.includes('khối lượng')) {
      categories['Kích thước & Trọng lượng'][key] = value;
    }
    else if (lowerKey.includes('điện áp') || lowerKey.includes('voltage') ||
             lowerKey.includes('dòng') || lowerKey.includes('current') ||
             lowerKey.includes('pin') || lowerKey.includes('battery')) {
      categories['Nguồn điện'][key] = value;
    }
    else if (lowerKey.includes('wifi') || lowerKey.includes('bluetooth') ||
             lowerKey.includes('usb') || lowerKey.includes('kết nối') ||
             lowerKey.includes('connection') || lowerKey.includes('tần số') ||
             lowerKey.includes('frequency')) {
      categories['Kết nối'][key] = value;
    }
    else if (lowerKey.includes('nhiệt độ') || lowerKey.includes('temperature') ||
             lowerKey.includes('độ ẩm') || lowerKey.includes('humidity')) {
      categories['Môi trường hoạt động'][key] = value;
    }
    else if (lowerKey.includes('thương hiệu') || lowerKey.includes('brand') ||
             lowerKey.includes('model') || lowerKey.includes('xuất xứ') ||
             lowerKey.includes('origin') || lowerKey.includes('bảo hành') ||
             lowerKey.includes('warranty')) {
      categories['Thông số chung'][key] = value;
    }
    else {
      categories['Thông số kỹ thuật'][key] = value;
    }
  });

  // Loại bỏ category rỗng
  Object.keys(categories).forEach(category => {
    if (Object.keys(categories[category]).length === 0) {
      delete categories[category];
    }
  });

  return categories;
};

export const formatSpecValue = (value) => {
  if (!value) return '';
  
  // Format các đơn vị phổ biến
  return value
    .replace(/(\d+)v\b/gi, '$1V')
    .replace(/(\d+)mhz\b/gi, '$1MHz')
    .replace(/(\d+)ghz\b/gi, '$1GHz')
    .replace(/(\d+)ma\b/gi, '$1mA')
    .replace(/(\d+)w\b/gi, '$1W')
    .replace(/(\d+)g\b/gi, '$1g')
    .replace(/(\d+)kg\b/gi, '$1kg')
    .replace(/(\d+)mm\b/gi, '$1mm')
    .replace(/(\d+)cm\b/gi, '$1cm')
    .replace(/(\d+)m\b/gi, '$1m');
};
