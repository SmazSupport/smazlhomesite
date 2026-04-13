// Task Manager Application with JSON Storage and Archive System
class TaskManager {
    constructor() {
        this.tasks = [];
        this.archivedTasks = [];
        this.pointHistory = []; // Track all point transactions
        this.users = [
            { id: 'mark', name: 'Mark', type: 'adult', avatar: '👨' },
            { id: 'spouse', name: 'Spouse', type: 'adult', avatar: '👩' },
            { id: 'kid1', name: 'Kid 1', type: 'kid', avatar: '🧒' },
            { id: 'kid2', name: 'Kid 2', type: 'kid', avatar: '👧' }
        ];
        this.password = 'smazl2024';
        this.settings = {
            theme: 'light',
            autoArchiveDays: 30,
            notifications: true
        };
        this.currentView = 'kids';
        this.currentFilter = 'all';
        this.currentUser = 'all';
        this.searchTerm = '';
        this.dataFile = 'data.json';
        this.apiEndpoint = 'api/save-data.php';
        this.networkZoom = 1;
        this.networkPanX = 0;
        this.networkPanY = 0;
        
        this.init();
    }

    init() {
        this.loadData().then(() => {
            this.setupEventListeners();
            this.applyTheme();
            this.checkRecurringTasks();
            this.checkAutoArchive();
            
            // Apply kids safe mode if on kids view
            if (this.currentView === 'kids') {
                document.body.classList.add('kids-safe-mode');
            }
        });
    }

    async loadData() {
        try {
            const response = await fetch(this.dataFile + '?t=' + Date.now());
            if (response.ok) {
                const data = await response.json();
                this.tasks = data.tasks || [];
                this.archivedTasks = data.archivedTasks || [];
                this.pointHistory = data.pointHistory || [];
                this.users = data.users || this.users;
                this.password = data.password || this.password;
                this.settings = { ...this.settings, ...(data.settings || {}) };
                this.applyTheme();
            }
        } catch (error) {
            console.warn('Could not load data from JSON, using defaults:', error);
        }
    }

    async saveData() {
        const data = {
            tasks: this.tasks,
            archivedTasks: this.archivedTasks,
            pointHistory: this.pointHistory,
            users: this.users,
            password: this.password,
            settings: this.settings
        };

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save data');
            }
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            // Fallback to localStorage as backup
            localStorage.setItem('taskManagerBackup', JSON.stringify(data));
            return false;
        }
    }

    setupEventListeners() {
        // Login
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettingsModal();
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Parent Controls
        document.getElementById('parent-controls-btn').addEventListener('click', () => {
            this.openParentControlsModal();
        });

        document.getElementById('close-parent-controls').addEventListener('click', () => {
            this.closeParentControlsModal();
        });

        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.addUser();
        });

        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data-btn').addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });

        document.getElementById('import-file-input').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Add task
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Task form
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Modal close
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('cancel-task').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // Click outside modal to close
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target.id === 'task-modal') {
                this.closeTaskModal();
            }
        });

        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.closeSettingsModal();
            }
        });

        // Recurring checkbox
        document.getElementById('task-recurring').addEventListener('change', (e) => {
            document.getElementById('recurring-options').classList.toggle('hidden', !e.target.checked);
        });

        // View mode
        document.getElementById('view-mode').addEventListener('change', (e) => {
            this.currentView = e.target.value;
            
            // Toggle kids safe mode
            if (this.currentView === 'kids') {
                document.body.classList.add('kids-safe-mode');
            } else {
                document.body.classList.remove('kids-safe-mode');
            }
            
            this.renderTasks();
        });

        // User filter
        document.getElementById('user-filter').addEventListener('change', (e) => {
            this.currentUser = e.target.value;
            this.renderTasks();
        });

        // Quick filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderTasks();
        });
    }

    handleLogin() {
        const password = document.getElementById('password-input').value;
        const errorEl = document.getElementById('login-error');

        if (password === this.password) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
            this.populateUserSelects();
            this.renderTasks();
        } else {
            errorEl.textContent = 'Incorrect password';
            document.getElementById('password-input').value = '';
        }
    }

    handleLogout() {
        document.getElementById('app').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('password-input').value = '';
        document.getElementById('login-error').textContent = '';
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveData();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }

    // Settings Modal
    openSettingsModal() {
        document.getElementById('auto-archive-days').value = this.settings.autoArchiveDays;
        this.renderUsersList();
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    closeSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    // Parent Controls Modal
    openParentControlsModal() {
        this.renderParentControls();
        document.getElementById('parent-controls-modal').classList.remove('hidden');
    }

    closeParentControlsModal() {
        document.getElementById('parent-controls-modal').classList.add('hidden');
    }

    renderParentControls() {
        const kids = this.users.filter(u => u.type === 'kid');
        const container = document.getElementById('parent-controls-content');

        if (kids.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No kids configured. Add kids in Settings.</p>';
            return;
        }

        container.innerHTML = `
            <!-- Point History Section -->
            <div style="
                border: 2px solid var(--border-color);
                border-radius: var(--radius-lg);
                padding: 1.5rem;
                margin-bottom: 2rem;
                background: var(--bg-secondary);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; font-size: 1.5rem;">📜 Point History</h3>
                    <button class="btn btn-secondary" onclick="taskManager.exportPointHistory()" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        📥 Export Receipts
                    </button>
                </div>
                <div style="max-height: 400px; overflow-y: auto; background: var(--bg-primary); border-radius: var(--radius-md); padding: 0.5rem;">
                    ${this.pointHistory.length === 0 ? `
                        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                            No transactions yet
                        </div>
                    ` : this.pointHistory.map(entry => {
                        const icon = entry.type === 'task_completed' ? '✅' :
                                    entry.type === 'task_uncompleted' ? '↩️' :
                                    entry.type === 'manual_add' ? '➕' : '➖';
                        const color = entry.amount > 0 ? 'var(--success)' : 'var(--danger)';
                        const date = new Date(entry.timestamp);
                        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        
                        return `
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 0.75rem;
                                margin-bottom: 0.5rem;
                                background: var(--bg-secondary);
                                border-radius: var(--radius-sm);
                                border-left: 3px solid ${color};
                            ">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                        <span style="font-size: 1.25rem;">${entry.userAvatar}</span>
                                        <strong>${entry.userName}</strong>
                                        <span style="font-size: 1.25rem;">${icon}</span>
                                    </div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                        ${this.escapeHtml(entry.description)}
                                    </div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                                        ${dateStr}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: ${color};">
                                        ${entry.amount > 0 ? '+' : ''}${entry.amount}
                                    </div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                        Balance: ${entry.newBalance}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Kids Sections -->
            ${kids.map(kid => {
                const kidTasks = this.tasks.filter(t => t.assignee === kid.id);
                const totalEarned = kid.pointsEarned || 0;
                const pendingPoints = kidTasks
                    .filter(t => t.status !== 'completed')
                    .reduce((sum, t) => sum + this.calculatePoints(t), 0);

                return `
                    <div style="
                        border: 2px solid var(--border-color);
                        border-radius: var(--radius-lg);
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                        background: var(--bg-secondary);
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <div>
                                <h3 style="margin: 0; font-size: 1.5rem;">${kid.avatar} ${kid.name}</h3>
                                <div style="margin-top: 0.5rem; font-size: 1.25rem; color: var(--primary);">
                                    ⭐ <strong>${totalEarned}</strong> points earned
                                    <span style="font-size: 0.875rem; color: var(--text-secondary); margin-left: 0.5rem;">
                                        (+${pendingPoints} available)
                                    </span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-primary" onclick="taskManager.promptAdjustPoints('${kid.id}', 'add')" style="padding: 0.75rem 1rem;">
                                    ➕ Add Points
                                </button>
                                <button class="btn btn-secondary" onclick="taskManager.promptAdjustPoints('${kid.id}', 'remove')" style="padding: 0.75rem 1rem;">
                                    ➖ Cash In
                                </button>
                            </div>
                        </div>

                        <div style="margin-bottom: 1rem;">
                            <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; color: var(--text-secondary);">
                                📋 All Tasks (${kidTasks.length})
                            </h4>
                            <div style="max-height: 300px; overflow-y: auto; background: var(--bg-primary); border-radius: var(--radius-md); padding: 0.5rem;">
                                ${kidTasks.length === 0 ? `
                                    <div style="text-align: center; padding: 1rem; color: var(--text-secondary);">
                                        No tasks assigned
                                    </div>
                                ` : kidTasks.map(task => {
                                    const taskPoints = this.calculatePoints(task);
                                    const isCompleted = task.status === 'completed';
                                    return `
                                        <div style="
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: center;
                                            padding: 0.75rem;
                                            margin-bottom: 0.5rem;
                                            background: var(--bg-secondary);
                                            border-radius: var(--radius-sm);
                                            border-left: 3px solid ${isCompleted ? 'var(--success)' : 'var(--warning)'};
                                            ${isCompleted ? 'opacity: 0.7;' : ''}
                                        ">
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; ${isCompleted ? 'text-decoration: line-through;' : ''}">
                                                    ${this.escapeHtml(task.title)}
                                                </div>
                                                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">
                                                    ${isCompleted ? '✅ Completed' : '⏳ ' + this.formatStatus(task.status)}
                                                </div>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">
                                                    ⭐ ${taskPoints}
                                                </div>
                                                <button class="btn btn-secondary" onclick="taskManager.editTaskPoints('${task.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-top: 0.25rem;">
                                                    Edit Points
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    editTaskPoints(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const currentPoints = task.points || this.calculatePoints(task);
        const newPoints = prompt(`Edit points for "${task.title}"\n\nCurrent: ${currentPoints} points\nEnter new points (or leave blank for auto):`, task.points || '');
        
        if (newPoints === null) return; // Cancelled

        if (newPoints === '' || newPoints === null) {
            delete task.points; // Use auto-calculation
        } else if (!isNaN(newPoints)) {
            task.points = parseInt(newPoints);
        }

        this.saveData();
        this.renderParentControls();
        this.renderTasks();
    }

    exportPointHistory() {
        const csv = [
            ['Date', 'Time', 'Kid', 'Type', 'Description', 'Points', 'New Balance'].join(','),
            ...this.pointHistory.map(entry => {
                const date = new Date(entry.timestamp);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString();
                const type = entry.type.replace('_', ' ');
                return [
                    dateStr,
                    timeStr,
                    entry.userName,
                    type,
                    `"${entry.description.replace(/"/g, '""')}"`,
                    entry.amount,
                    entry.newBalance
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `point-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    renderUsersList() {
        const container = document.getElementById('users-list');
        container.innerHTML = this.users.map((user, index) => `
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                <input type="text" value="${user.avatar}" style="width: 50px;" data-user-index="${index}" data-field="avatar">
                <input type="text" value="${user.name}" style="flex: 1;" data-user-index="${index}" data-field="name" placeholder="Name">
                <select data-user-index="${index}" data-field="type" style="width: 100px;">
                    <option value="adult" ${user.type === 'adult' ? 'selected' : ''}>Adult</option>
                    <option value="kid" ${user.type === 'kid' ? 'selected' : ''}>Kid</option>
                </select>
                <button class="icon-btn" onclick="taskManager.removeUser(${index})" style="color: var(--danger);">🗑️</button>
            </div>
        `).join('');

        // Add event listeners to inputs
        container.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.userIndex);
                const field = e.target.dataset.field;
                this.users[index][field] = e.target.value;
            });
        });
    }

    addUser() {
        const newUser = {
            id: 'user_' + Date.now(),
            name: 'New User',
            type: 'adult',
            avatar: '👤',
            pointsEarned: 0  // Initialize points for all users
        };
        this.users.push(newUser);
        this.renderUsersList();
    }

    removeUser(index) {
        if (confirm('Are you sure you want to remove this user?')) {
            this.users.splice(index, 1);
            this.renderUsersList();
        }
    }

    async saveSettings() {
        const newPassword = document.getElementById('settings-password').value;
        if (newPassword) {
            this.password = newPassword;
            document.getElementById('settings-password').value = '';
        }

        this.settings.autoArchiveDays = parseInt(document.getElementById('auto-archive-days').value);

        const saved = await this.saveData();
        if (saved) {
            alert('Settings saved successfully!');
        } else {
            alert('Settings saved locally. Server sync may have failed.');
        }
        
        this.populateUserSelects();
        this.closeSettingsModal();
    }

    // Export/Import
    exportData() {
        const data = {
            tasks: this.tasks,
            archivedTasks: this.archivedTasks,
            users: this.users,
            password: this.password,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async importData(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (confirm('This will replace all current data. Are you sure?')) {
                this.tasks = data.tasks || [];
                this.archivedTasks = data.archivedTasks || [];
                this.users = data.users || this.users;
                this.password = data.password || this.password;
                this.settings = { ...this.settings, ...(data.settings || {}) };

                await this.saveData();
                this.populateUserSelects();
                this.renderTasks();
                alert('Data imported successfully!');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    }

    // Archive Functions
    checkAutoArchive() {
        if (this.settings.autoArchiveDays === 0) return;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.settings.autoArchiveDays);

        const toArchive = this.tasks.filter(task => {
            if (task.status !== 'completed' || !task.completedAt) return false;
            const completedDate = new Date(task.completedAt);
            return completedDate < cutoffDate;
        });

        if (toArchive.length > 0) {
            toArchive.forEach(task => this.archiveTask(task.id, true));
            console.log(`Auto-archived ${toArchive.length} tasks`);
        }
    }

    archiveTask(taskId, silent = false) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = this.tasks[taskIndex];
        task.archivedAt = new Date().toISOString();
        
        this.archivedTasks.push(task);
        this.tasks.splice(taskIndex, 1);

        this.saveData();
        
        if (!silent) {
            this.renderTasks();
        }
    }

    restoreTask(taskId) {
        const taskIndex = this.archivedTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = this.archivedTasks[taskIndex];
        delete task.archivedAt;
        
        this.tasks.push(task);
        this.archivedTasks.splice(taskIndex, 1);

        this.saveData();
        this.renderTasks();
    }

    deleteArchivedTask(taskId) {
        if (!confirm('Permanently delete this task? This cannot be undone.')) return;

        this.archivedTasks = this.archivedTasks.filter(t => t.id !== taskId);
        this.saveData();
        this.renderTasks();
    }

    populateUserSelects() {
        const userFilter = document.getElementById('user-filter');
        const taskAssignee = document.getElementById('task-assignee');

        userFilter.innerHTML = '<option value="all">All Users</option>';
        taskAssignee.innerHTML = '<option value="">Select person</option>';

        this.users.forEach(user => {
            userFilter.innerHTML += `<option value="${user.id}">${user.avatar} ${user.name}</option>`;
            taskAssignee.innerHTML += `<option value="${user.id}">${user.avatar} ${user.name}</option>`;
        });
    }

    openTaskModal(taskId = null) {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const modalTitle = document.getElementById('modal-title');

        form.reset();
        document.getElementById('recurring-options').classList.add('hidden');
        
        // CRITICAL: Clear the task-id field to ensure we're creating, not updating
        document.getElementById('task-id').value = '';

        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                modalTitle.textContent = 'Edit Task';
                this.populateTaskForm(task);
            }
        } else {
            modalTitle.textContent = 'Create Task';
            document.getElementById('task-status').value = 'todo';
        }

        this.populateParentTaskSelect(taskId);
        modal.classList.remove('hidden');
    }

    closeTaskModal() {
        document.getElementById('task-modal').classList.add('hidden');
    }

    createSubtask(parentTaskId) {
        const parentTask = this.tasks.find(t => t.id === parentTaskId);
        if (!parentTask) return;

        // Open modal in create mode
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const modalTitle = document.getElementById('modal-title');

        form.reset();
        document.getElementById('recurring-options').classList.add('hidden');
        
        // CRITICAL: Clear task-id to ensure we're creating a new subtask
        document.getElementById('task-id').value = '';
        
        modalTitle.textContent = 'Create Subtask';

        // Pre-fill with parent task data
        document.getElementById('task-assignee').value = parentTask.assignee;
        document.getElementById('task-priority').value = parentTask.priority;
        document.getElementById('task-status').value = 'todo'; // Always start as todo
        document.getElementById('task-parent').value = parentTaskId; // Set parent
        
        // Copy due date/time from parent
        if (parentTask.dueDate) {
            document.getElementById('task-due-date').value = parentTask.dueDate;
        }
        if (parentTask.dueTime) {
            document.getElementById('task-due-time').value = parentTask.dueTime;
        }
        
        // Copy tags if any
        if (parentTask.tags && parentTask.tags.length > 0) {
            document.getElementById('task-tags').value = parentTask.tags.join(', ');
        }

        // Don't copy notes - subtask will have its own

        this.populateParentTaskSelect(null);
        
        // Set the parent in the dropdown after it's populated
        setTimeout(() => {
            document.getElementById('task-parent').value = parentTaskId;
        }, 10);

        modal.classList.remove('hidden');
        
        // Focus on title field
        document.getElementById('task-title').focus();
    }

    populateTaskForm(task) {
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-assignee').value = task.assignee;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-parent').value = task.parent || '';
        document.getElementById('task-notes').value = task.notes || '';
        document.getElementById('task-tags').value = task.tags ? task.tags.join(', ') : '';
        document.getElementById('task-points').value = task.points || '';

        if (task.dueDate) {
            document.getElementById('task-due-date').value = task.dueDate.split('T')[0];
            if (task.dueTime) {
                document.getElementById('task-due-time').value = task.dueTime;
            }
        }

        if (task.recurring) {
            document.getElementById('task-recurring').checked = true;
            document.getElementById('recurring-options').classList.remove('hidden');
            document.getElementById('recurring-frequency').value = task.recurring.frequency;
            document.getElementById('recurring-interval').value = task.recurring.interval;
        }
    }

    populateParentTaskSelect(currentTaskId) {
        const parentSelect = document.getElementById('task-parent');
        parentSelect.innerHTML = '<option value="">None (Main Task)</option>';

        const availableTasks = this.tasks.filter(task => {
            if (currentTaskId && task.id === currentTaskId) return false;
            if (currentTaskId && this.wouldCreateCircularDependency(currentTaskId, task.id)) return false;
            return true;
        });

        availableTasks.forEach(task => {
            const indent = '　'.repeat(this.getTaskDepth(task.id));
            parentSelect.innerHTML += `<option value="${task.id}">${indent}${task.title}</option>`;
        });
    }

    getTaskDepth(taskId, depth = 0, visited = new Set()) {
        // Prevent infinite loops
        if (depth > 50 || visited.has(taskId)) return depth;
        visited.add(taskId);
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.parent) return depth;
        return this.getTaskDepth(task.parent, depth + 1, visited);
    }

    getAllSubtasks(taskId, depth = 0) {
        // Get all subtasks recursively
        const directSubtasks = this.tasks.filter(t => t.parent === taskId);
        let allSubtasks = [];
        
        directSubtasks.forEach(subtask => {
            allSubtasks.push({ task: subtask, depth: depth });
            // Recursively get children of this subtask
            const nestedSubtasks = this.getAllSubtasks(subtask.id, depth + 1);
            allSubtasks = allSubtasks.concat(nestedSubtasks);
        });
        
        return allSubtasks;
    }

    wouldCreateCircularDependency(taskId, potentialParentId) {
        // A task cannot be its own parent
        if (taskId === potentialParentId) return true;
        
        let currentId = potentialParentId;
        const visited = new Set();
        let depth = 0;

        while (currentId && depth < 100) {
            if (currentId === taskId) return true;
            if (visited.has(currentId)) return true;
            visited.add(currentId);

            const task = this.tasks.find(t => t.id === currentId);
            currentId = task ? task.parent : null;
            depth++;
        }

        return false;
    }

    async saveTask() {
        const taskId = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const assignee = document.getElementById('task-assignee').value;
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;
        const parent = document.getElementById('task-parent').value || null;
        const notes = document.getElementById('task-notes').value.trim();
        const tagsInput = document.getElementById('task-tags').value;
        const dueDate = document.getElementById('task-due-date').value;
        const dueTime = document.getElementById('task-due-time').value;
        const isRecurring = document.getElementById('task-recurring').checked;
        const customPoints = document.getElementById('task-points').value;

        if (!title || !assignee) {
            alert('Please fill in required fields');
            return;
        }

        // Prevent circular dependencies
        if (taskId && parent) {
            if (taskId === parent) {
                alert('Error: A task cannot be its own parent!');
                return;
            }
            if (this.wouldCreateCircularDependency(taskId, parent)) {
                alert('Error: This would create a circular dependency. Please choose a different parent task.');
                return;
            }
        }

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const taskData = {
            title,
            assignee,
            priority,
            status,
            parent,
            notes,
            tags,
            dueDate: dueDate || null,
            dueTime: dueTime || null,
            points: customPoints ? parseInt(customPoints) : null,
            createdAt: new Date().toISOString(),
            createdBy: 'mark',
            updatedAt: new Date().toISOString()
        };

        if (isRecurring) {
            taskData.recurring = {
                frequency: document.getElementById('recurring-frequency').value,
                interval: parseInt(document.getElementById('recurring-interval').value),
                lastCreated: new Date().toISOString()
            };
        }

        if (taskId) {
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                this.tasks[index] = { ...this.tasks[index], ...taskData };
            }
        } else {
            taskData.id = this.generateId();
            this.tasks.push(taskData);
        }

        await this.saveData();
        this.closeTaskModal();
        this.renderTasks();
    }

    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const toDelete = [taskId];
        let i = 0;
        while (i < toDelete.length) {
            const subtasks = this.tasks.filter(t => t.parent === toDelete[i]);
            subtasks.forEach(st => toDelete.push(st.id));
            i++;
        }

        this.tasks = this.tasks.filter(t => !toDelete.includes(t.id));
        await this.saveData();
        this.renderTasks();
    }

    async completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const userIndex = this.users.findIndex(u => u.id === task.assignee);
        const user = this.users[userIndex];
        
        if (task.status === 'completed') {
            task.status = 'todo';
            // Remove points if uncompleting
            if (user && user.type === 'kid' && task.pointsAwarded) {
                this.users[userIndex].pointsEarned = (this.users[userIndex].pointsEarned || 0) - task.pointsAwarded;
                
                // Log point removal
                this.logPointTransaction(user.id, -task.pointsAwarded, 'task_uncompleted', task.title);
                
                delete task.pointsAwarded;
            }
            delete task.completedAt;
        } else {
            task.status = 'completed';
            task.completedAt = new Date().toISOString();

            if (user && user.type === 'kid') {
                const points = this.calculatePoints(task);
                task.pointsAwarded = points; // Store how many points were awarded
                this.users[userIndex].pointsEarned = (this.users[userIndex].pointsEarned || 0) + points;
                
                // Log point award
                this.logPointTransaction(user.id, points, 'task_completed', task.title);
                
                this.showPointsAnimation(points);
            }
        }

        await this.saveData();
        this.renderTasks();
    }

    logPointTransaction(userId, amount, type, description = '') {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.pointHistory.unshift({
            id: 'ph_' + Date.now(),
            userId: userId,
            userName: user.name,
            userAvatar: user.avatar,
            amount: amount,
            type: type, // 'task_completed', 'task_uncompleted', 'manual_add', 'manual_remove'
            description: description,
            newBalance: user.pointsEarned || 0,
            timestamp: new Date().toISOString()
        });

        // Keep only last 100 transactions
        if (this.pointHistory.length > 100) {
            this.pointHistory = this.pointHistory.slice(0, 100);
        }
    }

    async adjustUserPoints(userId, amount, reason = '') {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        this.users[userIndex].pointsEarned = (this.users[userIndex].pointsEarned || 0) + amount;
        
        if (this.users[userIndex].pointsEarned < 0) {
            this.users[userIndex].pointsEarned = 0;
        }

        // Log manual adjustment
        const type = amount > 0 ? 'manual_add' : 'manual_remove';
        this.logPointTransaction(userId, amount, type, reason || 'Manual adjustment');

        await this.saveData();
        this.renderTasks();
        
        const message = amount > 0 
            ? `Added ${amount} points${reason ? ' for ' + reason : ''}!` 
            : `Removed ${Math.abs(amount)} points${reason ? ' for ' + reason : ''}!`;
        alert(message);
    }

    calculatePoints(task) {
        // If custom points are set, use those
        if (task.points) {
            return task.points;
        }
        
        // Otherwise auto-calculate
        let points = 10;
        
        if (task.priority === 'high') points += 5;
        if (task.priority === 'urgent') points += 10;
        
        if (task.dueDate && new Date(task.dueDate) >= new Date()) {
            points += 5;
        }

        return points;
    }

    showPointsAnimation(points) {
        const messages = [
            `🎉 Awesome! You earned ${points} points!`,
            `⭐ Great job! +${points} points!`,
            `🏆 Well done! ${points} points added!`
        ];
        alert(messages[Math.floor(Math.random() * messages.length)]);
    }

    checkRecurringTasks() {
        const now = new Date();
        
        this.tasks.forEach(task => {
            if (!task.recurring) return;

            const lastCreated = new Date(task.recurring.lastCreated);
            const { frequency, interval } = task.recurring;
            
            let shouldCreate = false;
            
            if (frequency === 'daily') {
                const daysDiff = Math.floor((now - lastCreated) / (1000 * 60 * 60 * 24));
                shouldCreate = daysDiff >= interval;
            } else if (frequency === 'weekly') {
                const weeksDiff = Math.floor((now - lastCreated) / (1000 * 60 * 60 * 24 * 7));
                shouldCreate = weeksDiff >= interval;
            } else if (frequency === 'monthly') {
                const monthsDiff = (now.getFullYear() - lastCreated.getFullYear()) * 12 + 
                                   (now.getMonth() - lastCreated.getMonth());
                shouldCreate = monthsDiff >= interval;
            }

            if (shouldCreate) {
                this.createRecurringTaskInstance(task);
            }
        });
    }

    createRecurringTaskInstance(originalTask) {
        const newTask = {
            ...originalTask,
            id: this.generateId(),
            status: 'todo',
            createdAt: new Date().toISOString(),
            completedAt: null,
            parent: null
        };

        if (newTask.dueDate) {
            const dueDate = new Date(newTask.dueDate);
            const { frequency, interval } = newTask.recurring;
            
            if (frequency === 'daily') {
                dueDate.setDate(dueDate.getDate() + interval);
            } else if (frequency === 'weekly') {
                dueDate.setDate(dueDate.getDate() + (interval * 7));
            } else if (frequency === 'monthly') {
                dueDate.setMonth(dueDate.getMonth() + interval);
            }
            
            newTask.dueDate = dueDate.toISOString().split('T')[0];
        }

        delete newTask.recurring;
        
        this.tasks.push(newTask);
        originalTask.recurring.lastCreated = new Date().toISOString();
        
        this.saveData();
    }

    getFilteredTasks() {
        let filtered = this.currentView === 'archive' ? [...this.archivedTasks] : [...this.tasks];

        if (this.currentUser !== 'all') {
            filtered = filtered.filter(t => t.assignee === this.currentUser);
        }

        if (this.currentFilter !== 'all' && this.currentView !== 'archive') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);

            if (this.currentFilter === 'today') {
                filtered = filtered.filter(t => {
                    if (!t.dueDate) return false;
                    const due = new Date(t.dueDate);
                    return due.toDateString() === today.toDateString();
                });
            } else if (this.currentFilter === 'week') {
                filtered = filtered.filter(t => {
                    if (!t.dueDate) return false;
                    const due = new Date(t.dueDate);
                    return due >= today && due <= weekFromNow;
                });
            } else if (this.currentFilter === 'overdue') {
                filtered = filtered.filter(t => {
                    if (!t.dueDate || t.status === 'completed') return false;
                    const due = new Date(t.dueDate);
                    return due < today;
                });
            }
        }

        if (this.searchTerm) {
            filtered = filtered.filter(t => {
                const searchableText = [
                    t.title,
                    t.notes,
                    ...(t.tags || [])
                ].join(' ').toLowerCase();
                return searchableText.includes(this.searchTerm);
            });
        }

        return filtered;
    }

    renderTasks() {
        const container = document.getElementById('task-container');
        const filtered = this.getFilteredTasks();

        if (filtered.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        if (this.currentView === 'archive') {
            container.innerHTML = this.renderArchiveView(filtered);
        } else if (this.currentView === 'kids') {
            container.innerHTML = this.renderKidsView(filtered);
        } else if (this.currentView === 'card') {
            container.innerHTML = this.renderCardView(filtered);
        } else if (this.currentView === 'table') {
            container.innerHTML = this.renderTableView(filtered);
        } else if (this.currentView === 'network') {
            container.innerHTML = this.renderNetworkView(filtered);
        } else if (this.currentView === 'calendar') {
            container.innerHTML = this.renderCalendarView(filtered);
        }
    }

    renderEmptyState() {
        const message = this.currentView === 'archive' 
            ? 'No archived tasks'
            : 'No tasks found';
        const subtext = this.currentView === 'archive'
            ? 'Completed tasks will appear here after auto-archive'
            : 'Create a new task to get started!';

        return `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <h3>${message}</h3>
                <p>${subtext}</p>
            </div>
        `;
    }

    renderArchiveView(tasks) {
        return `
            <div style="margin-bottom: 1.5rem; background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-md); border-left: 4px solid var(--info);">
                <h3 style="margin-bottom: 0.5rem;">📦 Archived Tasks</h3>
                <p style="color: var(--text-secondary); font-size: 0.875rem;">
                    These are completed tasks that were archived ${this.settings.autoArchiveDays} days after completion.
                    You can restore them or delete them permanently.
                </p>
            </div>
            <div class="card-view">
                ${tasks.map(task => this.renderArchivedCard(task)).join('')}
            </div>
        `;
    }

    renderArchivedCard(task) {
        const user = this.users.find(u => u.id === task.assignee);
        const archivedDate = task.archivedAt ? new Date(task.archivedAt).toLocaleDateString() : 'Unknown';

        return `
            <div class="task-card completed" data-id="${task.id}" style="opacity: 0.8;">
                <div class="task-header">
                    <div>
                        <div class="task-title">${this.escapeHtml(task.title)}</div>
                    </div>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                
                <div class="task-meta">
                    <div class="task-meta-item">
                        👤 ${user ? user.avatar + ' ' + user.name : 'Unassigned'}
                    </div>
                    <div class="task-meta-item">
                        📦 Archived: ${archivedDate}
                    </div>
                    ${task.completedAt ? `
                        <div class="task-meta-item">
                            ✅ Completed: ${new Date(task.completedAt).toLocaleDateString()}
                        </div>
                    ` : ''}
                </div>

                ${task.notes ? `
                    <div style="margin-top: 0.75rem; color: var(--text-secondary); font-size: 0.875rem;">
                        ${this.escapeHtml(task.notes).substring(0, 100)}${task.notes.length > 100 ? '...' : ''}
                    </div>
                ` : ''}

                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" style="flex: 1; padding: 0.5rem;" onclick="taskManager.restoreTask('${task.id}')">
                        ↩️ Restore
                    </button>
                    <button class="btn btn-secondary" style="padding: 0.5rem; background: var(--danger); color: white;" onclick="taskManager.deleteArchivedTask('${task.id}')">
                        🗑️ Delete Forever
                    </button>
                </div>
            </div>
        `;
    }

    renderKidsView(tasks) {
        const kids = this.users.filter(u => u.type === 'kid');
        
        if (kids.length === 0) {
            return '<div class="empty-state"><h3>No kids configured</h3><p>Add kids in Settings</p></div>';
        }

        return `
            <div style="max-width: 1200px; margin: 0 auto;">
                ${kids.map(kid => {
                    const kidTasks = tasks.filter(t => t.assignee === kid.id && !t.parent); // Only main tasks
                    const totalEarned = kid.pointsEarned || 0;
                    const pendingPoints = kidTasks
                        .filter(t => t.status !== 'completed')
                        .reduce((sum, t) => sum + this.calculatePoints(t), 0);
                    
                    return `
                        <div style="margin-bottom: 3rem;">
                            <div style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                padding: 1.5rem;
                                border-radius: var(--radius-lg);
                                color: white;
                                margin-bottom: 1.5rem;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                            ">
                                <div style="text-align: center;">
                                    <h2 style="margin: 0; font-size: 2rem;">${kid.avatar} ${kid.name}</h2>
                                    <div style="font-size: 3rem; font-weight: 700; margin: 1rem 0 0.5rem 0;">
                                        ⭐ ${totalEarned}
                                    </div>
                                    <div style="font-size: 1.25rem; opacity: 0.9;">
                                        Total Points Earned
                                    </div>
                                    ${pendingPoints > 0 ? `
                                        <div style="margin-top: 1rem; font-size: 1.1rem; background: rgba(255,255,255,0.2); padding: 0.75rem; border-radius: 8px;">
                                            💎 ${pendingPoints} more points available
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="kids-view">
                                ${kidTasks.length === 0 ? `
                                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                                        🎉 All done! No tasks right now.
                                    </div>
                                ` : kidTasks.map(task => this.renderKidsCard(task)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    promptAdjustPoints(userId, action) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const amount = prompt(action === 'add' 
            ? `How many points to ADD for ${user.name}?` 
            : `How many points to REMOVE from ${user.name}?`);
        
        if (amount && !isNaN(amount)) {
            const pointChange = action === 'add' ? parseInt(amount) : -parseInt(amount);
            const reason = prompt('Reason (optional):') || '';
            this.adjustUserPoints(userId, pointChange, reason);
        }
    }

    renderKidsCard(task) {
        const user = this.users.find(u => u.id === task.assignee);
        const points = this.calculatePoints(task);
        const isCompleted = task.status === 'completed';
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
        
        // Get all subtasks (including nested)
        const allSubtasks = this.getAllSubtasks(task.id);
        const completedSubtasks = allSubtasks.filter(st => st.task.status === 'completed').length;

        // Array of fun gradient colors
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
            'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Teal
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Light Pink
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Peach
            'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)'  // Red-Blue
        ];
        
        // Use task ID to deterministically pick a color
        const gradientIndex = parseInt(task.id.replace(/\D/g, '')) % gradients.length;
        const gradient = gradients[gradientIndex];

        return `
            <div class="kids-card ${isOverdue ? 'overdue' : ''}" data-assignee="${task.assignee}" data-id="${task.id}" style="background: ${gradient};">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                ${task.dueDate ? `<div style="margin-top: 0.5rem; opacity: 0.9;">📅 ${this.formatDate(task.dueDate)}</div>` : ''}
                ${task.dueTime ? `<div style="opacity: 0.9;">⏰ ${task.dueTime}</div>` : ''}
                ${isOverdue ? `<div style="margin-top: 0.5rem; background: rgba(255,255,255,0.3); padding: 0.5rem; border-radius: 8px; font-weight: 700;">⚠️ OVERDUE!</div>` : ''}
                
                ${allSubtasks.length > 0 ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 8px;">
                        <strong style="display: block; margin-bottom: 0.75rem; font-size: 0.9rem;">
                            📋 Steps (${completedSubtasks}/${allSubtasks.length})
                        </strong>
                        ${allSubtasks.map(subtaskData => {
                            const subtask = subtaskData.task;
                            const indent = '　'.repeat(subtaskData.depth);
                            return `
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    padding: 0.5rem;
                                    margin-bottom: 0.5rem;
                                    background: rgba(255,255,255,0.3);
                                    border-radius: 6px;
                                    ${subtask.status === 'completed' ? 'opacity: 0.6;' : ''}
                                ">
                                    <input type="checkbox" 
                                           ${subtask.status === 'completed' ? 'checked' : ''} 
                                           onchange="taskManager.completeTask('${subtask.id}')"
                                           style="cursor: pointer; transform: scale(1.3);">
                                    <span style="flex: 1; font-size: 0.95rem; font-weight: 600; ${subtask.status === 'completed' ? 'text-decoration: line-through;' : ''}">
                                        ${indent}${this.escapeHtml(subtask.title)}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
                
                <div class="kids-points">⭐ ${points} points</div>
                <button class="kids-check-btn" onclick="taskManager.completeTask('${task.id}')">
                    ${isCompleted ? '✅ Completed!' : 'Mark as Done'}
                </button>
            </div>
        `;
    }

    renderNetworkView(tasks) {
        const mainTasks = tasks.filter(t => !t.parent);
        
        if (mainTasks.length === 0) {
            return this.renderEmptyState();
        }

        // Build task hierarchy
        const buildHierarchy = (taskId, level = 0) => {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return null;

            const children = this.tasks.filter(t => t.parent === taskId);
            const user = this.users.find(u => u.id === task.assignee);
            const isCompleted = task.status === 'completed';

            return {
                task,
                user,
                level,
                isCompleted,
                children: children.map(child => buildHierarchy(child.id, level + 1)).filter(c => c !== null)
            };
        };

        const hierarchies = mainTasks.map(task => buildHierarchy(task.id));

        const renderNode = (node, index, total) => {
            const angle = (index / total) * 2 * Math.PI;
            const radius = 35;
            const x = 50 + (radius * Math.cos(angle));
            const y = 50 + (radius * Math.sin(angle));

            const renderChildren = (children, parentX, parentY, depth = 1) => {
                if (children.length === 0) return '';

                const childRadius = 15 / depth;
                return children.map((child, i) => {
                    const spreadAngle = 0.8;
                    const childAngle = angle + ((i - children.length / 2 + 0.5) * spreadAngle / depth);
                    const childX = parentX + (childRadius * Math.cos(childAngle));
                    const childY = parentY + (childRadius * Math.sin(childAngle));

                    return `
                        <line x1="${parentX}" y1="${parentY}" x2="${childX}" y2="${childY}" 
                              stroke="var(--border-color)" stroke-width="0.3" opacity="0.5"/>
                        
                        <g class="network-node" style="cursor: pointer;" onclick="taskManager.openTaskModal('${child.task.id}')">
                            <circle cx="${childX}" cy="${childY}" r="${4 / depth}" 
                                    fill="${child.isCompleted ? 'var(--success)' : 'var(--warning)'}" 
                                    stroke="var(--border-color)" stroke-width="0.2"/>
                            <text x="${childX}" y="${childY}" 
                                  text-anchor="middle" dominant-baseline="middle" 
                                  fill="white" font-size="${2.5 / depth}" font-weight="600">
                                ${child.user ? child.user.avatar : '📝'}
                            </text>
                        </g>
                        
                        <text x="${childX}" y="${childY + 5 / depth}" 
                              text-anchor="middle" 
                              fill="var(--text-primary)" font-size="${1.2 / depth}" font-weight="600">
                            ${this.escapeHtml(child.task.title).substring(0, 15)}
                        </text>
                        
                        ${renderChildren(child.children, childX, childY, depth + 1)}
                    `;
                }).join('');
            };

            return `
                <g class="network-node" style="cursor: pointer;" onclick="taskManager.openTaskModal('${node.task.id}')">
                    <circle cx="${x}" cy="${y}" r="5" 
                            fill="${node.isCompleted ? 'var(--success)' : 'var(--primary)'}" 
                            stroke="var(--border-color)" stroke-width="0.3"/>
                    <text x="${x}" y="${y}" 
                          text-anchor="middle" dominant-baseline="middle" 
                          fill="white" font-size="3" font-weight="600">
                        ${node.user ? node.user.avatar : '📝'}
                    </text>
                </g>
                
                <text x="${x}" y="${y + 7}" 
                      text-anchor="middle" 
                      fill="var(--text-primary)" font-size="1.5" font-weight="600">
                    ${this.escapeHtml(node.task.title).substring(0, 20)}
                </text>
                
                ${renderChildren(node.children, x, y)}
            `;
        };

        setTimeout(() => this.initNetworkControls(), 100);

        return `
            <div class="network-fullscreen">
                <div style="position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 10; text-align: center; background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
                    <h2 style="margin: 0 0 0.5rem 0;">🕸️ Task Network</h2>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
                        Scroll to zoom • Drag to pan • Click nodes to edit
                    </p>
                </div>

                <div style="position: absolute; top: 1rem; right: 1rem; z-index: 10; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="taskManager.networkZoom = 1; taskManager.networkPanX = 0; taskManager.networkPanY = 0; taskManager.renderTasks();" style="padding: 0.5rem 1rem;">
                        🔄 Reset View
                    </button>
                    <button class="btn btn-primary" onclick="document.getElementById('view-mode').value = 'card'; taskManager.currentView = 'card'; taskManager.renderTasks();" style="padding: 0.5rem 1rem;">
                        ✖️ Exit Network
                    </button>
                </div>
                
                <div class="network-container" id="network-container">
                    <svg id="network-svg" class="network-svg" viewBox="0 0 100 100" style="
                        width: 100%;
                        height: 100vh;
                        transform: translate(${this.networkPanX}px, ${this.networkPanY}px) scale(${this.networkZoom});
                        transform-origin: center;
                    ">
                        ${hierarchies.map((node, i) => renderNode(node, i, hierarchies.length)).join('')}
                    </svg>
                </div>

                <div style="position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 2rem; background: var(--bg-secondary); padding: 1rem 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 20px; height: 20px; background: var(--primary); border-radius: 50%;"></div>
                        <span style="font-size: 0.875rem;">Active</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 20px; height: 20px; background: var(--success); border-radius: 50%;"></div>
                        <span style="font-size: 0.875rem;">Completed</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 20px; height: 20px; background: var(--warning); border-radius: 50%;"></div>
                        <span style="font-size: 0.875rem;">Subtask</span>
                    </div>
                </div>
            </div>
        `;
    }

    initNetworkControls() {
        const container = document.getElementById('network-container');
        const svg = document.getElementById('network-svg');
        if (!container || !svg) return;

        let isDragging = false;
        let startX, startY;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - this.networkPanX;
            startY = e.clientY - this.networkPanY;
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            this.networkPanX = e.clientX - startX;
            this.networkPanY = e.clientY - startY;
            svg.style.transform = `translate(${this.networkPanX}px, ${this.networkPanY}px) scale(${this.networkZoom})`;
        });

        container.addEventListener('mouseup', () => {
            isDragging = false;
        });

        container.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.networkZoom = Math.max(0.2, Math.min(5, this.networkZoom * delta));
            svg.style.transform = `translate(${this.networkPanX}px, ${this.networkPanY}px) scale(${this.networkZoom})`;
        });
    }

    renderCardView(tasks) {
        const mainTasks = tasks.filter(t => !t.parent);

        return `
            <div class="card-view">
                ${mainTasks.map(task => this.renderTaskCard(task)).join('')}
            </div>
        `;
    }

    renderTaskCard(task) {
        const user = this.users.find(u => u.id === task.assignee);
        const allSubtasksData = this.getAllSubtasks(task.id);
        const completedSubtasks = allSubtasksData.filter(st => st.task.status === 'completed').length;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

        return `
            <div class="task-card ${task.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" 
                 data-priority="${task.priority}" 
                 data-id="${task.id}">
                <div class="task-header">
                    <div>
                        <div class="task-title">${this.escapeHtml(task.title)}</div>
                    </div>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                
                <div class="task-meta">
                    <div class="task-meta-item">
                        👤 ${user ? user.avatar + ' ' + user.name : 'Unassigned'}
                    </div>
                    ${task.dueDate ? `
                        <div class="task-meta-item ${isOverdue ? 'overdue-text' : ''}">
                            📅 ${this.formatDate(task.dueDate)} ${task.dueTime ? `at ${task.dueTime}` : ''}
                            ${isOverdue ? ' ⚠️ OVERDUE' : ''}
                        </div>
                    ` : ''}
                    <div class="task-meta-item">
                        <span class="task-status-badge status-${task.status}">
                            ${this.formatStatus(task.status)}
                        </span>
                    </div>
                </div>

                ${task.notes ? `
                    <div style="margin-top: 0.75rem; color: var(--text-secondary); font-size: 0.875rem;">
                        ${this.escapeHtml(task.notes).substring(0, 100)}${task.notes.length > 100 ? '...' : ''}
                    </div>
                ` : ''}

                ${task.tags && task.tags.length > 0 ? `
                    <div class="task-tags">
                        ${task.tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}

                ${allSubtasksData.length > 0 ? `
                    <div class="subtask-container" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <strong style="font-size: 0.875rem; color: var(--text-secondary);">📋 Subtasks (${completedSubtasks}/${allSubtasksData.length})</strong>
                        </div>
                        ${allSubtasksData.map(subtaskData => {
                            const subtask = subtaskData.task;
                            const indent = subtaskData.depth * 20; // 20px per level
                            return `
                            <div class="subtask-item" style="
                                display: flex;
                                align-items: center;
                                gap: 0.5rem;
                                padding: 0.5rem;
                                padding-left: ${0.5 + (indent / 16)}rem;
                                background: var(--bg-secondary);
                                border-radius: var(--radius-sm);
                                margin-bottom: 0.5rem;
                                margin-left: ${indent}px;
                                ${subtask.status === 'completed' ? 'opacity: 0.6;' : ''}
                            ">
                                ${subtaskData.depth > 0 ? '<span style="color: var(--text-secondary); margin-right: 0.25rem;">└─</span>' : ''}
                                <input type="checkbox" 
                                       ${subtask.status === 'completed' ? 'checked' : ''} 
                                       onchange="taskManager.completeTask('${subtask.id}')"
                                       style="cursor: pointer;">
                                <span style="flex: 1; font-size: 0.875rem; ${subtask.status === 'completed' ? 'text-decoration: line-through;' : ''}">
                                    ${this.escapeHtml(subtask.title)}
                                </span>
                                <button class="icon-btn" onclick="taskManager.createSubtask('${subtask.id}')" style="font-size: 0.7rem;" title="Add Subtask">➕</button>
                                <button class="icon-btn" onclick="taskManager.openTaskModal('${subtask.id}')" style="font-size: 0.75rem;" title="Edit">✏️</button>
                            </div>
                        `}).join('')}
                    </div>
                ` : ''}

                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary" style="flex: 1; padding: 0.5rem; min-width: 80px;" onclick="taskManager.openTaskModal('${task.id}')">
                        Edit
                    </button>
                    <button class="btn btn-secondary" style="padding: 0.5rem;" onclick="taskManager.createSubtask('${task.id}')" title="Create Subtask">
                        ➕ Subtask
                    </button>
                    <button class="btn ${task.status === 'completed' ? 'btn-secondary' : 'btn-primary'}" 
                            style="flex: 1; padding: 0.5rem; min-width: 80px;" 
                            onclick="taskManager.completeTask('${task.id}')">
                        ${task.status === 'completed' ? 'Undo' : 'Complete'}
                    </button>
                    <button class="btn btn-secondary" style="padding: 0.5rem;" onclick="taskManager.deleteTask('${task.id}')">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    renderTableView(tasks) {
        return `
            <div class="table-view">
                <table class="task-table">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Assigned To</th>
                            <th>Priority</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasks.map(task => this.renderTableRow(task)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderTableRow(task) {
        const user = this.users.find(u => u.id === task.assignee);
        const indent = task.parent ? '　'.repeat(this.getTaskDepth(task.id)) + '↳ ' : '';
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

        return `
            <tr data-id="${task.id}" class="${isOverdue ? 'overdue-row' : ''}">
                <td>${indent}${this.escapeHtml(task.title)}</td>
                <td>${user ? user.avatar + ' ' + user.name : 'Unassigned'}</td>
                <td><span class="task-priority priority-${task.priority}">${task.priority}</span></td>
                <td>${task.dueDate ? this.formatDate(task.dueDate) + (isOverdue ? ' ⚠️' : '') : '-'}</td>
                <td><span class="task-status-badge status-${task.status}">${this.formatStatus(task.status)}</span></td>
                <td>
                    <button class="icon-btn" onclick="taskManager.openTaskModal('${task.id}')" title="Edit">✏️</button>
                    <button class="icon-btn" onclick="taskManager.completeTask('${task.id}')" title="Toggle Complete">
                        ${task.status === 'completed' ? '↩️' : '✅'}
                    </button>
                    <button class="icon-btn" onclick="taskManager.deleteTask('${task.id}')" title="Delete">🗑️</button>
                </td>
            </tr>
        `;
    }

    renderCalendarView(tasks) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];

        let calendarHTML = `
            <div style="background: var(--bg-primary); border-radius: var(--radius-lg); padding: 1.5rem;">
                <h2 style="text-align: center; margin-bottom: 1.5rem;">${monthNames[month]} ${year}</h2>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-bottom: 0.5rem;">
                    <div style="text-align: center; font-weight: 600; padding: 0.5rem;">Sun</div>
                    <div style="text-align: center; font-weight: 600; padding: 0.5rem;">Mon</div>
                    <div style="text-align: center; font-weight: 600; padding: 0.5rem;">Tue</div>
                    <div style="text-align: center; font-weight: 600; padding: 0.5rem;">Wed</div>
                    <div style="text-align: center; font-weight: 600; padding: 0.5rem;">Thu</div>
                    <div style="text-align: center; font-weight: 600; padding: 0.5rem;">Fri</div>
                    <div style="text-align: center; font-weight: 600; padding: 0.5rem;">Sat</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">
        `;

        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div style="padding: 1rem; min-height: 80px;"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const isToday = date.toDateString() === now.toDateString();
            const hasOverdue = dayTasks.some(t => new Date(t.dueDate) < now && t.status !== 'completed');

            calendarHTML += `
                <div style="
                    padding: 0.5rem;
                    min-height: 80px;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-sm);
                    ${isToday ? 'border: 2px solid var(--accent-primary);' : ''}
                    ${hasOverdue ? 'border: 2px solid var(--danger);' : ''}
                ">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${day}</div>
                    ${dayTasks.slice(0, 2).map(task => {
                        const isOverdue = new Date(task.dueDate) < now && task.status !== 'completed';
                        return `
                        <div style="
                            font-size: 0.75rem;
                            padding: 0.25rem;
                            background: var(--bg-primary);
                            border-radius: 4px;
                            margin-bottom: 0.25rem;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            ${isOverdue ? 'border-left: 3px solid var(--danger);' : ''}
                        ">
                            ${this.escapeHtml(task.title)}
                        </div>
                    `}).join('')}
                    ${dayTasks.length > 2 ? `<div style="font-size: 0.75rem; color: var(--text-secondary);">+${dayTasks.length - 2} more</div>` : ''}
                </div>
            `;
        }

        calendarHTML += '</div></div>';
        return calendarHTML;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }

    formatStatus(status) {
        return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const taskManager = new TaskManager();

// Check for recurring tasks and auto-archive every hour
setInterval(() => {
    taskManager.checkRecurringTasks();
    taskManager.checkAutoArchive();
}, 60 * 60 * 1000);
