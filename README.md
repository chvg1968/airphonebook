# Airphonebook (Booking App)

## Overview

Airphonebook is a web application designed to manage and display contact information using a structured and interactive interface. The application fetches data from **Supabase** and organizes it into sections and categories for easy navigation.

## Project Structure

```
/airphonebook
│
├── .env                          # Variables de entorno (credenciales)
├── .env.example                  # Plantilla de variables de entorno
├── .well-known/
│   └── security.txt              # Vulnerability reporting contact
├── HomePage.html
├── index.html
├── index.js
├── package.json
├── netlify.toml                  # Configuración de Netlify + Security Headers
├── script.js
├── styles.css
├── assets/
├── netlify/
│   └── functions/
│       └── fetchContacts.js      # Función serverless (backend)
└── src/
    ├── html/
    │   └── pages/
    │       ├── villaclara.html
    │       └── [other HTML files]
    └── js/
        ├── api.js                # Cliente API (frontend)
        ├── constants.js
        └── tree.js
```

### Key Directories and Files

| Archivo | Descripción |
|---------|-------------|
| `netlify/functions/fetchContacts.js` | Función serverless que conecta con Supabase |
| `src/js/api.js` | Módulo frontend que consume la API (con caché IndexedDB) |
| `src/js/indexedDBCache.js` | Módulo de caché local con IndexedDB |
| `src/js/constants.js` | Constantes de la aplicación (iconos, secciones) |
| `src/js/tree.js` | Renderizado del árbol de navegación |
| `.env` | Variables de entorno (no subir a Git) |
| `.env.example` | Plantilla para configurar el proyecto |

---

## Architecture

### Data Flow

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────┐
│   Usuario   │ ──► │  Función Serverless  │ ──► │  Supabase   │
│  (Browser)  │ ◄── │  (Netlify Function)  │ ◄── │  Database   │
└─────────────┘     └──────────────────────┘     └─────────────┘
      │                      │                         │
      │   GET /api/          │   SELECT * FROM         │
      │   fetchContacts      │   Contacts              │
      │                      │                         │
      ▼
┌─────────────┐
│  IndexedDB  │  ◄── Caché local (offline-first)
│   (Local)   │
└─────────────┘
```

### Request Lifecycle (with Caching)

1. **Usuario abre la app** → Frontend carga
2. **Frontend (`api.js`)** → Verifica si hay datos en IndexedDB
3. **Si hay caché** → Retorna datos instantáneamente al usuario
4. **En background** → Hace fetch a `/api/fetchContacts`
5. **Netlify** → Recibe la petición y ejecuta `fetchContacts.js`
6. **Función serverless** → Usa variables de entorno para conectar a Supabase
7. **Supabase** → Verifica RLS policies → Retorna datos
8. **Función serverless** → Responde con JSON al frontend
9. **Frontend** → Compara con caché, actualiza IndexedDB si hay cambios
10. **UI** → Se actualiza automáticamente con datos frescos

### Security Model

```
┌─────────────────────────────────────────────────────────┐
│                      SUPABASE                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Tabla: Contacts                     │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │    RLS Policy: SELECT = true            │    │   │
│  │  │    (Solo lectura permitida)             │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │                                                  │   │
│  │  ✅ SELECT (leer)     → Permitido               │   │
│  │  ❌ INSERT (crear)    → Bloqueado               │   │
│  │  ❌ UPDATE (editar)   → Bloqueado               │   │
│  │  ❌ DELETE (eliminar) → Bloqueado               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd airphonebook
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_TABLE_NAME=Contacts
```

### 4. Configure Supabase

1. Create a project in [Supabase](https://supabase.com)
2. Create a table called `Contacts` with these columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | int8 | Primary key, auto-increment |
| `icon` | text | Emoji or icon identifier |
| `name` | text | Contact name |
| `phone` | text | Phone number(s) |
| `section` | text | Section grouping |
| `category` | text | Category within section |
| `subcategories` | text | Sub-category |
| `description` | text | Contact description |

3. Enable Row Level Security (RLS) and create a read policy:

```sql
CREATE POLICY "Enable read access for all users"
ON public."Contacts"
FOR SELECT
USING (true);
```

### 5. Run locally

```bash
# Using Netlify CLI (recommended)
netlify dev

# Or use a local server for static files
npx serve .
```

### 6. Deploy to Netlify

1. Push your code to GitHub
2. Connect the repository to Netlify
3. Add environment variables in Netlify Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_TABLE_NAME`

---

## API Reference

### GET `/api/fetchContacts`

Returns all contacts from the database.

**Response:**
```json
{
  "contacts": [
    {
      "id": 1,
      "icon": "🚑",
      "name": "Emergency Services",
      "phone": "911",
      "section": "Medical and Security Emergencies",
      "category": "Emergency",
      "subcategories": null,
      "description": "Call for emergencies"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database with REST API |
| **Netlify Functions** | Serverless backend |
| **IndexedDB** | Client-side caching (offline-first) |
| **Vanilla JS** | Frontend (no framework) |
| **HTML/CSS** | UI structure and styling |

---

## Security

### HTTP Security Headers

The application implements security headers via `netlify.toml`:

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Controls which resources can be loaded |
| `Strict-Transport-Security` | Forces HTTPS connections |
| `X-Frame-Options` | Prevents clickjacking attacks |
| `X-Content-Type-Options` | Prevents MIME sniffing |
| `X-XSS-Protection` | Enables browser XSS filtering |
| `Referrer-Policy` | Controls referrer information |
| `Permissions-Policy` | Restricts browser features (camera, mic, geolocation) |

### Vulnerability Reporting

Security issues can be reported via:
- Email: See `/.well-known/security.txt`
- URL: `https://luxepropertiespr.info/.well-known/security.txt`

---

## Migration History

### v2.1 - IndexedDB Caching (January 2025)

Added client-side caching with IndexedDB using the **Stale-While-Revalidate** pattern for improved performance and offline support.

**New Files:**
- `src/js/indexedDBCache.js` - IndexedDB cache module

**Changes:**
- `src/js/api.js` - Now implements stale-while-revalidate caching strategy
- `src/js/tree.js` - Added refresh button and last update indicator
- `src/html/pages/model.html` - Added cache status UI
- `assets/styles/components/layout.css` - Added cache indicator styles

**How It Works:**

```
┌─────────────────────────────────────────────────────────────┐
│                 Stale-While-Revalidate                       │
├─────────────────────────────────────────────────────────────┤
│  1. User opens app                                           │
│  2. Return cached data INSTANTLY (if available)              │
│  3. Fetch fresh data from server in background               │
│  4. Compare with cache                                       │
│  5. If changed → Update IndexedDB + Notify UI                │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- ⚡ **Instant loading** - Data appears immediately from cache
- 📴 **Offline support** - App works without internet connection
- 🔄 **Always fresh** - Background sync keeps data updated
- 💾 **Persistent** - Data survives browser restarts
- 🎯 **Manual refresh** - Users can force update with refresh button

**UI Features:**
- "Last updated: X minutes ago" indicator
- Refresh button with spinning animation
- Automatic background sync on page load

**API Functions:**
```javascript
// Main fetch with caching
import { fetchAllContacts } from './api.js';
const contacts = await fetchAllContacts();

// Force refresh from server
import { forceRefresh } from './api.js';
const freshContacts = await forceRefresh();

// Get last update time
import { getLastUpdateFormatted } from './api.js';
const lastUpdate = await getLastUpdateFormatted(); // "5 min ago"
```

**IndexedDB Structure:**
| Store | Purpose |
|-------|---------|
| `contacts` | Cached contact records |
| `metadata` | Last update timestamp |

---

### v2.0 - Supabase Migration (January 2025)

Migrated from Airtable to Supabase for improved performance and simplified architecture.

**Changes:**
- Replaced `airtable` package with `@supabase/supabase-js`
- Simplified `fetchContacts.js` (removed caching layer)
- Simplified `api.js` (Supabase returns flat data)
- Updated environment variables

**Benefits:**
- Faster queries (PostgreSQL vs Airtable API)
- Simpler data structure (no nested `fields` object)
- Better security with Row Level Security (RLS)
- Lower latency (direct database connection)

---

## Contributing

Feel free to submit issues or pull requests. Contributions are welcome!

## License

This project is licensed under the MIT License.
