import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RecipeDashboard({ user, token, onLogout, onShowLogin, onShowRegister }) {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [detailedRecipe, setDetailedRecipe] = useState(null);
  const [detailedLoading, setDetailedLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchFavorites();
    }
  }, [user, token]);

  const fetchFavorites = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:4000/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error('Failed to fetch favorites');
    }
  };

  const handleSuggest = async () => {
    // Check if user is logged in
    if (!user || !token) {
      toast.error('Please login to generate recipes', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      onShowLogin();
      return;
    }

    if (!ingredients.trim()) {
      toast.warning('Please enter some ingredients', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }
    
    setLoading(true);
    setError('');
    setRecipes([]);
    setSelected([]);
    setGroceryList([]);
    
    try {
      const res = await fetch('http://localhost:4000/api/recipes/suggest', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      
      if (data.recipes) {
        setRecipes(data.recipes);
        toast.success(`Found ${data.recipes.length} delicious recipes! 🍽️`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      } else {
        toast.info('No recipes found. Try different ingredients!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    } catch (err) {
      toast.error('Failed to fetch recipes. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleGroceryList = async () => {
    // Check if user is logged in
    if (!user || !token) {
      toast.error('Please login to generate grocery list', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      onShowLogin();
      return;
    }

    if (selected.length === 0) {
      toast.warning('Please select at least one recipe', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }
    
    setGroceryLoading(true);
    setGroceryList([]);
    
    try {
      const selectedRecipes = selected.map((i) => recipes[i]);
      const res = await fetch('http://localhost:4000/api/grocery-list', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipes: selectedRecipes }),
      });
      const data = await res.json();
      setGroceryList(data.groceryList || []);
      toast.success('🛒 Grocery list generated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (err) {
      toast.error('Failed to generate grocery list', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setGroceryLoading(false);
    }
  };

  const handleGenerateDetailedRecipe = async () => {
    // Check if user is logged in
    if (!user || !token) {
      toast.error('Please login to generate detailed recipe', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      onShowLogin();
      return;
    }

    if (selected.length === 0) {
      toast.warning('Please select at least one recipe', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }

    setDetailedLoading(true);
    
    try {
      const selectedRecipes = selected.map((i) => recipes[i]);
      const res = await fetch('http://localhost:4000/api/detailed-recipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipes: selectedRecipes }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate detailed recipe');
      }
      
      if (data.detailedRecipe) {
        setDetailedRecipe(data.detailedRecipe);
        toast.success('📖 Step-by-step recipe guide generated!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      } else {
        throw new Error('No recipe data received');
      }
    } catch (err) {
      console.error('Detailed recipe error:', err);
      toast.error(`Failed to generate detailed recipe: ${err.message}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setDetailedLoading(false);
    }
  };

  const handleSaveFavorite = async (recipe) => {
    // Check if user is logged in
    if (!user || !token) {
      toast.error('Please login to save favorites', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      onShowLogin();
      return;
    }

    try {
      // First, fetch detailed recipe information
      const recipeId = recipe.id || recipe.recipeId;
      
      toast.info('Fetching recipe details...', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      const detailRes = await fetch('http://localhost:4000/api/detailed-recipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipes: [{ id: recipeId, recipeId: recipeId }] }),
      });

      const detailData = await detailRes.json();
      
      // Prepare the complete recipe data with instructions
      const completeRecipe = {
        title: recipe.title,
        recipeId: recipeId,
        image: recipe.image,
        servings: detailData.detailedRecipe?.servings || '',
        prepTime: detailData.detailedRecipe?.prepTime || '',
        ingredients: detailData.detailedRecipe?.ingredients || [],
        instructions: detailData.detailedRecipe?.instructions || [],
        tips: detailData.detailedRecipe?.tips || []
      };

      // Now save to favorites with all the details
      const res = await fetch('http://localhost:4000/api/favorites', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(completeRecipe),
      });
      
      if (res.status === 201) {
        fetchFavorites();
        toast.success('✨ Recipe saved to favorites with instructions!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      } else if (res.status === 409) {
        toast.info('Recipe already in favorites', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    } catch (err) {
      console.error('Save favorite error:', err);
      toast.error('Failed to save favorite', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };

  const handleRemoveFavorite = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/favorites/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFavorites();
      toast.success('Recipe removed from favorites', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (err) {
      toast.error('Failed to remove favorite', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ToastContainer />
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🍳</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
                Recipe Generator
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user && token ? (
                <>
                  <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-slate-200">{user.name}</span>
                  </div>
                  <button 
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-rose-500/50 hover:scale-105 transition-all duration-200"
                    onClick={onLogout}
                  >
                    <span>Logout</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="px-6 py-2.5 text-blue-400 font-semibold hover:bg-slate-800 rounded-full transition-all duration-200"
                    onClick={onShowLogin}
                  >
                    Login
                  </button>
                  <button 
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200"
                    onClick={onShowRegister}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Section */}
        <section className="mb-12">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-3xl shadow-md shadow-pink-400 p-8">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">What's in your kitchen?</h2>
            <p className="text-slate-400 mb-6">
              {user ? 'Enter ingredients and discover amazing recipes ✨' : 'Login to start generating recipes 🔐'}
            </p>
            
            <div className="flex gap-4">
              <input
                type="text"
                className="flex-1 px-6 py-4 border-2 border-slate-600 rounded-2xl text-slate-100 bg-slate-900/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500 text-lg"
                placeholder="e.g., chicken, tomatoes, rice..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSuggest()}
              />
              <button 
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
                onClick={handleSuggest} 
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <span>Find Recipes</span>
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className={`mt-4 px-6 py-4 rounded-xl font-medium ${
                error.includes('✨') 
                  ? 'bg-blue-900/30 text-blue-300 border-2 border-blue-700' 
                  : 'bg-rose-900/30 text-rose-300 border-2 border-rose-700'
              }`}>
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recipes Column */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-3xl shadow-md shadow-pink-400 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <span>🍽️</span>
                Recipe Suggestions
              </h3>
              {recipes.length > 0 && (
                <span className="px-4 py-1.5 bg-blue-900/50 text-blue-300 rounded-full text-sm font-semibold border border-blue-700">
                  {recipes.length} found
                </span>
              )}
            </div>
              
            {recipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-slate-400 text-lg">No recipes yet. Start by entering your ingredients above!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {recipes.map((recipe, idx) => (
                  <div 
                    key={idx} 
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                      selected.includes(idx) 
                        ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20' 
                        : 'border-slate-600 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 bg-slate-900/50'
                    }`}
                    onClick={() => handleSelect(idx)}
                  >
                    <div className="flex gap-4">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-2 border-blue-500 text-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer bg-slate-900"
                        checked={selected.includes(idx)}
                        onChange={() => handleSelect(idx)}
                      />
                      {recipe.image && (
                        <img 
                          src={recipe.image} 
                          alt={recipe.title} 
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-100 mb-1">{recipe.title}</h4>
                        <p className="text-sm text-slate-400">Ready in {recipe.readyInMinutes || '30'} mins</p>
                      </div>
                      <button 
                        className="p-3 rounded-xl bg-blue-900/50 text-blue-400 hover:bg-blue-800/50 transition-colors border border-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveFavorite({ 
                            title: recipe.title, 
                            recipeId: recipe.id || recipe.recipeId || idx, 
                            image: recipe.image 
                          });
                        }}
                        title="Save to favorites"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
              
            {selected.length > 0 && (
              <button 
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={handleGroceryList} 
                disabled={groceryLoading}
              >
                {groceryLoading ? 'Generating...' : `Generate Grocery List (${selected.length} selected)`}
              </button>
            )}
          </div>

          {/* Grocery List Column */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-3xl shadow-md shadow-pink-400 p-8">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <span>🛒</span>
                Grocery List
              </h3>
            </div>
              
            {groceryList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-slate-400 text-lg">Select recipes and click "Generate Grocery List" to see what you need!</p>
              </div>
            ) : (
              <>
                <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {groceryList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-sky-900/30 rounded-xl border border-sky-700">
                      <span className="text-sky-400 text-xl">•</span>
                      <span className="text-slate-200 flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  onClick={handleGenerateDetailedRecipe} 
                  disabled={detailedLoading}
                >
                  {detailedLoading ? 'Generating Recipe Guide...' : '📖 Generate Step-by-Step Recipe'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Detailed Recipe Section */}
        {detailedRecipe && (
          <section className="mt-12">
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                  <span>👨‍🍳</span>
                  Step-by-Step Recipe Guide
                </h3>
                <button
                  onClick={() => setDetailedRecipe(null)}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-2"
                  title="Close"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {/* Recipe Title */}
                {detailedRecipe.title && (
                  <div>
                    <h4 className="text-2xl font-bold text-blue-400 mb-2">{detailedRecipe.title}</h4>
                    {detailedRecipe.servings && (
                      <p className="text-slate-400">Servings: {detailedRecipe.servings}</p>
                    )}
                    {detailedRecipe.prepTime && (
                      <p className="text-slate-400">Prep Time: {detailedRecipe.prepTime}</p>
                    )}
                  </div>
                )}

                {/* Ingredients Section */}
                {detailedRecipe.ingredients && detailedRecipe.ingredients.length > 0 && (
                  <div>
                    <h5 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                      <span>🥘</span>
                      Ingredients
                    </h5>
                    <ul className="space-y-2">
                      {detailedRecipe.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                          <span className="text-sky-400 mt-1">•</span>
                          <span className="text-slate-200 flex-1">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Instructions Section */}
                {detailedRecipe.instructions && detailedRecipe.instructions.length > 0 && (
                  <div>
                    <h5 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                      <span>📝</span>
                      Instructions
                    </h5>
                    <ol className="space-y-4">
                      {detailedRecipe.instructions.map((step, idx) => (
                        <li key={idx} className="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-slate-200 flex-1 pt-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Tips Section */}
                {detailedRecipe.tips && detailedRecipe.tips.length > 0 && (
                  <div>
                    <h5 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                      <span>💡</span>
                      Pro Tips
                    </h5>
                    <ul className="space-y-2">
                      {detailedRecipe.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-green-900/20 rounded-xl border border-green-700">
                          <span className="text-green-400 mt-1">✓</span>
                          <span className="text-slate-200 flex-1">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Favorites Section */}
        <section className="mt-12">
          <div 
            className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-3xl shadow-md shadow-pink-400 p-8 cursor-pointer hover:shadow-blue-500/10 hover:border-slate-600 transition-all duration-200"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">⭐</span>
                <h3 className="text-2xl font-bold text-slate-100">My Favorite Recipes</h3>
                <span className="px-4 py-1.5 bg-blue-900/50 text-blue-300 rounded-full text-sm font-semibold border border-blue-700">
                  {favorites.length}
                </span>
              </div>
              <button className="text-2xl text-slate-400 hover:text-slate-300 transition-colors">
                {showFavorites ? '▼' : '▶'}
              </button>
            </div>
          </div>
          
          {showFavorites && (
            <div className="mt-6">
              {favorites.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-12 text-center border border-slate-700">
                  <div className="text-6xl mb-4">💫</div>
                  <p className="text-slate-400 text-lg">No favorites yet. Save recipes you love!</p>
                </div>
              ) : (
                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                  {favorites.map((fav) => (
                    <div key={fav._id} className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-slate-600 transition-all duration-200 group">
                      {fav.image && (
                        <img 
                          src={fav.image} 
                          alt={fav.title} 
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                      <div className="p-5">
                        <h4 className="text-lg font-semibold text-slate-100 mb-3">{fav.title}</h4>
                        
                        {/* Show recipe details if available */}
                        {fav.instructions && fav.instructions.length > 0 && (
                          <div className="mb-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                            <p className="text-sm text-slate-400 mb-1">
                              {fav.servings && `🍽️ Servings: ${fav.servings}`}
                              {fav.prepTime && ` • ⏱️ ${fav.prepTime}`}
                            </p>
                            <p className="text-xs text-slate-500">
                              ✅ Recipe instructions saved
                            </p>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          {fav.instructions && fav.instructions.length > 0 && (
                            <button 
                              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailedRecipe({
                                  title: fav.title,
                                  servings: fav.servings,
                                  prepTime: fav.prepTime,
                                  ingredients: fav.ingredients,
                                  instructions: fav.instructions,
                                  tips: fav.tips
                                });
                              }}
                            >
                              📖 View Recipe Instructions
                            </button>
                          )}
                          
                          <button 
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-rose-500/50 hover:scale-105 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(fav._id);
                            }}
                          >
                            Remove from Favorites
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 text-slate-300 py-6 border-t-white border text-center">
        <p className="text-sm">
          Made with <span className="text-rose-400 animate-pulse">❤️</span> by{' '}
          <a 
            href="https://www.linkedin.com/in/nilexrana/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-semibold hover:text-blue-600 text-blue-400 underline transition-colors"
          >
            nileXrana
          </a>
        </p>
      </footer>
    </div>
  );
}

export default RecipeDashboard;
