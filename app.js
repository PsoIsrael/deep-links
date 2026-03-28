(function () {
  const API_BASE = "https://us-central1-psonaapp.cloudfunctions.net/api";
  const PLAY_URL = "https://play.google.com/store/apps/details?id=com.psoisrael.pso_app";

  const titleEl = document.getElementById("title");
  const textEl = document.getElementById("text");
  const fallbackEl = document.getElementById("fallback");

  function getPublicKeyFromPath() {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    if (!path) return null;
    if (path.includes("/")) return null; // только /publicKey
    return decodeURIComponent(path);
  }

  async function resolveDeepLink(publicKey) {
    const r = await fetch(`${API_BASE}/deeplinks/${encodeURIComponent(publicKey)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await r.json().catch(() => null);

    if (!r.ok || !data?.ok || !data?.deeplink?.appUrl) {
      throw new Error(data?.error || "DEEPLINK_NOT_FOUND");
    }

    return data.deeplink;
  }

  function showFallback(message) {
    titleEl.textContent = "Ссылка недоступна";
    textEl.textContent = message || "Приложение не установлено или ссылка больше не работает.";
    fallbackEl.classList.remove("hidden");
  }

  function tryOpenApp(appUrl) {
    window.location.href = appUrl;
  }

  async function init() {
    const publicKey = getPublicKeyFromPath();

    if (!publicKey) {
      showFallback("Некорректная ссылка.");
      return;
    }

    try {
      titleEl.textContent = "Открываем приложение…";
      textEl.textContent = "Проверяем ссылку и пытаемся открыть пост.";

      const result = await resolveDeepLink(publicKey);

      setTimeout(() => {
        tryOpenApp(result.appUrl);
      }, 150);

      setTimeout(() => {
        showFallback("Если приложение не открылось, установи его из Google Play.");
      }, 1800);
    } catch (e) {
      showFallback("Ссылка недействительна или пост больше не существует.");
    }
  }

  init();
})();