# SnapDrag — Frontend (Web Application)

> **Discover Online → Check In-Store Stock → Locate Mall Floor & Shop → Hold Free for 48h → Inspect Physically → Purchase Offline**

SnapDrag is a full-stack, mobile-responsive web platform designed for digitizing physical traditional clothing boutiques (specializing in sarees, mekhela chadors, lehengas, salwar suits, and regional handloom wear).

* **Live Frontend**: [https://snap-drag.vercel.app](https://snap-drag.vercel.app)

---

## 🎨 UI/UX Philosophy: Neo-Brutalism

The user interface follows a high-contrast **Neo-Brutalist** aesthetic:
* **Thick Borders**: `border-2`, `border-3`, and `border-4` on cards, modals, and buttons.
* **Hard Drop Shadows**: High-contrast brutalist shadows (`shadow-[4px_4px_0px_#121212]`).
* **Tactile Click Feedback**: Physical button press movement on hover and active click (`active:translate-x-0.5 active:translate-y-0.5`).
* **Signature Color Palette**: 
  * Background Cream: `#FAF7EE`
  * Canary Yellow: `#FFE600`
  * Vivid Pink: `#FF6EA7`
  * Mint Green: `#00E599`
  * Sky Blue: `#38BDF8`
  * Deep Black: `#121212`
* **Typography**: Outfit & Space Mono fonts.

---

## 🌟 Key Features

### 1. 🪞 See Yourself in Mirror (AI Virtual Mirror)
* **Live Camera & Photo Upload**: Snap a selfie with front camera or upload any portrait.
* **Realistic Fabric Drape Engine**: Superimposes the selected traditional outfit over the customer's silhouette with fabric pleat physics, shadow contours, and neckline alignment.
* **3 Interactive Modes**:
  * `🪞 Draped Mirror`: Full fitting-room mirror reflection with position & opacity sliders.
  * `🌓 Side-by-Side Split`: Compare customer silhouette against the artisan store garment.
  * `👗 Outfit Weave`: High-detail view of the handcrafted zari and silk border texture.
* **Gemini AI Master Stylist**: Powered by Google Gemini 2.5 Flash for fit scores (e.g. `96% Match`), pleating guides (Nivi vs Bengali vs Gujarati front drape), and jewelry pairing recommendations.
* **📸 Save Mirror Photo**: Downloads a branded snapshot of the mirror reflection with boutique watermark to share on WhatsApp or with family.
* **Instant 48h Store Hold**: Hold the garment directly from inside the mirror.

### 2. 🗺️ Interactive Map & Mall Floor Navigation
* **Leaflet + Geoapify Tiles**: High-contrast, dark-mode cartography with custom Neo-Brutalist HTML markers.
* **Indoor Floor Hierarchy**: Pinpoints the exact Mall Floor, Shop Number, Section, and walking directions (*e.g., "City Center Mall, 2nd Floor Ethnic Wing, Shop 204"*).
* **Multi-City Discovery**: Quick-hop between **Guwahati, Silchar, Kolkata, Delhi, Mumbai, Bengaluru, Varanasi, Jaipur, and Chennai**.

### 3. 🎟️ In-Store Hold & Physical Inspection (IRL First)
* **Zero Online Payment**: No online carts or courier shipping.
* **Atomic 48-Hour Reservation**: Generates a verified pickup code (*e.g., `TRAD-8F42K`*).
* **Guaranteed In-Store Inspection**: Try on the fabric physically before completing purchase offline.

### 4. 📱 Mobile-First Responsive Design
* **Sticky Mobile Action Bar**: Fixed price and instant touch buttons (`✨ Mirror` and `🎟️ Reserve Hold`) on product pages.
* **Mobile Map Toggle**: Switch seamlessly between `🗺️ Map View` and `🏬 Store Details`.
* **Touch Modals**: Viewport-safe (`max-h-[94vh]`) with smooth scrolling and responsive typography.

### 5. 👥 Multi-Role Support
* **Customer**: Browse, filter by city/mall, save favorites, try in mirror, and manage in-store holds.
* **Shopkeeper**: Dashboard with reservation management (Accept/Complete/Decline), stock toggles, and store profile.
* **Admin**: Platform metrics, boutique approval/rejection, and product catalog controls.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI component architecture |
| **TypeScript** | Static typing and interfaces |
| **Vite 6** | Ultra-fast build tool and dev server |
| **Tailwind CSS** | Custom styling with Neo-Brutalist tokens |
| **React Router v6** | Client-side routing with SPA rewrite support |
| **Leaflet** | Interactive map rendering & custom HTML markers |
| **Axios** | HTTP client with automatic JWT token refresh interceptors |
| **Lucide React** | Consistent, modern icon set |

---

## ⚙️ Environment Configuration

Create a `.env` file in the `client/` root:

```env
# Backend REST API endpoint (must end in /api/v1)
VITE_API_URL=http://localhost:5001/api/v1

# Geoapify API Key for Leaflet Map Tiles
VITE_GEOAPIFY_KEY=your_geoapify_key_here
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
# Running on http://localhost:5173
```

### 3. Production Build
```bash
npm run build
# Compiles to dist/ with TypeScript validation
```

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), import your frontend repository.
3. Configure **Environment Variables** in Vercel:
   * `VITE_API_URL`: `https://<your-backend-service>.onrender.com/api/v1`
   * `VITE_GEOAPIFY_KEY`: `your_geoapify_key_here`
4. The included [`vercel.json`](./vercel.json) handles client-side routing automatically:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
