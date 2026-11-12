# LifePlanner REST API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require an `Authorization` header formatted as:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method:** `POST`
- **Route:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "strongPassword123"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6732dc6e...",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "timezone": "UTC",
    "preferences": {
      "theme": "light",
      "notifications": {
        "browser": true,
        "email": false,
        "leadTimeMinutes": 15
      }
    },
    "createdAt": "2026-11-12T08:00:00.000Z"
  }
}
```

### 1.2 Login User
- **Method:** `POST`
- **Route:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "alex@example.com",
  "password": "strongPassword123"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6732dc6e...",
    "name": "Alex Morgan",
    "email": "alex@example.com"
  }
}
```

### 1.3 Get Current User Profile
- **Method:** `GET`
- **Route:** `/api/auth/me`
- **Access:** Private (Bearer Token)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "6732dc6e...",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "timezone": "UTC",
    "preferences": { ... }
  }
}
```

---

## 2. Task Management Endpoints

### 2.1 List Tasks
- **Method:** `GET`
- **Route:** `/api/tasks`
- **Access:** Private
- **Query Parameters:**
  - `category`: Filter by category (`College`, `Work`, `Personal`, `Finance`, `Health`, `Other`)
  - `priority`: Filter by priority (`Critical`, `High`, `Medium`, `Low`)
  - `status`: Filter by status (`Pending`, `In Progress`, `Completed`, `Cancelled`)
  - `search`: Case-insensitive title and description keyword search
  - `sort`: `deadline_asc`, `deadline_desc`, `priority`, `created_desc`, `title_asc`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "total": 12,
  "page": 1,
  "pages": 1,
  "tasks": [
    {
      "_id": "6732f91a...",
      "userId": "6732dc6e...",
      "title": "Complete Software Architecture Spec",
      "description": "Outline ERD and sequence flow",
      "category": "Work",
      "priority": "Critical",
      "status": "In Progress",
      "deadline": "2026-11-15T18:00:00.000Z",
      "estimatedDuration": 60,
      "isMandatory": true,
      "source": "manual",
      "createdAt": "2026-11-12T08:15:00.000Z"
    }
  ]
}
```

### 2.2 Create Task
- **Method:** `POST`
- **Route:** `/api/tasks`
- **Access:** Private
- **Request Body:**
```json
{
  "title": "Finalize Q4 Financial Audit",
  "description": "Verify expense sheets against receipts",
  "category": "Finance",
  "priority": "High",
  "deadline": "2026-11-18T17:00:00.000Z",
  "estimatedDuration": 90,
  "isMandatory": true,
  "reminderPreference": {
    "enabled": true,
    "remindBeforeMinutes": 30,
    "type": "browser"
  }
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "task": { ... }
}
```

### 2.3 Toggle Task Completion / Reopen
- **Method:** `PATCH`
- **Route:** `/api/tasks/:id/complete`
- **Access:** Private
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task marked as completed.",
  "task": {
    "_id": "6732f91a...",
    "status": "Completed",
    "completedAt": "2026-11-12T08:45:00.000Z"
  }
}
```

### 2.4 Delete Task
- **Method:** `DELETE`
- **Route:** `/api/tasks/:id`
- **Access:** Private
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task and linked reminders deleted successfully."
}
```

---

## 3. Reminder Endpoints

### 3.1 List Reminders
- **Method:** `GET`
- **Route:** `/api/reminders`
- **Access:** Private
- **Query Parameters:**
  - `status`: Filter by status (`scheduled`, `triggered`, `acknowledged`, `snoozed`, `cancelled`)
  - `upcomingOnly`: Boolean flag
- **Success Response (200 OK):**
```json
{
  "success": true,
  "total": 3,
  "reminders": [
    {
      "_id": "6732fa2b...",
      "title": "Submit Lab Assignment",
      "remindAt": "2026-11-13T10:00:00.000Z",
      "type": "browser",
      "status": "scheduled",
      "taskId": {
        "_id": "6732f91a...",
        "title": "Physics Lab Experiment Report"
      }
    }
  ]
}
```

### 3.2 Schedule Reminder
- **Method:** `POST`
- **Route:** `/api/reminders`
- **Access:** Private
- **Request Body:**
```json
{
  "title": "Call Doctor for Lab Results",
  "remindAt": "2026-11-14T14:30:00.000Z",
  "type": "browser",
  "repeatInterval": "none",
  "notes": "Ask about blood lipid levels"
}
```

### 3.3 Acknowledge Reminder
- **Method:** `PATCH`
- **Route:** `/api/reminders/:id/acknowledge`
- **Access:** Private
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Reminder acknowledged.",
  "reminder": {
    "_id": "6732fa2b...",
    "status": "acknowledged",
    "acknowledgedAt": "2026-11-12T08:50:00.000Z"
  }
}
```

### 3.4 Snooze Reminder
- **Method:** `PATCH`
- **Route:** `/api/reminders/:id/snooze`
- **Access:** Private
- **Request Body:**
```json
{
  "minutes": 15
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Reminder snoozed for 15 minutes.",
  "reminder": {
    "_id": "6732fa2b...",
    "status": "snoozed",
    "snoozedUntil": "2026-11-12T09:05:00.000Z"
  }
}
```

---

## 4. Dashboard Endpoints

### 4.1 Statistical Overview
- **Method:** `GET`
- **Route:** `/api/dashboard/stats`
- **Access:** Private
- **Success Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalTasks": 15,
    "completedTasks": 9,
    "pendingTasks": 4,
    "inProgressTasks": 2,
    "overdueTasks": 1,
    "criticalTasks": 2,
    "activeReminders": 3,
    "completionRate": 60,
    "categoryBreakdown": {
      "Work": 6,
      "College": 4,
      "Personal": 5
    },
    "priorityBreakdown": {
      "Critical": 2,
      "High": 5,
      "Medium": 6,
      "Low": 2
    }
  }
}
```
