# 🚍 Smart Transit

### Intelligent Route Planning • Smart Navigation • Modern UI • Scalable Architecture

Smart Transit is a **full-stack intelligent navigation system** designed to compute the **fastest, safest, and most optimized routes** inside a campus, city, or custom geographical zone. It uses **graph algorithms**, **real‑time map rendering**, and **clean UI/UX principles** to deliver a smooth, reliable navigation experience.

The system is built for **students, commuters, universities, organizations, and public transport networks**.

---

## 🌟 Why Smart Transit?

Modern navigation apps are powerful but often overloaded for small, controlled environments.
**Smart Transit solves this by focusing on:**

* Lightweight & customizable transit networks
* Highly optimized routing algorithms
* Clean, distraction‑free UI
* Expandable backend for future modules
* Easy deployment & scalability

Perfect for **campus navigation**, **internal routing**, **organization transit**, and **academic submissions**.

---

## ✨ Key Features

### 🔹 1. Route & Navigation

* Computes shortest path between any two locations
* Multi-step routing support
* Clean line visualization on map
* Dynamic polyline drawing
* Automatic fallback route generation

### 🔹 2. Map & UI

* Built using **Leaflet + OpenStreetMap**
* Interactive markers
* Smooth animations & transitions
* Real-time location selection
* Fully responsive layout

### 🔹 3. Smart Algorithm Engine

* Graph implementation using **Adjacency Lists**
* Supports **Dijkstra** and **A*** algorithms
* Flexible nodes & edges (easy to modify)
* Fast computation with algorithm-level optimizations

### 🔹 4. Modern Frontend Architecture

* React component-driven structure
* TailwindCSS styling
* Custom hooks for cleaner logic
* Context API for global state management
* Reusable services & utilities

### 🔹 5. Backend API Engine

* Node.js + Express
* Clean routing structure
* Controllers → Services → Algorithm Layer
* Centralized error handling
* Future support: MongoDB graph storage

### 🔹 6. Developer Friendly

* Proxy support to avoid CORS during development
* Environment variable separation
* Structured & scalable project layout
* Easy deployment on cloud or local

---

## 🧭 System Architecture (Detailed)

```
                          +------------------------------+
                          |         FRONTEND (UI)        |
                          |   React + Leaflet + Tailwind |
                          +---------------+--------------+
                                          |
                                          |  REST API Requests
                                          v
                     +-------------------------------------------+
                     |              BACKEND SERVER               |
                     |        Node.js + Express Framework        |
                     |  Controllers → Services → Algorithm Layer |
                     +------------------+------------------------+
                                        |
                                        | Graph Computation
                                        v
                     +-------------------------------------------+
                     |           ROUTE COMPUTATION ENGINE        |
                     |  Graph Data → Dijkstra / A* Pathfinding   |
                     +------------------+------------------------+
                                        |
                                        | Optional
                                        v
                     +-------------------------------------------+
                     |        DATABASE (Future Integration)       |
                     |        MongoDB / Graph Database            |
                     +-------------------------------------------+
```

---

## 🧰 Tech Stack

### **Frontend**

* React.js
* TailwindCSS
* Leaflet.js
* Axios
* Vite

### **Backend**

* Node.js
* Express.js
* Dijkstra / A* Algorithms
* dotenv
* cors

### **Future Integrations**

* MongoDB
* Redis caching
* WebSocket live transit tracking

---

## 📁 Folder Structure (Finalized & Professional)

```
Smart-Transit/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── algorithms/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── docs/
│   ├── architecture.png
│   ├── api-reference.md
│   └── screenshots/
│
├── .env.example
├── README.md
└── LICENSE
```

---

## 🧩 Proxy Setup (Important for Development)

To avoid CORS issues, Vite provides a local proxy:

```js
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

Now your frontend can call:

```js
axios.get('/api/route')
```

Instead of:

```js
axios.get('http://localhost:5000/api/route')
```

---

## 🔌 API Endpoints

### **GET /api/route**

Calculate the shortest route between two nodes.

#### Query Parameters

```
?source=START&destination=END
```

#### Example Response

```json
{
  "distance": 2.8,
  "eta": "7 minutes",
  "path": ["A1", "B2", "C3"]
}
```

---

## 🚀 Run Locally

### **1. Clone Repository**

```
git clone https://github.com/goyalk01/Smart-Transit
cd Smart-Transit
```

### **2. Setup Backend**

```
cd backend
npm install
cp .env.example .env
npm start
```

### **3. Setup Frontend**

```
cd frontend
npm install
npm run dev
```

**Frontend:** [http://localhost:5173](http://localhost:5173)
Backend: [http://localhost:5000](http://localhost:5000)

---

## 🔧 Environment Variables

```
PORT=5000
MAP_API_KEY=
MONGO_URI=
```

---

## 🖼 Screenshots (Coming Soon)

Add the following in `/docs/screenshots`:

* Home screen
* Map UI
* Route selection
* Path visualization

---

## 🧭 Roadmap (Planned Enhancements)

* Live location tracking
* Transport schedule integration
* Authentication system
* Admin dashboard for node editing
* Faster A* heuristics
* Voice guidance
* Offline caching (PWA)
* Heatmap layer for traffic

---

## 👥 Contributors

| Contributor          | GitHub                                                                       |
| -------------------- | ---------------------------------------------------------------------------- |
| **Krish Goyal**      | [https://github.com/goyalk01](https://github.com/goyalk01)                   |
| **Abhinav Atul**     | [https://github.com/abhinav-atul](https://github.com/abhinav-atul)           |
| **Vaidehi Dadheech** | [https://github.com/vdadheech](https://github.com/vdadheech)                 |
| **Devansh Bansal**   | [https://github.com/Devansh-Bansal-AI](https://github.com/Devansh-Bansal-AI) |
| **Divya Mishra**     | [https://github.com/DivyaMishra](https://github.com/DivyaMishra)             |

> Profile photo badges can be added if needed.

---

## 📜 License

This project is licensed under the **MIT License**.

---