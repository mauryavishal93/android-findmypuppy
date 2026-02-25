# Find My Puppy - Release Notes

## Version 1.1.0 (Current)

---

## Version 1.0.8

### 🎨 Theme System Improvements
- **Default Theme**: Set "Starry Night" as the default theme for all new users
- **Theme Persistence**: User theme selection is now saved and persists across app sessions
- **Unlock Method**: Themes can now only be unlocked using 25 points (removed "complete 10 games" option)
- **Theme Selection**: When users change themes, their preference is automatically saved

### 🔒 Security Updates
- Fixed 17 high-severity npm vulnerabilities
- Updated vulnerable dependencies (minimatch, tar, glob, rimraf)
- Added npm overrides to ensure secure dependency versions
- Updated build tools and dependencies to latest secure versions

### 📦 Package Updates
- Updated `@capacitor/local-notifications` to 8.0.1
- Updated `@capacitor/share` to 8.0.1
- Updated `cors` to 2.8.6
- Updated `dotenv` to 17.3.1
- Updated `vite` to 7.3.1
- Updated `@types/node` to 25.3.0

---

## Version 1.0.7

### 🐛 Bug Fixes
- Fixed Android back button navigation issues
- Improved app stability and performance
- Enhanced error handling for theme selection

---

## Version 1.0.6

### ✨ New Features
- **Explorer's Guide Quick Overview Modal**: Added an information modal accessible from the info button
  - Quick game overview with intro, quick actions, difficulty table
  - Guest/Login information
  - Hints, Daily rewards, and Puppy Jump explanations
  - Privacy and account management links

### 🎯 Improvements
- Enhanced Explorer's Guide step-by-step tutorial
- Added Step 8 to Explorer Guide with external link to full guide page
- Improved modal design consistency across the app
- Better user onboarding experience

### 🎨 UI/UX Enhancements
- Standardized modal design with consistent styling
- Improved color contrast and accessibility
- Enhanced visual feedback for user interactions

---

## Version 1.0.5

### ✨ Major Features
- **Explorer's Guide**: Complete step-by-step tutorial system
  - Interactive guide with 8 steps
  - Puppy designs showcase
  - External links to full guide page
  - Visual previews and instructions

### 🎨 Theme System
- Multiple unlockable themes available
- Theme selection modal improvements
- Visual theme previews

### 🐛 Bug Fixes
- Fixed notification icon consistency
- Improved Android back button handling
- Enhanced app navigation flow

### 📱 Android Improvements
- Better back button behavior
- Improved app lifecycle management
- Enhanced performance on Android devices

### 🎯 Other Improvements
- Updated referral message design
- Enhanced leaderboard UI with user highlighting
- Improved modal standardization
- Better error handling and user feedback

---

## Previous Versions

### Version 1.0.4 and earlier
- Initial release features
- Core gameplay mechanics
- User authentication system
- Daily check-in rewards
- Leaderboard functionality
- In-app purchases
- Achievement system

---

## Notes

- All versions maintain backward compatibility with user data
- User progress and unlocked themes are preserved across updates
- Security updates are applied automatically with each release
- For detailed technical changes, refer to the git commit history
