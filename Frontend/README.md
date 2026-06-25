Note-Taking Frontend README
A modern React + Vite frontend for a note-taking application with an aesthetic editorial-style UI, animated gradient background, modular architecture, and feature-ready component structure. The frontend architecture was expanded from a default Vite starter into a structured app with dedicated utility, hook, and component layers.

Overview
This frontend is designed to connect to a backend notes API and provide a polished note management experience with create, edit, delete, search, sort, tags, favorites, and category-based organization. The architecture separates state management, reusable logic, and presentation components so the app is easier to scale and maintain.

Tech Stack
Layer	Technology	Purpose
Build tool	Vite	Fast development server and optimized build output.
UI library	React 18	Component-based frontend architecture.
Icons	lucide-react	Lightweight icon system for actions and UI details.
Styling	CSS + design tokens	Custom visual system, animations, and responsive layout.
Utilities	noteHelpers.js	Formatting, categorization, searching, sorting, and export helpers.
Folder Structure
text
note-taking-complete/
├── index.html
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── App.css
    ├── components/
    │   ├── Sidebar.js
    │   ├── SearchBar.js
    │   ├── NoteCard.js
    │   ├── NoteEditor.js
    │   └── TagManager.js
    ├── hooks/
    │   └── useNotes.js
    └── utils/
        └── noteHelpers.js
The generated project files currently include index.html, package.json, vite.config.js, src/index.css, src/main.jsx, and src/utils/noteHelpers.js, while the remaining component files were specified as the intended modular structure for completion.

Architecture
The app is organized into three main layers:

Presentation layer: React components such as sidebar, note cards, editors, and search UI.

Logic layer: a custom hook for API communication and note state management.

Utility layer: pure helper functions for note formatting, categorization, filtering, sorting, and export behavior.

Data Flow
text
User action
   ↓
UI Component (SearchBar / NoteCard / NoteEditor)
   ↓
App.jsx handler
   ↓
useNotes.js
   ↓
Backend API (/api/notes)
   ↓
Updated state
   ↓
Sidebar + Editor re-render
This structure keeps network logic out of UI components and avoids tightly coupling rendering with business logic.

Features
Core Note Features
Create a note with title and content.

Edit an existing note from the editor panel.

Delete a note from the sidebar list.

View note timestamps and metadata.

Enhanced Features
Search notes by title, content, and tags.

Sort notes by date, title, content length, or word count.

Mark notes as favorites.

Add and remove custom tags.

Auto-categorize notes into groups such as personal, work, learning, ideas, quotes, todo, and general.

Export notes as JSON using helper utilities.

UI Features
Animated gradient orb background with subtle floating motion.

Editorial-style typography using Instrument Serif and Satoshi.

Responsive split layout with sidebar and editor panel.

Skeleton loaders, empty states, hover transitions, and mobile-friendly layouts.

What Changed
The original frontend in the repository was still the default Vite starter and did not yet implement a real note-taking interface. The updated architecture replaces that starter with a scalable frontend structure centered on notes CRUD, reusable UI components, utility-driven filtering and sorting, and a stronger visual system.

Main Structural Changes
Before	After
Single starter App.jsx	Modular app architecture with components, hooks, and utilities.
Default Vite demo UI	Real note-taking interface with sidebar, editor, and note actions.
No API abstraction	Dedicated useNotes.js hook for data operations.
Minimal styles	Full design system with typography, spacing, motion, and animated background.
No advanced features	Search, sort, tags, favorites, and categorization support.
Setup
1. Install dependencies
bash
npm install
2. Start the development server
bash
npm run dev
3. Ensure backend is running
The Vite configuration is set up to work with a backend service at http://localhost:5001, and the intended notes API path is /api/notes.

Recommended Backend Model
To support the enhanced frontend features, the note model should include these fields in addition to title and content:

js
{
  title: String,
  content: String,
  tags: [String],
  isFavorite: Boolean,
  category: String
}
The current backend model only includes title and content, so the extra frontend features require extending the schema before full integration.

Recommended Final Frontend Layout
text
Frontend/
├── index.html
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── App.css
    ├── components/
    ├── hooks/
    └── utils/
This structure preserves the standard Vite layout while making the project easier to scale with future additions such as authentication, pinning, markdown support, and local draft persistence.

