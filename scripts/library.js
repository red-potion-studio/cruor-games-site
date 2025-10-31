/* v1.0 2025-10-29T16:10:00Z */
async function loadLibrary() {
  const res = await fetch('data/library.json');
  const data = await res.json();
  renderLibrary(data);
}

function renderLibrary(data) {
  const container = document.getElementById('library-container');

  // Categorie
  const categoriesHTML = data.categories.map(cat => `
    <section class="category">
      <div class="category-header">
        <img src="${cat.icon}" alt="${cat.name}" class="category-icon">
        <div>
          <h2>${cat.name}</h2>
          <p>${cat.description}</p>
        </div>
      </div>
      <div class="category-contents">
        ${data.contents.filter(c => c.category === cat.id).map(renderContentCard).join('')}
      </div>
    </section>
  `).join('');

  container.innerHTML = categoriesHTML;
}

function renderContentCard(item) {
  const locked = item.premium;
  return `
    <div class="content-card ${locked ? 'premium' : 'free'}">
      <img src="${item.image}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>${item.excerpt}</p>
      ${
        locked
          ? `<a href="${item.linkPremium}" class="content-btn locked" data-premium="true">Premium Access</a>`
          : `<a href="${item.linkFree}" class="content-btn">View Free</a>`
      }
    </div>
  `;
}

// Simulazione accesso Patreon (true = autenticato)
const userIsPatreon = false; // cambia in true per test

function unlockPremium() {
  if (!userIsPatreon) return;
  document.querySelectorAll('.content-card.premium').forEach(card => {
    card.classList.add('unlocked');
    const btn = card.querySelector('.content-btn');
    btn.textContent = 'View Premium';
    btn.classList.remove('locked');
    btn.href = btn.href.replace('-premium', '-premium');
  });
}

loadLibrary().then(unlockPremium);
