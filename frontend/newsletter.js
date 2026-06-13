let currentEmail = '';
let captchaAnswer = 0;

// Email regex validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Modal controls
function openSubscribeModal() {
  document.getElementById('subscribeModal').classList.add('active');
  document.getElementById('emailInput').focus();
}

function closeSubscribeModal() {
  document.getElementById('subscribeModal').classList.remove('active');
  resetForm();
}

function resetForm() {
  document.getElementById('emailInput').value = '';
  document.getElementById('emailError').className = 'error-message';
  document.getElementById('emailValidation').className = 'validation-message';
  document.getElementById('successMessage').style.display = 'none';
  document.getElementById('subscribeBtn').textContent = 'Subscribe';
  document.getElementById('subscribeBtn').disabled = false;
}

// Real-time email validation
function validateEmailRealTime() {
  const email = document.getElementById('emailInput').value.trim();
  const errorDiv = document.getElementById('emailError');
  const validationDiv = document.getElementById('emailValidation');
  const subscribeBtn = document.getElementById('subscribeBtn');

  errorDiv.className = 'error-message';
  validationDiv.className = 'validation-message';

  if (!email) {
    subscribeBtn.disabled = true;
    return;
  }

  // Basic format check
  const isValidFormat = emailRegex.test(email);
  const hasNoConsecutiveDots = !email.includes('..');
  const notStartsOrEndsWithDot = !email.startsWith('.') && !email.endsWith('.');
  const validLength = email.length > 5 && email.length < 254;
  const hasValidLocalPart = email.split('@')[0].length > 0 && email.split('@')[0].length < 64;
  const hasSingleAtSign = (email.match(/@/g) || []).length === 1;

  const isValid = isValidFormat && hasNoConsecutiveDots && notStartsOrEndsWithDot && validLength && hasValidLocalPart && hasSingleAtSign;

  if (!isValid && email.length > 3) {
    errorDiv.textContent = '❌ Invalid email format';
    errorDiv.classList.add('show');
    subscribeBtn.disabled = true;
  } else if (isValid) {
    validationDiv.textContent = '✓ Email looks good!';
    validationDiv.classList.add('valid');
    subscribeBtn.disabled = false;
  } else {
    subscribeBtn.disabled = true;
  }
}

// Generate CAPTCHA
function generateCaptcha() {
  // Generate random math problem (addition, subtraction, or multiplication)
  const operations = ['+', '-', '×'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let a, b, answer;
  
  if (operation === '+') {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    answer = a + b;
  } else if (operation === '-') {
    a = Math.floor(Math.random() * 20) + 10;
    b = Math.floor(Math.random() * a);
    answer = a - b;
  } else { // multiplication
    a = Math.floor(Math.random() * 12) + 1;
    b = Math.floor(Math.random() * 12) + 1;
    answer = a * b;
  }
  
  captchaAnswer = answer;
  document.getElementById('captchaQuestion').textContent = `${a} ${operation} ${b} = ?`;
  document.getElementById('captchaAnswer').value = '';
  document.getElementById('captchaAnswer').placeholder = 'Type your answer';
  document.getElementById('captchaError').className = 'error-message';
}

// Submit subscription - show CAPTCHA after email validation
function submitSubscription() {
  const email = document.getElementById('emailInput').value.trim();
  const errorDiv = document.getElementById('emailError');

  // Final validation
  const isValidFormat = emailRegex.test(email);
  const hasNoConsecutiveDots = !email.includes('..');
  const notStartsOrEndsWithDot = !email.startsWith('.') && !email.endsWith('.');
  const validLength = email.length > 5 && email.length < 254;
  const hasValidLocalPart = email.split('@')[0].length > 0 && email.split('@')[0].length < 64;
  const hasSingleAtSign = (email.match(/@/g) || []).length === 1;

  const isValid = isValidFormat && hasNoConsecutiveDots && notStartsOrEndsWithDot && validLength && hasValidLocalPart && hasSingleAtSign;

  if (!isValid) {
    errorDiv.textContent = '❌ Please enter a valid email address';
    errorDiv.classList.add('show');
    return;
  }

  currentEmail = email;
  
  // Close email modal and show CAPTCHA modal
  document.getElementById('subscribeModal').classList.remove('active');
  generateCaptcha();
  document.getElementById('captchaModal').classList.add('active');
  document.getElementById('captchaAnswer').focus();
}

// Verify CAPTCHA and submit to backend
async function verifyCaptcha() {
  const answer = Number(document.getElementById('captchaAnswer').value);
  const errorDiv = document.getElementById('captchaError');
  const verifyBtn = document.getElementById('verifyCaptchaBtn');

  if (!answer || answer !== captchaAnswer) {
    errorDiv.textContent = '❌ Incorrect answer. Try again!';
    errorDiv.classList.add('show');
    return;
  }

  // CAPTCHA verified - now submit to backend
  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verifying...';

  try {
    console.log('CAPTCHA verified. Sending subscription request for:', currentEmail);
    const response = await fetch(`${API_BASE_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentEmail })
    });

    const data = await response.json();
    console.log('Response:', data);

    // Close CAPTCHA modal
    document.getElementById('captchaModal').classList.remove('active');

    // Show success modal
    document.getElementById('subscribeModal').classList.add('active');
    const successDiv = document.getElementById('successMessage');
    successDiv.style.display = 'block';
    const subscribeBtn = document.getElementById('subscribeBtn');
    subscribeBtn.textContent = '✓ Subscribed!';
    subscribeBtn.disabled = true;

    if (!data.success) {
      const errorDiv2 = document.getElementById('emailError');
      errorDiv2.textContent = '⚠️ ' + (data.message || 'Subscription failed. Try again.');
      errorDiv2.classList.add('show');
    }

    // Auto-close after 2 seconds
    setTimeout(() => {
      closeSubscribeModal();
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify';
    }, 2000);
  } catch (error) {
    console.error('Error:', error);
    const errorDiv2 = document.getElementById('emailError');
    errorDiv2.textContent = '❌ Network error. Please try again.';
    errorDiv2.classList.add('show');
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verify';
  }
}

function closeCaptchaModal() {
  document.getElementById('captchaModal').classList.remove('active');
  // Show email modal again
  document.getElementById('subscribeModal').classList.add('active');
  document.getElementById('emailInput').focus();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('subscribeModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeSubscribeModal();
      }
    });
  }

  const captchaModal = document.getElementById('captchaModal');
  if (captchaModal) {
    captchaModal.addEventListener('click', function(e) {
      if (e.target === captchaModal) {
        closeCaptchaModal();
      }
    });
  }

  // Mobile menu toggle
  window.toggleMenu = function() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.toggle('open');
    }
  };

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    const nav = document.querySelector('.navbar');
    if (nav && !nav.contains(e.target)) {
      const menu = document.getElementById('mobile-menu');
      if (menu) {
        menu.classList.remove('open');
      }
    }
  });

  // Scroll reveal observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
