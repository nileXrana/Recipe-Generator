const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  recipeId: { type: Number, required: true, unique: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Favorite', FavoriteSchema); 