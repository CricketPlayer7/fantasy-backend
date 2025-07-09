# Cricket Fantasy Platform Backend

Express + TypeScript backend for the Cricket Fantasy Platform, migrated from Next.js API routes.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   Then fill in your environment variables in `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `FRONTEND_URL`: Your frontend URL (default: http://localhost:3000)
   - `PORT`: Server port (default: 3001)

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Currently Migrated:

- `PUT /api/user-meta` - Update user metadata (requires authentication)
- `POST /api/startup` - Start notification listener
- `GET /api/auth/confirm` - Confirm email OTP

### Authentication

All authenticated endpoints expect `access_token` and `refresh_token` to be present in:
1. Cookies (for web clients)
2. Custom Cookie header format: `access_token=<token>; refresh_token=<token>` (for mobile clients)

## Migration Status

✅ **Completed:**
- Basic Express + TypeScript setup
- Supabase client configuration
- Authentication middleware
- User meta endpoint
- Startup endpoint
- Auth confirm endpoint

🔄 **To be migrated:**
- All other API endpoints from the original structure
- Notification services
- Firebase services
- Transaction services
- Other utility functions

## Project Structure

```
src/
├── lib/           # Shared utilities (migrated from original)
├── middleware/    # Express middleware
├── routes/        # API route handlers
├── types/         # TypeScript type definitions
└── server.ts      # Main server file
```

## Notes

- Maintains the same API paths as the original Next.js implementation
- Uses the same Supabase authentication flow
- Cookie-based authentication compatible with both web and mobile clients
- Error handling and validation preserved from original implementation
