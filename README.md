# 🎨 Collaborative Whiteboard

A real-time collaborative whiteboard application built with **Spring Boot** (backend) and **React** (frontend). Multiple users can draw together simultaneously with live cursor tracking, shape tools, text, and export capabilities.

## ✨ Features

- **Real-time Collaboration** — WebSocket-based drawing sync across all connected users
- **Live Cursor Tracking** — See where other users are pointing with colored cursors and names
- **Drawing Tools** — Pencil, rectangle, circle, line, text, eraser, and select
- **Room System** — Create or join rooms with unique IDs
- **Export** — Save your whiteboard as a PNG image
- **Responsive UI** — Works on desktop with Tailwind CSS styling
- **Docker Deployment** — One-command deploy with Docker Compose
- **Cloud Deployment** — Vercel (frontend) + Render (backend)

## 🏗 Architecture

```
collaborative-whiteboard/
├── backend/           # Spring Boot (Java 17)
│   ├── Dockerfile
│   ├── WebSocket STOMP messaging
│   ├── Room management service
│   └── REST API for room creation
│
├── frontend/          # React 18 + TypeScript
│   ├── Dockerfile
│   ├── vercel.json    # Vercel deployment config
│   ├── .env.example   # Environment variables template
│   ├── Canvas rendering with HTML5 Canvas API
│   ├── STOMP WebSocket client
│   └── Tailwind CSS UI
│
├── docker-compose.yml # Local Docker orchestration
└── render.yaml        # Render deployment config
```

## 🚀 Quick Start (Local)

### Prerequisites
- Docker & Docker Compose installed

```bash
cd collaborative-whiteboard
docker-compose up --build
# Open http://localhost:3000
```

## 🌐 Cloud Deployment (Render + Vercel)

### Step 1: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `whiteboard-backend`
   - **Runtime**: `Docker`
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Plan**: `Free`
5. Click **Create Web Service**
6. Wait for deployment (takes ~5-10 minutes)
7. Copy your URL: `https://whiteboard-backend.onrender.com`

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
5. Add **Environment Variables**:
   ```
   VITE_WS_URL = wss://whiteboard-backend.onrender.com/ws/whiteboard
   VITE_API_URL = https://whiteboard-backend.onrender.com/api
   ```
6. Click **Deploy**

### Step 3: Update CORS (Important!)

In `backend/src/main/java/com/whiteboard/controller/RoomRestController.java`, update:
```java
@CrossOrigin(origins = {"https://your-frontend.vercel.app", "http://localhost:3000"})
```

Push this change to GitHub — Render auto-redeploys.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, WebSocket/STOMP, Lombok |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Real-time | SockJS + STOMP over WebSocket |
| Export | html2canvas |
| Local Deploy | Docker, Docker Compose, Nginx |
| Cloud Deploy | Vercel (frontend), Render (backend) |

## 📡 WebSocket Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/ws/whiteboard` | WebSocket connection endpoint |
| `/app/room.join` | Join a room |
| `/app/draw` | Send drawing action |
| `/app/cursor.move` | Send cursor position |
| `/topic/room.{id}.draw` | Receive drawing updates |
| `/topic/room.{id}.cursors` | Receive cursor updates |
| `/topic/room.{id}.users` | User join/leave events |
| `/user/queue/room.state` | Personal room state on join |

## 🎯 What This Project Demonstrates

- **Fullstack architecture** with clear separation of concerns
- **Real-time communication** using WebSocket/STOMP
- **Canvas manipulation** and custom drawing engine
- **State synchronization** across multiple clients
- **Modern React patterns** with hooks and TypeScript
- **Responsive UI design** with Tailwind CSS
- **Containerized deployment** with Docker & Docker Compose
- **Cloud deployment** with Vercel and Render

## 🔮 Future Enhancements

- [ ] User authentication & persistent rooms
- [ ] Undo/Redo with action history
- [ ] Image upload & background images
- [ ] Board zoom & pan
- [ ] PostgreSQL/MongoDB persistence
- [ ] Kubernetes deployment

## 📄 License

MIT
