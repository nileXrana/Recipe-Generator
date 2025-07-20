# 🍽️ Recipe Generator

Welcome to **Recipe Generator**! This project helps you generate delicious recipes using AI and a curated ingredient database. It features a modern frontend and a robust backend, making it easy to discover new meals and cooking ideas for you.

---

## 🚀 Features
- Generate unique recipes with AI
- Search and filter by ingredients
- Save your favorite recipes
- Responsive and modern UI
- Fast and secure backend

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **AI Integration:** SPOONACULAR API

---

## 📦 Project Structure
```
Recipe-Generator/
  backend/    # Express backend (API, DB, AI integration)
  frontend/   # React frontend (UI, assets, styles)
  README.md   # Project documentation
  ...         # Showcase files (see below)
```

---

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/nileXrana/Recipe-Generator.git
cd Recipe-Generator
```

### 2. Setup Environment Variables
Create a `.env` file in the `backend/` directory:
```
MONGO_URI=your_mongodb_connection_string
SPOONACULAR_API_KEY=your_spoonacular_api_key
PORT=4000
```

### 3. Install Dependencies
#### Backend
```bash
cd backend
npm install
```
#### Frontend
```bash
cd ../frontend
npm install
```

### 4. Run the App
#### Start Backend
```bash
cd backend
npm start
```
#### Start Frontend
```bash
cd ../frontend
npm run dev
```

---

## 📸 Screenshots
> _Add screenshots or GIFs here to showcase your app!_

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
[MIT](LICENSE)
