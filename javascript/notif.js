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

            // Langsung cek deadline H-2 / H-1 saat notifikasi diaktifkan
            checkUpcomingDeadlines();
        }
    }

    // --- PENGINGAT OTOMATIS DEADLINE H-2 & H-1 ---
    function getActiveUserKey() {
        const activeUser = (localStorage.getItem("activeUser") || "").trim().toLowerCase();
        return activeUser || "guest";
    }

    function getUserTasks() {
        const key = `academicTasks_${encodeURIComponent(getActiveUserKey())}`;
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (err) {
            return [];
        }
    }

    function getTodayDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getDaysRemaining(deadlineStr) {
        if (!deadlineStr) return null;

        const parts = String(deadlineStr).split("-");
        let targetDate;
        if (parts.length === 3) {
            targetDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
            const parsed = new Date(deadlineStr);
            if (Number.isNaN(parsed.getTime())) return null;
            targetDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const diffMs = targetDate.getTime() - today.getTime();
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
    }

    function showInPageBanner(message, isUrgent) {
        let container = document.getElementById("deadlineAlertContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "deadlineAlertContainer";
            container.style.cssText =
                "position: fixed; top: 18px; right: 18px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; max-width: 360px;";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        const borderColor = isUrgent ? "#ff5252" : "#ff9800";
        const bgColor = isUrgent ? "rgba(60, 18, 24, 0.95)" : "rgba(58, 38, 12, 0.95)";
        toast.style.cssText = `background: ${bgColor}; border-left: 4px solid ${borderColor}; color: #fff; padding: 12px 14px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.35); font-size: 0.88rem; line-height: 1.4;`;
        toast.innerHTML = `<div style="font-weight: 600; margin-bottom: 4px;">Pengingat Deadline Tugas</div><div>${message}</div>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transition = "opacity 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 7000);
    }

    function triggerDeadlineReminder(task, daysLeft) {
        const label = daysLeft === 1 ? "H-1 (Besok)" : "H-2 (2 hari lagi)";
        const title = `Pengingat Tugas (${label})`;
        const bodyText = `"${task.judul}" [${task.category || "Umum"}] — Deadline: ${task.deadline}`;

        if (localStorage.getItem(STORAGE_KEY) === "true") {
            playDefaultNotificationSound();
        }

        if ("Notification" in window && Notification.permission === "granted") {
            try {
                new Notification(title, { body: bodyText });
            } catch (err) {
                console.warn("Gagal menampilkan sistem notifikasi:", err);
            }
        }

        showInPageBanner(`<strong>${label}:</strong> ${bodyText}`, daysLeft === 1);
    }

    function checkUpcomingDeadlines() {
        const tasks = getUserTasks();
        if (!tasks.length) return;

        const todayStr = getTodayDateString();
        const sentKey = `notifiedDeadlines_${encodeURIComponent(getActiveUserKey())}_${todayStr}`;
        let sentIds = [];
        try {
            sentIds = JSON.parse(localStorage.getItem(sentKey)) || [];
        } catch (err) {
            sentIds = [];
        }

        let updated = false;

        tasks.forEach((task) => {
            if (!task || task.completed) return;

            const daysLeft = getDaysRemaining(task.deadline);
            if (daysLeft === 2 || daysLeft === 1) {
                const uniqueTag = `${task.id}_H${daysLeft}`;
                if (!sentIds.includes(uniqueTag)) {
                    triggerDeadlineReminder(task, daysLeft);
                    sentIds.push(uniqueTag);
                    updated = true;
                }
            }
        });

        if (updated) {
            localStorage.setItem(sentKey, JSON.stringify(sentIds));
        }
    }

    // Ekspos fungsi ke window bila ingin dipanggil dari tempat lain
    window.playDefaultNotificationSound = playDefaultNotificationSound;
    window.checkUpcomingDeadlines = checkUpcomingDeadlines;

    document.addEventListener("DOMContentLoaded", () => {
        const buttons = findNotificationButtons();
        const savedEnabled = localStorage.getItem(STORAGE_KEY) === "true";

        buttons.forEach((btn) => {
            updateButtonLabel(btn, savedEnabled);
            btn.addEventListener("click", (e) => {
                if (btn.getAttribute("type") === "submit") return;
                e.preventDefault();
                handleEnableNotification(btn);
            });
        });

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().catch(() => {});
        }

        checkUpcomingDeadlines();
        setInterval(checkUpcomingDeadlines, 5 * 60 * 1000);
    });
})();