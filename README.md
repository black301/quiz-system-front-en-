```markdown

# ⚡ Next.js Admin Dashboard

A modern, responsive Admin Dashboard built with **Next.js 14+**, **Tailwind CSS**, and **App Router**. This dashboard includes theme toggling, authentication, a responsive sidebar, and dropdown menus.

---

## 🚀 Features

- ⚛️ **Next.js App Router**
- 🎨 **Tailwind CSS** with Dark Mode support
- 🧭 **Responsive sidebar** and **header**
- 🔐 JWT-based **authentication**
- 🍪 Cookie + LocalStorage session handling
- 🌙 Light/Dark theme toggle
- 🧑 User dropdown menu with:
  - User info display
  - Settings link
  - Logout functionality
- ⚙️ Modular component structure
- 📱 Fully responsive on mobile

---

## 📁 Folder Structure
```

/app
├── auth/ → Auth pages (sign-in, sign-up)
├── dashboard/ → Main dashboard pages
├── layout.tsx → Root layout
└── page.tsx → Root page
/components
├── header/ → Header components (Header.tsx, ThemeToggle, UserInfo)
├── sidebar/ → Sidebar + Context
├── icons.tsx → Reusable icons
└── ui/ → Custom UI elements (Dropdown, Button, etc.)
/lib
└── utils.ts → Utility functions
/public
└── images/logo/ → Logo assets

````

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: Custom JWT + `cookies-next`
- **State Management**: React Context (for sidebar)
- **Icons**: Custom SVG icons

---

## 🔐 Authentication (JWT)

- `access` token stored in cookies
- `refresh` token stored in localStorage
- Middleware handles route protection
- Logout:
  - Clears both tokens
  - Redirects to `/auth/sign-in`

---

## 📱 Responsive Design

- Sidebar hides on small screens
- User dropdown collapses
- Theme toggle accessible at all sizes
- Uses Tailwind responsive utilities

---

## 🚧 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/next-dashboard.git
cd next-dashboard
````

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Run the dev server

```bash
npm run dev
```

---

## 📦 Production Build

```bash
npm run build
npm start
```

---

## 🧪 Environment Variables

Make sure to add a `.env.local` file for your API endpoints and secrets:

```bash
NEXT_PUBLIC_API_BASE=https://your-backend.com/api
```

---

## 📄 License

This project is licensed under the MIT License.
