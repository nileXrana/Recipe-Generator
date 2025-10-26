const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  recipeId: { type: String, required: true },
  image: { type: String },
  servings: { type: String },
  prepTime: { type: String },
  ingredients: [{ type: String }],
  instructions: [{ type: String }],
  tips: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// Compound index to ensure a user can't save the same recipe twice
favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema); 