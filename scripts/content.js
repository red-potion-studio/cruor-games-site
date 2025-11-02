/* v1.8 2025-11-02T12:00:00Z */
import { renderDarkPlace, initMapMarkers } from "./renderers/dark-place.js";
import { renderFrightfulStory } from "./renderers/frightful-story.js";

const renderers = {
  "dark-place": renderDarkPlace,
  "frightful-story": renderFrightfulStory,
};

async function loadContent() {
  const id = new URLSearchParams(location.search).get("id");
  const index = await fetch("data/index.json").then((r) => r.json());
  const path = index[id];
  const res = await fetch(`data/contents/${path}`);
  const data = await res.json();

  renderContent(data);
}

function renderContent(data) {
  const container = document.getElementById("content-container");
  const renderer = renderers[data.type];
  if (!renderer) return showError(`No renderer for type: ${data.type}`);

  loadStyleForType(data.type);
  container.innerHTML = renderer(data);

  if (data.type === "dark-place") {
    initMapMarkers();
    Tooltips.refresh();
  }

  symbolizeSpans();
  initSidebarTools();
  initCollapsibles();
}

function loadStyleForType(type) {
  const existing = document.getElementById("dynamic-style");
  if (existing) existing.remove();

  const link = document.createElement("link");
  link.id = "dynamic-style";
  link.rel = "stylesheet";
  link.href = `css/${type}.css`;
  document.head.appendChild(link);
}

function showError(msg) {
  document.getElementById("content-container").innerHTML = `<p>${msg}</p>`;
}

async function symbolizeSpans() {
  try {
    const iconMap = await fetch("data/icons.json").then((r) => r.json());
    document.querySelectorAll("span[type=symbolize]").forEach((span) => {
      const key = span.textContent.trim();
      if (!iconMap[key]) return;
      const icon = document.createElement("img");
      icon.src = iconMap[key];
      icon.alt = key;
      icon.classList.add("inline-icon");
      span.prepend(icon);
    });
  } catch (err) {
    console.error("Symbolize error:", err);
  }
}

/* ---------------------------------------------------
   Keyword Highlighter + Sidebar
--------------------------------------------------- */
function initSidebarTools() {
  // Crea sidebar se non esiste
  if (!document.getElementById("sidebar")) {
    const sidebar = document.createElement("aside");
    sidebar.id = "sidebar";
    sidebar.innerHTML = `<button id="toggleHighlight" class="tool-btn">Keyword Highlighter</button>`;
    document.body.appendChild(sidebar);
  }

  const btn = document.getElementById("toggleHighlight");
  btn.addEventListener("click", async () => {
    btn.classList.toggle("active");
    if (btn.classList.contains("active")) {
      await highlightKeywords("data/keywords.json");
    } else {
      removeHighlights();
    }
  });
}

/* ---------------------------------------------------
   Collapsible Sections
--------------------------------------------------- */
function initCollapsibles() {
  document.querySelectorAll("section.collapsible").forEach(section => {
    const header = section.querySelector("h2");
    const content = Array.from(section.children).filter(el => el !== header);
    if (!header || !content.length) return;

    // Crea wrapper per animazione
    const wrapper = document.createElement("div");
    wrapper.classList.add("collapse-wrapper");
    content.forEach(el => wrapper.appendChild(el));
    section.appendChild(wrapper);

    // Inizializzazione asincrona per attendere il layout completo
    requestAnimationFrame(() => {
      wrapper.style.maxHeight = wrapper.scrollHeight + "px";
    });

    header.addEventListener("click", () => {
      const isCollapsed = section.classList.toggle("collapsed");
      header.classList.toggle("collapsed", isCollapsed);

      if (isCollapsed) {
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
        wrapper.offsetHeight; // forza reflow
        wrapper.style.maxHeight = "0";
        wrapper.style.opacity = "0";
      } else {
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
        wrapper.style.opacity = "1";
        wrapper.addEventListener(
          "transitionend",
          () => (wrapper.style.maxHeight = "none"),
          { once: true }
        );
      }
    });
  });
}

async function highlightKeywords(jsonUrl) {
  const res = await fetch(jsonUrl);
  const keywords = await res.json();

  const walker = document.createTreeWalker(
    document.getElementById("content-container"),
    NodeFilter.SHOW_TEXT
  );
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const parent = node.parentNode;
    if (!parent || parent.tagName === "SCRIPT" || parent.tagName === "STYLE")
      continue;

    let text = node.textContent;
    let replaced = false;

    for (const { keyword, color, icon } of keywords) {
      const regex = new RegExp(`\\b(${keyword})(?=[.,;:!?)]?\\s|$)`, "g");
      if (regex.test(text)) {
        replaced = true;
        const iconHTML = icon
          ? `<img src="${icon}" alt="" class="keyword-icon"> `
          : "";

        text = text.replace(
          regex,
          `<span class="highlighted-word" style="color:${color};">${iconHTML}$1</span>`
        );
      }
    }

    if (replaced) {
      const span = document.createElement("span");
      span.innerHTML = text;
      parent.replaceChild(span, node);
    }
  }
}

function removeHighlights() {
  document.querySelectorAll(".highlighted-word").forEach((el) => {
    el.outerHTML = el.textContent.trim();
  });
}

document.getElementById("toggleAccessibility").addEventListener("click", () => {
  const btn = document.getElementById("toggleAccessibility");
  const body = document.body;

  body.classList.toggle("accessible-theme");
  btn.classList.toggle("active", body.classList.contains("accessible-theme"));

  // Salva preferenza
  localStorage.setItem(
    "accessibleTheme",
    body.classList.contains("accessible-theme")
  );
});

// Ripristina preferenza all’avvio
if (localStorage.getItem("accessibleTheme") === "true") {
  document.body.classList.add("accessible-theme");
  document.getElementById("toggleAccessibility")?.classList.add("active");
}

// === Line Spacing Slider ===
const spacingSlider = document.getElementById("lineSpacingSlider");
if (spacingSlider) {
  // imposta il valore iniziale da localStorage
  const savedSpacing = localStorage.getItem("lineSpacing");
  if (savedSpacing) {
    document.body.style.setProperty("--line-height", savedSpacing);
    spacingSlider.value = savedSpacing;
    applyLineSpacing(savedSpacing);
  }

  spacingSlider.addEventListener("input", e => {
    const value = parseFloat(e.target.value).toFixed(1);
    applyLineSpacing(value);
    localStorage.setItem("lineSpacing", value);
  });
}

function applyLineSpacing(value) {
  document.querySelectorAll("p, li, .content-article").forEach(el => {
    el.style.lineHeight = value;
  });
}

// === Notes Drawer ===
const notesBtn = document.getElementById("toggleNotes");
const notesDrawer = document.getElementById("notesDrawer");
const notesArea = document.getElementById("notesArea");
const clearBtn = document.getElementById("clearNotes");

// apri/chiudi
if (notesBtn && notesDrawer) {
  notesBtn.addEventListener("click", () => {
    notesDrawer.classList.toggle("active");
    notesBtn.classList.toggle("active", notesDrawer.classList.contains("active"));
  });
}

// carica note salvate
if (notesArea) {
  notesArea.value = localStorage.getItem("userNotes") || "";
  notesArea.addEventListener("input", () => {
    localStorage.setItem("userNotes", notesArea.value);
  });
}

// pulisci note
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    notesArea.value = "";
    localStorage.removeItem("userNotes");
  });
}

loadContent();
