document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contactForm');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      orderId: form.orderId.value.trim(),
      message: form.message.value.trim()
    };

    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(payload) });
      toast('Message sent');
      form.reset();
    } catch (err) {
      toast(err.message || 'Failed');
    }
  };
});
