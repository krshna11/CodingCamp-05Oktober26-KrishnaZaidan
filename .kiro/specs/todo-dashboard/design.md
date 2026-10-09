# To Do List Life Dashboard - Technical Design Document

## Overview

The To Do List Life Dashboard is a single-page web application (SPA) built with vanilla HTML, CSS, and JavaScript. It provides users with a unified interface combining time/date display, a Pomodoro-style focus timer, a persistent task management system, and quick access bookmarks. All data persists locally through the browser's Local Storage API, with zero server-side dependencies.

**Key Design Principles:**
- **Simplicity**: Single-screen layout with minimal configuration required
- **Responsiveness**: All interactions complete within 100-500ms for smooth user experience
- **Reliability**: Graceful error handling and data recovery mechanisms
- **Accessibility**: WCAG AA compliance for contrast and keyboard navigation
- **Performance**: Target 60fps animations and 2-second initial load time

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│         To Do List Life Dashboard (SPA)             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Presentation Layer (DOM + CSS)              │  │
│  │  - Greeting Section                          │  │
│  │  - Pomodoro Timer Section                    │  │
│  │  - Task List Section                         │  │
│  │  - Quick Links Section                       │  │
│  └──────────────────────────────────────────────┘  │
│                       ↕                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  Application Logic Layer (js/app.js)         │  │
│  │  - Greeting Manager                          │  │
│  │  - Timer State Machine                       │  │
│  │  - Task Manager (CRUD)                       │  │
│  │  - Link Manager (CRUD)                       │  │
│  │  - Event Handlers                            │  │
│  │  - Data Validation                           │  │
│  └──────────────────────────────────────────────┘  │
│                       ↕                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  Persistence Layer (Local Storage API)       │  │
│  │  - dashboard_tasks (JSON array)              │  │
│  │  - dashboard_quick_links (JSON array)        │  │
│  │  - dashboard_pomodoro_duration (number)      │  │
│  │  - dashboard_time_format (string: 12h|24h)  │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Interaction
       ↓
Event Handler Triggered
       ↓
Input Validation
       ↓
Application Logic (State Update)
       ↓
Persistence to Local Storage
       ↓
DOM Re-render
       ↓
Visual Feedback to User
```

### State Management Approach

The application maintains global application state as a single JavaScript object:

```javascript
const appState = {
  greeting: "Good Morning",
  timeFormat: "12h", // "12h" or "24h"
  
  timer: {
    state: "stopped", // "stopped", "running", "paused"
    duration: 25, // minutes
    remaining: 1500, // seconds
    configuredDuration: 25 // minutes (for reset)
  },
  
  tasks: [
    { id: "uuid", text: "...", completed: false },
    // ...
  ],
  
  quickLinks: [
    { id: "uuid", name: "...", url: "..." },
    // ...
  ]
};
```

**State Mutations:**
- Only application logic functions modify state
- After each mutation, affected data is persisted to Local Storage
- DOM is updated reactively based on state changes
- No two-way data binding; explicit render triggers

---

## Components and Interfaces

The To Do List Life Dashboard is composed of four main components, each with a distinct responsibility and interface. This section provides a quick reference for all component interfaces.

### Component Summary Table

| Component | Responsibility | Key Data Structure | Primary Operations |
|-----------|-----------------|-------------------|-------------------|
| **Greeting Section** | Display date, time, and time-based greeting | `greeting`, `timeFormat`, `currentDate`, `currentTime` | `getGreetingByHour()`, `formatDate()`, `formatTime()`, `updateGreetingDisplay()` |
| **Pomodoro Timer** | Manage focus timer with state machine | `timer: { state, duration, remaining, configuredDuration, intervalId }` | `startTimer()`, `pauseTimer()`, `resetTimer()`, `validateTimerDuration()` |
| **Task List** | CRUD operations on persistent task collection | `tasks: [{ id, text, completed }]` | `addTask()`, `editTask()`, `deleteTask()`, `toggleTaskCompletion()`, `validateTaskText()` |
| **Quick Links** | CRUD operations on bookmarked links | `quickLinks: [{ id, name, url }]` | `addQuickLink()`, `editQuickLink()`, `deleteQuickLink()`, `validateUrl()`, `validateLinkName()` |

### Component Interfaces

#### Greeting Section Interface

**Responsibilities:**
- Display current date in "dddd, MMMM D, YYYY" format
- Display time-based greeting (Morning/Afternoon/Evening/Night)
- Display current time in selected format (12h or 24h)
- Update all displays every 1000ms

**Key Functions:**
- `getGreetingByHour(hour: number): string` — Returns greeting based on hour (0-23)
- `formatDate(date: Date): string` — Formats date to "dddd, MMMM D, YYYY"
- `formatTime(date: Date, format: "12h" | "24h"): string` — Formats time in selected format
- `updateGreetingDisplay(): void` — Updates all time/greeting displays (completes within 50ms)
- `initGreeting(): void` — Initializes greeting section and starts update interval

**DOM Elements:**
- `#greeting` — Greeting message display
- `#current-date` — Current date display
- `#current-time` — Current time display

---

#### Pomodoro Timer Interface

**Responsibilities:**
- Display timer in MM:SS format
- Implement state machine (stopped → running → paused → stopped)
- Support configurable duration (1-60 minutes)
- Persist timer configuration to Local Storage

**Key Functions:**
- `startTimer(): void` — Transitions to running state, starts countdown
- `pauseTimer(): void` — Pauses timer, preserves remaining time
- `resetTimer(): void` — Resets timer to configured duration (completes within 50ms)
- `setTimerDuration(minutes: number): void` — Updates configured duration and validates
- `validateTimerDuration(minutes: number): number | null` — Clamps duration to [1, 60]
- `formatTimerDisplay(seconds: number): string` — Formats seconds to "MM:SS"
- `loadTimerConfiguration(): void` — Reads configuration from Local Storage on startup

**State Machine:**
```
stopped ↔ running
paused  ↔ running
stopped ↔ paused
```

**DOM Elements:**
- `#timer-display` — Timer display (MM:SS format, monospace, 48px+)
- `#timer-start` — Start/Resume button
- `#timer-pause` — Pause button
- `#timer-reset` — Reset button
- `#timer-duration` — Duration input (1-60 minutes)
- `#timer-apply` — Apply duration button

**Local Storage Keys:**
- `dashboard_pomodoro_duration` — Configured duration (string, default: "25")

---

#### Task List Interface

**Responsibilities:**
- Display all tasks in FIFO order
- Support add/edit/delete/complete operations
- Validate task input (1-255 characters, non-empty)
- Persist all tasks to Local Storage
- Display validation errors (3-second duration)

**Key Functions:**
- `addTask(): void` — Creates and persists new task
- `editTask(taskId: string, newText: string): void` — Updates task text, preserves ID
- `deleteTask(taskId: string): void` — Removes task from list and storage
- `toggleTaskCompletion(taskId: string): void` — Toggles completed state
- `validateTaskText(text: string): boolean` — Validates text (1-255 chars, non-whitespace)
- `loadTasksFromStorage(): void` — Reads tasks from Local Storage, handles corruption
- `saveTasksToStorage(): void` — Persists tasks with retry logic (3 attempts, 100ms intervals)
- `renderTaskList(): void` — Re-renders all tasks in DOM
- `generateTaskId(): string` — Generates UUID for new tasks

**Data Structure:**
```javascript
tasks: [
  { id: string, text: string, completed: boolean },
  ...
]
```

**DOM Elements:**
- `#task-input` — Task text input field (1-255 chars)
- `#task-add` — Add task button
- `#task-error` — Error message display (3-sec auto-hide)
- `#task-list` — Unordered list of tasks

**Local Storage Keys:**
- `dashboard_tasks` — Serialized task array (JSON)

---

#### Quick Links Interface

**Responsibilities:**
- Display links as clickable buttons
- Support add/edit/delete operations
- Validate URL format (https?://.*)
- Validate name length (1-50 characters)
- Enforce maximum 20 links
- Persist to Local Storage

**Key Functions:**
- `addQuickLink(): void` — Creates and persists new link
- `editQuickLink(linkId: string, newName: string, newUrl: string): void` — Updates link
- `deleteQuickLink(linkId: string): void` — Removes link from list and storage
- `validateUrl(url: string): boolean` — Validates URL format (https?://.*)
- `validateLinkName(name: string): boolean` — Validates name (1-50 characters)
- `loadQuickLinksFromStorage(): void` — Reads links from Local Storage, handles corruption
- `saveQuickLinksToStorage(): void` — Persists links with retry logic
- `renderQuickLinksSection(): void` — Re-renders all links in DOM
- `openQuickLink(url: string): void` — Opens link in new tab

**Data Structure:**
```javascript
quickLinks: [
  { id: string, name: string, url: string },
  ...
]
```

**DOM Elements:**
- `#link-name` — Link name input (1-50 chars)
- `#link-url` — Link URL input (https?://.*)
- `#link-add` — Add link button
- `#link-error` — Error message display (3-sec auto-hide)
- `#link-list` — Container for link buttons

**Local Storage Keys:**
- `dashboard_quick_links` — Serialized links array (JSON)

---

## Component Design

### 1. Greeting Section

**Responsibilities:**
- Display current date in "dddd, MMMM D, YYYY" format
- Display time-based greeting (Morning/Afternoon/Evening/Night)
- Update both displays every 1000ms (within 50ms update window)
- Update greeting message when time crosses threshold

**State:**
```javascript
{
  greeting: "Good Morning", // Updated based on current hour
  currentDate: "Wednesday, October 8, 2026",
  currentTime: "09:30:45 AM"
}
```

**Functions:**

```javascript
function getGreetingByHour(hour) {
  // Input: hour (0-23)
  // Output: greeting string
  // Rule: 5-11 = Morning, 12-16 = Afternoon, 17-23 = Evening, 0-4 = Night
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 24) return "Good Evening";
  return "Good Night";
}

function formatDate(date) {
  // Input: Date object
  // Output: "dddd, MMMM D, YYYY" format
  // Uses Intl.DateTimeFormat or manual formatting
}

function formatTime(date, format) {
  // Input: Date object, format ("12h" or "24h")
  // Output: formatted time string
  // 12h: "HH:MM:SS AM/PM"
  // 24h: "HH:MM:SS"
}

function updateGreetingDisplay() {
  // Called every 1000ms via setInterval
  // Completes within 50ms
  // 1. Calculate current hour
  // 2. Determine greeting via getGreetingByHour()
  // 3. If greeting changed, update DOM
  // 4. Format and update time display
  // 5. Format and update date display
}

function initGreeting() {
  // Initialize on page load
  // Set initial greeting and time
  // Start 1000ms update interval
  // Store interval ID for cleanup
}
```

**Edge Cases:**
- Timezone handling: Use browser's local timezone
- Leap seconds: Ignore (not critical for dashboard)
- Format change at runtime: Re-render all displays
- Update during page unload: Clear interval on beforeunload

---

### 2. Pomodoro Timer Section

**Responsibilities:**
- Display timer in MM:SS format (monospace font, 48px+)
- Implement state machine: stopped → running → paused → stopped
- Decrement by 1 second every 1000ms
- Persist timer duration to Local Storage
- Support configurable duration (1-60 minutes)
- Update UI button states based on timer state

**State Machine:**

```
     ┌─────────────┐
     │   STOPPED   │
     └─────────────┘
          ↑    ↓
       [Reset] [Start]
          ↑    ↓
     ┌─────────────┐
     │   RUNNING   │
     └─────────────┘
          ↑    ↓
     [Pause]  [End]
          ↑    ↓
     ┌─────────────┐
     │   PAUSED    │
     └─────────────┘
          ↓    ↑
       [Start] [Reset]
```

**Data Structures:**

```javascript
timer = {
  state: "stopped", // current state
  duration: 25, // configured duration in minutes
  remaining: 1500, // remaining time in seconds
  configuredDuration: 25, // for reset operation
  intervalId: null // for cleanup
};
```

**Functions:**

```javascript
function validateTimerDuration(minutes) {
  // Input: candidate duration
  // Output: validated duration (clamped to 1-60)
  // or error
  if (!Number.isInteger(minutes)) return { error: "Duration must be integer" };
  if (minutes < 1 || minutes > 60) {
    return { value: Math.max(1, Math.min(60, minutes)) };
  }
  return { value: minutes };
}

function initTimer() {
  // On page load:
  // 1. Read configured duration from Local Storage
  //    Default: 25 minutes if not found
  // 2. Validate duration
  // 3. Set timer.remaining = timer.duration * 60
  // 4. Set timer.state = "stopped"
  // 5. Render display and button states
}

function startTimer() {
  // Precondition: state is "stopped" or "paused"
  // 1. Set timer.state = "running"
  // 2. Clear any existing interval
  // 3. Start interval: every 1000ms, call decrementTimer()
  // 4. Store interval ID for cleanup
  // 5. Update button appearances (Start disabled, Pause enabled)
  // 6. Trigger update within 100ms
}

function decrementTimer() {
  // Called every 1000ms while running
  // Must complete within 50ms
  // 1. Decrement timer.remaining by 1
  // 2. If timer.remaining <= 0:
  //    - Set timer.remaining = 0
  //    - Call timerComplete()
  // 3. Update display (MM:SS format)
  // 4. Minimal DOM manipulation for performance
}

function pauseTimer() {
  // Precondition: state is "running"
  // 1. Clear interval
  // 2. Set timer.state = "paused"
  // 3. Preserve timer.remaining exactly
  // 4. Update button appearances (Pause disabled, Start enabled as "Resume")
  // 5. Update display to show paused state (visual indicator)
}

function resumeTimer() {
  // Same as startTimer() but called from paused state
  // Ensures timer.remaining is unchanged
}

function resetTimer() {
  // Callable from any state
  // 1. Clear interval
  // 2. Set timer.remaining = timer.configuredDuration * 60
  // 3. Set timer.state = "stopped"
  // 4. Update button appearances to initial state
  // 5. Render display with reset time
  // 6. Update within 50ms
}

function timerComplete() {
  // Called when timer reaches 0
  // 1. Set timer.state = "stopped"
  // 2. Clear interval
  // 3. Play notification sound (optional)
  // 4. Display completion message
  // 5. Reset button states
}

function setTimerDuration(minutes) {
  // User wants to change timer duration
  // 1. Validate minutes (1-60)
  // 2. If validation fails, show error
  // 3. If timer is running, reject (or pause first)
  // 4. Set timer.duration = minutes
  // 5. Set timer.configuredDuration = minutes
  // 6. Reset timer display
  // 7. Persist to Local Storage with key "dashboard_pomodoro_duration"
}

function formatTimerDisplay(seconds) {
  // Input: seconds remaining
  // Output: "MM:SS" string
  // Example: 1500 seconds → "25:00"
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
```

**Performance Optimization:**
- Use single interval for timer (not multiple timers)
- Update display only when seconds change
- Minimize DOM reflows by batch updating display element

---

### 3. Task List Section

**Responsibilities:**
- Display all tasks in creation order (FIFO)
- Support add/edit/delete/complete operations
- Validate task input (1-255 characters, non-empty/non-whitespace)
- Persist all changes to Local Storage
- Show error messages (3-second duration)
- Clear input field after successful add

**Task Data Model:**

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000", // UUID v4
  text: "Complete project design", // 1-255 chars
  completed: false // boolean
}
```

**Functions:**

```javascript
function generateTaskId() {
  // Generate UUID v4
  // Can use: crypto.getRandomValues() or simple Math.random() implementation
  // Return: UUID string
}

function validateTaskText(text) {
  // Input: task text
  // Output: { valid: true } or { valid: false, error: "..." }
  // Rules:
  // - Cannot be null/undefined
  // - Must be 1-255 characters
  // - Cannot be only whitespace
  if (typeof text !== 'string') {
    return { valid: false, error: "Task must be text" };
  }
  if (text.trim().length === 0) {
    return { valid: false, error: "Task cannot be empty" };
  }
  if (text.length > 255) {
    return { valid: false, error: "Task cannot exceed 255 characters" };
  }
  return { valid: true };
}

function addTask(text) {
  // 1. Validate input
  // 2. If invalid, show error message (3-second display)
  // 3. If valid:
  //    - Generate unique ID
  //    - Create task object { id, text, completed: false }
  //    - Add to appState.tasks
  //    - Persist to Local Storage within 1 second
  //    - Render new task in DOM (appear within 100ms)
  //    - Clear input field
  //    - Return task object
}

function editTask(taskId, newText) {
  // Precondition: task with ID exists
  // 1. Validate newText (same as addTask)
  // 2. If invalid, show error and reject
  // 3. If valid:
  //    - Update task.text in appState
  //    - Preserve task.completed state
  //    - Update DOM display (within 100ms)
  //    - Persist to Local Storage (within 1 second)
  //    - Exit edit mode UI
}

function deleteTask(taskId) {
  // Precondition: task with ID exists
  // 1. Find task in appState.tasks
  // 2. Remove from array
  // 3. Update DOM: remove task element (within 300ms)
  // 4. Persist to Local Storage (within 1 second)
  // 5. Adjust layout (no visual gaps)
}

function toggleTaskCompletion(taskId) {
  // Precondition: task with ID exists
  // 1. Find task in appState.tasks
  // 2. Toggle task.completed boolean
  // 3. Update visual styling within 100ms (strikethrough, opacity)
  // 4. Persist to Local Storage (within 1 second)
  // 5. Return new completion state
}

function loadTasksFromStorage() {
  // On page load:
  // 1. Read "dashboard_tasks" key from Local Storage
  // 2. Parse JSON
  // 3. Validate each task object:
  //    - Has required fields: id, text, completed
  //    - Types are correct (id: string, text: string, completed: boolean)
  //    - Skip invalid tasks
  // 4. If corrupted/invalid JSON:
  //    - Catch parse error
  //    - Clear storage key
  //    - Log error to console
  //    - Initialize with empty tasks array
  // 5. Update appState.tasks
  // 6. Return tasks array
}

function saveTasksToStorage() {
  // Call after any task modification
  // 1. Serialize appState.tasks to JSON array
  // 2. Implement retry logic (up to 3 attempts, 100ms intervals):
  //    - Try to write to Local Storage
  //    - If quota exceeded error:
  //      - Show error: "Unable to save tasks - storage may be full"
  //      - Retry up to 3 times
  //    - If successful, break retry loop
  // 3. Return success/failure boolean
}

function renderTaskList() {
  // Render all tasks in DOM
  // Called after loading from storage or after modifications
  // 1. Clear task list container (except template/styling)
  // 2. For each task in appState.tasks (in order):
  //    - Create task element with:
  //      - Task text display
  //      - Completion checkbox/button
  //      - Edit button
  //      - Delete button
  //    - If task.completed, apply strikethrough and opacity styling
  //    - Append to container
  // 3. If no tasks, show empty state message
}

function enterEditMode(taskId) {
  // User clicks edit on a task
  // 1. Find task element in DOM
  // 2. Replace text display with editable input field
  // 3. Pre-fill input with current task text
  // 4. Select all text in input
  // 5. Set focus on input
  // 6. Show Save and Cancel buttons
  // 7. Attach event listeners:
  //    - Enter key → save edit
  //    - Escape key → cancel
  //    - Cancel button → exit edit mode
}

function exitEditMode(taskId, save = false) {
  // Exit edit mode with or without saving
  // 1. If save = true:
  //    - Get text from edit input
  //    - Call editTask(taskId, text)
  // 2. Restore task display to normal state
  // 3. Remove edit input and buttons
  // 4. If save failed, remain in edit mode with error shown
}
```

**Local Storage Format:**

```json
{
  "dashboard_tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Complete project design",
      "completed": false
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "text": "Review code changes",
      "completed": true
    }
  ]
}
```

---

### 4. Quick Links Section

**Responsibilities:**
- Display links as clickable buttons
- Support add/edit/delete operations
- Validate URL format (https?://.*)
- Validate name length (1-50 characters)
- Enforce maximum 20 links
- Persist to Local Storage
- Open links in new tab (target="_blank")

**Quick Link Data Model:**

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000", // UUID v4
  name: "GitHub", // 1-50 chars
  url: "https://github.com" // valid URL format
}
```

**Functions:**

```javascript
function validateUrl(url) {
  // Input: candidate URL
  // Output: { valid: true } or { valid: false, error: "..." }
  // Pattern: https?://.*
  const urlPattern = /^https?:\/\/.+$/;
  if (!urlPattern.test(url)) {
    return { valid: false, error: "Invalid URL format" };
  }
  return { valid: true };
}

function validateLinkName(name) {
  // Input: link name
  // Output: { valid: true } or { valid: false, error: "..." }
  // Rules: 1-50 characters, non-empty/non-whitespace
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Link name cannot be empty" };
  }
  if (name.length > 50) {
    return { valid: false, error: "Link name cannot exceed 50 characters" };
  }
  return { valid: true };
}

function addQuickLink(name, url) {
  // 1. Validate name
  // 2. Validate URL
  // 3. If validation fails, show error
  // 4. If link count >= 20:
  //    - Show error: "Maximum 20 links reached"
  //    - Return null
  // 5. If valid:
  //    - Generate unique ID
  //    - Create link object { id, name, url }
  //    - Add to appState.quickLinks
  //    - Render new link in DOM (within 100ms)
  //    - Persist to Local Storage (within 1 second)
  //    - Clear form fields
  //    - Return link object
}

function editQuickLink(linkId, newName, newUrl) {
  // 1. Validate newName
  // 2. Validate newUrl
  // 3. If validation fails, show error and reject
  // 4. If valid:
  //    - Find link in appState.quickLinks
  //    - Update link.name and link.url
  //    - Update DOM (within 500ms)
  //    - Persist to Local Storage (within 1 second)
  //    - Exit edit mode
}

function deleteQuickLink(linkId) {
  // 1. Find link in appState.quickLinks
  // 2. Remove from array
  // 3. Update DOM (within 300ms)
  // 4. Persist to Local Storage (within 1 second)
}

function openQuickLink(url) {
  // User clicks link button
  // 1. Open URL in new tab: window.open(url, "_blank")
  // 2. Return immediately (no blocking)
}

function loadQuickLinksFromStorage() {
  // On page load:
  // 1. Read "dashboard_quick_links" from Local Storage
  // 2. Parse JSON
  // 3. Validate each link object:
  //    - Has required fields: id, name, url
  //    - Types correct (all strings)
  //    - Skip invalid links
  // 4. If corrupted/invalid JSON:
  //    - Catch parse error
  //    - Clear storage key
  //    - Log error to console
  //    - Initialize with empty links array
  // 5. Update appState.quickLinks
  // 6. Return links array
}

function saveQuickLinksToStorage() {
  // After any link modification
  // 1. Serialize appState.quickLinks to JSON array
  // 2. Implement retry logic (up to 3 attempts, 100ms intervals)
  // 3. Handle Local Storage quota exceeded:
  //    - Show error: "Cannot save link - storage is full"
}

function renderQuickLinksSection() {
  // Render all links in DOM
  // 1. Clear links container
  // 2. For each link in appState.quickLinks (in order):
  //    - Create button/link element with:
  //      - Link name as button text
  //      - Edit button
  //      - Delete button
  //    - Attach click handler: openQuickLink(url)
  //    - Append to container
  // 3. If no links, show empty state with "Add first link" button
}
```

**Local Storage Format:**

```json
{
  "dashboard_quick_links": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "GitHub",
      "url": "https://github.com"
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "name": "MDN Docs",
      "url": "https://developer.mozilla.org"
    }
  ]
}
```

---

### 5. Global Event Handling and Error Management

**Input Validation Pipeline:**

All user inputs flow through a validation layer:

```javascript
function validateAndProcessInput(type, data) {
  // type: "task", "link_name", "link_url", "timer_duration"
  // data: user input
  // Returns: { valid: true, value: ... } or { valid: false, error: "..." }
  
  switch(type) {
    case "task":
      return validateTaskText(data);
    case "link_name":
      return validateLinkName(data);
    case "link_url":
      return validateUrl(data);
    case "timer_duration":
      return validateTimerDuration(data);
  }
}
```

**Error Display:**

```javascript
function showError(message, duration = 3000) {
  // Display error message for specified duration
  // 1. Create error element
  // 2. Set text to message
  // 3. Insert into DOM
  // 4. After duration milliseconds, remove element
  // 5. Allow user to dismiss manually
}

function showSuccess(message, duration = 2000) {
  // Display brief success notification
  // Similar to showError but with success styling
}
```

**Local Storage Quota Management:**

```javascript
function checkStorageQuota() {
  // Check available storage
  // Implement retry logic for quota exceeded scenarios
}

function clearCorruptedData(key) {
  // Clear specific Local Storage key if corrupted
  // Log error with details
  // Notify user if critical data was lost
}
```

---

## Data Models

### Complete Data Structure

```javascript
// Application state object
const appState = {
  // Time and greeting
  greeting: "Good Morning",
  timeFormat: "12h", // persisted to "dashboard_time_format"
  
  // Timer state
  timer: {
    state: "stopped", // "stopped" | "running" | "paused"
    duration: 25, // minutes (persisted to "dashboard_pomodoro_duration")
    remaining: 1500, // seconds (not persisted, calculated each load)
    configuredDuration: 25 // for reset
  },
  
  // Tasks persisted to "dashboard_tasks"
  tasks: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      text: "Task description",
      completed: false
    }
  ],
  
  // Quick links persisted to "dashboard_quick_links"
  quickLinks: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "GitHub",
      url: "https://github.com"
    }
  ]
};
```

### Serialization Strategy

**Tasks Serialization:**
```javascript
JSON.stringify(appState.tasks)
// Output:
// [{"id":"...","text":"...","completed":false}]
```

**Quick Links Serialization:**
```javascript
JSON.stringify(appState.quickLinks)
// Output:
// [{"id":"...","name":"...","url":"..."}]
```

**Configuration Serialization:**
```javascript
// Atomic writes for each configuration item
localStorage.setItem("dashboard_pomodoro_duration", "25");
localStorage.setItem("dashboard_time_format", "12h");
```

### Local Storage Key Strategy

| Key | Value Type | Format | Default |
|-----|-----------|--------|---------|
| `dashboard_tasks` | JSON array | `[{id, text, completed}...]` | `[]` |
| `dashboard_quick_links` | JSON array | `[{id, name, url}...]` | `[]` |
| `dashboard_pomodoro_duration` | String | `"25"` | `"25"` |
| `dashboard_time_format` | String | `"12h"` or `"24h"` | `"12h"` |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Date Formatting Correctness

*For any* valid date input, formatting it and parsing the output SHALL produce a date equivalent to the input date (same day, month, year).

**Validates: Requirements 1.1**

### Property 2: Time Format Selection

*For any* selected time format (12h or 24h) and any time value, the formatted output SHALL match the expected format pattern (12h format contains AM/PM, 24h format uses 0-23 hour range).

**Validates: Requirements 1.2**

### Property 3: Update Timing Efficiency

*For any* time update operation with a random number of DOM elements, the update completion time SHALL not exceed 50 milliseconds.

**Validates: Requirements 1.4**

### Property 4: Greeting Correctness by Time Range

*For any* time value (hour 0-23), the returned greeting SHALL match the correct range: hours 5-11 → "Good Morning", 12-16 → "Good Afternoon", 17-23 → "Good Evening", 0-4 → "Good Night".

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 5: Timer Duration Clamping

*For any* candidate timer duration value, the validated duration SHALL be clamped to the range [1, 60] minutes inclusive, and the clamped value SHALL be persisted and retrieved correctly.

**Validates: Requirements 3.3, 3.4, 3.6**

### Property 6: Timer Countdown Accuracy

*For any* initial timer duration, running the countdown for N iterations SHALL decrement the remaining time by exactly N seconds.

**Validates: Requirements 4.2**

### Property 7: Timer Pause Preservation

*For any* running timer paused at a given remaining time, the remaining time value SHALL be preserved exactly after pause, and resuming SHALL continue from that preserved value.

**Validates: Requirements 5.2, 5.3**

### Property 8: Timer Reset Idempotence

*For any* timer in any state (running, paused, stopped), resetting it SHALL always return remaining time to the configured full duration, and the operation SHALL complete within 50 milliseconds.

**Validates: Requirements 6.1, 6.2, 6.4**

### Property 9: Task Creation with Unique Identifiers

*For any* valid task text (1-255 non-whitespace characters), adding it SHALL create a task with a unique UUID that does not collide with any existing task ID in the current session.

**Validates: Requirements 7.2**

### Property 10: Task Addition Persistence Round-Trip

*For any* valid task text added to the task list, retrieving tasks from Local Storage after save SHALL include the added task with identical text and ID.

**Validates: Requirements 7.4, 11.1**

### Property 11: Task Edit Preservation

*For any* existing task with new text (1-255 characters), editing the task SHALL preserve the task ID and completion state exactly while updating the text.

**Validates: Requirements 8.2, 8.5**

### Property 12: Task Completion Toggle Idempotence

*For any* existing task, toggling completion twice SHALL return the task to its original completion state.

**Validates: Requirements 9.1**

### Property 13: Task Deletion Consistency

*For any* existing task deleted from the list, querying the task list and Local Storage after deletion SHALL not return that task.

**Validates: Requirements 10.1, 10.3**

### Property 14: Tasks Persistence Order

*For any* sequence of tasks added in order, retrieving from Local Storage after save SHALL return tasks in the same creation order (FIFO).

**Validates: Requirements 11.4**

### Property 15: Task Data Format Validation

*For any* tasks saved to and loaded from Local Storage, each task object SHALL have required fields (id: string, text: string, completed: boolean) with correct types, and invalid tasks SHALL be skipped during load.

**Validates: Requirements 11.8**

### Property 16: Quick Link URL Validation

*For any* candidate URL, validation SHALL accept URLs matching pattern `https?://.*` and reject all others with an "Invalid URL format" error.

**Validates: Requirements 12.2**

### Property 17: Quick Link Name Length Validation

*For any* candidate link name, validation SHALL accept names 1-50 characters and reject names outside this range with appropriate error messages.

**Validates: Requirements 12.2, 13.1**

### Property 18: Quick Link Creation Persistence

*For any* valid quick link (name and URL) added to the link list, retrieving links from Local Storage after save SHALL include the added link with identical data and unique ID.

**Validates: Requirements 12.6, 15.1**

### Property 19: Quick Link Edit Update

*For any* existing quick link with new name (1-50 chars) and/or URL, editing SHALL update the link while preserving the ID.

**Validates: Requirements 13.4, 13.5**

### Property 20: Quick Link Deletion Consistency

*For any* existing quick link deleted from the list, querying the link list and Local Storage after deletion SHALL not return that link.

**Validates: Requirements 14.1, 14.2**

### Property 21: Quick Link Count Limit

*For any* attempt to add a quick link when count >= 20, the operation SHALL be rejected with an appropriate error message and the link count SHALL remain unchanged.

**Validates: Requirements 12.9**

### Property 22: Task Input Validation - Empty Task Rejection

*For any* string composed entirely of whitespace characters, attempting to add it as a task SHALL be rejected with error "Task cannot be empty", and the task list SHALL remain unchanged.

**Validates: Requirements 7.5**

### Property 23: URL Format Consistency

*For any* quick link stored and retrieved from Local Storage, the URL SHALL maintain its exact format and be usable with window.open().

**Validates: Requirements 15.2**

### Property 24: Local Storage Recovery from Corruption

*For any* corrupted or invalid JSON in Local Storage for tasks or links, the Dashboard SHALL detect the corruption, clear the corrupted data, display the section as empty, log error to console, and continue functioning.

**Validates: Requirements 11.5, 15.5**

---

## Error Handling

### Error Categories and Responses

| Scenario | Error Message | User Action | Recovery |
|----------|---------------|-------------|----------|
| Empty task entry | "Task cannot be empty" | Show for 3 seconds | Input field remains focused |
| Task exceeds 255 chars | "Task cannot exceed 255 characters" | Show for 3 seconds | Truncate suggested in input |
| Invalid URL format | "Invalid URL format" | Show for 3 seconds | Focus on URL input field |
| Link name exceeds 50 chars | "Link name cannot exceed 50 characters" | Show for 3 seconds | Truncate suggested in input |
| Local Storage quota exceeded | "Unable to save tasks - storage may be full" | Show permanently | Offer to clear old data |
| Corrupted Local Storage data | [Silent, log to console] | No user message | Clear corrupted key, initialize empty |
| Unsupported browser | "Your browser is not fully supported..." | Banner at top | Disable non-essential features |

### Retry Logic for Storage Operations

```javascript
async function saveToStorageWithRetry(key, value, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      localStorage.setItem(key, value);
      return { success: true };
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        if (attempt < retries - 1) {
          // Wait 100ms before retry
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          return { 
            success: false, 
            error: "Unable to save - storage may be full" 
          };
        }
      } else {
        return { success: false, error: error.message };
      }
    }
  }
}
```

---

## File Structure

### Directory Layout

```
project-root/
├── index.html           (single HTML file, semantic markup)
├── css/
│   └── style.css        (single CSS file, organized sections)
└── js/
    └── app.js          (single JS file, modular functions)
```

### HTML Structure (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>To Do List Life Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app" class="dashboard">
    
    <!-- Greeting Section -->
    <section id="greeting-section" class="section greeting">
      <div class="date" id="current-date"></div>
      <div class="greeting-message" id="greeting"></div>
      <div class="time" id="current-time"></div>
    </section>
    
    <!-- Pomodoro Timer Section -->
    <section id="timer-section" class="section timer">
      <h2>Focus Timer</h2>
      <div class="timer-display" id="timer-display">25:00</div>
      <div class="timer-controls">
        <button id="timer-start" class="btn btn-primary">Start</button>
        <button id="timer-pause" class="btn btn-secondary" disabled>Pause</button>
        <button id="timer-reset" class="btn btn-secondary">Reset</button>
      </div>
      <div class="timer-config">
        <label for="timer-duration">Duration (minutes):</label>
        <input type="number" id="timer-duration" min="1" max="60" value="25">
        <button id="timer-apply" class="btn btn-small">Apply</button>
      </div>
    </section>
    
    <!-- Task List Section -->
    <section id="task-section" class="section tasks">
      <h2>My Tasks</h2>
      <div class="task-input-group">
        <input 
          type="text" 
          id="task-input" 
          placeholder="Add a new task..."
          maxlength="255"
        >
        <button id="task-add" class="btn btn-primary">Add</button>
      </div>
      <div id="task-error" class="error-message"></div>
      <ul id="task-list" class="task-list"></ul>
    </section>
    
    <!-- Quick Links Section -->
    <section id="links-section" class="section links">
      <h2>Quick Links</h2>
      <div class="link-input-group">
        <input 
          type="text" 
          id="link-name" 
          placeholder="Link name (1-50 chars)"
          maxlength="50"
        >
        <input 
          type="url" 
          id="link-url" 
          placeholder="https://example.com"
          maxlength="2048"
        >
        <button id="link-add" class="btn btn-primary">Add Link</button>
      </div>
      <div id="link-error" class="error-message"></div>
      <div id="link-list" class="link-list"></div>
    </section>
    
  </div>

  <script src="js/app.js"></script>
</body>
</html>
```

### CSS Structure (css/style.css)

```css
/* ===== RESET AND BASE STYLES ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

/* ===== TYPOGRAPHY ===== */
h1, h2 {
  font-weight: 600;
  margin-bottom: 1rem;
}

h1, .dashboard > h1 {
  font-size: 32px;
}

h2 {
  font-size: 20px;
}

body {
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.5px;
}

/* ===== LAYOUT: DASHBOARD GRID ===== */
.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .dashboard {
    grid-template-columns: 1fr;
    padding: 16px;
  }
}

/* ===== SECTIONS ===== */
.section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Greeting Section */
.greeting {
  grid-column: 1 / -1;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.greeting .date {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.greeting-message {
  font-size: 28px;
  font-weight: 600;
  margin: 12px 0;
}

.greeting .time {
  font-family: 'Courier New', monospace;
  font-size: 48px;
  font-weight: 300;
}

/* Timer Section */
.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-display {
  font-family: 'Courier New', monospace;
  font-size: 48px;
  font-weight: 600;
  margin: 20px 0;
  text-align: center;
  color: #667eea;
  min-width: 200px;
}

.timer-controls {
  display: flex;
  gap: 12px;
  margin: 20px 0;
  justify-content: center;
  flex-wrap: wrap;
}

.timer-config {
  margin-top: 20px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

/* Task List Section */
.task-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.task-input-group input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.task-list {
  list-style: none;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eee;
  line-height: 1.5;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-text {
  text-decoration: line-through;
}

.task-checkbox {
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.task-text {
  flex: 1;
  word-break: break-word;
}

.task-actions {
  display: flex;
  gap: 8px;
}

/* Quick Links Section */
.link-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.link-input-group input {
  flex: 1;
  min-width: 150px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.link-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.link-button {
  padding: 12px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  transition: background 200ms ease;
}

.link-button:hover {
  background: #764ba2;
}

.link-button:focus {
  outline: 2px solid #333;
  outline-offset: 2px;
}

/* ===== BUTTONS ===== */
.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 200ms ease;
}

.btn:focus {
  outline: 2px solid #333;
  outline-offset: 2px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e8e8e8;
}

.btn-small {
  padding: 8px 12px;
  font-size: 12px;
}

.btn-danger {
  background: #ff6b6b;
  color: white;
}

.btn-danger:hover {
  background: #ff5252;
}

/* ===== ERROR AND SUCCESS MESSAGES ===== */
.error-message {
  color: #ff6b6b;
  font-size: 14px;
  padding: 12px;
  background: #ffe0e0;
  border-radius: 4px;
  display: none;
  margin-bottom: 12px;
}

.error-message.show {
  display: block;
}

.success-message {
  color: #51cf66;
  font-size: 14px;
  padding: 12px;
  background: #e7f5e7;
  border-radius: 4px;
  display: none;
  margin-bottom: 12px;
}

.success-message.show {
  display: block;
}

/* ===== INPUTS ===== */
input[type="text"],
input[type="url"],
input[type="number"] {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* ===== ACCESSIBILITY ===== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 12px;
  }

  .greeting .time {
    font-size: 36px;
  }

  .timer-display {
    font-size: 40px;
  }

  .link-input-group {
    flex-direction: column;
  }

  .link-input-group input {
    width: 100%;
  }
}
```

### JavaScript Structure (js/app.js)

```javascript
// ===== APPLICATION STATE =====
const appState = {
  greeting: "Good Morning",
  timeFormat: "12h",
  timer: {
    state: "stopped",
    duration: 25,
    remaining: 1500,
    configuredDuration: 25,
    intervalId: null
  },
  tasks: [],
  quickLinks: []
};

// ===== DOM REFERENCES =====
const dom = {
  greeting: document.getElementById("greeting"),
  currentDate: document.getElementById("current-date"),
  currentTime: document.getElementById("current-time"),
  timerDisplay: document.getElementById("timer-display"),
  timerStart: document.getElementById("timer-start"),
  timerPause: document.getElementById("timer-pause"),
  timerReset: document.getElementById("timer-reset"),
  timerDuration: document.getElementById("timer-duration"),
  timerApply: document.getElementById("timer-apply"),
  taskInput: document.getElementById("task-input"),
  taskAdd: document.getElementById("task-add"),
  taskError: document.getElementById("task-error"),
  taskList: document.getElementById("task-list"),
  linkName: document.getElementById("link-name"),
  linkUrl: document.getElementById("link-url"),
  linkAdd: document.getElementById("link-add"),
  linkError: document.getElementById("link-error"),
  linkList: document.getElementById("link-list")
};

// ===== INITIALIZATION =====
function init() {
  loadTasksFromStorage();
  loadQuickLinksFromStorage();
  loadTimerConfiguration();
  initGreeting();
  renderTaskList();
  renderQuickLinksSection();
  attachEventListeners();
}

function attachEventListeners() {
  dom.taskAdd.addEventListener("click", handleAddTask);
  dom.taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleAddTask();
  });
  dom.linkAdd.addEventListener("click", handleAddLink);
  dom.timerStart.addEventListener("click", startTimer);
  dom.timerPause.addEventListener("click", pauseTimer);
  dom.timerReset.addEventListener("click", resetTimer);
  dom.timerApply.addEventListener("click", handleApplyTimerDuration);
  
  // Prevent accidental data loss
  window.addEventListener("beforeunload", (e) => {
    if (appState.tasks.length > 0 || appState.quickLinks.length > 0) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}

// ===== GREETING FUNCTIONS =====
function getGreetingByHour(hour) {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 24) return "Good Evening";
  return "Good Night";
}

function formatDate(date) {
  const options = { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  };
  return date.toLocaleDateString("en-US", options);
}

function formatTime(date, format) {
  if (format === "24h") {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      hour12: false 
    });
  } else {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    });
  }
}

function updateGreetingDisplay() {
  const now = new Date();
  const hour = now.getHours();
  const newGreeting = getGreetingByHour(hour);
  
  if (newGreeting !== appState.greeting) {
    appState.greeting = newGreeting;
    dom.greeting.textContent = newGreeting;
  }
  
  dom.currentDate.textContent = formatDate(now);
  dom.currentTime.textContent = formatTime(now, appState.timeFormat);
}

function initGreeting() {
  updateGreetingDisplay();
  setInterval(updateGreetingDisplay, 1000);
}

// ===== TIMER FUNCTIONS =====
function validateTimerDuration(minutes) {
  if (!Number.isInteger(minutes)) return null;
  return Math.max(1, Math.min(60, minutes));
}

function formatTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function loadTimerConfiguration() {
  const stored = localStorage.getItem("dashboard_pomodoro_duration");
  const duration = stored ? parseInt(stored) : 25;
  const validated = validateTimerDuration(duration);
  
  appState.timer.duration = validated || 25;
  appState.timer.configuredDuration = appState.timer.duration;
  appState.timer.remaining = appState.timer.duration * 60;
  
  dom.timerDuration.value = appState.timer.duration;
  dom.timerDisplay.textContent = formatTimerDisplay(appState.timer.remaining);
}

function startTimer() {
  if (appState.timer.state === "running") return;
  
  appState.timer.state = "running";
  dom.timerStart.disabled = true;
  dom.timerPause.disabled = false;
  dom.timerReset.disabled = false;
  dom.timerDuration.disabled = true;
  dom.timerApply.disabled = true;
  
  appState.timer.intervalId = setInterval(() => {
    appState.timer.remaining--;
    dom.timerDisplay.textContent = formatTimerDisplay(appState.timer.remaining);
    
    if (appState.timer.remaining <= 0) {
      timerComplete();
    }
  }, 1000);
}

function pauseTimer() {
  if (appState.timer.state !== "running") return;
  
  clearInterval(appState.timer.intervalId);
  appState.timer.state = "paused";
  dom.timerStart.disabled = false;
  dom.timerStart.textContent = "Resume";
  dom.timerPause.disabled = true;
}

function resetTimer() {
  clearInterval(appState.timer.intervalId);
  appState.timer.state = "stopped";
  appState.timer.remaining = appState.timer.configuredDuration * 60;
  
  dom.timerDisplay.textContent = formatTimerDisplay(appState.timer.remaining);
  dom.timerStart.disabled = false;
  dom.timerStart.textContent = "Start";
  dom.timerPause.disabled = true;
  dom.timerReset.disabled = false;
  dom.timerDuration.disabled = false;
  dom.timerApply.disabled = false;
}

function timerComplete() {
  clearInterval(appState.timer.intervalId);
  appState.timer.state = "stopped";
  alert("Pomodoro complete! Take a break.");
  resetTimer();
}

function handleApplyTimerDuration() {
  const newDuration = parseInt(dom.timerDuration.value);
  const validated = validateTimerDuration(newDuration);
  
  if (!validated) {
    showError("Duration must be between 1 and 60 minutes");
    return;
  }
  
  appState.timer.duration = validated;
  appState.timer.configuredDuration = validated;
  appState.timer.remaining = validated * 60;
  
  localStorage.setItem("dashboard_pomodoro_duration", String(validated));
  resetTimer();
}

// ===== TASK FUNCTIONS =====
function generateTaskId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function validateTaskText(text) {
  if (typeof text !== "string") return false;
  return text.trim().length > 0 && text.length <= 255;
}

function addTask() {
  const text = dom.taskInput.value;
  
  if (!validateTaskText(text)) {
    showError("Task cannot be empty");
    return;
  }
  
  const task = {
    id: generateTaskId(),
    text: text.trim(),
    completed: false
  };
  
  appState.tasks.push(task);
  saveTasksToStorage();
  renderTaskList();
  dom.taskInput.value = "";
  dom.taskInput.focus();
}

function deleteTask(taskId) {
  appState.tasks = appState.tasks.filter(t => t.id !== taskId);
  saveTasksToStorage();
  renderTaskList();
}

function toggleTaskCompletion(taskId) {
  const task = appState.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasksToStorage();
    renderTaskList();
  }
}

function editTask(taskId, newText) {
  if (!validateTaskText(newText)) {
    showError("Task cannot be empty");
    return;
  }
  
  const task = appState.tasks.find(t => t.id === taskId);
  if (task) {
    task.text = newText.trim();
    saveTasksToStorage();
    renderTaskList();
  }
}

function loadTasksFromStorage() {
  try {
    const stored = localStorage.getItem("dashboard_tasks");
    if (!stored) {
      appState.tasks = [];
      return;
    }
    
    const tasks = JSON.parse(stored);
    if (!Array.isArray(tasks)) {
      throw new Error("Invalid format");
    }
    
    appState.tasks = tasks.filter(t => 
      t && typeof t.id === "string" && 
      typeof t.text === "string" && 
      typeof t.completed === "boolean"
    );
  } catch (error) {
    console.error("Error loading tasks:", error);
    localStorage.removeItem("dashboard_tasks");
    appState.tasks = [];
  }
}

function saveTasksToStorage() {
  try {
    localStorage.setItem("dashboard_tasks", JSON.stringify(appState.tasks));
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      showError("Unable to save tasks - storage may be full");
    } else {
      console.error("Storage error:", error);
    }
  }
}

function renderTaskList() {
  dom.taskList.innerHTML = "";
  
  if (appState.tasks.length === 0) {
    dom.taskList.innerHTML = "<li class='task-empty'>No tasks yet. Add one to get started!</li>";
    return;
  }
  
  appState.tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    
    li.innerHTML = `
      <input 
        type="checkbox" 
        class="task-checkbox" 
        ${task.completed ? "checked" : ""} 
        aria-label="Mark task complete"
      >
      <span class="task-text">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button class="btn btn-small btn-secondary" aria-label="Edit task">Edit</button>
        <button class="btn btn-small btn-danger" aria-label="Delete task">Delete</button>
      </div>
    `;
    
    const checkbox = li.querySelector(".task-checkbox");
    checkbox.addEventListener("change", () => toggleTaskCompletion(task.id));
    
    const editBtn = li.querySelector("[aria-label='Edit task']");
    editBtn.addEventListener("click", () => handleEditTask(task.id, task.text));
    
    const deleteBtn = li.querySelector("[aria-label='Delete task']");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));
    
    dom.taskList.appendChild(li);
  });
}

function handleAddTask() {
  addTask();
}

function handleEditTask(taskId, currentText) {
  const newText = prompt("Edit task:", currentText);
  if (newText !== null && newText !== currentText) {
    editTask(taskId, newText);
  }
}

// ===== QUICK LINK FUNCTIONS =====
function validateUrl(url) {
  const pattern = /^https?:\/\/.+$/;
  return pattern.test(url);
}

function validateLinkName(name) {
  return name && name.trim().length > 0 && name.length <= 50;
}

function addQuickLink() {
  const name = dom.linkName.value.trim();
  const url = dom.linkUrl.value.trim();
  
  if (!validateLinkName(name)) {
    showError("Link name must be 1-50 characters", true);
    return;
  }
  
  if (!validateUrl(url)) {
    showError("Invalid URL format (must start with http:// or https://)", true);
    return;
  }
  
  if (appState.quickLinks.length >= 20) {
    showError("Maximum 20 links reached", true);
    return;
  }
  
  const link = {
    id: generateTaskId(),
    name: name,
    url: url
  };
  
  appState.quickLinks.push(link);
  saveQuickLinksToStorage();
  renderQuickLinksSection();
  dom.linkName.value = "";
  dom.linkUrl.value = "";
}

function deleteQuickLink(linkId) {
  appState.quickLinks = appState.quickLinks.filter(l => l.id !== linkId);
  saveQuickLinksToStorage();
  renderQuickLinksSection();
}

function loadQuickLinksFromStorage() {
  try {
    const stored = localStorage.getItem("dashboard_quick_links");
    if (!stored) {
      appState.quickLinks = [];
      return;
    }
    
    const links = JSON.parse(stored);
    if (!Array.isArray(links)) {
      throw new Error("Invalid format");
    }
    
    appState.quickLinks = links.filter(l => 
      l && typeof l.id === "string" && 
      typeof l.name === "string" && 
      typeof l.url === "string"
    );
  } catch (error) {
    console.error("Error loading links:", error);
    localStorage.removeItem("dashboard_quick_links");
    appState.quickLinks = [];
  }
}

function saveQuickLinksToStorage() {
  try {
    localStorage.setItem("dashboard_quick_links", JSON.stringify(appState.quickLinks));
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      showError("Cannot save link - storage is full", true);
    } else {
      console.error("Storage error:", error);
    }
  }
}

function renderQuickLinksSection() {
  dom.linkList.innerHTML = "";
  
  if (appState.quickLinks.length === 0) {
    dom.linkList.innerHTML = "<p class='empty-state'>No quick links yet. Add your favorite sites!</p>";
    return;
  }
  
  appState.quickLinks.forEach(link => {
    const div = document.createElement("div");
    div.className = "link-item";
    
    div.innerHTML = `
      <button class="link-button" onclick="window.open('${escapeHtml(link.url)}', '_blank')">
        ${escapeHtml(link.name)}
      </button>
      <button class="btn btn-small btn-secondary" aria-label="Edit link">Edit</button>
      <button class="btn btn-small btn-danger" aria-label="Delete link">Delete</button>
    `;
    
    const editBtn = div.querySelector("[aria-label='Edit link']");
    editBtn.addEventListener("click", () => handleEditLink(link.id, link.name, link.url));
    
    const deleteBtn = div.querySelector("[aria-label='Delete link']");
    deleteBtn.addEventListener("click", () => deleteQuickLink(link.id));
    
    dom.linkList.appendChild(div);
  });
}

function handleAddLink() {
  addQuickLink();
}

function handleEditLink(linkId, currentName, currentUrl) {
  const newName = prompt("Edit link name:", currentName);
  if (newName === null) return;
  
  if (!validateLinkName(newName)) {
    showError("Link name must be 1-50 characters", true);
    return;
  }
  
  const newUrl = prompt("Edit link URL:", currentUrl);
  if (newUrl === null) return;
  
  if (!validateUrl(newUrl)) {
    showError("Invalid URL format", true);
    return;
  }
  
  const link = appState.quickLinks.find(l => l.id === linkId);
  if (link) {
    link.name = newName;
    link.url = newUrl;
    saveQuickLinksToStorage();
    renderQuickLinksSection();
  }
}

// ===== UTILITY FUNCTIONS =====
function showError(message, isLink = false) {
  const errorDiv = isLink ? dom.linkError : dom.taskError;
  errorDiv.textContent = message;
  errorDiv.classList.add("show");
  
  setTimeout(() => {
    errorDiv.classList.remove("show");
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== START APP =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
```

---

## Performance Considerations

### DOM Optimization

1. **Batch Updates**: Group DOM changes together rather than individual updates
2. **Minimal Reflows**: Update only changed elements
3. **Event Delegation**: Use event listeners on parent elements for lists
4. **Debouncing**: Throttle rapid input events (e.g., timer updates)

### Local Storage Optimization

1. **Single Serialization**: Convert to JSON once per save, not multiple times
2. **Async Writes**: Consider Web Workers for large dataset writes (future enhancement)
3. **Quota Management**: Monitor usage and warn before exceeding limits

### Animation Performance

- Use CSS transitions for hover/focus effects (GPU-accelerated)
- Avoid animating transform properties that trigger layout recalculation
- Target 60fps with `requestAnimationFrame()` if implementing custom animations

### Load Time Strategy

- Critical path: HTML parse → CSS load → basic rendering
- Non-critical: Timer interval, greeting updates (can be deferred)
- Inline critical CSS for faster first paint

---

## Testing Strategy

### Unit Tests (Example-Based)

Test specific implementations with concrete examples:

```
- Date formatting with known dates (e.g., Oct 8, 2026)
- Time formatting in both 12h and 24h formats
- Greeting assignment for boundary hours (4:59 AM, 5:00 AM)
- Timer countdown for specific durations (25 min, 1 min)
- Task validation: empty strings, whitespace, max length
- URL validation: http://, https://, no scheme
- Local Storage read/write with valid and corrupted data
```

### Property-Based Tests (Using Hypothesis or fast-check)

Test universal properties across generated inputs:

```
- For any date, formatting preserves day/month/year
- For any time, format selection produces correct pattern
- For any hours, greeting matches correct range
- For any task list, persistence round-trip is identity
- For any URL, validation is consistent
- For any timer duration, clamping produces value in [1,60]
```

### Integration Tests

Test across components and with real Local Storage:

```
- Full lifecycle: add task → edit → complete → delete
- Local Storage quota scenarios
- Cross-tab synchronization (same browser)
- Browser compatibility (Chrome, Firefox, Edge, Safari)
```

### Performance Tests

Verify timing requirements:

```
- Initial page load < 2 seconds
- Task add/edit/delete < 100ms
- Timer update < 50ms
- Greeting update < 100ms
- Quick link operations < 500ms
```

---

## Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### Feature Fallbacks

| Feature | Fallback |
|---------|----------|
| Intl.DateTimeFormat | manual date formatting |
| localStorage | disable persistence (show warning) |
| CSS Grid | flex layout (older browsers) |
| ES6+ features | transpile with Babel (if needed) |

### Progressive Enhancement

- Basic functionality works without JavaScript (links degrade gracefully)
- Enhanced features layer on top of semantic HTML
- Modern CSS features with fallbacks

---

## Security Considerations

1. **XSS Prevention**: Escape all user input before rendering (see `escapeHtml()`)
2. **Local Storage**: No sensitive data storage (passwords, tokens)
3. **CORS**: No external API calls required
4. **Content Security Policy**: Can add strict CSP headers if needed

---

## Accessibility

### WCAG AA Compliance

- **Contrast Ratios**: 4.5:1 for body text, 7:1 for headings
- **Focus Indicators**: Visible 2px outline on all interactive elements
- **Keyboard Navigation**: Tab, Enter, Escape support
- **Semantic HTML**: `<button>`, `<input>`, `<label>` for form controls
- **ARIA Labels**: aria-label for icon-only buttons

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Add task, confirm dialog |
| Escape | Cancel edit mode |
| Tab | Navigate between sections |
| Space | Toggle checkbox |

---

## Conclusion

This design document provides a complete technical specification for implementing the To Do List Life Dashboard as a performant, accessible, single-page application. The modular function architecture allows independent testing and maintenance, while the unified state management ensures consistency across features. The property-based correctness properties enable comprehensive testing across all input ranges, ensuring robust handling of edge cases and data integrity throughout the user's interaction with the dashboard.
