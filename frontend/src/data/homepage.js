import {
  ChefHat,
  Coffee,
  CupSoda,
  Globe,
  MapPin,
  MessageCircle,
  Pizza,
  Sandwich,
  Send,
  ShieldCheck,
  Soup,
  Store,
  Truck,
  WalletCards,
} from "lucide-react";

export const homepageSlides = [
  {
    badge: "KhajaExpress",
    title: "Order local food you'll actually crave",
    subtitle: "Browse approved restaurants, discover standout dishes, and place your next order in minutes.",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80",
    ctaText: "Browse Restaurants",
    ctaLink: "/restaurants",
  },
  {
    badge: "Fresh Today",
    title: "Warm meals from the best local kitchens",
    subtitle: "From momo to burgers, KhajaExpress makes daily food ordering feel fast, clear, and reliable.",
    imageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1400&q=80",
    ctaText: "Explore Popular Dishes",
    ctaLink: "/restaurants",
  },
  {
    badge: "Best Picks",
    title: "Trusted restaurants, cleaner ordering, faster checkout",
    subtitle: "A polished multi-vendor marketplace designed for smooth browsing on desktop and mobile.",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80",
    ctaText: "Start Ordering",
    ctaLink: "/restaurants",
  },
];

export const homepageCategories = [
  {
    label: "Momo",
    searchTerm: "momo",
    keywords: ["momo", "dumpling"],
    icon: Soup,
  },
  {
    label: "Thakali",
    searchTerm: "thakali",
    keywords: ["thakali", "set", "dal bhat"],
    icon: ChefHat,
  },
  {
    label: "Newari",
    searchTerm: "newari",
    keywords: ["newari", "choila", "bara"],
    icon: Store,
  },
  {
    label: "Pizza",
    searchTerm: "pizza",
    keywords: ["pizza"],
    icon: Pizza,
  },
  {
    label: "Burger",
    searchTerm: "burger",
    keywords: ["burger", "sandwich", "wrap"],
    icon: Sandwich,
  },
  {
    label: "Drinks",
    searchTerm: "drink",
    keywords: ["drink", "juice", "coffee", "tea", "shake"],
    icon: CupSoda,
  },
  {
    label: "Coffee",
    searchTerm: "coffee",
    keywords: ["coffee"],
    icon: Coffee,
  },
  {
    label: "Quick Bites",
    searchTerm: "snack",
    keywords: ["snack", "fries", "roll", "chowmein"],
    icon: Sandwich,
  },
];

export const trustItems = [
  {
    title: "Fast delivery flow",
    description: "Simple order status updates keep customers aware from checkout to delivery.",
    icon: Truck,
  },
  {
    title: "Approved restaurants only",
    description: "Every vendor visible on the platform passes through admin approval first.",
    icon: ShieldCheck,
  },
  {
    title: "Easy payment choices",
    description: "Cash on delivery and mock online payment keep the checkout clear and simple.",
    icon: WalletCards,
  },
  {
    title: "Live tracking ready",
    description: "Orders move through clear stages so users know exactly what is happening.",
    icon: MapPin,
  },
];

export const testimonials = [
  {
    name: "Nisha Shrestha",
    role: "Student, Kathmandu",
    quote: "The homepage feels trustworthy and the restaurant browsing flow is much clearer now.",
  },
  {
    name: "Suman Karki",
    role: "Office team lunch organizer",
    quote: "I can compare restaurants, see the popular dishes, and place a group order quickly.",
  },
  {
    name: "Asmita Rai",
    role: "Regular customer",
    quote: "The layout is clean, the cards look complete, and the ordering journey feels much more real.",
  },
];

export const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Restaurants", to: "/restaurants" },
      { label: "Categories", to: "/categories" },
      { label: "Offers", to: "/offers" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", to: "/login" },
      { label: "Sign Up", to: "/register" },
      { label: "Cart", to: "/cart" },
      { label: "My Orders", to: "/user/orders" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "support@khajaexpress.local", href: "mailto:support@khajaexpress.local" },
      { label: "+977 9800000000", href: "tel:+9779800000000" },
      { label: "Kathmandu, Nepal", href: "#" },
    ],
  },
];

export const socialLinks = [
  { label: "Website", href: "#", icon: Globe },
  { label: "Messenger", href: "#", icon: MessageCircle },
  { label: "Updates", href: "#", icon: Send },
];
