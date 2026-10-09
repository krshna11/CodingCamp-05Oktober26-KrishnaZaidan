# Implementation Plan: To Do List Life Dashboard

## Overview

This plan provides a complete implementation roadmap for building the To Do List Life Dashboard as a single-page web application. The dashboard combines time/date display, a Pomodoro timer, task management, and quick links into a unified, responsive interface. All data persists in the browser's Local Storage with zero server-side dependencies. Tasks are organized into logical phases that build incrementally from project setup through complete feature implementation.

## Tasks

- [x] 1. Project Setup & Scaffolding
  - Initialize project directory structure with index.html, css/style.css, js/app.js
  - Create empty CSS and JavaScript files with structural comments
  - Set up .git repository and initial commit
  - _Requirements: 16.3_

- [x] 2. HTML Structure - Core Markup
  - Create semantic HTML structure with main app container
  - Implement greeting section with placeholders for date, time, greeting message
  - Add Pomodoro timer section with display, buttons, duration input
  - Create task list section with input field, add button, task list container
  - Create quick links section with input fields and link container
  - _Requirements: 16.1, 16.4, 16.5_

- [x] 3. HTML Accessibility & ARIA Labels
  - Add ARIA labels to all buttons (Start, Pause, Reset, Add, Edit, Delete)
  - Add aria-label attributes to form inputs
  - Ensure semantic HTML (button, input, label elements)
  - Add screen-reader-only text for status indicators
  - _Requirements: 20.1, 20.2_

- [x] 4. CSS - Reset & Base Styles
  - Implement CSS reset (margin, padding, box-sizing)
  - Set up responsive typography (font sizes, line-height, letter-spacing)
  - Define color palette (primary, secondary, error, success colors)
  - Ensure minimum text sizes (14-16px body, 32px+ heading, 48px+ timer display)
  - _Requirements: 20.8, 16.2_

- [x] 5. CSS - Layout Grid System
  - Implement CSS Grid for dashboard layout (2-column on desktop, 1-column on mobile)
  - Ensure full-screen view fits within 1024x600px without horizontal scrolling
  - Add responsive breakpoints for mobile devices
  - Ensure greeting section spans full width
  - _Requirements: 16.1, 17.1_

- [x] 6. CSS - Greeting Section Styling
  - Style greeting display with gradient background and white text
  - Format date display with proper font size (20px)
  - Format greeting message (28px+ font, 600+ font-weight)
  - Format time display with monospace font (48px+ size)
  - _Requirements: 20.2, 20.3, 1.1_

- [x] 7. CSS - Pomodoro Timer Styling
  - Style timer display with monospace font (48px+ minimum)
  - Style control buttons (Start, Pause, Reset) with distinct states (active, disabled)
  - Style duration input and apply button
  - Implement button disabled state styling (opacity, cursor)
  - _Requirements: 3.1, 4.3, 5.4, 6.3_

- [x] 8. CSS - Task List Styling
  - Style task input field with proper padding and border
  - Style task list items with line-height 1.5+ and padding 12px+
  - Implement completed task styling (strikethrough, opacity 0.6)
  - Style action buttons (Edit, Delete) for each task
  - Add error message display with red text and background
  - _Requirements: 9.2, 20.4, 20.5_

- [x] 9. CSS - Quick Links Styling
  - Style quick link buttons with primary color and padding 12px+
  - Implement link button hover states (color change, 100-200ms transition)
  - Add spacing between link buttons
  - Style edit/delete buttons for links
  - Add error message display
  - _Requirements: 12.4, 19.1, 19.3_

- [x] 10. CSS - Interactive States & Contrast
  - Implement hover effects on all clickable elements (100-200ms transition)
  - Add focus indicators (2px outline, contrasting color)
  - Ensure WCAG AA color contrast (4.5:1 normal, 3:1 large text, 7:1 headings)
  - Test contrast ratios in final design
  - _Requirements: 19.1, 19.2, 19.6, 19.7, 20.6, 20.7_

- [x] 11. CSS - Animations & Visual Feedback
  - Add button click feedback (scale transform, 100-200ms)
  - Implement smooth transitions for color changes
  - Add loading/processing spinner styles
  - Ensure animations don't exceed 200ms for perceived responsiveness
  - _Requirements: 19.8, 4.5, 5.5_

- [x] 12. JavaScript - Initialize Application State
  - Create appState object with greeting, timer, tasks, quickLinks properties
  - Set default values (greeting: "Good Morning", timeFormat: "12h", timer.duration: 25)
  - Create DOM references object for all interactive elements
  - Set up initialization function to run on page load
  - _Requirements: 16.5, 16.6_

- [x] 13. JavaScript - Local Storage Configuration
  - Define Local Storage key constants (dashboard_tasks, dashboard_quick_links, dashboard_pomodoro_duration, dashboard_time_format)
  - Create helper function to safely read from Local Storage with error handling
  - Create helper function to safely write to Local Storage with retry logic (3 attempts, 100ms intervals)
  - _Requirements: 11.1, 15.1_

- [x] 14. JavaScript - Greeting Functions: Time Formatting
  - Implement getGreetingByHour(hour) function (5-11=Morning, 12-16=Afternoon, 17-23=Evening, 0-4=Night)
  - Implement formatDate(date) function returning "dddd, MMMM D, YYYY" format using Intl.DateTimeFormat
  - Implement formatTime(date, format) function supporting both "12h" and "24h" formats
  - Test with various dates and times across all greeting boundaries
  - **Property 1: Date Formatting Correctness**
  - **Property 2: Time Format Selection**
  - **Validates: Requirements 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

- [x] 15. JavaScript - Greeting Functions: Update & Display
  - Implement updateGreetingDisplay() function (update within 50ms)
  - Update greeting message when hour crosses threshold
  - Update time display every 1000ms
  - Update date display (daily)
  - Implement initGreeting() to start 1000ms update interval
  - **Property 3: Update Timing Efficiency**
  - **Property 4: Greeting Correctness by Time Range**
  - **Validates: Requirements 1.3, 1.4, 2.5, 2.6_

- [x] 16. JavaScript - Timer Functions: Duration Validation
  - Implement validateTimerDuration(minutes) function (clamp to 1-60 range)
  - Implement formatTimerDisplay(seconds) function (MM:SS format)
  - Create timer display formatter with zero-padding
  - Test clamping with edge cases (0, 1, 60, 61, negative)
  - **Property 5: Timer Duration Clamping**
  - **Validates: Requirements 3.3, 3.4, 3.6_

- [x] 17. JavaScript - Timer Functions: Load Configuration
  - Implement loadTimerConfiguration() function
  - Read dashboard_pomodoro_duration from Local Storage (default 25)
  - Validate and clamp duration to 1-60 range
  - Initialize timer.remaining and timer.configuredDuration
  - Update DOM display and button states
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 18. JavaScript - Timer State Machine: Start & Resume
  - Implement startTimer() function
  - Transition from stopped or paused state to running state
  - Start 1000ms interval with decrementTimer() callback
  - Update button states (Start disabled, Pause enabled)
  - Update DOM display within 100ms
  - **Property 6: Timer Countdown Accuracy**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.5, 4.6_

- [x] 19. JavaScript - Timer State Machine: Pause & Resume
  - Implement pauseTimer() function
  - Clear interval and transition to paused state
  - Preserve remaining time exactly (no change to timer.remaining)
  - Update button states (Pause disabled, Start enabled as "Resume")
  - Update DOM display within 50ms
  - **Property 7: Timer Pause Preservation**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 20. JavaScript - Timer State Machine: Reset & Completion
  - Implement resetTimer() function (all states)
  - Restore remaining time to configured duration
  - Transition to stopped state
  - Update button states to initial configuration
  - Update DOM display within 50ms
  - Implement timerComplete() with notification
  - **Property 8: Timer Reset Idempotence**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 21. JavaScript - Timer Duration Configuration
  - Implement setTimerDuration(minutes) function
  - Validate new duration (1-60 range)
  - Persist to Local Storage with key "dashboard_pomodoro_duration"
  - Update timer.duration and timer.configuredDuration
  - Reset timer display to new configured duration
  - Show error if validation fails
  - _Requirements: 3.3, 3.4, 3.6_

- [x] 22. JavaScript - Task Functions: Validation & ID Generation
  - Implement generateTaskId() function (UUID v4 or pseudo-UUID)
  - Implement validateTaskText(text) function (1-255 chars, non-whitespace)
  - Ensure unique IDs with no collisions in session
  - Return validation object with valid boolean and error message
  - **Property 9: Task Creation with Unique Identifiers**
  - **Validates: Requirements 7.2, 7.5_

- [x] 23. JavaScript - Task Functions: Add Task
  - Implement addTask() function
  - Validate task text (1-255 chars, non-empty)
  - Create task object with id, text, completed: false
  - Add to appState.tasks array
  - Call saveTasksToStorage() for persistence
  - Clear input field and re-render
  - Show error message if validation fails
  - **Property 10: Task Addition Persistence Round-Trip**
  - **Validates: Requirements 7.1, 7.3, 7.4, 7.6_

- [x] 24. JavaScript - Task Functions: Edit & Delete Tasks
  - Implement editTask(taskId, newText) function
  - Implement deleteTask(taskId) function
  - Preserve task ID and completion state during edit
  - Remove task from appState and DOM
  - Call saveTasksToStorage() after each operation
  - Update DOM display within 100-300ms
  - **Property 11: Task Edit Preservation**
  - **Property 13: Task Deletion Consistency**
  - **Validates: Requirements 8.2, 8.4, 8.5, 10.1, 10.2, 10.4_

- [x] 25. JavaScript - Task Functions: Toggle Completion
  - Implement toggleTaskCompletion(taskId) function
  - Toggle task.completed boolean
  - Update task.completed state in appState
  - Call saveTasksToStorage() for persistence
  - Update DOM with strikethrough and opacity styling
  - **Property 12: Task Completion Toggle Idempotence**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.5_

- [x] 26. JavaScript - Task Persistence: Load from Storage
  - Implement loadTasksFromStorage() function
  - Read "dashboard_tasks" from Local Storage
  - Parse JSON array
  - Validate each task (id, text, completed fields and types)
  - Skip invalid tasks
  - Handle corrupted data (catch parse error, clear key, log error)
  - Initialize empty array if no data or corruption
  - **Property 15: Task Data Format Validation**
  - **Property 24: Local Storage Recovery from Corruption**
  - **Validates: Requirements 11.2, 11.3, 11.5, 11.8_

- [x] 27. JavaScript - Task Persistence: Save to Storage
  - Implement saveTasksToStorage() function
  - Serialize appState.tasks to JSON
  - Implement retry logic (3 attempts, 100ms intervals)
  - Handle Local Storage quota exceeded error
  - Show error message if all retries fail
  - Return success/failure boolean
  - _Requirements: 11.1, 11.6, 11.9_

- [x] 28. JavaScript - Task UI: Render Task List
  - Implement renderTaskList() function
  - Clear task list container
  - For each task, create DOM element with text, checkbox, edit button, delete button
  - Apply completed styling (strikethrough, opacity 0.6) for completed tasks
  - Attach event listeners to checkbox, edit, and delete buttons
  - Show empty state message if no tasks
  - **Property 14: Tasks Persistence Order**
  - **Validates: Requirements 9.4, 19.4_

- [x] 29. JavaScript - Task UI: Edit Mode
  - Implement enterEditMode(taskId) function
  - Replace task text display with editable input field
  - Pre-fill input with current task text and select all
  - Show Save and Cancel buttons
  - Attach keyboard listeners (Enter to save, Escape to cancel)
  - Implement exitEditMode(taskId, save) function
  - Call editTask() if save=true, revert display if save=false
  - _Requirements: 8.1, 8.3, 8.4_

- [x] 30. JavaScript - Quick Links Functions: Validation
  - Implement validateUrl(url) function (pattern: https?://.*)
  - Implement validateLinkName(name) function (1-50 chars, non-empty)
  - Return validation object with valid boolean and error message
  - Test with various URL formats (http, https, invalid)
  - **Property 16: Quick Link URL Validation**
  - **Property 17: Quick Link Name Length Validation**
  - **Validates: Requirements 12.2, 13.1, 13.2_

- [x] 31. JavaScript - Quick Links Functions: Add & Delete
  - Implement addQuickLink(name, url) function
  - Validate name and URL
  - Check link count < 20 (enforce maximum)
  - Create link object with id, name, url
  - Add to appState.quickLinks
  - Call saveQuickLinksToStorage()
  - Clear input fields and re-render
  - Implement deleteQuickLink(linkId) function
  - **Property 18: Quick Link Creation Persistence**
  - **Property 20: Quick Link Deletion Consistency**
  - **Property 21: Quick Link Count Limit**
  - **Validates: Requirements 12.1, 12.4, 12.6, 14.1, 14.2, 12.9_

- [x] 32. JavaScript - Quick Links Functions: Edit Links
  - Implement editQuickLink(linkId, newName, newUrl) function
  - Validate new name and URL
  - Update link properties while preserving ID
  - Call saveQuickLinksToStorage()
  - Update DOM display within 500ms
  - Exit edit mode
  - **Property 19: Quick Link Edit Update**
  - **Validates: Requirements 13.3, 13.4, 13.5, 13.6, 13.7_

- [x] 33. JavaScript - Quick Links Persistence: Load & Save
  - Implement loadQuickLinksFromStorage() function
  - Read "dashboard_quick_links" from Local Storage
  - Parse JSON array and validate each link (id, name, url fields and types)
  - Skip invalid links and handle corruption (same as tasks)
  - Implement saveQuickLinksToStorage() function with retry logic
  - Handle quota exceeded and show appropriate error message
  - **Property 23: URL Format Consistency**
  - **Property 24: Local Storage Recovery from Corruption**
  - **Validates: Requirements 15.1, 15.2, 15.5, 15.6, 15.7, 15.8_

- [x] 34. JavaScript - Quick Links UI: Render & Open Links
  - Implement renderQuickLinksSection() function
  - Create clickable link buttons with link.name text
  - Attach click handlers to open URL in new tab (window.open with _blank)
  - Add edit and delete buttons for each link
  - Show empty state if no links
  - Implement handleEditLink() to prompt for new name/URL
  - _Requirements: 12.4, 12.5, 14.3_

- [x] 35. JavaScript - Quick Links UI: Edit Mode
  - Implement enterLinkEditMode(linkId) for prompts
  - Implement exitLinkEditMode(linkId, save) for save/cancel
  - Use window.prompt() for edit interface (name and URL)
  - Validate inputs before saving
  - Show error messages if validation fails
  - Revert to normal display if cancelled
  - _Requirements: 13.1, 13.4, 13.6_

- [x] 36. JavaScript - Error & Success Messages
  - Implement showError(message, duration=3000) function
  - Create error element with red text and background
  - Auto-hide after duration or allow manual dismiss
  - Implement showSuccess(message, duration=2000) function
  - Show for all validation failures and storage errors
  - _Requirements: 7.5, 7.7, 8.7, 10.5, 12.3, 12.8, 13.3, 14.4, 15.6_

- [x] 37. JavaScript - Local Storage Error Handling
  - Implement checkStorageQuota() function
  - Implement clearCorruptedData(key) function
  - Add quota exceeded detection and user notification
  - Log errors to console for debugging
  - Show "Unable to save tasks - storage may be full" message
  - _Requirements: 11.6, 11.9, 15.6_

- [x] 38. JavaScript - Input Validation Pipeline
  - Implement validateAndProcessInput(type, data) function
  - Route task, link_name, link_url, timer_duration inputs
  - Centralize validation logic for consistency
  - Return standardized validation response objects
  - _Requirements: 7.5, 12.3, 13.3_

- [x] 39. JavaScript - Event Listeners Setup
  - Attach click listeners to task add button and quick link add button
  - Attach keypress (Enter) listeners to task and link inputs
  - Attach click listeners to all timer control buttons
  - Attach click listeners to timer apply button
  - Attach change listeners to task checkboxes
  - Attach click listeners to all edit and delete buttons
  - _Requirements: 4.1, 7.1, 12.1, 13.1_

- [x] 40. JavaScript - Keyboard Shortcuts & Navigation
  - Implement Enter key handling for task input (add task)
  - Implement Enter key handling for link inputs (add link)
  - Implement Enter key in edit mode (save)
  - Implement Escape key in edit mode (cancel)
  - Ensure Tab navigation works through all interactive elements
  - _Requirements: 16.5, 16.6_

- [x] 41. JavaScript - Utility Functions
  - Implement escapeHtml(text) function (XSS prevention)
  - Implement UUID generation or use reliable pseudo-UUID approach
  - Create helper for DOM element creation
  - Create helper for event delegation (optional)
  - _Requirements: 16.3_

- [x] 42. JavaScript - Page Load & Initialization
  - Set up DOMContentLoaded or readyState check
  - Call init() function on page load
  - Load tasks, quick links, timer config from Local Storage
  - Render all sections
  - Start greeting update interval
  - Ensure page is interactive within 2 seconds
  - _Requirements: 17.1, 17.2_

- [x] 43. Testing - Property Tests: Date & Time
  - Test Property 1: Date formatting round-trip correctness
  - Test Property 2: Time format patterns (12h contains AM/PM, 24h uses 0-23)
  - Test Property 3: Update timing within 50ms
  - Test Property 4: Greeting correctness for all hour ranges
  - Test with boundary values (4:59 AM, 5:00 AM, 11:59 AM, 12:00 PM, etc.)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 44. Testing - Property Tests: Timer Operations
  - Test Property 5: Timer duration clamping (boundary values 0, 1, 60, 61)
  - Test Property 6: Countdown accuracy (N iterations = N seconds decrement)
  - Test Property 7: Pause preservation (remaining time exact after pause/resume)
  - Test Property 8: Reset idempotence (always returns to configured duration)
  - Test timer state transitions and button state updates
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2_

- [x] 45. Testing - Property Tests: Task Persistence
  - Test Property 9: Task ID uniqueness (no collisions)
  - Test Property 10: Task round-trip (add → save → load → verify)
  - Test Property 11: Task edit preserves ID and completion state
  - Test Property 12: Toggle completion twice returns to original state
  - Test Property 13: Deleted tasks not found after persistence
  - Test Property 14: Task creation order preserved (FIFO)
  - Test Property 15: Invalid task objects skipped during load
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.2, 8.5, 9.1, 10.1, 11.2, 11.4, 11.8_

- [x] 46. Testing - Property Tests: Quick Links
  - Test Property 16: URL validation (https?://.* pattern)
  - Test Property 17: Link name validation (1-50 characters)
  - Test Property 18: Quick link round-trip (add → save → load)
  - Test Property 19: Link edit preserves ID
  - Test Property 20: Deleted links not found after persistence
  - Test Property 21: Link count limit enforced (max 20)
  - _Requirements: 12.2, 12.6, 12.9, 13.3, 13.4, 14.1, 14.2, 15.1, 15.2_

- [x] 47. Testing - Property Tests: Storage Handling
  - Test Property 22: Empty task rejection (whitespace-only strings)
  - Test Property 23: URL format preservation through storage
  - Test Property 24: Corruption recovery (invalid JSON handled gracefully)
  - Test error scenarios: corrupted data, quota exceeded, missing keys
  - Test retry logic: 3 attempts with 100ms intervals
  - _Requirements: 7.5, 11.5, 11.9, 15.5, 15.7_

- [x] 48. Testing - Integration Tests
  - Test full task lifecycle: add → edit → complete → delete
  - Test full quick link lifecycle: add → edit → delete
  - Test timer state transitions: stopped → running → paused → stopped
  - Test simultaneous operations (timer running while adding task)
  - Test data persistence across page reloads
  - Test error recovery (quota exceeded, corruption)
  - _Requirements: 11.1, 15.1, 17.2, 17.3, 17.4, 17.5_

- [x] 49. Testing - Performance Tests
  - Test page load time < 2 seconds (4G LTE simulation)
  - Test task add/edit/delete completes < 100ms
  - Test timer update < 50ms
  - Test greeting update < 100ms
  - Test quick link operations < 500ms
  - Test no main thread blocking > 50ms per frame (60fps)
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8_

- [x] 50. Testing - Browser Compatibility
  - Test in Chrome 90+: all features functional, no console errors
  - Test in Firefox 88+: all features functional, no console errors
  - Test in Edge 90+: all features functional, no console errors
  - Test in Safari 14+: all features functional, no console errors
  - Test responsive design on mobile browsers (1024x600px minimum)
  - Test Local Storage availability detection
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.7_

- [x] 51. Testing - Accessibility & Keyboard Navigation
  - Test Tab navigation through all interactive elements
  - Test keyboard shortcuts (Enter to confirm, Escape to cancel)
  - Test focus indicators visible on all focusable elements
  - Test screen reader compatibility with ARIA labels
  - Verify semantic HTML structure
  - Test with keyboard only (no mouse)
  - _Requirements: 19.1, 19.2, 19.3_

- [x] 52. Testing - Visual & Contrast Compliance
  - Verify WCAG AA contrast ratios (4.5:1 normal, 3:1 large, 7:1 headings)
  - Test color contrast with contrast checker tool
  - Verify all text readable at specified font sizes
  - Test hover/focus/active states clearly visible
  - Test error messages clearly visible in red
  - _Requirements: 20.6, 20.7_

- [x] 53. Code Organization & Cleanup
  - Organize JavaScript into logical sections (greeting, timer, tasks, links)
  - Add inline comments for complex logic
  - Remove debug logging and console.logs
  - Ensure consistent naming conventions throughout
  - Verify single HTML, single CSS, single JS file constraint
  - _Requirements: 16.3_

- [x] 54. Code Review & Documentation
  - Review code for adherence to design document specifications
  - Verify all requirements mapped to implementation
  - Add JSDoc comments for all functions
  - Document function parameters and return values
  - Create inline comments for non-obvious logic
  - _Requirements: 16.3_

- [x] 55. Checkpoint - Core Features Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify page loads within 2 seconds
  - Verify all CRUD operations work correctly
  - Verify data persists across page reloads
  - Confirm responsive design works on all target devices

- [x] 56. Final Verification & Polish
  - Run final performance profiling
  - Verify 60fps animation smoothness
  - Test across all supported browsers one final time
  - Check responsive design on multiple device sizes
  - Verify all accessibility requirements met
  - _Requirements: 17.1, 17.8, 18.1, 18.2, 18.3, 18.4_

- [x] 57. Deployment Preparation
  - Create README.md with setup instructions
  - Document keyboard shortcuts and features
  - Create user guide if needed
  - Prepare deployment checklist
  - Verify all files minified and optimized (if applicable)
  - _Requirements: 16.1, 16.4_

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP delivery, but recommended for quality assurance
- Each task includes specific requirement references for traceability
- Property-based tests (Properties 1-24) validate universal correctness across all input ranges
- Unit tests validate specific examples and edge cases
- Integration tests validate cross-component interactions
- Performance tests ensure all timing requirements are met
- Accessibility tests ensure WCAG AA compliance
- Browser compatibility tests ensure modern browser support
- Checkpoint tasks break implementation into manageable phases with validation points
- All Local Storage operations implement retry logic for reliability
- Error handling ensures graceful degradation in all scenarios
- CSS maintains single-file constraint with organized sections
- JavaScript maintains single-file constraint with modular functions

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1", "4.1"] },
    { "id": 1, "tasks": ["5.1", "6.1", "7.1", "8.1", "9.1", "10.1", "11.1"] },
    { "id": 2, "tasks": ["12.1", "13.1", "14.1", "15.1", "16.1", "17.1"] },
    { "id": 3, "tasks": ["18.1", "19.1", "20.1", "21.1", "22.1", "23.1"] },
    { "id": 4, "tasks": ["24.1", "25.1", "26.1", "27.1", "28.1", "29.1"] },
    { "id": 5, "tasks": ["30.1", "31.1", "32.1", "33.1", "34.1", "35.1"] },
    { "id": 6, "tasks": ["36.1", "37.1", "38.1", "39.1", "40.1", "41.1", "42.1"] },
    { "id": 7, "tasks": ["43.1", "44.1", "45.1", "46.1", "47.1", "48.1", "49.1", "50.1", "51.1", "52.1"] },
    { "id": 8, "tasks": ["53.1", "54.1"] },
    { "id": 9, "tasks": ["56.1", "57.1"] }
  ]
}
```
