# Dekalb County Sanitation Mobile App

## Overview

A React Native/Expo mobile application for Dekalb County residents and businesses to manage waste collection services. The app allows users to view pickup schedules, browse residential and commercial services with pricing, receive notifications, report issues, and access service information. Built with a beautiful blue (#1565C0) and green (#2E7D32) dual-color theme, designed specifically for senior-friendly accessibility with large fonts, high contrast, and big tap targets.

The project uses a monorepo structure with an Expo mobile client and an Express.js backend server. The mobile app runs on iOS, Android, and web platforms. The app connects to a web app backend API for user authentication and service data.

## Current Features

### Authentication
- **Welcome Screen**: Beautiful blue/green gradient header with DeKalb Sanitation branding, three feature highlight cards (Reliable Pickup, Green Recycling, Yard Waste), and large Create Account/Sign In buttons
- **Sign In Screen**: Email and password inputs with senior-friendly large text and buttons
- **Create Account Screen**: Full registration form (first name, last name, email, phone, service address, password)
- **API Integration**: Connects to web app backend at `https://dekalb-county-sanitation--hughesnikolas1.replit.app`

### Home Dashboard
- **Welcome Header**: Personalized greeting with user's name
- **Service Categories**: Two main cards - Residential Services (blue) and Commercial Services (green)
- **Quick Actions**: Report Issue, View Schedule, Contact Us, Help & FAQ

### Services
- **Residential Services**: Trash Pickup, Recycling, Yard Waste, Bulk Item Pickup, Holiday Schedule
- **Commercial Services**: Dumpster Rental, Scheduled Pickup, Recycling Program, Compactor Service, Construction Waste
- **Service Details**: Each service shows pricing, sizes, and scheduling options

### Profile
- **User Info**: Avatar with name and email display
- **Service Address**: Editable address input
- **Notifications**: Toggle settings for Enable Notifications, Pickup Reminders, Service Alerts
- **Support**: Contact phone, website, and app version
- **Sign Out**: Red outlined sign out button

### Other Features
- **Report Issue Modal**: Issue type selection and description input
- **Data Persistence**: AsyncStorage for user settings and auth tokens

## Recent Changes

- January 2026: Updated Commercial Services with complete details from web app including all form fields
- January 2026: Added 2-column grid layout for Services with color-coded cards (blue for residential, green for commercial)
- January 2026: Roll Cart Services now shows all pricing: $25 Additional Cart, $42.50-$60.55 for new carts, Free for damaged/stolen
- January 2026: Roll Off Request shows container pricing: $226 (10yd), $451 (20yd), $677 (30yd), $902 (40yd)
- January 2026: Added Requirements for Establishing Commercial Service with office location and documentation needs
- January 2026: Added authentication flow with Welcome, Sign In, and Create Account screens
- January 2026: Implemented blue/green dual-color theme with senior-friendly accessibility
- January 2026: Reorganized dashboard with Residential Services and Commercial Services categories

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Senior-friendly with large fonts, big buttons, high contrast, simple navigation.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54, using the New Architecture (Fabric renderer)

**Navigation Structure**:
- Root Stack Navigator
  - Auth Stack Navigator (when not authenticated)
    - Welcome Screen
    - Sign In Screen
    - Create Account Screen
  - Main Tab Navigator (when authenticated)
    - Home Tab (HomeStackNavigator)
    - Services Tab (ServicesStackNavigator)
    - Profile Tab (ProfileStackNavigator)
  - Report Issue Modal

**State Management**:
- TanStack React Query for server state and API caching
- AsyncStorage for local persistence (user settings, auth tokens)
- AuthProvider context for authentication state (client/hooks/useAuth.tsx)

**Styling Approach**:
- React Native StyleSheet with theme constants in `client/constants/theme.ts`
- Blue (#1565C0) and Green (#2E7D32) dual-color brand theme
- Senior-friendly typography: 18px body font, 60px button height, 56px input height
- Light/dark mode support via `useColorScheme` hook
- Reanimated for smooth animations and micro-interactions
- expo-linear-gradient for gradient backgrounds

**Key Design Patterns**:
- Themed components (`ThemedText`, `ThemedView`) for consistent styling
- Custom hooks for screen options, theme, and authentication
- Path aliases: `@/` maps to `client/`, `@shared/` maps to `shared/`

### Backend Architecture

**Framework**: Express.js with TypeScript

**API Design**: RESTful endpoints prefixed with `/api` (routes defined in `server/routes.ts`)

**External API**: Connects to web app backend at `https://dekalb-county-sanitation--hughesnikolas1.replit.app` for authentication

**Storage Layer**: 
- Abstract `IStorage` interface in `server/storage.ts`
- Currently uses in-memory `MemStorage` implementation
- Drizzle ORM configured for PostgreSQL (schema in `shared/schema.ts`)

### Build & Development

**Development**: 
- `npm run expo:dev` - Starts Expo development server
- `npm run server:dev` - Starts Express server with tsx

**Production**:
- `npm run expo:static:build` - Builds static web bundle via custom script
- `npm run server:build` - Bundles server with esbuild
- `npm run server:prod` - Runs production server

**Database Migrations**: `npm run db:push` uses Drizzle Kit to push schema changes

## Key Files

- `client/screens/WelcomeScreen.tsx` - Landing page with feature cards and auth buttons
- `client/screens/SignInScreen.tsx` - Email/password login form
- `client/screens/CreateAccountScreen.tsx` - Full registration form
- `client/screens/HomeScreen.tsx` - Dashboard with service category cards
- `client/screens/ServicesScreen.tsx` - Service listing with category tabs
- `client/screens/ServiceDetailScreen.tsx` - Individual service with pricing
- `client/hooks/useAuth.tsx` - Authentication context and hooks
- `client/constants/theme.ts` - Colors, spacing, typography with senior-friendly values

## External Dependencies

### Core Mobile Dependencies
- **Expo SDK 54**: Platform abstraction layer with managed native modules
- **React Navigation 7**: Native stack and bottom tab navigation
- **React Native Reanimated**: High-performance animations running on UI thread
- **React Native Gesture Handler**: Native gesture recognition
- **expo-linear-gradient**: Gradient backgrounds for headers and cards

### Backend & Data
- **PostgreSQL**: Primary database (via `pg` driver)
- **Drizzle ORM**: Type-safe database queries and schema management
- **TanStack React Query**: Data fetching, caching, and synchronization

### Storage & Persistence
- **AsyncStorage**: Local key-value storage for user preferences and auth tokens
- **Authentication**: Token-based auth stored in AsyncStorage

### UI Components
- **expo-blur**: Native blur effects for iOS
- **expo-haptics**: Haptic feedback
- **@expo/vector-icons (Feather)**: Icon set
- **Nunito font**: Google font via expo-google-fonts
