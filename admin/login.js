const form = document.getElementById('login-form');
const message = document.getElementById('message');
const lockoutTimer = document.getElementById('lockout-timer');

let countdownInterval = null;

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function setFormDisabled(disabled) {
    form.querySelectorAll('input, button').forEach((element) => {
        element.disabled = disabled;
    });
}

function formatDuration(seconds) {
    const safeSeconds = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function startLockoutCountdown(durationSeconds = 15 * 60) {
    stopCountdown();
    setFormDisabled(true);

    const endTime = Date.now() + durationSeconds * 1000;
    message.textContent = 'Trop de tentatives. Veuillez attendre avant de réessayer.';

    const updateTimer = () => {
        const remainingSeconds = Math.max(0, (endTime - Date.now()) / 1000);
        lockoutTimer.textContent = `Réessayez dans ${formatDuration(remainingSeconds)}.`;

        if (remainingSeconds <= 0) {
            stopCountdown();
            setFormDisabled(false);
            message.textContent = '';
            lockoutTimer.textContent = '';
        }
    };

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    stopCountdown();
    setFormDisabled(false);

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

    if (result.success) {
        window.location.href = '/admin/dashboard.html';
        return;
    }

    message.textContent = result.error || 'Échec de connexion';

    if (response.status === 429) {
        const retryAfter = Number(response.headers.get('Retry-After'));
        startLockoutCountdown(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 15 * 60);
    }
});
