const fs = require("fs");
const path = require("path");
const Category = require("../models/categoryModel");

// ✅ Get all subcategories of a category
exports.getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const subCategoriesWithImages = category.subcategories.map(sub => ({
      ...sub._doc,
      image: sub.image ? `${req.protocol}://${req.get("host")}/uploads/${sub.image}` : null
    }));

    res.json(subCategoriesWithImages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get a single subcategory by ID (returning all fields)
exports.getSubCategoryById = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const subcategory = category.subcategories.id(subCategoryId);
    if (!subcategory) return res.status(404).json({ error: "Subcategory not found" });

    const subCategoryWithImage = {
      _id: subcategory._id,
      name: subcategory.name,
      description: subcategory.description,
      image: subcategory.image ? `${req.protocol}://${req.get("host")}/uploads/${subcategory.image}` : null
    };

    res.json(subCategoryWithImage);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Add a new subcategory to a category
exports.createSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !description) {
      return res.status(400).json({ error: "Name and Description are required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const newSubCategory = { name, description, image };
    category.subcategories.push(newSubCategory);
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update subcategory (now updates all fields including image)
exports.updateSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const { name, description } = req.body;
    const newImage = req.file ? req.file.filename : undefined;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const subcategory = category.subcategories.id(subCategoryId);
    if (!subcategory) return res.status(404).json({ error: "Subcategory not found" });

    // ✅ Delete old image if a new one is uploaded
    if (newImage && subcategory.image) {
      const oldImagePath = path.join(__dirname, "..", "uploads", subcategory.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    // ✅ Update all fields
    subcategory.name = name || subcategory.name;
    subcategory.description = description || subcategory.description;
    if (newImage) subcategory.image = newImage;

    await category.save();
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ error: "Error updating subcategory" });
  }
};

// ✅ Delete subcategory (including image)
exports.deleteSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const subcategory = category.subcategories.id(subCategoryId);
    if (!subcategory) return res.status(404).json({ error: "Subcategory not found" });

    // ✅ Delete image from "uploads" folder
    if (subcategory.image) {
      const imagePath = path.join(__dirname, "..", "uploads", subcategory.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    category.subcategories = category.subcategories.filter(sub => sub._id.toString() !== subCategoryId);
    await category.save();

    res.json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting subcategory" });
  }
};
