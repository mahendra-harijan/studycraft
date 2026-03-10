const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'UCArpK50AMWN8hVjB',
  SERVICE_ID: 'service_jc26cuj',
  TEMPLATE_ID: 'template_gdxownv',
  RECIPIENT_EMAIL: 'mahendra201118@gmail.com'
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loadEmailJs() {
  return new Promise((resolve, reject) => {
    if (typeof window.emailjs !== 'undefined') {
      resolve(window.emailjs);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => resolve(window.emailjs);
    script.onerror = () => reject(new Error('Could not load EmailJS SDK.'));
    document.head.appendChild(script);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('contact-form');
  if (!form) {
    return;
  }

  const flashBox = document.getElementById('contact-flash');
  const flashText = document.getElementById('contact-flash-text');
  const flashCloseBtn = document.getElementById('contact-flash-close');
  const flashActions = document.getElementById('contact-flash-actions');
  const flashActionBtn = document.getElementById('contact-flash-action-btn');
  const successPanel = document.getElementById('contact-success-panel');
  const sendAnotherBtn = document.getElementById('contact-send-another-btn');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = submitBtn.querySelector('.submit-text');
  const loadingSpinner = submitBtn.querySelector('.loading-spinner');
  const messageField = document.getElementById('message');
  const charCount = document.getElementById('char-count');

  let emailClient;
  let flashTimer;
  let currentFlashType = 'info';

  const showFlash = (message, type) => {
    if (!flashBox) {
      return;
    }

    currentFlashType = type;
    flashBox.className = `alert alert-${type}`;
    if (flashText) {
      flashText.textContent = message;
    }

    if (flashActions && flashActionBtn) {
      if (type === 'warning' || type === 'danger') {
        flashActions.classList.remove('d-none');
        flashActionBtn.textContent = 'Try Again';
      } else {
        flashActions.classList.add('d-none');
      }
    }

    flashBox.classList.remove('d-none');

    if (flashTimer) {
      clearTimeout(flashTimer);
    }

    flashTimer = setTimeout(() => {
      flashBox.classList.add('d-none');
    }, 5000);
  };

  const hideFlash = () => {
    if (!flashBox) return;
    flashBox.classList.add('d-none');
  };

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    submitText.classList.toggle('d-none', loading);
    loadingSpinner.classList.toggle('d-none', !loading);
  };

  const showFieldError = (fieldId, message) => {
    const input = document.getElementById(fieldId);
    const feedback = document.getElementById(`${fieldId}-error`);
    if (!input || !feedback) return;
    input.classList.add('is-invalid');
    feedback.textContent = message;
  };

  const validate = () => {
    let valid = true;

    document.querySelectorAll('#contact-form .form-control').forEach((field) => {
      field.classList.remove('is-invalid');
    });

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = messageField.value.trim();

    if (name.length < 2) {
      valid = false;
      showFieldError('name', 'Name must be at least 2 characters.');
    }

    if (!emailRegex.test(email)) {
      valid = false;
      showFieldError('email', 'Please enter a valid email address.');
    }

    if (subject.length < 3) {
      valid = false;
      showFieldError('subject', 'Subject must be at least 3 characters.');
    }

    if (message.length < 10 || message.length > 500) {
      valid = false;
      showFieldError('message', 'Message must be between 10 and 500 characters.');
    }

    return valid;
  };

  try {
    emailClient = await loadEmailJs();
    emailClient.init(EMAILJS_CONFIG.PUBLIC_KEY);
  } catch (error) {
    showFlash('Email service could not start. Please refresh and try again.', 'danger');
    return;
  }

  messageField.addEventListener('input', () => {
    const count = messageField.value.length;
    charCount.textContent = String(count);
  });

  document.querySelectorAll('#contact-form input, #contact-form textarea').forEach((input) => {
    input.addEventListener('input', function onInput() {
      this.classList.remove('is-invalid');
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validate()) {
      showFlash('Please correct highlighted fields.', 'warning');
      return;
    }

    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: messageField.value.trim()
    };

    setLoading(true);

    try {
      await emailClient.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
          reply_to: formData.email,
          date: new Date().toLocaleString('en-IN')
        }
      );

      showFlash('Message sent successfully.', 'success');
      form.classList.add('d-none');
      if (successPanel) {
        successPanel.classList.remove('d-none');
      }
    } catch (error) {
      const reason = typeof error?.text === 'string' && error.text.trim().length > 0
        ? error.text
        : 'Failed to send email. Please try again.';
      showFlash(`Send failed: ${reason}`, 'danger');
    } finally {
      setLoading(false);
    }
  });

  if (flashCloseBtn) {
    flashCloseBtn.addEventListener('click', hideFlash);
  }

  if (flashActionBtn) {
    flashActionBtn.addEventListener('click', () => {
      hideFlash();
      document.getElementById('name')?.focus();
    });
  }

  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', () => {
      form.reset();
      form.classList.remove('d-none');
      if (successPanel) {
        successPanel.classList.add('d-none');
      }
      charCount.textContent = '0';
      hideFlash();
      document.getElementById('name')?.focus();
    });
  }
});
