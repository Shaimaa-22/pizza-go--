const API_BASE_URL = window.PIZZAGO_CONFIG.apiBaseUrl;

const ordersContainer = document.getElementById("ordersContainer");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");

const token = localStorage.getItem("pizza_go_token");

if (!token) {
  window.location.href = "./login.html";
}

function showToast(message, type = "error") {
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

function formatDate(dateValue) {
  const date = new Date(dateValue);

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusLabel(status) {
  const labels = {
    paid: "Paid",
    queued: "Queued",
    dough: "Dough",
    sauce: "Sauce",
    cheese: "Cheese",
    toppings: "Toppings",
    heating: "Heating",
    ready: "Ready",
    error: "Error",
    pending: "Pending",
  };

  return labels[status] || status || "Unknown";
}

function getStatusClass(status) {
  if (status === "ready") return "ready";
  if (status === "error") return "error";
  if (status === "queued" || status === "pending") return "queued";
  return "progress";
}

function renderOrders(orders) {
  if (!orders || orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍕</div>
        <h3>No orders yet</h3>
        <p class="muted">Your pizza orders will appear here after payment.</p>
        <a class="primary-btn" href="./order.html">Create first order</a>
      </div>
    `;
    return;
  }

  ordersContainer.innerHTML = orders
    .map((order) => {
      const statusClass = getStatusClass(order.order_status);

      return `
        <article class="order-item">
          <div class="order-main">
            <div>
              <h3>Order #${order.order_id}</h3>
              <p class="muted">${formatDate(order.created_at)}</p>
            </div>

            <span class="order-status ${statusClass}">
              ${getStatusLabel(order.order_status)}
            </span>
          </div>

          <div class="order-details">
            <div>
              <span>Size</span>
              <strong>${order.pizza_size || "-"}</strong>
            </div>

            <div>
              <span>Total</span>
              <strong>$${Number(order.total_price || 0).toFixed(2)}</strong>
            </div>

            <div>
              <span>Payment</span>
              <strong>${order.payment_status || "-"}</strong>
            </div>
          </div>

          <a class="track-link" href="./status.html?orderId=${order.order_id}">
            Track this order →
          </a>
        </article>
      `;
    })
    .join("");
}

async function loadOrders() {
  try {
    ordersContainer.innerHTML = `<p class="muted">Loading your orders...</p>`;

    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("pizza_go_token");
      window.location.href = "./login.html";
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load orders");
    }

    renderOrders(data);
  } catch (error) {
    console.error(error);

    ordersContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Could not load orders</h3>
        <p class="muted">Please check your connection or try again.</p>
      </div>
    `;

    showToast(error.message || "Something went wrong");
  }
}

refreshBtn.addEventListener("click", loadOrders);

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("pizza_go_token");
  localStorage.removeItem("pizza_go_user");
  window.location.href = "./login.html";
});

loadOrders();

setInterval(loadOrders, 7000);
