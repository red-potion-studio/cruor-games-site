/* v1.2 2025-10-29T15:00:00Z */
const track = document.querySelector('.slider-track');
const dotsContainer = document.querySelector('.slider-dots');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');

let slides = [];
let index = 0;
let autoSlide;

fetch('data/slides.json')
  .then(res => res.json())
  .then(data => {
    slides = data;
    buildSlides();
    showSlide(0);
    startAutoSlide();
  });

function buildSlides() {
  track.innerHTML = slides.map(slide => `
    <div class="slide">
      <div class="slide-image">
        <img src="${slide.image}" alt="${slide.title}">
      </div>
      <div class="slide-text">
        <h4>${slide.title}</h4>
        <h5>${slide.subtitle}</h5>
        <p>${slide.body}</p>
        <a href="${slide.link}" class="slide-btn" target="_blank">Check Now</a>
      </div>
    </div>
  `).join('');

  dotsContainer.innerHTML = slides.map(() => `<div class="slider-dot"></div>`).join('');
  document.querySelectorAll('.slider-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAutoSlide();
      showSlide(i);
      startAutoSlide();
    });
  });
}

function updateDots() {
  const dots = document.querySelectorAll('.slider-dot');
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}

function showSlide(i) {
  index = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${index * 100}%)`;
  updateDots();
}

function nextSlide() { showSlide(index + 1); }
function prevSlide() { showSlide(index - 1); }

function startAutoSlide() {
  autoSlide = setInterval(nextSlide, 5000);
}
function stopAutoSlide() {
  clearInterval(autoSlide);
}

nextBtn.addEventListener('click', () => {
  stopAutoSlide(); nextSlide(); startAutoSlide();
});
prevBtn.addEventListener('click', () => {
  stopAutoSlide(); prevSlide(); startAutoSlide();
});
