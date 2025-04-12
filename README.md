# Beep v2

A real-time chat application built with React, TypeScript, Chakra UI, Supabase, and Weavy.

## Features

- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Real-time Communication**: Weavy Chat SDK
- **UI Framework**: Chakra UI
- **Type Safety**: TypeScript

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Weavy account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WEAVY_URL=your_weavy_url
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## License

MIT

## Saved Creators Feature

The application now uses a "Saved Creators" system instead of a friends-based system. This change allows members to:

1. Search for creators they're interested in
2. Save creators to their profile
3. View their saved creators in the dashboard
4. Remove saved creators when needed

Creators can see which members have saved their profile, making it easier to identify their audience.

### Database Changes

The `friends` table has been replaced with a `saved_creators` table that includes:
- member_id: The member who saved the creator
- creator_id: The creator who was saved
- created_at: When the creator was saved

To apply these changes, run the SQL script in the `database_update.sql` file.

## Enhanced Creator Profiles

Creators now have enhanced profile functionality with the following features:

### Profile Settings

Creator profiles have been enhanced with:
- A headline to quickly describe themselves
- Location information
- Age information
- Gender selection
- Extended bio
- Photo gallery with support for up to 10 photos

The `display_name` field has been removed in favor of using the username directly.

### Profile Viewing

Members can view detailed creator profiles by:
1. Clicking on a creator in their "Saved Creators" list
2. The profile page shows:
   - Creator's avatar and username
   - Headline and location 
   - Age and gender information
   - Full bio
   - Photo gallery with browsing capability

### Database Changes

The profiles table has been updated with new fields and a new gallery table has been added:
- New profile fields: location, age, gender, headline
- New gallery table for storing multiple photos per creator

To apply these database changes, run the SQL script in the `database_update_profile.sql` file.