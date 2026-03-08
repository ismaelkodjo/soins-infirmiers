

## Diagnostic

Le dashboard patient a deux problèmes :

1. **Les cartes "Accès rapide" ne sont pas cliquables** — elles n'ont aucun lien (`<Link>`) ni gestionnaire de clic. Ce sont juste des `<div>` visuels sans action.

2. **Les rendez-vous sont en dur (hardcodés)** — les données sont statiques dans le code, pas liées à une base de données. Il n'y a pas de table `appointments` dans la base.

## Plan d'implémentation

### 1. Créer une table `appointments` en base de données
- Colonnes : `id`, `user_id`, `date`, `time`, `type`, `status`, `created_at`
- RLS : chaque patient ne voit que ses propres rendez-vous

### 2. Créer les pages pour chaque section
- **`/espace-patient/rendez-vous`** — liste des rendez-vous depuis la base, avec possibilité d'en demander un nouveau
- **`/espace-patient/documents`** — page placeholder pour les documents
- **`/espace-patient/suivi`** — page placeholder pour le suivi santé
- **`/espace-patient/profil`** — modification du profil (display_name, avatar)

### 3. Rendre les cartes cliquables
- Transformer chaque carte en `<Link>` vers la sous-page correspondante

### 4. Charger les rendez-vous depuis la base
- Remplacer les données statiques par une requête Supabase sur la table `appointments`
- Filtrer par `user_id = auth.uid()`

### 5. Mettre à jour le routage
- Ajouter les nouvelles routes dans `App.tsx`, toutes protégées par `ProtectedRoute`

