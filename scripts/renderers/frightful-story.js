export function renderFrightfulStory(data) {
  const plotTable = `
    <table class="plot-table">
      <tr><th>Duration</th><td>${data.plot.duration}</td></tr>
      <tr><th>Difficulty</th><td>${data.plot.difficulty}</td></tr>
      <tr><th>Type</th><td>${data.plot.type}</td></tr>
      <tr><th>Biome</th><td>${data.plot.biome}</td></tr>
    </table>
    <p class="plot-intro">${data.plot.introduction}</p>
  `;

  const storyHTML = data.story.map(s => s.html).join("");

  const actsHTML = data.acts.map(act => `
    <section class="act">
      <h3>${act.title}</h3>
      ${act.description}
      ${act.clocks.map(renderClock).join("")}
      ${act.modes ? `<div class="modes">${act.modes.map(m => `<p><strong>${m.type}.</strong> ${m.text}</p>`).join("")}</div>` : ""}
    </section>
  `).join("");

  const endingHTML = `
    <section class="ending">
      <h3>${data.ending.title}</h3>
      ${data.ending.html}
    </section>
  `;

  return `
    <article class="content-article frightful-story">
      <img src="${data.image}" alt="${data.title}" class="content-hero">
      <h2>${data.title}</h2>
      <p class="intro">${data.intro}</p>

      <h3>Plot</h3>
      ${plotTable}

      <h3>Story</h3>
      ${storyHTML}

      <h3>Acts</h3>
      ${actsHTML}

      ${endingHTML}

      <div class="tags">${data.tags.map(t => `<span class="tag">${t}</span>`).join(" ")}</div>
      <p class="meta">Written by ${data.author} — ${data.date}</p>
    </article>
  `;
}

function renderClock(clock) {
  const entries = clock.entries.map(e => `
    <div class="clock-entry">
      ${renderCircle(clock.color, e.value, clock.segments)}
      <div class="clock-text">
        <h4>${e.value}/${clock.segments}</h4>
        <p>${e.summary}${e.brutal ? `<br><em><strong>Brutal Effect:</strong> ${e.brutal}</em>` : ""}</p>
      </div>
    </div>
  `).join("");
  return `<div class="clock"><h4>${clock.name}</h4>${entries}</div>`;
}

function renderCircle(color, filled, total) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const perSegment = circumference / total;
  let svg = `<svg viewBox="0 0 120 120" width="100" height="100">`;
  for (let i = 0; i < total; i++) {
    const offset = i * perSegment;
    const strokeColor = i < filled
      ? (color === "black" ? "#333" : "#c7ab6d")
      : "rgba(255,255,255,0.1)";
    svg += `<circle cx="60" cy="60" r="${radius}" stroke="${strokeColor}" stroke-width="12"
      fill="none" stroke-dasharray="${perSegment} ${circumference - perSegment}"
      stroke-dashoffset="${-offset}"></circle>`;
  }
  svg += `</svg>`;
  return svg;
}