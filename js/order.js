requireAuth();
setTopbarUser();

const FIXED_PIZZA_SIZE = 'standard';
const FIXED_QUANTITY = 1;

const state = {
  pizzaSize: FIXED_PIZZA_SIZE,
  quantity: FIXED_QUANTITY,
  basePrice: 4,
  toppingsCatalog: [],
  toppingsSelection: {},
};

const elements = {
  toppingsList: document.getElementById('toppingsList'),
  totalPriceLabel: document.getElementById('totalPriceLabel'),
  toppingsPriceLabel: document.getElementById('toppingsPriceLabel'),
  basePriceLabel: document.getElementById('basePriceLabel'),
  quantityValue: document.getElementById('quantityValue'),
  quantityLabel: document.getElementById('quantityLabel'),
  backendStatus: document.getElementById('backendStatus'),
  reloadToppingsBtn: document.getElementById('reloadToppingsBtn'),
  continueToPaymentBtn: document.getElementById('continueToPaymentBtn'),
  pizzaToppingsVisual: document.getElementById('pizzaToppingsVisual'),
};

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function getToppingImage(name) {
  const normalized = normalizeName(name);

  if (normalized.includes('olive')) return '../assets/toppings/olive.png';
  if (normalized.includes('mushroom')) return '../assets/toppings/mushroom.png';
  if (normalized.includes('sweet pepper')) return '../assets/toppings/pepper.png';
  if (normalized.includes('corn')) return '../assets/toppings/corn.png';
  if (normalized.includes('cheese')) return '../assets/toppings/cheese.png';
  if (normalized.includes('sauce')) return '../assets/toppings/sauce.svg';

  return '../assets/toppings/default.png';
}

const toppingPlacements = {
  olive: [
    { top: 22, left: 34, size: 'small', rotate: -8 },
    { top: 30, left: 62, size: 'medium', rotate: 14 },
    { top: 44, left: 24, size: 'small', rotate: -18 },
    { top: 50, left: 52, size: 'medium', rotate: 9 },
    { top: 62, left: 70, size: 'small', rotate: -12 },
    { top: 71, left: 38, size: 'medium', rotate: 16 },
    { top: 58, left: 80, size: 'small', rotate: 5 },
    { top: 18, left: 50, size: 'medium', rotate: 7 },
    { top: 35, left: 15, size: 'small', rotate: -10 },
    { top: 40, left: 75, size: 'medium', rotate: 12 },
    { top: 55, left: 30, size: 'small', rotate: -6 },
    { top: 65, left: 55, size: 'medium', rotate: 18 },
    { top: 78, left: 65, size: 'small', rotate: -14 },
    { top: 48, left: 10, size: 'small', rotate: -20 },
    { top: 20, left: 25, size: 'small', rotate: 11 },
    { top: 28, left: 48, size: 'medium', rotate: -7 },
    { top: 33, left: 70, size: 'small', rotate: 13 },
    { top: 45, left: 60, size: 'medium', rotate: -9 },
    { top: 52, left: 20, size: 'small', rotate: 6 },
    { top: 60, left: 78, size: 'medium', rotate: -15 },
    { top: 68, left: 48, size: 'small', rotate: 8 },
    { top: 72, left: 22, size: 'medium', rotate: -12 },
    { top: 38, left: 40, size: 'small', rotate: 4 },
    { top: 47, left: 72, size: 'medium', rotate: -5 },
  ],

  'sweet pepper': [
    { top: 32, left: 66, size: 'large', rotate: 10 },
    { top: 50, left: 50, size: 'large', rotate: -14 },
    { top: 64, left: 28, size: 'large', rotate: 6 },
    { top: 68, left: 72, size: 'small', rotate: -12 },
    { top: 20, left: 50, size: 'small', rotate: 5 },
    { top: 35, left: 15, size: 'small', rotate: -10 },
    { top: 40, left: 80, size: 'small', rotate: 12 },
    { top: 55, left: 35, size: 'small', rotate: -8 },
    { top: 60, left: 55, size: 'small', rotate: 14 },
    { top: 75, left: 65, size: 'small', rotate: -6 },
    { top: 48, left: 12, size: 'small', rotate: -16 },
    { top: 58, left: 68, size: 'small', rotate: 7 },
    { top: 38, left: 52, size: 'small', rotate: -11 },
    { top: 22, left: 40, size: 'small', rotate: 8 },
    { top: 30, left: 55, size: 'small', rotate: -5 },
    { top: 42, left: 20, size: 'small', rotate: 12 },
    { top: 46, left: 75, size: 'small', rotate: -9 },
    { top: 52, left: 65, size: 'small', rotate: 6 },
    { top: 62, left: 40, size: 'small', rotate: -13 },
    { top: 70, left: 50, size: 'small', rotate: 10 },
    { top: 78, left: 30, size: 'small', rotate: -7 },
    { top: 24, left: 50, size: 'medium', rotate: -12 },
    { top: 36, left: 32, size: 'medium', rotate: 10 },
    { top: 40, left: 70, size: 'medium', rotate: -18 },
    { top: 56, left: 48, size: 'medium', rotate: 14 },
    { top: 68, left: 34, size: 'medium', rotate: -6 },
    { top: 66, left: 70, size: 'medium', rotate: 9 },
  ],

  corn: [
{ top: 32, left: 66, size: 'small', rotate: 10 },
{ top: 50, left: 50, size: 'small', rotate: -14 },
{ top: 64, left: 28, size: 'small', rotate: 6 },
{ top: 68, left: 72, size: 'small', rotate: -12 },
{ top: 20, left: 50, size: 'small', rotate: 5 },
{ top: 35, left: 15, size: 'small', rotate: -10 },
{ top: 40, left: 80, size: 'small', rotate: 12 },
{ top: 55, left: 35, size: 'small', rotate: -8 },
{ top: 60, left: 55, size: 'small', rotate: 14 },
{ top: 75, left: 65, size: 'small', rotate: -6 },
{ top: 48, left: 12, size: 'small', rotate: -16 },
{ top: 58, left: 68, size: 'small', rotate: 7 },
{ top: 38, left: 52, size: 'small', rotate: -11 },
{ top: 22, left: 40, size: 'small', rotate: 8 },
{ top: 30, left: 55, size: 'small', rotate: -5 },
{ top: 42, left: 20, size: 'small', rotate: 12 },
{ top: 46, left: 75, size: 'small', rotate: -9 },
{ top: 52, left: 65, size: 'small', rotate: 6 },
{ top: 62, left: 40, size: 'small', rotate: -13 },
{ top: 70, left: 50, size: 'small', rotate: 10 },
{ top: 78, left: 30, size: 'small', rotate: -7 },

  ],

  onion: [
    { top: 24, left: 50, size: 'medium', rotate: -12 },
    { top: 36, left: 32, size: 'medium', rotate: 10 },
    { top: 40, left: 70, size: 'medium', rotate: -18 },
    { top: 56, left: 48, size: 'medium', rotate: 14 },
    { top: 68, left: 34, size: 'medium', rotate: -6 },
    { top: 66, left: 70, size: 'medium', rotate: 9 },
  ],

  cheese: [
    { top: 26, left: 36, size: 'small', rotate: -8 },
    { top: 30, left: 62, size: 'small', rotate: 12 },
    { top: 42, left: 24, size: 'small', rotate: -16 },
    { top: 48, left: 52, size: 'small', rotate: 7 },
    { top: 58, left: 74, size: 'small', rotate: -11 },
    { top: 68, left: 38, size: 'small', rotate: 15 },
    { top: 70, left: 60, size: 'small', rotate: -5 },
  ],
};

function getSelectedToppingsPrice() {
  return state.toppingsCatalog.reduce((sum, topping) => {
    return sum + (state.toppingsSelection[topping.topping_name] ? 0.5 : 0);
  }, 0);
}

function getTotalPrice() {
  return state.basePrice + getSelectedToppingsPrice();
}

function renderSummary() {
  elements.basePriceLabel.textContent = `$${state.basePrice.toFixed(2)}`;
  elements.toppingsPriceLabel.textContent = `$${getSelectedToppingsPrice().toFixed(2)}`;

  if (elements.quantityValue) elements.quantityValue.textContent = '1 Pizza';
  if (elements.quantityLabel) elements.quantityLabel.textContent = '1';

  elements.totalPriceLabel.textContent = `$${getTotalPrice().toFixed(2)}`;
}

function renderPizzaToppingImages() {
  if (!elements.pizzaToppingsVisual) return;

  const selectedToppings = Object.keys(state.toppingsSelection).filter(
    (name) => state.toppingsSelection[name]
  );

  if (!selectedToppings.length) {
    elements.pizzaToppingsVisual.innerHTML = '';
    return;
  }

  elements.pizzaToppingsVisual.innerHTML = selectedToppings
    .map((toppingName) => {
      const normalized = normalizeName(toppingName);
      const placements = toppingPlacements[normalized] || [
        { top: 30, left: 35, size: 'medium', rotate: 0 },
        { top: 45, left: 60, size: 'medium', rotate: 12 },
        { top: 62, left: 40, size: 'medium', rotate: -10 },
      ];
      if (normalized === 'sauce') {
  return `
    <img
      src="${getToppingImage(toppingName)}"
      alt="${toppingName}"
      class="pizza-sauce-layer"
    />
  `;
}
      return placements
        .map((item, index) => `
          <img
            src="${getToppingImage(toppingName)}"
            alt="${toppingName}"
            class="pizza-topping-img ${item.size}"
            style="
              top: ${item.top}%;
              left: ${item.left}%;
              transform: translate(-50%, -50%) rotate(${item.rotate}deg);
            "
            data-name="${toppingName}"
            data-index="${index}"
          />
        `)
        .join('');
    })
    .join('');
}

function updatePizzaPreview() {
  renderPizzaToppingImages();
}

function renderToppings() {
  if (!state.toppingsCatalog.length) {
    elements.toppingsList.innerHTML = `
      <div class="topping-item">
        <div class="topping-thumb">
          <img src="../assets/toppings/default.png" alt="No toppings" />
        </div>
        <div class="topping-meta">
          <div class="topping-header">
            <h4>No toppings found</h4>
          </div>
          <p>Check your database seed.</p>
        </div>
        <button class="switch" type="button" disabled></button>
      </div>
    `;
    return;
  }

  elements.toppingsList.innerHTML = state.toppingsCatalog
    .map((topping) => {
      const isActive = !!state.toppingsSelection[topping.topping_name];

      return `
        <div class="topping-item ${isActive ? 'active' : ''}" data-name="${topping.topping_name}">
          <div class="topping-thumb">
            <img src="${getToppingImage(topping.topping_name)}" alt="${topping.topping_name}" class="topping-img" />
          </div>

          <div class="topping-meta">
            <div class="topping-header">
              <h4>${topping.topping_name}</h4>
            </div>
            <p>+$0.50 each</p>
          </div>

          <button
            class="switch ${isActive ? 'active' : ''}"
            type="button"
            aria-label="Toggle ${topping.topping_name}">
          </button>
        </div>
      `;
    })
    .join('');

  bindDynamicEvents();
}

function bindDynamicEvents() {
  document.querySelectorAll('.topping-item').forEach((item) => {
    item.addEventListener('click', () => {
      const name = item.dataset.name;
      state.toppingsSelection[name] = !state.toppingsSelection[name];

      renderToppings();
      renderSummary();
      updatePizzaPreview();
    });
  });
}

async function loadToppings() {
  try {
    elements.backendStatus.textContent = 'Loading toppings...';

    const toppings = await apiFetch('/orders/toppings');

    state.toppingsCatalog = toppings;

    // خلي الصوص أول عنصر فوق
    state.toppingsCatalog.sort((a, b) => {
      const aName = a.topping_name?.toLowerCase() || '';
      const bName = b.topping_name?.toLowerCase() || '';

      if (aName === 'sauce') return -1;
      if (bName === 'sauce') return 1;

      return 0;
    });

    for (const topping of state.toppingsCatalog) {
      if (
        typeof state.toppingsSelection[topping.topping_name] !== 'boolean'
      ) {
        state.toppingsSelection[topping.topping_name] = false;
      }
    }

    renderToppings();
    renderSummary();
    updatePizzaPreview();

    elements.backendStatus.textContent = 'Connected';
  } catch (error) {
    elements.backendStatus.textContent = 'Backend error';
    showToast(error.message, 'error');
  }
}

function buildOrderPayload() {
  const toppingsMap = {};

  state.toppingsCatalog.forEach((topping) => {
    toppingsMap[topping.topping_name] =
      state.toppingsSelection[topping.topping_name] ? 1 : 0;
  });

  // Sauce stays optional if it exists in DB as Sauce/sauce
  toppingsMap.sauce =
    state.toppingsSelection['Sauce'] || state.toppingsSelection['sauce'] ? 1 : 0;

  return toppingsMap;
}

function saveOrderToStorage() {
  const selectedToppings = Object.keys(state.toppingsSelection).filter(
    (name) => state.toppingsSelection[name]
  );

  const orderData = {
    pizzaSize: FIXED_PIZZA_SIZE,
    quantity: FIXED_QUANTITY,
    totalPrice: Number(getTotalPrice().toFixed(2)),
    toppings: buildOrderPayload(),
    toppingsList: selectedToppings,
  };

  localStorage.setItem('pizza_go_order', JSON.stringify(orderData));
}

if (elements.reloadToppingsBtn) {
  elements.reloadToppingsBtn.addEventListener('click', loadToppings);
}

if (elements.continueToPaymentBtn) {
  elements.continueToPaymentBtn.addEventListener('click', () => {
    saveOrderToStorage();
    window.location.href = './payment.html';
  });
}

loadToppings();
renderSummary();
updatePizzaPreview();
