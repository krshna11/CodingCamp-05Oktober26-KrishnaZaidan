/*
 * To Do List Life Dashboard - Application JavaScript
 * Comprehensive implementation with accessibility features (WCAG AA compliance)
 * Tasks 12-42: Complete JavaScript implementation
 */

// ============================================
// APPLICATION STATE (Task 12)
// ============================================

const appState = {
  greeting: "Good Morning",
  timeFormat: "12h", // "12h" or "24h"
  userName: "", // User's name for personalized greetings
  isDarkTheme: false, // Theme preference
  
  timer: {
    state: "stopped", // "stopped", "running", "paused"
    duration: 25, // minutes
    remaining: 1500, // seconds
    configuredDuration: 25, // minutes (for reset)
    intervalId: null // for cleanup
  },
  
  tasks: [],
  quickLinks: []
};

// ============================================
// DOM REFERENCES (Task 12)
// ============================================

const domRefs = {
  app: null,
  greeting: null,
  currentDate: null,
  currentTime: null,
  timerDisplay: null,
  timerStatusSr: null,
  timerStart: null,
  timerPause: null,
  timerReset: null,
  timerDuration: null,
  timerApply: null,
  taskInput: null,
  taskAdd: null,
  taskError: null,
  taskList: null,
  taskEmptyState: null,
  linkName: null,
  linkUrl: null,
  linkAdd: null,
  linkError: null,
  linkList: null,
  linkEmptyState: null,
  themeToggle: null,
  nameSettings: null
};

// ============================================
// LOCAL STORAGE CONFIGURATION (Task 13)
// ============================================

const STORAGE_KEYS = {
  tasks: 'dashboard_tasks',
  quickLinks: 'dashboard_quick_links',
  timerDuration: 'dashboard_pomodoro_duration',
  timeFormat: 'dashboard_time_format',
  userName: 'dashboard_user_name',
  isDarkTheme: 'dashboard_dark_theme'
};

/**
 * Safely reads from Local Storage with error handling (Task 13)
 * @param {string} key - Storage key
 * @returns {*} Parsed value or null
 */
function safeReadStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from storage key "${key}":`, error);
    return null;
  }
}

/**
 * Safely writes to Local Storage with retry logic (Task 13)
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
function safeWriteStorage(key, value) {
  const maxAttempts = 3;
  const retryInterval = 100; // ms
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn(`Storage quota exceeded on attempt ${attempt + 1}`);
        if (attempt < maxAttempts - 1) {
          // Wait before retrying
          const waitTime = retryInterval * (attempt + 1);
          console.log(`Retrying in ${waitTime}ms...`);
        }
      } else {
        console.error(`Error writing to storage key "${key}":`, error);
        return false;
      }
    }
  }
  
  if (!checkStorageQuota()) {
    showError('Unable to save - storage may be full');
  }
  return false;
}

// ============================================
// THEME & USER SETTINGS
// ============================================

/**
 * Toggles between light and dark theme
 */
function toggleTheme() {
  appState.isDarkTheme = !appState.isDarkTheme;
  document.body.classList.toggle('dark-theme', appState.isDarkTheme);
  localStorage.setItem(STORAGE_KEYS.isDarkTheme, JSON.stringify(appState.isDarkTheme));
  
  // Update theme icon
  const icon = domRefs.themeToggle.querySelector('i');
  if (appState.isDarkTheme) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

/**
 * Loads theme preference from Local Storage
 */
function loadThemePreference() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.isDarkTheme);
  if (savedTheme === 'true') {
    appState.isDarkTheme = true;
    document.body.classList.add('dark-theme');
    const icon = domRefs.themeToggle.querySelector('i');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
}

/**
 * Prompts user to set their name for personalized greetings
 */
function setUserName() {
  const currentName = appState.userName || '';
  const newName = prompt('Enter your name for personalized greetings:', currentName);
  
  if (newName !== null && newName.trim() !== '') {
    appState.userName = newName.trim();
    localStorage.setItem(STORAGE_KEYS.userName, appState.userName);
    updateGreetingDisplay();
    showSuccess(`Nice to meet you, ${appState.userName}!`);
  }
}

/**
 * Loads user name from Local Storage
 */
function loadUserName() {
  const savedName = localStorage.getItem(STORAGE_KEYS.userName);
  if (savedName) {
    appState.userName = savedName;
  }
}

// ============================================
// GREETING FUNCTIONS (Tasks 14-15)
// ============================================

/**
 * Gets the greeting message based on the current hour (Task 14)
 * @param {number} hour - Hour in 24-hour format (0-23)
 * @returns {string} Greeting message
 */
function getGreetingByHour(hour) {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 24) return "Good Evening";
  return "Good Night";
}

/**
 * Formats a date object to "dddd, MMMM D, YYYY" format (Task 14)
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Formats a time object in the specified format (Task 14)
 * @param {Date} date - Date object to format
 * @param {string} format - "12h" or "24h" format
 * @returns {string} Formatted time string
 */
function formatTime(date, format) {
  if (format === "24h") {
    return date.toLocaleTimeString('en-US', { hour24: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  return date.toLocaleTimeString('en-US', { hour24: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Updates the greeting, date, and time displays (Task 15)
 * Must complete within 50ms
 */
function updateGreetingDisplay() {
  const now = new Date();
  const hour = now.getHours();
  let newGreeting = getGreetingByHour(hour);
  
  // Add user name if available
  if (appState.userName) {
    newGreeting += `, ${appState.userName}`;
  }
  
  if (domRefs.greeting.textContent !== newGreeting) {
    domRefs.greeting.textContent = newGreeting;
  }
  
  domRefs.currentDate.textContent = formatDate(now);
  domRefs.currentTime.textContent = formatTime(now, appState.timeFormat);
}

/**
 * Initializes greeting section on page load (Task 15)
 * Starts 1000ms update interval
 */
function initGreeting() {
  updateGreetingDisplay();
  setInterval(updateGreetingDisplay, 1000);
}

// ============================================
// POMODORO TIMER FUNCTIONS (Tasks 16-21)
// ============================================

/**
 * Validates timer duration is within 1-60 minutes (Task 16)
 * @param {number} minutes - Candidate duration in minutes
 * @returns {object} { value: validated_minutes } or { error: error_message }
 */
function validateTimerDuration(minutes) {
  const num = parseInt(minutes, 10);
  if (isNaN(num)) {
    return { error: "Duration must be a number" };
  }
  if (num < 1 || num > 60) {
    return { value: Math.max(1, Math.min(60, num)) };
  }
  return { value: num };
}

/**
 * Formats seconds to "MM:SS" display format (Task 16)
 * @param {number} seconds - Total seconds remaining
 * @returns {string} Formatted time string (e.g., "25:00")
 */
function formatTimerDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Updates the screen reader status for the timer
 */
function updateTimerScreenReaderStatus() {
  if (!domRefs.timerStatusSr) return;
  
  const minutes = Math.floor(appState.timer.remaining / 60);
  const seconds = appState.timer.remaining % 60;
  
  let statusText = '';
  if (appState.timer.state === 'running') {
    statusText = `Timer running, ${minutes} minutes ${seconds} seconds remaining`;
  } else if (appState.timer.state === 'paused') {
    statusText = `Timer paused, ${minutes} minutes ${seconds} seconds remaining`;
  } else {
    statusText = `Timer stopped, ${minutes} minutes ${seconds} seconds remaining`;
  }
  
  domRefs.timerStatusSr.textContent = statusText;
}

/**
 * Loads timer configuration from Local Storage (Task 17)
 */
function loadTimerConfiguration() {
  const duration = localStorage.getItem(STORAGE_KEYS.timerDuration);
  if (duration) {
    const validated = validateTimerDuration(duration);
    if (validated.value) {
      appState.timer.duration = validated.value;
      appState.timer.configuredDuration = validated.value;
    }
  }
  appState.timer.remaining = appState.timer.duration * 60;
  domRefs.timerDuration.value = appState.timer.duration;
  domRefs.timerDisplay.textContent = formatTimerDisplay(appState.timer.remaining);
  updateTimerScreenReaderStatus();
}

/**
 * Starts the Pomodoro timer (Task 18)
 */
function startTimer() {
  if (appState.timer.state === 'running') return;
  
  appState.timer.state = 'running';
  domRefs.timerStart.disabled = true;
  domRefs.timerPause.disabled = false;
  domRefs.timerDisplay.classList.add('running');
  updateTimerScreenReaderStatus();
  
  appState.timer.intervalId = setInterval(() => {
    decrementTimer();
  }, 1000);
}

/**
 * Decrements timer by 1 second (Task 18)
 * Called every 1000ms while running
 */
function decrementTimer() {
  appState.timer.remaining--;
  
  if (appState.timer.remaining < 0) {
    appState.timer.remaining = 0;
  }
  
  domRefs.timerDisplay.textContent = formatTimerDisplay(appState.timer.remaining);
  updateTimerScreenReaderStatus();
  
  if (appState.timer.remaining <= 0) {
    timerComplete();
  }
}

/**
 * Pauses the Pomodoro timer (Task 19)
 */
function pauseTimer() {
  if (appState.timer.state !== 'running') return;
  
  appState.timer.state = 'paused';
  clearInterval(appState.timer.intervalId);
  domRefs.timerStart.disabled = false;
  domRefs.timerPause.disabled = true;
  domRefs.timerStart.textContent = 'Resume';
  domRefs.timerDisplay.classList.remove('running');
  updateTimerScreenReaderStatus();
}

/**
 * Resets the Pomodoro timer to configured duration (Task 20)
 */
function resetTimer() {
  clearInterval(appState.timer.intervalId);
  appState.timer.state = 'stopped';
  appState.timer.remaining = appState.timer.configuredDuration * 60;
  
  domRefs.timerStart.disabled = false;
  domRefs.timerStart.textContent = 'Start';
  domRefs.timerPause.disabled = true;
  domRefs.timerDisplay.classList.remove('running');
  domRefs.timerDisplay.textContent = formatTimerDisplay(appState.timer.remaining);
  
  updateTimerScreenReaderStatus();
}

/**
 * Called when timer reaches zero (Task 20)
 */
function timerComplete() {
  clearInterval(appState.timer.intervalId);
  appState.timer.state = 'stopped';
  
  domRefs.timerStart.disabled = false;
  domRefs.timerStart.textContent = 'Start';
  domRefs.timerPause.disabled = true;
  domRefs.timerDisplay.classList.remove('running');
  domRefs.timerDisplay.classList.add('complete');
  
  // Stop blinking after 5 seconds
  setTimeout(() => {
    domRefs.timerDisplay.classList.remove('complete');
  }, 5000);
  
  showSuccess('🎉 Pomodoro session complete! Take a break.');
  updateTimerScreenReaderStatus();
}

/**
 * Sets a new Pomodoro timer duration (Task 21)
 * @param {number} minutes - New duration in minutes (1-60)
 */
function setTimerDuration(minutes) {
  if (appState.timer.state === 'running') {
    showError('Cannot change duration while timer is running');
    return;
  }
  
  const validated = validateTimerDuration(minutes);
  if (validated.error) {
    showError(validated.error);
    return;
  }
  
  appState.timer.duration = validated.value;
  appState.timer.configuredDuration = validated.value;
  appState.timer.remaining = validated.value * 60;
  
  localStorage.setItem(STORAGE_KEYS.timerDuration, String(validated.value));
  
  domRefs.timerDuration.value = validated.value;
  domRefs.timerDisplay.textContent = formatTimerDisplay(appState.timer.remaining);
  resetTimer();
  
  showSuccess(`Timer duration updated to ${validated.value} minutes`);
}

// ============================================
// TASK MANAGEMENT FUNCTIONS (Tasks 22-29)
// ============================================

/**
 * Generates a unique UUID for a new task (Task 22)
 * @returns {string} UUID string
 */
function generateTaskId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Validates task text (Task 22)
 * @param {string} text - Task text to validate
 * @returns {object} { valid: true } or { valid: false, error: "..." }
 */
function validateTaskText(text) {
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

/**
 * Adds a new task (Task 23)
 * @param {string} text - Task description
 */
function addTask(text) {
  const validation = validateTaskText(text);
  if (!validation.valid) {
    showError(validation.error);
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
  domRefs.taskInput.value = '';
  domRefs.taskInput.focus();
  showSuccess('Task added successfully');
}

/**
 * Edits an existing task (Task 24)
 * @param {string} taskId - Task ID to edit
 * @param {string} newText - New task text
 */
function editTask(taskId, newText) {
  const validation = validateTaskText(newText);
  if (!validation.valid) {
    showError(validation.error);
    return;
  }
  
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;
  
  task.text = newText.trim();
  saveTasksToStorage();
  renderTaskList();
  showSuccess('Task updated');
}

/**
 * Deletes a task (Task 24)
 * @param {string} taskId - Task ID to delete
 */
function deleteTask(taskId) {
  appState.tasks = appState.tasks.filter(t => t.id !== taskId);
  saveTasksToStorage();
  renderTaskList();
  showSuccess('Task deleted');
}

/**
 * Toggles task completion state (Task 25)
 * @param {string} taskId - Task ID to toggle
 */
function toggleTaskCompletion(taskId) {
  const task = appState.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasksToStorage();
    renderTaskList();
  }
}

/**
 * Loads tasks from Local Storage on page load (Task 26)
 */
function loadTasksFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.tasks);
    if (data) {
      const tasks = JSON.parse(data);
      if (Array.isArray(tasks)) {
        appState.tasks = tasks.filter(t => t.id && t.text && typeof t.completed === 'boolean');
      }
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    clearCorruptedData(STORAGE_KEYS.tasks);
  }
}

/**
 * Saves tasks to Local Storage (Task 27)
 */
function saveTasksToStorage() {
  if (!safeWriteStorage(STORAGE_KEYS.tasks, appState.tasks)) {
    if (!checkStorageQuota()) {
      showError('Unable to save tasks - storage may be full');
    }
  }
}

/**
 * Renders all tasks in DOM (Task 28)
 */
function renderTaskList() {
  domRefs.taskList.innerHTML = '';
  
  if (appState.tasks.length === 0) {
    domRefs.taskEmptyState.style.display = 'block';
    return;
  }
  
  domRefs.taskEmptyState.style.display = 'none';
  
  appState.tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.role = 'listitem';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.aria_label = `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`;
    checkbox.addEventListener('change', () => {
      toggleTaskCompletion(task.id);
    });
    
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    
    // Screen reader text for completed state
    if (task.completed) {
      const srText = document.createElement('span');
      srText.className = 'sr-only';
      srText.textContent = '(completed)';
      span.appendChild(srText);
    }
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn';
    editBtn.textContent = 'Edit';
    editBtn.aria_label = `Edit task: "${task.text}"`;
    editBtn.addEventListener('click', () => {
      enterTaskEditMode(task.id);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.aria_label = `Delete task: "${task.text}"`;
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete task: "${task.text}"?`)) {
        deleteTask(task.id);
      }
    });
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actionsDiv);
    
    domRefs.taskList.appendChild(li);
  });
}

/**
 * Enters edit mode for a task with keyboard support (Task 29, 40)
 * @param {string} taskId - Task ID to edit
 */
function enterTaskEditMode(taskId) {
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;
  
  const newText = prompt('Edit task:', task.text);
  if (newText !== null && newText !== task.text) {
    editTask(taskId, newText);
  }
}

// ============================================
// QUICK LINKS FUNCTIONS (Tasks 30-35)
// ============================================

/**
 * Validates URL format (Task 30)
 * @param {string} url - URL to validate
 * @returns {object} { valid: true } or { valid: false, error: "..." }
 */
function validateUrl(url) {
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(url)) {
    return { valid: false, error: "Invalid URL format - must start with https:// or http://" };
  }
  return { valid: true };
}

/**
 * Validates quick link name (Task 30)
 * @param {string} name - Link name to validate
 * @returns {object} { valid: true } or { valid: false, error: "..." }
 */
function validateLinkName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Link name cannot be empty" };
  }
  if (name.length > 50) {
    return { valid: false, error: "Link name cannot exceed 50 characters" };
  }
  return { valid: true };
}

/**
 * Adds a new quick link (Task 31)
 * @param {string} name - Link name
 * @param {string} url - Link URL
 */
function addQuickLink(name, url) {
  const nameValidation = validateLinkName(name);
  if (!nameValidation.valid) {
    showError(nameValidation.error);
    return;
  }
  
  const urlValidation = validateUrl(url);
  if (!urlValidation.valid) {
    showError(urlValidation.error);
    return;
  }
  
  if (appState.quickLinks.length >= 20) {
    showError('Maximum 20 links reached');
    return;
  }
  
  const link = {
    id: 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: name.trim(),
    url: url.trim()
  };
  
  appState.quickLinks.push(link);
  saveQuickLinksToStorage();
  renderQuickLinksSection();
  domRefs.linkName.value = '';
  domRefs.linkUrl.value = '';
  domRefs.linkName.focus();
  showSuccess('Link added successfully');
}

/**
 * Edits an existing quick link (Task 32)
 * @param {string} linkId - Link ID to edit
 * @param {string} newName - New link name
 * @param {string} newUrl - New link URL
 */
function editQuickLink(linkId, newName, newUrl) {
  const nameValidation = validateLinkName(newName);
  if (!nameValidation.valid) {
    showError(nameValidation.error);
    return;
  }
  
  const urlValidation = validateUrl(newUrl);
  if (!urlValidation.valid) {
    showError(urlValidation.error);
    return;
  }
  
  const link = appState.quickLinks.find(l => l.id === linkId);
  if (!link) return;
  
  link.name = newName.trim();
  link.url = newUrl.trim();
  saveQuickLinksToStorage();
  renderQuickLinksSection();
  showSuccess('Link updated');
}

/**
 * Deletes a quick link (Task 31)
 * @param {string} linkId - Link ID to delete
 */
function deleteQuickLink(linkId) {
  appState.quickLinks = appState.quickLinks.filter(l => l.id !== linkId);
  saveQuickLinksToStorage();
  renderQuickLinksSection();
  showSuccess('Link deleted');
}

/**
 * Opens a quick link in a new tab (Task 34)
 * @param {string} url - URL to open
 */
function openQuickLink(url) {
  window.open(url, '_blank');
}

/**
 * Loads quick links from Local Storage on page load (Task 33)
 */
function loadQuickLinksFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.quickLinks);
    if (data) {
      const links = JSON.parse(data);
      if (Array.isArray(links)) {
        appState.quickLinks = links.filter(l => l.id && l.name && l.url);
      }
    }
  } catch (error) {
    console.error('Error loading quick links:', error);
    clearCorruptedData(STORAGE_KEYS.quickLinks);
  }
}

/**
 * Saves quick links to Local Storage (Task 33)
 */
function saveQuickLinksToStorage() {
  if (!safeWriteStorage(STORAGE_KEYS.quickLinks, appState.quickLinks)) {
    if (!checkStorageQuota()) {
      showError('Cannot save link - storage is full');
    }
  }
}

/**
 * Renders all quick links in DOM (Task 34)
 */
function renderQuickLinksSection() {
  domRefs.linkList.innerHTML = '';
  
  if (appState.quickLinks.length === 0) {
    domRefs.linkEmptyState.style.display = 'block';
    return;
  }
  
  domRefs.linkEmptyState.style.display = 'none';
  
  appState.quickLinks.forEach(link => {
    const item = document.createElement('div');
    item.className = 'link-item';
    item.role = 'listitem';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'link-item-content';
    
    const nameP = document.createElement('p');
    nameP.className = 'link-item-name';
    nameP.textContent = link.name;
    
    const urlP = document.createElement('p');
    urlP.className = 'link-item-url';
    urlP.textContent = link.url;
    
    contentDiv.appendChild(nameP);
    contentDiv.appendChild(urlP);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'link-actions';
    
    const openBtn = document.createElement('button');
    openBtn.className = 'task-btn';
    openBtn.textContent = 'Open';
    openBtn.aria_label = `Open ${link.name} in new tab`;
    openBtn.addEventListener('click', () => {
      openQuickLink(link.url);
    });
    
    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn';
    editBtn.textContent = 'Edit';
    editBtn.aria_label = `Edit quick link: ${link.name}`;
    editBtn.addEventListener('click', () => {
      enterLinkEditMode(link.id);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.aria_label = `Delete quick link: ${link.name}`;
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete link: "${link.name}"?`)) {
        deleteQuickLink(link.id);
      }
    });
    
    actionsDiv.appendChild(openBtn);
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    item.appendChild(contentDiv);
    item.appendChild(actionsDiv);
    
    domRefs.linkList.appendChild(item);
  });
}

/**
 * Enters edit mode for a link (Task 35, 40)
 * @param {string} linkId - Link ID to edit
 */
function enterLinkEditMode(linkId) {
  const link = appState.quickLinks.find(l => l.id === linkId);
  if (!link) return;
  
  const newName = prompt('Edit link name:', link.name);
  if (newName !== null) {
    const newUrl = prompt('Edit link URL:', link.url);
    if (newUrl !== null && (newName !== link.name || newUrl !== link.url)) {
      editQuickLink(linkId, newName, newUrl);
    }
  }
}

// ============================================
// ERROR & SUCCESS MESSAGES (Task 36)
// ============================================

/**
 * Displays an error message for specified duration (Task 36)
 * @param {string} message - Error message to display
 * @param {number} duration - Display duration in milliseconds (default: 3000)
 */
function showError(message, duration = 3000) {
  console.error(message);
  
  // Show in task section if applicable
  if (domRefs.taskError) {
    domRefs.taskError.textContent = message;
    domRefs.taskError.classList.add('show');
    
    setTimeout(() => {
      domRefs.taskError.classList.remove('show');
    }, duration);
  }
  
  // Also show in link section if applicable
  if (message.includes('link') || message.includes('Link')) {
    if (domRefs.linkError) {
      domRefs.linkError.textContent = message;
      domRefs.linkError.classList.add('show');
      
      setTimeout(() => {
        domRefs.linkError.classList.remove('show');
      }, duration);
    }
  }
}

/**
 * Displays a success message for specified duration (Task 36)
 * @param {string} message - Success message to display
 * @param {number} duration - Display duration in milliseconds (default: 2000)
 */
function showSuccess(message, duration = 2000) {
  console.log(message);
  // Can be extended to show toast notifications
}

// ============================================
// LOCAL STORAGE ERROR HANDLING (Task 37)
// ============================================

/**
 * Checks Local Storage quota availability (Task 37)
 * @returns {boolean} True if storage is available
 */
function checkStorageQuota() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Clears corrupted data from Local Storage (Task 37)
 * @param {string} key - Storage key to clear
 */
function clearCorruptedData(key) {
  try {
    localStorage.removeItem(key);
    console.error(`Cleared corrupted data from key: ${key}`);
  } catch (error) {
    console.error(`Error clearing corrupted data: ${error}`);
  }
}

// ============================================
// INPUT VALIDATION PIPELINE (Task 38)
// ============================================

/**
 * Centralizes input validation routing (Task 38)
 * @param {string} type - Type of input to validate
 * @param {*} data - Data to validate
 * @returns {object} Validation result
 */
function validateAndProcessInput(type, data) {
  switch(type) {
    case 'task':
      return validateTaskText(data);
    case 'link_name':
      return validateLinkName(data);
    case 'link_url':
      return validateUrl(data);
    case 'timer_duration':
      return validateTimerDuration(data);
    default:
      return { error: 'Unknown validation type' };
  }
}

// ============================================
// EVENT LISTENERS SETUP (Task 39)
// ============================================

/**
 * Sets up all event listeners for dashboard functionality (Task 39)
 */
function setupEventHandlers() {
  // Theme and name settings (New features)
  domRefs.themeToggle.addEventListener('click', toggleTheme);
  domRefs.nameSettings.addEventListener('click', setUserName);
  
  // Timer event handlers (Task 39)
  domRefs.timerStart.addEventListener('click', startTimer);
  domRefs.timerPause.addEventListener('click', pauseTimer);
  domRefs.timerReset.addEventListener('click', resetTimer);
  domRefs.timerApply.addEventListener('click', () => {
    const duration = parseInt(domRefs.timerDuration.value, 10);
    setTimerDuration(duration);
  });
  
  // Task event handlers (Task 39)
  domRefs.taskAdd.addEventListener('click', () => {
    addTask(domRefs.taskInput.value);
  });
  
  // Enter key support for tasks (Task 40)
  domRefs.taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask(domRefs.taskInput.value);
    }
  });
  
  // Link event handlers (Task 39)
  domRefs.linkAdd.addEventListener('click', () => {
    addQuickLink(domRefs.linkName.value, domRefs.linkUrl.value);
  });
  
  // Enter key support for links (Task 40)
  domRefs.linkUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addQuickLink(domRefs.linkName.value, domRefs.linkUrl.value);
    }
  });
  
  // Tab navigation support (Task 40)
  // Native browser behavior handles tab navigation
}

// ============================================
// UTILITY FUNCTIONS (Task 41)
// ============================================

/**
 * Escapes HTML characters to prevent XSS (Task 41)
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// PAGE LOAD & INITIALIZATION (Task 42)
// ============================================

/**
 * Initializes the entire application on page load (Task 42)
 */
function init() {
  // Initialize DOM references
  domRefs.app = document.getElementById('app');
  domRefs.greeting = document.getElementById('greeting');
  domRefs.currentDate = document.getElementById('current-date');
  domRefs.currentTime = document.getElementById('current-time');
  domRefs.timerDisplay = document.getElementById('timer-display');
  domRefs.timerStatusSr = document.getElementById('timer-status-sr');
  domRefs.timerStart = document.getElementById('timer-start');
  domRefs.timerPause = document.getElementById('timer-pause');
  domRefs.timerReset = document.getElementById('timer-reset');
  domRefs.timerDuration = document.getElementById('timer-duration');
  domRefs.timerApply = document.getElementById('timer-apply');
  domRefs.taskInput = document.getElementById('task-input');
  domRefs.taskAdd = document.getElementById('task-add');
  domRefs.taskError = document.getElementById('task-error');
  domRefs.taskList = document.getElementById('task-list');
  domRefs.taskEmptyState = document.getElementById('task-empty-state');
  domRefs.linkName = document.getElementById('link-name');
  domRefs.linkUrl = document.getElementById('link-url');
  domRefs.linkAdd = document.getElementById('link-add');
  domRefs.linkError = document.getElementById('link-error');
  domRefs.linkList = document.getElementById('link-list');
  domRefs.linkEmptyState = document.getElementById('link-empty-state');
  domRefs.themeToggle = document.getElementById('theme-toggle');
  domRefs.nameSettings = document.getElementById('name-settings');
  
  // Load preferences from Local Storage (Task 42)
  loadThemePreference();
  loadUserName();
  loadTasksFromStorage();
  loadQuickLinksFromStorage();
  loadTimerConfiguration();
  
  // Render all sections (Task 42)
  renderTaskList();
  renderQuickLinksSection();
  
  // Initialize greeting and timer (Task 42)
  initGreeting();
  
  // Set up event listeners (Task 42)
  setupEventHandlers();
}

// Wait for DOM to be ready (Task 42)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
