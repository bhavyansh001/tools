const filters = Array.from(document.querySelectorAll(".filter-pill"));
const cards = Array.from(document.querySelectorAll(".tool-card"));
const searchInput = document.querySelector("#tool-search");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");

let activeFilter = new URLSearchParams(window.location.search).get("category") || "All";

const normalize = (value) => value.trim().toLowerCase();

function updateUrl() {
  const params = new URLSearchParams(window.location.search);

  if (activeFilter === "All") {
    params.delete("category");
  } else {
    params.set("category", activeFilter);
  }

  const query = searchInput.value.trim();
  if (query) {
    params.set("q", query);
  } else {
    params.delete("q");
  }

  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
  window.history.replaceState({}, "", next);
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

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q");
if (initialQuery) {
  searchInput.value = initialQuery;
}

if (!filters.some((button) => button.dataset.filter === activeFilter)) {
  activeFilter = "All";
}

const observer = "IntersectionObserver" in window
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
});

render();
