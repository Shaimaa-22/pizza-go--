const LANG_KEY = "pizza_go_lang";

async function loadLanguage(lang = "en") {
  try {
    const isInsidePages =
      window.location.pathname.includes("/pages/");

    const path = isInsidePages
      ? `../lang/${lang}.json`
      : `./lang/${lang}.json`;

    const response = await fetch(path);

    const translations = await response.json();

    document.documentElement.lang = lang;

    document.documentElement.dir =
      lang === "ar" ? "rtl" : "ltr";

    applyTranslations(translations);

    updateLanguageButton(lang);

    localStorage.setItem(LANG_KEY, lang);

  } catch (error) {
    console.error("Language loading error:", error);
  }
}

function applyTranslations(translations) {
  document
    .querySelectorAll("[data-i18n]")
    .forEach((element) => {

      const key =
        element.getAttribute("data-i18n");

      const value = getNestedValue(
        translations,
        key
      );

      if (value) {
        element.textContent = value;
      }
    });
}

function getNestedValue(obj, path) {
  return path
    .split(".")
    .reduce((acc, part) => acc?.[part], obj);
}

function toggleLanguage() {
  const current =
    localStorage.getItem(LANG_KEY) || "en";

  const next =
    current === "ar" ? "en" : "ar";

  loadLanguage(next);
}

function updateLanguageButton(lang) {
  const btn =
    document.getElementById("langToggle");

  if (!btn) return;

  btn.innerHTML =
    lang === "ar"
      ? "EN"
      : "AR";
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const savedLang =
      localStorage.getItem(LANG_KEY) || "en";

    loadLanguage(savedLang);

    const btn =
      document.getElementById("langToggle");

    if (btn) {
      btn.addEventListener(
        "click",
        toggleLanguage
      );
    }
  }
);
