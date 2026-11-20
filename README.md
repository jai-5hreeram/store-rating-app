
# StoreRate – Store Rating Web Application

StoreRate is a web application that allows users to explore registered stores and submit ratings based on their experience.

The application provides a single login system with three different roles: System Administrator, Normal User and Store Owner.

## Technologies Used

- Frontend: React.js
- Backend: Node.js and Express.js
- Database: MySQL
- API Communication: Axios
- Authentication: JSON Web Token (JWT)
- Password Security: bcryptjs
- Development Tools: VS Code, MySQL Workbench and Git

## Features

### System Administrator
- View total users, stores and submitted ratings.
- Add new users, administrators and store owners.
- Register stores and assign store owners.
- View and search registered users and stores.
- Filter listings by available fields.
- Sort listings in ascending or descending order.
- View individual user details.

### Normal User
- Register and log in.
- View all registered stores.
- Search stores by name and address.
- View overall store ratings.
- Submit ratings between 1 and 5.
- Update previously submitted ratings.
- Change password.

### Store Owner
- Log in to the platform.
- View the store's average rating.
- View the total number of submitted ratings.
- View users who have rated the store.
- Change password.

## Project Structure

```text
store-rating-app/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd store-rating-app
```

### 2. Set up the database

- Open MySQL Workbench.
- Execute the SQL file at `database/schema.sql`.
- This creates the `store_rating_db` database and its tables.

### 3. Configure the backend

Open the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Add your local MySQL credentials and a private JWT secret.

### 4. Create the first administrator

From the backend folder, run:

```bash
node scripts/createAdmin.js
```

Enter the administrator details when prompted.

### 5. Start the backend

```bash
npm run dev
```

The backend runs at:

http://localhost:5000

### 6. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file using the frontend `.env.example` file.

### 7. Start the frontend

```bash
npm run dev
```

The frontend runs at:

http://localhost:5173

## Form Validations

- Name: Minimum 20 and maximum 60 characters.
- Address: Maximum 400 characters.
- Password: 8–16 characters, with at least one uppercase letter and one special character.
- Email: Must follow standard email format.
- Rating: Whole number between 1 and 5.

## Authentication and Security

- Passwords are hashed before being stored.
- JWT is used for authentication.
- Backend routes enforce role-based access.
- SQL queries use parameterized inputs for user-supplied values.
- Environment variables are used for sensitive configuration.

## Author

Developed as a Full Stack Web Development Coding Challenge project.
