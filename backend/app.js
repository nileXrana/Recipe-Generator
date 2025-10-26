const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const Favorite = require('./Favorite');
const User = require('./User');

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = new User({ name, email, password });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

// RECIPE ROUTES
app.post('/api/recipes/suggest', authenticateToken, async (req, res) => {
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

app.post('/api/grocery-list', authenticateToken, async (req, res) => {
  const { recipes } = req.body;
  
  if (!recipes || recipes.length === 0) {
    return res.json({ groceryList: [] });
  }

  try {
    // Extract recipe IDs
    const recipeIds = recipes.map(r => r.id || r.recipeId).filter(id => id);
    
    if (recipeIds.length === 0) {
      return res.json({ groceryList: ['No valid recipe IDs provided'] });
    }

    // Fetch ingredients for each recipe from Spoonacular
    const ingredientPromises = recipeIds.map(async (id) => {
      try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
          params: {
            apiKey: process.env.SPOONACULAR_API_KEY,
            includeNutrition: false,
          },
        });
        return response.data.extendedIngredients || [];
      } catch (error) {
        console.error(`Failed to fetch ingredients for recipe ${id}:`, error.message);
        return [];
      }
    });

    const allIngredients = await Promise.all(ingredientPromises);
    
    // Flatten and combine ingredients
    const ingredientMap = {};
    allIngredients.flat().forEach(ing => {
      const name = ing.name || ing.original;
      if (name) {
        if (ingredientMap[name]) {
          // Combine quantities if same ingredient
          ingredientMap[name].amount += ing.amount || 0;
        } else {
          ingredientMap[name] = {
            amount: ing.amount || 0,
            unit: ing.unit || '',
            original: ing.original || name
          };
        }
      }
    });

    // Format grocery list
    const groceryList = Object.values(ingredientMap).map(ing => {
      // Just return the original string which already has amount and unit formatted nicely
      return ing.original;
    });

    res.json({ groceryList: groceryList.length > 0 ? groceryList : ['No ingredients found'] });
  } catch (error) {
    console.error('Grocery list error:', error.message);
    res.status(500).json({ groceryList: ['Failed to generate grocery list'] });
  }
});

// DETAILED RECIPE ENDPOINT
app.post('/api/detailed-recipe', authenticateToken, async (req, res) => {
  const { recipes } = req.body;
  
  if (!recipes || recipes.length === 0) {
    return res.json({ detailedRecipe: null });
  }

  try {
    // Use the first selected recipe for detailed instructions
    const recipeId = recipes[0].id || recipes[0].recipeId;
    
    if (!recipeId) {
      return res.status(400).json({ message: 'No valid recipe ID provided' });
    }

    // Fetch detailed recipe information from Spoonacular
    const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        includeNutrition: false,
      },
    });

    const recipe = response.data;

    // Parse instructions
    let instructions = [];
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      instructions = recipe.analyzedInstructions[0].steps.map(step => step.step);
    } else if (recipe.instructions) {
      // Fallback: parse HTML or plain text instructions
      const cleanInstructions = recipe.instructions
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .split(/\d+\.\s+/) // Split by numbered steps
        .filter(step => step.trim().length > 0);
      instructions = cleanInstructions;
    }

    // Format ingredients
    const ingredients = recipe.extendedIngredients.map(ing => ing.original);

    // Create detailed recipe object
    const detailedRecipe = {
      title: recipe.title,
      servings: recipe.servings,
      prepTime: recipe.readyInMinutes ? `${recipe.readyInMinutes} minutes` : 'N/A',
      ingredients: ingredients,
      instructions: instructions.length > 0 ? instructions : ['No step-by-step instructions available for this recipe.'],
      tips: [
        'Read through all the steps before starting.',
        'Prep all ingredients before you begin cooking.',
        'Keep your workspace clean and organized.',
        'Taste as you go and adjust seasonings to your preference.'
      ]
    };

    res.json({ detailedRecipe });
  } catch (error) {
    console.error('Detailed recipe error:', error.message);
    console.error('Error details:', error.response ? error.response.data : error);
    
    if (error.response && error.response.status === 402) {
      return res.status(402).json({ message: 'Spoonacular API quota exceeded. Please try again later.' });
    }
    
    res.status(500).json({ 
      message: 'Failed to generate detailed recipe', 
      error: error.message 
    });
  }
});

app.get('/', (req, res) => {
  res.send('Recipe Generator Backend Running');
});

// FAVORITES ROUTES (User-specific)
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch favorites.' });
  }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
  const { title, recipeId, image, servings, prepTime, ingredients, instructions, tips } = req.body;
  try {
    const favorite = new Favorite({ 
      userId: req.user.userId,
      title, 
      recipeId, 
      image,
      servings,
      prepTime,
      ingredients: ingredients || [],
      instructions: instructions || [],
      tips: tips || []
    });
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

app.delete('/api/favorites/:id', authenticateToken, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    res.json({ message: 'Favorite removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove favorite.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 