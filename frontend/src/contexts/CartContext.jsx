import { createContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "food-platform-cart";

export const CartContext = createContext(null);

const readStoredCart = () => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return { vendorId: "", vendorName: "", items: [] };
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return { vendorId: "", vendorName: "", items: [] };
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const clearCart = () => {
    setCart({ vendorId: "", vendorName: "", items: [] });
  };

  const addToCart = (food, vendor) => {
    setCart((currentCart) => {
      if (currentCart.vendorId && currentCart.vendorId !== vendor._id) {
        const shouldReplace = window.confirm(
          "Your cart already contains items from another restaurant. Replace them with this restaurant's items?"
        );

        if (!shouldReplace) {
          return currentCart;
        }

        return {
          vendorId: vendor._id,
          vendorName: vendor.restaurantName,
          items: [
            {
              foodId: food._id,
              name: food.name,
              price: food.price,
              imageUrl: food.imageUrl,
              quantity: 1,
            },
          ],
        };
      }

      const existingItem = currentCart.items.find((item) => item.foodId === food._id);

      if (existingItem) {
        return {
          ...currentCart,
          vendorId: vendor._id,
          vendorName: vendor.restaurantName,
          items: currentCart.items.map((item) =>
            item.foodId === food._id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }

      return {
        vendorId: vendor._id,
        vendorName: vendor.restaurantName,
        items: [
          ...currentCart.items,
          {
            foodId: food._id,
            name: food.name,
            price: food.price,
            imageUrl: food.imageUrl,
            quantity: 1,
          },
        ],
      };
    });
  };

  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeItem(foodId);
      return;
    }

    setCart((currentCart) => ({
      ...currentCart,
      items: currentCart.items.map((item) =>
        item.foodId === foodId ? { ...item, quantity } : item
      ),
    }));
  };

  const removeItem = (foodId) => {
    setCart((currentCart) => {
      const nextItems = currentCart.items.filter((item) => item.foodId !== foodId);

      if (!nextItems.length) {
        return { vendorId: "", vendorName: "", items: [] };
      }

      return {
        ...currentCart,
        items: nextItems,
      };
    });
  };

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: cart.items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
