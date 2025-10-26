import React, { useState, useEffect } from 'react';
import './RecipeDashboard.css';

function RecipeDashboard({ user, token, onLogout }) {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
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
    if (!ingredients.trim()) {
      setError('Please enter some ingredients');
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
      } else {
        setError('No recipes found. Try different ingredients!');
      }
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
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
    if (selected.length === 0) {
      setError('Please select at least one recipe');
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
    } catch (err) {
      setError('Failed to generate grocery list');
    } finally {
      setGroceryLoading(false);
    }
  };

  const handleSaveFavorite = async (recipe) => {
    try {
      const res = await fetch('http://localhost:4000/api/favorites', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recipe),
      });
      
      if (res.status === 201) {
        fetchFavorites();
        setError('Recipe saved to favorites! ✨');
        setTimeout(() => setError(''), 3000);
      } else if (res.status === 409) {
        setError('Recipe already in favorites');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to save favorite');
    }
  };

  const handleRemoveFavorite = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/favorites/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFavorites();
    } catch (err) {
      setError('Failed to remove favorite');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">🍳</span>
            <h1 className="logo-text">Recipe Generator</h1>
          </div>
          <div className="user-section">
            <div className="user-info">
              <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user.name}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <span>Logout</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Search Section */}
        <section className="search-section">
          <div className="search-card">
            <h2 className="section-title">What's in your kitchen?</h2>
            <p className="section-subtitle">Enter ingredients and discover amazing recipes</p>
            
            <div className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder="e.g., chicken, tomatoes, rice..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSuggest()}
              />
              <button className="search-btn" onClick={handleSuggest} disabled={loading}>
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <span>Find Recipes</span>
                  </>
                )}
              </button>
            </div>
            
            {error && <div className={`status-message ${error.includes('✨') ? 'success' : 'error'}`}>{error}</div>}
          </div>
        </section>

        {/* Results Grid */}
        <section className="results-section">
          <div className="results-grid">
            {/* Recipes Column */}
            <div className="results-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="title-icon">🍽️</span>
                  Recipe Suggestions
                </h3>
                {recipes.length > 0 && (
                  <span className="badge">{recipes.length} found</span>
                )}
              </div>
              
              <div className="card-content">
                {recipes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <p>No recipes yet. Start by entering your ingredients above!</p>
                  </div>
                ) : (
                  <div className="recipes-list">
                    {recipes.map((recipe, idx) => (
                      <div 
                        key={idx} 
                        className={`recipe-item ${selected.includes(idx) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="recipe-checkbox"
                          checked={selected.includes(idx)}
                          onChange={() => handleSelect(idx)}
                        />
                        {recipe.image && (
                          <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                        )}
                        <div className="recipe-info">
                          <h4 className="recipe-title">{recipe.title}</h4>
                        </div>
                        <button 
                          className="save-favorite-btn"
                          onClick={() => handleSaveFavorite({ 
                            title: recipe.title, 
                            recipeId: recipe.id || recipe.recipeId || idx, 
                            image: recipe.image 
                          })}
                          title="Save to favorites"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selected.length > 0 && (
                <button className="generate-grocery-btn" onClick={handleGroceryList} disabled={groceryLoading}>
                  {groceryLoading ? 'Generating...' : `Generate Grocery List (${selected.length} selected)`}
                </button>
              )}
            </div>

            {/* Grocery List Column */}
            <div className="results-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="title-icon">🛒</span>
                  Grocery List
                </h3>
              </div>
              
              <div className="card-content">
                {groceryList.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>Select recipes and click "Generate Grocery List" to see what you need!</p>
                  </div>
                ) : (
                  <ul className="grocery-items">
                    {groceryList.map((item, idx) => (
                      <li key={idx} className="grocery-item">
                        <span className="item-bullet">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Favorites Section */}
        <section className="favorites-section">
          <div className="favorites-header" onClick={() => setShowFavorites(!showFavorites)}>
            <h3 className="section-title">
              <span className="title-icon">⭐</span>
              My Favorite Recipes
              <span className="badge">{favorites.length}</span>
            </h3>
            <button className="toggle-btn">
              {showFavorites ? '▼' : '▶'}
            </button>
          </div>
          
          {showFavorites && (
            <div className="favorites-content">
              {favorites.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💫</div>
                  <p>No favorites yet. Save recipes you love!</p>
                </div>
              ) : (
                <div className="favorites-grid">
                  {favorites.map((fav) => (
                    <div key={fav._id} className="favorite-card">
                      {fav.image && (
                        <img src={fav.image} alt={fav.title} className="favorite-image" />
                      )}
                      <div className="favorite-info">
                        <h4 className="favorite-title">{fav.title}</h4>
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveFavorite(fav._id)}
                        >
                          Remove
                        </button>
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
      <footer className="dashboard-footer">
        Made with <span className="heart">❤️</span> by{' '}
        <a href="https://www.linkedin.com/in/nilexrana/" target="_blank" rel="noopener noreferrer">
          nileXrana
        </a>
      </footer>
    </div>
  );
}

export default RecipeDashboard;
