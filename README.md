# SochAurLikh - Modern Note Taking App

SochAurLikh is a modern note-taking application designed to help you capture, organize, and refine your thoughts. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it offers a seamless and intuitive user experience.

## 🚀 Features

-   **Create, Read, Update, Delete (CRUD) Notes**: Full control over your notes.
-   **Rich Text Editing**: Format your notes with ease.
-   **Tagging System**: Organize notes with custom tags.
-   **Search & Filter**: Quickly find notes by keywords or tags.
-   **Pin Important Notes**: Keep your most important notes at the top.
-   **Archive & Trash**: Manage old or unwanted notes without losing them permanently.
-   **Responsive Design**: Works beautifully on desktop and mobile devices.
-   **Secure Authentication**: User registration and login with JWT.
-   **Private Notes**: Keep your thoughts secure and accessible only to you.

## 🛠️ Tech Stack

-   **Frontend**: React.js, Tailwind CSS, Vite
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB
-   **Authentication**: JSON Web Tokens (JWT)

## 📦 Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v14 or higher)
-   MongoDB (Local or Atlas connection string)

### 1. Clone the Repository

```bash
git clone https://github.com/Swapnil3425/SochAurLikh_NoteApp.git
cd SochAurLikh_NoteApp
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your environment variables:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_secret_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
