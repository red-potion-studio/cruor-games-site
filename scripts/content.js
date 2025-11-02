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
  initSidebarTools(); // <-- aggiunto
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

loadContent();
