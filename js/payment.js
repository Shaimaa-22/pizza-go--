requireAuth();
setTopbarUser();

const STRIPE_KEY = (window.PIZZAGO_CONFIG || {}).stripePublishableKey || '';
const stripe = STRIPE_KEY ? Stripe(STRIPE_KEY) : null;

const order = JSON.parse(localStorage.getItem('pizza_go_order') || 'null');
const user = getUser();

if (!order) {
  window.location.href = './order.html';
}

const summarySize = document.getElementById('summarySize');
const summaryQuantity = document.getElementById('summaryQuantity');
const summaryToppings = document.getElementById('summaryToppings');
const summaryTotal = document.getElementById('summaryTotal');

const billingName = document.getElementById('billingName');
const billingEmail = document.getElementById('billingEmail');
const cardError = document.getElementById('cardError');
const payNowBtn = document.getElementById('payNowBtn');
const bankCard = document.getElementById('bankCard');
const cardHolderPreview = document.getElementById('cardHolderPreview');
const flipToCvcBtn = document.getElementById('flipToCvcBtn');

let stripeElements = null;
let cardNumberElement = null;
let cardExpiryElement = null;
let cardCvcElement = null;

function renderOrderSummary() {
  summarySize.textContent = 'Standard Size';
  summaryQuantity.textContent = '1 Pizza';

  summaryToppings.textContent =
    order.toppingsList?.length
      ? order.toppingsList.join(', ')
      : 'No extra toppings';

  summaryTotal.textContent = `$${Number(order.totalPrice || 0).toFixed(2)}`;

  billingName.value = user?.full_name || '';
  billingEmail.value = user?.email || '';

  updateCardholderPreview();
}

function updateCardholderPreview() {
  const value = billingName.value.trim();
  cardHolderPreview.textContent = value ? value.toUpperCase() : 'YOUR NAME';
}

function setCardError(message = '') {
  cardError.textContent = message;
  cardError.classList.toggle('hidden', !message);
}

function flipCardToBack() {
  bankCard.classList.add('is-flipped');
}

function flipCardToFront() {
  bankCard.classList.remove('is-flipped');
}

function initializeStripeCard() {
  if (!stripe || cardNumberElement || cardExpiryElement || cardCvcElement) return;

  stripeElements = stripe.elements();

  const baseStyle = {
    color: '#ffffff',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
    fontSmoothing: 'antialiased',
    '::placeholder': {
      color: 'rgba(255,255,255,.42)',
    },
  };

  cardNumberElement = stripeElements.create('cardNumber', {
    style: {
      base: {
        ...baseStyle,
        fontSize: '24px',
        letterSpacing: '0.16em',
      },
      invalid: {
        color: '#ff8c8c',
        iconColor: '#ff8c8c',
      },
    },
  });

  cardExpiryElement = stripeElements.create('cardExpiry', {
    style: {
      base: {
        ...baseStyle,
        letterSpacing: '0.08em',
      },
      invalid: {
        color: '#ff8c8c',
      },
    },
  });

  cardCvcElement = stripeElements.create('cardCvc', {
    style: {
      base: {
        color: '#111723',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '16px',
        letterSpacing: '0.12em',
        '::placeholder': {
          color: 'rgba(17,23,35,.42)',
        },
      },
      invalid: {
        color: '#d93f3f',
      },
    },
  });

  cardNumberElement.mount('#cardNumberElement');
  cardExpiryElement.mount('#cardExpiryElement');
  cardCvcElement.mount('#cardCvcElement');

  const handleStripeChange = (event) => {
    setCardError(event.error?.message || '');
  };

  cardNumberElement.on('change', handleStripeChange);
  cardExpiryElement.on('change', handleStripeChange);
  cardCvcElement.on('change', handleStripeChange);

  cardNumberElement.on('focus', flipCardToFront);
  cardExpiryElement.on('focus', flipCardToFront);
  cardCvcElement.on('focus', flipCardToBack);

  cardCvcElement.on('blur', () => {
    setTimeout(flipCardToFront, 200);
  });
}

async function checkMachineStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/machine/status`);
    const data = await response.json();

    if (!data.online) {
      showToast('Pizza machine is currently offline ❌', 'error');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Machine status error ❌', err);
    showToast('Cannot connect to pizza machine ❌', 'error');
    return false;
  }
}

async function handleStripePayment(amount) {
  if (!stripe) {
    throw new Error('Stripe publishable key is missing in config.js');
  }

  if (!cardNumberElement) {
    throw new Error('Card field is not ready yet.');
  }

  const enteredName =
    billingName.value.trim() || user?.full_name || 'Pizza Go User';

  const enteredEmail =
    billingEmail.value.trim() || user?.email || '';

  if (!enteredName) {
    throw new Error('Please enter the cardholder name.');
  }

  if (!enteredEmail) {
    throw new Error('Please enter the billing email.');
  }

  const paymentData = await apiFetch('/payment/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({
      amount,
    }),
  });

  const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
    payment_method: {
      card: cardNumberElement,
      billing_details: {
        name: enteredName,
        email: enteredEmail,
      },
    },
  });

  if (result.error) {
    throw new Error(result.error.message || 'Payment failed');
  }

  if (result.paymentIntent?.status !== 'succeeded') {
    throw new Error(
      `Payment not completed. Status: ${
        result.paymentIntent?.status || 'unknown'
      }`
    );
  }

  return result.paymentIntent.id;
}

async function handlePlaceOrder() {
  setLoader(true, 'Checking machine status...');

  const machineOk = await checkMachineStatus();

  if (!machineOk) {
    setLoader(false);
    return;
  }

  setLoader(true, 'Processing payment...');

  try {
    const paymentIntentId = await handleStripePayment(order.totalPrice);

    setLoader(true, 'Saving order...');

    const createdOrder = await apiFetch('/orders/create', {
      method: 'POST',
      body: JSON.stringify({
        pizza_size: 'standard',
        total_price: order.totalPrice,
        toppings: order.toppings,
        payment_status: 'success',
        payment_intent_id: paymentIntentId,
      }),
    });

    localStorage.setItem(
      'pizza_go_game_toppings',
      JSON.stringify(order.toppingsList || [])
    );

    localStorage.setItem(
      'pizza_go_last_order_id',
      createdOrder.order_id
    );

    showToast('Order placed successfully.');

    window.location.href = './success.html';
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setLoader(false);
  }
}

billingName.addEventListener('input', updateCardholderPreview);

flipToCvcBtn.addEventListener('click', () => {
  flipCardToBack();

  setTimeout(() => {
    if (cardCvcElement) {
      cardCvcElement.focus();
    }
  }, 350);
});

payNowBtn.addEventListener('click', handlePlaceOrder);

renderOrderSummary();
initializeStripeCard();
