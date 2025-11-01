/* v2.3 2025-10-30T13:55:00Z */
const libraryContainer = document.getElementById("library-container");
const searchInput = document.getElementById("search-input");
const categoryFilters = document.getElementById("category-filters");

let contents = [];
let categories = [];
let activeFilters = new Set();

/* --- LOAD DATA --- */
async function loadLibrary() {
  try {
    const res = await fetch("/data/library.json");
    const data = await res.json();
    contents = data.contents;
    categories = data.categories;
    renderFilters();
    renderLibrary(contents);
  } catch (err) {
    libraryContainer.innerHTML = `<p class="muted">Error loading library.</p>`;
    console.error(err);
  }
}

/* --- CATEGORY FILTERS --- */
function renderFilters() {
  categoryFilters.innerHTML = categories
    .map(
      (cat) => `
        <img src="${cat.icon}"
             alt="${cat.name}"
             class="filter-icon has-tooltip"
             data-id="${cat.id}"
             data-key="${cat.id}"
             data-tooltip-key="${cat.id}">
      `
    )
    .join("");

  // Gestione selezione filtri
  document.querySelectorAll(".filter-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const id = icon.dataset.id;
      if (activeFilters.has(id)) activeFilters.delete(id);
      else activeFilters.add(id);
      icon.classList.toggle("active");
      applyFilters();

      // Chiudi subito eventuale tooltip aperto
      if (window.Tooltips && typeof window.Tooltips.hide === "function") {
        window.Tooltips.hide();
      }
    });
  });
}

/* --- RENDER LIBRARY --- */
function renderLibrary(list) {
  libraryContainer.innerHTML = list
    .map((item) => {
      const cat = categories.find((c) => c.id === item.category);
      const catName = cat ? cat.name : "Unknown";
      const catIcon = cat ? cat.icon : "";
      const tags = item.tags
        ? item.tags
            .map(
              (t) =>
                `<span class="tag has-tooltip" data-key="${t.toLowerCase()}">${t}</span>`
            )
            .join("")
        : "";
      const premiumClass = item.premium ? "premium" : "";

return `
  <div class="card ${premiumClass}" 
       data-title="${item.title.toLowerCase()}"
       data-tags="${item.tags.join(",").toLowerCase()}"
       data-category="${item.category.toLowerCase()}">
    <div class="card-inner">

      <!-- FRONT -->
      <div class="card-front" style="background-image:url('${item.image}')">
        <div class="card-front-content">
          <div class="card-header">
            <img src="${catIcon}" alt="${catName}">
            <span class="category-name">${catName}</span>
          </div>
          <h3 class="card-title">${item.title}</h3>
          <div class="card-tags">${tags}</div>
        </div>
      </div>

      <!-- BACK -->
      <div class="card-back" style="background-image:url('${item.image}')">
        <div class="card-header">
          <img src="${catIcon}" alt="${catName}">
        </div>
        <div class="card-back-content">
          <p>${item.excerpt}</p>
          ${
            item.premium
              ? `<span class="content-btn locked">🔒 Premium</span>`
              : `<a href="content.html?id=${item.id}" class="content-btn">Check Now</a>`
          }
        </div>
      </div>
    </div>
  </div>
`;

    })
    .join("");

  // Gestione flip card
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
    // chiudi tooltip se aperto
    if (window.Tooltips && typeof window.Tooltips.hide === "function") {
      window.Tooltips.hide();
    }
  });
});

// Evita che il click sul bottone ritriggeri il flip
document.querySelectorAll(".content-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    // (opzionale) chiudi tooltip
    if (window.Tooltips && typeof window.Tooltips.hide === "function") {
      window.Tooltips.hide();
    }
  });
});

}

/* --- FILTERING --- */
function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = contents.filter((c) => {
    const matchesText =
      c.title.toLowerCase().includes(query) ||
      c.tags.some((t) => t.toLowerCase().includes(query));
    const matchesCategory =
      activeFilters.size === 0 || activeFilters.has(c.category);
    return matchesText && matchesCategory;
  });
  renderLibrary(filtered);
}

/* --- INIT --- */
searchInput.addEventListener("input", applyFilters);
loadLibrary();