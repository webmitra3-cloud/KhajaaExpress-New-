import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import CategoryChips from "../components/home/CategoryChips";
import FeaturedRestaurants from "../components/home/FeaturedRestaurants";
import HeroSection from "../components/home/HeroSection";
import PopularDishes from "../components/home/PopularDishes";
import PromoBanner from "../components/home/PromoBanner";
import { homepageSlides } from "../data/homepage";
import { useCart } from "../hooks/useCart";
import {
  buildCategoryCards,
  buildDishCards,
  buildFallbackBestMenus,
  buildLandingMetrics,
  buildRestaurantCards,
  getHomepageSlides,
} from "../utils/homepage";

const LandingPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchValue, setSearchValue] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState({
    slides: homepageSlides,
    stats: null,
    featuredRestaurants: [],
    foods: [],
    latestFoods: [],
    popularFoods: [],
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);

      try {
        const [homeResult, vendorResult, foodResult] = await Promise.allSettled([
          api.get("/home"),
          api.get("/vendors"),
          api.get("/foods"),
        ]);

        const home = homeResult.status === "fulfilled" ? homeResult.value.data : null;
        const vendors = vendorResult.status === "fulfilled" ? vendorResult.value.data : [];
        const foodsResponse = foodResult.status === "fulfilled" ? foodResult.value.data : [];
        const foods = [...foodsResponse].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const featuredRestaurants = home?.featuredRestaurants?.length ? home.featuredRestaurants : vendors.slice(0, 6);
        const latestFoods = home?.latestFoods?.length ? home.latestFoods : foods.slice(0, 6);
        const popularFoods = home?.bestMenus?.length ? home.bestMenus : buildFallbackBestMenus(foods);

        setPayload({
          slides: getHomepageSlides(home?.slides || []),
          stats: home?.stats || null,
          featuredRestaurants,
          foods,
          latestFoods,
          popularFoods,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const slides = useMemo(() => getHomepageSlides(payload.slides), [payload.slides]);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length) {
      return;
    }

    setActiveSlide((current) => (current >= slides.length ? 0 : current));
  }, [slides.length]);

  const restaurantCards = useMemo(
    () => buildRestaurantCards(payload.featuredRestaurants, payload.foods),
    [payload.featuredRestaurants, payload.foods]
  );

  const restaurantLookup = useMemo(
    () => new Map(restaurantCards.map((restaurant) => [restaurant._id, restaurant])),
    [restaurantCards]
  );

  const latestDishCards = useMemo(
    () => buildDishCards(payload.latestFoods, restaurantLookup),
    [payload.latestFoods, restaurantLookup]
  );

  const popularDishCards = useMemo(
    () => buildDishCards(payload.popularFoods, restaurantLookup),
    [payload.popularFoods, restaurantLookup]
  );

  const categoryCards = useMemo(() => buildCategoryCards(payload.foods).slice(0, 6), [payload.foods]);

  const metrics = useMemo(
    () =>
      buildLandingMetrics({
        stats: payload.stats,
        restaurants: restaurantCards,
        foods: payload.foods,
        popularFoods: popularDishCards,
      }),
    [payload.foods, payload.stats, popularDishCards, restaurantCards]
  );

  const currentSlide = slides[activeSlide] || homepageSlides[0];
  const heroRestaurant = restaurantCards[0];
  const heroDish = popularDishCards[0] || latestDishCards[0];

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    navigate(query ? `/restaurants?search=${encodeURIComponent(query)}` : "/restaurants");
  };

  const handleAddToCart = (food) => {
    addToCart(food, food.vendorData || food.vendor || { _id: food.vendor?._id, restaurantName: food.vendorName });
  };

  return (
    <div className="bg-[#fffdf7] text-charcoal-900">
      <HeroSection
        slide={currentSlide}
        metrics={metrics}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        activeSlide={activeSlide}
        slides={slides}
        onSelectSlide={setActiveSlide}
        featuredRestaurant={heroRestaurant}
        latestDish={heroDish}
      />
      <CategoryChips categories={categoryCards} loading={loading} />
      <PromoBanner />
      <FeaturedRestaurants restaurants={restaurantCards.slice(0, 3)} loading={loading} />
      <PopularDishes latestFoods={latestDishCards} popularDishes={popularDishCards} loading={loading} onAdd={handleAddToCart} />
    </div>
  );
};

export default LandingPage;
