# 🤖 Cortana Dashboard - Futuristic AI Assistant Interface

**Premium, dark-themed dashboard built with Next.js 14 and Framer Motion**

> A sophisticated, Apple-inspired UI for Cortana AI Personal Assistant. Features glass morphism, smooth animations, and a dedicated space for 3D avatar integration.

---

## ✨ Design Philosophy

**"Future Minimalism"** - Sleek, powerful, and absolutely badass.

- 🌑 **Dark-first design** with deep blacks and subtle gradients
- 💎 **Glass morphism** with frosted blur effects
- ⚡ **Smooth micro-interactions** powered by Framer Motion
- 🎨 **Premium typography** (SF Pro/Inter)
- 🔮 **Cortana's presence** - Reserved 3D model placeholder

---

## 🎨 Color Palette

```css
/* Electric Blue Accent */
Primary: #0A84FF

/* Deep Space Backgrounds */
BG Primary: #000000
BG Secondary: #0D0D0D
BG Tertiary: #1A1A1A

/* Text Hierarchy */
Text Primary: #FFFFFF
Text Secondary: #A1A1A6
Text Tertiary: #636366

/* Status Colors */
Success: #30D158 (Apple Green)
Warning: #FF9F0A (Apple Orange)
Error: #FF453A (Apple Red)
Purple: #BF5AF2 (AI Elements)
```

---

## 🏗️ Project Structure

```
cortana-dashboard/
├── app/
│   ├── layout.tsx          # Root layout with Sidebar + Header
│   ├── page.tsx            # Homepage with Cortana avatar
│   └── globals.css         # Premium design system CSS
├── components/
│   ├── dashboard/
│   │   └── CortanaAvatar.tsx   # 3D model placeholder ⭐
│   ├── layout/
│   │   ├── Sidebar.tsx     # Slim icon-only navigation
│   │   └── Header.tsx      # Top bar with notifications
│   └── ui/
│       └── GlassCard.tsx   # Glass morphism cards
└── lib/
    └── utils.ts            # Utility functions
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd cortana-dashboard
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🎯 Features Implemented

### ✅ Core Components

- **Cortana Avatar Placeholder** - Ready for 3D model integration
  - Pulsing animations
  - Orbital rings
  - Floating effect
  - Glow effects

- **Glass Cards** - Frosted blur effects with variants:
  - `GlassCard` - Base card
  - `GlassCardWithIcon` - Card with icon header
  - `StatCard` - Metric display with trend indicators

- **Slim Sidebar** - Icon-only navigation (60px)
  - Tooltips on hover
  - Active state with glow
  - Smooth animations

- **Premium Header** - Top navigation bar
  - Notifications bell (with dot indicator)
  - User avatar menu

### 🎨 Design System

- **Glass Morphism** - `backdrop-blur` with subtle borders
- **Smooth Animations** - Framer Motion throughout
- **Custom Scrollbars** - Minimal, sleek
- **Gradient Text** - Cortana branding
- **Glow Effects** - Blue/purple glows for interactive elements

---

## 🤖 Cortana 3D Model Integration

The dashboard includes a **dedicated placeholder** for Cortana's 3D avatar.

**File:** `components/dashboard/CortanaAvatar.tsx`

### Integration Options:

#### Option 1: React Three Fiber (Recommended)
```bash
npm install three @react-three/fiber @react-three/drei
```

Replace placeholder with:
```tsx
<Canvas>
  <ambientLight intensity={0.5} />
  <Model /> {/* Your GLTF/GLB model */}
  <OrbitControls />
</Canvas>
```

#### Option 2: Spline (Easiest - No Code)
1. Design in [Spline.design](https://spline.design)
2. Export as React component
3. Import directly

#### Option 3: Ready Player Me
```bash
npm install @readyplayerme/rpm-react
```

---

## 📊 Future Pages (To Build)

- **Finance Dashboard** - Charts, transactions, budgets
- **Workouts Dashboard** - Calendar, progress, streaks
- **Goals Dashboard** - Weight tracking, milestones
- **AI Chat Interface** - Conversational UI

---

## 🎨 Customization

### Change Color Scheme
Edit `tailwind.config.ts`:
```ts
colors: {
  primary: {
    DEFAULT: "#0A84FF", // Change this
  },
}
```

### Add New Page
1. Create `app/[page-name]/page.tsx`
2. Add route to `components/layout/Sidebar.tsx`

### Modify Animations
Adjust in component files using Framer Motion props:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
```

---

## 🔗 API Integration (Next Step)

### Connect to FastAPI Backend

Create `lib/api.ts`:
```ts
const API_BASE = "http://localhost:8000";

export async function getOverview(userId: number) {
  const res = await fetch(`${API_BASE}/dashboard/overview?user_id=${userId}`);
  return res.json();
}
```

Use in components:
```tsx
const { data } = await getOverview(1);
```

---

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts (ready to use)
- **Icons:** Lucide React
- **TypeScript:** Full type safety

---

## 🎯 Next Steps

1. **Test the UI** - Run `npm run dev` and explore
2. **Add 3D Model** - Integrate Cortana's avatar
3. **Build Finance Page** - Charts and transactions
4. **Connect to FastAPI** - Real data from backend
5. **Add Auth** - Login/signup flow

---

## 🌟 Design Inspiration

- **Apple Design Language** - Clean, minimal, premium
- **Iron Man's Jarvis UI** - Futuristic, glowing accents
- **Notion** - Glass morphism and smooth interactions

---

## 📝 Notes

- All animations use hardware acceleration (`transform`, `opacity`)
- Glass effects work best on dark backgrounds
- Color scheme designed for OLED displays
- Responsive from mobile to 4K displays

---

**Built with 💙 for the future.**

*Ready to integrate Cortana's 3D model and bring her to life!*
