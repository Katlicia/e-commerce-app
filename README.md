# E-Commerce Platform

This is a full-stack e-commerce platform built for the Turkish market. It includes a customer-facing web application, a native mobile app, an admin panel, and a REST API backend. All four applications share a common codebase for Redux state management and API communication logic.

The platform covers the full shopping experience: product browsing, cart management, checkout with installment payment support, order tracking, promotional campaigns, and account management. The admin panel handles product and inventory management, order fulfillment, content configuration, and sales analytics.

## Applications

The repository is organized as a monorepo with four separate applications and one shared module.

**Backend** is a Node.js/Express REST API that connects to MongoDB. It handles authentication, product management, orders, payments, and all business logic.

**Frontend** is a React web application intended for customers. It is built with Vite and uses Bootstrap for styling. It covers all customer-facing features including browsing, cart, checkout, and account pages.

**Admin Front** is a separate React web application for store administrators. It uses the same Vite setup and includes a sidebar-based layout with dedicated panels for managing products, orders, users, promotions, and site content.

**Mobile** is an Expo-managed React Native application that targets iOS and Android. It shares Redux slices and API logic with the web frontend through the shared module. Navigation is handled by React Navigation with a bottom tab bar.

**Shared** contains Redux slices, reducers, and API helper functions that are imported by both the frontend and mobile applications. This avoids duplicating state management logic across platforms.

## Technology Stack

### Backend

- Node.js with Express 5
- MongoDB with Mongoose for data modeling
- JWT authentication with short-lived access tokens (15 min) and sliding refresh tokens (7 days), stored in HTTP-only cookies
- bcryptjs for password hashing
- Helmet for HTTP security headers
- express-rate-limit for brute-force protection on auth endpoints
- Cloudinary for image storage
- Iyzipay for payment processing (Turkish market)
- Nodemailer for transactional emails

### Frontend and Admin

- React 19
- Redux Toolkit for state management
- React Router DOM 7
- Axios for HTTP requests
- Bootstrap 5 and React Bootstrap for UI
- Formik with Yup for form validation
- Vite as the build tool
- Admin panel additionally uses Recharts for analytics, dnd-kit for drag-and-drop, and React Pro Sidebar for layout

### Mobile

- Expo SDK 54 with React Native 0.81
- React Navigation 7 with native stack and bottom tabs
- NativeWind for Tailwind CSS styling in React Native
- Expo Secure Store for token storage
- Redux Persist with AsyncStorage for offline state
- Expo Google Fonts (Inter family)

## Features

### Customer features

Users can browse products by category, search and filter results, and view full product detail pages with images, variants, and customer reviews. Products can be added to a wishlist or to custom named lists. The shopping cart syncs between local state and the server once the user is authenticated.

Checkout supports multiple saved addresses, cargo company selection, and payment via credit or debit card through Iyzipay. Installment options are available. Discount coupons can be applied at checkout.

After placing an order, users can view their order history and track individual order status. Account settings cover profile information, address management, and password changes.

Users can set price alarms on products and receive an email notification when the price drops. Product detail pages include a corporate offer request form where users can submit a message; admin replies are visible in the user's profile under the corporate offers tab. Product pages also support a Q&A section where customers can ask questions and admins can post answers.

### Admin features

The admin panel provides full CRUD for products including variant management, stock tracking, and badge assignment. Categories can be organized in a nested hierarchy.

Order management shows all orders with status tracking and fulfillment controls. The user list gives admins visibility over registered accounts.

Promotion tools include banner management, campaign creation, coupon generation, and homepage section configuration. The homepage layout and content order can be adjusted via drag-and-drop. Analytics panels show sales, order, and product performance data through charts.

The admin panel also includes a corporate offers panel where incoming customer requests are displayed as cards. Admins can write a reply and send it, after which the offer is marked as answered and the reply becomes visible to the customer.

### Mobile app

The mobile app delivers the same customer experience as the web frontend with a native interface. It uses a bottom tab bar with five tabs: Home, Categories, Cart, Campaigns, and Profile. Authentication screens appear as modals. Token storage uses Expo Secure Store so credentials persist securely between app launches.

## Authentication

The supported login method for customers is email/phone and password. Admins authenticate through a separate endpoint with role enforcement.

On the web, authentication relies entirely on HTTP-only cookies. The access token expires after 15 minutes; when a request returns 401, the Axios interceptor automatically calls the refresh endpoint using the refresh cookie and retries the original request. If the refresh also fails, the user is logged out via a Redux dispatch.

On mobile, tokens are stored using Expo Secure Store and sent as Bearer tokens in the Authorization header. The same refresh interceptor logic applies, reading and writing the token from secure storage. The admin panel uses the same cookie-based approach as the web frontend, with its own Axios instance and refresh interceptor.

Password recovery is handled via a reset link sent by email. The reset token has a time limit and is consumed on use.

## Running the Project

The easiest way to run the full stack locally is with Docker Compose. From the repository root:

```bash
docker-compose up
```

This starts the backend on port 5000, the frontend on port 5173, and the admin panel on port 5174.

To run services individually without Docker, each application has its own package.json with a dev script. The backend requires a .env file with the following variables: MONGODB_URI, JWT_SECRET_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, EMAIL_USER, EMAIL_PASS, IYZIPAY_API_KEY, and IYZIPAY_SECRET_KEY.

The frontend and admin panel each need a .env file with VITE_API_URL pointing to the backend.

For the mobile app, run the following from the mobile directory:

```bash
npx expo start
```

Then open the app in the Expo Go client or in a simulator.

## Project Structure Notes

The shared directory is aliased in the frontend and mobile Vite/Metro configs so both apps can import from it using a consistent path. Redux slices in shared cover authentication, products, cart, favorites, orders, user profile, lists, cargo options, coupons, banners, homepage sections, homepage layout, tax settings, price alarms, and corporate offers.

The admin panel has its own Redux store separate from the shared one, with slices for admin authentication and admin-specific operations.

Styling uses Bootstrap and custom CSS on the web, and NativeWind (Tailwind CSS) on mobile. The primary brand color across the platform is orange (#ff7700). The Inter font family is used on both web and mobile.

Production deployment uses a second Docker Compose file (docker-compose.prod.yml) that adds Nginx as a reverse proxy in front of the frontend and admin applications.
