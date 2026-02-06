# 1000 Rejections

A React Native mobile app that helps people overcome their fear of rejection. Users log rejections they've faced, add descriptions and photos, and track their progress toward a goal of 1,000. Built with Expo, Supabase, and TypeScript.

## Features

- **Track rejections** -- log each rejection with a title, description, date, and optional photo
- **Progress tracking** -- see your count climb toward 1,000 with a visual progress bar
- **Image support** -- attach photos from your camera or photo library
- **Authentication** -- sign up and log in with email and password
- **Dark theme** -- easy on the eyes with a dark UI and purple accents

## Tech Stack

- [Expo](https://expo.dev) (SDK 54) with [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- [React Native](https://reactnative.dev) 0.81
- [Supabase](https://supabase.com) for auth and database
- [TypeScript](https://www.typescriptlang.org)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Supabase](https://supabase.com) project with auth and a `rejections` table

### Installation

```bash
git clone https://github.com/your-username/1000Rejections.git
cd 1000Rejections
npm install
```

### Configuration

Create a `.env` file in the project root with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Running the App

```bash
npm start
```

Then press `i` for iOS, `a` for Android, or `w` for web.

## Testing

```bash
npm test              # run unit tests
npm run test:watch    # run tests in watch mode
npm run test:ci       # run tests with coverage
npm run test:e2e      # run Maestro E2E tests
```

## Building

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for production builds:

```bash
npx eas build --platform ios
npx eas build --platform android
```
