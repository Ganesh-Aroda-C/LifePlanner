# LifeOS Android Companion App

## Overview
This directory contains the architecture and planning for the **LifeOS Android Companion** application (scheduled for Phase 4 of the LifeOS Roadmap).

The mobile companion will be built with **React Native** and **Expo**, providing seamless native synchronisation with the LifeOS backend.

## Key Capabilities (Phase 4)
- **Shared Authentication**: Secure JWT login synchronised with the web application.
- **Bi-directional Task Synchronization**: Offline-first task management with immediate cloud sync.
- **Native Android Alarms**: Reliable alarms and notifications utilizing Android's `AlarmManager` and foreground services for critical tasks.
- **Notification Action Buttons**: One-tap actions to "Acknowledge", "Snooze (15m)", or "Mark Done" directly from Android notifications.
- **SMS & WhatsApp Intake (Phase 5)**: Permissions-compliant local message parsing to suggest tasks without uploading private chats to external third parties.

## Tech Stack
- React Native
- Expo SDK
- React Navigation
- Axios
- Expo Notifications
- Android Native Module bridges for AlarmManager

## Development Setup
*Instructions will be populated upon Phase 4 kickoff.*
