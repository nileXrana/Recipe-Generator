# Recipe Generator - Modern Authentication & User-Specific Features

## 🚀 Major Updates

### ✨ New Features Added:
1. **User Authentication System**
   - Login & Registration pages with modern UI
   - JWT-based authentication
   - Secure password hashing with bcrypt
   - Persistent sessions

2. **User-Specific Favorites**
   - Each user has their own favorite recipes
   - Favorites are stored in MongoDB linked to user accounts
   - Add/Remove favorites functionality

3. **Modern Dashboard Design**
   - Clean, professional interface
   - Responsive design for all devices
   - Beautiful gradients and animations
   - Improved UX with loading states

4. **Enhanced Backend**
   - Protected API routes with JWT middleware
   - User model with encrypted passwords
   - Updated Favorite model with user relationships

## 📦 Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/recipe-generator
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
JWT_SECRET=your-super-secret-jwt-key
PORT=4000
```

4. Start the backend server:
```bash
node app.js
```

### Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## 🔐 Authentication Flow

1. **New Users**: Click "Sign up" to create an account
2. **Existing Users**: Login with email and password
3. **Session**: Token is stored in localStorage for persistent login
4. **Logout**: Clears session and returns to login page

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Favorite Model
```javascript
{
  userId: ObjectId (reference to User),
  title: String,
  recipeId: String,
  image: String,
  createdAt: Date
}
```

## 🎨 Design Features

- **Color Scheme**: Purple/Blue gradient theme
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Works on desktop, tablet, and mobile
- **Modern UI**: Glass-morphism effects and card-based layout
- **User-Friendly**: Intuitive navigation and clear feedback

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Recipes
- `POST /api/recipes/suggest` - Get recipe suggestions (protected)
- `POST /api/grocery-list` - Generate grocery list (protected)

### Favorites
- `GET /api/favorites` - Get user's favorites (protected)
- `POST /api/favorites` - Add favorite (protected)
- `DELETE /api/favorites/:id` - Remove favorite (protected)

## 🚀 Next Steps

Consider adding:
- Email verification
- Password reset functionality
- Recipe sharing between users
- Advanced filtering and search
- Recipe ratings and reviews
- Meal planning calendar

## 📝 Notes

- Make sure MongoDB is running before starting the backend
- Get a Spoonacular API key from https://spoonacular.com/food-api
- Change JWT_SECRET to a secure random string in production
- All favorites are now user-specific and private

Enjoy your modern Recipe Generator! 🎉
