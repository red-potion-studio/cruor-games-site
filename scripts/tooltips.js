/* v1.2 2025-10-30T13:40:00Z */
/* Tooltip universale con delega eventi + API: Tooltips.init(), .refresh(), .hide() */
(function () {
  let data = {};
  let tip;
  let active = null;

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
    const res = await fetch("/data/tooltips.json");
    data = await res.json();
    return data;
  }

  function show(target, e) {
    const key = (target.getAttribute("data-tooltip-key") || target.getAttribute("data-key") || "").toLowerCase();
    const entry = data[key];
    if (!entry) return;
    active = target;
    tip.innerHTML = `<strong>${entry.title}</strong><br><span>${entry.text}</span>`;
    tip.style.display = "block";
    tip.style.opacity = "1";
    position(e);
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

  // Delega eventi: un solo listener per tutto il documento
  function bindDelegates() {
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-key], [data-tooltip-key]");
      if (!t) return;
      show(t, e);
    });

    document.addEventListener("mousemove", (e) => {
      if (!active) return;
      // se il mouse esce dall'elemento attivo, chiudi
      if (!e.target.closest("[data-key], [data-tooltip-key]") || !e.target.closest("[data-key], [data-tooltip-key]").isSameNode(active)) {
        hide();
        return;
      }
      position(e);
    });

    document.addEventListener("mouseout", (e) => {
      const from = e.target.closest("[data-key], [data-tooltip-key]");
      if (!from) return;
      // chiudi solo se stai uscendo davvero dall'elemento che aveva aperto il tooltip
      if (active && from.isSameNode(active)) hide();
    });

    // Chiudi su click, scroll, resize, Escape
    document.addEventListener("click", () => hide(), true);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  }

  async function init() {
    ensureTipEl();
    await loadData();
    bindDelegates();
  }

  // refresh non fa nulla con la delega, ma lo esponiamo per compatibilità
  function refresh() { /* delega = no-op */ }

  // API globali
  window.Tooltips = { init, refresh, hide };
})();