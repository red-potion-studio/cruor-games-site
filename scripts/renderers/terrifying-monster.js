/* v1.5 2025-11-09T18:20:00Z */
export function renderTerrifyingMonster(data) {
  const baseHeader = `
  <div class="article-header monster">
    <div class="article-header image">
      <img src="${data.image}" alt="${data.title}" class="content-hero">
    </div>
    <div class="article-header text">
      <h1>${data.title}</h1>
    </div>
  </div>`;

  // --- TAB SELECTOR ---
  const tabs = data.variants
    .map((v, i) => {
      const active = i === 0 ? "active" : "";
      const info = `${v.stats.size} ${v.stats.type}, ${v.stats.alignment}<br>
                <b>CR ${v.stats.challenge}</b>`;
      return `
    <button class="variant-tab has-tooltip ${active}"
            data-index="${i}"
            data-tooltip-type="Rule"
            data-tooltip-title="${v.name}"
            data-tooltip-text="${info}">
      ${v.name}
    </button>`;
    })
    .join("");

  const selector = `<div class="variant-tabs">${tabs}</div>`;

  // --- VARIANT CONTENTS ---
  const variantsHTML = data.variants
    .map((v, i) => {
      const active = i === 0 ? "active" : "";
      return `<div class="variant-content ${active}" data-index="${i}">
      ${renderVariant(v)}
    </div>`;
    })
    .join("");

  // --- OVERVIEW, WEAKSPOTS, AFFIXES, LAIR, LOOT ---
  const overviewHTML = data.overview ? renderOverview(data.overview) : "";
  const weakHTML = renderSimpleSection(
    "Weak Spots",
    "monster-weakspots",
    data.weakSpots
  );
  const affixHTML = renderSimpleSection(
    "Affixes",
    "monster-affixes",
    data.affixes
  );
  const lairHTML = renderLair(data);
  const lootHTML = renderLoot(data.loot);

  // --- TAB SWITCHING ---
  setTimeout(() => {
    const tabsEl = document.querySelectorAll(".variant-tab");
    const variantEls = document.querySelectorAll(".variant-content");

    tabsEl.forEach((tab) => {
      tab.addEventListener("click", () => {
        const index = tab.dataset.index;

        tabsEl.forEach((t) => t.classList.remove("active"));
        variantEls.forEach((v) => v.classList.remove("active"));

        tab.classList.add("active");
        const activeVariant = document.querySelector(
          `.variant-content[data-index="${index}"]`
        );
        if (activeVariant) activeVariant.classList.add("active");

        // --- reset visibilità collapsible ---
        activeVariant
          .querySelectorAll("section.collapsible")
          .forEach((section) => {
            section.classList.remove("collapsed");
            const wrapper = section.querySelector(".collapse-wrapper");
            if (wrapper) {
              wrapper.style.maxHeight = wrapper.scrollHeight + "px";
              wrapper.style.opacity = "1";
            }
          });

        // riinizializza collapsible solo per la variante attiva
        if (typeof initCollapsibles === "function") initCollapsibles();
      });
    });
  }, 50);

  return `
  <article class="content-article terrifying-monster">
    ${baseHeader}
    ${selector}
    <div class="variant-container">${variantsHTML}</div>
    ${overviewHTML}
    ${weakHTML}
    ${affixHTML}
    ${lairHTML}
    ${lootHTML}
    <div class="tags">
      ${data.tags?.map((t) => `<span class="tag">${t}</span>`).join(" ") || ""}
    </div>
    <p class="meta">Written by ${data.author || "Unknown"} — ${
    data.date || ""
  }</p>
  </article>
  `;
}

/* === VARIANT RENDERER === */
function renderVariant(v) {
  const statsTable = `
    <table class="monster-statblock">
      <tr><th>Size</th><td>${v.stats.size}</td></tr>
      <tr><th>Type</th><td>${v.stats.type}</td></tr>
      <tr><th>Alignment</th><td>${v.stats.alignment}</td></tr>
      <tr><th>Armor Class</th><td>${v.stats.ac}</td></tr>
      <tr><th>Hit Points</th><td>${v.stats.hp}</td></tr>
      <tr><th>Speed</th><td>${v.stats.speed}</td></tr>
      <tr><th>Challenge</th><td>${v.stats.challenge}</td></tr>
    </table>`;

  const abilitiesHTML = renderAbilityGrid(v.abilities);

  const traitsHTML = renderSimpleSection(
    "Traits",
    "monster-traits",
    v.traits,
    true
  );
  const actionsHTML = renderActionsGroup(v);

  return `
    <div class="variant-inner">
      ${statsTable}
      ${abilitiesHTML}
      ${traitsHTML}
      ${actionsHTML}
    </div>`;
}

/* === ACTION GROUP (Actions, Bonus, Reactions, Legendary, Mythic) === */
function renderActionsGroup(v) {
  const sections = [
    { key: "actions", title: "Actions" },
    { key: "bonusActions", title: "Bonus Actions" },
    { key: "reactions", title: "Reactions" },
    { key: "legendaryActions", title: "Legendary Actions" },
    { key: "mythicActions", title: "Mythic Actions" },
  ];

  const available = sections.filter((s) => v[s.key] && v[s.key].length);

  if (!available.length) return "";

  const inner = available
    .map(
      (s) => `
    <div class="subsection ${s.key}">
      <h3>${s.title}</h3>
      ${v[s.key].map((a) => `<p><b>${a.name}.</b> ${a.text}</p>`).join("")}
    </div>
  `
    )
    .join("");

  return `
  <section class="collapsible monster-actions-group">
    <h2 class="scroll-spy-h2">Actions</h2>
    ${inner}
  </section>`;
}

/* === OTHER HELPERS === */
function renderOverview(o) {
  return `
  <section class="collapsible monster-overview">
    <h2 class="scroll-spy-h2" id="overview">Monster Overview</h2>
    ${o.intro ? `<p>${o.intro}</p>` : ""}
    ${
      o.features
        ? `
      <div class="subsection features">
        <h3>Monster Features</h3>
        ${o.features.map((p) => `<p>${p}</p>`).join("")}
      </div>`
        : ""
    }
  </section>`;
}

function renderAbilityGrid(abilities) {
  if (!abilities) return "";

  const order = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  const rows = [order.slice(0, 3), order.slice(3, 6)];

  return `
    <div class="ability-grid">
      ${rows
        .map(
          (row) => `
        <div class="ability-row">
          ${row
            .map((abbr) => {
              const a = abilities[abbr];
              if (!a) return "";
              return `
                <div class="ability-cell">
                  <div class="pair">
                    <span class="label-placeholder">MOD</span>
                    <div class="inner">
                      <span class="abbr">${abbr}</span>
                      <span class="val">${a.value}</span>
                    </div>
                  </div>
                  <div class="mod-block">
                    <span class="label">MOD</span>
                    <span class="mod">${a.mod}</span>
                  </div>
                  <div class="save-block">
                    <span class="label">SAVE</span>
                    <span class="save">${a.save}</span>
                  </div>
                  <div class="spacer"></div>
                </div>`;
            })
            .join("")}
        </div>`
        )
        .join("")}
    </div>`;
}

function renderSimpleSection(title, cls, arr, isTrait = false) {
  if (!arr || !arr.length) return "";
  return `
  <section class="collapsible ${cls}">
    <h2 class="scroll-spy-h2">${title}</h2>
    ${arr
      .map((e) =>
        typeof e === "object"
          ? `<p><b>${e.name}.</b> ${e.text}</p>`
          : `<p>${e}</p>`
      )
      .join("")}
  </section>`;
}

function renderLair(data) {
  if (!data.hasLair || !data.lairActions) return "";
  const lair = data.lairActions;
  if (!lair.intro && !lair.list?.length) return "";
  return `
  <section class="collapsible monster-lair">
    <h2 class="scroll-spy-h2" id="lair">Lair Actions</h2>
    ${lair.intro ? `<p>${lair.intro}</p>` : ""}
    ${
      lair.list
        ? lair.list.map((a) => `<p><b>${a.name}.</b> ${a.text}</p>`).join("")
        : ""
    }
  </section>`;
}

function renderLoot(loot) {
  if (!loot) return "";
  return `
  <section class="collapsible monster-loot">
    <h2 class="scroll-spy-h2" id="loot">Loot</h2>
    ${loot.description ? `<p>${loot.description}</p>` : ""}
    ${loot.table ? renderTable(loot.table) : ""}
  </section>`;
}

function renderTable(tbl) {
  if (!tbl.headers || !tbl.rows) return "";
  return `<table class="generic-table loot">
    <thead><tr>${tbl.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${tbl.rows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("")}</tbody>
  </table>`;
}
