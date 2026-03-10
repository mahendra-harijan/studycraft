const profileForm = document.getElementById('profileForm');
const profileName = document.getElementById('profileName');
const profileAlert = document.getElementById('profileAlert');

const showProfileAlert = (type, message) => {
  profileAlert.className = `alert alert-${type}`;
  profileAlert.textContent = message;
  profileAlert.classList.remove('d-none');
};

const loadProfile = async () => {
  const response = await window.EngineerHub.requestJSON('/api/auth/me');
  profileName.value = response.data.fullName || '';
};

profileForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(profileForm);
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'csrf-token': window.EngineerHub.csrfToken },
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Profile update failed');
    showProfileAlert('success', 'Profile updated');
  } catch (error) {
    showProfileAlert('danger', error.message);
  }
});

loadProfile().catch(() => {});