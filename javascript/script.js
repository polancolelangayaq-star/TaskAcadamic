 // Fungsi Navigasi
function goToRegister() {
    // Jika dari index.html (luar), arahkan ke menu/register.html
    // Jika dari dalam folder menu/, arahkan langsung ke register.html
    if (window.location.pathname.includes('/menu/')) {
        window.location.href = 'register.html';
    } else {
        window.location.href = 'menu/register.html';
    }
}

function goToDashboard() {
    if (window.location.pathname.includes('/menu/')) {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'menu/dashboard.html';
    }
}

function goToLogin() {
    if (window.location.pathname.includes('/menu/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

document.addEventListener("DOMContentLoaded", () => {

  // --- LOGIKA TOMBOL LOGOUT ---
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
      btnLogout.addEventListener("click", () => {
          // Mengarahkan kembali ke halaman utama/login di luar folder menu
          window.location.href = "../index.html";
      });
  }
  
  // --- 1. LOGIKA HALAMAN REGISTER ---
  const registerForm = document.getElementById("register-form");
  
  // Logika Lihat/Sembunyikan Password di halaman Register
  const eyeToggleRegister = document.getElementById("eyeToggleRegister");
  const regPasswordInput = document.getElementById("reg-password");
  
  if (eyeToggleRegister && regPasswordInput) {
      const eyeShowReg = eyeToggleRegister.querySelector(".eye-show");
      const eyeHideReg = eyeToggleRegister.querySelector(".eye-hide");

      eyeToggleRegister.addEventListener("click", () => {
          const isPassword = regPasswordInput.getAttribute("type") === "password";
          regPasswordInput.setAttribute("type", isPassword ? "text" : "password");
          if (eyeShowReg && eyeHideReg) {
              eyeShowReg.classList.toggle("hidden", isPassword);
              eyeHideReg.classList.toggle("hidden", !isPassword);
          }
      });
  }

  if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
          e.preventDefault(); // Mencegah form melakukan reload bawaan HTML

          const regUser = document.getElementById("reg-username").value.trim();
          const regPass = regPasswordInput.value.trim();

          // Validasi jika kolom kosong
          if (regUser === "" || regPass === "") {
              alert("Peringatan: Username dan password registrasi tidak boleh kosong!");
              return;
          }

          // Ambil data akun yang sudah ada di localStorage
          let users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
          
          // Cek apakah username sudah terdaftar
          const existingUser = users.find(u => u.username === regUser);
          if (existingUser) {
              alert("Peringatan: Username tersebut sudah terdaftar. Silakan gunakan username lain!");
              return;
          }

          // Simpan akun baru ke localStorage
          users.push({ username: regUser, password: regPass });
          localStorage.setItem("registeredUsers", JSON.stringify(users));

          alert("Registrasi Berhasil! Silakan login menggunakan akun yang baru saja didaftarkan.");
          
          window.location.href = "../index.html";
      });
      
      // Jika berada di halaman register, hentikan eksekusi skrip lampu login di bawah agar tidak error
      return; 
  }

  // --- 2. LOGIKA DASHBOARD & MANAJEMEN TUGAS ---
  const taskForm = document.getElementById("task-form");
  if (taskForm) {
      const categoryInput = document.getElementById("category");
      const judulInput = document.getElementById("judul");
      const deadlineInput = document.getElementById("deadline");
      const taskListContainer = document.getElementById("task-list");
      const taskCountBadge = document.getElementById("task-count");
      const filterButtons = document.querySelectorAll(".filter-btn");

      let tasks = JSON.parse(localStorage.getItem("academicTasks")) || [];
      let currentFilter = "all";

      // Fungsi Render Daftar Tugas
      function renderTasks() {
          taskListContainer.innerHTML = "";
          
          let filteredTasks = tasks.filter(task => {
              if (currentFilter === "pending") return !task.completed;
              if (currentFilter === "completed") return task.completed;
              return true;
          });

          if (filteredTasks.length === 0) {
              taskListContainer.innerHTML = `<p style="text-align: center; color: #888; padding: 20px;">Belum ada tugas yang ditambahkan.</p>`;
          } else {
              filteredTasks.forEach((task) => {
                  const taskCard = document.createElement("div");
                  taskCard.className = `task-item ${task.completed ? "completed" : ""}`;
                  taskCard.style.cssText = `background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 5px solid ${task.completed ? '#4caf50' : '#ff9800'};`;

                  taskCard.innerHTML = `
                      <div>
                          <span style="font-size: 0.8rem; background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 4px; color: #ffeb3b;">${task.category}</span>
                          <h4 style="margin: 5px 0 2px 0; color: #fff;">${task.judul}</h4>
                          <small style="color: #bbb;"><i class="fa-regular fa-calendar"></i><b> Deadline:</b> ${task.deadline}</small>
                      </div>
                      <div style="display: flex; gap: 8px;">
                          <button onclick="toggleTaskStatus(${task.id})" title="Ubah Status" style="background: ${task.completed ? '#ff9800' : '#4caf50'}; border: none; color: white; padding: 6px 10px; border-radius: 5px; cursor: pointer;">
                              <i class="fa-solid ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
                          </button>
                          <button onclick="deleteTask(${task.id})" title="Hapus Tugas" style="background: #f44336; border: none; color: white; padding: 6px 10px; border-radius: 5px; cursor: pointer;">
                              <i class="fa-solid fa-trash"></i>
                          </button>
                      </div>
                  `;
                  taskListContainer.appendChild(taskCard);
              });
          }

          taskCountBadge.textContent = `${tasks.length} Agenda`;
          localStorage.setItem("academicTasks", JSON.stringify(tasks));
      }

      // Event Listener Tambah Tugas
      taskForm.addEventListener("submit", (e) => {
          e.preventDefault();

          const newTask = {
              id: Date.now(),
              category: categoryInput.value.trim(),
              judul: judulInput.value.trim(),
              deadline: deadlineInput.value,
              completed: false
          };

          tasks.push(newTask);
          renderTasks();
          taskForm.reset();
          alert("Tugas berhasil disimpan!");
      });

      // Tombol Filter
      filterButtons.forEach(btn => {
          btn.addEventListener("click", () => {
              filterButtons.forEach(b => b.classList.remove("active"));
              btn.classList.add("active");
              currentFilter = btn.getAttribute("data-filter");
              renderTasks();
          });
      });

      // Fungsi Global untuk Ubah Status & Hapus Tugas
      window.toggleTaskStatus = function(id) {
          tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
          renderTasks();
      };

      window.deleteTask = function(id) {
          if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
              tasks = tasks.filter(t => t.id !== id);
              renderTasks();
          }
      };

      // Render pertama kali saat halaman dashboard dimuat
      renderTasks();
      return; // Hentikan eksekusi skrip login di bawah jika berada di halaman dashboard
  }

  // Cek apakah GSAP tersedia untuk interaksi lampu
  if (typeof gsap !== 'undefined' && document.getElementById("cordBead")) {
      gsap.registerPlugin(Draggable);
  }

  // DOM Elements Utama (Halaman Login / Index)
  const body = document.body;
  const cordBead = document.getElementById("cordBead");
  const cordHit = document.getElementById("cordHit");
  const elasticCord = document.getElementById("elasticCord");
  const shadeAssembly = document.getElementById("shadeAssembly");
  const soundToggle = document.getElementById("soundToggle");
  
  if (!cordBead) return; 

  const soundOnIcon = soundToggle.querySelector(".sound-on");
  const soundOffIcon = soundToggle.querySelector(".sound-off");

  // Form Elements
  const loginCard = document.getElementById("loginCard");
  const tabSignIn = document.getElementById("tabSignIn");
  const tabRegister = document.getElementById("tabRegister");
  const authTabs = document.querySelector(".auth-tabs");
  const cardTitle = document.querySelector(".card-title");
  const cardSubtitle = document.querySelector(".card-subtitle");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnSpinner = document.getElementById("btnSpinner");
  const btnSuccess = document.getElementById("btnSuccess");
  const btnArrow = submitBtn.querySelector(".btn-arrow");
  const eyeToggle = document.getElementById("eyeToggle");
  const passField = document.getElementById("passField");
  const eyeShow = eyeToggle ? eyeToggle.querySelector(".eye-show") : null;
  const eyeHide = eyeToggle ? eyeToggle.querySelector(".eye-hide") : null;
  const successOverlay = document.getElementById("successOverlay");
  const resetDemoBtn = document.getElementById("resetDemoBtn");

  // State
  let isOn = false;
  let isSoundEnabled = true;
  let activeTab = "signin";
  let isSimulatingPull = false;

  // Elastic String Geometry
  const ANCHOR_X = 245;
  const ANCHOR_Y = 212;
  const REST_X = 245;
  const REST_Y = 300;
  const MAX_STRETCH = 120;
  const TRIGGER_PULL = 32;

  gsap.set(cordBead, { x: REST_X, y: REST_Y });

  let twangAmp = 0;
  let twangStartTime = 0;

  function renderElasticString(curX, curY) {
    let twangOffset = 0;
    if (twangAmp > 0.05) {
      const elapsed = performance.now() - twangStartTime;
      twangOffset = Math.sin(elapsed * 0.05) * twangAmp;
    }

    const midX = (ANCHOR_X + curX) / 2 + twangOffset;
    const midY = (ANCHOR_Y + curY) / 2;

    const stretchRatio = Math.max(1, (curY - ANCHOR_Y) / (REST_Y - ANCHOR_Y));
    const strokeWidth = Math.max(1.6, 2.6 / Math.sqrt(stretchRatio));

    elasticCord.setAttribute("d", `M ${ANCHOR_X} ${ANCHOR_Y} Q ${midX} ${midY} ${curX} ${curY}`);
    elasticCord.setAttribute("stroke-width", strokeWidth.toFixed(2));
  }

  // Web Audio Synthesizer
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playElasticPluckSound(pullDist, turningOn) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = "triangle";

      const startFreq = 480 + Math.min(260, pullDist * 3);
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      if (pullDist >= TRIGGER_PULL) {
        const snap = audioCtx.createOscillator();
        const snapGain = audioCtx.createGain();
        snap.type = "sine";
        snap.frequency.setValueAtTime(turningOn ? 1800 : 1500, now + 0.02);
        snap.frequency.exponentialRampToValueAtTime(320, now + 0.06);

        snapGain.gain.setValueAtTime(0.35, now + 0.02);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        snap.connect(snapGain);
        snapGain.connect(audioCtx.destination);
        snap.start(now + 0.02);
        snap.stop(now + 0.07);

        if (turningOn) {
          const hum = audioCtx.createOscillator();
          const humGain = audioCtx.createGain();
          hum.type = "sine";
          hum.frequency.setValueAtTime(120, now + 0.05);
          humGain.gain.setValueAtTime(0.001, now);
          humGain.gain.linearRampToValueAtTime(0.06, now + 0.08);
          humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          hum.connect(humGain);
          humGain.connect(audioCtx.destination);
          hum.start(now + 0.05);
          hum.stop(now + 0.38);
        }
      }
    } catch (e) {
      console.warn("AudioContext error:", e);
    }
  }

  if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        isSoundEnabled = !isSoundEnabled;
        soundOnIcon.classList.toggle("hidden", !isSoundEnabled);
        soundOffIcon.classList.toggle("hidden", isSoundEnabled);
        if (isSoundEnabled) initAudio();
      });
  }

  function playColorSwitchSound() {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) { }
  }

  const colorDots = document.querySelectorAll(".color-dot-btn");
  let currentColor = "amber";

  colorDots.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedColor = btn.getAttribute("data-color");
      if (selectedColor === currentColor) return;

      colorDots.forEach((d) => d.classList.remove("active"));
      btn.classList.add("active");

      currentColor = selectedColor;
      body.setAttribute("data-color", currentColor);

      playColorSwitchSound();

      if (isOn) {
        gsap.fromTo(".svg-light-beam, .ambient-glow",
          { opacity: 0.65 },
          {
            opacity: 1,
            duration: 0.45,
            ease: "power1.out",
            onComplete: () => {
              gsap.set([".svg-light-beam", ".ambient-glow"], { clearProps: "opacity,visibility" });
            }
          }
        );
      }
    });
  });

  Draggable.create(cordBead, {
    type: "x,y",
    bounds: {
      minY: REST_Y,
      maxY: REST_Y + MAX_STRETCH,
      minX: REST_X - 45,
      maxX: REST_X + 45,
    },
    cursor: "grab",
    activeCursor: "grabbing",
    onPress() {
      initAudio();
      twangAmp = 0;
    },
    onDrag() {
      renderElasticString(this.x, this.y);

      const pullDist = this.y - REST_Y;
      const shadeTilt = (pullDist / MAX_STRETCH) * 1.8;
      gsap.set(shadeAssembly, {
        rotation: shadeTilt,
        transformOrigin: "215px 175px"
      });
    },
    onRelease() {
      handleElasticRelease(this.x, this.y);
    }
  });

  function handleElasticRelease(curX, curY) {
    const pullDist = curY - REST_Y;
    const isTriggered = pullDist >= TRIGGER_PULL;

    if (isTriggered) {
      toggleLamp();
    }

    playElasticPluckSound(pullDist, isOn);

    gsap.to(cordBead, {
      x: REST_X,
      y: REST_Y,
      duration: 1.15,
      ease: "elastic.out(2.2, 0.16)",
      onUpdate: () => {
        const bx = gsap.getProperty(cordBead, "x");
        const by = gsap.getProperty(cordBead, "y");
        renderElasticString(bx, by);
      }
    });

    twangAmp = (curX - REST_X) * 0.4 + (pullDist * 0.3);
    twangStartTime = performance.now();
    gsap.to({ val: twangAmp }, {
      val: 0,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: function () {
        twangAmp = this.targets()[0].val;
      }
    });

    gsap.to(shadeAssembly, {
      rotation: 0,
      duration: 0.7,
      ease: "back.out(2.2)",
      transformOrigin: "215px 175px"
    });
  }

  cordHit.addEventListener("click", () => {
    if (isSimulatingPull) return;
    performSimulatedPull();
  });

  function performSimulatedPull() {
    isSimulatingPull = true;
    initAudio();

    gsap.to(cordBead, {
      y: REST_Y + 50,
      duration: 0.22,
      ease: "power2.in",
      onUpdate: () => {
        const by = gsap.getProperty(cordBead, "y");
        renderElasticString(REST_X, by);
      },
      onComplete: () => {
        handleElasticRelease(REST_X, REST_Y + 50);
        setTimeout(() => {
          isSimulatingPull = false;
        }, 500);
      }
    });

    gsap.to(shadeAssembly, {
      rotation: 1.8,
      duration: 0.22,
      ease: "power2.in",
      transformOrigin: "230px 188px"
    });
  }

  function toggleLamp() {
    setLampState(!isOn);
  }

  function setLampState(targetState) {
    isOn = targetState;
    body.setAttribute("data-on", isOn ? "true" : "false");

    gsap.killTweensOf([
      ".bulb-glow-core",
      ".bulb-filament",
      ".svg-light-beam",
      ".ambient-glow",
      ".shade-reflector-on",
      loginCard,
      "#loginCard *"
    ]);

    gsap.set([".svg-light-beam", ".ambient-glow", ".shade-reflector-on"], { clearProps: "opacity,visibility" });

    const filament = document.querySelector(".bulb-filament");
    const bulbGlow = document.querySelector(".bulb-glow-core");

    if (isOn) {
      gsap.timeline()
        .to(filament, { stroke: "#fff", duration: 0.05 })
        .to(bulbGlow, { opacity: 0.95, duration: 0.1, ease: "power2.out" });

      gsap.fromTo(loginCard,
        { y: 24, scale: 0.96, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }
      );

      gsap.fromTo(
        ".card-header, .auth-tabs, .form-group, .options-row, .submit-btn, .auth-divider, .social-row",
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: "power2.out", delay: 0.08 }
      );
    } else {
      gsap.set(bulbGlow, { opacity: 0, clearProps: "opacity" });
      gsap.set(filament, { stroke: "#555", filter: "none", clearProps: "all" });

      gsap.to(loginCard, {
        y: 16,
        opacity: 0,
        scale: 0.96,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(loginCard, { clearProps: "all" });
        }
      });

      gsap.set(loginCard, { rotateX: 0, rotateY: 0 });
    }
  }

  const canvas = document.getElementById("dustCanvas");
  if (canvas) {
      const ctx = canvas.getContext("2d");
      let width, height;
      let particles = [];
      const PARTICLE_COUNT = 60;

      const particleThemes = {
        amber: { fill: "255, 205, 120", glow: "255, 185, 80" },
        cyan: { fill: "140, 245, 255", glow: "0, 240, 255" },
        rose: { fill: "255, 160, 200", glow: "255, 51, 133" },
        mint: { fill: "160, 255, 200", glow: "0, 230, 118" },
        moonlight: { fill: "220, 235, 255", glow: "200, 220, 255" }
      };
      let activeParticleTheme = particleThemes.amber;

      function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();

      class Particle {
        constructor() {
          this.reset();
        }
        reset() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.radius = Math.random() * 2 + 0.6;
          this.vx = (Math.random() - 0.4) * 0.35;
          this.vy = -Math.random() * 0.4 - 0.15;
          this.alpha = Math.random() * 0.6 + 0.2;
          this.pulseSpeed = Math.random() * 0.03 + 0.01;
          this.pulse = Math.random() * Math.PI;
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.pulse += this.pulseSpeed;
          if (this.y < 0) this.y = height;
          if (this.x < 0) this.x = width;
          if (this.x > width) this.x = 0;
        }
        draw() {
          const currentAlpha = (Math.sin(this.pulse) * 0.3 + 0.7) * this.alpha;
          const factor = isOn ? 1 : 0.08;
          ctx.save();
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${activeParticleTheme.fill}, ${currentAlpha * factor})`;
          if (isOn) {
            ctx.shadowBlur = 7;
            ctx.shadowColor = `rgba(${activeParticleTheme.glow}, 0.5)`;
          }
          ctx.fill();
          ctx.restore();
        }
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }

      function renderParticles() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }
        requestAnimationFrame(renderParticles);
      }
      renderParticles();
  }

  if (tabSignIn && tabRegister) {
      tabSignIn.addEventListener("click", () => switchTab("signin"));
      tabRegister.addEventListener("click", () => {
          switchTab("register");
          goToRegister(); 
      });
  }

  function switchTab(tab) {
    if (activeTab === tab) return;
    activeTab = tab;
    authTabs.setAttribute("data-active", tab);

    tabSignIn.classList.toggle("active", tab === "signin");
    tabRegister.classList.toggle("active", tab === "register");

    if (tab === "signin") {
      cardTitle.textContent = "Welcome";
      cardSubtitle.textContent = "Sign in to continue to your account";
      btnText.textContent = "Sign In";
    } else {
      cardTitle.textContent = "Sign Up";
      cardSubtitle.textContent = "Create an account to get started";
      btnText.textContent = "Create Account";
    }

    gsap.fromTo(".card-title, .card-subtitle",
      { opacity: 0.6, y: -4 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }

  if (eyeToggle && passField && eyeShow && eyeHide) {
      eyeToggle.addEventListener("click", () => {
        const isPassword = passField.getAttribute("type") === "password";
        passField.setAttribute("type", isPassword ? "text" : "password");
        eyeShow.classList.toggle("hidden", isPassword);
        eyeHide.classList.toggle("hidden", !isPassword);
      });
  }

  // --- 3. LOGIKA TOMBOL LOGIN / MASUK ---
  if (submitBtn) {
      submitBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const userField = document.getElementById("userField");
        if (userField && passField) {
          const usernameVal = userField.value.trim();
          const passwordVal = passField.value.trim();

          if (usernameVal === "" || passwordVal === "") {
            alert("Peringatan: Kolom username dan password harus diisi terlebih dahulu!");
            return;
          }

          let users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
          const validUser = users.find(u => u.username === usernameVal && u.password === passwordVal);

          if (!validUser) {
            alert("Peringatan: Username atau password salah! Pastikan akun sudah terdaftar melalui menu Register.");
            return;
          }
        }

        if (!isOn) {
          performSimulatedPull();
          return;
        }

        btnText.classList.add("hidden");
        btnArrow.classList.add("hidden");
        btnSpinner.classList.remove("hidden");
        submitBtn.style.pointerEvents = "none";

        setTimeout(() => {
          btnSpinner.classList.add("hidden");
          btnSuccess.classList.remove("hidden");

          setTimeout(() => {
            successOverlay.classList.remove("hidden");
            btnText.classList.remove("hidden");
            btnArrow.classList.remove("hidden");
            btnSuccess.classList.add("hidden");
            submitBtn.style.pointerEvents = "auto";
            
            goToDashboard();
          }, 600);
        }, 1100);
      });
  }

  if (resetDemoBtn) {
      resetDemoBtn.addEventListener("click", () => {
        successOverlay.classList.add("hidden");
        document.getElementById("userField").value = "";
        document.getElementById("passField").value = "";
      });
  }

  const card = document.getElementById("loginCard");
  const formStage = document.querySelector(".form-stage");

  if (formStage && card) {
      formStage.addEventListener("mousemove", (e) => {
        if (!isOn) return;
        const rect = formStage.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(card, {
          rotateX: -(y / rect.height) * 9,
          rotateY: (x / rect.width) * 9,
          duration: 0.5,
          ease: "power1.out",
          transformPerspective: 900
        });
      });

      formStage.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.7,
          ease: "power2.out"
        });
      });
  }

  renderElasticString(REST_X, REST_Y);
});