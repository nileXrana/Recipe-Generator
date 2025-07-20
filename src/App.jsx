import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function AnimatedConfetti() {
  return (
    <svg className="confetti-svg">
      <g>
        <circle cx="10%" cy="20%" r="8" fill="#f472b6">
          <animate attributeName="cy" values="20%;80%;20%" dur="3s" repeatCount="indefinite" />
        </circle>
        <rect x="80%" y="10%" width="10" height="10" fill="#facc15" rx="2">
          <animate attributeName="y" values="10%;70%;10%" dur="2.5s" repeatCount="indefinite" />
        </rect>
        <circle cx="50%" cy="15%" r="6" fill="#34d399">
          <animate attributeName="cy" values="15%;85%;15%" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <rect x="30%" y="80%" width="12" height="12" fill="#60a5fa" rx="3">
          <animate attributeName="y" values="80%;20%;80%" dur="3.2s" repeatCount="indefinite" />
        </rect>
        <circle cx="70%" cy="60%" r="7" fill="#a78bfa">
          <animate attributeName="cy" values="60%;10%;60%" dur="2.7s" repeatCount="indefinite" />
        </circle>
        <g>
          <circle cx="25%" cy="40%" r="2" fill="#fff" opacity="0.8">
            <animate attributeName="r" values="2;5;2" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="60%" cy="30%" r="1.5" fill="#fff" opacity="0.7">
            <animate attributeName="r" values="1.5;4;1.5" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="70%" r="2.5" fill="#fff" opacity="0.6">
            <animate attributeName="r" values="2.5;6;2.5" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.15;0.6" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>
    </svg>
  );
}

function App() {
  const [ingredients, setIngredients] = useState('');
  const [dark, setDark] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const mainRef = useRef(null);

  useEffect(() => {
    if (dark) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
  }, [dark]);

  // Load favorites on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/favorites');
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleSaveFavorite = async (recipe) => {
    try {
      const res = await fetch('http://localhost:4000/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });
      if (res.status === 201) {
        fetchFavorites();
      } else if (res.status === 409) {
        alert('Recipe already in favorites.');
      }
    } catch (err) {
      alert('Failed to save favorite.');
    }
  };

  const handleRemoveFavorite = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/favorites/${id}`, { method: 'DELETE' });
      fetchFavorites();
    } catch (err) {
      alert('Failed to remove favorite.');
    }
  };

  const handleThemeToggle = () => setDark((d) => !d);
  const handleInputChange = (e) => setIngredients(e.target.value);
  const handleSuggest = async () => {
    setLoading(true);
    setError('');
    setRecipes([]);
    setSelected([]);
    setGroceryList([]);
    try {
      console.log(ingredients)
      const res = await fetch('http://localhost:4000/api/recipes/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (data.recipes) {
        setRecipes(data.recipes);
      } else if (data.message) {
        setRecipes([{ title: data.message }]);
      } else {
        setRecipes([{ title: 'No recipes found.' }]);
      }
    } catch (err) {
      setError('Failed to fetch recipes. Is the backend running?');
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
    setGroceryLoading(true);
    setGroceryList([]);
    try {
      const selectedRecipes = selected.map((i) => recipes[i]);
      const res = await fetch('http://localhost:4000/api/grocery-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: selectedRecipes }),
      });
      const data = await res.json();
      setGroceryList(data.groceryList || []);
    } catch (err) {
      setGroceryList(['Failed to generate grocery list.']);
    } finally {
      setGroceryLoading(false);
    }
  };

  const themeBg = dark ? 'plain-dark-bg' : 'plain-bg light';
  const cardTheme = dark ? '' : ' light';

  return (
    <div className={themeBg}>
      <AnimatedConfetti />
      <button className={"theme-toggle" + (dark ? '' : ' light')} onClick={handleThemeToggle} title="Toggle dark mode">
        {dark ? '☀️' : '🌙'}
      </button>
      <div className="main-app-section">
        <div className={"input-card input-card-hero" + cardTheme}>
          <h1 className={"input-title input-title-hero" + cardTheme}>Recipe Generator</h1>
          <p className={"app-explanation" + cardTheme}>
            Welcome to Recipe Generator!Enter the ingredients you have, and instantly discover delicious recipes you can make.<br/>Save your favorite recipes, generate a smart grocery list, and plan your meals with ease.<br/>Enjoy a modern, premium cooking assistant designed to make your kitchen experience easier and more fun.
          </p>
          <input
            type="text"
            placeholder="Enter ingredients (comma separated)"
            value={ingredients}
            onChange={handleInputChange}
            className={"ingredient-input ingredient-input-hero" + cardTheme}
          />
          <button onClick={handleSuggest} className={"suggest-btn suggest-btn-hero" + cardTheme} disabled={loading}>
            {loading ? 'Loading...' : 'Suggest Recipes'}
          </button>
          {error && <p className={"error-msg" + cardTheme}>{error}</p>}
        </div>
        <div className="side-by-side-container">
          <div className={"suggestions-card suggestions-card-large" + cardTheme}>
            <h3 className={"suggestions-title suggestions-title-large" + cardTheme}>Recipe Suggestions</h3>
            {recipes.length === 0 ? (
              <p className={"no-suggestions" + cardTheme}>No suggestions yet.</p>
            ) : (
              <ul className={"suggestions-list suggestions-list-large" + cardTheme}>
                {recipes.map((r, i) => (
                  <li key={i} className={`suggestion-item suggestion-item-large${selected.includes(i) ? ' selected' : ''}${cardTheme}` }>
                    <input
                      type="checkbox"
                      checked={selected.includes(i)}
                      onChange={() => handleSelect(i)}
                    />
                    <span>{r.title}</span>
                    {/* Save Favorite Button */}
                    <button className="save-btn" style={{marginLeft: 8}} onClick={() => handleSaveFavorite({ title: r.title, recipeId: r.id || r.recipeId || i, image: r.image })}>
                      Save
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={"grocery-card grocery-card-large" + cardTheme}>
            <h3 className={"grocery-title grocery-title-large" + cardTheme}>Grocery List</h3>
            {groceryList.length === 0 ? (
              <p className={"no-grocery" + cardTheme}>No grocery list yet.</p>
            ) : (
              <ul className={"grocery-list grocery-list-large" + cardTheme}>
                {groceryList.map((item, i) => (
                  <li key={i} className={"grocery-item grocery-item-large" + cardTheme}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Favorites Section moved below both cards */}
        <div className={"input-card input-card-hero favorite-recipes-box" + cardTheme} style={{marginTop: 24}}>
          <h3 className={"suggestions-title suggestions-title-large" + cardTheme}>Favorite Recipes</h3>
          {favorites.length === 0 ? (
            <p className={"no-suggestions" + cardTheme}>No favorites yet.</p>
          ) : (
            <ul className={"suggestions-list suggestions-list-large" + cardTheme}>
              {favorites.map((fav) => (
                <li key={fav._id} className={"suggestion-item suggestion-item-large" + cardTheme}>
                  <span>{fav.title}</span>
                  <button className="save-btn" style={{marginLeft: 8}} onClick={() => handleRemoveFavorite(fav._id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <footer className="footer">
        Made with <span className="love-emoji">❤️</span> by <a href="https://www.linkedin.com/in/nilexrana/" target="_blank" rel="noopener noreferrer" className="footer-link">nileXrana</a>
      </footer>
    </div>
  );
}

export default App; 