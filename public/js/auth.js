const alertBox = document.getElementById('authAlert');

const showAlert = (type, message) => {
  if (!alertBox) return;
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
};

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      email: loginForm.email.value,
      password: loginForm.password.value
    };
    try {
      await window.EngineerHub.requestJSON('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      window.location.href = '/dashboard';
    } catch (error) {
      showAlert('danger', error.message);
    }
  });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      fullName: signupForm.fullName.value,
      email: signupForm.email.value,
      password: signupForm.password.value
    };
    try {
      await window.EngineerHub.requestJSON('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      window.location.href = '/dashboard';
    } catch (error) {
      showAlert('danger', error.message);
    }
  });
}