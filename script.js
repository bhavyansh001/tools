const filters = Array.from(document.querySelectorAll(".filter-pill"));
const cards = Array.from(document.querySelectorAll(".tool-card"));
const searchInput = document.querySelector("#tool-search");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const siteNav = document.querySelector("#siteNav");
const cursorOrb = document.querySelector("#cursorOrb");
const hero = document.querySelector(".hero");
const heroTitle = document.querySelector(".hero-title");
const heroTitleTop = document.querySelector(".hero-title-top");
const heroTitleBottom = document.querySelector(".hero-title-bottom");
const heroEyebrow = document.querySelector(".hero-eyebrow");
const heroFoot = document.querySelector(".hero-foot");
const heroStats = document.querySelector(".hero-stats");
const statCount = document.querySelector("#statCount");
const toolsHead = document.querySelector(".tools-head");
const controls = document.querySelector(".controls");
const toolsSection = document.querySelector(".tools-section");
const footerCurtain = document.querySelector(".cf-curtain");

const params = new URLSearchParams(window.location.search);
const validFilters = new Set(filters.map((button) => button.dataset.filter));
let activeFilter = params.get("category") || "All";

if (!validFilters.has(activeFilter)) {
  activeFilter = "All";
}

const normalize = (value) => value.trim().toLowerCase();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateUrl() {
  const nextParams = new URLSearchParams();

  if (activeFilter !== "All") {
    nextParams.set("category", activeFilter);
  }

  const query = searchInput.value.trim();
  if (query) {
    nextParams.set("q", query);
  }

  const nextUrl = `${window.location.pathname}${nextParams.toString() ? `?${nextParams}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
}

function render() {
  const query = normalize(searchInput.value);
  let visibleCount = 0;

  filters.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  cards.forEach((card) => {
    const matchesCategory = activeFilter === "All" || card.dataset.category === activeFilter;
    const searchText = normalize(`${card.innerText} ${card.dataset.search}`);
    const matchesSearch = !query || searchText.includes(query);
    const isVisible = matchesCategory && matchesSearch;

    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) visibleCount += 1;
  });

  resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "tool" : "tools"}`;
  emptyState.hidden = visibleCount !== 0;
  updateUrl();
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    render();
  });
});

searchInput.addEventListener("input", render);

const initialQuery = params.get("q");
if (initialQuery) {
  searchInput.value = initialQuery;
}

function observeCards() {
  const observer =
    "IntersectionObserver" in window && !prefersReducedMotion
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12 }
        )
      : null;

  cards.forEach((card, index) => {
    card.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;

    if (observer) {
      observer.observe(card);
    } else {
      card.classList.add("is-visible");
    }

    const openLink = card.querySelector(".open-link");
    if (openLink) {
      card.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        window.open(openLink.href, "_blank", "noreferrer");
      });
    }
  });
}

function initCursorOrb() {
  if (!cursorOrb || prefersReducedMotion) return;

  cursorOrb.innerHTML = `
    <span class="cursor-orb-trail" aria-hidden="true"></span>
    <span class="cursor-orb-core" aria-hidden="true"></span>
  `;

  const trail = cursorOrb.querySelector(".cursor-orb-trail");
  const core = cursorOrb.querySelector(".cursor-orb-core");
  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const current = { x: target.x, y: target.y };
  const trailPos = { x: target.x, y: target.y };
  const velocity = { x: 0, y: 0 };
  let rafId = 0;
  let hasPointer = false;
  let lastPointerTs = 0;

  const tick = () => {
    const now = performance.now();
    const prevX = current.x;
    const prevY = current.y;

    current.x += (target.x - current.x) * 0.12;
    current.y += (target.y - current.y) * 0.12;
    trailPos.x += (current.x - trailPos.x) * 0.045;
    trailPos.y += (current.y - trailPos.y) * 0.045;
    velocity.x = current.x - prevX;
    velocity.y = current.y - prevY;

    cursorOrb.style.transform = `translate(${current.x}px, ${current.y}px) translate(-50%, -50%)`;
    cursorOrb.classList.toggle("is-active", hasPointer);
    cursorOrb.classList.toggle("is-idle", hasPointer && now - lastPointerTs > 180);
    if (trail) {
      trail.style.transform = `translate(${trailPos.x}px, ${trailPos.y}px) translate(-50%, -50%) scale(${1.05 + Math.min(Math.hypot(velocity.x, velocity.y) / 160, 0.18)})`;
    }
    if (core) {
      const speed = Math.min(Math.hypot(velocity.x, velocity.y), 60);
      core.style.transform = `translate(-50%, -50%) scale(${1 + speed / 240})`;
      core.style.opacity = `${0.42 + Math.min(speed / 160, 0.18)}`;
    }
    rafId = window.requestAnimationFrame(tick);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      hasPointer = true;
      lastPointerTs = performance.now();
    },
    { passive: true }
  );

  window.addEventListener("mouseleave", () => {
    hasPointer = false;
  });

  window.addEventListener("blur", () => {
    hasPointer = false;
  });

  tick();

  return () => window.cancelAnimationFrame(rafId);
}

function initNavState() {
  if (!siteNav) return;

  const sync = () => {
    siteNav.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  sync();
  window.addEventListener("scroll", sync, { passive: true });
}

function initMagneticButtons() {
  if (prefersReducedMotion || typeof gsap === "undefined") return;

  document.querySelectorAll(".magnetic-btn").forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * 0.25,
        y: y * 0.25,
        rotationX: -y * 0.08,
        rotationY: x * 0.08,
        scale: 1.03,
        ease: "power2.out",
        duration: 0.35,
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        ease: "elastic.out(1, 0.35)",
        duration: 1,
      });
    });
  });
}

function initHeroMotion() {
  if (prefersReducedMotion || typeof gsap === "undefined") {
    [heroEyebrow, heroFoot, heroStats].forEach((el) => {
      if (el) el.style.opacity = "1";
    });
    if (heroTitleTop) heroTitleTop.style.transform = "none";
    if (heroTitleBottom) heroTitleBottom.style.transform = "none";
    if (statCount) statCount.textContent = "9";
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.set([heroEyebrow, heroFoot, heroStats], { opacity: 0, y: 16 });
  gsap.set([heroTitleTop, heroTitleBottom], { opacity: 0, y: 20 });
  const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

  heroTl
    .to(heroEyebrow, { opacity: 1, y: 0, duration: 0.5 }, 0)
    .to(heroTitleTop, { opacity: 1, y: 0, duration: 0.7 }, 0.08)
    .to(heroTitleBottom, { opacity: 1, y: 0, duration: 0.8 }, 0.18)
    .to(heroFoot, { opacity: 1, y: 0, duration: 0.55 }, 0.45)
    .to(heroStats, { opacity: 1, y: 0, duration: 0.55 }, 0.58);

  if (statCount) {
    const state = { value: 0 };
    gsap.to(state, {
      value: 9,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        statCount.textContent = String(Math.round(state.value));
      },
    });
  }

  if (hero) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 16;

      gsap.to(".hero-aurora", {
        x: x * 0.6,
        y: y * 0.6,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.to(".hero-grid-bg", {
        x: x * 0.28,
        y: y * 0.28,
        duration: 0.7,
        ease: "power2.out",
      });
    });
  }

  if (toolsHead && controls) {
    gsap.fromTo(
      [toolsHead, controls],
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        immediateRender: false,
        scrollTrigger: {
          trigger: toolsSection,
          start: "top 78%",
        },
      }
    );
  }

  gsap.fromTo(
    cards,
    { opacity: 0, y: 28 },
    {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: "power3.out",
      stagger: 0.08,
      immediateRender: false,
      scrollTrigger: {
        trigger: toolsSection,
        start: "top 66%",
      },
    }
  );

  if (footerCurtain) {
    gsap.fromTo(
      ".cf-center",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerCurtain,
          start: "top 62%",
          end: "bottom bottom",
        },
      }
    );
  }
}

render();
observeCards();
initNavState();
initCursorOrb();
initMagneticButtons();
initHeroMotion();
