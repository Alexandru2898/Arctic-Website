// PAROLA ADMIN
const ADMIN_PASSWORD = "arctic2026";

// 1. PARTICULE CANVAS BACKGROUND
const canvas = document.getElementById('particles-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = `rgba(0, 178, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < 60; i++) particlesArray.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    }
    initParticles();
    animateParticles();
}

// 2. PRELOADER
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }
});

// 3. TOAST NOTIFICATION
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (toast && toastMsg) {
        toastMsg.innerText = msg;
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 4000);
    }
}

// 4. BUTON MUTE / UNMUTE AUDIO
const audioToggleBtn = document.getElementById('audio-toggle');
const ambientAudio = document.getElementById('ambient-audio');

if (audioToggleBtn && ambientAudio) {
    audioToggleBtn.addEventListener('click', () => {
        if (ambientAudio.paused) {
            ambientAudio.play().then(() => {
                audioToggleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                showToast("Muzică pornită!");
            }).catch(() => {
                showToast("Apasă din nou pentru muzică!");
            });
        } else {
            ambientAudio.pause();
            audioToggleBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            showToast("Muzică oprită!");
        }
    });
}

// 5. FAQ ACCORDION
window.toggleFaq = function(element) {
    const item = element.parentElement;
    if (item) {
        item.classList.toggle('open');
    }
};

// 6. SCHIMBARE TAB-URI (Unban / Unblacklist)
window.switchSupportTab = function(type) {
    const btnUnban = document.getElementById('unbanTabBtn');
    const btnUnbl = document.getElementById('unblTabBtn');
    const formUnban = document.getElementById('unbanForm');
    const formUnbl = document.getElementById('unblacklistForm');

    if (type === 'unban') {
        if (btnUnban) btnUnban.classList.add('active');
        if (btnUnbl) btnUnbl.classList.remove('active');
        if (formUnban) formUnban.style.display = 'block';
        if (formUnbl) formUnbl.style.display = 'none';
    } else {
        if (btnUnbl) btnUnbl.classList.add('active');
        if (btnUnban) btnUnban.classList.remove('active');
        if (formUnbl) formUnbl.style.display = 'block';
        if (formUnban) formUnban.style.display = 'none';
    }
};

// 7. MODAL CONFIGURARE ADMIN (🔒)
const configBtn = document.getElementById('open-config');
const closeBtn = document.getElementById('closeConfig');
const modal = document.getElementById('configModal');

if (configBtn && modal) {
    configBtn.onclick = () => {
        const authStep = document.getElementById('authStep');
        const settingsStep = document.getElementById('settingsStep');
        const passInput = document.getElementById('adminPassInput');

        if (authStep) authStep.style.display = 'block';
        if (settingsStep) settingsStep.style.display = 'none';
        if (passInput) passInput.value = '';
        modal.classList.add('active');
    };
}

if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.remove('active');
}

window.checkAdminPassword = function() {
    const passInput = document.getElementById('adminPassInput');
    if (passInput && passInput.value === ADMIN_PASSWORD) {
        document.getElementById('authStep').style.display = 'none';
        document.getElementById('settingsStep').style.display = 'block';
        document.getElementById('wh_staff_input').value = localStorage.getItem('backend_url') || 'http://localhost:3000/api/apply';
        showToast("Acces permis!");
    } else {
        showToast("Parolă incorectă!");
    }
};

window.saveWebhooksSetting = function() {
    const backendUrl = document.getElementById('wh_staff_input').value.trim();
    if (backendUrl) localStorage.setItem('backend_url', backendUrl);
    if (modal) modal.classList.remove('active');
    showToast("Setările au fost salvate!");
};

// 8. TRIMITERE APLICAȚIE STAFF
const staffForm = document.getElementById('staffApplyForm');
if (staffForm) {
    staffForm.onsubmit = async (e) => {
        e.preventDefault();
        const backendUrl = localStorage.getItem('backend_url') || 'http://localhost:3000/api/apply';

        const formData = {
            discordId: document.getElementById('st_discord_id').value.trim(),
            q1: document.getElementById('st_q1').value,
            q2: document.getElementById('st_q2').value,
            q3: document.getElementById('st_q3').value,
            q4: document.getElementById('st_q4').value,
            q5: document.getElementById('st_q5').value,
            q6: document.getElementById('st_q6').value,
            q7: document.getElementById('st_q7').value,
            q8: document.getElementById('st_q8').value,
            q9: document.getElementById('st_q9').value,
            q10: document.getElementById('st_q10').value,
            q11: document.getElementById('st_q11').value,
            q12: document.getElementById('st_q12').value
        };

        try {
            showToast("Se trimite aplicația...");
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast("Aplicația de Staff a fost trimisă cu succes!");
                staffForm.reset();
            } else {
                showToast("Eroare: Botul nu este pornit pe portul 3000!");
            }
        } catch (err) {
            console.error(err);
            showToast("Eroare de conexiune cu botul!");
        }
    };
}

// 9. TRIMITERE UNBAN
const unbanForm = document.getElementById('unbanForm');
if (unbanForm) {
    unbanForm.onsubmit = async (e) => {
        e.preventDefault();
        const applyUrl = localStorage.getItem('backend_url') || 'http://localhost:3000/api/apply';
        const unbanUrl = applyUrl.replace('/apply', '/unban');

        const formData = {
            discordId: document.getElementById('ub_q1').value.trim(),
            q1: document.getElementById('ub_q1').value,
            q2: document.getElementById('ub_q2').value,
            q3: document.getElementById('ub_q3').value,
            q4: document.getElementById('ub_q4').value || "Niciuna"
        };

        try {
            showToast("Se trimite cererea de unban...");
            const response = await fetch(unbanUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast("Cererea de Unban a fost trimisă!");
                unbanForm.reset();
            } else {
                showToast("Eroare la trimiterea cererii de unban!");
            }
        } catch (err) {
            console.error(err);
            showToast("Eroare de conexiune cu botul!");
        }
    };
}

// 10. TRIMITERE UNBLACKLIST
const unblacklistForm = document.getElementById('unblacklistForm');
if (unblacklistForm) {
    unblacklistForm.onsubmit = async (e) => {
        e.preventDefault();
        const applyUrl = localStorage.getItem('backend_url') || 'http://localhost:3000/api/apply';
        const unblUrl = applyUrl.replace('/apply', '/unblacklist');

        const formData = {
            discordId: document.getElementById('ubl_q2').value.trim(),
            q1: document.getElementById('ubl_q1').value,
            q2: document.getElementById('ubl_q2').value,
            q3: document.getElementById('ubl_q3').value,
            q4: document.getElementById('ubl_q4').value,
            q5: document.getElementById('ubl_q5').value,
            q6: document.getElementById('ubl_q6').value,
            q7: document.getElementById('ubl_q7').value,
            q8: document.getElementById('ubl_q8').value,
            q9: document.getElementById('ubl_q9').value,
            q10: document.getElementById('ubl_q10').value || "Niciuna",
            q11: document.getElementById('ubl_q11').value || "Niciuna"
        };

        try {
            showToast("Se trimite cererea de unblacklist...");
            const response = await fetch(unblUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast("Cererea de Unblacklist a fost trimisă!");
                unblacklistForm.reset();
            } else {
                showToast("Eroare la trimiterea cererii de unblacklist!");
            }
        } catch (err) {
            console.error(err);
            showToast("Eroare de conexiune cu botul!");
        }
    };
}

// 11. STATUS AUTOMAT DISCORD (direct din API, fără bot)
const INVITE_CODE = 'FYpwjmJP7p';

async function loadServerStats() {
    const totalEl  = document.getElementById('total-members');
    const onlineEl = document.getElementById('online-members');
    const boostEl  = document.getElementById('boost-count');

    if (!totalEl || !onlineEl || !boostEl) return;

    try {
        const res = await fetch(`https://discord.com/api/v9/invites/${INVITE_CODE}?with_counts=true`);
        if (!res.ok) throw new Error('Fetch failed');

        const data = await res.json();

        const members = data.profile?.member_count ?? data.approximate_member_count ?? 0;
        const online  = data.profile?.online_count  ?? data.approximate_presence_count ?? 0;
        const boosts  = data.guild?.premium_subscription_count ?? 0;

        totalEl.textContent = members >= 1000
            ? (members / 1000).toFixed(1).replace('.0', '') + 'k+'
            : members + '+';

        onlineEl.innerHTML = `🟢 ${online} Online`;
        boostEl.textContent = boosts;

    } catch (err) {
        console.warn('[Arctic] Nu s-au putut încărca stats-urile:', err);
    }
}

window.addEventListener('load', () => {
    loadServerStats();
    setInterval(loadServerStats, 60000); // actualizare la fiecare 1 minut
});