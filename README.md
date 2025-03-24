# Job Application Tracker

A modern web application to help job seekers track their job applications, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- User authentication with NextAuth.js
- Track job applications with status updates
- Dashboard with application statistics
- Reminders for follow-ups
- Export functionality for application data
- Modern and responsive UI

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: SQLite with Prisma
- **Styling**: Tailwind CSS with custom theme

## Getting Started

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd job-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=[your-secret-key]
   DATABASE_URL="file:./dev.db"
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app directory with route components
- `/components` - Reusable UI components
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema and client

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 