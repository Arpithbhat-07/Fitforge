# 🏋️ FitForge – Premium Gym Management & Website Platform

FitForge is a modern, production-ready gym management and website platform built with **React**, **FastAPI**, **MongoDB**, and **Cloudinary**. It combines a premium marketing website with a powerful CMS, enabling gym owners to manage content, trainers, memberships, classes, reservations, enquiries, media, and more—all without modifying code.

Designed with scalability, performance, and maintainability in mind, FitForge serves as a reusable foundation for building high-quality gym websites.

---

# ✨ Features

## 🌐 Public Website

* Premium responsive design
* Hero section
* About section
* Membership plans
* Trainers
* Class schedule
* Gallery
* Testimonials
* FAQ
* Contact page
* Reservation system
* Newsletter subscription
* Google Maps integration
* WhatsApp integration
* Animated statistics
* Dark / Light mode
* SEO-friendly architecture

---

## 🛠️ Admin Dashboard

* Secure authentication
* Dashboard analytics
* Hero management
* About management
* Trainer management
* Membership management
* Gallery management
* Testimonials management
* FAQ management
* Contact information management
* Reservation management
* Newsletter management
* Media Library
* Feature Flags
* Email Settings
* Website Settings
* Revision History
* Trash Management
* Live Preview
* Rich Text Editor

---

## 📷 Media Management

* Cloudinary integration
* Secure image uploads
* Drag-and-drop upload support
* Media usage detection
* Image replacement
* Bulk management
* Automatic optimization
* Automatic cleanup of unused assets

---

## 📧 Email System

Powered by **Resend**.

Supports:

* Reservation Confirmation
* Reservation Cancellation
* Contact Acknowledgement
* Membership Enquiry
* Newsletter
* Admin Notifications

Features include:

* Responsive HTML templates
* Shared layout components
* Dynamic branding
* Email previews
* Test email functionality

---

## 📊 Analytics

Dashboard includes:

* Reservation trends
* Membership enquiries
* Newsletter subscriptions
* Trainer popularity
* Class popularity
* Visitor statistics
* Dynamic charts

---

## 🎯 CMS Features

Everything is editable without touching code.

Manage:

* Hero
* About
* Gallery
* Trainers
* Membership Plans
* Classes
* Testimonials
* FAQ
* Footer
* Contact Information
* Social Links
* SEO
* Analytics Settings
* Website Settings
* Email Settings
* Feature Flags

---

## 🔐 Security

* JWT Authentication
* Password hashing
* Protected Admin Routes
* Cloudinary secure uploads
* Input validation
* HTML sanitization
* Global API error handling
* Standardized API responses

---

# 🏗️ Tech Stack

### Frontend

* React
* React Router
* Tailwind CSS
* Axios
* React Hook Form
* React Query
* Recharts
* Framer Motion

### Backend

* FastAPI
* MongoDB
* Pydantic
* JWT Authentication

### Media

* Cloudinary

### Email

* Resend

### Deployment

* Vercel
* Render
* MongoDB Atlas

---

# 📁 Project Structure

```text
FitForge/
│
├── backend/
│   ├── routes/
│   ├── templates/
│   ├── models.py
│   ├── server.py
│   ├── mail.py
│   ├── responses.py
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── memory/
│
├── README.md
└── .gitignore
```

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/fitforge.git
cd fitforge
```

---

## 2. Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file based on `.env.example`.

Start the backend:

```bash
uvicorn server:app --reload
```

---

## 3. Frontend Setup

```bash
cd frontend

npm install

npm start
```

---

# ⚙️ Environment Variables

## Backend

```env
MONGO_URL=

DB_NAME=

JWT_SECRET=

CORS_ORIGINS=

ADMIN_EMAIL=
ADMIN_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=

EMAIL_FROM=

EMAIL_REPLY_TO=
```

---

## Frontend

```env
REACT_APP_BACKEND_URL=
```

---

# 📡 API

The backend follows a standardized response format.

### Success

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Reservation not found",
  "error": "NOT_FOUND"
}
```

---

# 📸 Media Storage

FitForge uses **Cloudinary** for media storage.

Features include:

* Automatic optimization
* Secure URLs
* Folder organization
* Automatic cleanup
* Image replacement
* Responsive delivery

---

# 📬 Email Delivery

FitForge uses **Resend** for transactional emails.

Features:

* HTML templates
* Dynamic branding
* Shared layouts
* Test emails
* Admin notifications
* Customer confirmations

---

# 🎨 Design Goals

* Premium UI/UX
* Mobile-first
* Fully responsive
* Fast performance
* SEO optimized
* Accessibility focused
* Modular architecture
* Easy customization

---

# 🔮 Roadmap

Future enhancements include:

* Multi-branch support
* Multi-language support
* Payment gateway integration
* QR-based attendance
* Trainer mobile portal
* Workout tracking
* Diet plans
* Push notifications
* Progressive Web App (PWA)

---

# 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Arpith Bhat**

GitHub: https://github.com/Arpithbhat-07

---

If you find this project useful, consider giving it a ⭐ on GitHub!
