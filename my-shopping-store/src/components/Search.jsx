import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import {
  Dialog,
  DialogContent,
  TextField,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";

const SearchBar = ({ onSelectCategory, onSelectSubCategory2 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Shortcut Key (Ctrl + Shift + S) to Open Search
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setOpen(true); // Open search modal
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectCategory = (category) => {
    setSearchTerm("");
    setOpen(false);
    onSelectCategory(category); // Set selected category

    // Fetch subcategories for the selected category
    axios
      .get(`http://localhost:5000/api/categories/${category._id}/subcategories`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          onSelectSubCategory2(response.data); // Update subcategories
          console.log("response.data", response.data);
        } else {
          onSelectSubCategory2([]); // If response format is wrong, set an empty array
        }
      })
      .catch((error) => {
        console.error("Error fetching subcategories:", error);
        onSelectSubCategory2([]); // Clear subcategories if error occurs
      });
  };

  const filteredCategories =
    searchTerm.trim() === ""
      ? []
      : categories.filter(
        (category) =>
          typeof category.name === "string" &&
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <>
      <Tooltip title="Search" arrow placement="bottom">
        <IconButton onClick={() => setOpen(true)}>
          <SearchIcon style={{ fontSize: 30, color: "white" }} />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <div className="bg-cyan-600 py-4 text-white text-2xl font-bold text-center">
          Search Categories
        </div>
        <DialogContent className="bg-black/10">
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            placeholder="Search Categories…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm.trim() !== "" && (
            <div style={{ maxHeight: "250px", overflowY: "auto", marginTop: "10px" }}>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <motion.div
                    key={category._id}
                    whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
                    transition={{ duration: 0.1 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      transition: "background-color 0.3s ease",
                    }}
                    onClick={() => handleSelectCategory(category)}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                    />
                    <Typography>{category.name}</Typography>
                  </motion.div>
                ))
              ) : (
                <Typography style={{ padding: "10px", textAlign: "center" }}>
                  No results found
                </Typography>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchBar;
