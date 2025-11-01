/* v1.3 2025-11-01T23:20:00Z */
/* Tooltip universale con delega eventi + API: Tooltips.init(), .refresh(), .hide() */
(function () {
  let data = {};
  let tip;
  let active = null;

  // include anche i marker mappa
  const SELECTOR = "[data-key], [data-tooltip-key], [data-tooltip-text]";

  function ensureTipEl() {
    tip = document.getElementById("tooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "tooltip";
      document.body.appendChild(tip);
    }
  }

  async function loadData() {
    if (Object.keys(data).length) return data;
    try {
      const res = await fetch("/data/tooltips.json");
      if (!res.ok) return (data = {});
      data = await res.json();
    } catch {
      data = {};
    }
    return data;
  }

function show(target, e) {
  const type = target.getAttribute("data-tooltip-type") || "Tag";
  const key =
    (target.getAttribute("data-tooltip-key") ||
      target.getAttribute("data-key") ||
      "").toLowerCase();

  // Recupero dal database
  const typeData = data[type] || {};
  let entry = typeData[key];

  // Inline override (fallback)
  if (
    !entry &&
    (target.hasAttribute("data-tooltip-text") ||
      target.hasAttribute("data-tooltip-title"))
  ) {
    entry = {
      name: target.getAttribute("data-tooltip-title") || "",
      description: target.getAttribute("data-tooltip-text") || "",
    };
  }

  if (!entry) return;

  active = target;
  tip.className = `tooltip ${type.toLowerCase()}`;

  tip.innerHTML = buildTooltipHTML(entry, type);
  tip.style.display = "block";
  tip.style.opacity = "1";
  position(e);
}

function buildTooltipHTML(entry, type) {
  switch (type) {
    case "Spell":
      return `
        <strong>${entry.name}</strong>
        <p><em>${entry.school} — Level ${entry.level}</em></p>
        <p><b>Cast Time:</b> ${entry.castTime}</p>
        <p><b>Range:</b> ${entry.range}</p>
        <p><b>Components:</b> ${entry.components}</p>
        <p><b>Duration:</b> ${entry.duration}</p>
        <p style="margin-top:0.4rem;">${entry.description}</p>
      `;
    case "Item":
      return `
        <strong>${entry.name}</strong>
        <p><em>${entry.rarity}</em></p>
        <p style="margin-top:0.4rem;">${entry.description}</p>
      `;
    case "Rule":
    case "Tag":
    default:
      return `
        <strong>${entry.name}</strong>
        <p style="margin-top:0.4rem;">${entry.description}</p>
      `;
  }
}

  function hide() {
    active = null;
    if (!tip) return;
    tip.style.opacity = "0";
    tip.style.display = "none";
  }

  function position(e) {
    if (!tip) return;
    const x = e.pageX + 12;
    const y = e.pageY + 12;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }

  function bindDelegates() {
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest(SELECTOR);
      if (!t) return;
      show(t, e);
    });

    document.addEventListener("mousemove", (e) => {
      if (!active) return;
      const t = e.target.closest(SELECTOR);
      if (!t || !t.isSameNode(active)) {
        hide();
        return;
      }
      position(e);
    });

    document.addEventListener("mouseout", (e) => {
      const from = e.target.closest(SELECTOR);
      if (!from) return;
      if (active && from.isSameNode(active)) hide();
    });

    // Chiudi su click, scroll, resize, o Escape
    document.addEventListener("click", () => hide(), true);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });
  }

  async function init() {
    ensureTipEl();
    await loadData();
    bindDelegates();
  }

  function refresh() {
    /* delega = no-op */
  }

  window.Tooltips = { init, refresh, hide };
})();
