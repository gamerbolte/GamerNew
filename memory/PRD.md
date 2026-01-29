# GameShop Nepal - Product Requirements Document

## Original Problem Statement
Clone and replicate the GameShop Nepal e-commerce website from https://github.com/Sushant-Poudel/Today

## Project Overview
GameShop Nepal is a premium e-commerce platform for selling digital products in Nepal, including gaming subscriptions, OTT services, software licenses, and digital top-ups. The platform uses Take.app integration for order management and payments.

## Tech Stack
- **Frontend**: React.js with TailwindCSS, Shadcn UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Integrations**: Take.app for orders/payments, Trustpilot for reviews

## User Personas
1. **Customers**: Nepal-based users looking for digital products without international payment cards
2. **Admin**: Store owner managing products, categories, reviews, and site content

## Core Requirements (Static)
- Homepage with Trustpilot reviews and customer testimonials marquee
- Product catalog with categories and filtering
- Product detail pages with pricing variations
- Custom order form fields per product
- Take.app integration for order creation and payments
- Admin panel for full site management

## What's Been Implemented ✅
**Date: January 29, 2025**

### Frontend
- [x] Homepage with reviews marquee, hot deals, best sellers, new arrivals sections
- [x] Product listing with category filtering and search
- [x] Product detail page with variation selection and order dialog
- [x] About, FAQ, Terms, Blog pages
- [x] Navbar with mobile responsive menu
- [x] Footer with social links
- [x] Trustpilot integration script

### Admin Panel
- [x] Admin login with credentials (gsnadmin/gsnadmin)
- [x] Dashboard with stats
- [x] Categories CRUD
- [x] Products CRUD with variations, tags, custom fields
- [x] Reviews CRUD
- [x] FAQs CRUD with reordering
- [x] Static Pages editor (About, Terms)
- [x] Social Links CRUD
- [x] Payment Methods CRUD
- [x] Notification Bar settings
- [x] Blog/Guides CRUD

### Backend API
- [x] Authentication (JWT)
- [x] All CRUD endpoints for products, categories, reviews, FAQs, pages, social links, payment methods, notification bar, blog
- [x] Image upload
- [x] Take.app integration (order creation)
- [x] Seed data endpoint

## Prioritized Backlog

### P0 - Critical (Done)
- [x] Core product listing and ordering flow
- [x] Admin product management
- [x] Take.app order integration

### P1 - High Priority
- [ ] Order status tracking/history
- [ ] Email notifications for orders
- [ ] WhatsApp direct integration fallback

### P2 - Nice to Have
- [ ] Product search with filters
- [ ] Customer accounts/order history
- [ ] Analytics dashboard
- [ ] Inventory tracking from Take.app

## Admin Credentials
- **Username**: gsnadmin
- **Password**: gsnadmin

## API Endpoints
- POST /api/auth/login
- GET/POST /api/categories
- GET/POST/PUT/DELETE /api/products
- GET/POST/PUT/DELETE /api/reviews
- GET/POST/PUT/DELETE /api/faqs
- GET/PUT /api/pages/{page_key}
- GET/POST/PUT/DELETE /api/social-links
- GET/POST/PUT/DELETE /api/payment-methods
- GET/PUT /api/notification-bar
- GET/POST/PUT/DELETE /api/blog
- POST /api/orders/create
- POST /api/seed

## Next Tasks
1. Add sample products to showcase the store
2. Configure Take.app API key for live order processing
3. Add more payment method logos
4. Create blog guides for customers
