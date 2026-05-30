const orderId =
  localStorage.getItem('pizza_go_last_order_id') || '-';

document.getElementById(
  'orderIdText'
).textContent = `Order ID: ${orderId}`;

const order =
  JSON.parse(localStorage.getItem('pizza_go_order')) || {};

localStorage.setItem(
  'pizza_go_game_toppings',
  JSON.stringify(order.toppingsList || [])
);
