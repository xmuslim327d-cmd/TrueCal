# TrueCal

A premium, fully offline Android calculator by TrueDevs.

## Features

- Fast arithmetic: +, −, ×, ÷
- Decimal calculations
- Percentage
- Positive/negative toggle
- Backspace
- Dark premium UI
- Fully offline
- Android APK build with Expo EAS

## Build the APK

Install dependencies, log in to Expo, then run:

```bash
npm install
npm install --global eas-cli
eas login
eas build --platform android --profile preview
```

The preview profile produces an installable `.apk`.
