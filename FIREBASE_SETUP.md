# Firebase Setup Guide for CityHealth

## Prerequisites
- Firebase project created: `cityhealth-ec7e7`
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase credentials configured in `src/lib/firebase.ts`

---

## 1. Firebase Console Configuration

### Authentication
1. Go to Firebase Console → Authentication
2. Enable sign-in methods:
   - ✅ Email/Password
   - ✅ Google OAuth
3. Add authorized domains (if needed)

### Firestore Database
1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Set up security rules (see below)

### Storage
1. Go to Firebase Console → Storage
2. Create default bucket
3. Set up security rules (see below)

---

## 2. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Profiles - users can read all, but only write their own
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User roles - read only for authenticated users, write only for admins
    match /user_roles/{roleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/user_roles/$(request.auth.uid + '_admin'));
    }
    
    // Analytics - authenticated users can write, admins can read
    match /analytics_events/{eventId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/user_roles/$(request.auth.uid + '_admin'));
      allow write: if request.auth != null;
    }
    
    // Favorites - users can only read/write their own
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Providers - public read, authenticated write
    match /providers/{providerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 3. Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Provider documents - authenticated users can upload, only owners can read
    match /provider-documents/{providerId}/{allPaths=**} {
      allow read: if request.auth != null && 
        (request.auth.uid == providerId || 
         exists(/databases/(default)/documents/user_roles/$(request.auth.uid + '_admin')));
      allow write: if request.auth != null && request.auth.uid == providerId;
    }
  }
}
```

---

## 4. Deploy Firebase Cloud Functions

### Install Firebase Tools
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### Deploy AI Chat Function
1. Navigate to your project root
2. Copy `firebase-functions/ai-chat/index.js` to `functions/index.js`
3. Configure AI API key:
   ```bash
   firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY"
   ```
4. Deploy:
   ```bash
   firebase deploy --only functions:aiChat
   ```
5. Update `src/services/aiChatService.ts` with the deployed function URL

---

## 5. Initialize Firestore Collections

### Create Initial Admin User
After creating your first user, add admin role via Firebase Console:

1. Go to Firestore Database
2. Create document in `user_roles` collection:
   ```
   Document ID: {userId}_admin
   Fields:
     user_id: {userId}
     role: "admin"
     created_at: (timestamp)
   ```

### Seed Provider Data (Optional)
You can import provider data using Firebase Admin SDK or manually through Console.

---

## 6. Environment Variables

Create `.env.local` in project root (for local development):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDo8AhKuuXiH2yC9MhgCZr9TxaouBvEyWU
VITE_FIREBASE_AUTH_DOMAIN=cityhealth-ec7e7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cityhealth-ec7e7
VITE_FIREBASE_STORAGE_BUCKET=cityhealth-ec7e7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=817879071839
VITE_FIREBASE_APP_ID=1:817879071839:web:cfe80f4a74f3db14bbafea
```

**Note**: These are already hardcoded in `src/lib/firebase.ts` for now. For production, move them to environment variables.

---

## 7. Testing the Migration

### Test Authentication
1. Visit `/auth` page
2. Try signing up with email/password
3. Try logging in with Google
4. Verify profile created in Firestore
5. Verify user_roles created

### Test Storage
1. Upload a provider document
2. Verify file appears in Firebase Storage
3. Check file is readable by the owner

### Test Analytics
1. Navigate through pages
2. Check `analytics_events` collection in Firestore
3. Verify events are being logged

### Test Favorites
1. Log in as a user
2. Add a provider to favorites
3. Check `favorites` collection in Firestore
4. Verify favorites persist on reload

---

## 8. Migration Checklist

- [ ] Firebase Authentication enabled (Email, Google)
- [ ] Firestore Database created
- [ ] Firestore security rules configured
- [ ] Storage bucket created
- [ ] Storage security rules configured
- [ ] Admin user created in Firestore
- [ ] AI Chat Cloud Function deployed
- [ ] Environment variables configured
- [ ] All authentication flows tested
- [ ] File upload tested
- [ ] Analytics tested
- [ ] Favorites tested

---

## 9. Common Issues

### Issue: "Permission denied" errors in Firestore
**Solution**: Check security rules. Make sure the user is authenticated and has proper permissions.

### Issue: Storage uploads fail
**Solution**: Verify Storage security rules and ensure user is authenticated.

### Issue: Google OAuth redirect fails
**Solution**: Add your domain to authorized domains in Firebase Console → Authentication → Settings.

### Issue: AI Chat returns 404
**Solution**: Deploy the Cloud Function and update the URL in `src/services/aiChatService.ts`.

---

## 10. Production Deployment

### Before going to production:
1. ✅ Review all security rules
2. ✅ Enable Firestore indexes for queries
3. ✅ Set up Firebase Hosting (optional)
4. ✅ Configure custom domain (optional)
5. ✅ Enable Firebase Analytics
6. ✅ Set up monitoring and alerts
7. ✅ Configure backup rules for Firestore
8. ✅ Review Firebase usage quotas

### Recommended Firebase Plan
- **Spark (Free)**: Good for development and testing
- **Blaze (Pay as you go)**: Required for Cloud Functions, recommended for production

---

## Next Steps

1. Configure security rules in Firebase Console
2. Deploy AI Chat Cloud Function
3. Test all features end-to-end
4. Move sensitive config to environment variables
5. Set up CI/CD pipeline for Firebase deployments
