/* v1.6 2025-11-01T22:35:00Z */
import { renderDarkPlace, initMapMarkers } from "./renderers/dark-place.js";
import { renderFrightfulStory } from "./renderers/frightful-story.js";

const renderers = {
  "dark-place": renderDarkPlace,
  "frightful-story": renderFrightfulStory,
};

async function loadContent() {
  const id = new URLSearchParams(location.search).get("id");
  const index = await fetch("data/index.json").then(r => r.json());
  const path = index[id];
  const res = await fetch(`data/contents/${path}`);
  const data = await res.json();

  renderContent(data);
}

function renderContent(data) {
  const container = document.getElementById("content-container");
  const renderer = renderers[data.type];
  if (!renderer) return showError(`No renderer for type: ${data.type}`);

  container.innerHTML = renderer(data);

  if (data.type === "dark-place") {
    initMapMarkers();
    Tooltips.refresh();
  }

  // --- Symbolize ---
  symbolizeSpans();
}

function showError(msg) {
  document.getElementById("content-container").innerHTML = `<p>${msg}</p>`;
}

async function symbolizeSpans() {
  try {
    const iconMap = await fetch("/data/icons.json").then(r => r.json());
    document.querySelectorAll('span[type="symbolize"]').forEach(span => {
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

loadContent();
