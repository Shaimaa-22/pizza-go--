(function () {
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("pizza_go_theme", theme);

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
    });
  }

  const savedTheme = localStorage.getItem("pizza_go_theme") || "dark";
  applyTheme(savedTheme);

  window.toggleTheme = function () {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", window.toggleTheme);
    });
    applyTheme(root.getAttribute("data-theme") || savedTheme);
  });
})();