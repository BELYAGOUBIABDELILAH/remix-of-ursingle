# 🗺️ CityHealth - Documentation des Routes

## Routes Publiques (Non Authentifiées)

| Route | Composant | Description | Priorité |
|-------|-----------|-------------|----------|
| `/` | NewIndex | Page d'accueil principale avec hero, recherche rapide, providers featured | P0 |
| `/search` | SearchPage | Recherche avancée de professionnels avec filtres | P0 |
| `/providers` | ProvidersPage | Liste complète des professionnels de santé | P1 |
| `/provider/:id` | ProviderProfilePage | Profil détaillé d'un professionnel avec reviews, booking | P0 |
| `/map` | MapPage | Carte interactive des professionnels | P1 |
| `/emergency` | EmergencyPage | Services d'urgence 24/7 | P1 |
| `/contact` | ContactPage | Formulaire de contact | P2 |
| `/why` | WhyPage | Pourquoi utiliser CityHealth | P2 |
| `/how` | HowPage | Comment utiliser la plateforme | P2 |
| `/ai-health-chat` | AIHealthChat | Assistant santé IA (chat complet) | P1 |

## Routes Protégées (Authentification Requise)

### Patients (role: 'patient')

| Route | Composant | Description | Auth |
|-------|-----------|-------------|------|
| `/dashboard` | PatientDashboard | Dashboard patient avec RDV, avis, favoris | ✅ Patient |
| `/profile` | UserProfilePage | Profil utilisateur avec tabs (info, notifications, sécurité) | ✅ Any Auth |
| `/favorites` | FavoritesPage | Liste des professionnels favoris | ✅ Any Auth |
| `/settings` | Settings | Paramètres du compte | ✅ Any Auth |

### Professionnels de Santé (role: 'provider')

| Route | Composant | Description | Auth |
|-------|-----------|-------------|------|
| `/provider/register` | ProviderRegister | Inscription professionnel (multi-step) | ✅ Provider |
| `/provider/dashboard` | ProviderDashboard | Dashboard professionnel avec RDV, avis, stats | ✅ Provider |

### Administrateurs (role: 'admin')

| Route | Composant | Description | Auth |
|-------|-----------|-------------|------|
| `/admin/dashboard` | AdminDashboard | Gestion plateforme : approbations, analytics, modération | ✅ Admin |

## Routes Utilitaires

| Route | Composant | Description |
|-------|-----------|-------------|
| `/import` | Import | Import de données (usage interne) |
| `/manage` | ManagePage | Gestion de contenus |
| `*` (404) | NotFound | Page non trouvée |

---

## Composants Globaux (Présents sur toutes pages)

- `<Header />` - Navigation principale avec auth modal
- `<FloatingSidebar />` - Sidebar flottante
- `<AIChatbot />` - Widget de chat IA (fixed bottom-right)
- `<PageTransition />` - Wrapper d'animation pour transitions

---

## Flux Utilisateurs

### 1. Patient - Prendre un RDV

```
/ (Home) 
  → /search (Recherche) 
  → /provider/:id (Profil) 
  → BookingModal (RDV) 
  → /dashboard (Confirmation)
```

### 2. Patient - Laisser un avis

```
/dashboard (Mes RDV passés)
  → ReviewSystem modal
  → Avis soumis (status: pending)
```

### 3. Provider - S'inscrire

```
/provider/register (Multi-step)
  → Step 1: Infos de base
  → Step 2: Spécialité & localisation
  → Step 3: Documents (licence, photos)
  → Step 4: Vérification
  → Status: pending → Admin approuve → /provider/dashboard
```

### 4. Admin - Modérer

```
/admin/dashboard
  → Tab "Approbations"
  → Approuver/Rejeter provider
  → Notification email envoyée
```

---

## Routes à Supprimer (Legacy / Doublons)

Les routes suivantes ont été nettoyées :

- ❌ `/profile` (ancienne) → Remplacée par UserProfilePage protégée
- ❌ `/admin` (ancienne) → Remplacée par `/admin/dashboard`
- ❌ Tous les composants `src/components/landing/*` → Non utilisés, supprimés

---

## Conventions

### Protection des Routes

**ProtectedRoute** wrapper avec options :
```tsx
// Auth requise (any role)
<ProtectedRoute>
  <Component />
</ProtectedRoute>

// Role spécifique requis
<ProtectedRoute requireRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### Nommage des Routes

- **Kebab-case** : `/ai-health-chat` ✅
- **Pas de trailing slash** : `/search` ✅ (pas `/search/`)
- **Paramètres** : `/provider/:id` (id dynamique)

### PageTransition

Toutes les pages sont wrappées dans `<PageTransition>` pour animations :
```tsx
<Route path="/" element={
  <PageTransition>
    <NewIndex />
  </PageTransition>
} />
```

---

## Ordre de Priorité des Routes (React Router)

⚠️ **Important**: Routes plus spécifiques AVANT routes génériques !

```tsx
// ✅ CORRECT
<Route path="/provider/register" element={...} />
<Route path="/provider/:id" element={...} />

// ❌ INCORRECT (/:id capte tout)
<Route path="/provider/:id" element={...} />
<Route path="/provider/register" element={...} />
```

---

## Migration TODO

### Phase 1 : Sécurité Auth (Urgent)
- [ ] Migrer AuthContext vers Supabase Auth
- [ ] Ajouter RLS policies sur routes protégées
- [ ] Créer table `user_roles`

### Phase 2 : Backend Routes
- [ ] Connecter `/provider/register` à DB Supabase
- [ ] Connecter `/dashboard` aux vraies données (appointments, reviews)
- [ ] Ajouter edge function pour notifications

### Phase 3 : Nouvelles Features
- [ ] Route `/telehealth` (vidéo consultation)
- [ ] Route `/insurance` (partenaires assurance)
- [ ] Route `/blog` (articles santé)

---

**Dernière mise à jour:** 2025-01-XX  
**Maintenu par:** CityHealth Dev Team