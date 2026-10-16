# Shree Shakti ERP - Backend (Node.js)

**Date**: September 5, 2026

## Overview
This is the Node.js / Express backend for the Shree Shakti Engineering Works ERP system. It provides a robust RESTful API that handles data operations for enterprise resource planning, utilizing a MongoDB database. 

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs for password hashing
- **Environment Management**: dotenv

## Modules Implemented (As of Date)
The API currently supports the following core modules:
- **Auth & Security**: Login (`/api/auth`), session management, password resets, and activity logging.
- **Admin Management**: Profile updates and credentials management (`/api/admin`).
- **Master Data Management**: 
  - Users (`/api/user`)
  - Clients (`/api/client`)
  - Projects (`/api/master/projects` etc.)
  - Units of Measurement (`/api/unit`)
  - Material of Construction (MOC) (`/api/moc`)
- **Product Management**:
  - Products (`/api/product`)
  - Product Categories (`/api/product-category`)
- **Pricing & Quoting**:
  - Pricing Details (`/api/price`)
  - Costing Sheets (`/api/costingSheet`)
  - Quotations (`/api/quotation`)

## Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Ensure a `.env` file exists in the root directory with the following keys:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shreeshakti_erp
   JWT_SECRET=your_jwt_secret_here
   ```
3. **Database Seeding**:
   Run the initial seeder to populate admin accounts.
   ```bash
   node seeders/adminSeeder.js
   ```
4. **Run the server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Global Behaviors
- **CORS**: Configured to accept credentials and requests from `http://localhost:5173`.
- **Caching**: Global middleware explicitly disables browser caching (`Cache-Control: no-store`) for all API routes to prevent stale UI data.
