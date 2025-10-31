export function renderDarkPlace(data) {
  const locations = data.locations.map(l => `
    <li><strong>${l.name}:</strong> ${l.desc}</li>
  `).join('');

  const encounters = data.encounters.map(e => `
    <tr><td>${e.roll}</td><td>${e.result}</td></tr>
  `).join('');

  return `
    <article class="content-article dark-place">
      <img src="${data.image}" class="content-hero" alt="${data.title}">
      <h2>${data.title}</h2>
      <p class="intro">${data.intro}</p>

      <h3>Map</h3>
      <img src="${data.map}" class="map-image" alt="Map of ${data.title}">

      <h3>Notable Locations</h3>
      <ul>${locations}</ul>

      <h3>Random Encounters</h3>
      <table class="encounter-table">
        <thead><tr><th>Roll</th><th>Encounter</th></tr></thead>
        <tbody>${encounters}</tbody>
      </table>
    </article>
  `;
}
