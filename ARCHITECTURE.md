# Deepfake Detection App - Architecture Documentation

## 📋 Overview

This is a React Native mobile application built with Expo and Expo Router for detecting deepfakes in images and videos. The app follows a **feature-based architecture** pattern, organizing code by business functionality rather than technical layers.

## 🏗️ Architecture Philosophy

### Feature-Based Organization
Instead of organizing by technical type (all screens in one folder, all components in another), each feature owns its complete implementation:
- Screens/Routes
- Components
- Business logic (future: API calls, state management)
- Types/Interfaces (future)
- Tests (future)

**Benefits:**
- Better code locality - everything related to a feature is together
- Easier to understand feature boundaries
- Simpler to add/remove features
- Better for team collaboration (less merge conflicts)
- Clear separation of concerns

## 📁 Project Structure

```
deepfake-1801-fe/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with theme provider
│   ├── modal.tsx                # Example modal screen
│   ├── (tabs)/                  # Tab-based navigation group
│   │   ├── _layout.tsx          # Tab navigator configuration
│   │   ├── index.tsx            # Home tab → redirects to features/home
│   │   └── explore.tsx          # Profile tab → redirects to features/profile
│   └── features/                # Feature modules (functional organization)
│       ├── README.md            # Feature architecture documentation
│       ├── home/                # Home feature
│       │   ├── index.tsx        # Route export
│       │   ├── screens/
│       │   │   └── home-screen.tsx
│       │   └── components/
│       │       └── quick-action-card.tsx
│       ├── detection/           # Deepfake detection feature
│       │   ├── upload.tsx       # Route: /features/detection/upload
│       │   ├── result.tsx       # Route: /features/detection/result
│       │   ├── screens/
│       │   │   ├── upload-screen.tsx
│       │   │   └── result-screen.tsx
│       │   └── components/
│       │       └── detection-card.tsx
│       ├── history/             # Detection history feature
│       │   ├── list.tsx         # Route: /features/history/list
│       │   └── screens/
│       │       └── history-list-screen.tsx
│       └── profile/             # User profile feature
│           ├── index.tsx        # Route: /features/profile
│           └── screens/
│               └── profile-screen.tsx
├── components/                   # Shared/reusable UI components
│   ├── themed-text.tsx          # Themed text component
│   ├── themed-view.tsx          # Themed view component
│   ├── parallax-scroll-view.tsx # Parallax scroll component
│   ├── haptic-tab.tsx           # Tab with haptic feedback
│   ├── hello-wave.tsx           # Animated wave component
│   ├── external-link.tsx        # External link component
│   └── ui/                      # Atomic UI components
│       ├── icon-symbol.tsx      # Cross-platform icon (Android/Web)
│       ├── icon-symbol.ios.tsx  # iOS SF Symbols
│       └── collapsible.tsx      # Collapsible section
├── constants/                    # App-wide constants
│   └── theme.ts                 # Colors and fonts
├── hooks/                        # Shared React hooks
│   ├── use-color-scheme.ts      # Color scheme hook
│   ├── use-color-scheme.web.ts  # Web-specific implementation
│   └── use-theme-color.ts       # Theme color hook
├── assets/                       # Static assets
│   └── images/                  # Images and icons
├── scripts/
│   └── reset-project.js         # Reset to blank project
├── app.json                     # Expo configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── eslint.config.js             # ESLint configuration
```

## 🎯 Key Features

### 1. Home Feature (`app/features/home/`)
- **Purpose**: Landing page with quick actions
- **Components**:
  - `home-screen.tsx`: Main screen with parallax header
  - `quick-action-card.tsx`: Reusable action card component
- **Navigation**: Quick access to upload and history features

### 2. Detection Feature (`app/features/detection/`)
- **Purpose**: Core deepfake detection functionality
- **Screens**:
  - `upload-screen.tsx`: Upload media for analysis (image/video)
  - `result-screen.tsx`: Display detection results with confidence scores
- **Components**:
  - `detection-card.tsx`: Card displaying detection summary
- **Future**: Integration with AI/ML backend for actual detection

### 3. History Feature (`app/features/history/`)
- **Purpose**: View past detection results
- **Screens**:
  - `history-list-screen.tsx`: List of all detections with metadata
- **Future**: Filtering, sorting, local storage/database integration

### 4. Profile Feature (`app/features/profile/`)
- **Purpose**: User settings and account management
- **Screens**:
  - `profile-screen.tsx`: User info and settings menu
- **Future**: Authentication, preferences, notifications settings

## 🧭 Navigation Structure

### Expo Router File-Based Routing
The app uses Expo Router v6 for navigation with typed routes:

```
/                           → Home tab (app/(tabs)/index.tsx → features/home)
/explore                    → Profile tab (app/(tabs)/explore.tsx → features/profile)
/modal                      → Example modal
/features/detection/upload  → Upload media screen
/features/detection/result  → Detection result screen
/features/history/list      → History list screen
/features/profile           → Profile screen
```

### Tab Navigation
Bottom tabs configured in `app/(tabs)/_layout.tsx`:
- **Home Tab** (`index`): SF Symbol `house.fill` / Material Icon `home`
- **Profile Tab** (`explore`): SF Symbol `person.fill` / Material Icon `person`

## 🎨 Theming & Styling

### Theme System
- **Location**: `constants/theme.ts`
- **Features**:
  - Light/dark mode support
  - Platform-specific fonts (iOS vs Android/Web)
  - Tint colors for active states

### Color Scheme
```typescript
Colors.light = {
  text: '#11181C',
  background: '#fff',
  tint: '#0a7ea4',
  icon: '#687076',
  tabIconDefault: '#687076',
  tabIconSelected: '#0a7ea4',
}

Colors.dark = {
  text: '#ECEDEE',
  background: '#151718',
  tint: '#fff',
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: '#fff',
}
```

### Themed Components
Use themed components for automatic color scheme adaptation:
- `<ThemedView>` - Auto-themed container
- `<ThemedText>` - Auto-themed text with type variants

### Icon System
Cross-platform icon component with platform-specific implementations:
- **iOS**: SF Symbols via `expo-symbols` (native)
- **Android/Web**: Material Icons via `@expo/vector-icons`

Mapping defined in `components/ui/icon-symbol.tsx`:
```typescript
'house.fill' → 'home'
'photo.fill' → 'photo'
'person.fill' → 'person'
// ... etc
```

## 🔧 Development Workflow

### Running the App
```bash
# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start

# Platform-specific
npm run android  # Android emulator
npm run ios      # iOS simulator
npm run web      # Web browser
```

### Linting
```bash
npm run lint
```

### Reset Project
```bash
npm run reset-project  # Moves app/ to app-example/ and creates blank app/
```

## 📦 Key Dependencies

### Core Framework
- **expo** (~54.0.23): Development platform
- **expo-router** (~6.0.14): File-based routing
- **react-native** (0.81.5): Mobile framework
- **react** (19.1.0): UI library

### Navigation
- **@react-navigation/native** (^7.1.8): Navigation primitives
- **@react-navigation/bottom-tabs** (^7.4.0): Tab navigation
- **react-native-screens** (~4.16.0): Native screen optimization
- **react-native-safe-area-context** (~5.6.0): Safe area handling

### UI & Animations
- **expo-image** (~3.0.10): Optimized image component
- **expo-symbols** (~1.0.7): SF Symbols (iOS)
- **@expo/vector-icons** (^15.0.3): Icon sets
- **react-native-reanimated** (~4.1.1): Animations
- **react-native-gesture-handler** (~2.28.0): Gesture handling
- **expo-haptics** (~15.0.7): Haptic feedback

### Other
- **expo-linking** (~8.0.8): Deep linking
- **expo-splash-screen** (~31.0.10): Splash screen
- **expo-status-bar** (~3.0.8): Status bar
- **expo-web-browser** (~15.0.9): In-app browser

## 🔮 Future Enhancements

### State Management
Add feature-specific state management:
- Context API for simple features
- Redux/Zustand for complex state
- Keep state co-located with features

### API Integration
Create API layer per feature:
```
app/features/detection/
  ├── api/
  │   ├── detection-api.ts
  │   └── types.ts
  ├── hooks/
  │   └── use-detection.ts
```

### Testing
Add tests alongside features:
```
app/features/detection/
  ├── __tests__/
  │   ├── upload-screen.test.tsx
  │   └── detection-card.test.tsx
```

### Backend Integration
- Connect to deepfake detection ML service
- Add authentication (OAuth, JWT)
- Implement real-time updates (WebSockets)
- Add media storage (AWS S3, Firebase Storage)

### Performance
- Add image optimization
- Implement lazy loading
- Add caching strategies
- Use React.memo for expensive components

## 🛠️ TypeScript Configuration

### Strict Mode
```jsonc
{
  "compilerOptions": {
    "strict": true,  // Enables all strict type checking
    "paths": {
      "@/*": ["./*"]  // Path alias for imports
    }
  }
}
```

### Path Aliases
Import from project root using `@/`:
```typescript
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
```

## 🚀 Expo Configuration Highlights

### Experimental Features
- **typedRoutes**: Type-safe routing
- **reactCompiler**: React 19 compiler
- **newArchEnabled**: New Architecture (Fabric)

### Platform Support
- **iOS**: Tablet support enabled
- **Android**: Edge-to-edge UI, adaptive icons
- **Web**: Static output, favicon configured

## 📱 Platform Considerations

### iOS
- Uses native SF Symbols for icons
- UI rounded font support
- Haptic feedback for tabs

### Android
- Material Icons fallback
- Adaptive icon with foreground/background/monochrome
- Edge-to-edge enabled

### Web
- Static site generation
- Responsive design
- Standard web fonts

## 🎓 Best Practices

1. **Feature Isolation**: Keep features independent and self-contained
2. **Component Reusability**: Share common UI in `components/`
3. **Type Safety**: Use TypeScript strictly, define interfaces
4. **Performance**: Use React.memo, useMemo, useCallback where needed
5. **Accessibility**: Add proper labels and ARIA attributes
6. **Testing**: Write tests for critical user flows
7. **Documentation**: Document complex logic and feature requirements

## 📚 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
