# 🚀 StudyCraft – Productivity & Learning Platform

StudyCraft is a secure, full-stack web application designed to help students manage their academic workflow efficiently. It combines scheduling, task management, and advanced computational tools into a single, scalable platform.

Built with a strong focus on **security, performance, and real-world usability**.

---

## ✨ Key Features

- 🔐 **Secure Authentication**
  - JWT-based authentication with access & refresh tokens
  - Password hashing using bcrypt
  - Account lockout after multiple failed login attempts  

- 📅 **Smart Class Scheduler**
  - Detects time conflicts automatically  
  - Prevents duplicate entries  
  - Supports recurring schedules  

- ✅ **Task & Reminder Management**
  - Create and manage deadlines efficiently  
  - Get timely notifications  

- 📊 **Interactive Dashboard**
  - Today's classes overview  
  - Upcoming tasks  
  - Notifications & usage insights  

- 🔔 **Real-Time Notifications**
  - Browser notifications using Service Workers  
  - Supports push notifications (VAPID-based)  

- 🧮 **Advanced Mathematical Utilities**
  - Fast Modular Exponentiation  
  - Extended Euclidean Algorithm  
  - Miller–Rabin Primality Test  
  - Matrix & Scientific Calculators (safe implementation, no `eval()`)

- 🖼 **Secure Profile Management**
  - Image upload via Cloudinary  
  - Input validation and sanitization  

---

## 🛡 Security Highlights

- Helmet with Content Security Policy (CSP)
- Secure JWT cookies (no localStorage usage)
- CSRF protection using `csurf`
- Rate limiting (global + authentication routes)
- Input validation & sanitization:
  - express-validator  
  - express-mongo-sanitize  
  - hpp  
- Strict CORS policy  
- Centralized error handling  
- No sensitive data stored in source code  

---

## 📸 Screenshots

<img width="1901" height="960" alt="image" src="https://github.com/user-attachments/assets/2e38dfaa-19a2-4fcf-a205-1ee755446748" />

<img width="1824" height="866" alt="image" src="https://github.com/user-attachments/assets/a1a57a56-61ea-415a-b793-8a01f1f18147" />
<img width="1822" height="888" alt="image" src="https://github.com/user-attachments/assets/d38645f8-20b6-45d6-b3de-6d93ed41d2b5" />
<img width="1836" height="887" alt="image" src="https://github.com/user-attachments/assets/76f36cdb-2749-4409-870f-ab70ef4d83b0" />
<img width="1837" height="895" alt="image" src="https://github.com/user-attachments/assets/31e1aa25-1be5-4f89-a0fe-cd71c421eef3" />




## 🛠 Tech Stack

- **Frontend:** EJS, HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT, bcrypt  
- **Cloud Storage:** Cloudinary  

---

## 📂 Project Structure
src/ → Backend (routes, controllers, middleware, models)
views/ → EJS templates
public/ → Static assets (CSS, JS, service worker)
docs/API.md → API documentation

## 🌐 Live Demo

👉 https://studycraft-zwp6.onrender.com/  

---

## ⚙️ Installation & Setup

1. Clone the repository  
```bash
git clone https://github.com/yourusername/studycraft.git
2.Navigate to the project directory
cd studycraft
3.Install dependencies

npm install

4.Create .env file

5.copy .env.production.example .env

6.Add required environment variables:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_URL=your_cloudinary_config

7.npm run dev

🧑‍💻 Usage Guide

1.Sign up at /signup

2.Login via /login

3.Add classes in /scheduler

4.Manage tasks in /tasks

5.View dashboard insights at /dashboard

6.Use /calculator for utilities

🙌 Author

Mahendra Harijan
🔗 GitHub: https://github.com/mahendra-harijan

🔗 LinkedIn: https://linkedin.com/in/mahendra-harijan

🔗 portfolio: https://mahendraharijan.me


