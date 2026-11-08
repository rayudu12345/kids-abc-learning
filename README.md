# Kids ABC Learning

A colorful, beginner-friendly alphabet learning app for children, built with React Native and Expo.

## Features
- Learn letters A–Z with colorful cards
- Tap a letter to hear it spoken
- Learn simple words such as “A is for Apple”
- Emoji illustrations for a lightweight starter experience
- Designed for Android and iOS

## Run locally

1. Install Node.js LTS.
2. Install dependencies with `npm install`.
3. Start Expo with `npx expo start`.
4. Scan the QR code using Expo Go, or press `a` for Android / `i` for the iOS Simulator.

## Expo SDK compatibility

This project uses **Expo SDK 58**. Open it with Expo Go for SDK 58.

After pulling this upgrade, stop the old Expo server and run:

```sh
git pull
npm install
npx expo start --clear
```

Scan the new QR code with Expo Go. If Expo Go still reports SDK 57, make sure the terminal is in this repository and that an older Expo server is not still running.

For future upgrades, follow https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/ and run `npx expo install --fix` to align dependencies.

## Planned next steps
- Add letter tracing
- Add quizzes and progress tracking
- Add optional recorded pronunciation and sound effects
