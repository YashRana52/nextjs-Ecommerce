# 🎯 Multi-Vendor E-Commerce (Next.js)

A full-stack **Multi-Vendor E-commerce** application built with **Next.js** where users can browse products, create stores, sellers can manage their stores, and admins oversee approvals, coupons and subscriptions. Authentication is handled by **Clerk** and background jobs (emails, reminders, invoices) are handled with **Inngest**. Images are stored on **ImageKit** and the database uses **Postgres (Neon)**. Stripe handles payments & subscriptions.

---


## 🚀 Live Demo

🔗 [View Live](https://nextjs-ecommerce-brown-beta.vercel.app/)


---

## 🖼 Screenshots

| Home Page | Store Page | Product Page | Admin Dashboard |
|---|---|---|---|
| ![Home](./screenshots/home.png) | ![Store](./screenshots/store.png) | ![Product](./screenshots/product.png) | ![Admin](./screenshots/admin.png) |

---

## ✨ Key Features

### 👥 Buyer (User) side
- Sign up / Login via **Clerk** (Email, Phone, Social).
- Browse global product listings and filter by category, rating, price.
- View seller stores and their product catalogs.
- Add products to cart, checkout with **Stripe** (one-time payments).
- Order history and order tracking.
- Product reviews & ratings.
- Wishlist and search suggestions.

### 🏪 Seller (Vendor) side
- Register and create a **Store** with profile, banner, description.
- Upload & manage products (title, description, price, images, stock).
- Manage orders placed to their store (view, update status).
- View analytics: orders, revenue (basic).
- Subscription plans to unlock premium seller features (optional).

### 🛡️ Admin side
- Protected Admin dashboard (role-based).
- Approve / Reject newly created stores (multi-vendor approval flow).
- Manage users, vendors, products and categories.
- Create & manage discount coupons and sitewide promotions.
- View all orders and issue refunds (via Stripe).
- Manage subscription plans and billing settings.

### 🔁 Background Jobs (Inngest)
- Send email when a new store is created (admin notification).
- Send order confirmation email to buyer and seller after successful payment.
- Send shipping / reminder emails before delivery deadlines.
- Periodic reports or cleanup jobs (optional).

---

## 🧰 Tech Stack

### Frontend
- Next.js (App Router)  
- React  
- Tailwind CSS  
- Clerk (Authentication)  
- Axios / fetch for API calls  
- React Query or SWR (optional caching)  

### Backend
- Next.js API Routes / Express (if separate)  
- PostgreSQL (Neon) + Prisma  
- Inngest (background jobs & scheduling)  
- Stripe (Payments & Subscriptions)  
- ImageKit (image hosting + transformations)  
- Nodemailer (optional, for server emails)

### Deployment
- Vercel (frontend + API routes)  
- Neon (Postgres hosting)  
- ImageKit (image CDN)  
- Stripe Dashboard  
- Clerk Dashboard  

---

## 📁 Folder Structure (suggested)

```bash
multi-vendor-ecom/
├── frontend/                 # Next.js app (can be root if monorepo)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── backend/                  # optional: if using separate server
│   ├── controllers/
│   ├── routes/
│   ├── jobs/                 # inngest functions / jobs
│   └── server.js
├── prisma/                   # prisma schema & migrations
├── screenshots/
├── README.md
└── .env.example

```

---


## 🧰 Local Setup Instructions

- PostgreSQL (Neon recommended)
-Clerk keys
-Stripe keys
-ImageKit keys
-Inngest keys
-Vercel account

---

git clone https://github.com/YashRana52/your-repo.git
cd multi-vendor-ecom
cd frontend
npm install
# if backend exists
cd ../backend
npm install


Create a `.env` file in `/frontend`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_IMAGEKIT_ID=your_imagekit_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

```

Start the frontend:`http://localhost:5173`


## 👨‍💻 Author

**Yash Rana**  
🎓 IET Lucknow  
📧 yashrana2200520100072@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/yashrana52)  
💻 [GitHub](https://github.com/YashRana52)



