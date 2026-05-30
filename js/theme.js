(function () {
  const savedTheme = localStorage.getItem("pizza_go_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("pizza_go_theme", next);

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.textContent = next === "dark" ? "☀️ Light" : "🌙 Dark";
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.textContent = savedTheme === "dark" ? "☀️ Light" : "🌙 Dark";
      btn.addEventListener("click", window.toggleTheme);
    });
  });
})();
