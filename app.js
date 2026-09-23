(() => {
  'use strict';

  // ============================================================
  // 1. Referencias al DOM
  // ============================================================
  const screens = {
    splash: document.querySelector('#splash'),
    sim: document.querySelector('#sim'),
    name: document.querySelector('#nameScreen')
  };

  const canvas = document.querySelector('#canvas');
  const ctx = canvas?.getContext('2d');

  // Controles del splash
  const countInput = document.querySelector('#count');
  const countValue = document.querySelector('#countValue');
  const speedInput = document.querySelector('#speed');
  const speedValue = document.querySelector('#speedValue');
  const glowInput = document.querySelector('#glow');
  const glowValue = document.querySelector('#glowValue');
  const constellationToggle = document.querySelector('#constellations');

  const startMissionBtn = document.querySelector('#startMission');
  const goNameScreenBtn = document.querySelector('#goNameScreen');
  const resetSplashBtn = document.querySelector('#resetSplash');
  const themeBtn = document.querySelector('#theme');

  // Controles de la simulación
  const toggleBtn = document.querySelector('#toggle');
  const warpBtn = document.querySelector('#warp');
  const backToMenuBtn = document.querySelector('#backToMenu');

  const fpsOutput = document.querySelector('#fps');
  const statusOutput = document.querySelector('#status');
  const activeOutput = document.querySelector('#active');

  // Controles del nombre en movimiento
  const nameStage = document.querySelector('#nameStage');
  const movingName = document.querySelector('#movingName');
  const nameSpeedInput = document.querySelector('#nameSpeed');
  const nameSpeedValue = document.querySelector('#nameSpeedValue');
  const nameSizeInput = document.querySelector('#nameSize');
  const nameSizeValue = document.querySelector('#nameSizeValue');
  const nameTrailToggle = document.querySelector('#nameTrail');
  const nameStartBtn = document.querySelector('#nameStart');
  const nameResetBtn = document.querySelector('#nameReset');
  const nameBackBtn = document.querySelector('#nameBack');

  if (!canvas || !ctx) {
    console.error('⚠️ Canvas 2D no soportado.');
    return;
  }

  // ============================================================
  // 2. Utilidades
  // ============================================================
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const rand = (min, max) => Math.random() * (max - min) + min;

  // ============================================================
  // 3. Cambio de pantallas (3 pantallas)
  // ============================================================
  const showScreen = (target) => {
    Object.entries(screens).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle('is-active', key === target);
    });
  };

  // ============================================================
  // 4. Ajuste de canvas
  // ============================================================
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  window.addEventListener('resize', resizeCanvas);

  // ============================================================
  // 5. Puntero (para la simulación)
  // ============================================================
  const pointer = { x: -9999, y: -9999, active: false };

  const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  };

  const onPointerLeave = () => {
    pointer.active = false;
    pointer.x = -9999;
    pointer.y = -9999;
  };

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);

  // ============================================================
  // 6. CLOSURE del sistema estelar (simulación)
  //    IA-uso: "¿por qué mi closure pierde el estado entre frames?".
  //    Implementación reescrita y adaptada manualmente.
  // ============================================================
  const createStarSystem = (initialCount = 120) => {
    let stars = [];
    let animationId = null;
    let lastTime = 0;
    let running = false;
    let speed = 1;
    let glow = 0.6;
    let count = initialCount;
    let constellationMode = true;
    let warp = 0;
    let warpTarget = 0;

    let frames = 0;
    let fpsTimer = 0;
    let currentFps = 0;

    const logicalSize = () => {
      const dpr = window.devicePixelRatio || 1;
      return { width: canvas.width / dpr, height: canvas.height / dpr };
    };

    const createStar = (width, height) => {
      const radius = rand(0.6, 2.2);
      const angle = rand(0, Math.PI * 2);
      const velocity = rand(6, 28);
      return {
        x: rand(0, width),
        y: rand(0, height),
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        radius,
        baseRadius: radius,
        hue: rand(210, 290),
        twinkle: rand(0, Math.PI * 2),
        twinkleSpeed: rand(0.6, 1.8)
      };
    };

    const resetStars = () => {
      const { width, height } = logicalSize();
      stars = Array.from({ length: count }, () => createStar(width, height));
      if (activeOutput) activeOutput.textContent = String(stars.length);
    };

    const update = (dt) => {
      const { width, height } = logicalSize();
      warp += (warpTarget - warp) * Math.min(1, dt * 3);

      for (const s of stars) {
        s.x += s.vx * speed * dt * (1 + warp * 8);
        s.y += s.vy * speed * dt * (1 + warp * 8);

        if (pointer.active) {
          const dx = pointer.x - s.x;
          const dy = pointer.y - s.y;
          const dist2 = dx * dx + dy * dy;
          const influence = 140 * 140;
          if (dist2 < influence && dist2 > 1) {
            const dist = Math.sqrt(dist2);
            const force = (1 - dist / 140) * 60;
            s.x += (dx / dist) * force * dt;
            s.y += (dy / dist) * force * dt;
          }
        }

        if (s.x < -5) s.x = width + 5;
        if (s.x > width + 5) s.x = -5;
        if (s.y < -5) s.y = height + 5;
        if (s.y > height + 5) s.y = -5;

        s.twinkle += s.twinkleSpeed * dt;
        s.radius = s.baseRadius * (0.75 + 0.35 * Math.sin(s.twinkle));
      }
    };

    const drawNebula = (width, height) => {
      const t = performance.now() * 0.0001;
      const blobs = [
        { x: width * (0.3 + 0.1 * Math.sin(t)), y: height * 0.4, h: 250, r: width * 0.5 },
        { x: width * 0.75, y: height * (0.6 + 0.1 * Math.cos(t * 1.3)), h: 290, r: width * 0.45 },
        { x: width * 0.5, y: height * 0.85, h: 220, r: width * 0.55 }
      ];
      ctx.globalCompositeOperation = 'lighter';
      for (const b of blobs) {
        const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grd.addColorStop(0, `hsla(${b.h}, 90%, 55%, ${0.15 * glow})`);
        grd.addColorStop(0.5, `hsla(${b.h}, 90%, 40%, ${0.06 * glow})`);
        grd.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const draw = () => {
      const { width, height } = logicalSize();
      ctx.clearRect(0, 0, width, height);
      drawNebula(width, height);

      if (constellationMode && stars.length <= 220 && warp < 0.4) {
        ctx.lineWidth = 0.6;
        const maxDist = 110;
        const maxDist2 = maxDist * maxDist;
        for (let i = 0; i < stars.length; i++) {
          const a = stars[i];
          for (let j = i + 1; j < stars.length; j++) {
            const b = stars[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < maxDist2) {
              const alpha = (1 - d2 / maxDist2) * 0.35 * (1 - warp);
              ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 90%, 70%, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      for (const s of stars) {
        const r = s.radius + warp * 1.5;
        const alpha = 0.7 + 0.3 * Math.sin(s.twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 78%, ${alpha})`;
        ctx.shadowColor = `hsla(${s.hue}, 100%, 70%, ${0.9 * glow})`;
        ctx.shadowBlur = 10 * glow + warp * 20;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const updateFps = (timestamp) => {
      frames++;
      if (fpsTimer === 0) fpsTimer = timestamp;
      const elapsed = timestamp - fpsTimer;
      if (elapsed >= 500) {
        currentFps = Math.round((frames * 1000) / elapsed);
        frames = 0;
        fpsTimer = timestamp;
        if (fpsOutput) fpsOutput.textContent = String(currentFps);
      }
    };

    const tick = (timestamp) => {
      if (!running) return;
      if (!lastTime) lastTime = timestamp;
      const dt = clamp((timestamp - lastTime) / 1000, 0, 0.05);
      lastTime = timestamp;
      updateFps(timestamp);
      update(dt);
      draw();
      animationId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      if (statusOutput) statusOutput.textContent = 'explorando';
      if (toggleBtn) toggleBtn.textContent = 'Pausar';
      animationId = requestAnimationFrame(tick);
    };

    const pause = () => {
      if (!running) return;
      running = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      if (statusOutput) statusOutput.textContent = 'en pausa';
      if (toggleBtn) toggleBtn.textContent = 'Reanudar';
    };

    const reset = () => {
      const wasRunning = running;
      pause();
      resetStars();
      draw();
      if (statusOutput) statusOutput.textContent = 'reiniciado';
      if (wasRunning) start();
    };

    const setSpeed = (v) => { speed = clamp(Number(v) || 1, 0.1, 3); };
    const setGlow = (v) => { glow = clamp(Number(v) || 0, 0, 1); };
    const setCount = (v) => {
      count = clamp(Number(v) || 120, 20, 400);
      resetStars();
      if (!running) draw();
    };
    const setConstellations = (v) => {
      constellationMode = Boolean(v);
      if (!running) draw();
    };

    let warpTimeout = null;
    const triggerWarp = () => {
      warpTarget = 1;
      if (warpTimeout) clearTimeout(warpTimeout);
      warpTimeout = setTimeout(() => { warpTarget = 0; }, 1200);
    };

    const destroy = () => {
      pause();
      if (warpTimeout) clearTimeout(warpTimeout);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };

    resetStars();

    return {
      start, pause, reset,
      setSpeed, setGlow, setCount, setConstellations,
      triggerWarp, destroy,
      getState: () => ({ running, speed, glow, count, fps: currentFps, stars: stars.length })
    };
  };

  // ============================================================
  // 7. CLOSURE del NOMBRE EN MOVIMIENTO
  //    Conserva entre frames: pos, vel, speed, size, running,
  //    animationId, lastTime, bounds, trail.
  //
  //    IA-uso: consulté "cómo actualizar transform sin usar style
  //    inline" → usar variables CSS. La implementación fue
  //    escrita y adaptada manualmente.
  // ============================================================
  const createNameMover = (element, stage) => {
    let x = 0;
    let y = 0;
    let vx = 140;              // px/s en x
    let vy = 110;              // px/s en y
    let speed = 1;             // multiplicador
    let size = 4;              // rem
    let running = false;
    let animationId = null;
    let lastTime = 0;
    let bounds = { w: 0, h: 0, elw: 0, elh: 0 };
    let flashTimeout = null;

    const measure = () => {
      bounds.w = stage.clientWidth;
      bounds.h = stage.clientHeight;
      bounds.elw = element.offsetWidth;
      bounds.elh = element.offsetHeight;
    };

    // Usamos variables CSS para moverlo (sin estilos inline).
    const applyTransform = () => {
      element.style.setProperty('--nx', `${x}px`);
      element.style.setProperty('--ny', `${y}px`);
    };

    const centerAndStop = () => {
      measure();
      x = Math.max(0, (bounds.w - bounds.elw) / 2);
      y = Math.max(0, (bounds.h - bounds.elh) / 2);
      applyTransform();
    };

    const flashHit = (type) => {
      if (!nameTrailToggle || !nameTrailToggle.checked) return;
      element.classList.remove('hit-x', 'hit-y', 'hit-corner');
      // Forzar reflow para reiniciar la transición
      void element.offsetWidth;
      element.classList.add(type);
      if (flashTimeout) clearTimeout(flashTimeout);
      flashTimeout = setTimeout(() => {
        element.classList.remove('hit-x', 'hit-y', 'hit-corner');
      }, 250);
    };

    const update = (dt) => {
      const prevX = x;
      const prevY = y;

      x += vx * speed * dt;
      y += vy * speed * dt;

      let hitX = false;
      let hitY = false;

      if (x <= 0) { x = 0; vx = Math.abs(vx); hitX = true; }
      if (x + bounds.elw >= bounds.w) {
        x = bounds.w - bounds.elw;
        vx = -Math.abs(vx);
        hitX = true;
      }
      if (y <= 0) { y = 0; vy = Math.abs(vy); hitY = true; }
      if (y + bounds.elh >= bounds.h) {
        y = bounds.h - bounds.elh;
        vy = -Math.abs(vy);
        hitY = true;
      }

      if (hitX && hitY) flashHit('hit-corner');
      else if (hitX) flashHit('hit-x');
      else if (hitY) flashHit('hit-y');

      // Evitamos trabajo innecesario si no se movió
      if (prevX !== x || prevY !== y) applyTransform();
    };

    const tick = (timestamp) => {
      if (!running) return;
      if (!lastTime) lastTime = timestamp;
      const dt = clamp((timestamp - lastTime) / 1000, 0, 0.05);
      lastTime = timestamp;

      update(dt);
      animationId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      nameStartBtn.textContent = '⏸ Pausar';
      animationId = requestAnimationFrame(tick);
    };

    const pause = () => {
      if (!running) return;
      running = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      nameStartBtn.textContent = '▶ Reanudar';
    };

    const reset = () => {
      const wasRunning = running;
      pause();
      // velocidades base originales
      const norm = Math.hypot(vx, vy) || 1;
      vx = (vx / norm) * 140;
      vy = (vy / norm) * 110;
      centerAndStop();
      element.classList.remove('hit-x', 'hit-y', 'hit-corner');
      nameStartBtn.textContent = '▶ Iniciar';
      if (wasRunning) start();
    };

    const setSpeed = (v) => {
      speed = clamp(Number(v) || 0, 0, 5);
    };

    const setSize = (v) => {
      size = clamp(Number(v) || 4, 1.5, 8);
      element.style.fontSize = `${size}rem`;
      // Re-medimos porque cambió el tamaño del texto
      const prevW = bounds.w;
      const prevH = bounds.h;
      measure();
      // Reajustamos si el tamaño del stage cambió (raro)
      if (prevW !== bounds.w || prevH !== bounds.h) {
        x = clamp(x, 0, Math.max(0, bounds.w - bounds.elw));
        y = clamp(y, 0, Math.max(0, bounds.h - bounds.elh));
        applyTransform();
      }
    };

    const destroy = () => {
      pause();
      if (flashTimeout) clearTimeout(flashTimeout);
    };

    const onResize = () => {
      measure();
      x = clamp(x, 0, Math.max(0, bounds.w - bounds.elw));
      y = clamp(y, 0, Math.max(0, bounds.h - bounds.elh));
      applyTransform();
    };

    // Estado inicial: centrado
    centerAndStop();

    return {
      start, pause, reset, setSpeed, setSize,
      onResize, destroy,
      getState: () => ({ running, speed, size, x, y })
    };
  };

  // ============================================================
  // 8. Instancias + handlers (arrow functions)
  // ============================================================
  const system = createStarSystem(Number(countInput.value));
  const nameMover = createNameMover(movingName, nameStage);

  // ---- Navegación ----
  const onStartMission = () => {
    showScreen('sim');
    requestAnimationFrame(() => {
      resizeCanvas();
      system.setCount(countInput.value);
      system.setSpeed(speedInput.value);
      system.setGlow(glowInput.value);
      system.setConstellations(constellationToggle.checked);
      system.start();
    });
  };

  const onBackToMenu = () => {
    system.pause();
    showScreen('splash');
  };

  const onGoNameScreen = () => {
    system.pause();
    showScreen('name');
    // Re-medimos tras hacer visible la pantalla y centramos
    requestAnimationFrame(() => {
      nameMover.onResize();
    });
  };

  const onNameBack = () => {
    nameMover.pause();
    nameStartBtn.textContent = '▶ Iniciar';
    showScreen('splash');
  };

  // ---- Controles simulación ----
  const onToggle = () => {
    const { running } = system.getState();
    running ? system.pause() : system.start();
  };

  const onWarp = () => {
    system.triggerWarp();
    if (!system.getState().running) system.start();
  };

  // ---- Controles splash ----
  const onResetSplash = () => {
    countInput.value = 120;
    speedInput.value = 1;
    glowInput.value = 0.6;
    constellationToggle.checked = true;

    countValue.textContent = '120';
    speedValue.textContent = '1.0';
    glowValue.textContent = '0.60';

    system.setCount(120);
    system.setSpeed(1);
    system.setGlow(0.6);
    system.setConstellations(true);
    system.reset();
  };

  const onCountInput = (e) => {
    countValue.textContent = e.target.value;
    system.setCount(e.target.value);
  };

  const onSpeedInput = (e) => {
    speedValue.textContent = Number(e.target.value).toFixed(1);
    system.setSpeed(e.target.value);
  };

  const onGlowInput = (e) => {
    glowValue.textContent = Number(e.target.value).toFixed(2);
    system.setGlow(e.target.value);
  };

  const onConstellations = (e) => system.setConstellations(e.target.checked);

  const onThemeToggle = () => {
    const isDay = document.body.classList.toggle('theme-day');
    themeBtn.textContent = isDay ? 'Modo noche' : 'Modo día';
  };

  // ---- Controles del nombre ----
  const onNameStart = () => {
    const { running } = nameMover.getState();
    running ? nameMover.pause() : nameMover.start();
  };

  const onNameReset = () => {
    nameMover.reset();
  };

  const onNameSpeedInput = (e) => {
    nameSpeedValue.textContent = Number(e.target.value).toFixed(1);
    nameMover.setSpeed(e.target.value);
  };

  const onNameSizeInput = (e) => {
    nameSizeValue.textContent = Number(e.target.value).toFixed(1);
    nameMover.setSize(e.target.value);
  };

  // ============================================================
  // 9. Listeners
  // ============================================================
  startMissionBtn.addEventListener('click', onStartMission);
  goNameScreenBtn.addEventListener('click', onGoNameScreen);
  resetSplashBtn.addEventListener('click', onResetSplash);
  themeBtn.addEventListener('click', onThemeToggle);

  toggleBtn.addEventListener('click', onToggle);
  warpBtn.addEventListener('click', onWarp);
  backToMenuBtn.addEventListener('click', onBackToMenu);

  countInput.addEventListener('input', onCountInput);
  speedInput.addEventListener('input', onSpeedInput);
  glowInput.addEventListener('input', onGlowInput);
  constellationToggle.addEventListener('change', onConstellations);

  nameStartBtn.addEventListener('click', onNameStart);
  nameResetBtn.addEventListener('click', onNameReset);
  nameBackBtn.addEventListener('click', onNameBack);
  nameSpeedInput.addEventListener('input', onNameSpeedInput);
  nameSizeInput.addEventListener('input', onNameSizeInput);

  // Reajustar el nombre si cambia el tamaño de la ventana
  window.addEventListener('resize', () => {
    if (screens.name.classList.contains('is-active')) nameMover.onResize();
  });

  window.addEventListener('pagehide', () => {
    system.destroy();
    nameMover.destroy();
  }, { once: true });

  // ============================================================
  // 10. Inicialización
  // ============================================================
  resizeCanvas();
  system.setGlow(glowInput.value);
  system.setSpeed(speedInput.value);
  system.setCount(countInput.value);
  system.setConstellations(constellationToggle.checked);

  nameMover.setSpeed(nameSpeedInput.value);
  nameMover.setSize(nameSizeInput.value);

  // IA-uso: consulté "closure vs global scope", "cancelAnimationFrame",
  // "cómo mover un elemento con transform sin usar style inline" y
  // "cómo encapsular un screensaver con requestAnimationFrame".
})();