const mongoose = require("mongoose");
const SubCategorySchema = require("./subCategoryModel");

const CategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  subcategories: [SubCategorySchema], // Store subcategories inside category
});

module.exports = mongoose.model("Category", CategorySchema);
