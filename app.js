(() => {
  const entrance = document.getElementById("entrance");
  const butterfly = document.getElementById("butterfly");
  const experience = document.getElementById("experience");
  const pageIndicator = document.getElementById("pageIndicator");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const mobileTrack = document.getElementById("mobileTrack");
  const storyProgress = document.getElementById("storyProgress");
  const ambience = document.getElementById("ambience");
  const muteBtn = document.getElementById("muteBtn");

  let pageFlip = null;
  let opened = false;
  const MUTE_KEY = "siphokazi-kit-muted";

  function isMobile() {
    return window.matchMedia("(max-width: 860px)").matches;
  }

  function isMuted() {
    return localStorage.getItem(MUTE_KEY) === "1";
  }

  function setMuted(muted) {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    if (ambience) {
      ambience.muted = muted;
      ambience.volume = muted ? 0 : 0.32;
    }
    if (muteBtn) {
      muteBtn.classList.toggle("is-muted", muted);
      muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
      muteBtn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
      const icon = muteBtn.querySelector(".mute-icon");
      if (icon) icon.textContent = "♪";
    }
  }

  function startAmbience() {
    if (!ambience) return;
    const muted = isMuted();
    ambience.loop = true;
    ambience.volume = muted ? 0 : 0.32;
    ambience.muted = muted;
    setMuted(muted);
    const play = ambience.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        /* Autoplay may still fail in rare cases; mute button remains available */
      });
    }
  }

  if (muteBtn) {
    setMuted(isMuted());
    muteBtn.addEventListener("click", () => {
      const next = !isMuted();
      setMuted(next);
      if (!next && ambience && ambience.paused && opened) {
        ambience.play().catch(() => {});
      }
    });
  }

  function openExperience() {
    if (opened) return;
    opened = true;

    butterfly.classList.add("is-flying");
    startAmbience();

    window.setTimeout(() => {
      entrance.classList.add("is-leaving");
      experience.hidden = false;
      requestAnimationFrame(() => experience.classList.add("is-open"));

      if (isMobile()) {
        setupMobile();
      } else {
        setupFlipbook();
      }

      window.setTimeout(() => entrance.remove(), 1000);
    }, 900);
  }

  butterfly.addEventListener("click", openExperience);
  butterfly.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openExperience();
    }
  });

  function setupFlipbook() {
    const el = document.getElementById("flipbook");
    if (!el || typeof St === "undefined" || !St.PageFlip) {
      console.warn("PageFlip unavailable");
      return;
    }

    const wrap = el.parentElement;
    const width = Math.floor(wrap.clientWidth);
    const height = Math.floor(wrap.clientHeight);

    pageFlip = new St.PageFlip(el, {
      width: Math.max(320, Math.floor(width / 2)),
      height: Math.max(420, height),
      size: "stretch",
      minWidth: 280,
      maxWidth: 560,
      minHeight: 400,
      maxHeight: 800,
      drawShadow: true,
      flippingTime: 900,
      usePortrait: true,
      startZIndex: 0,
      autoSize: true,
      maxShadowOpacity: 0.35,
      showCover: true,
      mobileScrollSupport: false,
      swipeDistance: 40,
      clickEventForward: true,
      useMouseEvents: true,
      disableFlipByClick: false,
    });

    pageFlip.loadFromHTML(document.querySelectorAll("#flipbook .sheet"));

    const updateIndicator = () => {
      const current = pageFlip.getCurrentPageIndex() + 1;
      const total = pageFlip.getPageCount();
      pageIndicator.textContent = `${current} / ${total}`;
    };

    pageFlip.on("flip", updateIndicator);
    pageFlip.on("changeState", updateIndicator);
    updateIndicator();

    prevBtn.addEventListener("click", () => pageFlip.flipPrev());
    nextBtn.addEventListener("click", () => pageFlip.flipNext());

    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "ArrowLeft") pageFlip.flipPrev();
        if (e.key === "ArrowRight") pageFlip.flipNext();
      },
      { passive: true },
    );
  }

  function setupMobile() {
    const stories = [...mobileTrack.querySelectorAll(".story")];
    if (!stories.length) return;

    storyProgress.innerHTML = stories.map(() => "<span><i></i></span>").join("");
    const bars = [...storyProgress.querySelectorAll("span")];

    const syncProgress = () => {
      const index = Math.round(mobileTrack.scrollTop / mobileTrack.clientHeight);
      bars.forEach((bar, i) => {
        bar.classList.toggle("is-done", i < index);
        bar.classList.toggle("is-active", i === index);
      });
    };

    mobileTrack.addEventListener(
      "scroll",
      () => window.requestAnimationFrame(syncProgress),
      { passive: true },
    );
    syncProgress();

    mobileTrack.addEventListener("click", (e) => {
      if (e.target.closest("a, button, .mission-scroll, .rate-orbit")) return;
      const y = e.clientY;
      const h = window.innerHeight;
      if (y > h * 0.78) {
        mobileTrack.scrollBy({ top: mobileTrack.clientHeight, behavior: "smooth" });
      } else if (y < h * 0.22 && mobileTrack.scrollTop > 10) {
        mobileTrack.scrollBy({ top: -mobileTrack.clientHeight, behavior: "smooth" });
      }
    });
  }

  const petals = document.querySelector(".entrance__petals");
  if (petals) {
    for (let i = 0; i < 14; i++) {
      const speck = document.createElement("span");
      speck.style.cssText = `
        position:absolute;
        width:${4 + Math.random() * 6}px;
        height:${4 + Math.random() * 6}px;
        border-radius:50% 50% 45% 55%;
        background:rgba(255,${180 + Math.floor(Math.random() * 50)},${210 + Math.floor(Math.random() * 30)},${0.35 + Math.random() * 0.4});
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation: floatSpeck ${6 + Math.random() * 8}s ease-in-out ${Math.random() * 4}s infinite;
      `;
      petals.appendChild(speck);
    }

    const style = document.createElement("style");
    style.textContent = `
      @keyframes floatSpeck {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
        50% { transform: translateY(-28px) rotate(20deg); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
})();
