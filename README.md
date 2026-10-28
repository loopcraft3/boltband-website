# Bolt & Bond

An industrial hardware supply store where customers browse products by category, build a quote list, and send a quote request. A password-protected admin dashboard lets staff manage products and follow up on requests.

**Live demo:** https://boltband-website-msar.vercel.app
**Admin panel:** https://boltband-website-msar.vercel.app/admin (login required)

![Home Page](image-1.png)
![Products](image.png)

## Features

**Storefront**
- Seven numbered product categories (Fasteners, Hand Tools, Power Tools, Electrical, Plumbing, Adhesives & Chemical Sealants, Safety & PPE)
- Live search across product name, brand and type
- Stock status on every product (in stock, low stock, out of stock)
- Quote list that is saved in the browser and survives a page refresh
- Quote request form with server-side validation and a reference number on success
- Responsive layout, with a scrollable category strip on mobile

**Admin dashboard**
- JWT-based login with bcrypt-hashed passwords
- View quote requests and mark them New, Contacted or Closed
- Add products, edit price and stock, and delete products

**Backend**
- REST API built with Express
- MongoDB (Atlas) with Mongoose models for categories, products, quotes and users
- Quote validation checks that products exist and that the requested quantity is in stock
- Protected admin routes using a Bearer token

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, plain CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Auth | JSON Web Tokens, bcryptjs |
| Hosting | Vercel (two projects: client and server) |

## Project structure

```
boltbond/
├── client/                 Next.js app
│   └── app/
│       ├── page.js         Storefront and quote drawer
│       ├── admin/page.js   Admin login and dashboard
│       ├── layout.js
│       └── globals.css
├── server/                 Express API
│   ├── index.js            Routes (public, auth, admin)
│   ├── models.js           Mongoose models
│   ├── db.js               Cached MongoDB connection (serverless-friendly)
│   ├── data.js             Sample categories and products
│   ├── seed.js             Loads sample data and creates the admin user
│   └── vercel.json
└── package.json            Root scripts
```

## Run locally

**Prerequisites:** Node.js 18+, a free MongoDB Atlas cluster.

1. Clone the repo and install everything:
   ```bash
   git clone https://github.com/loopcraft3/boltbond.git
   cd boltbond
   npm run install:all
   ```
2. Create `server/.env` (copy from `server/.env.example`):
   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/boltbond?retryWrites=true&w=majority
   JWT_SECRET=a-long-random-string
   ADMIN_EMAIL=you@example.com
   ADMIN_PASSWORD=choose-a-password
   ```
3. In Atlas, add `0.0.0.0/0` to the IP Access List (needed for Vercel as well).
4. Load the sample data and create the admin user:
   ```bash
   npm run seed --prefix server
   ```
5. Start both apps:
   ```bash
   npm run dev
   ```
   - Shop: http://localhost:3000
   - Admin: http://localhost:3000/admin
   - API: http://localhost:5000

## API overview

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/categories` | Public | Categories with product counts |
| GET | `/api/products` | Public | Products (`?category=` and `?q=` filters) |
| POST | `/api/quotes` | Public | Submit a quote request |
| POST | `/api/auth/login` | Public | Admin login, returns a JWT |
| GET | `/api/admin/quotes` | Admin | List quote requests |
| PATCH | `/api/admin/quotes/:id` | Admin | Update quote status |
| POST | `/api/admin/products` | Admin | Create a product |
| PUT | `/api/admin/products/:id` | Admin | Update a product |
| DELETE | `/api/admin/products/:id` | Admin | Delete a product |

## Deployment (Vercel)

Deploy the same repo as two separate Vercel projects.

1. **Server:** Root Directory `server`, Framework Preset *Other*. Environment variables: `MONGODB_URI`, `JWT_SECRET`.
2. **Client:** Root Directory `client`, Framework Preset *Next.js*. Environment variable: `API_URL` set to the server's URL (no trailing slash).

The client proxies `/api/*` requests to the server using a rewrite in `client/next.config.mjs`.

## Roadmap

- Product images and detail pages
- Login rate limiting and password change screen
- Email or WhatsApp notification when a quote arrives
- Pagination for large product lists

## Author

Built by Shrushti waghmare as part of an internship task.