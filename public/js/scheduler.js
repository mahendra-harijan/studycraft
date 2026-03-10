(() => {
  const scheduleForm = document.getElementById('scheduleForm');
  const scheduleTableBody = document.getElementById('scheduleTableBody');
  const dayFilter = document.getElementById('dayFilter');
  const submitBtn = document.getElementById('submitBtn');
  const alertContainer = document.getElementById('alertContainer');
  const totalClassesCount = document.getElementById('totalClassesCount');
  const weeklyClassesCount = document.getElementById('weeklyClassesCount');

  if (!scheduleForm || !scheduleTableBody || !window.EngineerHub?.requestJSON) {
    return;
  }

  let classes = [];
  let alertTimer = null;

  document.addEventListener('DOMContentLoaded', () => {
    bindFormSubmit();
    setupDayFilter();
    bindTableActions();
    loadClasses();
  });

  async function loadClasses() {
    try {
      const response = await window.EngineerHub.requestJSON('/api/schedules');
      classes = Array.isArray(response.data) ? response.data : [];
      updateStats();
      renderSchedule();
    } catch (error) {
      classes = [];
      updateStats();
      renderSchedule();
      showAlert('danger', getReadableError(error, 'Failed to load schedules.'));
    }
  }

  function bindFormSubmit() {
    scheduleForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      scheduleForm.classList.add('was-validated');

      if (!scheduleForm.checkValidity()) {
        showAlert('danger', 'Please fill all required fields correctly before saving schedule.');
        return;
      }

      const startTime = scheduleForm.startTime.value;
      const endTime = scheduleForm.endTime.value;

      if (endTime <= startTime) {
        showAlert('danger', 'End time must be after start time.');
        return;
      }

      const payload = {
        subject: scheduleForm.subject.value.trim(),
        venue: scheduleForm.venue.value.trim(),
        day: scheduleForm.day.value,
        startTime,
        endTime,
        weeklyRepeat: scheduleForm.weeklyRepeat.checked
      };

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';

      try {
        const result = await window.EngineerHub.requestJSON('/api/schedules', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        showAlert('success', result.message || 'Schedule saved successfully in database.');
        resetForm();
        await loadClasses();
      } catch (error) {
        showAlert('danger', getReadableError(error, 'Schedule was not saved. Please try again.'));
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Add to Schedule';
      }
    });
  }

  function setupDayFilter() {
    if (!dayFilter) return;
    dayFilter.addEventListener('change', () => {
      renderSchedule();
    });
  }

  function bindTableActions() {
    scheduleTableBody.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-delete-id]');
      if (!button) {
        return;
      }

      const scheduleId = button.getAttribute('data-delete-id');
      if (!scheduleId) {
        return;
      }

      const shouldDelete = await showDeleteConfirm('Are you sure you want to delete this class schedule?');
      if (!shouldDelete) {
        return;
      }

      button.disabled = true;
      const previousLabel = button.innerHTML;
      button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

      try {
        const result = await window.EngineerHub.requestJSON(`/api/schedules/${scheduleId}`, {
          method: 'DELETE'
        });
        showAlert('success', result.message || 'Schedule deleted successfully.');
        await loadClasses();
      } catch (error) {
        showAlert('danger', getReadableError(error, 'Failed to delete schedule.'));
      } finally {
        button.disabled = false;
        button.innerHTML = previousLabel;
      }
    });
  }

  function updateStats() {
    if (totalClassesCount) {
      totalClassesCount.textContent = String(classes.length);
    }
    if (weeklyClassesCount) {
      weeklyClassesCount.textContent = String(classes.filter((item) => item.weeklyRepeat).length);
    }
  }

  function renderSchedule() {
    const selectedDay = dayFilter ? dayFilter.value : '';
    const filteredClasses = selectedDay ? classes.filter((item) => item.day === selectedDay) : [...classes];

    if (!filteredClasses.length) {
      scheduleTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-5">
            <div class="empty-state">
              <i class="fas fa-calendar-plus fa-3x mb-3 text-muted"></i>
              <h6>No classes scheduled</h6>
              <p class="text-muted">Add your first class using the form above</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7
    };

    filteredClasses.sort((a, b) => {
      if (dayOrder[a.day] !== dayOrder[b.day]) {
        return dayOrder[a.day] - dayOrder[b.day];
      }
      return a.startTime.localeCompare(b.startTime);
    });

    scheduleTableBody.innerHTML = filteredClasses
      .map(
        (item) => `
          <tr>
            <td><strong>${escapeHtml(item.subject)}</strong></td>
            <td>${escapeHtml(item.day)}</td>
            <td>${formatTime(item.startTime)}</td>
            <td>${formatTime(item.endTime)}</td>
            <td>${escapeHtml(item.venue)}</td>
            <td>
              <button type="button" class="btn btn-sm btn-outline-danger" data-delete-id="${escapeHtml(item.id)}">
                <i class="fas fa-trash-alt me-1"></i>Delete
              </button>
            </td>
          </tr>
        `
      )
      .join('');
  }

  function formatTime(value) {
    return value || '';
  }

  function resetForm() {
    scheduleForm.reset();
    scheduleForm.weeklyRepeat.checked = true;
    scheduleForm.classList.remove('was-validated');
  }

  window.resetForm = resetForm;

  function showAlert(type, message) {
    if (!alertContainer) return;

    if (alertTimer) {
      clearTimeout(alertTimer);
      alertTimer = null;
    }

    alertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    alertTimer = setTimeout(() => {
      alertContainer.innerHTML = '';
      alertTimer = null;
    }, 5000);
  }

  function showDeleteConfirm(message) {
    return new Promise((resolve) => {
      const modalElement = getDeleteModalElement();
      const messageNode = modalElement.querySelector('[data-delete-confirm-message]');
      const confirmBtn = modalElement.querySelector('[data-delete-confirm-btn]');
      const instance = new window.bootstrap.Modal(modalElement);

      messageNode.textContent = message;

      let resolved = false;

      const cleanup = () => {
        confirmBtn.removeEventListener('click', onConfirm);
        modalElement.removeEventListener('hidden.bs.modal', onHidden);
      };

      const onConfirm = () => {
        resolved = true;
        cleanup();
        instance.hide();
        resolve(true);
      };

      const onHidden = () => {
        if (!resolved) {
          cleanup();
          resolve(false);
        }
      };

      confirmBtn.addEventListener('click', onConfirm);
      modalElement.addEventListener('hidden.bs.modal', onHidden);
      instance.show();
    });
  }

  function getDeleteModalElement() {
    const existing = document.getElementById('scheduleDeleteConfirmModal');
    if (existing) {
      return existing;
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="modal fade" id="scheduleDeleteConfirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><i class="fas fa-shield-alt me-2 text-danger"></i>Confirm Delete</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0" data-delete-confirm-message></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" data-delete-confirm-btn>Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper.firstElementChild);
    return document.getElementById('scheduleDeleteConfirmModal');
  }

  function getReadableError(error, fallbackMessage) {
    if (error?.message && typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
    return fallbackMessage;
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();