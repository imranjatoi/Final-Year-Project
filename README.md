# Baghban - Verified Plant Marketplace

Final Year Project (FYP) developed using Node.js, Express.js, MongoDB, and EJS.

Baghban is a web-based marketplace designed for buying and selling plants across Pakistan. The platform connects plant nurseries and individual sellers with plant lovers, featuring a verification system, order management, and plant care reminders.

---

## Live Demo & Repository
- **Live Web Application:** [https://final-year-project-gamma-five.vercel.app](https://final-year-project-gamma-five.vercel.app)
- **GitHub Repository:** [https://github.com/imranjatoi/Final-Year-Project](https://github.com/imranjatoi/Final-Year-Project)

---

## Test Accounts (Demo Credentials)

For testing and evaluation purposes, the following accounts are pre-configured:

### 1. Admin Account
- **Email:** `admin@baghban.pk`
- **Password:** `admin123`
- **Access:** Manage users, verify/reject sellers, manage listings, view all orders.

### 2. Seller Account
- **Email:** `ahmed@baghban.pk`
- **Password:** `seller123`
- **Access:** Add/edit plant listings, manage inventory, process incoming orders.

### 3. Buyer Account
- **Email:** `zara@example.com`
- **Password:** `buyer123`
- **Access:** Browse plants, filter by category/city, place orders, write reviews, mark orders received, plant care schedule.

---

## Key Features

- **User Roles:** Distinct dashboards for Admin, Seller, and Buyer.
- **Seller Verification:** Admins review seller credentials before listings go live.
- **Plant Catalog:** Filter by category (Indoor, Outdoor, Flowering, Succulents), sunlight, and watering needs.
- **Order Management:** Complete order lifecycle (Placed -> Confirmed -> Dispatched -> Delivered/Received by Buyer).
- **Plant Care Routine:** Personalized reminders and care logs for purchased plants.
- **Security:** Password hashing with bcrypt, session authentication with MongoDB store, and protected routes.

---

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (MongoDB Atlas) with Mongoose
- **Frontend / Templates:** EJS (Embedded JavaScript), HTML5, CSS3, Bootstrap 5
- **Authentication:** Express-Session with connect-mongo, BcryptJS
- **Deployment:** Vercel

---

## Local Setup Instructions

If you want to run this project on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/imranjatoi/Final-Year-Project.git
   cd Final-Year-Project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_secret_key
   ```

4. **Seed the database (Optional for demo data):**
   ```bash
   node seeds/seeder.js
   ```

5. **Start the application:**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.
