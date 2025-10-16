import { ref, computed } from "vue";
import { getCategories } from "@/api/categoryService";

export function useCategories() {
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Computed property để có categories với "Tất cả sản phẩm" option
  const categoriesWithAll = computed(() => [
    { id: "all", _id: "all", name: "Tất cả sản phẩm" },
    ...categories.value,
  ]);

  const loadCategories = async () => {
    try {
      loading.value = true;
      error.value = null;

      // Pass limit to get all categories (not just 10)
      const result = await getCategories({ limit: 100 });
      console.log("Raw categories result:", result);

      // Handle new API format with categories property
      let categoriesData = [];
      if (result.categories) {
        // New format with pagination
        categoriesData = result.categories;
      } else if (Array.isArray(result)) {
        // Legacy format - direct array
        categoriesData = result;
      } else if (result.data) {
        // Alternative format
        categoriesData = result.data;
      }

      // Ensure we have valid category data
      categoriesData = categoriesData.map((cat) => ({
        ...cat,
        id: cat._id || cat.id,
        name: cat.name,
        description: cat.description,
        image: cat.image,
        slug: cat.slug,
      }));

      console.log("Processed categories:", categoriesData);
      categories.value = categoriesData;
    } catch (err) {
      console.error("Error loading categories:", err);
      error.value = err.message || "Không thể tải danh mục";
      categories.value = [];
    } finally {
      loading.value = false;
    }
  };

  const getCategoryById = (categoryId) => {
    if (categoryId === "all") {
      return { id: "all", name: "Tất cả sản phẩm" };
    }
    return categories.value.find(
      (cat) => cat._id === categoryId || cat.id === categoryId
    );
  };

  const getCategoryName = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category?.name || "Không xác định";
  };

  return {
    categories,
    categoriesWithAll,
    loading,
    error,
    loadCategories,
    getCategoryById,
    getCategoryName,
  };
}
