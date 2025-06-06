# FocusFlow – Pomodoro & Distraction Blocker with Session Analytics

A modern productivity application that combines Pomodoro timer functionality with intelligent distraction blocking and comprehensive analytics.

## 🎯 Features

- **Pomodoro Timer**: Customizable work and break intervals (25/5/15 minutes default)
- **Distraction Blocker**: Block websites and applications during focus sessions
- **Session Analytics**: Track productivity patterns, focus time, and interruptions
- **User Authentication**: Secure email/password authentication with JWT
- **Dark/Light Mode**: Beautiful responsive UI with theme switching
- **Real-time Updates**: Live timer updates and session tracking

## 🛠 Tech Stack

### Backend
- **NestJS**: Node.js framework for building scalable server-side applications
- **PostgreSQL**: Robust relational database for data persistence
- **TypeORM**: Object-relational mapping for database operations
- **JWT**: JSON Web Tokens for secure authentication
- **Swagger**: API documentation and testing interface

### Frontend
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: High-quality, accessible UI components
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Beautiful, customizable icons
- **next-themes**: Dark/light mode support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn


3. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb focusflow
   
   # The application will automatically create tables on first run
   ```

5. **Start the applications**
   
   **Option 1: Start both applications simultaneously**
   ```bash
   # From the root directory
   npm install
   npm run dev
   ```

   **Option 2: Start applications separately**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run start:dev

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

## 📱 Usage

1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Set Timer**: Choose between work sessions (25 min) or breaks (5/15 min)
3. **Start Focus Session**: Click start to begin your Pomodoro session
4. **Block Distractions**: Configure websites/apps to block during work sessions
5. **Track Progress**: View analytics and session history in the dashboard

## 🏗 Project Structure

```
FocusFlow/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── user/           # User management
│   │   ├── timer/          # Timer functionality
│   │   ├── session/        # Session tracking
│   │   ├── blocklist/      # Distraction blocking
│   │   ├── analytics/      # Analytics and reporting
│   │   └── notification/   # Notifications
│   └── package.json
├── frontend/               # Next.js frontend application
│   ├── app/               # App Router pages
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── package.json
├── env.example           # Environment variables template
└── README.md
```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev    # Start in development mode
npm run test         # Run unit tests
npm run build        # Build for production
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## 📊 Core Modules

### Timer & Workflow
- Customizable Pomodoro intervals
- Work/break session management
- Session state persistence

### Distraction Blocker
- Website/application blocking during active sessions
- User-configurable blocklists
- Automatic activation during work sessions

### Session Logging
- Automatic session tracking
- Interruption and completion logging
- Manual session abort with reasons

### Analytics Dashboard
- Daily/weekly Pomodoro statistics
- Focus time tracking
- Productivity trend analysis
- Session completion rates

## 🔐 Authentication & Authorization

- JWT-based authentication
- Secure password hashing with bcrypt
- Protected API endpoints
- User session management

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: Automatic theme detection with manual override
- **Glassmorphism Effects**: Modern, translucent UI elements
- **Smooth Animations**: Engaging transitions and micro-interactions
- **Accessibility**: WCAG compliant components from Radix UI

## 🚧 Roadmap

- [ ] Real-time distraction blocking implementation
- [ ] Advanced analytics with charts and graphs
- [ ] Team collaboration features
- [ ] Mobile application
- [ ] Browser extension for distraction blocking
- [ ] Integration with calendar applications
- [ ] Customizable notification sounds
- [ ] Export/import session data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) for the robust backend framework
- [Next.js](https://nextjs.org/) for the powerful React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives