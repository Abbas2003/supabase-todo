# ✅ Supabase Todo App

A modern **Todo App** built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**.  
Easily add, view, and manage your todos with real-time database support.

🔗 **Live Demo**: [supabase-todo.vercel.app](https://supabase-todo-xi.vercel.app/)  
📦 **GitHub Repo**: [github.com/Abbas2003/supabase-todo](https://github.com/Abbas2003/supabase-todo)

---

## ✨ Features

- ✅ Add new todos with Supabase backend
- 📄 View list of todos
- 💾 Real-time database updates
- 🌙 Dark mode toggle (ShadCN + `next-themes`)
- 🔒 Clerk authentication ready (SignedIn / SignedOut support)
- 🚀 Deployed on Vercel

---

## 🛠 Tech Stack

| Technology      | Usage                          |
|-----------------|--------------------------------|
| Next.js 15      | React framework (App Router)   |
| TypeScript      | Static type checking           |
| Tailwind CSS    | Utility-first styling          |
| Supabase        | Backend & database             |
| Clerk           | Auth (Sign In/Up/UserButton)   |
| ShadCN UI       | Pre-styled modern components   |

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/Abbas2003/supabase-todo.git
cd supabase-todo
```

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Configure .env.local
Create a .env.local file in the root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-public-key
```
You can get these from ```Supabase > Project > Settings > API.```

### 4. Run the app locally

```bash
npm run dev
```
Open http://localhost:3000 to view the app.

