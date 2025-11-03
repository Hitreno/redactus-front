document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-header]");
  let lastScrollY = window.scrollY || 0;
  let headerTicking = false;

  const updateHeader = () => {
    const current = window.scrollY || 0;
    if (Math.abs(current - lastScrollY) > 8 && header) {
      const shouldHide = current > 120 && current > lastScrollY;
      header.classList.toggle("is-hidden", shouldHide);
      lastScrollY = current;
    }
    headerTicking = false;
  };

  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        if (!headerTicking) {
          window.requestAnimationFrame(updateHeader);
          headerTicking = true;
        }
      },
      { passive: true }
    );
  }

  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sections = Array.from(document.querySelectorAll("[data-section]"));

  if (navLinks.length && sections.length) {
    const setActiveLink = (id) => {
      navLinks.forEach((link) => {
        const targetId = link.getAttribute("href")?.replace("#", "");
        link.classList.toggle("nav-link--active", targetId === id);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          .forEach((entry) => setActiveLink(entry.target.id));
      },
      { threshold: [0.25, 0.6], rootMargin: "-20% 0px -40% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const mobileLinks = Array.from(document.querySelectorAll("[data-mobile-link]"));

  if (navToggle && mobileNav) {
    const closeMobileNav = () => {
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("is-open");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
    };

    const openMobileNav = () => {
      navToggle.classList.add("is-active");
      navToggle.setAttribute("aria-expanded", "true");
      mobileNav.classList.add("is-open");
      mobileNav.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
    };

    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    mobileNav.addEventListener("click", (event) => {
      if (event.target === mobileNav) {
        closeMobileNav();
      }
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => closeMobileNav());
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        closeMobileNav();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    });
  }

  const form = document.querySelector("[data-callback-form]");
  if (form) {
    const defaultNote = form.querySelector("[data-note-default]");
    const successNote = form.querySelector("[data-note-success]");
    let resetTimer = null;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();

      if (defaultNote) {
        defaultNote.hidden = true;
      }
      if (successNote) {
        successNote.hidden = false;
      }

      if (resetTimer) {
        clearTimeout(resetTimer);
      }

      resetTimer = window.setTimeout(() => {
        if (defaultNote) {
          defaultNote.hidden = false;
        }
        if (successNote) {
          successNote.hidden = true;
        }
      }, 4000);
    });
  }

  const faqItems = Array.from(document.querySelectorAll(".faq__item"));
  if (faqItems.length) {
    const closeItem = (item) => {
      const button = item.querySelector("[data-faq-toggle]");
      const content = item.querySelector("[data-faq-content]");
      if (!button || !content) {
        return;
      }
      button.setAttribute("aria-expanded", "false");
      content.classList.remove("is-open");
      content.setAttribute("aria-hidden", "true");
      content.style.maxHeight = "0px";
      item.classList.remove("is-open");
    };

    const openItem = (item) => {
      const button = item.querySelector("[data-faq-toggle]");
      const content = item.querySelector("[data-faq-content]");
      if (!button || !content) {
        return;
      }
      button.setAttribute("aria-expanded", "true");
      content.classList.add("is-open");
      content.setAttribute("aria-hidden", "false");
      content.style.maxHeight = `${content.scrollHeight}px`;
      item.classList.add("is-open");
    };

    faqItems.forEach((item) => {
      const button = item.querySelector("[data-faq-toggle]");
      const content = item.querySelector("[data-faq-content]");
      if (!button || !content) {
        return;
      }

      button.setAttribute("aria-expanded", "false");
      content.setAttribute("aria-hidden", "true");
      content.style.maxHeight = "0px";

      button.addEventListener("click", () => {
        const isOpen = button.getAttribute("aria-expanded") === "true";
        faqItems.filter((other) => other !== item).forEach((other) => closeItem(other));
        if (isOpen) {
          closeItem(item);
        } else {
          openItem(item);
        }
      });

      content.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "max-height") {
          return;
        }
        if (!content.classList.contains("is-open")) {
          content.style.maxHeight = "0px";
        }
      });
    });

    window.addEventListener("resize", () => {
      faqItems.forEach((item) => {
        const content = item.querySelector("[data-faq-content]");
        if (content && content.classList.contains("is-open")) {
          content.style.maxHeight = `${content.scrollHeight}px`;
        }
      });
    });
  }

  const yearHolder = document.querySelector("[data-current-year]");
  if (yearHolder) {
    yearHolder.textContent = String(new Date().getFullYear());
  }
});
