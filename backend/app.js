const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/api/recipes/suggest', async (req, res) => {
  const { ingredients } = req.body;
  try {
    const geminiRes = await axios.post('https://api.gemini.com/recipes', {
      ingredients,
      apiKey: process.env.GEMINI_API_KEY,
    });

    const recipes = [
      { title: `Delicious ${ingredients.split(',')[0].trim()} Stir Fry` },
      { title: `Easy ${ingredients.split(',')[0].trim()} Salad` },
      { title: `Quick ${ingredients.split(',')[0].trim()} Soup` },
    ];
    res.json({ recipes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recipes from Gemini API.' });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 