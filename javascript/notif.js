(function () {
    const STORAGE_KEY = "notificationEnabled";

    // Nada bawaan menggunakan Web Audio API (tanpa butuh file .mp3/.wav eksternal)
    function playDefaultNotificationSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            const ctx = new AudioCtx();
            if (ctx.state === "suspended") {
                ctx.resume();
            }

            const now = ctx.currentTime;

            // Nada 1 (C5 -> 523.25 Hz)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(523.25, now);
            gain1.gain.setValueAtTime(0.001, now);
            gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.24);

            // Nada 2 (G5 -> 783.99 Hz)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(783.99, now + 0.14);
            gain2.gain.setValueAtTime(0.001, now + 0.14);
            gain2.gain.linearRampToValueAtTime(0.18, now + 0.16);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.14);
            osc2.stop(now + 0.44);

            setTimeout(() => {
                ctx.close().catch(() => {});
            }, 600);
        } catch (err) {
            console.warn("Gagal memutar nada notifikasi:", err);
        }
    }

    function showSystemNotification(title, body) {
        if ("Notification" in window && Notification.permission === "granted") {
            try {
                new Notification(title, { body });
            } catch (err) {
                console.warn("Notifikasi browser tidak bisa ditampilkan:", err);
            }
        }
    }

    function findNotificationButtons() {
        const candidates = new Set();

        // Cari berdasarkan id atau class umum
        document
            .querySelectorAll(
                "#btn-notif, #btnNotif, #notifBtn, #enableNotifBtn, #aktifkanNotifikasi, .btn-notif, .notif-btn, .notification-btn, [data-action='enable-notification']"
            )
            .forEach((el) => candidates.add(el));

        // Cari berdasarkan teks tombol/link jika id/class berbeda
        document.querySelectorAll("button, a, [role='button']").forEach((el) => {
            const text = (el.textContent || "").trim().toLowerCase();
            if (text.includes("notifikasi") || text.includes("notification")) {
                candidates.add(el);
            }
        });

        return Array.from(candidates);
    }

    function updateButtonLabel(btn, enabled) {
        const originalText = (btn.dataset.originalText || btn.textContent || "").trim();
        if (!btn.dataset.originalText && originalText) {
            btn.dataset.originalText = originalText;
        }

        if (enabled) {
            btn.classList.add("notif-active");
            if (originalText.toLowerCase().includes("aktifkan")) {
                btn.textContent = "Notifikasi Aktif";
            }
        } else {
            btn.classList.remove("notif-active");
            if (btn.dataset.originalText) {
                btn.textContent = btn.dataset.originalText;
            }
        }
    }

    async function handleEnableNotification(btn) {
        let permissionGranted = !("Notification" in window) || Notification.permission === "granted";

        if ("Notification" in window && Notification.permission === "default") {
            try {
                const result = await Notification.requestPermission();
                permissionGranted = result === "granted";
            } catch (err) {
                console.warn("Permintaan izin notifikasi dibatalkan/gagal:", err);
            }
        }

        const currentState = localStorage.getItem(STORAGE_KEY) === "true";
        const nextState = !currentState;
        localStorage.setItem(STORAGE_KEY, String(nextState));

        updateButtonLabel(btn, nextState);

        if (nextState) {
            // Mainkan nada bawaan saat notifikasi diaktifkan
            playDefaultNotificationSound();

            if (permissionGranted) {
                showSystemNotification("Notifikasi Aktif", "Nada notifikasi bawaan telah diaktifkan.");
            } else {
                alert("Nada notifikasi bawaan diaktifkan (izin notifikasi browser belum diberikan).");
            }
        }
    }

    // Ekspos fungsi ke window bila ingin dipanggil dari tempat lain
    window.playDefaultNotificationSound = playDefaultNotificationSound;

    document.addEventListener("DOMContentLoaded", () => {
        const buttons = findNotificationButtons();
        const savedEnabled = localStorage.getItem(STORAGE_KEY) === "true";

        buttons.forEach((btn) => {
            updateButtonLabel(btn, savedEnabled);
            btn.addEventListener("click", (e) => {
                // Jangan ganggu jika berada di dalam form submit yang bukan tombol aksi mandiri
                if (btn.getAttribute("type") === "submit") return;
                e.preventDefault();
                handleEnableNotification(btn);
            });
        });
    });
})();