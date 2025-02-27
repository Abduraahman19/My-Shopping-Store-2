const express = require("express");
const multer = require("multer");
const path = require("path");
const { 
    getSubCategories, 
    getSubCategoryById, 
    createSubCategory, 
    updateSubCategory, 
    deleteSubCategory 
} = require("../controllers/subCategoryController");

const router = express.Router();

// ✅ Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure "uploads" folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

// ✅ Routes
router.get("/categories/:categoryId/subcategories", getSubCategories);
router.get("/categories/:categoryId/subcategories/:subCategoryId", getSubCategoryById); // ✅ Get subcategory by ID route added
router.post("/categories/:categoryId/subcategories", upload.single("image"), createSubCategory);
router.put("/categories/:categoryId/subcategories/:subCategoryId", upload.single("image"), updateSubCategory);
router.delete("/categories/:categoryId/subcategories/:subCategoryId", deleteSubCategory);

module.exports = router;
