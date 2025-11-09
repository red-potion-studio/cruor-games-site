/* v1.5 */
const transitionEl = document.getElementById("page-transition");

// Rimuove il velo nero solo quando la pagina è pronta
window.addEventListener("load", () => {
  setTimeout(() => transitionEl.classList.remove("visible"), 200);
});

// Gestisce il fade-out in uscita
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const url = link.getAttribute("href");
  if (!url || url.startsWith("#") || url.startsWith("http")) return;

  e.preventDefault();

  // Riapplica overlay e naviga solo al termine del fade
  transitionEl.classList.add("visible");
  transitionEl.addEventListener(
    "transitionend",
    () => {
      window.location.href = url;
    },
    { once: true }
  );
});
