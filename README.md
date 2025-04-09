# Beep Chat Application

A real-time chat application built with React, TypeScript, Chakra UI, Supabase, and Ably.

## Features

- User authentication (login, signup)
- Role-based access (Creator/Member)
- Real-time chat functionality
- Profile management
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Library**: Chakra UI
- **Database**: Supabase
- **Real-time Communication**: Ably Chat SDK
- **File Storage**: Supabase Storage
- **Build Tool**: Vite

## Prerequisites

- Node.js 14+ and npm
- Supabase account with project set up
- Ably account with API key

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/beepv2.git
cd beepv2
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment setup**

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ABLY_API_KEY=your_ably_api_key
```

4. **Supabase setup**

- Create a `profiles` table with the following structure:
  - `id` (primary key, references auth.users)
  - `username` (text, unique)
  - `display_name` (text)
  - `bio` (text)
  - `avatar_url` (text)
  - `role` (text, 'creator' or 'member')
  - `updated_at` (timestamp)

- Set up Storage bucket for avatars:
```sql
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true);

-- Policies for avatar storage
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can update their own avatars"
  on storage.objects for update
  using (bucket_id = 'avatars');

create policy "Users can delete their own avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars');
```

5. **Start the development server**

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

## Folder Structure

```

## Authentication

The app uses Supabase Authentication with email/password. Users are assigned roles (creator/member) which determine their access and UI.

## Deployment

The application can be deployed using Vercel:

```bash
npm run build
vercel --prod
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](https://choosealicense.com/licenses/mit/)