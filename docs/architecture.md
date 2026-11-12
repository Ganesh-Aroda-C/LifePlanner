# LifePlanner System Architecture

LifePlanner is engineered as a secure, high-performance personal life assistant designed to consolidate tasks, deadlines, scheduled commitments, and proactive reminders into an integrated system.

---

## 1. High-Level Architectural Diagram

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React + Vite + Tailwind)"]
        UI["Modern UI / Responsive Dashboard"]
        AuthContext["Auth Context & JWT Store"]
        APIClient["Axios API Client (Interceptor Layer)"]
        BrowserNotifs["Browser Notification Engine"]
    end

    subgraph Gateway["Server API Gateway (Express.js)"]
        Security["Helmet & CORS & Rate Limiter"]
        AuthMiddleware["JWT Authentication Middleware"]
        Controllers["Resource Controllers (Tasks, Reminders, Auth, Dashboard)"]
    end

    subgraph Engine["Background Processing"]
        ReminderWorker["LifePlanner Reminder Engine (Worker Job)"]
        QueueInterface["Queue Abstraction (BullMQ-Ready)"]
    end

    subgraph Storage["Data Tier (MongoDB)"]
        UsersCol[("Users Collection")]
        TasksCol[("Tasks Collection")]
        RemindersCol[("Reminders Collection")]
        SchedulesCol[("Schedules Collection")]
        IntegrationsCol[("Integrations Collection")]
    end

    UI --> AuthContext
    AuthContext --> APIClient
    APIClient -->|HTTPS / Bearer JWT| Security
    Security --> AuthMiddleware
    AuthMiddleware --> Controllers

    Controllers --> UsersCol
    Controllers --> TasksCol
    Controllers --> RemindersCol
    Controllers --> SchedulesCol
    Controllers --> IntegrationsCol

    ReminderWorker -->|Query Due Reminders| RemindersCol
    ReminderWorker -->|Atomic Transition| RemindersCol
    QueueInterface -.-> ReminderWorker
    BrowserNotifs <-->|Permission Handshake| UI
```

---

## 2. Component Breakdown

### A. Frontend Layer (`client/`)
- **React 18 & Vite**: Fast bundling, sub-second HMR, and optimized production chunking.
- **Tailwind CSS**: Custom palette featuring slate and navy backgrounds with indigo accents, rounded-2xl cards, and subtle border shadows.
- **Axios Interceptor**: Handles JWT token injection on outgoing requests and automatically handles `401 Unauthorized` token expiration events by broadcasting to `AuthContext`.
- **Browser Notification Bridge**: Graceful permission request and delivery handling with explicit limitations disclosure (browser must remain active; not an audio device wake alarm).

### B. Backend Layer (`server/`)
- **Express.js API Router**: Clean RESTful endpoints segregated by domain (`/api/auth`, `/api/tasks`, `/api/reminders`, `/api/dashboard`).
- **Security & Hardening**:
  - `Helmet`: Sets HTTP security headers (CSP, HSTS, X-Content-Type-Options).
  - `cors`: Strict origin validation against configured `CLIENT_URL`.
  - `express-rate-limit`: Prevents brute-force credential stuffing and DoS attacks.
  - `express-validator`: Input sanitization and payload schema validation.

### C. Background Processing Tier (`server/services/reminderEngine.js`)
- **Persistent Timestamp Processing**: Reminders are stored in MongoDB with exact UTC timestamps.
- **Atomic Concurrency Control**: Uses MongoDB's atomic `findOneAndUpdate` queries targeting `{ status: 'scheduled', remindAt: { $lte: new Date() } }` to ensure zero duplicate alerts across concurrent ticks.
- **Delivery Auditing**: Every triggered reminder appends to its `deliveryHistory` subdocument array with timestamp, channel, and execution details.
- **BullMQ / Redis Preparedness**: The engine operates through a decoupled worker interface designed to seamlessly route through Redis/BullMQ queues upon mobile rollout in Phase 4.

---

## 3. Data Flow & Security Principles

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as Frontend (React)
    participant Server as Backend (Express)
    participant DB as MongoDB

    User->>Client: Enters credentials (Email + Password)
    Client->>Server: POST /api/auth/login
    Server->>DB: Query User by normalized email
    DB-->>Server: User record (with passwordHash)
    Server->>Server: bcrypt.compare(password, passwordHash)
    Server->>Server: Sign stateless JWT (7-day validity)
    Server-->>Client: { token, userProfile }
    Client->>Client: Store token in localStorage

    Note over Client,Server: Authenticated Request Flow
    User->>Client: Creates new Critical Task
    Client->>Server: POST /api/tasks (Header: Bearer token)
    Server->>Server: Verify JWT signature & load req.user
    Server->>DB: Insert Task { userId, title, priority, deadline }
    Server->>DB: Auto-schedule linked Reminder (if requested)
    DB-->>Server: Saved Task document
    Server-->>Client: 201 Created { task }
    Client->>User: Renders on Dashboard & Task Board
```

### Data Isolation
All queries strictly enforce user-level scoping:
```javascript
const query = { userId: req.user._id };
```
No task, reminder, or schedule document can be queried, modified, or deleted without passing ownership checks against `req.user._id`.
