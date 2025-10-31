/* v1.4 2025-10-29T21:00:00Z */
import { renderDarkPlace } from "./renderers/dark-place.js";
import { renderFrightfulStory } from "./renderers/frightful-story.js";

const renderers = {
  "dark-place": renderDarkPlace,
  "frightful-story": renderFrightfulStory,
};

async function loadContent() {
  console.log("Starting loadContent...");
  const id = new URLSearchParams(location.search).get("id");
  console.log("ID:", id);

  const index = await fetch("/data/index.json").then(r => r.json());
  console.log("Index loaded:", index);

  const path = index[id];
  console.log("Path:", path);

  const res = await fetch(`/data/contents/${path}`);
  console.log("Response status:", res.status);
  const data = await res.json();
  console.log("Data loaded:", data);

  renderContent(data);
}

function renderContent(data) {
  const container = document.getElementById("content-container");
  const renderer = renderers[data.type];
  if (!renderer) return showError(`No renderer for type: ${data.type}`);

  container.innerHTML = renderer(data);
}

function showError(msg) {
  document.getElementById("content-container").innerHTML = `<p>${msg}</p>`;
}

loadContent();
