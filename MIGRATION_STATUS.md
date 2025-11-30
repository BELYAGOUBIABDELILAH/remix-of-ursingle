# 🎨 CityHealth - Migration vers Google Antigravity
**Date de début:** 2025-01-XX  
**Phase actuelle:** Phase 1 - Design System ✅ COMPLÉTÉ

---

## 📊 Vue d'ensemble

Cette migration transforme complètement CityHealth :
- ✅ Design System Antigravity (ultra-minimal, Google Material 3)
- 🔄 Migration Firebase (en attente)
- 🔄 Remplacement Leaflet Maps (en attente)
- ✅ Suppression dark mode
- 🔄 Nouvelles features (vérification, claiming, ads)

---

## ✅ Phase 1: Design System Antigravity - COMPLÉTÉ

### 🎨 Changements visuels appliqués

#### 1. Couleurs & Thème
- ✅ Background: Pure white `#FFFFFF`
- ✅ Primary text: `#202124` (Google dark grey)
- ✅ Secondary text: `#5F6368`
- ✅ Accent: Google Blue `#4285F4`
- ✅ Suppression complète du dark mode
- ✅ Suppression de toutes les variantes dark dans `index.css`

#### 2. Typography
- ✅ Font principale: DM Sans (Google Sans fallback)
- ✅ Font arabe: Tajawal (conservée)
- ✅ Hero: 60-72px
- ✅ Body: 18-20px
- ✅ Letter-spacing: -0.01em (tight)
- ✅ Font-weight: 500-700

#### 3. Layout & Spacing
- ✅ Nouveau système de spacing (xs → 3xl)
- ✅ Section-spacing: 20-32rem verticalement
- ✅ Container-wide: max-w-7xl
- ✅ Massive whitespace entre sections

#### 4. Composants créés
- ✅ **AntigravityHeader**: Header minimal avec logo seul
  - Navigation: Product, Use Cases↓, Pricing, Blog, Resources↓
  - CTA: Black pill button "Get Started"
  - Sticky avec transition transparent→white
  - Language selector intégré

- ✅ **AntigravityHero**: Hero avec particles animés
  - Canvas avec 50 particules bleues
  - Connexions animées entre particules
  - Headline centré + dual CTA buttons
  - Stats minimales en bas

- ✅ **AntigravityIndex**: Page d'accueil refaite
  - Utilise les nouveaux composants
  - Section spacing massif
  - Intègre FeaturedProviders, Testimonials, ProviderCTA

#### 5. Styles & Utilities
- ✅ `.btn-pill` / `.btn-primary-pill` / `.btn-secondary-pill`
- ✅ `.shadow-soft` / `.shadow-lifted`
- ✅ `.section-spacing` / `.container-wide`
- ✅ `.hover-lift` animation
- ✅ Animations réduites: fade-in, slide-up uniquement
- ✅ Prefers-reduced-motion support

#### 6. Fichiers modifiés
```
✅ index.html - Google Sans fonts
✅ src/index.css - Design system complet refait
✅ tailwind.config.ts - Config simplifiée, suppression dark mode
✅ src/App.tsx - Suppression ThemeProvider
✅ src/components/AntigravityHeader.tsx - Nouveau
✅ src/components/AntigravityHero.tsx - Nouveau
✅ src/pages/AntigravityIndex.tsx - Nouveau
```

---

## 🔄 Phase 2: Migration Firebase (EN ATTENTE)

### Tâches à faire

#### 1. Installation Firebase
```bash
npm install firebase
```

#### 2. Configuration Firebase
- [ ] Créer projet Firebase Console
- [ ] Obtenir credentials (apiKey, authDomain, etc.)
- [ ] Créer `src/lib/firebase.ts` avec config
- [ ] Setup Firebase Authentication
- [ ] Setup Firestore Database
- [ ] Setup Firebase Storage

#### 3. Suppression Supabase
- [ ] Supprimer tous les imports `@supabase/supabase-js`
- [ ] Supprimer `src/integrations/supabase/` (garder migrations SQL en archive)
- [ ] Supprimer tous les `supabaseClient` calls
- [ ] Supprimer `src/services/fileUploadService.ts` (Supabase Storage)

#### 4. Migration Auth
- [ ] Remplacer `AuthContext.tsx` avec Firebase Auth
- [ ] Implémenter email/password auth
- [ ] Implémenter Google OAuth
- [ ] Migrer logique de roles (patient/provider/admin)
- [ ] Créer collection Firestore `user_roles`

#### 5. Migration Database
**Collections Firestore à créer:**
```typescript
// providers
{
  id: string,
  name: string,
  type: string,
  verified: boolean,
  coordinates: { lat: number, lng: number },
  // ... autres champs
}

// appointments
{
  id: string,
  patientId: string,
  providerId: string,
  scheduledAt: timestamp,
  status: 'pending' | 'confirmed' | 'cancelled'
}

// reviews
{
  id: string,
  providerId: string,
  userId: string,
  rating: number,
  comment: string,
  status: 'pending' | 'approved'
}

// favorites
{
  id: string,
  userId: string,
  providerId: string,
  createdAt: timestamp
}
```

#### 6. Migration Storage
- [ ] Remplacer uploads Supabase Storage → Firebase Storage
- [ ] Buckets: `provider-documents`, `provider-photos`
- [ ] Update FileUpload component
- [ ] Migrer URLs existantes

#### 7. Rules & Security
- [ ] Firestore Security Rules
- [ ] Storage Security Rules
- [ ] Auth triggers (onCreate user → create user_roles doc)

---

## 🗺️ Phase 3: Leaflet Maps (EN ATTENTE)

### Dépendances installées
```
✅ leaflet@latest
✅ react-leaflet@latest
❌ mapbox-gl (package non trouvé, mais à supprimer si présent)
```

### Tâches à faire

#### 1. Suppression Google Maps
- [ ] Identifier tous les composants utilisant Google Maps
- [ ] Supprimer packages `@googlemaps/*`
- [ ] Supprimer Google Maps API keys
- [ ] Supprimer tous les imports `mapbox-gl`

#### 2. Implémentation Leaflet
- [ ] Créer `src/components/LeafletMap.tsx`
- [ ] Intégrer OpenStreetMap tiles
- [ ] Configurer markers pour providers
- [ ] Ajouter popups avec info providers
- [ ] Implémenter clustering (react-leaflet-cluster)
- [ ] Custom marker icons

#### 3. Données Géographiques
- [ ] Vérifier que tous les providers ont `latitude` et `longitude`
- [ ] Ajouter géolocalisation user (navigator.geolocation)
- [ ] Centrer carte sur Sidi Bel Abbès par défaut (35.1953°N, -0.6371°W)

#### 4. Features Carte
- [ ] Zoom controls
- [ ] Search address
- [ ] Filter markers par type provider
- [ ] Directions (optionnel)
- [ ] Mobile responsive

---

## 🎯 Phase 4: Nouvelles Features (EN ATTENTE)

Basé sur les réponses user, implémenter :

### 1. Système de Vérification Providers
- [ ] Table Firestore `verification_requests`
- [ ] Provider peut demander vérification
- [ ] Upload documents (licence, certificats)
- [ ] Queue admin pour approval
- [ ] Badge "Vérifié" après approval
- [ ] Email notifications

### 2. Profile Claiming
- [ ] Liste providers pré-chargés (sans compte)
- [ ] Search par nom/spécialité
- [ ] Bouton "Claim this profile"
- [ ] Formulaire preuve d'identité
- [ ] Admin approval flow
- [ ] Transfert ownership

### 3. Publicités Médicales
- [ ] Table Firestore `medical_ads`
- [ ] Formulaire création annonce (providers vérifiés only)
- [ ] Champs: titre, description, image, lien
- [ ] Admin moderation queue
- [ ] Carousel homepage
- [ ] Display inline dans search results

---

## 📋 Checklist Complète

### Design System ✅
- [x] Couleurs Antigravity
- [x] Typography Google Sans / DM Sans
- [x] Suppression dark mode
- [x] Nouveau header
- [x] Nouveau hero avec particles
- [x] Page d'accueil refaite
- [x] Spacing system
- [x] Pill buttons
- [x] Shadows Material

### Firebase 🔄
- [ ] Installation
- [ ] Configuration
- [ ] Auth migration
- [ ] Database migration
- [ ] Storage migration
- [ ] Security rules
- [ ] Suppression Supabase

### Leaflet 🔄
- [ ] Installation (✅ fait)
- [ ] Composant LeafletMap
- [ ] Markers providers
- [ ] Clustering
- [ ] Popups
- [ ] Geolocation
- [ ] Suppression Google Maps

### Features 🔄
- [ ] Vérification providers
- [ ] Profile claiming
- [ ] Publicités médicales

### Optimisation 🔄
- [ ] Code splitting
- [ ] Image optimization (WebP)
- [ ] Lazy loading
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] SEO (meta tags, sitemap)

### Tests 🔄
- [ ] Setup Vitest
- [ ] Tests unitaires hooks
- [ ] Tests E2E Playwright
- [ ] Tests user flows

---

## 🚀 Prochaines Étapes Recommandées

### Étape Immédiate
1. **Valider le nouveau design** avec stakeholders
2. **Tester la nouvelle page d'accueil** sur mobile/desktop
3. **Décider si continuer Firebase** ou garder Supabase

### Si Firebase ✅
1. Créer projet Firebase Console
2. Obtenir credentials
3. Commencer migration Auth (priorité haute)
4. Puis Database, puis Storage

### Si Supabase ✅ (garder)
1. Passer directement à Leaflet Maps
2. Puis implémenter nouvelles features
3. Optimisations performance

---

## 📝 Notes Techniques

### Breaking Changes
- ⚠️ **Dark mode supprimé**: Toutes les pages seront en light mode uniquement
- ⚠️ **ThemeProvider retiré**: Supprimer tous les imports `useTheme()`
- ⚠️ **Nouvelles classes CSS**: Utiliser `btn-pill`, `section-spacing`, etc.

### Design Tokens
```css
/* Spacing */
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem
--spacing-2xl: 3rem
--spacing-3xl: 4rem

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl

/* Radius */
--radius: 0.5rem (standard)
--radius-pill: 9999px (buttons)
```

### Animations
**Conservées:**
- `animate-fade-in`
- `animate-slide-up`
- `hover-lift`

**Supprimées:**
- `animate-typewriter`
- `animate-spotlight`
- `animate-shake`
- `animate-glow`
- `animate-pulse-slow`

---

## 🐛 Issues Connus

1. ~~Mapbox-gl package: Tentative de suppression a échoué~~ ✅ RÉSOLU
2. ~~Old Index pages: `NewIndex.tsx` existe toujours~~ → À supprimer après validation complète
3. ~~ThemeContext references: Chercher tous les `useTheme()` dans le codebase~~ ✅ RÉSOLU
   - FloatingSidebar.tsx - Supprimé toggle theme
   - Navbar.tsx - Supprimé toggle theme
   - Header.tsx - Supprimé toggle theme
   - sonner.tsx - Hardcodé theme="light"

---

## ✅ Fix Critique Appliqué (2025-01-XX)

### Problème: `useTheme must be used within a ThemeProvider`

**Cause:** ThemeProvider supprimé de App.tsx mais 4 composants utilisaient encore useTheme()

**Fichiers corrigés:**
- ✅ `src/components/FloatingSidebar.tsx` - Supprimé toggle dark mode
- ✅ `src/components/Navbar.tsx` - Supprimé toggle dark mode
- ✅ `src/components/layout/Header.tsx` - Supprimé toggle dark mode (desktop + mobile)
- ✅ `src/components/ui/sonner.tsx` - Hardcodé theme="light"
- ✅ Supprimé imports `Moon`, `Sun` inutilisés

**Résultat:** App fonctionne maintenant en light mode uniquement (Antigravity design)

---

## 📞 Support

Pour questions sur cette migration:
- Voir `RAPPORT_ANALYSE_COMPLETE.md` pour analyse technique complète
- Voir `ROUTES.md` pour mapping routes actuelles
- Voir `CHANGELOG_CLEANUP.md` pour historique nettoyages

**Dernière mise à jour:** 2025-01-XX
