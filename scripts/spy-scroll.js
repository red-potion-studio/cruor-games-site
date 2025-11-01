/* v1.3 2025-11-01T13:20:00Z */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("content-container");
  if (!container) return;

  const spyList = document.querySelector(".spy-nav .spy-list");
  const observer = new MutationObserver(() => initSpyScroll());
  observer.observe(container, { childList: true, subtree: true });

  function initSpyScroll() {
    spyList.innerHTML = "";
    const items = Array.from(container.querySelectorAll(".scroll-spy-h2, .scroll-spy-h3"));
    if (!items.length) return;

    items.forEach((h, i) => {
      if (!h.id) h.id = `section-${i}`;
      const li = document.createElement("li");
      li.className = h.tagName.toLowerCase(); // e.g., "h2" or "h3"
      const a = document.createElement("a");
      const label = document.createElement("span");
      a.href = `#${h.id}`;
      a.dataset.target = h.id;
      label.textContent = h.textContent;
      li.appendChild(a);
      li.appendChild(label);
      spyList.appendChild(li);
    });

    const io = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting)
                             .sort((a,b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const id = visible[0].target.id;
      spyList.querySelectorAll("a").forEach(a =>
        a.classList.toggle("active", a.dataset.target === id)
      );
    }, { threshold: buildThresholdList() });

    items.forEach(h => io.observe(h));
  }

  function buildThresholdList() {
    const thresholds = [];
    for (let i = 0; i <= 1.0; i += 0.1) thresholds.push(i);
    return thresholds;
  }
});
