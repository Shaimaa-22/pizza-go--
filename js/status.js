const params = new URLSearchParams(window.location.search)

const orderId =
  params.get("orderId") ||
  localStorage.getItem("pizza_go_last_order_id")

const token = localStorage.getItem("pizza_go_token")

const API_BASE =
  window.PIZZAGO_CONFIG?.apiBaseUrl ||
  "https://pizza-go-backend.onrender.com"

const steps = [
  "paid",
  "queued",
  "moving_to_sauce",
  "sauce",
  "moving_to_toppings",
  "toppings",
  "moving_to_cheese",
  "cheese",
  "moving_to_oven",
  "heating",
  "ready",
]

document.getElementById("orderIdText").textContent =
  `Order ID: ${orderId || "-"}`

function formatStatus(status) {
  const labels = {
    paid: "Payment Confirmed",
    queued: "Waiting in Queue",
    moving_to_sauce: "Moving to Sauce Station",
    sauce: "Adding Sauce",
    moving_to_cheese: "Moving to Cheese Station",
    cheese: "Adding Cheese",
    moving_to_toppings: "Moving to Toppings Station",
    toppings: "Adding Toppings",
    moving_to_oven: "Moving to Oven",
    heating: "Baking Pizza",
    ready: "Ready",
    error: "Machine Error",
  }

  return labels[status] || status || "unknown"
}

function updateTracker(status) {
  const currentIndex = steps.indexOf(status)

  document.getElementById("statusText").textContent =
    `Current status: ${formatStatus(status)}`

  steps.forEach((step, index) => {
    const el = document.getElementById(`step-${step}`)
    if (!el) return

    el.classList.remove("active", "done", "error")

    if (status === "error") {
      el.classList.add("error")
      return
    }

    if (currentIndex === -1) return

    if (index < currentIndex) {
      el.classList.add("done")
    }

    if (index === currentIndex) {
      el.classList.add("active")
    }
  })
}

async function fetchOrderStatus() {
  if (!orderId || !token) {
    document.getElementById("statusText").textContent =
      "Missing order or login session."
    return
  }

  try {
    const res = await fetch(`${API_BASE}/orders/status/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch order status")
    }

    if (data.order_status) {
      updateTracker(data.order_status)
    }
  } catch (err) {
    console.error("Status error:", err)

    document.getElementById("statusText").textContent =
      "Could not load order status."
  }
}

fetchOrderStatus()

setInterval(fetchOrderStatus, 3000)