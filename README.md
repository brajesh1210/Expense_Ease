# ExpenseEase

ExpenseEase is a full-stack personal finance application designed to help users track expenses, manage budgets, and visualize spending habits through an intuitive dashboard. It features a modern React frontend and a robust Node.js/Express backend integrated with Supabase for authentication and data storage.

## 🚀 Tech Stack

### Frontend

* **Framework**: React (v19) with Vite
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM (v7)
* **State/Data**: Axios, Supabase Client
* **Visualization**: Recharts
* **Icons**: Lucide React
* **Notifications**: React Hot Toast

### Backend

* **Runtime**: Node.js
* **Framework**: Express.js
* **Authentication & Database**: Supabase
* **Middleware**: CORS, Dotenv

---

## ✨ Features

* **User Authentication**: Secure login and session management using Supabase Auth.
* **Dashboard**: Real-time overview of your financial health.
* **Expense Tracking**: Add, update, and delete expense records.
* **Analytics**: Visual charts and graphs to analyze spending patterns.
* **Transaction History**: Detailed list of past transactions.
* **Budget Management**: Set and manage budgets for specific categories.
* **Profile Management**: Manage user profile details.
* **Responsive Design**: Built with Tailwind CSS for mobile and desktop compatibility.

---

## 🛠️ Installation & Setup

### Prerequisites

* Node.js installed on your machine.
* A [Supabase](https://supabase.com/) project set up (for URL and Keys).

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense_ease

```

### 2. Backend Setup

Navigate to the backend directory and install dependencies.

```bash
cd backend
npm install

```

Create a `.env` file in the `backend` root and add the following variables:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

```

Start the backend server:

```bash
# Development mode
npm run dev

# Production mode
npm start

```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies.

```bash
cd frontend
npm install

```

Create a `.env` file (or `.env.local`) in the `frontend` root and add the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

```

Start the frontend development server:

```bash
npm run dev

```

---

## 📂 Project Structure

```
expense_ease/
├── backend/
│   ├── src/
│   │   ├── config/         # Supabase configuration
│   │   ├── controllers/    # Logic for expenses and profiles
│   │   ├── middleware/     # Auth middleware
│   │   └── routes/         # API routes (auth, expense, profile)
│   ├── server.js           # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/            # Axios and Supabase instances
    │   ├── components/     # Reusable UI components (Navbar, etc.)
    │   ├── context/        # Auth and Expense contexts
    │   ├── pages/          # Main views (Dashboard, Login, Analytics, etc.)
    │   ├── utils/          # Helpers and categories
    │   ├── App.jsx         # Main application component with routes
    │   └── main.jsx        # React DOM entry point
    └── package.json

```

---

## 🔗 API Endpoints

The backend exposes the following RESTful API endpoints:

**Authentication**

* `POST /api/auth/verify` - Verify user token.

**Expenses**

* `GET /api/expenses` - Retrieve all expenses.
* `POST /api/expenses` - Create a new expense.
* `PUT /api/expenses/:id` - Update an expense.
* `DELETE /api/expenses/:id` - Delete an expense.
* `DELETE /api/expenses` - Delete all expenses.

**Budgets**

* `GET /api/category-budgets` - Get budgets for categories.
* `POST /api/category-budgets` - Update category budget.

**Profile**

* `GET /api/profile` - Get user profile.
* `PUT /api/profile` - Update user profile.

---

## 📜 License

This project is licensed under the **ISC License**.
