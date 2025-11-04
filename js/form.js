document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-callback-form]");
  if (!form) {
    return;
  }

  const endpoint = "https://api.rakurs.cloud/webhook/landing-form1";
  const submitButton = form.querySelector('button[type="submit"]');
  const consentCheckbox = form.querySelector("[data-accept-terms]");
  const statusOverlay = form.querySelector("[data-form-status]");
  const statusClasses = ["contact-form--status-pending", "contact-form--status-success", "contact-form--status-error"];
  const fallbackErrorMessage =
    'К сожалению форма на обслуживании. Свяжитесь пожалуйста по номеру +79881616017 или напишите в телеграм <a href="https://t.me/hitreno" target="_blank" rel="noopener noreferrer">@hitreno</a>';
  let statusTimer = null;

  const clearStatus = () => {
    if (statusTimer) {
      clearTimeout(statusTimer);
      statusTimer = null;
    }
    form.classList.remove("contact-form--status", ...statusClasses);
    if (statusOverlay) {
      statusOverlay.hidden = true;
      statusOverlay.textContent = "";
    }
  };

  const showStatus = (state, message, { autoHide = false, delay = 2000, html = false } = {}) => {
    if (!statusOverlay) {
      return;
    }
    if (statusTimer) {
      clearTimeout(statusTimer);
      statusTimer = null;
    }

    form.classList.add("contact-form--status");
    form.classList.remove(...statusClasses);
    if (state) {
      form.classList.add(`contact-form--status-${state}`);
    }
    if (html) {
      statusOverlay.innerHTML = message;
    } else {
      statusOverlay.textContent = message;
    }
    statusOverlay.hidden = false;

    if (autoHide) {
      statusTimer = window.setTimeout(() => {
        clearStatus();
      }, delay);
    }
  };

  const setSubmitting = (state) => {
    if (!submitButton) {
      return;
    }
    submitButton.disabled = state;
    submitButton.setAttribute("aria-busy", state ? "true" : "false");
  };

  clearStatus();

  const deriveErrorMessage = () => fallbackErrorMessage;

  const requestCaptchaToken = async () => {
    if (!window.captchaManager || typeof window.captchaManager.requestToken !== "function") {
      throw new Error("Сервис проверки недоступен. Попробуйте позже.");
    }
    return window.captchaManager.requestToken();
  };

  const submitPayload = async (token) => {
    const payload = {
      name: form.elements.namedItem("name")?.value?.trim() ?? "",
      contact: form.elements.namedItem("contact")?.value?.trim() ?? "",
      comment: form.elements.namedItem("comment")?.value?.trim() ?? "",
      accept_terms: true,
      captcha_token: token,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
  };

  form.addEventListener("input", () => {
    if (form.classList.contains("contact-form--status") && !form.classList.contains("contact-form--status-pending")) {
      clearStatus();
    }
  });

  form.addEventListener("focusin", () => {
    if (form.classList.contains("contact-form--status") && !form.classList.contains("contact-form--status-pending")) {
      clearStatus();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    clearStatus();
    showStatus("pending", "Отправляем заявку…");
    setSubmitting(true);

    try {
      const token = await requestCaptchaToken();
      await submitPayload(token);

      form.reset();
      if (consentCheckbox) {
        consentCheckbox.checked = false;
      }
      showStatus("success", "Заявка отправлена! Свяжемся в течение дня.", { autoHide: true });
    } catch (error) {
      const message = deriveErrorMessage(error);
      showStatus("error", message, { html: true });
      console.error("Callback form submission error:", error);
    } finally {
      setSubmitting(false);
      window.captchaManager?.reset?.();
    }
  });
});
