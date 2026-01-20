# Airphonebook (Booking App)

## Overview

Airphonebook is a web application designed to manage and display contact information using a structured and interactive interface. The application fetches data from **Supabase** and organizes it into sections and categories for easy navigation.

## Project Structure

```
/airphonebook
│
├── .env                          # Variables de entorno (credenciales)
├── .env.example                  # Plantilla de variables de entorno
├── HomePage.html
├── index.html
├── index.js
├── package.json
├── netlify.toml                  # Configuración de Netlify
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
| `src/js/api.js` | Módulo frontend que consume la API |
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
```

### Request Lifecycle

1. **Usuario abre la app** → Frontend carga
2. **Frontend (`api.js`)** → Hace fetch a `/api/fetchContacts`
3. **Netlify** → Recibe la petición y ejecuta `fetchContacts.js`
4. **Función serverless** → Usa variables de entorno para conectar a Supabase
5. **Supabase** → Verifica RLS policies → Retorna datos
6. **Función serverless** → Responde con JSON al frontend
7. **Frontend** → Procesa datos y renderiza la UI

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
| **Vanilla JS** | Frontend (no framework) |
| **HTML/CSS** | UI structure and styling |

---

## Migration History

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
