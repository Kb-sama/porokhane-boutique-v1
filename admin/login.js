const form = document.getElementById('login-form');
const message = document.getElementById('message');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: data.get('email'),
            password: data.get('password')
        })
    });
    const result = await response.json();
    if (result.success) window.location.href = '/admin/dashboard.html';
    else message.textContent = result.error || 'Échec de connexion';
});
