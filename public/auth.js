function bindAuthForm(formId, mode) {
  const form = document.querySelector(formId);
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const url = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      await api(url, { method: 'POST', body: JSON.stringify({ email, password }) });
      toast(mode === 'register' ? 'Account created' : 'Logged in');
      location.href = '/shop';
    } catch (err) {
      toast(err.message || 'Failed');
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  bindAuthForm('#loginForm', 'login');
  bindAuthForm('#registerForm', 'register');
});
