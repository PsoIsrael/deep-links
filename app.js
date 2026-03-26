(function () {
  const APP_SCHEME = "psonaapp://";
//   const IOS_STORE_URL = "https://apps.apple.com/app/idYOUR_APPLE_APP_ID";
  const ANDROID_STORE_URL = "https://play.google.com/store/apps/details?id=com.psoisrael.pso_app";

  const titleEl = document.getElementById("title");
  const descEl = document.getElementById("desc");
  const postIdEl = document.getElementById("postId");
  const currentUrlEl = document.getElementById("currentUrl");
  const openAppBtn = document.getElementById("openAppBtn");
  const storeBtn = document.getElementById("storeBtn");
  const statusText = document.getElementById("statusText");

  function getPlatform() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(ua)) return "android";
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return "ios";
    return "web";
  }

  function getPostIdFromPath(pathname) {
    // ожидаем путь вида /post/123
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "post") {
      return decodeURIComponent(parts[1]);
    }
    return null;
  }

  function buildAppLink(postId) {
    // это должен поддерживать React Native routing
    // пример: yourapp://post/123
    return `${APP_SCHEME}post/${encodeURIComponent(postId)}`;
  }

  function getStoreUrl(platform) {
    if (platform === "ios") return IOS_STORE_URL;
    if (platform === "android") return ANDROID_STORE_URL;
    return ANDROID_STORE_URL;
  }

  function tryOpenApp(appUrl) {
    // Простая попытка открыть приложение
    // Для Universal Links основная магия будет идти через сам https домен,
    // но эта кнопка полезна и как fallback.
    window.location.href = appUrl;
  }

  function init() {
    const pathname = window.location.pathname;
    const currentUrl = window.location.href;
    const postId = getPostIdFromPath(pathname);
    const platform = getPlatform();
    const appUrl = postId ? buildAppLink(postId) : APP_SCHEME;
    const storeUrl = getStoreUrl(platform);

    currentUrlEl.textContent = currentUrl;
    storeBtn.href = storeUrl;
    openAppBtn.href = appUrl;

    if (!postId) {
      titleEl.textContent = "Пост не найден";
      descEl.textContent = "В ссылке нет корректного ID поста.";
      postIdEl.textContent = "—";
      statusText.textContent = "Проверь формат ссылки. Ожидается путь вида /post/123";
      return;
    }

    postIdEl.textContent = postId;
    titleEl.textContent = `Открытие поста #${postId}`;
    descEl.textContent = "Если приложение установлено и deep links настроены, пост откроется в приложении.";

    openAppBtn.addEventListener("click", function (e) {
      e.preventDefault();
      tryOpenApp(appUrl);
    });

    // Авто-попытка открытия только на мобилках
    if (platform === "ios" || platform === "android") {
      statusText.textContent = "Пробуем открыть приложение автоматически…";

      // Небольшая задержка, чтобы страница успела отрисоваться
      setTimeout(function () {
        tryOpenApp(appUrl);
      }, 600);

      // Если не открылось, пользователь останется на странице
      setTimeout(function () {
        statusText.textContent =
          "Если приложение не открылось, нажми «Открыть в приложении» или перейди в магазин.";
      }, 1800);
    } else {
      statusText.textContent =
        "На компьютере автоматическое открытие приложения может не сработать. Открой ссылку на телефоне.";
    }
  }

  init();
})();