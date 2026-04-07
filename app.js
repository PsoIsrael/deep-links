(function () {
  const API_BASE = "https://us-central1-psonaapp.cloudfunctions.net/api";
  const PLAY_URL = "https://play.google.com/store/apps/details?id=com.psoisrael.pso_app";
  const APP_STORE_URL = "https://apps.apple.com/il/app/na-%D0%B8%D0%B7%D1%80%D0%B0%D0%B8%D0%BB%D1%8C/id6756632226";
  const APP_SCHEME = "psoapp://";

  const titleEl = document.getElementById("title");
  const textEl = document.getElementById("text");
  const fallbackEl = document.getElementById("fallback");

  function getPublicKeyFromPath() {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    if (!path || path.includes("/")) return null;
    return decodeURIComponent(path);
  }

  async function resolveDeepLink(publicKey) {
    const r = await fetch(`${API_BASE}/deeplinks/${encodeURIComponent(publicKey)}`);
    const data = await r.json().catch(() => null);

    if (!r.ok || !data?.ok || !data?.deeplink?.postId) {
      throw new Error(data?.error || "NOT_FOUND");
    }

    return data.deeplink;
  }

  function buildAppUrl(postId) {
    return `${APP_SCHEME}post/${encodeURIComponent(postId)}`;
  }

  function isIOS() {
    const ua = window.navigator.userAgent || window.navigator.vendor || "";
    return /iPad|iPhone|iPod/.test(ua);
  }

  function showFallback(message) {
    titleEl.textContent = "Открыть приложение";
    textEl.textContent = message || "Если приложение не открылось, установи его.";

    const link = fallbackEl.querySelector("a");
    if (link) {
      if (isIOS()) {
        link.href = APP_STORE_URL;
        link.textContent = "Скачать в App Store";
      } else {
        link.href = PLAY_URL;
        link.textContent = "Скачать в Google Play";
      }
    }

    fallbackEl.classList.remove("hidden");
  }

  async function init() {
    const publicKey = getPublicKeyFromPath();
    if (!publicKey) {
      showFallback("Некорректная ссылка.");
      return;
    }

    try {
      const result = await resolveDeepLink(publicKey);
      const appUrl = buildAppUrl(result.postId);

      setTimeout(() => {
        window.location.href = appUrl;
      }, 120);

      setTimeout(() => {
        showFallback("Если приложение не открылось, установи его");
      }, 1800);
    } catch {
      showFallback("Ссылка недействительна или пост больше не существует.");
    }
  }

  init();
})();