const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const Favorite = require('./Favorite');

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/api/recipes/suggest', async (req, res) => {
  const { ingredients } = req.body;
  try {
    // Call Spoonacular API
    const spoonacularRes = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients,
        number: 5,
        apiKey: process.env.SPOONACULAR_API_KEY,
      },
    });
    const recipes = (spoonacularRes.data || []).map(r => ({ title: r.title, id: r.id, image: r.image }));
    res.json({ recipes });
  } catch (error) {
    console.error('Spoonacular API error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch recipes from Spoonacular API.' });
  }
});

app.post('/api/grocery-list', (req, res) => {
  const { recipes } = req.body;
  const groceryList = [
    '1x Onion',
    '2x Tomato',
    '1x Garlic',
    '500g Chicken',
    'Olive Oil',
    'Salt',
    'Pepper',
  ];
  res.json({ groceryList });
});

app.get('/', (req, res) => {
  res.send('Recipe Generator Backend Running');
});

// Get all favorites
app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await Favorite.find();
    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch favorites.' });
  }
});
// Add a favorite
app.post('/api/favorites', async (req, res) => {
  const { title, recipeId, image } = req.body;
  try {
    const favorite = new Favorite({ title, recipeId, image });
    await favorite.save();
    res.status(201).json({ favorite });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ message: 'Recipe already in favorites.' });
    } else {
      res.status(500).json({ message: 'Failed to save favorite.' });
    }
  }
});
// Remove a favorite
app.delete('/api/favorites/:id', async (req, res) => {
  try {
    await Favorite.findByIdAndDelete(req.params.id);
    res.json({ message: 'Favorite removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove favorite.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 