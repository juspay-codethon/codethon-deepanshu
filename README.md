# Juspay Design Codethon – Setup Guide

Welcome to the **Design Codethon**! This guide helps you build your project from scratch — with modern tools, fast UI libraries, and AI-powered assistance.

Each participant will push their project to a **dedicated repo under**:  
[`https://github.com/juspay-codethon`](https://github.com/juspay-codethon)

## Table of Contents

- [Step 0: Enable Temporary Admin Access via Kandji](#step-0-enable-temporary-admin-access-via-kandji)
- [Git Installation](#git-installation-macos)
- [1. GitHub Setup Using PAT (Personal Access Token)](#1-github-setup-using-pat-personal-access-token)
- [1.1 Git Basics: Branch, Commit, Push](#11-git-basics-branch-commit-push)
- [2. Install Node.js via Kandji](#2-install-nodejs-via-kandji)
- [3. Getting Started with Your Pre-Configured Project](#3-getting-started-with-your-pre-configured-project)
- [4. Project Structure & Development Guide](#4-project-structure--development-guide)
- [Useful Dev Resources](#useful-dev-resources)
- [5. Setup Cline + Gemini for AI-Powered Coding](#5-setup-cline--gemini-for-ai-powered-coding)
- [Deploying Your App on Vercel](#deploying-your-app-on-vercel)
- [Questions?](#questions)

## Step 0: Enable Temporary Admin Access via Kandji

1. Open **Kandji Self Service**
2. Search **"Temporary Admin Access"**
3. Click **Install** to enable admin rights
4. Proceed with the setup steps below


## Git Installation

If Git is not already installed on your system, follow the steps below to install it via the command line:

### Install Using Homebrew

1. First, check if Homebrew is installed:

```bash
brew --version
```

2. If Homebrew is not installed, install it:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

3. Once Homebrew is installed, install Git:

```bash
brew install git
```

4. Verify the installation:

```bash
git --version
```

> You should see a version output like `git version 2.42.0` confirming it's installed successfully.

If `git` is not already installed on your machine, follow these steps:


## 1. GitHub Setup Using PAT (Personal Access Token)

### A. Configure Git

```bash
git config --global user.name "your-name"
git config --global user.email "your-email@example.com"
```

### B. Generate a GitHub PAT

1. Go to: [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click: **"Generate new token (classic)"**
3. Set:
   - **Note**: `Codethon Access`
   - **Expiration**: 30 days
   - **Scopes**:
     - `repo`
     - `workflow`
     - `read:org`
4. Click **Generate token** and **copy it immediately**

### C. Clone Your Repo

You'll get your repo name (e.g., `codethon-yourname`) from the team. Run:

```bash
git clone https://github.com/juspay-codethon/codethon-yourname.git
cd codethon-yourname
```

When prompted:
- Username: your GitHub username
- Password: paste the **PAT**


## 1.1 Git Basics: Branch, Commit, Push

### A. Create and switch to a new branch

```bash
git checkout -b your-branch-name
```

### B. Stage and commit changes

```bash
git add .
git commit -m "your meaningful commit message"
```

### C. Push your branch to GitHub

```bash
git push origin your-branch-name
```


## 2. Install Node.js via Kandji

1. Open **Kandji Self Service**
2. Search **"Node.js"**
3. Click **Install**

Verify:
```bash
node -v
npm -v
```


## 3. Getting Started with Your Pre-Configured Project

🎉 **Good news!** Your project is already set up with everything you need to start building:

### What's Already Configured

- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS v4** for styling
- **shadcn/ui components** (Button, Card, Dialog) ready to use
- **Modern development setup** with ESLint and proper file structure

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Your app will be running at `http://localhost:3000`

3. **Start Coding!** 
   - Edit `app/page.tsx` to customize your home page
   - Create new pages in the `app/` directory
   - Use pre-installed shadcn/ui components
   - Style with Tailwind CSS utility classes

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Ready-to-Use Components

You can immediately start using these components:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
```

**Need more components?** Add them easily:
```bash
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add table
# See full list: https://ui.shadcn.dev/docs/components
```


## 4. Project Structure & Development Guide

Now that your setup is complete, here's how to start building your codethon project:

### A. Current Project Structure

```
your-project/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout (wraps all pages)
│   ├── page.tsx             # Home page (/)
│   └── favicon.ico          # Favicon
├── components/
│   └── ui/                  # shadcn/ui components (auto-generated)
│       ├── button.tsx       # Button component
│       ├── card.tsx         # Card component
│       └── dialog.tsx       # Dialog/Modal component
├── lib/
│   └── utils.ts             # Utility functions for shadcn/ui
├── public/                  # Static assets
│   ├── next.svg
│   └── vercel.svg
├── components.json          # shadcn/ui configuration
├── tailwind.config.ts       # Tailwind configuration
├── next.config.ts          # Next.js configuration
└── package.json            # Dependencies
```

### B. Creating New Pages

Next.js uses **file-based routing**. Create new pages by adding files in the `app/` directory:

#### Example: Create an About Page
```tsx
// app/about/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">About Our Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              This is our amazing codethon project built with Next.js and shadcn/ui.
            </p>
            <Button>Learn More</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

#### Example: Create a Dashboard
```tsx
// app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">1,234</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">$12,345</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">567</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### C. Using shadcn/ui Components

#### Available Components
You have three components ready to use:
- `Button` - For actions and navigation
- `Card` - For content containers
- `Dialog` - For modals and popups

#### Import and Use Components
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
```

#### Button Examples
```tsx
// Primary button
<Button>Click me</Button>

// Secondary button
<Button variant="secondary">Secondary</Button>

// Outline button
<Button variant="outline">Outline</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With custom styling
<Button className="bg-blue-500 hover:bg-blue-600">Custom</Button>
```

#### Card Examples
```tsx
<Card className="max-w-md">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your content here...</p>
  </CardContent>
</Card>
```

#### Dialog Examples
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description goes here.
      </DialogDescription>
    </DialogHeader>
    <p>Dialog content...</p>
  </DialogContent>
</Dialog>
```

### D. Adding More shadcn/ui Components

Need more components? Add them easily:

```bash
# Popular components for web apps
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add alert
```

### E. Styling with Tailwind CSS

Use Tailwind utility classes for custom styling:

```tsx
// Layout
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">...</div>
</div>

// Colors
<div className="bg-blue-500 text-white">...</div>
<div className="bg-gradient-to-r from-purple-500 to-pink-500">...</div>

// Spacing
<div className="p-4 m-2 space-y-4">...</div>

// Responsive design
<div className="text-sm md:text-lg lg:text-xl">...</div>
```

### F. Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   Your app runs at `http://localhost:3000`

2. **Edit `app/page.tsx`** to customize your home page

3. **Create New Pages** by adding folders/files in `app/`

4. **Add Components** as needed from shadcn/ui

5. **Style with Tailwind** utility classes

6. **Build and Deploy** when ready:
   ```bash
   npm run build
   vercel
   ```

### G. Best Practices for Codethon

- **Keep it Simple**: Focus on core functionality first
- **Use shadcn/ui**: Leverage pre-built components to save time
- **Mobile-First**: Design for mobile, then scale up
- **Component Reuse**: Create reusable components in `/components/`
- **Git Workflow**: Commit frequently with clear messages
- **Performance**: Use Next.js Image component for images

### H. Quick Start Template

Replace your `app/page.tsx` with this template:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            My Codethon Project
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built with Next.js, Tailwind CSS, and shadcn/ui
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Feature One</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Description of your first feature.</p>
              <Button>Learn More</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Feature Two</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Description of your second feature.</p>
              <Button variant="outline">Try It</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Feature Three</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Description of your third feature.</p>
              <Button variant="secondary">Get Started</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```


## Useful Dev Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.dev/docs/components)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [Gemini AI Studio](https://aistudio.google.com/app)


## 5. Setup Cline + Gemini for AI-Powered Coding

### A. Install Cline Extension

1. Open **Cursor** or **VS Code**
2. Go to Extensions → Search `Cline` → Install

### B. Get Gemini API Key

1. Visit: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Generate a key

### C. Configure Cline

1. Open Cline sidebar in your IDE
2. Go to **Settings → API Configuration**
3. Set:
   - **API Provider**: `Google Gemini`
   - **API Key**: Paste your key
   - **Model**: `gemini-2.0-flash-001`
4. Save


## Deploying Your App on Vercel

### Deploy via Vercel CLI

If you prefer deploying directly from the terminal:

1. Install Vercel CLI globally:

```bash
npm install -g vercel
```

2. Run the deployment command:

```bash
vercel
```

3. It will:
   - Ask to log in (use GitHub or email)
   - Ask for the root directory (`./`)
   - Auto-detect Next.js → Yes
   - Ask if you want to override settings → No (use defaults)

4. After a few seconds, your project will be live! 🚀

To redeploy after making changes:
```bash
vercel --prod
```

### Deploy via Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New → Project"**
3. Import your repo from `juspay-codethon` org (e.g., `codethon-yourname`)
4. Vercel will auto-detect it's a Next.js app — click **Deploy**
5. Done! 🎉 Your site is now live.

### What it sets up:
- Automatic deployment from the `main` or `dev` branch
- Custom preview URLs for every PR
- Performance-optimized static and server-side rendering
- Built-in API routes support
- Image optimization and other Next.js features

> Any future push to your repo will automatically trigger a new deployment


## Questions?

Reach out on `#product-design-internal` Slack channel. Happy coding, and bring your designs to life ✨
