# Punk Admin Dashboard & Backend (Vercel + Supabase)

Panel de administración centralizado y Backend API para la plataforma **Punk** (Parlante de Cobros & Inteligencia de Negocios para Yape, Plin y BCP).

## 🚀 Arquitectura
- **Frontend / Fullstack:** Next.js 14 App Router, TypeScript, TailwindCSS, Lucide Icons.
- **Backend APIs:**
  - `POST /api/licenses/validate`: Endpoint consumido por el aplicativo móvil Android para validar credenciales y vincular el `deviceId` (Device Locking Anti-Piratería).
  - `GET / POST / PATCH / DELETE /api/merchants`: CRUD completo de comercios y licencias.
  - `GET /api/bi/stats`: Métricas analíticas de Business Intelligence.
- **Base de Datos:** PostgreSQL en **Supabase** (script completo incluido en `schema.sql`).
- **Despliegue:** Optimizado para despliegue serverless en **Vercel**.

---

## 🛠️ Configuración de Base de Datos en Supabase

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Abre la pestaña **SQL Editor** en Supabase.
3. Copia y pega el contenido completo de `schema.sql` y presiona **Run**.
4. En **Project Settings > API**, copia:
   - `Project URL`
   - `anon public key`
5. Crea tu archivo `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=tu_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```
*(Nota: Si no configuras las credenciales de Supabase de inmediato, el dashboard cuenta con un almacén local in-memory preconfigurado con comercios de prueba para que funcione inmediatamente al ejecutarlo).*

---

## ⚡ Despliegue en Vercel en 1 Minuto

1. Sube esta carpeta `punk-admin-dashboard` a un nuevo repositorio en tu GitHub (por ejemplo `punk-admin-dashboard`).
2. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu GitHub.
3. Presiona **Add New... > Project** y selecciona el repositorio `punk-admin-dashboard`.
4. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Presiona **Deploy**. Vercel te dará una URL en vivo (ejemplo: `https://punk-admin-dashboard.vercel.app`).
