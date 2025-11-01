/* v1.8 – stripe 5% */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("content-container");
  if (!container) return;

  const spyList = document.querySelector(".spy-nav .spy-list");
  const observer = new MutationObserver(() => initSpyScroll());
  observer.observe(container, { childList: true, subtree: true });

  let items = [];
  let ticking = false;
  let stripePx = 0;           // altezza dello stripe (5% viewport)
  let stripeTopPx = 0;        // posizione top dello stripe (sempre 0 per “primo 5%”)

  function recalcStripe() {
    stripePx = Math.max(1, Math.round(window.innerHeight * 0.05)); // 5% vh
    stripeTopPx = 0; // “primo 5%” -> parte alta della viewport
  }

  function initSpyScroll() {
    spyList.innerHTML = "";
    items = Array.from(container.querySelectorAll(".scroll-spy-h2, .scroll-spy-h3"));
    if (!items.length) return;

    // id + nav
    let currentParentId = null;
    items.forEach((h, i) => {
      if (!h.id) h.id = `section-${i}`;
      const li = document.createElement("li");
      li.className = h.tagName.toLowerCase();
      const a = document.createElement("a");
      const label = document.createElement("span");
      a.href = `#${h.id}`;
      a.dataset.target = h.id;
      label.textContent = h.textContent;

      if (h.tagName === "H2") currentParentId = h.id;
      else if (h.tagName === "H3" && currentParentId) a.dataset.parent = currentParentId;

      li.appendChild(a);
      li.appendChild(label);
      spyList.appendChild(li);
    });

    // click -> scroll all’inizio sezione (usiamo scroll-margin-top via CSS se vuoi compensare header fissi)
    spyList.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(a.dataset.target);
        if (!target) return;
        setActive(a); // feedback immediato
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // stripe fisso: primo 5% viewport
    recalcStripe();
    window.addEventListener("resize", () => {
      recalcStripe();
      requestTick();
    }, { passive: true });

    // scroll handler con stripe 5%
    window.addEventListener("scroll", requestTick, { passive: true });
    // kick iniziale
    requestTick();
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateByStripe);
  }

  // Attiva la sezione il cui TOP cade nello stripe [0, 5% vh].
  // Se nessuna, prendi la più vicina sopra lo stripe; se non c’è, la più vicina sotto.
  function updateByStripe() {
    ticking = false;
    if (!items.length) return;

    let best = null;

    // 1) Cerca top dentro lo stripe
    for (const el of items) {
      const rect = el.getBoundingClientRect();
      if (rect.top >= stripeTopPx && rect.top <= (stripeTopPx + stripePx)) {
        best = el;
        break;
      }
    }

    // 2) Se niente nello stripe, scegli la più vicina sopra
    if (!best) {
      let closestAbove = null, aboveDist = Infinity;
      for (const el of items) {
        const rect = el.getBoundingClientRect();
        if (rect.top < stripeTopPx) {
          const d = stripeTopPx - rect.top;
          if (d < aboveDist) { aboveDist = d; closestAbove = el; }
        }
      }
      if (closestAbove) best = closestAbove;
    }

    // 3) Se ancora nulla, prendi la più vicina sotto
    if (!best) {
      let closestBelow = null, belowDist = Infinity;
      for (const el of items) {
        const rect = el.getBoundingClientRect();
        if (rect.top > (stripeTopPx + stripePx)) {
          const d = rect.top - (stripeTopPx + stripePx);
          if (d < belowDist) { belowDist = d; closestBelow = el; }
        }
      }
      if (closestBelow) best = closestBelow;
    }

    if (best) {
      const link = spyList.querySelector(`[data-target="${best.id}"]`);
      if (link) setActive(link);
    }
  }

  function setActive(link) {
    spyList.querySelectorAll("a").forEach((a) => a.classList.remove("active"));
    link.classList.add("active");
    // se è un H3, tieni acceso anche il suo H2
    if (link.dataset.parent) {
      const parent = spyList.querySelector(`[data-target="${link.dataset.parent}"]`);
      parent?.classList.add("active");
    }
  }
});