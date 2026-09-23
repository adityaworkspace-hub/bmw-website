/**
 * BMW VIBRANT - CUSTOMIZER & INTERACTIVE ENGINE
 * Manages color picker, vehicle models filter, and custom builder experience
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroColorStudio();
  initModelFilters();
  initConfiguratorStudio();
  initTestDriveModal();
});

/* ==========================================================================
   1. HERO COLOR STUDIO (index.html)
   ========================================================================== */
function initHeroColorStudio() {
  const swatchButtons = document.querySelectorAll('.swatch-btn');
  const carPaintElements = document.querySelectorAll('.car-paint');
  const underglow = document.querySelector('.car-underglow');
  const colorNameDisplay = document.getElementById('selectedColorName');
  const colorHexDisplay = document.getElementById('selectedColorHex');
  const heroBlob = document.querySelector('.blob-1');

  if (!swatchButtons.length) return;

  swatchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      swatchButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const colorHex = btn.getAttribute('data-color');
      const colorGlow = btn.getAttribute('data-glow') || colorHex;
      const colorName = btn.getAttribute('data-name');

      // Update car body paint SVG
      carPaintElements.forEach(el => {
        el.style.fill = colorHex;
      });

      // Update neon floor underglow
      if (underglow) {
        underglow.style.backgroundColor = colorGlow;
        underglow.style.boxShadow = `0 0 50px 20px ${colorGlow}`;
      }

      // Update hero ambient blob
      if (heroBlob) {
        heroBlob.style.backgroundColor = colorGlow;
      }

      // Update text displays
      if (colorNameDisplay) colorNameDisplay.textContent = colorName;
      if (colorHexDisplay) colorHexDisplay.textContent = colorHex.toUpperCase();
    });
  });
}

/* ==========================================================================
   2. MODEL LINEUP FILTERS (models.html)
   ========================================================================== */
function initModelFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const modelCards = document.querySelectorAll('.model-card');

  if (!filterBtns.length || !modelCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      modelCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   3. DREAM BMW CONFIGURATOR (experience.html)
   ========================================================================== */
function initConfiguratorStudio() {
  const configurator = document.getElementById('bmwConfigurator');
  if (!configurator) return;

  // Selected State
  const state = {
    model: { name: 'BMW M4 Competition Coupe', price: 82200 },
    paint: { name: 'Sao Paulo Yellow', price: 1200, hex: '#E5F200', glow: '#f5ee38' },
    wheels: { name: '19"/20" M Double-Spoke Bicolor', price: 0 },
    interior: { name: 'Kyalami Orange / Black Merino Leather', price: 0 }
  };

  const previewPaintEls = document.querySelectorAll('.builder-car-paint');
  const previewGlowEl = document.querySelector('.builder-stage-glow');
  
  const summaryModel = document.getElementById('sumModel');
  const summaryPaint = document.getElementById('sumPaint');
  const summaryWheels = document.getElementById('sumWheels');
  const summaryInterior = document.getElementById('sumInterior');
  const summaryTotal = document.getElementById('sumTotal');
  const testDriveModelSelect = document.getElementById('preferredModel');

  function updateDisplay() {
    const total = state.model.price + state.paint.price + state.wheels.price + state.interior.price;

    if (summaryModel) summaryModel.textContent = `${state.model.name} ($${state.model.price.toLocaleString()})`;
    if (summaryPaint) summaryPaint.textContent = `${state.paint.name} (${state.paint.price === 0 ? 'Included' : '+$' + state.paint.price.toLocaleString()})`;
    if (summaryWheels) summaryWheels.textContent = `${state.wheels.name} (${state.wheels.price === 0 ? 'Included' : '+$' + state.wheels.price.toLocaleString()})`;
    if (summaryInterior) summaryInterior.textContent = `${state.interior.name} (${state.interior.price === 0 ? 'Included' : '+$' + state.interior.price.toLocaleString()})`;
    if (summaryTotal) summaryTotal.textContent = `$${total.toLocaleString()}`;

    // Update Stage Car Paint & Underglow
    previewPaintEls.forEach(el => {
      el.style.fill = state.paint.hex;
    });
    if (previewGlowEl) {
      previewGlowEl.style.backgroundColor = state.paint.glow;
      previewGlowEl.style.boxShadow = `0 0 45px 15px ${state.paint.glow}`;
    }

    // Sync test drive selection if available
    if (testDriveModelSelect) {
      testDriveModelSelect.value = state.model.name;
    }
  }

  // Bind option clicks
  document.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parentGrid = btn.closest('.options-pill-grid');
      parentGrid.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.getAttribute('data-type');
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price') || '0', 10);

      if (type === 'model') {
        state.model = { name, price };
      } else if (type === 'paint') {
        const hex = btn.getAttribute('data-hex');
        const glow = btn.getAttribute('data-glow') || hex;
        state.paint = { name, price, hex, glow };
      } else if (type === 'wheels') {
        state.wheels = { name, price };
      } else if (type === 'interior') {
        state.interior = { name, price };
      }

      updateDisplay();
    });
  });

  // Initial update
  updateDisplay();
}

/* ==========================================================================
   4. VIP TEST DRIVE FORM & CONFIRMATION MODAL
   ========================================================================== */
function initTestDriveModal() {
  const form = document.getElementById('testDriveForm');
  const modalOverlay = document.getElementById('confirmationModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalDetails = document.getElementById('modalReservationDetails');

  if (!form || !modalOverlay) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('emailAddress').value.trim();
    const model = document.getElementById('preferredModel').value;
    const date = document.getElementById('driveDate').value;
    const showroom = document.getElementById('showroomLocation').value;

    const reservationCode = 'BMW-VIP-' + Math.floor(100000 + Math.random() * 900000);

    if (modalDetails) {
      modalDetails.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 1.2rem; border-radius: 14px; text-align: left; margin: 1.2rem 0; border: 1px solid rgba(255,255,255,0.1);">
          <p style="margin-bottom: 0.4rem;"><strong>Driver:</strong> <span style="color: #00f2fe;">${escapeHtml(name)}</span></p>
          <p style="margin-bottom: 0.4rem;"><strong>Vehicle:</strong> <span style="color: #fff;">${escapeHtml(model)}</span></p>
          <p style="margin-bottom: 0.4rem;"><strong>Showroom:</strong> <span style="color: #fff;">${escapeHtml(showroom)}</span></p>
          <p style="margin-bottom: 0.4rem;"><strong>Date & Time:</strong> <span style="color: #fff;">${escapeHtml(date)}</span></p>
          <p style="margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; color: #94a3b8;">
            Confirmation pass sent to <strong>${escapeHtml(email)}</strong>.<br>
            Reservation Code: <strong style="color: #00ff87; letter-spacing: 0.1em;">${reservationCode}</strong>
          </p>
        </div>
      `;
    }

    modalOverlay.classList.add('active');
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
      form.reset();
    });
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
      form.reset();
    }
  });
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.innerText = string;
  return div.innerHTML;
}
