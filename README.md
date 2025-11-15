# Deepfake Detection App

A React Native mobile application for detecting deepfakes in images and videos, built with Expo and organized using a feature-based architecture.

## 🎯 Features

- **Deepfake Detection**: Upload and analyze images/videos for manipulation
- **History Tracking**: View past detection results with confidence scores
- **User Profile**: Manage settings and preferences
- **Cross-Platform**: iOS, Android, and Web support
- **Dark Mode**: Full light/dark theme support

## 🏗️ Architecture

This project uses a **feature-based architecture** where code is organized by business functionality:

```
app/features/
├── home/        # Landing page with quick actions
├── detection/   # Upload and analyze media
├── history/     # View past detections
└── profile/     # User settings
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

3. **Run on a platform**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web Browser
   - Scan QR code with Expo Go app for physical device

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in web browser
npm run lint       # Run ESLint
npm run reset-project  # Reset to blank project
```

## 📁 Project Structure

```
deepfake-1801-fe/
├── app/
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Home tab
│   │   └── explore.tsx      # Profile tab
│   ├── features/            # Feature modules
│   │   ├── home/
│   │   ├── detection/
│   │   ├── history/
│   │   └── profile/
│   └── _layout.tsx          # Root layout
├── components/              # Shared UI components
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/                  # Atomic UI elements
├── constants/               # Theme, colors, fonts
├── hooks/                   # Custom React hooks
└── assets/                  # Images, icons, etc.
```

## 🎨 Tech Stack

- **Framework**: React Native with Expo (~54.0)
- **Navigation**: Expo Router (~6.0) with typed routes
- **UI**: React Native components with themed styling
- **Animations**: React Native Reanimated (~4.1)
- **Icons**: SF Symbols (iOS) + Material Icons (Android/Web)
- **Language**: TypeScript with strict mode

## 🧩 Key Features

### Feature-Based Organization
Each feature is self-contained with its own:
- Screens/routes
- Components
- Business logic (future: API, state)
- Types (future)

### Theming
- Automatic light/dark mode support
- Platform-specific fonts
- Consistent color scheme across platforms

### Navigation
- File-based routing with Expo Router
- Type-safe navigation
- Bottom tabs with haptic feedback

## 📱 Platforms

- **iOS**: Native SF Symbols, optimized for tablets
- **Android**: Material Design, edge-to-edge UI, adaptive icons
- **Web**: Static site generation, responsive design

## 🔮 Roadmap

- [ ] Integrate ML backend for actual deepfake detection
- [ ] Add authentication (OAuth, JWT)
- [ ] Implement real-time detection progress
- [ ] Add media storage integration
- [ ] Local caching and offline support
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [app/features/README.md](./app/features/README.md) - Feature organization guide

## 🛠️ Development

### Adding a New Feature

1. Create feature folder: `app/features/your-feature/`
2. Add screens: `app/features/your-feature/screens/`
3. Create route file: `app/features/your-feature/index.tsx`
4. Add components: `app/features/your-feature/components/`

### Code Style

- Use TypeScript with strict mode
- Follow Expo ESLint configuration
- Use path aliases (`@/`) for imports
- Keep features isolated and self-contained

## 🧪 Testing

```bash
# Run linter
npm run lint

# Run tests (when added)
npm test
```

## 📖 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## 🤝 Contributing

This is a thesis project. For collaboration inquiries, please contact the maintainers.

## 📄 License

This project is part of a thesis and is for educational purposes.

