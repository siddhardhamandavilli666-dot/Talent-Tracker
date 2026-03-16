# TalentTrack Platform 🚀

A production-ready full-stack platform where students showcase talents and organizations discover them.

## Tech Stack
- **Frontend**: React + Vite, React Router v6, Firebase Web SDK
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Email/Password)
- **Storage**: Firebase Storage
- **Styling**: Vanilla CSS (dark glass-morphism design)

## Project Structure

```
Talent Tracker/
├── client/              # React Vite frontend
│   ├── src/
│   │   ├── components/  # Navbar, cards, gallery, routing guards
│   │   ├── context/     # AuthContext
│   │   ├── firebase/    # Firebase client config
│   │   ├── pages/       # Home, Auth, Student, Org, Admin, Discovery
│   │   └── services/    # API service layer
│   └── .env             # Firebase web config (fill in)
└── server/              # Express backend
    ├── config/          # Firebase Admin SDK
    ├── controllers/     # auth, user, achievement, opportunity, application, admin
    ├── middlewares/     # auth, validate, upload
    ├── routes/          # all REST routes
    ├── .env             # Server env (fill in)
    └── server.js        # Entry point
```

## ⚡ Quick Setup

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** (production mode)
4. Enable **Storage**
5. Download **Service Account Key**: Project Settings → Service accounts → Generate new private key → save as `server/config/serviceAccountKey.json`
6. Get **Web App config**: Project Settings → Your apps → Web app

### 2. Configure Environment Variables

**`client/.env`** — fill in Firebase web config:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**`server/.env`** (already configured):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT_KEY=./config/serviceAccountKey.json
```

### 3. Run the App

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🗂️ Firestore Security Rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if true;
      allow write: if request.auth.uid == uid;
    }
    match /achievements/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /opportunities/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /applications/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🛡️ Firebase Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 50 * 1024 * 1024;
    }
  }
}
```

## 🗄️ Firestore Schema

### `users/{uid}`
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "role": "student | organization | admin",
  "photoURL": "string",
  "college": "string",
  "location": "string",
  "bio": "string",
  "skills": ["string"],
  "portfolioLinks": { "github": "", "linkedin": "", "website": "" },
  "verified": false,
  "achievementsCount": 0,
  "createdAt": "timestamp"
}
```

### `achievements/{id}`
```json
{
  "userId": "string",
  "title": "string",
  "description": "string",
  "category": "sports | music | design | leadership | volunteering | technical | academic | other",
  "mediaURL": "string",
  "mediaType": "image | video | document",
  "date": "string",
  "createdAt": "timestamp"
}
```

### `opportunities/{id}`
```json
{
  "orgId": "string",
  "orgName": "string",
  "title": "string",
  "description": "string",
  "category": "internship | competition | scholarship | volunteering | job | other",
  "deadline": "string",
  "location": "string",
  "eligibility": "string",
  "status": "active | closed",
  "applicationsCount": 0,
  "createdAt": "timestamp"
}
```

### `applications/{id}`
```json
{
  "studentId": "string",
  "opportunityId": "string",
  "orgId": "string",
  "message": "string",
  "resumeURL": "string",
  "status": "pending | shortlisted | accepted | rejected",
  "createdAt": "timestamp"
}
```

## 🔑 Making Yourself Admin

After creating your account, go to Firestore Console → `users/{your-uid}` → Edit `role` field to `"admin"`.

## 🚀 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| GET | `/api/auth/me` | Token | Get current user |
| GET | `/api/users` | Org/Admin | Search students |
| GET | `/api/users/:id` | — | Get user profile |
| PUT | `/api/users/:id` | Token | Update profile |
| POST | `/api/achievements` | Student | Upload achievement |
| GET | `/api/achievements/:userId` | — | Get user achievements |
| DELETE | `/api/achievements/:id` | Token | Delete achievement |
| GET | `/api/opportunities` | — | List opportunities |
| POST | `/api/opportunities` | Org | Create opportunity |
| GET | `/api/opportunities/:id` | — | Get opportunity |
| POST | `/api/applications` | Student | Apply to opportunity |
| GET | `/api/applications/opportunity/:id` | Org | View applicants |
| GET | `/api/applications/student/:id` | Token | Student applications |
| PUT | `/api/applications/:id` | Org | Update app status |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/verify` | Admin | Verify profile |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| GET | `/api/health` | — | Health check |

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/signup` | Registration with role selection |
| `/login` | Login |
| `/discover` | Talent discovery with search/filters |
| `/opportunities` | Opportunity board |
| `/opportunities/:id` | Opportunity detail + apply |
| `/profile/:id` | Student profile + achievements |
| `/dashboard/student` | Student dashboard |
| `/dashboard/organization` | Organization dashboard |
| `/dashboard/admin` | Admin dashboard |
