# 🔥 Configuration Firebase - CityHealth

## 📋 Prérequis
- Node.js 18+, Firebase CLI: `npm install -g firebase-tools`

---

## 🚀 Setup

### 1. Services à activer
- **Authentication**: Email/Password + Google
- **Firestore**: Mode production, région `europe-west1`
- **Storage**: Pour uploads prestataires

### 2. Déployer les règles
```bash
firebase deploy --only firestore:rules,storage,firestore:indexes
```

---

## 🔐 Règles Firestore (résumé)

```javascript
// profiles: lecture auth, écriture owner
// user_roles: lecture auth, écriture admin
// providers: lecture publique, écriture auth
// favorites: owner only
```

---

## 📑 Index Requis

- `favorites`: userId + createdAt
- `providers`: specialty + city, type + verificationStatus + isPublic

---

## ☁️ Cloud Function AI Chat

```bash
cd firebase-functions/ai-chat
npm install
firebase functions:config:set openai.key="sk-..."
firebase deploy --only functions:aiChat
```

---

## 👤 Créer un Admin

Dans Firestore, ajouter document:
```
Collection: user_roles
Doc ID: {uid}_admin
Fields: { user_id, role: "admin", created_at }
```

---

## 🧪 Vérification

1. Créer compte → vérifier Authentication
2. Uploader image → vérifier Storage
3. Tester règles via Console → Firestore → Simulateur
