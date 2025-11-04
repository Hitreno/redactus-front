(function () {
  const SITE_KEY = "ysc1_ByjWwwiL5Udzh4gn2NacBVdbczfudJSTcAdvb7xh23d5a2be";
  const FORM_SELECTOR = "[data-callback-form]";
  const CONTAINER_ID = "smartcaptcha-container";

  let isRendered = false;
  let pendingRequest = null;

  const getForm = () => document.querySelector(FORM_SELECTOR);

  const ensureContainer = () => {
    let container = document.getElementById(CONTAINER_ID);
    if (container) {
      return container;
    }
    const form = getForm();
    if (!form) {
      return null;
    }
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    form.appendChild(container);
    return container;
  };

  const handleToken = (token) => {
    if (pendingRequest) {
      pendingRequest.resolve(token);
      pendingRequest = null;
    }
  };

  const renderCaptcha = () => {
    if (isRendered || !window.smartCaptcha) {
      return;
    }
    const container = ensureContainer();
    if (!container) {
      return;
    }
    window.smartCaptcha.render(CONTAINER_ID, {
      sitekey: SITE_KEY,
      invisible: true,
      hideShield: true,
      callback: handleToken,
    });
    isRendered = true;
  };

  window.smartCaptchaOnload = () => {
    renderCaptcha();
  };

  document.addEventListener("DOMContentLoaded", () => {
    ensureContainer();
  });

  window.captchaManager = {
    isReady() {
      return Boolean(window.smartCaptcha) && isRendered;
    },
    requestToken() {
      if (!window.smartCaptcha || !isRendered) {
        return Promise.reject(new Error("Сервис проверки недоступен. Попробуйте позже."));
      }
      if (pendingRequest) {
        return Promise.reject(new Error("Проверка уже выполняется. Завершите текущую проверку."));
      }
      return new Promise((resolve, reject) => {
        pendingRequest = { resolve, reject };
        try {
          window.smartCaptcha.execute();
        } catch (error) {
          pendingRequest = null;
          reject(error instanceof Error ? error : new Error("Не удалось запустить проверку."));
        }
      });
    },
    reset() {
      if (window.smartCaptcha && typeof window.smartCaptcha.reset === "function" && isRendered) {
        window.smartCaptcha.reset();
      }
      pendingRequest = null;
    },
  };
})();
