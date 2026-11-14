/* ============================================================
   DINOMOTION STUDIO v4 — Javascript de Interatividade Awwwards
   ============================================================ */

(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. MOTOR DE ÁUDIO HÍBRIDO (ARQUIVOS REAIS DO DISCO D + SINTETIZADOR DE FALLBACK)
  const ArcadeAudio = (function () {
    let ctx = null;
    let enabled = true;

    // Sons reais pré-carregados da pasta assets/audio/
    const soundFiles = {
      pop: new Audio("assets/audio/click-pop.mp3"),
      tab: new Audio("assets/audio/tab-switch.mp3"),
      coin: new Audio("assets/audio/coin.mp3"),
      victory: new Audio("assets/audio/victory.mp3"),
      whoosh: new Audio("assets/audio/whoosh.mp3"),
      roar: new Audio("assets/audio/dino-roar.mp3")
    };

    // Ajusta volumes dos arquivos reais
    if (soundFiles.pop) soundFiles.pop.volume = 0.5;
    if (soundFiles.tab) soundFiles.tab.volume = 0.45;
    if (soundFiles.coin) soundFiles.coin.volume = 0.55;
    if (soundFiles.victory) soundFiles.victory.volume = 0.6;
    if (soundFiles.whoosh) soundFiles.whoosh.volume = 0.4;
    if (soundFiles.roar) soundFiles.roar.volume = 0.7;

    function playAudioFile(audioObj, fallbackFn) {
      if (!enabled) return;
      if (audioObj) {
        try {
          const clone = audioObj.cloneNode();
          clone.volume = audioObj.volume;
          clone.play().catch(() => {
            if (fallbackFn) fallbackFn();
          });
          return;
        } catch (e) {}
      }
      if (fallbackFn) fallbackFn();
    }

    function initCtx() {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) ctx = new AudioCtx();
      }
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
    }

    function playTone(freq, type, duration, delay = 0, vol = 0.08) {
      if (!enabled) return;
      try {
        initCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      } catch (e) {}
    }

    return {
      toggle: () => {
        enabled = !enabled;
        return enabled;
      },
      isEnabled: () => enabled,
      click: () => {
        playAudioFile(soundFiles.pop, () => playTone(650, "triangle", 0.04, 0, 0.06));
      },
      tabSwitch: () => {
        playAudioFile(soundFiles.tab, () => playTone(520, "triangle", 0.05, 0, 0.05));
      },
      coin: () => {
        playAudioFile(soundFiles.coin, () => {
          playTone(987.77, "square", 0.08, 0, 0.07);
          playTone(1318.51, "square", 0.25, 0.08, 0.07);
        });
      },
      whoosh: () => {
        playAudioFile(soundFiles.whoosh, () => playTone(240, "sine", 0.15, 0, 0.08));
      },
      victory: () => {
        playAudioFile(soundFiles.victory, () => {
          playTone(523.25, "triangle", 0.08, 0, 0.06);
          playTone(659.25, "triangle", 0.08, 0.08, 0.06);
          playTone(783.99, "triangle", 0.22, 0.16, 0.08);
        });
      },
      blip: () => {
        playAudioFile(soundFiles.pop, () => playTone(587.33, "triangle", 0.05, 0, 0.05));
      },
      powerUp: () => {
        playAudioFile(soundFiles.tab, () => {
          playTone(523.25, "triangle", 0.05, 0, 0.05);
          playTone(659.25, "triangle", 0.05, 0.05, 0.05);
          playTone(783.99, "triangle", 0.14, 0.1, 0.06);
        });
      },
      roar: () => {
        playAudioFile(soundFiles.roar, () => {
          initCtx();
          if (!enabled || !ctx) return;
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(140, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.12);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.24);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.24);
          } catch (e) {}
        });
      },
      playKey: (key) => {
        if (!enabled) return;
        if (key === "pop" || key === "click") playAudioFile(soundFiles.pop, () => playTone(650, "triangle", 0.04));
        else if (key === "tab") playAudioFile(soundFiles.tab, () => playTone(520, "triangle", 0.05));
        else if (key === "coin") playAudioFile(soundFiles.coin, () => playTone(987, "square", 0.15));
        else if (key === "whoosh") playAudioFile(soundFiles.whoosh, () => playTone(240, "sine", 0.15));
        else if (key === "victory") playAudioFile(soundFiles.victory, () => playTone(523, "triangle", 0.2));
        else if (key === "roar") playAudioFile(soundFiles.roar, () => playTone(160, "sawtooth", 0.2));
        else playAudioFile(soundFiles.pop);
      }
    };
  })();

  // Exporta globalmente para páginas e componentes
  window.ArcadeAudio = ArcadeAudio;

  // 1.1 MOTOR DE SOM AMBIENTE (BGM GAMER RETRÔ)
  const AmbientBGM = (function () {
    const bgm = new Audio("assets/audio/ambient-bgm.mp3");
    bgm.loop = true;
    bgm.volume = 0.28;
    let isPlaying = false;

    function updateUI(playing) {
      document.querySelectorAll(".btn-bgm-toggle").forEach(btn => {
        const label = btn.querySelector(".bgm-label");
        if (playing) {
          btn.classList.add("playing");
          btn.setAttribute("aria-pressed", "true");
          if (label) label.textContent = "SOM AMBIENTE: ON";
        } else {
          btn.classList.remove("playing");
          btn.setAttribute("aria-pressed", "false");
          if (label) label.textContent = "SOM AMBIENTE: OFF";
        }
      });
    }

    return {
      play: () => {
        bgm.play().then(() => {
          isPlaying = true;
          updateUI(true);
        }).catch(() => {
          isPlaying = false;
          updateUI(false);
        });
      },
      pause: () => {
        bgm.pause();
        isPlaying = false;
        updateUI(false);
      },
      toggle: () => {
        if (isPlaying) {
          bgm.pause();
          isPlaying = false;
          updateUI(false);
        } else {
          bgm.play().then(() => {
            isPlaying = true;
            updateUI(true);
          }).catch(() => {
            isPlaying = false;
            updateUI(false);
          });
        }
        return isPlaying;
      },
      isPlaying: () => isPlaying,
      duck: (targetVolume = 0.06) => {
        bgm.volume = targetVolume;
      },
      unduck: () => {
        bgm.volume = 0.28;
      }
    };
  })();

  window.AmbientBGM = AmbientBGM;

  // 1.2 GERENCIADOR DE PRÉVIA DO SOUNDBOARD (1 SOM POR VEZ + CONTROLE DE PARADA)
  const SoundboardManager = (function () {
    let currentAudio = null;
    let currentKey = null;
    let onEndedCallback = null;

    function stopCurrent() {
      if (currentAudio) {
        try {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        } catch (e) {}
        currentAudio = null;
      }
      if (onEndedCallback) {
        onEndedCallback();
        onEndedCallback = null;
      }
      currentKey = null;
      if (window.AmbientBGM) {
        window.AmbientBGM.unduck();
      }
    }

    return {
      play: (key, onStart, onEnded) => {
        // Se clicar no mesmo que já está tocando: para imediatamente
        if (currentKey === key && currentAudio && !currentAudio.paused) {
          stopCurrent();
          return false;
        }

        // Para o som que estiver tocando antes de iniciar o novo
        stopCurrent();

        const soundUrl = `assets/audio/${key === "pop" ? "click-pop" : key === "tab" ? "tab-switch" : key === "roar" ? "dino-roar" : key}.mp3`;
        const audio = new Audio(soundUrl);
        audio.volume = 0.85;

        // Diminui o som ambiente enquanto o usuário ouve a prévia
        if (window.AmbientBGM && window.AmbientBGM.isPlaying()) {
          window.AmbientBGM.duck(0.04);
        }

        currentAudio = audio;
        currentKey = key;
        onEndedCallback = onEnded;

        audio.onended = () => {
          stopCurrent();
        };

        audio.onerror = () => {
          stopCurrent();
        };

        if (onStart) onStart();
        audio.play().catch(() => {
          stopCurrent();
        });
        return true;
      },
      stop: () => {
        stopCurrent();
      },
      getCurrentKey: () => currentKey
    };
  })();

  window.SoundboardManager = SoundboardManager;

  // Listeners para botões de Som Ambiente
  function bindBgmToggles() {
    document.querySelectorAll(".btn-bgm-toggle").forEach(btn => {
      if (btn.dataset.bgmBound) return;
      btn.dataset.bgmBound = "true";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        AmbientBGM.toggle();
        ArcadeAudio.click();
      });
    });
  }
  bindBgmToggles();

  // Sons táteis nos botões principais e elementos interativos
  function bindInteractiveSounds() {
    document.querySelectorAll(".btn-tactile, .nav-link, button, .tag-pill, .pill-btn, .tab-btn, .genre-tag, .audio-play-btn, .brand-logo").forEach(btn => {
      if (btn.dataset.soundBound) return;
      btn.dataset.soundBound = "true";
      btn.addEventListener("click", () => {
        ArcadeAudio.click();
      });
    });
  }
  bindInteractiveSounds();

  // 2. LOADER DE CARREGAMENTO
  const loader = document.getElementById("loader");
  const progressFill = document.querySelector(".ld-progress-fill");

  function runLoader() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 20;
      if (progress > 100) progress = 100;
      if (progressFill) progressFill.style.width = progress + "%";

      if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (loader) loader.classList.add("hide");
          document.body.classList.remove("loading");
          document.body.classList.add("loaded");
        }, 120);
      }
    }, 25);
  }

  // 3. CONTADORES NUMÉRICOS ANIMADOS ("QUEM SOMOS")
  const counters = [
    { el: document.getElementById("count-games"), target: 43, suffix: "+" },
    { el: document.getElementById("count-views"), target: 76, suffix: "M+" }
  ];

  function runCounters() {
    counters.forEach(c => {
      if (!c.el) return;
      if (REDUCED) {
        c.el.textContent = c.target + c.suffix;
        return;
      }

      const duration = 1800;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(c.target * easeOut);
        c.el.textContent = current + c.suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    });
  }

  const aboutSection = document.querySelector(".about-section");
  if (aboutSection) {
    let counted = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          runCounters();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(aboutSection);
  }

  // 4. ABAS DE SERVIÇOS & MORPHING DO PAINEL
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const panel = document.getElementById("services-panel");
  const triangle = document.getElementById("panel-triangle");

  const TAB_COLORS = {
    "tab-saas": "#10b981",        // Dino Green
    "tab-criativos": "#ff5436",   // Coral Neon
    "tab-identidade": "#8b5cf6"   // Gamepad Purple
  };

  function setTab(targetId, btnElement) {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(tc => tc.classList.remove("active"));

    btnElement.classList.add("active");
    const activeContent = document.getElementById(targetId);
    if (activeContent) {
      activeContent.classList.add("active");
      activeContent.querySelectorAll(".motion-reveal").forEach(el => el.classList.add("is-revealed"));
    }

    const colorKey = Array.from(btnElement.classList).find(c => TAB_COLORS[c]);
    const activeColor = TAB_COLORS[colorKey] || "#10b981";
    if (panel) {
      panel.style.backgroundColor = activeColor;
      panel.style.setProperty("--panel-active", activeColor);
    }
    if (triangle) {
      triangle.style.backgroundColor = activeColor;
      const navRect = btnElement.parentElement.getBoundingClientRect();
      const btnRect = btnElement.getBoundingClientRect();
      const centerPercent = ((btnRect.left + btnRect.width / 2 - navRect.left) / navRect.width) * 100;
      triangle.style.left = centerPercent + "%";
    }

    ArcadeAudio.tabSwitch();

    document.querySelectorAll("video").forEach(v => {
      if (v.closest(".tab-content.active") && !v.closest(".arcade-modal")) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      setTab(target, btn);
    });
  });

  // 5. FILTRO POR GÊNERO DE JOGO
  const genreTags = document.querySelectorAll(".genre-tag");
  genreTags.forEach(tag => {
    tag.addEventListener("click", () => {
      genreTags.forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      const filter = tag.getAttribute("data-filter");
      ArcadeAudio.blip();

      document.querySelectorAll(".tab-content.active .video-card").forEach(card => {
        const genre = card.getAttribute("data-genre");
        if (filter === "all" || genre === filter || genre === "all") {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  // 6. BOTÕES FLUTUANTES DE SOM NOS CARDS
  const ICON_MUTED = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  const ICON_UNMUTED = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

  document.querySelectorAll(".video-card").forEach(card => {
    const video = card.querySelector("video");
    const soundBtn = card.querySelector(".btn-sound");
    if (!video || !soundBtn) return;

    soundBtn.innerHTML = ICON_MUTED;

    soundBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // não abre o modal
      ArcadeAudio.blip();
      if (video.muted) {
        document.querySelectorAll("video").forEach(v => {
          v.muted = true;
          const b = v.parentElement.querySelector(".btn-sound");
          if (b) b.innerHTML = ICON_MUTED;
        });
        video.muted = false;
        soundBtn.innerHTML = ICON_UNMUTED;
      } else {
        video.muted = true;
        soundBtn.innerHTML = ICON_MUTED;
      }
    });

    // Clique no Card abre o Arcade CRT Modal Lightbox
    card.addEventListener("click", () => {
      const videoSrc = card.getAttribute("data-video") || video.currentSrc;
      const title = card.getAttribute("data-title") || "TRAILER GAMEPLAY";
      const tag = card.getAttribute("data-tag") || "STEAM READY";
      openArcadeModal(videoSrc, title, tag);
    });
  });

  // 7. ARCADE CRT MODAL LIGHTBOX
  const modal = document.getElementById("arcade-modal");
  const modalBackdrop = document.getElementById("arcade-modal-backdrop");
  const modalClose = document.getElementById("arcade-modal-close");
  const modalVideo = document.getElementById("modal-video");
  const modalTitle = document.getElementById("modal-game-title");
  const modalTag = document.getElementById("modal-game-tag");
  const modalCta = document.getElementById("modal-cta-btn");

  function openArcadeModal(src, title, tag) {
    if (!modal || !modalVideo) return;
    ArcadeAudio.whoosh();
    AmbientBGM.duck(0.04);
    modalTitle.textContent = title;
    modalTag.textContent = tag;
    modalVideo.src = src;
    modalVideo.muted = false;
    modalVideo.play().catch(() => {});

    if (modalCta) {
      const msg = encodeURIComponent(`Oi! Vi o trailer de ${title} no site do DinoMotion e quero um trailer no mesmo estilo para meu jogo!`);
      modalCta.href = "#study-details";
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeArcadeModal() {
    if (!modal) return;
    ArcadeAudio.blip();
    AmbientBGM.unduck();
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = "";
    }
    document.body.style.overflow = "";
  }

  if (modalClose) modalClose.addEventListener("click", closeArcadeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeArcadeModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("open")) {
      closeArcadeModal();
    }
  });

  // 8. BALÃO DE FALA INTERATIVO DO DINO REX
  const DINO_QUOTES = [
    "ROAR! Bora transformar gameplay em Wishlists? 🎮",
    "Press START para dominar a Steam! 🚀",
    "60 FPS ou nada! Trailers épicos de verdade. 🦖",
    "Lucas cuida dos cortes, eu cuido do hype! ✨",
    "Este é um conceito de interface para trailers de games",
    "Insert Coin: Trailer cinematográfico pronto! 👾"
  ];
  let quoteIndex = 0;

  function triggerDinoSpeech(bubbleId) {
    const bubble = document.getElementById(bubbleId);
    if (!bubble) return;
    const textEl = bubble.querySelector(".speech-text");
    if (textEl) textEl.textContent = DINO_QUOTES[quoteIndex % DINO_QUOTES.length];
    quoteIndex++;
    bubble.classList.add("visible");
    ArcadeAudio.roar();

    // Squish & Jump animation no mascote
    const wrapper = bubbleId === "dino-speech-bubble" ? mascotDesktop : mascotMobile;
    if (wrapper) {
      wrapper.classList.remove("dino-jump");
      void wrapper.offsetWidth; // reflow
      wrapper.classList.add("dino-jump");
      setTimeout(() => wrapper.classList.remove("dino-jump"), 500);
    }

    clearTimeout(bubble._timer);
    bubble._timer = setTimeout(() => {
      bubble.classList.remove("visible");
    }, 3200);
  }

  const mascotDesktop = document.getElementById("dino-mascot-wrapper");
  if (mascotDesktop) {
    mascotDesktop.addEventListener("click", () => triggerDinoSpeech("dino-speech-bubble"));
  }

  const mascotMobile = document.getElementById("dino-mascot-mobile-wrapper");
  if (mascotMobile) {
    mascotMobile.addEventListener("click", () => triggerDinoSpeech("dino-speech-bubble-mobile"));
  }

  // 9. 3D TILT TÁTIL NAS CAIXAS BIG BOX
  const productCards = document.querySelectorAll(".product-box-card");
  productCards.forEach(card => {
    const boxImg = card.querySelector(".prod-box-art img");
    if (!boxImg) return;

    card.addEventListener("mousemove", (e) => {
      if (REDUCED) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = -(y / rect.height) * 16;
      const rotY = (x / rect.width) * 16;
      boxImg.style.transform = `perspective(600px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.08)`;
      boxImg.style.transition = "transform 0.05s ease-out";
    });

    card.addEventListener("mouseleave", () => {
      boxImg.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
      boxImg.style.transition = "transform 0.4s ease-out";
    });
  });

  // 10. PISCAR ESPONTÂNEO DOS OLHOS DO DINO
  function blinkDino() {
    const eyelids = document.querySelectorAll(".dino-eyelid-right, .dino-eyelid-left");
    if (eyelids.length === 0 || REDUCED) return;

    eyelids.forEach(el => el.style.transform = "scaleY(1)");
    setTimeout(() => {
      eyelids.forEach(el => el.style.transform = "scaleY(0)");
    }, 140);

    const nextBlink = Math.random() * 2500 + 2000;
    setTimeout(blinkDino, nextBlink);
  }

  // 11. ENHANCED SCROLL REVEAL (INTERSECTION OBSERVER UNIVERSAL)
  function initScrollReveal() {
    const targets = document.querySelectorAll(
      ".section-header, .section-badge, .section-title, .about-card, .about-info h2, .about-text, .tag-pill, .counter-box, .video-card, .product-box-card, .cta-box, .tab-btn, .products-catalog-callout, .hero-badge, .hero-title, .hero-description, .hero-actions, .hero-mascot-container, .hero-mascot-mobile, .footer-col"
    );

    if (REDUCED) {
      targets.forEach(el => el.classList.add("is-revealed"));
      return;
    }

    targets.forEach(el => {
      if (!el.classList.contains("motion-reveal")) {
        el.classList.add("motion-reveal");
      }
    });

    document.querySelectorAll(".video-grid, .products-grid, .counters-grid, .about-tags, .hero-actions, .product-spec-grid").forEach(grid => {
      grid.querySelectorAll(".motion-reveal").forEach((el, idx) => {
        el.style.setProperty("--stagger-i", idx);
      });
    });

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -25px 0px"
    });

    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        el.classList.add("is-revealed");
      } else {
        revealObserver.observe(el);
      }
    });
  }

  // 12. SPOTLIGHT GLOW NOS CARDS
  function initSpotlightCards() {
    if (REDUCED) return;
    const motionCards = document.querySelectorAll(".motion-card");
    motionCards.forEach(card => {
      let rafId = null;
      card.addEventListener("mousemove", (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty("--mouse-x", `${x}px`);
          card.style.setProperty("--mouse-y", `${y}px`);
        });
      });
    });
  }

  // 13. BOTÕES MAGNÉTICOS TÁTEIS
  function initMagneticButtons() {
    if (REDUCED || !window.matchMedia("(pointer: fine)").matches) return;
    const magneticBtns = document.querySelectorAll(".btn-magnetic");
    magneticBtns.forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.18;
        const deltaY = (e.clientY - centerY) * 0.22;
        btn.style.transform = `translate(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0px, 0px)";
      });
    });
  }

  // 14. SUBTLE MOUSE TRACKING NO DINO REX
  function initMascotTracking() {
    if (REDUCED || !mascotDesktop || !window.matchMedia("(pointer: fine)").matches) return;
    let dinoRaf = null;
    window.addEventListener("mousemove", (e) => {
      if (dinoRaf) cancelAnimationFrame(dinoRaf);
      dinoRaf = requestAnimationFrame(() => {
        const rect = mascotDesktop.getBoundingClientRect();
        const mascotX = rect.left + rect.width / 2;
        const mascotY = rect.top + rect.height / 2;
        const tiltX = Math.max(-4, Math.min(4, (e.clientX - mascotX) / 80));
        const tiltY = Math.max(-3, Math.min(3, (e.clientY - mascotY) / 100));
        const dinoImg = mascotDesktop.querySelector(".dino-mascot-img");
        if (dinoImg) {
          dinoImg.style.transform = `rotate(${tiltX.toFixed(2)}deg) translateY(${tiltY.toFixed(2)}px)`;
        }
      });
    });
  }

  // 15. RETRO GAMER XP SCROLL PROGRESS HUD & VELOCITY TICKER
  function initScrollHud() {
    const fill = document.getElementById("scroll-hud-fill");
    const pin = document.getElementById("scroll-hud-pin");
    const pctLabel = document.getElementById("scroll-hud-pct");
    const tickerTrack = document.querySelector(".ticker-track");

    let lastScrollY = window.scrollY;
    let tickerTimer = null;
    let lastMilestone = 0;

    window.addEventListener("scroll", () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const currentScroll = window.scrollY;
      const pct = Math.min(100, Math.max(0, Math.round((currentScroll / docHeight) * 100)));

      if (fill) fill.style.width = pct + "%";
      if (pin) pin.style.left = pct + "%";
      if (pctLabel) pctLabel.textContent = pct + "%";

      // Milestone audio feedback (25%, 50%, 75%, 100%)
      const milestone = Math.floor(pct / 25) * 25;
      if (milestone > 0 && milestone !== lastMilestone && ArcadeAudio.isEnabled()) {
        lastMilestone = milestone;
        if (milestone === 100) {
          ArcadeAudio.victory();
        } else {
          ArcadeAudio.coin();
        }
      }

      // Ticker acceleration on fast scroll
      const delta = Math.abs(currentScroll - lastScrollY);
      if (delta > 30 && tickerTrack) {
        tickerTrack.classList.add("accelerated");
        clearTimeout(tickerTimer);
        tickerTimer = setTimeout(() => {
          tickerTrack.classList.remove("accelerated");
        }, 1200);
      }
      lastScrollY = currentScroll;
    }, { passive: true });
  }

  window.addEventListener("DOMContentLoaded", () => {
    runLoader();
    setTimeout(blinkDino, 1500);
    bindBgmToggles();
    bindInteractiveSounds();
    initScrollReveal();
    initSpotlightCards();
    initMagneticButtons();
    initMascotTracking();
    initScrollHud();
  });
})();
