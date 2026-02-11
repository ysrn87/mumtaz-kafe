# 🛍️ Sales Management System

A comprehensive point-of-sale (POS) and inventory management system built with Next.js, featuring role-based access control, member loyalty programs, and real-time sales tracking.

## ✨ Features

### 👥 Role-Based Access Control
- **Administrator**: Full system access, user management, financial reports
- **Manager**: Product management, inventory control, sales oversight
- **Member**: Personal dashboard, purchase history, loyalty points tracking

### 🛒 Sales Management
- Quick sale processing with barcode/SKU search
- Multiple payment methods (Cash, Card, Transfer)
- Automatic point rewards calculation
- Sale editing and invoice generation
- Real-time inventory updates

### 📦 Inventory Management
- Product and variant management
- Stock tracking and movement history
- Low stock alerts
- Bulk stock adjustments
- Cost and pricing management

### 💰 Financial Tracking
- Cash flow management (Income/Expense)
- Sales reports with date filtering
- Profit margin analysis
- Category-based expense tracking

### 🎯 Customer Loyalty Program
- Points earning system
- Member dashboard with purchase statistics
- Points history tracking
- Today vs Yesterday purchase comparison
- Digital member cards with QR codes

### 📊 Analytics & Reports
- Sales performance reports
- Inventory valuation reports
- Best-selling products
- Financial summaries

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Radix UI + Tailwind CSS
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn or pnpm

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd sales-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sales_db"

# Authentication
AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
AUTH_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👤 Default Users

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Manager | manager@example.com | manager123 |
| Member | member@example.com | member123 |

**⚠️ Important**: Change these credentials in production!

## 📁 Project Structure

```
sales-system/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database migrations
├── src/
│   ├── actions/               # Server actions
│   │   ├── auth.ts
│   │   ├── sales.ts
│   │   ├── products.ts
│   │   ├── members.ts
│   │   ├── cashflow.ts
│   │   └── stock.ts
│   ├── app/
│   │   ├── admin/            # Admin dashboard
│   │   ├── manager/          # Manager dashboard
│   │   ├── member/           # Member dashboard
│   │   ├── login/            # Authentication
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── sales/            # Sales components
│   │   ├── products/         # Product components
│   │   ├── customers/        # Customer components
│   │   ├── reports/          # Report components
│   │   └── navigation.tsx    # Navigation component
│   ├── lib/
│   │   ├── db.ts             # Database client
│   │   └── utils.ts          # Utility functions
│   └── auth.ts               # Auth configuration
└── package.json
```

## 🗄️ Database Schema

### Main Models:
- **User**: System users with role-based access
- **Product**: Product information
- **ProductVariant**: Product variants (size, color, etc.)
- **Sale**: Sales transactions
- **SaleItem**: Individual items in a sale
- **PointHistory**: Member loyalty points tracking
- **StockMovement**: Inventory movement history
- **Cashflow**: Financial transactions

## 🚀 Deployment

### Deploy to Vercel

1. **Setup Database** (Choose one):
   - [Neon](https://neon.tech) (Recommended)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)

2. **Deploy to Vercel**:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

3. **Configure Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` (your Vercel domain)

4. **Setup Database Schema**:

```bash
# Pull environment variables
vercel env pull .env.local

# Push schema
npx prisma db push

# Seed database
npm run db:seed
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
npm run db:reset         # Reset database
npm run db:reset:seed    # Reset and seed database
```

## 🔐 Security

- Passwords are hashed with bcrypt
- Role-based middleware protection
- Server-side authentication with NextAuth.js
- Protected API routes
- SQL injection protection via Prisma

## 🎨 UI Components

This project uses:
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **shadcn/ui** component patterns

## 📱 Features by Role

### Administrator
- ✅ User management
- ✅ Full sales access
- ✅ Product management
- ✅ Inventory control
- ✅ Cash flow management
- ✅ Financial reports
- ✅ Customer management

### Manager
- ✅ Sales processing
- ✅ Product management
- ✅ Inventory control
- ✅ Stock adjustments
- ✅ Customer management

### Member
- ✅ Personal dashboard
- ✅ Purchase history
- ✅ Points tracking
- ✅ Today's purchase statistics
- ✅ Digital member card

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Your environment details

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Database ORM by [Prisma](https://www.prisma.io/)

## 📧 Contact

For questions or support, please open an issue or contact the development team.

---

**Made with ❤️ for small business management**
