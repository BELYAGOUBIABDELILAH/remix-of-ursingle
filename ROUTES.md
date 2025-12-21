# 🗺️ Routes CityHealth

> Carte complète de la navigation et des routes de l'application

---

## 📊 Vue d'Ensemble

<presentation-mermaid>
graph TD
    A["/"] --> B[Routes Publiques]
    A --> C[Routes Protégées]
    A --> D[Routes Admin]
    
    B --> B1["/search"]
    B --> B2["/carte"]
    B --> B3["/providers"]
    B --> B4["/provider/:id"]
    B --> B5["/blood-donation"]
    B --> B6["/medical-assistant"]
    B --> B7["/contact"]
    
    C --> C1["/profile"]
    C --> C2["/favorites"]
    C --> C3["/dashboard"]
    C --> C4["/provider/register/*"]
    C --> C5["/provider/dashboard"]
    
    D --> D1["/admin/dashboard"]
</presentation-mermaid>

---

## 🌐 Routes Publiques

| Route | Page | Description |
|-------|------|-------------|
| `/` | `AntigravityIndex` | Homepage avec hero, recherche rapide, services |
| `/search` | `SearchPage` | Recherche avancée avec filtres |
| `/providers` | `ProvidersPage` | Liste complète des prestataires |
| `/provider/:id` | `ProviderProfilePage` | Profil détaillé d'un prestataire |
| `/carte` | `CartePage` | Carte interactive Leaflet (mode=all) |
| `/carte?mode=emergency` | `CartePage` | Carte des urgences 24/7 |
| `/carte?mode=blood` | `CartePage` | Carte des centres de don de sang |
| `/blood-donation` | `BloodDonationPage` | Information don de sang |
| `/medical-assistant` | `MedicalAssistantPage` | Assistant IA santé |
| `/ai-health-chat` | `AIHealthChat` | Chat IA complet |
| `/contact` | `ContactPage` | Formulaire de contact |
| `/why` | `WhyPage` | Pourquoi CityHealth |
| `/how` | `HowPage` | Comment utiliser la plateforme |
| `/auth` | `AuthPage` | Connexion / Inscription |

---

## 🔐 Routes Protégées

### Tout Utilisateur Authentifié

| Route | Page | Rôle Requis | Description |
|-------|------|-------------|-------------|
| `/profile` | `CitizenProfilePage` | Tout auth | Profil utilisateur |
| `/favorites` | `FavoritesPage` | Tout auth | Prestataires favoris |
| `/settings` | `Settings` | Tout auth | Paramètres du compte |

### Patients

| Route | Page | Rôle Requis | Description |
|-------|------|-------------|-------------|
| `/dashboard` | `PatientDashboard` | `patient` | Tableau de bord patient |

### Prestataires

| Route | Page | Rôle Requis | Description |
|-------|------|-------------|-------------|
| `/provider/register/*` | `ProviderRegister` | Tout auth | Inscription 6 étapes |
| `/provider/dashboard` | `ProviderDashboard` | `provider` | Tableau de bord prestataire |
| `/registration-status` | `RegistrationStatus` | En attente | Statut de vérification |
| `/registration-thank-you` | `RegistrationThankYou` | Tout auth | Confirmation inscription |

### Administrateurs

| Route | Page | Rôle Requis | Description |
|-------|------|-------------|-------------|
| `/admin/dashboard` | `AdminDashboard` | `admin` | Gestion plateforme |

---

## ↩️ Redirections

| Route Source | Destination | Raison |
|--------------|-------------|--------|
| `/map` | `/carte` | Unification carte Leaflet |
| `/urgences` | `/carte?mode=emergency` | Route legacy |
| `/emergency` | `/carte?mode=emergency` | Redirection vers carte |
| `/providers-map` | `/carte` | Consolidation |

---

## 🛡️ Protection des Routes

### ProtectedRoute Component

```tsx
// Usage basique - auth requise
<ProtectedRoute>
  <FavoritesPage />
</ProtectedRoute>

// Avec rôle spécifique
<ProtectedRoute requireRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Rôles disponibles: 'patient' | 'provider' | 'admin'
```

### VerificationGuard

Redirige les prestataires en attente de vérification vers `/registration-status`.

```tsx
// Chemins autorisés pour prestataires pending:
const allowedPaths = [
  '/registration-status',
  '/provider/register',
  '/settings',
  '/auth',
  '/'
];
```

---

## 🔀 Flux Utilisateurs

### Patient - Trouver un Médecin

```
/ (Homepage)
  └─> /search (Recherche)
      └─> /provider/:id (Profil)
          └─> BookingModal (RDV)
              └─> /dashboard (Confirmation)
```

### Prestataire - S'inscrire

```
/auth (Connexion)
  └─> /provider/register
      ├─> Step 1: Identité
      ├─> Step 2: Informations
      ├─> Step 3: Localisation
      ├─> Step 4: Services
      ├─> Step 5: Médias
      └─> Step 6: Prévisualisation
          └─> /registration-thank-you
              └─> (Attente validation admin)
                  └─> /provider/dashboard
```

### Admin - Valider un Prestataire

```
/admin/dashboard
  └─> Tab "Approbations"
      └─> Approuver/Rejeter
          └─> Notification email
```

---

## 📍 Paramètres d'URL

### Carte (`/carte`)

| Paramètre | Valeurs | Description |
|-----------|---------|-------------|
| `mode` | `all`, `emergency`, `blood` | Filtre les marqueurs |

### Recherche (`/search`)

| Paramètre | Exemple | Description |
|-----------|---------|-------------|
| `type` | `doctor`, `pharmacy` | Type de prestataire |
| `specialty` | `cardiologie` | Spécialité médicale |
| `area` | `centre-ville` | Zone géographique |
| `q` | `dentiste` | Recherche textuelle |

---

## 🧭 Navigation Globale

### Header (Toutes les pages)

```typescript
const navigationSections = {
  decouvrir: ['/why', '/how', '/contact'],
  services: ['/search', '/carte', '/medical-assistant', '/blood-donation'],
  urgences: ['/carte?mode=emergency'],
  pro: ['/provider/register', '/provider/dashboard']
};
```

### FloatingSidebar

Sidebar flottante avec accès rapide aux routes principales.

### Footer

Liens vers toutes les sections principales + mentions légales.

---

## 🚫 Routes Supprimées (Legacy)

| Route | Raison | Alternative |
|-------|--------|-------------|
| `/index` | Doublon | `/` |
| `/new-index` | Doublon | `/` |
| `/antigravity` | Doublon | `/` |
| `/map` | Consolidation | `/carte` |
| `/emergency` | Consolidation | `/carte?mode=emergency` |
| `/providers-map` | Consolidation | `/carte` |
| `/admin` | Renommage | `/admin/dashboard` |

---

## ⚙️ Configuration des Routes

### App.tsx Structure

```tsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<AntigravityIndex />} />
  <Route path="/search" element={<SearchPage />} />
  <Route path="/carte" element={<CartePage />} />
  
  {/* Protected Routes */}
  <Route path="/profile" element={
    <ProtectedRoute>
      <CitizenProfilePage />
    </ProtectedRoute>
  } />
  
  {/* Role-specific Routes */}
  <Route path="/admin/dashboard" element={
    <ProtectedRoute requireRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } />
  
  {/* Registration Flow with Context */}
  <Route path="/provider/register/*" element={
    <RegistrationProvider>
      <ProviderRegister />
    </RegistrationProvider>
  } />
  
  {/* Redirects */}
  <Route path="/map" element={<Navigate to="/carte" replace />} />
  
  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Navigation |
|------------|------------|
| Mobile (<768px) | Hamburger menu |
| Tablet (768-1024px) | Menu condensé |
| Desktop (>1024px) | Navigation complète |
