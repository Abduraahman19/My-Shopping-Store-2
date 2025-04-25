import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";

const COLORS = {
  primary: "#4f46e5",
  primaryLight: "#ffffff",
  primaryDark: "#4338ca",
  secondary: "#10b981",
  accent: "#f59e0b",
  background: "#f8fafc",
  card: "#4f46e5",
  textPrimary: "#ffffff",
  textSecondary: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6"
};

const API_BASE_URL = "http://localhost:5000/api";

const SearchBar = ({ onSelectCategory, onSelectSubCategory2 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 500 }
    },
    exit: { y: 20, opacity: 0 }
  };

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.05 }
    })
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = async (category) => {
    setIsOpen(false);
    setSearchTerm("");
    onSelectCategory(category);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/categories/${category._id}/subcategories`
      );
      onSelectSubCategory2(response.data || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      onSelectSubCategory2([]);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search Button */}
      <Tooltip title="Search (Ctrl+Shift+S)" arrow>
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            backgroundColor: COLORS.primary,
            "&:hover": { backgroundColor: COLORS.primaryDark },
            transition: "all 0.3s ease",
            marginLeft: "8px"
          }}
        >
          <SearchIcon sx={{ color: COLORS.primaryLight }} />
        </IconButton>
      </Tooltip>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            fullWidth
            maxWidth="sm"
            PaperProps={{
              sx: {
                borderRadius: "12px",
                overflow: "hidden",
                background: "white",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
              }
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={backdropVariants}
            >
              {/* Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                  padding: "16px 24px",
                  position: "relative"
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    color: COLORS.primaryLight,
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  Search Categories
                </Typography>
                <IconButton
                  onClick={() => setIsOpen(false)}
                  sx={{
                    position: "absolute",
                    right: "16px",
                    top: "16px",
                    color: COLORS.primaryLight
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </div>

              {/* Content */}
              <DialogContent sx={{ p: 3 }}>
                <motion.div variants={modalVariants}>
                  <TextField
                    fullWidth
                    autoFocus
                    variant="outlined"
                    placeholder="Type category name..."
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "& fieldset": {
                          borderColor: COLORS.primary
                        },
                        "&:hover fieldset": {
                          borderColor: COLORS.primaryDark
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primaryDark,
                          borderWidth: "2px"
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon
                          sx={{ color: COLORS.textSecondary, mr: 1 }}
                        />
                      )
                    }}
                  />

                  {/* Results */}
                  <div
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      paddingRight: "8px"
                    }}
                    className="custom-scrollbar"
                  >
                    {isLoading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100px"
                        }}
                      >
                        <CircularProgress sx={{ color: COLORS.primary }} />
                      </div>
                    ) : error ? (
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ textAlign: "center", py: 3 }}
                      >
                        {error}
                      </Typography>
                    ) : filteredCategories.length === 0 ? (
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: "center",
                          py: 3,
                          color: COLORS.textSecondary
                        }}
                      >
                        {searchTerm.trim() === ""
                          ? "Start typing to search categories"
                          : `No categories found for "${searchTerm}"`}
                      </Typography>
                    ) : (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={{
                          visible: {
                            transition: { staggerChildren: 0.05 }
                          }
                        }}
                      >
                        {filteredCategories.map((category, index) => (
                          <motion.div
                            key={category._id}
                            variants={itemVariants}
                            custom={index}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(category)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px 16px",
                              marginBottom: "8px",
                              borderRadius: "8px",
                              backgroundColor: "#f8fafc",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              border: `1px solid ${COLORS.primary}20`
                            }}
                          >
                            <img
                              src={category.image}
                              alt={category.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                marginRight: "16px",
                                border: `2px solid ${COLORS.primary}`
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: "600",
                                  color: COLORS.primaryDark
                                }}
                              >
                                {category.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: COLORS.textSecondary }}
                              >
                                {category.description || "No description"}
                              </Typography>
                            </div>
                            <div
                              style={{
                                backgroundColor: COLORS.primary + "20",
                                color: COLORS.primaryDark,
                                borderRadius: "12px",
                                padding: "4px 8px",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}
                            >
                              {category.subcategories?.length || 0} sub
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${COLORS.primary} #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${COLORS.primary};
          border-radius: 10px;
          border: 1px solid #f1f1f1;
        }
      `}</style>
    </>
  );
};

export default SearchBar;