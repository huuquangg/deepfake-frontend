# Feature-Based Architecture

This app follows a feature-based architecture pattern where code is organized by business features rather than technical layers.

## 📁 Structure

```
app/
├── (tabs)/                    # Tab navigation routes
│   ├── index.tsx             # Home tab → features/home
│   └── explore.tsx           # Profile tab → features/profile
├── features/                 # Feature modules
│   ├── home/
│   │   ├── screens/
│   │   │   └── home-screen.tsx
│   │   ├── components/
│   │   │   └── quick-action-card.tsx
│   │   └── index.tsx
│   ├── detection/
│   │   ├── screens/
│   │   │   ├── upload-screen.tsx
│   │   │   └── result-screen.tsx
│   │   ├── components/
│   │   │   └── detection-card.tsx
│   │   ├── upload.tsx        # Route file
│   │   └── result.tsx        # Route file
│   ├── history/
│   │   ├── screens/
│   │   │   └── history-list-screen.tsx
│   │   └── list.tsx          # Route file
│   └── profile/
│       ├── screens/
│       │   └── profile-screen.tsx
│       └── index.tsx
└── _layout.tsx               # Root layout

components/                    # Shared UI components
├── themed-text.tsx
├── themed-view.tsx
├── parallax-scroll-view.tsx
└── ui/
    ├── icon-symbol.tsx
    └── collapsible.tsx
```

## 🎯 Features

### Home
- Main landing screen with quick actions
- Navigation to detection and history features

### Detection
- **Upload**: Select and upload images/videos for analysis
- **Result**: Display detection results with confidence scores

### History
- **List**: View past detection results
- Click to see detailed results

### Profile
- User settings and preferences
- Account management
- Help and support

## 🧩 Component Organization

### Feature Components
Components specific to a feature live within that feature's folder:
- `app/features/home/components/` - Home-specific components
- `app/features/detection/components/` - Detection-specific components

### Shared Components
Reusable UI components across features live in:
- `components/` - General shared components
- `components/ui/` - Atomic UI elements (buttons, icons, etc.)

## 🚀 Navigation

### Tab Navigation
The app uses file-based routing with Expo Router:
- `/` (Home tab) → `features/home`
- `/explore` (Profile tab) → `features/profile`

### Feature Routes
Feature screens are accessible via their route files:
- `/features/detection/upload` - Upload media
- `/features/detection/result` - View detection result
- `/features/history/list` - View history

## 📝 Adding a New Feature

1. **Create feature folder**: `app/features/your-feature/`
2. **Add screens folder**: `app/features/your-feature/screens/`
3. **Create screen component**: `your-feature-screen.tsx`
4. **Add route file** (if needed): `app/features/your-feature/index.tsx`
5. **Export from route**:
   ```tsx
   export { default } from './screens/your-feature-screen';
   ```
6. **Add feature-specific components**: `app/features/your-feature/components/`

## 🔧 Import Patterns

Use path aliases for cleaner imports:
```tsx
// Shared components
import { ThemedText } from '@/components/themed-text';

// Feature components
import { QuickActionCard } from '@/app/features/home/components/quick-action-card';

// Constants and hooks
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
```

## 🎨 Styling

- Each screen manages its own styles using StyleSheet
- Theme colors from `constants/theme.ts`
- Responsive to light/dark mode via `useColorScheme` hook

## 🔮 Future Enhancements

- [ ] Add API integration layer per feature
- [ ] Add state management (Context/Redux) per feature
- [ ] Add unit tests alongside feature components
- [ ] Add shared hooks for common feature logic
- [ ] Add feature-specific types/interfaces
