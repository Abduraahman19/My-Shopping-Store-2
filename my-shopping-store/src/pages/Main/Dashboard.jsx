import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FaBars, FaHome } from "react-icons/fa";
import { TbCategoryPlus } from "react-icons/tb";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import Tooltip from "@mui/material/Tooltip";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Category from "../../components/Category";
import SubCategory from "../../components/SubCategory";
import { Trash } from "lucide-react";
import EditCategory from "../../components/editCategory"; 
import EditSubCategory from "../../components/editSubcategory"; 
import Search from "../../components/Search"; 

const Sidebar = ({ isCollapsed, onSelectCategory, onSelectSubCategory }) => {
  const [openDropdowns, setOpenDropdowns] = useState(() => {
    const storedState = localStorage.getItem("sidebarDropdowns");
    return storedState ? JSON.parse(storedState) : {};
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((response) => setCategories(response.data))
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

  const handleDeleteSubCategory = async (categoryId, subCategoryId) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${categoryId}/subcategories/${subCategoryId}`);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
      }
    }
  };

  return (
    <div className="relative">
      <div
        className={`mt-[78px] mb-5 ml-2 rounded-xl bg-cyan-600 text-neutral-100 ${isCollapsed ? "w-16 opacity-50" : "w-64 opacity-100"
          } transition-all duration-300 flex flex-col h-[calc(100vh-93px)] p-4 fixed top-0 left-0 overflow-y-auto custom-scrollbar`}
      >
        <Tooltip title="Home" arrow placement="right">
          <div
            className="cursor-pointer gap-3 text-white p-2 hover:bg-white/20 rounded flex items-center"
            onClick={() => window.location.reload()}
          >
            <FaHome className="text-3xl" />
            <h1 className="text-xl font-bold font-serif">Home</h1>
          </div>
        </Tooltip>

        <Tooltip title="Category" arrow placement="right">
          <div
            className="flex items-center space-x-3 p-2 hover:bg-white/20 rounded cursor-pointer"
            onClick={() => toggleDropdown("main")}
          >
            <TbCategoryPlus className="text-3xl font-bold" />
            {!isCollapsed && <span className="font-bold font-serif text-xl">Category</span>}
            {!isCollapsed &&
              (openDropdowns["main"] ? (
                <MdKeyboardArrowUp className="ml-auto text-xl" />
              ) : (
                <MdKeyboardArrowDown className="ml-auto text-xl" />
              ))}
          </div>
        </Tooltip>

        {openDropdowns["main"] && (
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
                  <span className="truncate w-32" onClick={() => toggleDropdown(category._id)}>
                    {category.name}
                  </span>
                  {openDropdowns[category._id] ? (
                    <MdKeyboardArrowUp onClick={() => toggleDropdown(category._id)} />
                  ) : (
                    <MdKeyboardArrowDown onClick={() => toggleDropdown(category._id)} />
                  )}
                </div>

                {openDropdowns[category._id] && subcategories[category._id] && (
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

                        <EditSubCategory
                          selectedSubCategory={subcategory}
                          categoryname={category.name}
                          subCategoryId={subcategory._id}   
                          categoryId={category._id}         
                        />

                        <Tooltip title="Delete" arrow placement="right">
                          <button
                            className="ml-auto flex items-center px-[5px] py-[5px] bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubCategory(category._id, subcategory._id);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </li>
                    ))}
                  </ul>
                )}

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  onSelectSubCategory: PropTypes.func.isRequired,
};

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const storedState = localStorage.getItem("sidebarState");
    return storedState ? JSON.parse(storedState) : window.innerWidth < 768;
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const navigate = useNavigate();

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
  };

  const handleSelectSubCategory = (subcategory) => {
    setSelectedSubCategory(subcategory);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${categoryId}`);
        setSelectedCategory(null);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-neutral-100 fixed overflow-y-auto">
      <nav className="bg-cyan-600 backdrop-blur-lg text-neutral-100 rounded-xl px-5 py-3 flex items-center justify-between fixed top-3 left-0 right-0 mx-2 z-50">
        <div className="flex items-center w-full justify-between">
          <div className="gap-4 flex items-center">
            <FaBars className="cursor-pointer text-xl" onClick={() => setIsCollapsed(!isCollapsed)} />
            <h2
              onClick={() => window.location.reload()}
              className="text-lg sm:text-xl font-bold cursor-pointer font-serif"
            >
              My Shopping Store
            </h2>
          </div>
          <Search/>  
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
        selectedSubCategory={selectedSubCategory}
      />

      <main className={`transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"} mt-20 text-black flex flex-col items-center md:items-start custom-scrollbar`}>
        <div className="p-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-700 drop-shadow-lg">
            Welcome to
            <span className="text-cyan-600 ml-2">My Shopping Store</span>
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
        {selectedCategory &&  (
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
                />
                <h1 className="text-3xl font-bold text-neutral-700 drop-shadow-lg">
                  {selectedSubCategory.name}
                </h1>
              </div>

              <p className="ml-16 text-xl text-gray-700 font-semibold">
                {selectedSubCategory.description}
              </p>
            </div>
          </div>
        )}
      </main>
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
