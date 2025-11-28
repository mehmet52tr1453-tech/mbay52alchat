# Al-Chat Project Structure

## Schema
```
al-chat/
├─ backend/
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ users.js
│  │  ├─ chats.js
│  │  ├─ ai_chat.js
│  │  ├─ stripe.js
│  │  ├─ upload.js
│  │  └─ admin.js
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Chat.js
│  │  └─ Message.js
│  ├─ jobs/
│  │  └─ resetTokens.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  └─ admin.js
│  └─ server.js
├─ admin-panel/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ ModelSelect.jsx
│  │  │  ├─ BulkUpload.jsx
│  │  │  └─ LiveStats.jsx
│  │  ├─ pages/
│  │  │  └─ Users.jsx
│  │  └─ App.jsx
│  └─ public/
│     └─ sample_token.xlsx
├─ mobile_app/
│  ├─ lib/
│  │  ├─ screens/
│  │  │  ├─ login.dart
│  │  │  ├─ home.dart
│  │  │  ├─ chat_1v1.dart
│  │  │  ├─ chat_ai.dart
│  │  │  ├─ shop_page.dart
│  │  │  ├─ call_screen.dart
│  │  │  └─ search_user.dart
│  │  ├─ services/
│  │  │  ├─ auth_service.dart
│  │  │  ├─ socket_service.dart
│  │  │  ├─ api.dart
│  │  │  └─ signalling.dart
│  │  └─ main.dart
│  └─ pubspec.yaml
└─ README.md
```

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. `npm run dev`

### Admin Panel
1. `cd admin-panel`
2. `npm install`
3. `npm run dev`

### Mobile App
1. `cd mobile_app`
2. `flutter pub get`
3. `flutter run`
