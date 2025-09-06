import axiosInstance from "../utils/axiosConfig";

export const getCategories = async () => {
  try {
    const response = await axiosInstance.get("/categories");
    
    // Transform data to match expected format
    const categories = response.data.map(category => ({
      id: category._id.$oid || category._id, // Handle both MongoDB ObjectId format
      name: category.name,
      description: category.description,
      image: category.image,
      parent_id: category.parent_id
    }));

    console.log('Transformed categories:', categories); // Debug log
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
