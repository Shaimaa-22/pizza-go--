(function () {
  const root = document.documentElement;
  const btns = () => document.querySelectorAll(".theme-toggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("pizza_go_theme", theme);

    btns().forEach((btn) => {
      btn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
    });
  }

  let savedTheme = localStorage.getItem("pizza_go_theme");

  if (savedTheme !== "dark" && savedTheme !== "light") {
    savedTheme = "dark";
  }

  applyTheme(savedTheme || "dark");

  document.addEventListener("DOMContentLoaded", () => {
    btns().forEach((btn) => {
      btn.onclick = function () {
        const current = root.getAttribute("data-theme") || "dark";
        applyTheme(current === "dark" ? "light" : "dark");
      };
    });

    applyTheme(localStorage.getItem("pizza_go_theme") || "dark");
  });
})();