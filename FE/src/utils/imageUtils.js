export const DEFAULT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTIwQzE1OS4zODggMTIwIDE2NyAxMTIuMzg4IDE2NyAxMDNDMTY3IDkzLjYxMTYgMTU5LjM4OCA4NiAxNTAgODZDMTQwLjYxMiA4NiAxMzMgOTMuNjExNiAxMzMgMTAzQzEzMyAxMTIuMzg4IDE0MC42MTIgMTIwIDE1MCAxMjBaIiBmaWxsPSIjRDFENURCIi8+CjxwYXRoIGQ9Ik0xNTYgMTcySDEwNlYxNTJDMTA2IDE0MC45NTQgMTE0Ljk1NCAxMzIgMTI2IDEzMkgxODZDMTk3LjA0NiAxMzIgMjA2IDE0MC45NTQgMjA2IDE1MlYxOTJIMTU2VjE3MloiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+Cg==';

export const getFullImage = (imageUrl) => {
  // If no image provided, return default
  if (!imageUrl) {
    return DEFAULT_IMAGE;
  }
  
  // If it's an array, get the first image
  if (Array.isArray(imageUrl)) {
    if (imageUrl.length === 0) {
      return DEFAULT_IMAGE;
    }
    imageUrl = imageUrl[0];
  }
  
  // Convert to string if it's not already
  imageUrl = String(imageUrl);
  
  // If image URL starts with http/https, it's a full URL - return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it starts with data: (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's a relative path, prepend your API base URL
  return `${import.meta.env.VITE_API_URL || 'http://localhost:6789'}/images/${imageUrl}`;
};

export const handleImageError = (event) => {
  event.target.src = DEFAULT_IMAGE;
};