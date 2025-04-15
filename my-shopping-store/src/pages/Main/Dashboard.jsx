import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FaHome } from "react-icons/fa";
import { TbCategoryPlus } from "react-icons/tb";
import Tooltip from "@mui/material/Tooltip";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Category from "../../components/Category";
import SubCategory from "../../components/SubCategory";
import { Trash } from "lucide-react";
import EditCategory from "../../components/editCategory";
import EditSubCategory from "../../components/editSubcategory";
import Search from "../../components/Search";
import Orders from "../../components/Orders";
import Shortcut from "../../components/Shortcut";
import { AiOutlineProduct } from "react-icons/ai";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import Product from "../../components/Product";
import Editproduct from "../../components/editProduct"
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { FiPackage } from "react-icons/fi";

const Sidebar = ({ isCollapsed, onSelectCategory, onSelectSubCategory, onSelectProduct, onOrdersClick }) => {
  const [openDropdowns, setOpenDropdowns] = useState(() => {
    const storedState = localStorage.getItem("sidebarDropdowns");
    return storedState ? JSON.parse(storedState) : {};
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [products, setProducts] = useState([]);
  const toggleDropdown2 = () => {
    setDropdownOpen((prev) => ({ ...prev, product: !prev.product }));
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((response) => {
        sessionStorage.setItem("categories", JSON.stringify(response.data));
        setCategories(response.data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subcategoriesData = {};
        for (const category of categories) {
          const response = await axios.get(
            `http://localhost:5000/api/categories/${category._id}/subcategories`
          );
          subcategoriesData[category._id] = response.data;
        }
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    if (categories.length > 0) {
      fetchSubcategories();
    }
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("sidebarDropdowns", JSON.stringify(openDropdowns));
  }, [openDropdowns]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const toggleDropdown = (categoryId) => {
    setOpenDropdowns((prev) => {
      const isCurrentlyOpen = prev[categoryId];

      if (isCurrentlyOpen && subcategories[categoryId]) {
        const updatedDropdowns = { ...prev };
        delete updatedDropdowns[categoryId];

        subcategories[categoryId].forEach((sub) => {
          delete updatedDropdowns[sub._id];
        });

        return updatedDropdowns;
      }

      if (subcategories[categoryId]) {
        const updatedDropdowns = { ...prev, [categoryId]: true };

        Object.keys(subcategories).forEach((key) => {
          if (key !== categoryId) {
            delete updatedDropdowns[key];
          }
        });

        return updatedDropdowns;
      }

      Object.keys(subcategories).forEach((parentId) => {
        if (subcategories[parentId].some((sub) => sub._id === categoryId)) {
          const updatedDropdowns = { ...prev, [categoryId]: !isCurrentlyOpen };

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

  return (
    <div className="relative">
      <div
        className={`mt-[78px] mb-5 ml-2.5 rounded-xl bg-cyan-600 text-neutral-100 ${isCollapsed ? "w-16 opacity-50" : "w-64 opacity-100"
          } transition-all duration-300 shadow-[0_2px_10px_0px_rgba(0,0,0,2)] flex flex-col h-[calc(100vh-93px)] p-4 fixed top-0 left-0 overflow-y-auto custom-scrollbar`}
      >
        <Tooltip title="Home" arrow placement="right">
          <div
            className="cursor-pointer gap-3 text-white p-2 hover:bg-white/20 rounded flex items-center"
            onClick={() => window.location.reload()}
          >
            <FaHome className="text-3xl" />
            {!isCollapsed && <h1 className="text-xl font-bold font-serif">Home</h1>}
          </div>
        </Tooltip>
        <Tooltip title="Category" arrow placement="right">
          <div
            className="flex items-center justify-between p-2 hover:bg-white/20 rounded cursor-pointer"
            onClick={() => toggleDropdown("main")}
          >
            <div className="flex items-center space-x-3">
              <TbCategoryPlus className="text-3xl font-bold" />
              {!isCollapsed && <span className="font-bold font-serif text-xl">Category</span>}
            </div>
            {!isCollapsed &&
              (openDropdowns["main"] ? (
                <MdKeyboardArrowUp className="text-xl" />
              ) : (
                <MdKeyboardArrowDown className="text-xl" />
              ))}
          </div>
        </Tooltip>
        {openDropdowns["main"] && !isCollapsed && (
          <ul className="ml-2 mt-2 space-y-2">
            {categories.map((category) => (
              <li key={category._id}>
                <div className="p-2 flex items-center hover:bg-white/20 rounded cursor-pointer">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-6 h-6 rounded-full mr-2 object-cover cursor-pointer"
                    onClick={() => onSelectCategory(category)}
                  />

                  <div
                    className="flex items-center w-full cursor-pointer"
                    onClick={() => toggleDropdown(category._id)}
                  >
                    {!isCollapsed && <span className="truncate w-32">{category.name}</span>}
                    {!isCollapsed &&
                      (openDropdowns[category._id] ? <MdKeyboardArrowUp className="ml-auto" /> : <MdKeyboardArrowDown className="ml-auto" />)}
                  </div>
                </div>

                {openDropdowns[category._id] && subcategories[category._id] && !isCollapsed && (
                  <ul className="ml-4 mt-2 space-y-1">
                    {subcategories[category._id].map((subcategory) => (
                      <li
                        key={subcategory._id}
                        className="p-2 flex items-center hover:bg-white/20 rounded cursor-pointer"
                        onClick={() => onSelectSubCategory(subcategory)}
                      >
                        <img
                          src={subcategory.image}
                          alt={subcategory.name}
                          className="w-5 h-5 rounded-full mr-2 object-cover"
                        />
                        <span className="truncate w-32">{subcategory.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
        <div>
          <Tooltip title="Products" arrow placement="right">
            <div
              className="cursor-pointer gap-3 text-white p-2 hover:bg-white/20 rounded flex items-center"
              onClick={toggleDropdown2}
            >
              <AiOutlineProduct className="text-3xl" />
              {!isCollapsed && <h1 className="text-xl font-bold font-serif">Products</h1>}
              {!isCollapsed &&
                (dropdownOpen["product"] ? (
                  <MdKeyboardArrowUp className="ml-auto text-xl" />
                ) : (
                  <MdKeyboardArrowDown className="ml-auto text-xl" />
                ))}
            </div>
          </Tooltip>

          {dropdownOpen["product"] && !isCollapsed && (
            <div className="ml-2 mt-2 space-y-2">
              <Product />
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="p-2 flex items-center gap-2 rounded hover:bg-white/20 cursor-pointer transition-all duration-200"
                    onClick={() => onSelectProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white text-base truncate w-[120px]">
                      {product.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Tooltip title="Orders" arrow placement="right">
          <div
            className="cursor-pointer gap-3 text-white p-2 hover:bg-white/20 rounded flex items-center"
            onClick={onOrdersClick}
          >
            <FiPackage className="text-3xl" />
            {!isCollapsed && (
              <h1 className="text-xl font-bold font-serif">Orders</h1>
            )}
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  onSelectSubCategory: PropTypes.func.isRequired,
  onSelectProduct: PropTypes.func.isRequired,
  onOrdersClick: PropTypes.func.isRequired,
};

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const storedState = localStorage.getItem("sidebarState");
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

  const navigate = useNavigate();

  const handleOrdersClick = () => {
    setShowOrders(!showOrders);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "l") {
        event.preventDefault();
        localStorage.removeItem("token");
        navigate("/signin");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("sidebarState", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem("token");
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

  const handleEditSubCategory = (subcategory) => {
    let categories = sessionStorage.getItem("categories");
    categories = JSON.parse(categories);

    const result = findCategoryById(categories, subcategory._id);

    if (result) {
      console.log("Editing Subcategory:", subcategory);
      console.log("Category ID:", result.category);
    } else {
      console.error("Category not found for the subcategory.");
    }
  };

  function findCategoryById(categories, targetId) {
    for (const category of categories) {
      for (const subcategory of category.subcategories) {
        if (subcategory._id === targetId) {
          return {
            category: category._id,
            subcategory: subcategory._id
          };
        }
      }
    }
    return null;
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${categoryId}`);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleDeleteSubCategory = async (categoryId, subCategoryId) => {
    console.log("categoryId", categoryId);
    console.log("subCategoryId", subCategoryId);
    let categories = sessionStorage.getItem("categories");
    categories = JSON.parse(categories);
    console.log("🚀 ~ handleDeleteSubCategory ~ categories:", categories)

    const result = findCategoryById(categories, subCategoryId);
    console.log("🚀 ~ handleDeleteSubCategory ~ result:", result)

    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${result?.category}/subcategories/${result?.subcategory}`);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

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
    setPosition({ x: 1, y: 1 });
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
    }
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === "o") {
        setIsCollapsed(false); // Open Sidebar
      }
      if (event.altKey && event.key === "c") {
        setIsCollapsed(true); // Close Sidebar
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#F5F7FA] fixed overflow-y-auto">
      <nav className="bg-cyan-600 backdrop-blur-lg text-neutral-100 rounded-xl px-5 py-3 flex items-center justify-between fixed top-2 left-0 right-0 mx-2 z-50">
        <div className="flex items-center w-full justify-between">
          <div className="gap-4 flex items-center">
            {isCollapsed ? (
              <Tooltip title="Open Sidebar" arrow placement="bottom">
                <MenuOpenIcon
                  className="cursor-pointer text-xl"
                  onClick={() => setIsCollapsed(false)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Close Sidebar" arrow placement="bottom">
                <MenuIcon
                  className="cursor-pointer text-xl"
                  onClick={() => setIsCollapsed(true)}
                />
              </Tooltip>
            )}
            <h2
              onClick={() => window.location.reload()}
              className="text-lg sm:text-xl font-bold cursor-pointer font-serif"
            >
              My Shopping Store
            </h2>
          </div>


          <div className="fixed justify-between right-32 flex">
            <Search
              onSelectCategory={handleSearchCategorySelect}
              onSelectSubCategory={handleSearchSubCategorySelect}
            />
          </div>
          <Tooltip title="Logout" arrow placement="bottom">
            <div className="bg-red-600 flex items-center px-3 py-2 rounded-lg hover:bg-red-700 cursor-pointer" onClick={handleLogout}>
              <FiLogOut className="text-xl" />
              <span className="ml-2 font-bold hidden sm:block">Logout</span>
            </div>
          </Tooltip>
        </div>
      </nav>

      <Sidebar
        isCollapsed={isCollapsed}
        onSelectCategory={handleSelectCategory}
        onSelectSubCategory={handleSelectSubCategory}
        onSelectProduct={handleSelectProduct}
        onOrdersClick={handleOrdersClick}
      />

      <main className={`transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"} mt-20 text-black flex flex-col items-center md:items-start custom-scrollbar`}>
        {showOrders ? (
          <Orders />
        ) : (
          <>
            <div className="pl-6 pt-4 hidden sm:block">
              <Shortcut />
            </div>

            <div className="p-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-700 drop-shadow-lg">
                Welcome to
                <span className="text-cyan-600 ml-2"> My Shopping Store</span>
              </h1>
              <p className="mt-3 text-lg text-gray-700 font-semibold">
                Manage your categories efficiently!
              </p>
            </div>

            <div className="md:flex space-y-7 gap-6 p-6">
              <div className="w-full md:mt-[24px] max-w-xl bg-cyan-800/20 p-6 rounded-xl shadow-lg border border-gray-400 
                        transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                <Category />
              </div>

              <div className="w-full max-w-xl bg-cyan-800/20 p-6 rounded-xl shadow-lg border border-gray-400 
                        transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                <SubCategory />
              </div>
            </div>
            {selectedCategory && (
              <div>
                <h1 className="ml-8 mb-2 text-2xl text-neutral-500 drop-shadow-2xl shadow-black font-bold">
                  Category
                </h1>
                <div className="max-w-2xl bg-cyan-800/20 mb-10 p-6 rounded-xl shadow-lg border border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl mx-8">
                  <div className="flex items-center mb-4">
                    <img
                      src={selectedCategory.image}
                      alt={selectedCategory.name}
                      className="w-[100px] h-[100px] rounded-full mr-4 object-cover cursor-pointer"
                      onClick={() => handleImageClick(selectedCategory.image)}
                    />
                    <h1 className="text-3xl font-bold text-neutral-700 drop-shadow-lg">
                      {selectedCategory.name}
                    </h1>
                  </div>

                  <p className="ml-16 text-xl text-gray-700 font-semibold">
                    {selectedCategory.description}
                  </p>

                  <div className="flex justify-end gap-4 mt-6">
                    {selectedCategory._id && (
                      <EditCategory
                        initialData={selectedCategory}
                        onSubmit={() => window.location.reload()}
                      />
                    )}

                    <Tooltip title="Delete" arrow placement="top">
                      <button
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
                        onClick={() => handleDeleteCategory(selectedCategory._id)}
                      >
                        <Trash className="w-5 h-5 mr-2" />
                        Delete
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}
            {selectedSubCategory && (
              <div>
                <h1 className="ml-8 mb-2 text-2xl text-neutral-500 drop-shadow-2xl shadow-black font-bold">Sub-Category</h1>
                <div className="max-w-xl bg-cyan-800/20 p-6 mb-10 rounded-xl shadow-lg border border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl mx-8">
                  <div className="flex items-center mb-4">
                    <img
                      src={selectedSubCategory.image}
                      alt={selectedSubCategory.name}
                      className="w-[100px] h-[100px] rounded-full mr-4 object-cover cursor-pointer"
                      onClick={() => handleImageClick(selectedSubCategory.image)}
                    />
                    <h1 className="text-3xl font-bold text-neutral-700 drop-shadow-lg">
                      {selectedSubCategory.name}
                    </h1>
                  </div>

                  <p className="ml-16 text-xl text-gray-700 font-semibold">
                    {selectedSubCategory.description}
                  </p>

                  <div className="flex justify-end gap-4 mt-6">
                    <EditSubCategory
                      selectedSubCategory={selectedSubCategory}
                      categoryId={findCategoryById(JSON.parse(sessionStorage.getItem("categories")), selectedSubCategory._id)?.category}
                      subCategoryId={selectedSubCategory._id}
                      onSubmit={() => window.location.reload()}
                    />

                    <Tooltip title="Delete" arrow placement="top">
                      <button
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
                        onClick={async () => {
                          await handleDeleteSubCategory(selectedCategory, selectedSubCategory._id);
                          setSelectedSubCategory(null);
                        }}
                      >
                        <Trash className="w-5 h-5 mr-2" />
                        Delete
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}

            {selectedSubCategory2 && selectedSubCategory2.length > 0 && (
              <div>
                <h1 className="ml-8 mb-2 text-xl text-neutral-500 drop-shadow-2xl shadow-black font-bold">
                  Sub-Categories
                </h1>
                <div className="grid lg:grid-cols-2 md:grid-cols-1">
                  {selectedSubCategory2.map((sub) => (
                    <div
                      key={sub._id}
                      className="max-w-xl bg-cyan-800/20 mb-10 p-2 rounded-xl shadow-lg border border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl mx-8"
                    >
                      <div className="flex items-center ">
                        <img
                          src={sub.image}
                          alt={sub.name}
                          className="w-[50px] h-[50px] rounded-full mx-2 object-cover cursor-pointer"
                          onClick={() => handleImageClick(sub.image)}
                        />
                        <h1 className="text-2xl font-bold text-neutral-700 drop-shadow-lg">
                          {sub.name}
                        </h1>
                      </div>

                      <p className="ml-16 text-lg text-gray-700 font-semibold">
                        {sub.description}
                      </p>
                      <div className="flex justify-end pb-1 pr-1 gap-2 mt-1">
                        <EditSubCategory
                          selectedSubCategory={sub}
                          categoryId={selectedCategory?._id}
                          subCategoryId={sub._id}
                          onSubmit={() => window.location.reload()}
                        />
                        <Tooltip title="Delete" arrow placement="top">
                          <button
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
                            onClick={() => handleDeleteSubCategory(selectedCategory?._id, sub._id)}
                          >
                            <Trash className="w-5 h-5 mr-2" />
                            Delete
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct && (
              <div>
                <h1 className="ml-8 mb-2 text-2xl text-neutral-500 drop-shadow-2xl shadow-black font-bold">
                  Product
                </h1>
                <div className="max-w-2xl bg-cyan-800/20 mb-10 p-4 rounded-3xl shadow-lg border border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl mx-8">
                  <div className="flex items-center mb-4">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-[100px] h-[100px] rounded-full mr-4 object-cover cursor-pointer"
                      onClick={() => handleImageClick(selectedProduct.image)}
                    />
                    <h1 className="text-3xl font-bold text-neutral-700 drop-shadow-lg">
                      {selectedProduct.name}
                    </h1>
                  </div>
                  <p className="text-gray-700 text-xl mb-2 ml-[114px] flex">
                    <span className="font-extrabold">Price:</span>
                    <span className="ml-1 font-bold">
                      Rs.{new Intl.NumberFormat("en-US").format(selectedProduct.price)}
                    </span>
                  </p>

                  <p className="ml-[114px] text-xl text-gray-700 font-semibold">
                    {selectedProduct.description}
                  </p>

                  <div className="flex justify-end gap-4 mt-6">
                    {selectedProduct._id && (
                      <Editproduct
                        initialData={selectedProduct}
                        onSubmit={() => window.location.reload()}
                      />
                    )}
                    <Tooltip title="Delete" arrow placement="top">
                      <button
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition"
                        onClick={() => handleDeleteProduct(selectedProduct._id)}
                      >
                        <Trash className="w-5 h-5 mr-2" />
                        Delete
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      {fullScreenImage && (
        <div
        className="fixed inset-0 bg-white/50 backdrop-blur-md p-10 flex items-center justify-center z-50"
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
            <img
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
            />
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              className="w-12 h-12 flex justify-center bg-white/70 text-neutral-600 font-bold text-4xl rounded-full hover:bg-white/80 transition-colors"
              onClick={handleZoomIn}
            >
              +
            </button>
            <button
              className=" w-12 h-12 flex justify-center bg-white/70 text-neutral-600 font-bold text-4xl rounded-full hover:bg-white/80 transition-colors"
              onClick={handleZoomOut}
            >
              -
            </button>
            <button
              className="w-12 h-12 flex justify-center py-1 bg-white/70 font-bold text-neutral-600 text-3xl rounded-full hover:bg-white/80 transition-colors"
              onClick={handleResetZoom}
            >
              ↺
            </button>
          </div>

          <button
            className="absolute top-4 right-4 w-12 h-12 flex justify-center bg-white/70 text-neutral-600 font-bold text-4xl rounded-full hover:bg-white/80 transition-colors"
            onClick={handleCloseFullScreenImage}
          >
            &times;
          </button>
        </div>
      )}
      <style>
        {`
          body {
            --sb-track-color: #fdfdfd;
            --sb-thumb-color: #868684;
            --sb-size: 1px;
          }

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: var(--sb-thumb-color) var(--sb-track-color);
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: var(--sb-size);
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--sb-track-color);
            border-radius: 50px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--sb-thumb-color);
            border-radius: 50px;
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