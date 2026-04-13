# 📋 Task Manager

A comprehensive, mobile-first task management system with JSON storage, archive system, multiple views, recurring tasks, hierarchical task structure, and a fun kids view with gamification.

## 🚀 Quick Start

### Option 1: Node.js Server (Recommended)

**Windows - Super Easy:**
Just double-click `start-server.bat` in the tasks folder!
- First time: Automatically installs dependencies
- Opens server on http://localhost:3000
- To stop: Double-click `stop-server.bat` OR press Ctrl+C in the terminal

**Manual Start:**
```bash
cd tasks/api
npm install
npm start
```
Then open `http://localhost:3000/tasks/`

### Option 2: PHP Server
Place the tasks folder on a PHP server and access `index.html`

### Option 3: Local Development
Use a local server like Python's SimpleHTTPServer:
```bash
cd tasks
python -m http.server 8000
```
Then open `http://localhost:8000`

## � Access

**Default Password:** `smazl2024`

You can change this through Settings (gear icon) or browser console:
```javascript
taskManager.password = 'your-new-password';
taskManager.saveData();
```

## ✨ Features

### Core Features
- ✅ **Task CRUD**: Create, read, update, and delete tasks
- 👥 **Multi-user**: Assign tasks to different family members
- 🏷️ **Priorities**: Low, Medium, High, Urgent
- 📊 **Status Tracking**: To Do, In Progress, Blocked, Completed
- 📅 **Due Dates & Times**: Set specific deadlines and reminders
- 🔄 **Recurring Tasks**: Daily, weekly, or monthly recurring tasks
- 🌳 **Hierarchical Structure**: Create subtasks with circular dependency prevention
- 🏷️ **Tags**: Organize tasks with custom tags
- 📝 **Notes**: Add detailed descriptions to tasks
- 📦 **Archive System**: Auto-archive completed tasks with restore capability
- ⚠️ **Overdue Highlighting**: Visual indicators for overdue tasks
- 💾 **JSON Storage**: Persistent data storage with backup/restore
- ⚙️ **Settings**: Customize users, password, and auto-archive behavior
- 📤 **Export/Import**: Backup and restore data as JSON files

### Archive System
- **Auto-Archive**: Completed tasks are automatically archived after a configurable number of days (default: 30 days)
- **Archive View**: View all archived tasks in a dedicated view
- **Restore**: Easily restore archived tasks back to active status
- **Permanent Delete**: Option to permanently delete archived tasks
- **Configurable**: Set auto-archive days to 0 to disable automatic archiving

### Views
1. **👶 Kids View**: Colorful, gamified interface for children
   - Points system for completed tasks
   - Fun animations and rewards
   - Easy-to-use interface

2. **🎴 Card View**: Visual card-based layout
   - Shows all task details at a glance
   - Subtask progress indicators
   - Color-coded priorities

3. **📊 Table View**: Compact tabular format
   - Great for desktop users
   - Shows hierarchy with indentation
   - Quick actions

4. **📅 Calendar View**: Month-at-a-glance
   - See tasks by due date
   - Identify busy days
   - Visual timeline
   - Overdue indicators

5. **📦 Archive View**: Historical task repository
   - View all archived completed tasks
   - Restore or permanently delete
   - Search archived tasks

### Filtering & Search
- 🔍 **Search**: Search across titles, notes, and tags
- 👤 **User Filter**: View tasks for specific family members
- ⚡ **Quick Filters**:
  - All tasks
  - Today's tasks
  - This week's tasks
  - Overdue tasks

### Additional Features
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 📱 **Mobile-First**: Optimized for phone, tablet, and desktop
- 💾 **Auto-Save**: All changes saved to browser localStorage
- 🎯 **Points System**: Kids earn points for completing tasks
- 🚫 **Circular Dependency Prevention**: Can't create infinite loops in task hierarchy

## 👨‍👩‍👧‍👦 Users

The system comes with 4 default users:
- **Mark** (Adult)
- **Spouse** (Adult)
- **Kid 1** (Child)
- **Kid 2** (Child)

You can customize these in the browser console:
```javascript
taskManager.users = [
    { id: 'parent1', name: 'Dad', type: 'adult' },
    { id: 'parent2', name: 'Mom', type: 'adult' },
    { id: 'child1', name: 'Emma', type: 'kid' },
    { id: 'child2', name: 'Liam', type: 'kid' }
];
taskManager.saveData();
```

## 🎮 Kids View Features

The Kids View is designed to make chores and tasks fun:

- **Color-coded by child**: Each child has their own color scheme
- **Points system**: 
  - Base: 10 points per task
  - High priority: +5 points
  - Urgent priority: +10 points
  - On-time completion: +5 points bonus
- **Motivational messages**: Celebratory messages when tasks are completed
- **Simple interface**: Large buttons and clear visuals

## 📝 Task Examples

### Regular Chore
```
Title: Clean your room
Assigned: Kid 1
Priority: Medium
Status: To Do
Tags: chore, weekly
```

### Time-Specific Reminder
```
Title: Pick up from gym
Assigned: Mark
Due Date: Every Monday
Due Time: 7:00 PM
Recurring: Weekly
Tags: pickup, reminder
```

### Multi-step Project
```
Main Task: Plan Birthday Party
├── Subtask: Send invitations
├── Subtask: Buy decorations
│   └── Subtask: Choose color theme
└── Subtask: Order cake
```

## 🔄 Recurring Tasks

Recurring tasks automatically create new instances:

1. Create a task and check "Recurring Task"
2. Set frequency (Daily/Weekly/Monthly) and interval
3. The system checks hourly for new instances to create
4. New tasks are created with updated due dates
5. Original recurring task template is preserved

Example:
- **Daily**: "Take out trash" every 1 day
- **Weekly**: "Mow lawn" every 1 week
- **Monthly**: "Pay bills" every 1 month

## 💾 Data Storage

All data is stored in `data.json`:
- `tasks`: Array of active tasks
- `archivedTasks`: Array of archived completed tasks
- `users`: Array of user configurations
- `password`: Login password
- `settings`: App settings (theme, auto-archive days, notifications)

The app uses a server-side endpoint (`api/save-data.php` or Node.js server) to persist data. If the server is unavailable, data is saved to browser localStorage as a backup.

### Backup Your Data (Built-in)
1. Click the **Settings** icon (⚙️) in the header
2. Click **Export Data**
3. A JSON file will download with all your data

### Restore from Backup (Built-in)
1. Click the **Settings** icon (⚙️)
2. Click **Import Data**
3. Select your JSON backup file
4. Confirm to replace current data

### Manual Backup (Console)
```javascript
// Export current data
taskManager.exportData();

// Or access data directly
console.log(JSON.stringify({
    tasks: taskManager.tasks,
    archivedTasks: taskManager.archivedTasks,
    users: taskManager.users,
    settings: taskManager.settings
}, null, 2));
```

## 🌐 Deployment

This app requires a server to save data. Several options:

### Option 1: Node.js/Express (Recommended)
Best for most users. Works on any Node.js hosting:
- **Heroku** (free tier available)
- **Railway** (easy deployment)
- **DigitalOcean** (App Platform)
- **AWS/Azure/GCP** (for larger scale)

```bash
cd tasks/api
npm install
npm start
```

### Option 2: PHP Server
Works on any PHP hosting (cPanel, shared hosting, etc.):
- Upload the `tasks` folder to your server
- Ensure `api/save-data.php` has write permissions
- Access via your domain

### Option 3: Vercel/Netlify with Serverless
Deploy as a static site with serverless functions:
- Convert `api/save-data.php` to a serverless function
- Store data in a database (MongoDB, PostgreSQL, etc.)

### Local Development
For testing on your computer:
```bash
cd tasks/api
npm install
npm start
```

### ⚠️ GitHub Pages Note
GitHub Pages is **static-only** and cannot save data. The app will work but:
- Data saved to localStorage only (per-browser)
- Not shared across devices
- Cleared with browser cache

For production use, deploy to a server with write capabilities.

## 🔧 Customization

### Using Settings UI (Recommended)
1. Click the **Settings icon** (⚙️) in the header
2. Change password, manage users, configure auto-archive
3. Click **Save Settings**

### Change Password
**Via Settings UI:**
1. Settings → Enter new password → Save Settings

**Via Console:**
```javascript
taskManager.password = 'myNewPassword123';
taskManager.saveData();
```

### Manage Users
**Via Settings UI:**
1. Settings → Manage Users section
2. Edit names, avatars, types
3. Add or remove users
4. Save Settings

**Via Console:**
```javascript
// Add user
taskManager.users.push({
    id: 'newuser',
    name: 'New User',
    type: 'adult', // or 'kid'
    avatar: '👤'
});
taskManager.saveData();

// Remove user
taskManager.users = taskManager.users.filter(u => u.id !== 'userid');
taskManager.saveData();
```

### Configure Auto-Archive
**Via Settings UI:**
1. Settings → Auto-Archive Completed Tasks After (days)
2. Set number of days (0 to disable)
3. Save Settings

**Via Console:**
```javascript
taskManager.settings.autoArchiveDays = 7; // Archive after 7 days
// or
taskManager.settings.autoArchiveDays = 0; // Disable auto-archive
taskManager.saveData();
```

### Customize Points
Edit the `calculatePoints` method in `tasks.js`:
```javascript
calculatePoints(task) {
    let points = 20; // Increase base points
    if (task.priority === 'high') points += 10;
    if (task.priority === 'urgent') points += 20;
    return points;
}
```

## 📱 Mobile Access

For best mobile experience:
1. Open the task manager on your phone
2. Use "Add to Home Screen" feature
3. It will behave like a native app

## 🎨 Themes

Toggle between light and dark mode using the sun/moon icon in the header. Your preference is saved automatically.

## 🐛 Troubleshooting

### Tasks Not Showing
- Check filter settings (user filter, quick filters)
- Clear search box
- Refresh the page

### Lost Data
- Data is per-browser, make sure you're in the same browser
- Export backups regularly (see "Backup Your Data" above)

### Can't Login
- Default password is `smazl2024`
- If changed and forgotten, clear localStorage:
```javascript
localStorage.clear();
location.reload();
```

## 🚀 Future Enhancements

Potential features to add:
- [ ] Task templates
- [ ] File attachments
- [ ] Time tracking
- [ ] Collaboration/comments
- [ ] Push notifications
- [ ] Task history/audit log
- [ ] Advanced analytics
- [ ] Export to PDF/CSV
- [ ] Integration with calendar apps
- [ ] Voice commands
- [ ] Drag-and-drop task ordering

## 📄 License

This is a personal project. Feel free to customize for your own use!
