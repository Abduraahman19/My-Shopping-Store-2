import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiPackage } from "react-icons/fi";
import { TbCategoryPlus } from "react-icons/tb";
import { AiOutlineProduct, AiOutlineDashboard } from "react-icons/ai";
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdNotifications } from "react-icons/md";
import { MenuOpen as MenuOpenIcon, Menu as MenuIcon } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, RefreshCw } from "lucide-react";

import Category from "../../components/Category";
import SubCategory from "../../components/SubCategory";
import EditCategory from "../../components/editCategory";
import EditSubCategory from "../../components/editSubcategory";
import Search from "../../components/Search";
import Orders from "../../components/Orders";
import Shortcut from "../../components/Shortcut";
import Product from "../../components/Product";
import Editproduct from "../../components/editProduct";

const API_BASE_URL = "http://localhost:5000/api";
const LOCAL_STORAGE_KEYS = {
  SIDEBAR_STATE: "sidebarState",
  DROPDOWNS_STATE: "sidebarDropdowns",
  TOKEN: "token",
  CATEGORIES: "categories"
};

// Updated color scheme with modern gradient approach
const COLORS = {
  primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  primaryLight: "#f8fafc",
  primaryDark: "#4c51bf",
  secondary: "#10b981",
  accent: "#f59e0b",
  background: "#f8fafc",
  card: "linear-gradient(to bottom right, #ffffff, #f3f4f6)",
  textPrimary: "#1e293b",
  textSecondary: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  sidebar: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)"
};

// Enhanced animations
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.5,
      ease: "easeInOut"
    } 
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const slideIn = {
  hidden: { x: -50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    } 
  },
  exit: { 
    x: 50, 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "backOut"
    }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const Sidebar = ({ 
  isCollapsed, 
  onSelectCategory, 
  onSelectSubCategory, 
  onSelectProduct, 
  onOrdersClick 
}) => {
  const [openDropdowns, setOpenDropdowns] = useState(() => {
    const storedState = localStorage.getItem(LOCAL_STORAGE_KEYS.DROPDOWNS_STATE);
    return storedState ? JSON.parse(storedState) : {};
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    subcategories: false,
    products: false
  });

  const fetchCategories = useCallback(async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      sessionStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(response.data));
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  }, []);

  const fetchSubcategories = useCallback(async () => {
    setLoading(prev => ({ ...prev, subcategories: true }));
    try {
      const subcategoriesData = {};
      
      await Promise.all(categories.map(async (category) => {
        const response = await axios.get(
          `${API_BASE_URL}/categories/${category._id}/subcategories`
        );
        subcategoriesData[category._id] = response.data;
      }));
      
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoading(prev => ({ ...prev, subcategories: false }));
    }
  }, [categories]);

  const fetchProducts = useCallback(async () => {
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchSubcategories();
    }
  }, [categories, fetchSubcategories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DROPDOWNS_STATE, JSON.stringify(openDropdowns));
  }, [openDropdowns]);

  const toggleDropdown = (categoryId) => {
    setOpenDropdowns((prev) => {
      const isCurrentlyOpen = prev[categoryId];
      const updatedDropdowns = { ...prev };

      if (isCurrentlyOpen && subcategories[categoryId]) {
        delete updatedDropdowns[categoryId];
        
        subcategories[categoryId].forEach((sub) => {
          delete updatedDropdowns[sub._id];
        });

        return updatedDropdowns;
      }

      if (subcategories[categoryId]) {
        Object.keys(subcategories).forEach((key) => {
          if (key !== categoryId) {
            delete updatedDropdowns[key];
          }
        });

        return { ...updatedDropdowns, [categoryId]: true };
      }

      Object.keys(subcategories).forEach((parentId) => {
        if (subcategories[parentId].some((sub) => sub._id === categoryId)) {
          updatedDropdowns[categoryId] = !isCurrentlyOpen;

          subcategories[parentId].forEach((sub) => {
            if (sub._id !== categoryId) {
              delete updatedDropdowns[sub._id];
            }
          });

          return updatedDropdowns;
        }
      });

      return { ...prev, [categoryId]: !isCurrentlyOpen };
    });
  };

  const toggleProductDropdown = () => {
    setDropdownOpen((prev) => ({ ...prev, product: !prev.product }));
  };

  const refreshData = () => {
    fetchCategories();
    fetchProducts();
  };

  return (
    <motion.div 
      className="relative"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div
        className={`mt-[83px] mb-5 ml-2.5 rounded-xl shadow-lg ${
          isCollapsed ? "w-16" : "w-64"
        } transition-all duration-300 flex flex-col h-[calc(100vh-93px)] p-4 fixed top-0 left-0 overflow-y-auto custom-scrollbar border-r border-gray-200`}
        style={{ background: COLORS.sidebar }}
        layout
      >
        {/* Dashboard Button */}
        <Tooltip title="Dashboard" arrow placement="right">
          <motion.button
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(255,255,255,0.1)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer gap-3 p-2 rounded-lg flex items-center"
            onClick={() => {
              onSelectCategory(null);
              onSelectSubCategory(null);
              onSelectProduct(null);
            }}
            aria-label="Dashboard"
          >
            <AiOutlineDashboard className="text-2xl text-white" />
            {!isCollapsed && (
              <motion.h1 
                className="text-lg text-white font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Dashboard
              </motion.h1>
            )}
          </motion.button>
        </Tooltip>

        {/* Refresh Button */}
        <Tooltip title="Refresh Data" arrow placement="right">
          <motion.button
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(255,255,255,0.1)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer gap-3 p-2 rounded-lg flex items-center mt-2"
            onClick={refreshData}
            aria-label="Refresh"
          >
            <RefreshCw className={`text-2xl text-white ${loading.categories || loading.products ? "animate-spin" : ""}`} />
            {!isCollapsed && (
              <motion.h1 
                className="text-lg font-bold text-white"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Refresh
              </motion.h1>
            )}
          </motion.button>
        </Tooltip>

        {/* Categories Section */}
        <Tooltip title="Categories" arrow placement="right">
          <motion.button
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(255,255,255,0.1)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-2 rounded-lg cursor-pointer w-full mt-4"
            onClick={() => toggleDropdown("main")}
            aria-expanded={openDropdowns["main"]}
            aria-label="Toggle categories"
          >
            <div className="flex text-white items-center space-x-3">
              <TbCategoryPlus className="text-2xl font-bold" />
              {!isCollapsed && (
                <motion.span 
                  className="font-bold text-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Categories
                </motion.span>
              )}
            </div>
            {!isCollapsed &&
              (openDropdowns["main"] ? (
                <MdKeyboardArrowUp className="text-xl text-white" />
              ) : (
                <MdKeyboardArrowDown className="text-xl text-white" />
              ))}
          </motion.button>
        </Tooltip>

        <AnimatePresence>
          {openDropdowns["main"] && !isCollapsed && (
            <motion.ul 
              className="ml-2 mt-2 space-y-2"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
            >
              {loading.categories ? (
                <motion.div 
                  className="flex justify-center py-4"
                  variants={fadeIn}
                >
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-white/20 h-6 w-6"></div>
                  </div>
                </motion.div>
              ) : (
                categories.map((category, index) => (
                  <motion.li 
                    key={category._id}
                    variants={slideIn}
                    layout
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="p-2 flex items-center hover:bg-white/10 text-white rounded-lg cursor-pointer transition-colors duration-200">
                      <motion.img
                        src={category.image}
                        alt={category.name}
                        className="w-9 h-9 rounded-full mr-2 object-cover cursor-pointer border-2 border-white/20"
                        onClick={() => onSelectCategory(category)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />

                      <button
                        className="flex items-center w-full cursor-pointer"
                        onClick={() => toggleDropdown(category._id)}
                        aria-expanded={openDropdowns[category._id]}
                      >
                        {!isCollapsed && (
                          <motion.span 
                            className="truncate text-left w-32"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            {category.name}
                          </motion.span>
                        )}
                        {!isCollapsed &&
                          (openDropdowns[category._id] ? (
                            <MdKeyboardArrowUp className="ml-auto" />
                          ) : (
                            <MdKeyboardArrowDown className="ml-auto" />
                          ))}
                      </button>
                    </div>

                    <AnimatePresence>
                      {openDropdowns[category._id] && subcategories[category._id] && !isCollapsed && (
                        <motion.ul 
                          className="ml-4 mt-2 space-y-1"
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={fadeIn}
                        >
                          {loading.subcategories ? (
                            <motion.div 
                              className="flex justify-center py-2"
                              variants={fadeIn}
                            >
                              <div className="animate-pulse flex space-x-4">
                                <div className="rounded-full bg-white/20 h-4 w-4"></div>
                              </div>
                            </motion.div>
                          ) : (
                            subcategories[category._id].map((subcategory, subIndex) => (
                              <motion.li
                                key={subcategory._id}
                                variants={slideIn}
                                custom={subIndex}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ delay: subIndex * 0.05 }}
                                whileHover={{ x: 5 }}
                                className="p-2 flex items-center hover:bg-white/10 rounded-lg cursor-pointer transition-colors duration-200"
                                onClick={() => onSelectSubCategory(subcategory)}
                              >
                                <motion.img
                                  src={subcategory.image}
                                  alt={subcategory.name}
                                  className="w-7 h-7 rounded-full mr-2 object-cover border-2 border-white/20"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                />
                                <motion.span 
                                  className="truncate text-left w-32"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  {subcategory.name}
                                </motion.span>
                              </motion.li>
                            ))
                          )}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.li>
                ))
              )}
            </motion.ul>
          )}
        </AnimatePresence>

        {/* Products Section */}
        <div className="mt-4">
          <Tooltip title="Products" arrow placement="right">
            <motion.button
              whileHover={{ 
                scale: 1.02, 
                backgroundColor: "rgba(255,255,255,0.1)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer gap-3 p-2 rounded-lg flex items-center w-full"
              onClick={toggleProductDropdown}
              aria-expanded={dropdownOpen["product"]}
              aria-label="Toggle products"
            >
              <AiOutlineProduct className="text-2xl text-white" />
              {!isCollapsed && (
                <motion.h1 
                  className="text-lg text-white font-bold"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Products
                </motion.h1>
              )}
              {!isCollapsed &&
                (dropdownOpen["product"] ? (
                  <MdKeyboardArrowUp className="ml-auto text-white text-xl" />
                ) : (
                  <MdKeyboardArrowDown className="ml-auto text-white text-xl" />
                ))}
            </motion.button>
          </Tooltip>

          <AnimatePresence>
            {dropdownOpen["product"] && !isCollapsed && (
              <motion.div 
                className="ml-2 mt-2 space-y-2"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeIn}
              >
                <Product />
                <div className="space-y-2">
                  {loading.products ? (
                    <motion.div 
                      className="flex justify-center py-4"
                      variants={fadeIn}
                    >
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-white/20 h-8 w-8"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/20 rounded w-3/4"></div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    products.map((product, index) => (
                      <motion.button
                        key={product._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ 
                          x: 5,
                          backgroundColor: "rgba(255,255,255,0.1)"
                        }}
                        className="p-2 flex items-center gap-2 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 w-full"
                        onClick={() => onSelectProduct(product)}
                      >
                        <motion.img
                          src={product.image}
                          alt={product.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        />
                        <motion.span 
                          className="text-sm truncate w-[120px] text-left text-white"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          {product.name}
                        </motion.span>
                        <motion.span 
                          className="ml-auto font-bold"
                          style={{ color: COLORS.secondary }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          Rs.{new Intl.NumberFormat("en-US").format(product.price)}
                        </motion.span>
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Orders Section */}
        <Tooltip title="Orders" arrow placement="right">
          <motion.button
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(255,255,255,0.1)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer gap-3 p-2 rounded-lg flex items-center w-full mt-4"
            onClick={onOrdersClick}
            aria-label="View orders"
          >
            <FiPackage className="text-2xl text-white" />
            {!isCollapsed && (
              <motion.h1 
                className="text-lg text-white font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Orders
              </motion.h1>
            )}
          </motion.button>
        </Tooltip>
      </motion.div>
    </motion.div>
  );
};

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const storedState = localStorage.getItem(LOCAL_STORAGE_KEYS.SIDEBAR_STATE);
    return storedState ? JSON.parse(storedState) : window.innerWidth < 768;
  });
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSubCategory2, setSelectedSubCategory2] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showOrders, setShowOrders] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "l") {
        event.preventDefault();
        handleLogout();
      }
      
      if (event.altKey && event.key === "o") {
        setIsCollapsed(false);
      }
      
      if (event.altKey && event.key === "c") {
        setIsCollapsed(true);
      }
      
      if (event.key === "Escape" && fullScreenImage) {
        handleCloseFullScreenImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullScreenImage]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIDEBAR_STATE, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const mockNotifications = [
      { id: 1, message: "New order received", time: "2 mins ago", read: false },
      { id: 2, message: "Inventory low for Product X", time: "1 hour ago", read: false },
      { id: 3, message: "System update available", time: "3 hours ago", read: true }
    ];
    setNotifications(mockNotifications);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    navigate("/signin");
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setSelectedSubCategory2(null);
    setSelectedProduct(null);
    setShowOrders(false);
  };

  const handleSelectSubCategory = (subcategory) => {
    setSelectedSubCategory(subcategory);
    setSelectedCategory(null);
    setSelectedSubCategory2(null);
    setSelectedProduct(null);
    setShowOrders(false);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedSubCategory2(null);
    setShowOrders(false);
  };

  const handleSearchCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setSelectedSubCategory2(category.subcategories || []);
    setSelectedProduct(null);
    setShowOrders(false);
  };

  const handleSearchSubCategorySelect = (subcategory) => {
    setSelectedSubCategory(subcategory);
    setSelectedCategory(null);
    setSelectedSubCategory2(null);
    setSelectedProduct(null);
    setShowOrders(false);
  };

  const handleOrdersClick = () => {
    setShowOrders(!showOrders);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedSubCategory2(null);
    setSelectedProduct(null);
  };

  const handleResetDashboard = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedSubCategory2(null);
    setSelectedProduct(null);
    setShowOrders(false);
  };

  const findCategoryById = (categories, targetId) => {
    for (const category of categories) {
      for (const subcategory of category.subcategories || []) {
        if (subcategory._id === targetId) {
          return {
            category: category._id,
            subcategory: subcategory._id
          };
        }
      }
    }
    return null;
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${API_BASE_URL}/categories/${categoryId}`);
        handleResetDashboard();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. Please try again.");
      }
    }
  };

  const handleDeleteSubCategory = async (subCategoryId) => {
    const categories = JSON.parse(sessionStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES) || '[]');
    const result = findCategoryById(categories, subCategoryId);

    if (!result) {
      console.error("Category not found for the subcategory");
      return;
    }

    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/categories/${result.category}/subcategories/${result.subcategory}`
        );
        handleResetDashboard();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        alert("Failed to delete subcategory. Please try again.");
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${productId}`);
        handleResetDashboard();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  // Image viewer handlers
  const handleImageClick = (imageUrl) => {
    setFullScreenImage(imageUrl);
  };

  const handleCloseFullScreenImage = () => {
    setFullScreenImage(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = scale + e.deltaY * -0.01;
    setScale(Math.min(Math.max(0.5, newScale), 3));
  };

  const handleMouseMove = (e) => {
    if (scale > 1) {
      setPosition({
        x: Math.min(Math.max(position.x + e.movementX, -100), 100),
        y: Math.min(Math.max(position.y + e.movementY, -100), 100),
      });
    }
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.5, 10));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    setScale(scale === 1 ? 2 : 1);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  return (
    <div className="h-screen w-screen fixed overflow-y-auto" style={{ backgroundColor: COLORS.background }}>
      {/* Navigation Bar */}
      <motion.nav 
        className="shadow-lg text-white rounded-xl px-5 py-3 flex items-center justify-between fixed top-2 left-0 right-0 mx-2 z-50"
        style={{ background: COLORS.primary }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
      >
        <div className="flex items-center w-full justify-between">
          <div className="gap-4 flex items-center">
            <Tooltip 
              title={isCollapsed ? "Open Sidebar" : "Close Sidebar"} 
              arrow 
              placement="bottom"
            >
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <MenuOpenIcon className="cursor-pointer text-2xl" />
                ) : (
                  <MenuIcon className="cursor-pointer text-2xl" />
                )}
              </motion.button>
            </Tooltip>
            
            <motion.h2
              whileHover={{ scale: 1.02 }}
              className="text-xl sm:text-2xl font-bold cursor-pointer font-sans"
              onClick={handleResetDashboard}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              My Shopping Store
            </motion.h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative mr-[-15px]">
              <Search
                onSelectCategory={handleSearchCategorySelect}
                onSelectSubCategory={handleSearchSubCategorySelect}
              />
            </div>
            
            <Tooltip title="Notifications" arrow placement="bottom">
              <div className="relative group">
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-white/20"
                >
                  <MdNotifications className="text-2xl" />
                  {notifications.some(n => !n.read) && (
                    <motion.span 
                      className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    ></motion.span>
                  )}
                </motion.button>
                
                <motion.div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 hidden group-hover:block border border-gray-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map(notification => (
                      <motion.div 
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-blue-600 hover:underline">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </div>
            </Tooltip>
            
            <Tooltip title="Logout" arrow placement="bottom">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "#dc2626" }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-500 flex items-center px-4 py-2 rounded-lg hover:bg-red-600 cursor-pointer shadow-md transition-colors" 
                onClick={handleLogout}
                aria-label="Logout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FiLogOut className="text-xl" />
                <span className="ml-2 font-bold hidden sm:block">Logout</span>
              </motion.button>
            </Tooltip>
          </div>
        </div>
      </motion.nav>

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onSelectCategory={handleSelectCategory}
        onSelectSubCategory={handleSelectSubCategory}
        onSelectProduct={handleSelectProduct}
        onOrdersClick={handleOrdersClick}
      />

      {/* Main Content */}
      <motion.main 
        className={`transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        } mt-20 flex flex-col items-center md:items-start custom-scrollbar`}
        style={{ color: COLORS.textPrimary }}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {showOrders ? (
          <Orders />
        ) : (
          <>
            <div className="pl-6 pt-4 hidden sm:block">
              <Shortcut />
            </div>

            <motion.div 
              className="p-6 text-center md:text-left"
              variants={slideIn}
            >
              <motion.h1 
                className="text-4xl text-gray-700 md:text-5xl font-extrabold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome to
                <span className="text-indigo-600 ml-2"> My Shopping Store</span>
              </motion.h1>
              <motion.p 
                className="mt-3 text-lg text-gray-600 font-semibold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Manage your categories efficiently!
              </motion.p>
            </motion.div>

            <motion.div 
              className="md:flex space-y-7 gap-6 p-6"
              variants={slideIn}
            >
              <motion.div 
                className="w-full md:mt-[24px] max-w-xl p-6 rounded-xl shadow-xl border border-gray-200 
                          transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl"
                style={{ background: COLORS.card }}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.98 }}
              >
                <Category />
              </motion.div>

              <motion.div 
                className="w-full max-w-xl p-6 rounded-xl shadow-xl border border-gray-200 
                          transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl"
                style={{ background: COLORS.card }}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.98 }}
              >
                <SubCategory />
              </motion.div>
            </motion.div>

            {/* Selected Category */}
            <AnimatePresence>
              {selectedCategory && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={scaleUp}
                >
                  <motion.h1 
                    className="ml-8 mb-2 text-2xl text-gray-600 font-bold"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Category
                  </motion.h1>
                  <motion.div 
                    className="max-w-2xl mb-10 p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 mx-8"
                    style={{ background: COLORS.card }}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center mb-4">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        src={selectedCategory.image}
                        alt={selectedCategory.name}
                        className="w-[100px] h-[100px] rounded-full mr-4 object-cover cursor-pointer shadow-md border-2 border-indigo-100"
                        onClick={() => handleImageClick(selectedCategory.image)}
                      />
                      <motion.h1 
                        className="text-3xl text-gray-600 font-bold"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {selectedCategory.name}
                      </motion.h1>
                    </div>

                    <motion.p 
                      className="ml-16 text-xl text-gray-600 font-semibold"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {selectedCategory.description}
                    </motion.p>

                    <motion.div 
                      className="flex justify-end gap-4 mt-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {selectedCategory._id && (
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <EditCategory
                            initialData={selectedCategory}
                            onSubmit={handleResetDashboard}
                          />
                        </motion.div>
                      )}

                      <Tooltip title="Delete" arrow placement="top">
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: "#dc2626" }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
                          onClick={() => handleDeleteCategory(selectedCategory._id)}
                          aria-label="Delete category"
                        >
                          <Trash className="w-5 h-5 mr-2" />
                          Delete
                        </motion.button>
                      </Tooltip>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Sub-Category */}
            <AnimatePresence>
              {selectedSubCategory && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={scaleUp}
                >
                  <motion.h1 
                    className="ml-8 mb-2 text-2xl text-gray-600 font-bold"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Sub-Category
                  </motion.h1>
                  <motion.div 
                    className="max-w-xl p-6 mb-10 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 mx-8"
                    style={{ background: COLORS.card }}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center mb-4">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        src={selectedSubCategory.image}
                        alt={selectedSubCategory.name}
                        className="w-[100px] h-[100px] rounded-full mr-4 object-cover cursor-pointer shadow-md border-2 border-indigo-100"
                        onClick={() => handleImageClick(selectedSubCategory.image)}
                      />
                      <motion.h1 
                        className="text-3xl text-gray-600 font-bold"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {selectedSubCategory.name}
                      </motion.h1>
                    </div>

                    <motion.p 
                      className="ml-16 text-xl text-gray-600 font-semibold"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {selectedSubCategory.description}
                    </motion.p>

                    <motion.div 
                      className="flex justify-end gap-4 mt-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <EditSubCategory
                          selectedSubCategory={selectedSubCategory}
                          categoryId={findCategoryById(
                            JSON.parse(sessionStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES) || "[]"), 
                            selectedSubCategory._id
                          )?.category}
                          subCategoryId={selectedSubCategory._id}
                          onSubmit={handleResetDashboard}
                        />
                      </motion.div>

                      <Tooltip title="Delete" arrow placement="top">
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: "#dc2626" }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
                          onClick={() => handleDeleteSubCategory(selectedSubCategory._id)}
                          aria-label="Delete subcategory"
                        >
                          <Trash className="w-5 h-5 mr-2" />
                          Delete
                        </motion.button>
                      </Tooltip>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Sub-Categories (multiple) */}
            <AnimatePresence>
              {selectedSubCategory2 && selectedSubCategory2.length > 0 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={fadeIn}
                >
                  <motion.h1 
                    className="ml-8 mb-2 text-2xl text-gray-600 font-bold"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Sub-Categories
                  </motion.h1>
                  <div className="grid lg:grid-cols-2 md:grid-cols-1">
                    {selectedSubCategory2.map((sub, index) => (
                      <motion.div
                        key={sub._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="max-w-xl mb-10 p-4 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 mx-8"
                        style={{ background: COLORS.card }}
                      >
                        <div className="flex items-center">
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            src={sub.image}
                            alt={sub.name}
                            className="w-[50px] h-[50px] rounded-full mx-2 object-cover cursor-pointer shadow-md border-2 border-indigo-100"
                            onClick={() => handleImageClick(sub.image)}
                          />
                          <motion.h1 
                            className="text-2xl text-gray-600 font-bold"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            {sub.name}
                          </motion.h1>
                        </div>

                        <motion.p 
                          className="ml-16 text-lg text-gray-600 font-semibold"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {sub.description}
                        </motion.p>
                        <motion.div 
                          className="flex justify-end pb-1 pr-1 gap-2 mt-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <EditSubCategory
                              selectedSubCategory={sub}
                              categoryId={selectedCategory?._id}
                              subCategoryId={sub._id}
                              onSubmit={handleResetDashboard}
                            />
                          </motion.div>
                          <Tooltip title="Delete" arrow placement="top">
                            <motion.button
                              whileHover={{ scale: 1.05, backgroundColor: "#dc2626" }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
                              onClick={() => handleDeleteSubCategory(sub._id)}
                              aria-label="Delete subcategory"
                            >
                              <Trash className="w-5 h-5 mr-2" />
                              Delete
                            </motion.button>
                          </Tooltip>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Product */}
            <AnimatePresence>
              {selectedProduct && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={scaleUp}
                >
                  <motion.h1 
                    className="ml-8 mb-2 text-2xl text-gray-600 font-bold"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Product
                  </motion.h1>
                  <motion.div 
                    className="max-w-2xl mb-10 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 mx-8"
                    style={{ background: COLORS.card }}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center mb-4">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-[100px] h-[100px] rounded-full mr-4 object-cover cursor-pointer shadow-md border-2 border-indigo-100"
                        onClick={() => handleImageClick(selectedProduct.image)}
                      />
                      <div>
                        <motion.h1 
                          className="text-3xl text-gray-600 font-bold"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {selectedProduct.name}
                        </motion.h1>
                        <motion.p 
                          className="text-gray-600 text-xl mb-2 flex items-center"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <span className="font-extrabold">Price:</span>
                          <span className="ml-2 font-bold text-emerald-500">
                            Rs.{new Intl.NumberFormat("en-US").format(selectedProduct.price)}
                          </span>
                        </motion.p>
                      </div>
                    </div>

                    <motion.p 
                      className="ml-[114px] text-xl text-gray-600 font-semibold"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {selectedProduct.description}
                    </motion.p>

                    <motion.div 
                      className="flex justify-end gap-4 mt-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {selectedProduct._id && (
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Editproduct
                            initialData={selectedProduct}
                            onSubmit={handleResetDashboard}
                          />
                        </motion.div>
                      )}
                      <Tooltip title="Delete" arrow placement="top">
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: "#dc2626" }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
                          onClick={() => handleDeleteProduct(selectedProduct._id)}
                          aria-label="Delete product"
                        >
                          <Trash className="w-5 h-5 mr-2" />
                          Delete
                        </motion.button>
                      </Tooltip>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.main>

      {/* Full Screen Image Viewer */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-md p-10 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onWheel={handleWheel}
          >
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.img
                src={fullScreenImage}
                alt="Full Screen"
                className="transform rounded-3xl transition-transform duration-300 cursor-move"
                style={{
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
                onMouseMove={handleMouseMove}
                onDoubleClick={handleDoubleClick}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: scale, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              />
            </div>

            <div className="absolute bottom-6 left-6 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 flex justify-center items-center bg-white/20 text-white font-bold text-2xl rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                onClick={handleZoomIn}
                aria-label="Zoom in"
              >
                +
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 flex justify-center items-center bg-white/20 text-white font-bold text-2xl rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                onClick={handleZoomOut}
                aria-label="Zoom out"
              >
                -
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 flex justify-center items-center bg-white/20 text-white font-bold text-xl rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                onClick={handleResetZoom}
                aria-label="Reset zoom"
              >
                ↺
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-6 right-6 w-12 h-12 flex justify-center items-center bg-white/20 text-white font-bold text-3xl rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
              onClick={handleCloseFullScreenImage}
              aria-label="Close image viewer"
            >
              &times;
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style>
        {`
          body {
            --sb-track-color: #f1f1f1;
            --sb-thumb-color: #c7d2fe;
            --sb-size: 8px;
          }

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: var(--sb-thumb-color) var(--sb-track-color);
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: var(--sb-size);
            height: var(--sb-size);
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--sb-track-color);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--sb-thumb-color);
            border-radius: 10px;
            border: 2px solid var(--sb-track-color);
          }

          @supports not selector(::-webkit-scrollbar) {
            .custom-scrollbar {
              scrollbar-color: var(--sb-thumb-color) var(--sb-track-color);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Layout;