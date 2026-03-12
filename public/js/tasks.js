// Task Management System - Fetch from Database
console.log('%c✅ TASKS.JS LOADED', 'background: #32cd32; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;');

(() => {
  'use strict';
  
  let allTasks = [];
  let isInitialized = false;
  let csrfToken = '';

  // Get CSRF token from meta tag
  function getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : '';
  }

  // Initialize when DOM is ready
  function initialize() {
    if (isInitialized) return;
    isInitialized = true;
    
    csrfToken = getCsrfToken();
    console.log('%c✅ INITIALIZING...', 'background: #32cd32; color: white; padding: 4px 8px; border-radius: 3px;');
    console.log('CSRF Token:', csrfToken ? '✓ Found' : '✗ Not found');
    
    loadTasks();
    attachEventListeners();
    setDefaultDates();
    
    console.log('%c✅ INITIALIZATION COMPLETE', 'background: #32cd32; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;');
  }

  // Check if document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // ============================================
  // LOAD TASKS FROM DATABASE API
  // ============================================
  async function loadTasks() {
    const loadingState = document.getElementById('loadingState');
    const tableContainer = document.getElementById('tasksTableContainer');
    const emptyState = document.getElementById('emptyState');

    if (loadingState) loadingState.style.display = 'block';
    if (tableContainer) tableContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';

    try {
      const response = await requestApi('/api/tasks');
      allTasks = Array.isArray(response?.data) ? response.data : [];
      console.log('✅ Loaded', allTasks.length, 'tasks from database');

      renderTable(allTasks);
      updateStats(allTasks);

      if (loadingState) loadingState.style.display = 'none';
      if (tableContainer) tableContainer.style.display = allTasks.length ? 'block' : 'none';
      if (emptyState) emptyState.style.display = allTasks.length ? 'none' : 'block';
    } catch (err) {
      console.error('❌ Error loading tasks:', err);
      showError('Error loading tasks: ' + (err.message || 'Unknown error'));
      if (loadingState) loadingState.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
    }
  }

  // ============================================
  // RENDER TABLE
  // ============================================
  function renderTable(tasks) {
    const tbody = document.getElementById('tasksTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (tasks.length === 0) {
      const tableContainer = document.getElementById('tasksTableContainer');
      const emptyState = document.getElementById('emptyState');
      if (tableContainer) tableContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    tasks.forEach(task => {
      const row = createTableRow(task);
      tbody.appendChild(row);
    });

    console.log('✅ Rendered', tasks.length, 'tasks in table');
  }

  // ============================================
  // CREATE TABLE ROW
  // ============================================
  function createTableRow(task) {
    const row = document.createElement('tr');
    
    const deadline = new Date(task.deadline);
    const now = new Date();
    const isOverdue = !task.completed && deadline < now;
    
    const statusBadge = task.completed 
      ? '<span class="badge bg-success">Completed</span>' 
      : isOverdue 
        ? '<span class="badge bg-danger">Overdue</span>' 
        : '<span class="badge bg-warning">Pending</span>';

    const priorityColor = task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success';
    const priorityBadge = `<span class="badge bg-${priorityColor}">${task.priority}</span>`;

    const safeTitle = escapeHtml(task.title);
    const safeDesc = escapeHtml((task.description || 'N/A').substring(0, 50));
    const formattedDeadline = formatDate(task.deadline);

    row.innerHTML = `
      <td>${statusBadge}</td>
      <td><strong>${safeTitle}</strong></td>
      <td>${safeDesc}</td>
      <td>${priorityBadge}</td>
      <td>${formattedDeadline}</td>
      <td>
        <button class="btn btn-sm btn-info task-view" data-task-id="${task.id}" title="View">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-primary task-edit" data-task-id="${task.id}" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        ${!task.completed ? `
          <button class="btn btn-sm btn-success task-complete" data-task-id="${task.id}" title="Mark as Complete">
            <i class="fas fa-check"></i>
          </button>
        ` : ''}
        <button class="btn btn-sm btn-danger task-delete" data-task-id="${task.id}" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    return row;
  }

  // ============================================
  // ATTACH EVENT LISTENERS
  // ============================================
  function attachEventListeners() {
    // Form submit
    const form = document.getElementById('taskForm');
    if (form) form.addEventListener('submit', handleSubmit);

    // Buttons
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetForm);

    const updateBtn = document.getElementById('updateTaskBtn');
    if (updateBtn) updateBtn.addEventListener('click', updateTask);

    const deleteBtn = document.getElementById('confirmDeleteBtn');
    if (deleteBtn) deleteBtn.addEventListener('click', deleteTask);

    // Filters
    const priorityFilter = document.getElementById('priorityFilter');
    if (priorityFilter) priorityFilter.addEventListener('change', filterTasks);

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.addEventListener('change', filterTasks);

    const clearBtn = document.getElementById('clearFiltersBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);

    // Task action buttons (delegated)
    document.addEventListener('click', e => {
      const taskId = e.target.closest('button[data-task-id]')?.getAttribute('data-task-id');
      if (!taskId) return;

      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;

      if (e.target.closest('.task-view')) {
        console.log('✅ View clicked for task:', taskId);
        viewTask(task);
      } else if (e.target.closest('.task-edit')) {
        console.log('✅ Edit clicked for task:', taskId);
        editTask(task);
      } else if (e.target.closest('.task-complete')) {
        console.log('✅ Complete clicked for task:', taskId);
        completeTask(task);
      } else if (e.target.closest('.task-delete')) {
        console.log('✅ Delete clicked for task:', taskId);
        showDeleteModal(task);
      }
    });
  }

  // ============================================
  // FORM HANDLERS
  // ============================================
  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';

    const taskData = {
      title: document.getElementById('title').value,
      priority: document.getElementById('priority').value,
      description: document.getElementById('description').value,
      deadline: toISOString(new Date(document.getElementById('deadline').value)),
      reminderAt: toISOString(new Date(document.getElementById('reminderAt').value))
    };

    try {
      const response = await requestApi('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
      console.log('✅ Task added:', response?.data?.id);
      showAlert('success', 'Task added successfully!');
      resetForm();
      await loadTasks();
    } catch (err) {
      console.error('❌ Error adding task:', err);
      showError('Error adding task: ' + (err.message || 'Unknown error'));
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Add to Tasks';
    }
  }

  function resetForm() {
    const form = document.getElementById('taskForm');
    if (form) {
      form.reset();
      form.classList.remove('was-validated');
    }
    setDefaultDates();
  }

  function setDefaultDates() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);

    const reminder = new Date(tomorrow);
    reminder.setHours(reminder.getHours() - 1);

    const deadlineInput = document.getElementById('deadline');
    const reminderInput = document.getElementById('reminderAt');

    if (deadlineInput) deadlineInput.value = toDatetimeLocal(tomorrow);
    if (reminderInput) reminderInput.value = toDatetimeLocal(reminder);
  }

  // ============================================
  // TASK ACTIONS
  // ============================================
  function viewTask(task) {
    const modal = document.getElementById('viewTaskModal');
    if (!modal) return;

    document.getElementById('viewTaskTitle').textContent = task.title;
    document.getElementById('viewTaskDescription').textContent = task.description || 'N/A';
    document.getElementById('viewTaskPriority').innerHTML = `<span class="badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}">${task.priority}</span>`;
    document.getElementById('viewTaskStatus').textContent = task.completed ? 'Completed' : 'Pending';
    document.getElementById('viewTaskDeadline').textContent = formatDate(task.deadline);
    document.getElementById('viewTaskReminder').textContent = formatTime(task.reminderAt);
    document.getElementById('viewTaskCreated').textContent = formatDate(task.createdAt || new Date());
    document.getElementById('viewTaskUpdated').textContent = formatDate(task.updatedAt || new Date());

    if (window.bootstrap?.Modal) new window.bootstrap.Modal(modal).show();
  }

  function editTask(task) {
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editPriority').value = task.priority;
    document.getElementById('editDescription').value = task.description || '';
    document.getElementById('editDeadline').value = toDatetimeLocalSafe(task.deadline);
    document.getElementById('editReminder').value = toDatetimeLocalSafe(task.reminderAt);
    document.getElementById('editStatus').value = task.completed ? 'completed' : 'pending';

    const modal = document.getElementById('editTaskModal');
    if (modal && window.bootstrap?.Modal) new window.bootstrap.Modal(modal).show();
  }

  async function updateTask() {
    const taskId = document.getElementById('editTaskId').value;
    const taskData = {
      title: document.getElementById('editTitle').value,
      priority: document.getElementById('editPriority').value,
      description: document.getElementById('editDescription').value,
      deadline: toISOString(new Date(document.getElementById('editDeadline').value)),
      reminderAt: toISOString(new Date(document.getElementById('editReminder').value)),
      completed: document.getElementById('editStatus').value === 'completed'
    };

    try {
      await requestApi(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
      });
      console.log('✅ Task updated:', taskId);

      const modal = document.getElementById('editTaskModal');
      if (modal && window.bootstrap) window.bootstrap.Modal.getInstance(modal)?.hide();

      showAlert('success', 'Task updated successfully');
      await loadTasks();
    } catch (err) {
      console.error('❌ Error updating task:', err);
      showError('Error updating task: ' + (err.message || 'Unknown error'));
    }
  }

  async function completeTask(task) {
    try {
      await requestApi(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: true })
      });
      console.log('✅ Task completed:', task.id);
      showAlert('success', 'Task marked as completed!');
      await loadTasks();
    } catch (err) {
      console.error('❌ Error completing task:', err);
      showError('Error completing task: ' + (err.message || 'Unknown error'));
    }
  }

  function showDeleteModal(task) {
    document.getElementById('deleteTaskId').value = task.id;
    const modal = document.getElementById('deleteTaskModal');
    if (modal && window.bootstrap?.Modal) new window.bootstrap.Modal(modal).show();
  }

  async function deleteTask() {
    const taskId = document.getElementById('deleteTaskId').value;

    try {
      await requestApi(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      console.log('✅ Task deleted:', taskId);

      const modal = document.getElementById('deleteTaskModal');
      if (modal && window.bootstrap) window.bootstrap.Modal.getInstance(modal)?.hide();

      showAlert('success', 'Task deleted successfully');
      await loadTasks();
    } catch (err) {
      console.error('❌ Error deleting task:', err);
      showError('Error deleting task: ' + (err.message || 'Unknown error'));
    }
  }

  // ============================================
  // FILTER
  // ============================================
  function filterTasks() {
    const priority = document.getElementById('priorityFilter').value;
    const status = document.getElementById('statusFilter').value;

    const filtered = allTasks.filter(task => {
      const pMatch = priority === 'all' || task.priority === priority;
      
      let sMatch = true;
      if (status !== 'all') {
        const deadline = new Date(task.deadline);
        const now = new Date();
        const isOverdue = !task.completed && deadline < now;
        
        if (status === 'completed') {
          sMatch = task.completed;
        } else if (status === 'pending') {
          sMatch = !task.completed && !isOverdue;
        } else if (status === 'overdue') {
          sMatch = isOverdue;
        } else if (status === 'in-progress') {
          sMatch = !task.completed && !isOverdue;
        }
      }
      
      return pMatch && sMatch;
    });

    renderTable(filtered);
    updateStats(filtered);
  }

  function clearFilters() {
    document.getElementById('priorityFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    renderTable(allTasks);
    updateStats(allTasks);
  }

  // ============================================
  // UTILITIES
  // ============================================
  function updateStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;

    const totalEl = document.getElementById('totalTasksCount');
    const completedEl = document.getElementById('completedCount');
    const pendingEl = document.getElementById('pendingCount');

    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (pendingEl) pendingEl.textContent = pending;
  }

  function showAlert(type, message) {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const html = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    container.innerHTML = html;
    setTimeout(() => { container.innerHTML = ''; }, 5000);
  }

  function showError(message) {
    showAlert('danger', message);
  }

  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  function formatTime(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  function toDatetimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function toISOString(date) {
    // Convert local datetime to ISO string (UTC) for API
    // This ensures server receives UTC time regardless of browser timezone
    return date.toISOString();
  }

  function toDatetimeLocalSafe(dateInput) {
    if (!dateInput) return '';
    const parsed = new Date(dateInput);
    if (Number.isNaN(parsed.getTime())) return '';
    return toDatetimeLocal(parsed);
  }

  async function requestApi(url, options = {}) {
    if (window.EngineerHub?.requestJSON) {
      return window.EngineerHub.requestJSON(url, options);
    }

    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'csrf-token': csrfToken,
        ...(options.headers || {})
      },
      ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || 'Request failed');
    }
    return payload;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
