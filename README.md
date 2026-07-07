# Lish AI Labs - Visitor Management System

Enterprise-grade visitor management system built with Next.js 14, TypeScript, Prisma, and Supabase.

## Features

### 🏠 Public Portal
- **Visitor Registration**: Easy self-service registration for visitors
- **Host Selection**: Browse and select hosts from different departments
- **Visit Purpose Selection**: Clear categorization of visit types

### 👔 Host Dashboard
- **Pending Approvals**: View all pending visitor requests
- **Approve/Reject**: Quickly approve or reject visits
- **QR Code Generation**: Automatic QR badge creation upon approval
- **Email Notifications**: Visitors receive approval emails with QR codes
- **Today's Visitors**: Real-time overview of scheduled and checked-in visitors

### 🔐 Security Dashboard
- **QR Code Scanner**: Camera-based QR code scanning (HTML5-QRCode)
- **Visitor Verification**: Displays visitor details, host, and purpose
- **Check-In/Out**: Record visitor entry and exit times
- **Movement Tracking**: Automatic zone entry logging
- **On-Site List**: Real-time list of currently present visitors

### 📊 Admin Dashboard
- **Overview Cards**: Summary of key metrics (total visitors, on-site, pending, etc.)
- **Department Analytics**: Bar charts showing visitors per department
- **Status Distribution**: Pie charts for visit status breakdown
- **Visitor Logs**: Complete activity history with filtering
- **CSV Export**: Download all visitor logs
- **Blacklist Management**: Block/unblock problematic visitors

### 🔑 Authentication & Authorization
- **Clerk Integration**: Secure authentication with role-based access
- **Role-Based Access**: Host, Security, Admin roles with specific permissions
- **Protected Routes**: Dashboard routes require authentication and proper role

## Tech Stack

- **Frontend**: React 19, Next.js 14, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Email**: Resend
- **QR Codes**: qrcode, html5-qrcode
- **Charts**: Recharts
- **UI Components**: Lucide Icons, shadcn/ui patterns

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase PostgreSQL)
- Clerk account for authentication
- Resend account for email notifications

## Installation

### 1. Clone the Repository
```bash
git clone <repo-url>
cd my-vms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with:
- **DATABASE_URL**: Your PostgreSQL connection string
- **Clerk Keys**: From your Clerk dashboard
- **RESEND_API_KEY**: From your Resend dashboard

### 4. Set Up Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with demo data
npx prisma db seed
```

### 5. Set Up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable "Email" as a sign-in option
4. Add the following metadata to users:
   - `role`: Set to one of: `host`, `security`, `admin`
   - `department`: For host users (e.g., "Executive", "Training")

### 6. Configure Clerk Custom Attributes

In Clerk Dashboard → Organization Settings → Add Custom Attributes:
```json
{
  "role": {
    "type": "string",
    "editable": true,
    "options": [
      { "label": "Host", "value": "host" },
      { "label": "Security", "value": "security" },
      { "label": "Admin", "value": "admin" }
    ]
  },
  "department": {
    "type": "string",
    "editable": true,
    "options": [
      { "label": "Executive", "value": "Executive" },
      { "label": "Partnerships", "value": "Partnerships" },
      { "label": "Training", "value": "Training" },
      { "label": "Operations", "value": "Operations" },
      { "label": "HR", "value": "HR" },
      { "label": "Admin", "value": "Admin" }
    ]
  }
}
```

### 7. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── page.tsx                    # Public visitor registration
├── sign-in/                    # Clerk sign-in
├── sign-up/                    # Clerk sign-up
├── dashboard/
│   ├── layout.tsx              # Dashboard layout with sidebar
│   ├── host/
│   │   └── page.tsx            # Host dashboard
│   ├── security/
│   │   ├── page.tsx            # QR scanner
│   │   └── onsite/
│   │       └── page.tsx        # On-site visitors list
│   └── admin/
│       ├── page.tsx            # Admin dashboard with charts
│       └── logs/
│           └── page.tsx        # Visitor logs
├── api/
│   ├── visitors/               # Visitor registration API
│   ├── hosts/                  # Get hosts list
│   ├── host/visits/            # Host-specific APIs
│   ├── security/               # Security dashboard APIs
│   └── admin/                  # Admin analytics APIs
├── components/
│   ├── Sidebar.tsx             # Dashboard navigation
│   ├── Card.tsx                # Reusable card component
│   ├── Button.tsx              # Reusable button component
│   └── QRScanner.tsx           # QR code scanner
└── lib/
    ├── db.ts                   # Prisma client
    └── email.ts                # Email notifications

prisma/
├── schema.prisma               # Database schema
└── migrations/                 # Database migrations
```

## Database Schema

### Models

- **User**: Internal staff (hosts, security, admin)
- **Visitor**: External visitors
- **Host**: Lish AI Labs staff members
- **Visit**: Each visitor entry/exit record
- **Badge**: QR codes for approved visits
- **Blacklist**: Banned visitors
- **MovementLog**: Zone entry/exit tracking

## API Endpoints

### Visitor APIs
- `POST /api/visitors` - Register a new visitor

### Host APIs
- `GET /api/host/visits?status=PENDING` - Get pending visits
- `POST /api/host/visits/[visitId]/approve` - Approve a visit
- `POST /api/host/visits/[visitId]/reject` - Reject a visit

### Security APIs
- `GET /api/security/visit/[visitId]` - Get visit details
- `POST /api/security/visit/[visitId]/check-in` - Check in visitor
- `POST /api/security/visit/[visitId]/check-out` - Check out visitor
- `GET /api/security/onsite` - Get on-site visitors

### Admin APIs
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/logs?status=ALL` - Get visitor logs
- `GET /api/admin/export-logs` - Export CSV
- `POST /api/admin/blacklist` - Add to blacklist
- `DELETE /api/admin/blacklist/[visitorId]` - Remove from blacklist

## Email Configuration

### Resend Setup

1. Sign up at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=your_key_here
   ```

### Email Templates

The system sends three types of emails:
- **Approval Email**: QR code + visit details
- **Rejection Email**: Reason for rejection
- **Check-In Notification**: Notifies host of visitor arrival

## Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Connect to Vercel
vercel link

# Deploy
vercel deploy
```

### Environment Variables on Vercel
Add the same variables from `.env.local` to Vercel Project Settings → Environment Variables

### Database on Supabase

1. Create a Supabase project
2. Copy the PostgreSQL connection string
3. Set `DATABASE_URL` in Vercel environment

## Development Tips

### Create Test Data

```bash
npx prisma db seed
```

### View Database

```bash
npx prisma studio
```

### Generate Types

```bash
npx prisma generate
```

## Security Considerations

- ✅ Role-based access control on all dashboard routes
- ✅ Authentication required for all protected endpoints
- ✅ Visitor verification before check-in
- ✅ Blacklist enforcement
- ✅ QR code expiration (8 hours by default)
- ✅ Movement tracking and logging
- ✅ Email verification for notifications

## Performance Optimizations

- 🚀 Dynamic imports for QR scanner (client-side only)
- 🚀 Optimistic UI updates
- 🚀 Automatic page refresh (30s for on-site list)
- 🚀 Database query optimization with indexes
- 🚀 Image optimization with Tailwind

## Troubleshooting

### QR Scanner Not Working
- Check browser camera permissions
- Ensure HTTPS in production
- Use latest browser version

### Email Not Sending
- Verify Resend API key
- Check email template HTML
- Review Resend dashboard for errors

### Database Connection Issues
- Verify DATABASE_URL format
- Check PostgreSQL is running
- Test connection with: `npx prisma db push`

## Future Enhancements

- [ ] Mobile app for security team
- [ ] WhatsApp notifications
- [ ] Multiple facility support
- [ ] Advanced analytics and reports
- [ ] Visitor feedback surveys
- [ ] Integration with access control systems
- [ ] Multi-language support
- [ ] Dark mode

## License

MIT

## Support

For support, contact: support@lishailabs.com
