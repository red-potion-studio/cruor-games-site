/* v2.5 2025-12-05T16:20:00Z */

const libraryContainer = document.getElementById("library-container");
const searchInput = document.getElementById("search-input");
const categoryFilters = document.getElementById("category-filters");
const sortSelect = document.getElementById("sort-select");
const sortBar = document.getElementById("sort-bar");
const itemsSelect = document.getElementById("items-select");

const viewCardsBtn = document.getElementById("view-cards");
const viewListBtn = document.getElementById("view-list");

let currentView = "cards"; // "cards" o "list"
let contents = [];
let categories = [];
let activeFilters = new Set();
let currentSort = "az";
let currentSortDir = "asc";
let currentPage = 1;
let filteredResults = [];
let ITEMS_PER_PAGE = parseInt(itemsSelect.value, 10);

/* --- VIEW TOGGLE --- */
viewCardsBtn.addEventListener("click", () => {
  currentView = "cards";
  viewCardsBtn.classList.add("active");
  viewListBtn.classList.remove("active");
  renderPage();
});

viewListBtn.addEventListener("click", () => {
  currentView = "list";
  viewListBtn.classList.add("active");
  viewCardsBtn.classList.remove("active");
  renderPage();
});

/* --- LOAD DATA --- */
async function loadLibrary() {
  try {
    const res = await fetch("/data/library.json");
    const data = await res.json();
    contents = data.contents;
    categories = data.categories;
    renderFilters();
    filteredResults = contents;
    renderPage();
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

  document.querySelectorAll(".filter-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const id = icon.dataset.id;
      if (activeFilters.has(id)) activeFilters.delete(id);
      else activeFilters.add(id);
      icon.classList.toggle("active");
      applyFilters();
      if (window.Tooltips && typeof window.Tooltips.hide === "function") {
        window.Tooltips.hide();
      }
    });
  });
}

/* --- FILTERING --- */
function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  let filtered = contents.filter((c) => {
    const matchesText =
      c.title.toLowerCase().includes(query) ||
      c.tags.some((t) => t.toLowerCase().includes(query));
    const matchesCategory =
      activeFilters.size === 0 || activeFilters.has(c.category);
    return matchesText && matchesCategory;
  });

  filtered.sort((a, b) => {
    switch (currentSort) {
      case "az":
        return a.title.localeCompare(b.title);
      case "za":
        return b.title.localeCompare(a.title);
      case "newest":
        return new Date(b.date) - new Date(a.date);
      case "oldest":
        return new Date(a.date) - new Date(b.date);
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  filteredResults = filtered;
  currentPage = 1;
  renderPage();
}

/* --- RENDER LIBRARY --- */
function renderLibrary(list) {
  if (window.Tooltips && typeof window.Tooltips.hide === "function") {
    window.Tooltips.hide();
  }

  if (currentView === "cards") {
    // Reset card state
    document.querySelectorAll(".card").forEach((card) => {
      card.classList.remove("flipped", "active", "hidden");
    });

    sortBar.style.display = "inline-block";
    libraryContainer.className = "library-grid";

    libraryContainer.innerHTML = list
      .map((item) => {
        const cat = categories.find((c) => c.id === item.category);
        const catName = cat ? cat.name : "Unknown";
        const catIcon = cat ? cat.icon : "";
        const newClass = item.isNew ? " card-new" : "";

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
  <div class="card ${premiumClass}${newClass}" 
       data-title="${item.title.toLowerCase()}"
       data-tags="${item.tags.join(",").toLowerCase()}"
       data-category="${item.category.toLowerCase()}">

    <div class="card-inner">
      ${item.isNew ? `<div class="ribbon"><span>NEW</span></div>` : ""}

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

  </div>`;
      })
      .join("");

    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => {
        card.classList.toggle("flipped");
        if (window.Tooltips && typeof window.Tooltips.hide === "function") {
          window.Tooltips.hide();
        }
      });
    });

    document.querySelectorAll(".content-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.Tooltips && typeof window.Tooltips.hide === "function") {
          window.Tooltips.hide();
        }
      });
    });
  } else if (currentView === "list") {
    libraryContainer.className = "library-list";
    sortBar.style.display = "none";

    const showMonsterColumns =
      activeFilters.size === 1 && activeFilters.has("terrifying-monsters");

    libraryContainer.innerHTML = `
      <table class="library-table">
        <thead>
          <tr>
            <th data-sort="title">Name</th>
            <th data-sort="category">Category</th>
            ${
              showMonsterColumns
                ? '<th data-sort="monsterType">Type</th><th data-sort="CR">CR</th>'
                : ""
            }
          </tr>
        </thead>
        <tbody>
          ${list
            .map(
              (item) => `
            <tr>
              <td><a href="content.html?id=${item.id}" class="list-title">${item.title}</a></td>
              <td>${item.listCategory}</td>
              ${
                showMonsterColumns
                  ? `<td>${item.monsterType || ""}</td><td>${item.CR || ""}</td>`
                  : ""
              }
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    document.querySelectorAll(".library-table th[data-sort]").forEach((th) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (currentSort === key) {
          currentSortDir = currentSortDir === "asc" ? "desc" : "asc";
        } else {
          currentSort = key;
          currentSortDir = "asc";
        }

        filteredResults.sort((a, b) => {
          let va = a[key] ?? "";
          let vb = b[key] ?? "";

          if (!isNaN(Date.parse(va)) && !isNaN(Date.parse(vb))) {
            return currentSortDir === "asc"
              ? new Date(va) - new Date(vb)
              : new Date(vb) - new Date(va);
          }

          if (!isNaN(va) && !isNaN(vb)) {
            return currentSortDir === "asc" ? va - vb : vb - va;
          }

          return currentSortDir === "asc"
            ? va.toString().localeCompare(vb.toString())
            : vb.toString().localeCompare(va.toString());
        });

        document
          .querySelectorAll(".library-table th[data-sort]")
          .forEach((el) => el.classList.remove("sorted-asc", "sorted-desc"));

        th.classList.add(
          currentSortDir === "asc" ? "sorted-asc" : "sorted-desc"
        );

        currentPage = 1;
        renderPage();

        setTimeout(() => {
          const thAfter = document.querySelector(
            `.library-table th[data-sort="${currentSort}"]`
          );
          if (thAfter) {
            thAfter.classList.add(
              currentSortDir === "asc" ? "sorted-asc" : "sorted-desc"
            );
          }
        }, 0);
      });
    });
  }
}

/* --- PAGINATION --- */
function renderPage() {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filteredResults.slice(start, end);

  renderLibrary(pageItems);
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let buttons = "";
  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  pagination.innerHTML = buttons;

  document.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      currentPage = Number(e.target.dataset.page);
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

/* --- INIT --- */
searchInput.addEventListener("input", applyFilters);

sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  applyFilters();
});

itemsSelect.addEventListener("change", () => {
  ITEMS_PER_PAGE = parseInt(itemsSelect.value, 10);
  currentPage = 1;
  renderPage();
});

loadLibrary();