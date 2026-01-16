# Dekalb County Sanitation Mobile App

## Overview

A React Native/Expo mobile application for Dekalb County residents to manage waste collection services. The app allows users to view pickup schedules, receive notifications, report issues, and access service information. Built with a civic-focused, accessible design using the county's green branding colors (#2D7A3E).

The project uses a monorepo structure with an Expo mobile client and an Express.js backend server. The mobile app runs on iOS, Android, and web platforms.

## Current Features (MVP)

- **Home Screen**: Next pickup countdown widget, upcoming schedule list, Report Issue FAB
- **Services Screen**: Browse service information cards (Collection Schedule, What Goes Where, Bulk Pickup, Holiday Schedule, Special Services, Guidelines)
- **Profile Screen**: Service address input, notification toggle settings (Enable Notifications, Pickup Reminders, Service Alerts), contact info
- **Report Issue Modal**: Issue type selection (Missed Pickup, Damaged Container, Other), description input, submit functionality
- **Data Persistence**: AsyncStorage for user settings and reported issues

## Recent Changes

- January 2026: Initial MVP implementation with all core screens and features

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54, using the New Architecture (Fabric renderer)

**Navigation Structure**:
- Root Stack Navigator (modal presentations like ReportIssue)
  - Main Tab Navigator (3 tabs: Home, Services, Profile)
    - Each tab has its own Stack Navigator for drill-down screens

**State Management**:
- TanStack React Query for server state and API caching
- AsyncStorage for local persistence (user settings, address)
- No global state library - uses React's built-in state

**Styling Approach**:
- React Native StyleSheet with theme constants in `client/constants/theme.ts`
- Light/dark mode support via `useColorScheme` hook
- Reanimated for smooth animations and micro-interactions
- expo-blur for iOS glassmorphism effects on headers/tab bars

**Key Design Patterns**:
- Themed components (`ThemedText`, `ThemedView`) for consistent styling
- Custom hooks for screen options and theme access
- Path aliases: `@/` maps to `client/`, `@shared/` maps to `shared/`

### Backend Architecture

**Framework**: Express.js with TypeScript

**API Design**: RESTful endpoints prefixed with `/api` (routes defined in `server/routes.ts`)

**Storage Layer**: 
- Abstract `IStorage` interface in `server/storage.ts`
- Currently uses in-memory `MemStorage` implementation
- Drizzle ORM configured for PostgreSQL (schema in `shared/schema.ts`)

**Database Schema**: Currently minimal - just a users table with id, username, password

### Build & Development

**Development**: 
- `npm run expo:dev` - Starts Expo development server
- `npm run server:dev` - Starts Express server with tsx

**Production**:
- `npm run expo:static:build` - Builds static web bundle via custom script
- `npm run server:build` - Bundles server with esbuild
- `npm run server:prod` - Runs production server

**Database Migrations**: `npm run db:push` uses Drizzle Kit to push schema changes

## External Dependencies

### Core Mobile Dependencies
- **Expo SDK 54**: Platform abstraction layer with managed native modules
- **React Navigation 7**: Native stack and bottom tab navigation
- **React Native Reanimated**: High-performance animations running on UI thread
- **React Native Gesture Handler**: Native gesture recognition

### Backend & Data
- **PostgreSQL**: Primary database (via `pg` driver)
- **Drizzle ORM**: Type-safe database queries and schema management
- **TanStack React Query**: Data fetching, caching, and synchronization

### Storage & Persistence
- **AsyncStorage**: Local key-value storage for user preferences
- No authentication required - all settings stored locally

### UI Components
- **expo-blur**: Native blur effects for iOS
- **expo-haptics**: Haptic feedback
- **@expo/vector-icons (Feather)**: Icon set
- **Nunito font**: Google font via expo-google-fonts