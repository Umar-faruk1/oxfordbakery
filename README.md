# Cake Ordering Application

A modern web application for ordering cakes, built with Next.js, TypeScript, and Supabase.

## Features

- User authentication (sign up, login, logout)
- Product catalog with categories
- Shopping cart functionality
- Order management
- Admin dashboard for managing products and orders
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Supabase account
- A Paystack account (for payment processing)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cake-ordering.git
   cd cake-ordering
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ```

   Replace the placeholder values with your actual Supabase and Paystack credentials.

### Database Setup

1. Create a new project in Supabase.

2. Go to the SQL Editor in your Supabase dashboard.

3. Copy the contents of the `supabase/schema.sql` file and paste it into the SQL Editor.

4. Run the SQL script to create the necessary tables, indexes, and row-level security policies.

5. The script will:
   - Create tables for users, categories, menu items, orders, and order items
   - Set up appropriate indexes for better query performance
   - Insert sample categories
   - Configure row-level security policies for data protection

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions and type definitions
- `public/` - Static assets
- `styles/` - CSS styles
- `supabase/` - Database schema and migrations

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Supabase](https://supabase.io/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Paystack](https://paystack.com/) - Payment processing

## License

This project is licensed under the MIT License - see the LICENSE file for details. 