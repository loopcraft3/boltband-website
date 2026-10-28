# Bolt & Bond (Next.js + Express + MongoDB)

## Local
1. Create a free MongoDB Atlas cluster, get the connection string.
2. `cp server/.env.example server/.env` and fill it in.
3. `npm run install:all`
4. `npm run seed --prefix server`   (loads categories, products, admin user)
5. `npm run dev`  -> site http://localhost:3000, admin http://localhost:3000/admin

## Deploy on Vercel (two projects, same GitHub repo)
- Server: Root Directory `server`, env MONGODB_URI + JWT_SECRET.
- Client: Root Directory `client`, env API_URL = the server's Vercel URL.
