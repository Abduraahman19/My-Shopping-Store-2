const fs = require("fs");
const path = require("path");
const Category = require("../models/categoryModel");

// ✅ Get all categories (including full image URLs)
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        const categoriesWithImages = categories.map(category => ({
            ...category._doc,
            image: category.image ? `${req.protocol}://${req.get("host")}/uploads/${category.image}` : null
        }));

        res.json(categoriesWithImages);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get category by ID (including all fields)
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Return full category data with image URL
        const categoryWithImage = {
            _id: category._id,
            name: category.name,
            description: category.description,
            image: category.image ? `${req.protocol}://${req.get("host")}/uploads/${category.image}` : null,
            subcategories: category.subcategories // ✅ Subcategories bhi return kar raha hai
        };

        res.json(categoryWithImage);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!name || !description) {
            return res.status(400).json({ error: "Name and Description are required" });
        }

        const newCategory = new Category({ name, description, image });
        await newCategory.save();

        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Update category (now updates all fields including image)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const newImage = req.file ? req.file.filename : undefined;

        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ error: "Category not found" });

        // ✅ Delete old image if a new one is uploaded
        if (newImage && category.image) {
            const oldImagePath = path.join(__dirname, "..", "uploads", category.image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        // ✅ Update all fields
        category.name = name || category.name;
        category.description = description || category.description;
        if (newImage) category.image = newImage;

        await category.save();
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Error updating category" });
    }
};

// ✅ Delete category (including image)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        // ✅ Delete image from "uploads" folder
        if (category.image) {
            const imagePath = path.join(__dirname, "..", "uploads", category.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await Category.findByIdAndDelete(id);
        res.json({ message: "Category and image deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting category" });
    }
};
