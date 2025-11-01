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

  const storyHTML = data.story.map((s) => s.html).join("");

  const actsHTML = data.acts
    .map(
      (act) => `
    <section class="act">
      <h3>${act.title}</h3>
      ${act.description}
      ${act.clocks.map(renderClock).join("")}
      ${
        act.modes
          ? `<div class="modes">${act.modes
              .map((m) => `<p><strong>${m.type}.</strong> ${m.text}</p>`)
              .join("")}</div>`
          : ""
      }
    </section>
  `
    )
    .join("");

  const endingHTML = `
    <section class="ending">
      <h3>${data.ending.title}</h3>
      ${data.ending.html}
    </section>
  `;

return `
  <article class="content-article frightful-story">
    <div class="article-header frightful-story">
      <div class="article-header image">
        <img src="${data.image}" alt="${data.title}" class="content-hero">
      </div>
      <div class="article-header text">
        <h2>${data.title}</h2>
        ${plotTable}
      </div>
    </div>

    <h2 class="scroll-spy-h2" id="story">Story</h2>
    ${storyHTML}

    <h2 class="scroll-spy-h2" id="acts">Acts</h2>
    ${actsHTML}

    <h2 class="scroll-spy-h2" id="ending">Ending</h2>
    ${endingHTML}

    <div class="tags">${data.tags.map(t => `<span class="tag">${t}</span>`).join(" ")}</div>
    <p class="meta">Written by ${data.author} — ${data.date}</p>
  </article>
`;
}

function renderClock(clock) {
  const entries = clock.entries
    .map(
      (e) => `
    <div class="clock-entry">
      ${renderCircle(clock.color, e.value, clock.segments)}
      <div class="clock-text">
        <h4>${e.value}/${clock.segments}</h4>
        <p>${e.summary}${
        e.brutal
          ? `<br><em><strong>Brutal Effect:</strong> ${e.brutal}</em>`
          : ""
      }</p>
      </div>
    </div>
  `
    )
    .join("");
  return `<div class="clock"><h4>${clock.name}</h4>${entries}</div>`;
}

function renderCircle(color, filled, total) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const perSegment = circumference / total;
  let svg = `<svg viewBox="0 0 120 120" width="50" height="50">`;
  for (let i = 0; i < total; i++) {
    const offset = i * perSegment;
    const strokeColor =
      i < filled
        ? color === "black"
          ? "#424242ff"
          : "#ecececff"
        : "rgba(255,255,255,0.1)";
    svg += `<circle cx="60" cy="60" r="${radius}" stroke="${strokeColor}" stroke-width="12"
      fill="none" stroke-dasharray="${perSegment} ${circumference - perSegment}"
      stroke-dashoffset="${-offset}"></circle>`;
  }
  svg += `</svg>`;
  return svg;
}
