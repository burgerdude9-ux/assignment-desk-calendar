# Assignment Desk Calendar

A collaborative calendar application for managing newsroom assignments with shared Vercel Blob storage.

## Features
- 📅 **Month and Week calendar views**
- ➕ **Create new events** with slug, story type, description, location
- 👆 **Click events** to view details and perform actions (claim, edit, delete)
- 📊 **Status management**: AVAILABLE, CLAIMED, IN_PROGRESS, APPROVED, COMPLETED
- 🔄 **Shared data storage** - everyone sees the same events via Vercel Blob
- 📱 **Responsive design** with Tailwind CSS

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel
```

### 3. Enable Vercel Blob
- In your Vercel project dashboard, go to **Storage** → **Blob** → **Create Database**
- This enables file storage for your project

### 4. Redeploy (if needed)
```bash
vercel --prod
```

## How It Works
- **Data Storage**: Events are stored as a JSON file in Vercel Blob storage
- **Sharing**: All users access the same blob file, so changes are visible to everyone
- **Initialization**: First load automatically creates sample events if none exist

## Technologies
- **Next.js** - React framework
- **Vercel Blob** - File storage for shared data
- **FullCalendar** - Calendar component
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible components

## API Routes
- `GET /api/events` - Fetch all events from blob storage
- `POST /api/events` - Save events array to blob storage

## Limitations
- **Concurrent Edits**: If multiple users edit simultaneously, the last save wins
- **File Storage**: Uses blob storage rather than a database (simpler but less robust)
- **No Real-time**: Changes require page refresh to see updates from other users

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License
MIT License