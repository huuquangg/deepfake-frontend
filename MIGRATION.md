# Migration Guide: Feature-Based Architecture

This document explains the changes made to reorganize the codebase from a flat structure to a feature-based architecture.

## 📋 What Changed?

### Before (Flat Structure)
```
app/
├── (tabs)/
│   ├── index.tsx       # Home screen with example code
│   └── explore.tsx     # Example explore screen
└── modal.tsx
```

### After (Feature-Based Structure)
```
app/
├── (tabs)/
│   ├── index.tsx       # → Routes to features/home
│   └── explore.tsx     # → Routes to features/profile
├── features/
│   ├── home/
│   │   ├── screens/home-screen.tsx
│   │   ├── components/quick-action-card.tsx
│   │   └── index.tsx
│   ├── detection/
│   │   ├── screens/upload-screen.tsx
│   │   ├── screens/result-screen.tsx
│   │   ├── components/detection-card.tsx
│   │   ├── upload.tsx
│   │   └── result.tsx
│   ├── history/
│   │   ├── screens/history-list-screen.tsx
│   │   └── list.tsx
│   └── profile/
│       ├── screens/profile-screen.tsx
│       └── index.tsx
└── modal.tsx
```

## 🔄 File Mappings

| Old Location | New Location | Change |
|-------------|-------------|---------|
| `app/(tabs)/index.tsx` | `app/features/home/screens/home-screen.tsx` | Extracted to feature module |
| `app/(tabs)/explore.tsx` | `app/features/profile/screens/profile-screen.tsx` | Renamed & extracted |
| N/A | `app/features/detection/` | New feature module |
| N/A | `app/features/history/` | New feature module |

## 🎯 Key Changes

### 1. Tab Routes Are Now Proxies
The tab route files (`app/(tabs)/index.tsx` and `app/(tabs)/explore.tsx`) now simply re-export their feature modules:

**Before:**
```tsx
// app/(tabs)/index.tsx
export default function HomeScreen() {
  return (
    <ParallaxScrollView>
      {/* All code here */}
    </ParallaxScrollView>
  );
}
```

**After:**
```tsx
// app/(tabs)/index.tsx
export { default } from '@/app/features/home';
```

### 2. Features Are Self-Contained
Each feature now owns its complete implementation:

```
app/features/detection/
├── upload.tsx                 # Route file (re-exports screen)
├── result.tsx                 # Route file (re-exports screen)
├── screens/                   # Feature screens
│   ├── upload-screen.tsx
│   └── result-screen.tsx
└── components/                # Feature-specific components
    └── detection-card.tsx
```

### 3. Component Organization
Components are now organized by ownership:

**Feature-Specific Components:**
- `app/features/home/components/quick-action-card.tsx`
- `app/features/detection/components/detection-card.tsx`

**Shared Components (unchanged):**
- `components/themed-text.tsx`
- `components/themed-view.tsx`
- `components/ui/icon-symbol.tsx`

### 4. Icon System Updates
Added new icon mappings for the detection app:

```typescript
// components/ui/icon-symbol.tsx
const MAPPING = {
  // Original
  'house.fill': 'home',
  'paperplane.fill': 'send',
  // New
  'photo.fill': 'photo',
  'video.fill': 'videocam',
  'clock.fill': 'schedule',
  'person.fill': 'person',
  'bell.fill': 'notifications',
  'info.circle.fill': 'info',
  'questionmark.circle.fill': 'help',
  'exclamationmark.triangle.fill': 'warning',
  'checkmark.seal.fill': 'verified',
};
```

## 🧭 Navigation Updates

### Routes Available
The following routes are now available:

```
/                           → Home (features/home)
/explore                    → Profile (features/profile)  
/modal                      → Example modal
/features/detection/upload  → Upload media (coming soon)
/features/detection/result  → Detection result (coming soon)
/features/history/list      → History list (coming soon)
```

**Note:** Feature routes are currently placeholders and will show alerts until navigation is fully configured.

## 🔧 Import Path Changes

### Using Path Aliases
All imports use the `@/` alias:

```typescript
// Shared components
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Feature components
import { QuickActionCard } from '@/app/features/home/components/quick-action-card';

// Constants
import { Colors } from '@/constants/theme';

// Hooks
import { useColorScheme } from '@/hooks/use-color-scheme';
```

## 🎨 UI Updates

### Home Screen
**Before:** Example Expo starter code with "Welcome test reload!"
**After:** Deepfake Detection app with:
- Professional title: "Deepfake Detector"
- Description of the app purpose
- Quick action cards for Upload and History

### Profile Screen (formerly Explore)
**Before:** Example code and documentation
**After:** User profile with:
- Avatar placeholder
- User information
- Settings menu (Account, Notifications, About, Help)

## 📦 New Features Added

### 1. Home Feature
- Landing page with app description
- Quick action cards for navigation
- Reusable `QuickActionCard` component

### 2. Detection Feature
- **Upload Screen**: Select and upload media for analysis
- **Result Screen**: Display detection results with confidence scores
- **Detection Card**: Component for displaying detection summaries

### 3. History Feature
- **List Screen**: View past detection results
- Mock data for development
- Empty state handling

### 4. Profile Feature
- User information display
- Settings menu
- Menu items with icons

## 🚀 Benefits of New Architecture

### 1. Better Code Organization
- Related code lives together
- Easy to find feature-specific logic
- Clear boundaries between features

### 2. Scalability
- Add new features without touching existing ones
- Easy to remove features
- Independent development of features

### 3. Team Collaboration
- Less merge conflicts
- Clear feature ownership
- Easier onboarding

### 4. Maintainability
- Isolated testing per feature
- Easier debugging
- Better code locality

## 🔮 Next Steps

### Immediate
1. ✅ Set up feature structure
2. ✅ Create placeholder screens
3. ✅ Update tab navigation
4. ⏳ Configure feature routes in Expo Router
5. ⏳ Test navigation between features

### Short Term
- Add state management per feature
- Integrate with backend API
- Add loading and error states
- Implement actual media upload
- Add authentication

### Long Term
- Add unit tests per feature
- Add integration tests
- Implement CI/CD
- Add analytics
- Performance optimization

## 🆘 Troubleshooting

### "Module not found" errors
Make sure you're using the `@/` path alias:
```typescript
// ❌ Wrong
import { ThemedText } from '../../../components/themed-text';

// ✅ Correct
import { ThemedText } from '@/components/themed-text';
```

### Type errors with IconSymbol
Use the exported `IconSymbolName` type:
```typescript
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';

interface Props {
  icon: IconSymbolName;  // ✅ Type-safe
}
```

### Navigation not working
Feature routes are currently placeholders. They will show alerts until navigation is fully configured in Expo Router.

## 📚 Additional Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture documentation
- [app/features/README.md](./app/features/README.md) - Feature organization guide
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## ❓ Questions?

If you have questions about the migration:
1. Check the ARCHITECTURE.md file
2. Review the feature README
3. Look at existing feature implementations as examples
4. Check TypeScript errors carefully - they often guide you to the solution
