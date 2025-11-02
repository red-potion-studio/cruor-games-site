/* v1.2 2025-11-02T13:10:00Z */
export function renderDarkPlace(data) {
  const plotTable = `
    <table class="header-table">
      <tr><th>Biome</th><td>${data.plot.biome}</td></tr>
      <tr><th>Type</th><td>${data.plot.type}</td></tr>
      <tr><th>Light</th><td>${data.plot.light}</td></tr>
      <tr><th>Size</th><td>${data.plot.size}</td></tr>
    </table>
    ${
      data.plot.introduction
        ? `<p class="plot-intro">${data.plot.introduction}</p>`
        : ""
    }
  `;

  const characteristicsHTML = data.characteristics
    ? `
    <section class="collapsible characteristics">
      <h2 class="scroll-spy-h2" id="characteristics">Characteristics</h2>
      ${data.characteristics.map((c) => `<p>${c}</p>`).join("")}
    </section>
  `
    : "";

  const areasHTML = data.areas
    ? `
    <section class="collapsible areas">
      <h2 class="scroll-spy-h2" id="areas">Areas</h2>
      <div class="areas-layout">
        <div class="areas-list">
          ${data.areas.map(renderArea).join("")}
        </div>
        ${
          data.mapImage
            ? `
          <div class="map-container">
            <div class="map-toolbar">
              <button class="map-zoom-btn" title="View Fullscreen">⤢</button>
            </div>
            <img src="${data.mapImage}" alt="Map of ${
                data.title
              }" class="map-image">
            ${
              data.mapMarkers
                ? data.mapMarkers
                    .map(
                      (m) => `
                <div class="map-marker" id="marker-${m.id}" style="left:${m.x}; top:${m.y};">
                  <span class="marker-label"><span>${m.label}</span></span>
                </div>`
                    )
                    .join("")
                : ""
            }
          </div>

          <!-- Fullscreen Modal -->
          <div class="map-modal" id="map-modal">
            <div class="map-modal-content">
              <button class="map-close-btn" title="Close">×</button>
              <div class="map-fullscreen-wrapper">
                <img src="${data.mapImage}" alt="Fullscreen Map of ${
                data.title
              }" class="map-fullscreen-image">
                ${
                  data.mapMarkers
                    ? data.mapMarkers
                        .map(
                          (m) => `
                    <div class="map-marker" id="modal-marker-${m.id}" style="left:${m.x}; top:${m.y};">
                      <span class="marker-label"><span>${m.label}</span></span>
                    </div>`
                        )
                        .join("")
                    : ""
                }
              </div>
            </div>
          </div>`
            : ""
        }
      </div>
    </section>
  `
    : "";

  const curioHTML = data.curio
    ? `
    <section class="collapsible curio">
      <h2 class="scroll-spy-h2" id="curio">Curio</h2>
      <p>${data.curio}</p>
    </section>
  `
    : "";

  const encountersHTML = data.encounters
    ? `
    <section class="collapsible encounters">
      <h2 class="scroll-spy-h2" id="encounters">Encounters</h2>
      ${
        data.encounters.description
          ? `<p>${data.encounters.description}</p>`
          : ""
      }
      ${data.encounters.tables
  ? data.encounters.tables.map((t) => renderTable(t, "encounters")).join("")
  : ""}
    </section>
  `
    : "";

  const hazardsHTML = data.hazards
    ? `
    <section class="collapsible hazards">
      <h2 class="scroll-spy-h2" id="hazards">Hazards</h2>
      ${data.hazards.map((h) => `<p>${h}</p>`).join("")}
    </section>
  `
    : "";

  const treasuresHTML = data.treasures
    ? `
    <section class="collapsible treasures">
      <h2 class="scroll-spy-h2" id="treasures">Treasures</h2>
      ${
        data.treasures.description ? `<p>${data.treasures.description}</p>` : ""
      }
      ${data.treasures.table ? renderTable(data.treasures.table, "loot") : ""}
    </section>
  `
    : "";

  return `
  <article class="content-article dark-place">
    <div class="article-header dark-place">
      <div class="article-header image">
        <img src="${data.image}" alt="${data.title}" class="content-hero">
      </div>
      <div class="article-header text">
        <h1>${data.title}</h1>
        ${plotTable}
      </div>
    </div>

    ${characteristicsHTML}
    ${areasHTML}
    ${curioHTML}
    ${encountersHTML}
    ${hazardsHTML}
    ${treasuresHTML}

    <div class="tags">${
      data.tags?.map((t) => `<span class="tag">${t}</span>`).join(" ") || ""
    }</div>
    <p class="meta">Written by ${data.author || "Unknown"} — ${
    data.date || ""
  }</p>
  </article>
  `;
}

/* === Helpers === */

function renderArea(area) {
  const safeId = area.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
  return `
    <div class="area" id="${safeId}">
      <h3 class="scroll-spy-h3">${area.name}</h3>
      <p>${area.description}</p>
    </div>
  `;
}

function renderTable(tbl, type = "") {
  if (!tbl || !tbl.headers || !tbl.rows) return "";
  const extraClass = type ? ` ${type}` : "";
  const colCount = tbl.headers.length;

  return `
    <table class="generic-table${extraClass}">
      <thead>
        <tr>${tbl.headers.map((h) => `<th>${h}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${tbl.rows
          .map((r) => {
            const first = r[0].trim();
            const restEmpty = r.slice(1).every((c) => !c.trim());
            if (first && restEmpty) {
              return `<tr class="section-header"><td colspan="${colCount}">${first}</td></tr>`;
            }
            return `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

/* === Map markers + fullscreen === */
export function initMapMarkers() {
  const attachTooltipFromArea = (markerEl, areaEl) => {
    if (!markerEl || !areaEl) return;
    const title = areaEl.querySelector("h3")?.innerText?.trim() || "";
    const text = areaEl.querySelector("p")?.innerText?.trim() || "";
    markerEl.setAttribute("data-tooltip-title", title);
    markerEl.setAttribute("data-tooltip-text", text);
  };

  // Marker sulla mappa principale
  // === Evidenziazione aree via delega eventi (funziona anche con figli degli elementi) ===
  const getAreaFromMarker = (el) => {
    if (!el?.id) return null;
    // supporta "marker-" e "modal-marker-"
    const cleaned = el.id
      .replace(/^modal-?marker-/, "")
      .replace(/^marker-/, "");
    return document.getElementById(cleaned);
  };

  // click per scroll
  document.addEventListener("click", (e) => {
    const marker = e.target.closest(".map-marker[id^='marker-']");
    if (!marker) return;
    // ignora se è nel modal
    if (marker.closest(".map-modal")) return;

    const id = marker.id.replace("marker-", "");
    const area = document.getElementById(id);
    if (area) area.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // evidenziazione on hover
  document.addEventListener("mouseover", (e) => {
    const marker = e.target.closest(".map-marker");
    if (!marker) return;
    const area = getAreaFromMarker(marker);
    area?.classList.add("highlight");
  });

  document.addEventListener("mouseout", (e) => {
    const marker = e.target.closest(".map-marker");
    if (!marker) return;
    const area = getAreaFromMarker(marker);
    area?.classList.remove("highlight");
  });

  // Marker dentro il modal
  document.querySelectorAll(".map-modal .map-marker").forEach((marker) => {
    const id = marker.id.replace("modal-marker-", "");
    const area = document.getElementById(id);
    attachTooltipFromArea(marker, area);
  });

  // === Modal logic ===
  const zoomBtn = document.querySelector(".map-zoom-btn");
  const modal = document.getElementById("map-modal");
  const closeBtn = modal?.querySelector(".map-close-btn");
  const mapContainer = modal?.querySelector(".map-fullscreen-wrapper");
  const fullscreenImg = modal?.querySelector(".map-fullscreen-image");
  const markers = modal?.querySelectorAll(".map-marker");

  if (!zoomBtn || !modal || !closeBtn || !mapContainer || !fullscreenImg)
    return;

  const openModal = () => {
    modal.classList.add("active");
    fitToScreen();
  };

  const closeModal = () => {
    modal.classList.remove("active");
    resetTransform();
  };

  zoomBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // === Zoom e Pan ===
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let minScale = 0.5; // aggiornato dinamicamente

  const updateTransform = () => {
    mapContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    mapContainer.style.transformOrigin = "center center";

    // Mantieni i marker a dimensione fissa
    markers?.forEach((m) => {
      m.style.transform = `translate(-50%, -50%) scale(${1 / scale})`;
    });
  };

  const resetTransform = () => {
    scale = minScale;
    translateX = 0;
    translateY = 0;
    updateTransform();
    mapContainer.style.cursor = "grab";
  };

  const fitToScreen = () => {
    const imgW = fullscreenImg.naturalWidth;
    const imgH = fullscreenImg.naturalHeight;
    const winW = window.innerWidth * 0.9;
    const winH = window.innerHeight * 0.9;
    const fit = Math.min(winW / imgW, winH / imgH);

    scale = fit;
    minScale = fit;
    translateX = 0;
    translateY = 0;
    updateTransform();
  };

  // Zoom con rotellina
  mapContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomSpeed = 0.0015;
    const prevScale = scale;
    scale = Math.min(Math.max(minScale, scale - e.deltaY * zoomSpeed), 4);

    // centra lo zoom sul punto del cursore
    const rect = mapContainer.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / prevScale;
    const dy = (e.clientY - rect.top - rect.height / 2) / prevScale;
    translateX -= dx * (scale - prevScale);
    translateY -= dy * (scale - prevScale);

    updateTransform();
  });

  // Drag
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let pendingFrame = null;

  const onMouseMove = (e) => {
    if (!isDragging) return;
    lastX = e.clientX - startX;
    lastY = e.clientY - startY;

    if (!pendingFrame) {
      pendingFrame = requestAnimationFrame(() => {
        translateX = lastX;
        translateY = lastY;
        updateTransform();
        pendingFrame = null;
      });
    }
  };

  const onMouseUp = () => {
    isDragging = false;
    mapContainer.style.cursor = "grab";
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    if (pendingFrame) {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = null;
    }
  };

  mapContainer.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    mapContainer.style.cursor = "grabbing";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}
