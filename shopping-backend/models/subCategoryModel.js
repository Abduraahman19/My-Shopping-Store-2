const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String, // Store image filename
});

module.exports = SubCategorySchema;
