import { homepageCategories, homepageSlides } from "../data/homepage";

const getId = (value) => {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value._id || "";
};

const getLowerText = (value = "") => String(value).toLowerCase();

const uniqueStrings = (values = []) => Array.from(new Set(values.filter(Boolean)));

export const buildFallbackBestMenus = (foods = []) =>
  foods
    .filter((food) => food?.isAvailable !== false)
    .slice(0, 8)
    .map((food, index) => ({
      ...food,
      totalOrdered: Number(food.totalOrdered || Math.max(8 - index, 1)),
    }));

export const resolveCount = (primary, fallback) => {
  if (typeof primary === "number" && primary > 0) {
    return primary;
  }

  return fallback;
};

export const buildRestaurantCards = (vendors = [], foods = []) => {
  const foodsByVendor = new Map();

  foods.forEach((food) => {
    const vendorId = getId(food.vendor);
    if (!vendorId) {
      return;
    }

    const list = foodsByVendor.get(vendorId) || [];
    list.push(food);
    foodsByVendor.set(vendorId, list);
  });

  return vendors.map((vendor, index) => {
    const vendorFoods = foodsByVendor.get(vendor._id) || [];
    const categoryLabels = uniqueStrings(vendorFoods.map((food) => food.category?.name)).slice(0, 2);

    return {
      ...vendor,
      cuisineLabel: categoryLabels.length ? categoryLabels.join(" • ") : "Local favorites",
      rating: (4.9 - (index % 4) * 0.1).toFixed(1),
      deliveryTime: `${22 + index * 4}-${32 + index * 4} min`,
      itemCount: Number(vendor.foodCount || vendorFoods.length || 0),
      featuredLabel: ["Most loved", "Fast delivery", "New favorite"][index] || null,
      locationLabel: vendor.address || "Kathmandu",
      logoImage: vendor.logoUrl || vendor.user?.avatarUrl || vendor.coverImageUrl,
      coverImage: vendor.coverImageUrl || vendor.logoUrl || "https://via.placeholder.com/1200x800?text=Restaurant",
    };
  });
};

export const buildDishCards = (foods = [], restaurantLookup = new Map()) =>
  foods
    .filter(Boolean)
    .map((food, index) => {
      const vendorId = getId(food.vendor);
      const vendor = restaurantLookup.get(vendorId);

      return {
        ...food,
        badge: ["Top pick", "Trending", "Ready fast"][index] || null,
        vendorData: vendor || food.vendor,
        vendorName: vendor?.restaurantName || food.vendor?.restaurantName || "Partner restaurant",
        vendorSummary: vendor?.cuisineLabel || food.category?.name || "Freshly made",
        shortDescription: food.description || "Prepared fresh and packed to order.",
        dishImage: food.imageUrl || vendor?.coverImage || "https://via.placeholder.com/900x700?text=Food",
      };
    });

export const buildCategoryCards = (foods = []) => {
  const dishes = foods.map((food) => `${food.name || ""} ${food.category?.name || ""}`.toLowerCase());

  return homepageCategories
    .map((category) => {
      const count = dishes.filter((dish) => category.keywords.some((keyword) => dish.includes(keyword))).length;

      return {
        ...category,
        count,
      };
    })
    .sort((a, b) => Number(Boolean(b.count)) - Number(Boolean(a.count)) || b.count - a.count);
};

export const buildLandingMetrics = ({ stats, restaurants, foods, popularFoods }) => [
  {
    label: "Partner restaurants",
    value: `${resolveCount(stats?.restaurantCount, restaurants.length)}+`,
    description: "Approved local kitchens across the marketplace",
  },
  {
    label: "Dishes ready to browse",
    value: `${resolveCount(stats?.latestFoodCount, foods.length)}+`,
    description: "Menus that are easy to compare and order from",
  },
  {
    label: "Orders customers love",
    value: `${Math.max(popularFoods.length * 14, 96)}+`,
    description: "Popular picks highlighted to speed up decisions",
  },
];

export const getHomepageSlides = (slides = []) => (slides.length ? slides : homepageSlides);