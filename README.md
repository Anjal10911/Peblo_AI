# Peblo AI Notes Workspace


<img width="934" height="512" alt="Screenshot 2026-05-17 150937" src="https://github.com/user-attachments/assets/fed193c4-2c93-46a4-88ed-327953130b57" />

A full-stack, collaborative AI notes workspace built for the Peblo Developer Challenge. This application features a premium, responsive **Burgundy and Black** custom theme, rich markdown support, and an intelligent AI assistant.

<img width="627" height="469" alt="Screenshot 2026-05-17 151016" src="https://github.com/user-attachments/assets/b90703a7-9873-40a8-a46d-a1ecd33e213b" />

<img width="956" height="492" alt="Screenshot 2026-05-17 151112" src="https://github.com/user-attachments/assets/367f0ae4-df7b-41e2-bef9-c1b57d14e882" />

<img width="909" height="514" alt="Screenshot 2026-05-17 151219" src="https://github.com/user-attachments/assets/82e98ace-fe3c-471e-9186-25246a42a5d5" />


---

## 🌟 Key Features

* **Authentication**: Secure JWT-based authentication using NextAuth.js.
* **Rich Notes Workspace**: Create, edit, and manage notes with an auto-saving markdown editor. Organize your thoughts seamlessly with tags.
* **Markdown Support**: Instantly toggle between a raw text editor and a beautifully formatted Markdown preview.
* **✨ AI Buddy**: Integrated with Google Gemini to:
  * Generate concise summaries of your notes.
  * Extract actionable items and present them as a checklist.
  * Suggest catchy titles for your documents.
* **Search & Filtering**: Real-time search across note titles, contents, and specific tags.
* **Public Sharing**: Generate secure public links to share read-only, perfectly formatted Markdown versions of your notes.
* **Export Functionality**: Download your notes locally as `.md` files with a single click.
* **Insights Dashboard**: View your productivity metrics, total notes, and top tag frequency.
* **Power-User Shortcuts**: Includes features like `Ctrl+S` override for instant manual saves.

---

## 🛠️ Tech Stack

### Frontend
* **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
* **Styling**: Vanilla CSS Modules (Zero Tailwind). Fully custom, glassmorphic design system utilizing flexbox, CSS Grid, and media queries for mobile responsiveness.
* **Markdown Parsing**: `react-markdown` and `remark-gfm`
* **Notifications**: `react-hot-toast` for elegant micro-interactions.

### Backend & Database
* **API**: Next.js Serverless Route Handlers
* **Database**: SQLite (Zero-setup local database)
* **ORM**: [Prisma v6](https://www.prisma.io/)
* **Authentication**: `next-auth` with `bcrypt` for password hashing.
* **AI Integration**: `@google/generative-ai` (Gemini 1.5 Flash Model)

---

## 🚀 How It Works

1. **Authentication Flow**: Users register and log in. Credentials are encrypted and verified against the SQLite database using Prisma. A secure JWT session is established via NextAuth.
2. **Auto-Saving Editor**: The workspace utilizes a custom `useDebounce` hook. As you type, changes are debounced (1 second for content, 2 seconds for tags) and automatically synced with the backend via `PATCH` requests to `/api/notes/[id]`.
3. **AI Generation**: Clicking an AI action sends the note's content to a Next.js API route. The server securely communicates with the Google Gemini API, parsing the response (including JSON extraction for action items) and returning it to the client. *Note: A built-in mock fallback is provided if the Gemini API key is missing.*
4. **Public Links**: Toggling "Public Share" updates the `isPublic` flag in the database. The `/shared/[id]` dynamic route queries the database and renders the content if the flag is true.

---

## ⚙️ Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Install Dependencies
Clone the repository and install the required NPM packages:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of your project and populate it with the following:
```env
# SQLite Database connection (Prisma)
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini API (Optional, but required for real AI responses)
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Initialize the Database
The project uses Prisma with SQLite for a frictionless setup. Run the following command to push the schema and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Application
Start the Next.js development server:
```bash
npm run dev
```
Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎨 Design Philosophy
The application was built without utility CSS frameworks (like Tailwind) to demonstrate strong foundational CSS skills. It uses deep burgundy (`#780000`, `#c1121f`) and black themes to stand out from typical generic blue dashboards, employing subtle border radiuses, semi-transparent overlays, and custom typography to achieve a premium aesthetic.
