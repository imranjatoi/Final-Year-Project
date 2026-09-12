# 🌿 Baghban – A Verified Plant Marketplace

**Pakistan's first dedicated, verified plant marketplace with smart delivery & plant care system.**

Built as a Final Year Design Project (FYDP) at FCIT, University of the Punjab, Lahore.

---

## 📋 Tech Stack

| Layer       | Technology                         |
|-------------|-------------------------------------|
| Frontend    | HTML5, CSS3, Bootstrap 5, jQuery    |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB + Mongoose ODM              |
| Auth        | Express-Session + bcryptjs          |
| Email       | Nodemailer (SMTP)                   |
| Scheduler   | node-cron (daily care reminders)    |
| File Upload | Multer                              |
| Template    | EJS (Embedded JavaScript)           |

---

## 🚀 Quick Setup (5 Steps)

### 1. Prerequisites
- Node.js v18+ installed
- MongoDB running locally OR MongoDB Atlas URI

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Edit `.env` file:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/baghban
SESSION_SECRET=baghban_super_secret_key_2025
JWT_SECRET=baghban_jwt_secret_2025
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Seed the database
```bash
npm run seed
```

### 5. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔑 Default Login Credentials (after seeding)

| Role   | Email                   | Password    |
|--------|-------------------------|-------------|
| Admin  | admin@baghban.pk        | admin123    |
| Seller | ahmed@baghban.pk        | seller123   |
| Seller | sara@baghban.pk         | seller123   |
| Seller | usman@baghban.pk        | seller123   |
| Buyer  | zara@example.com        | buyer123    |
| Buyer  | haris@example.com       | buyer123    |
| Buyer  | nadia@example.com       | buyer123    |

---

## 📁 Project Structure

```
baghban/
├── app.js                    ← Main server entry point
├── .env                      ← Environment variables
├── package.json
│
├── models/
│   ├── User.js               ← Buyer, Seller, Admin (role-based)
│   ├── PlantListing.js       ← Plant products
│   ├── Order.js              ← Order lifecycle
│   ├── Review.js             ← 3-category review system
│   └── PlantCareEntry.js     ← Care tracker with virtuals
│
├── controllers/
│   ├── authController.js     ← Register, Login, Profile
│   ├── plantController.js    ← Home, Browse, Detail
│   ├── orderController.js    ← Place, Track, Cancel orders
│   ├── reviewController.js   ← Submit & view reviews
│   ├── careController.js     ← Care tracker + cron reminders
│   ├── sellerController.js   ← Seller dashboard & listings
│   └── adminController.js    ← Admin panel & verification
│
├── routes/
│   ├── index.js, auth.js, plants.js
│   ├── orders.js, reviews.js, care.js
│   ├── seller.js, admin.js
│
├── middleware/
│   ├── auth.js               ← isLoggedIn, isBuyer, isSeller, isAdmin
│   └── upload.js             ← Multer image upload config
│
├── config/
│   └── email.js              ← Nodemailer email templates
│
├── views/                    ← EJS templates
│   ├── partials/             ← header.ejs, footer.ejs
│   ├── auth/                 ← login, register, profile
│   ├── plants/               ← browse, detail
│   ├── buyer/                ← orders, care tracker
│   ├── seller/               ← dashboard, listings, orders
│   ├── admin/                ← dashboard, sellers, listings
│   ├── orders/, reviews/
│   └── index.ejs, 404.ejs, error.ejs
│
├── public/
│   ├── css/style.css         ← Complete green-theme stylesheet
│   ├── js/main.js            ← Frontend JavaScript
│   └── images/plants/        ← All plant images
│
└── seeds/
    └── seeder.js             ← Database seeder with sample data
```

---

## ✅ Features Implemented

### Buyer Features
- Register & login as buyer
- Browse plants with search, filter by city/category/price/care level
- View plant details with seller info and reviews
- Place orders with quantity and delivery options
- Track order status (Placed → Confirmed → Dispatched → Delivered)
- Cancel orders (before dispatch)
- Write 3-category reviews (seller, plant condition, packaging)
- Plant care tracker with watering reminders
- Profile management

### Seller Features
- Register & await admin verification
- Seller dashboard with revenue stats
- Create, edit, delete plant listings (with multiple images)
- Manage incoming orders (confirm/reject/dispatch/mark delivered)
- View customer reviews
- Location-based listing (city-specific)

### Admin Features
- Admin dashboard with platform stats
- Review and approve/reject seller applications
- Suspend/activate user accounts
- View all listings, orders, users
- Delete inappropriate listings

### System Features
- Verified seller badge system
- Location-based seller filtering
- Daily plant care email reminders (via cron at 8 AM)
- Password hashing with bcryptjs
- Session-based authentication
- Role-based access control
- Flash messages for all actions
- Image upload via Multer
- Responsive mobile-first design

---

## 🎨 Color Theme

| Color         | Hex       | Usage                        |
|---------------|-----------|------------------------------|
| Green Dark    | #1B5E20   | Navbar, headings, sidebar    |
| Green Main    | #2E7D32   | Buttons, badges, accents     |
| Green Light   | #4CAF50   | Hover states, progress bars  |
| Green Pale    | #C8E6C9   | Backgrounds, borders         |
| Accent Amber  | #FF8F00   | CTAs, milestones, highlights |

---

## 👥 Team

| Member      | Role                                |
|-------------|-------------------------------------|
| M Imran     | Frontend Development                |
| Rahim Ullah | Backend Development                 |
| Marvez Khan | Testing & Documentation             |

**Supervisor:** Prof. Dr. Engr. Waqar Ahmed
**Institution:** FCIT, University of the Punjab, Lahore

---

## 📝 Notes

- Email sending requires valid SMTP credentials. For testing, use Mailtrap or Gmail App Password.
- If MongoDB Atlas is used, replace `MONGO_URI` in `.env` with your Atlas connection string.
- Images in `/public/images/plants/` are SVG placeholders. Replace with real JPG photos for production.
- The `npm run seed` command clears all existing data before seeding.
