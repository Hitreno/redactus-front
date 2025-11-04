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
  const siteNav = document.querySelector("[data-nav]");
  const navPanel = siteNav?.querySelector("[data-nav-panel]");
  let navBackdrop = siteNav?.querySelector("[data-nav-backdrop]");
  const desktopQuery = window.matchMedia("(min-width: 768px)");

  if (navToggle && siteNav && navPanel) {
    const navOriginalParent = siteNav.parentElement;
    const navPlaceholder = document.createComment("site-nav-placeholder");
    navOriginalParent?.insertBefore(navPlaceholder, siteNav.nextElementSibling);

    if (navBackdrop) {
      if (navBackdrop.parentElement !== document.body) {
        document.body.appendChild(navBackdrop);
      }
    } else {
      navBackdrop = document.createElement("div");
      navBackdrop.className = "site-nav__backdrop";
      navBackdrop.dataset.navBackdrop = "";
      document.body.appendChild(navBackdrop);
    }

    let outsidePointerHandler = null;

    const placeNav = (isDesktop) => {
      if (isDesktop) {
        const targetParent = navPlaceholder.parentNode;
        if (targetParent && siteNav.parentElement !== targetParent) {
          targetParent.insertBefore(siteNav, navPlaceholder);
        }
      } else if (siteNav.parentElement !== document.body) {
        document.body.appendChild(siteNav);
      }
    };

    const syncAriaHidden = () => {
      if (desktopQuery.matches) {
        siteNav.removeAttribute("aria-hidden");
      } else {
        siteNav.setAttribute("aria-hidden", siteNav.classList.contains("is-open") ? "false" : "true");
      }
    };

    const detachOutsideListener = () => {
      if (!outsidePointerHandler) {
        return;
      }
      document.removeEventListener("click", outsidePointerHandler, true);
      document.removeEventListener("touchstart", outsidePointerHandler, true);
      outsidePointerHandler = null;
    };

    const closeNav = ({ focusToggle = false } = {}) => {
      siteNav.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      navBackdrop?.classList.remove("is-active");
      detachOutsideListener();
      syncAriaHidden();
      if (focusToggle) {
        navToggle.focus();
      }
    };

    const handleOutsidePointer = (event) => {
      if (desktopQuery.matches || !siteNav.classList.contains("is-open")) {
        return;
      }
      const target = event.target;
      if (target instanceof Node && (siteNav.contains(target) || navToggle.contains(target))) {
        return;
      }
      closeNav();
    };

    const attachOutsideListener = () => {
      if (outsidePointerHandler) {
        return;
      }
      outsidePointerHandler = handleOutsidePointer;
      document.addEventListener("click", outsidePointerHandler, true);
      document.addEventListener("touchstart", outsidePointerHandler, true);
    };

    const openNav = () => {
      if (desktopQuery.matches) {
        return;
      }
      placeNav(false);
      siteNav.classList.add("is-open");
      navToggle.classList.add("is-active");
      navToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      navBackdrop?.classList.add("is-active");
      syncAriaHidden();
      window.requestAnimationFrame(attachOutsideListener);
    };

    navToggle.addEventListener("click", () => {
      if (desktopQuery.matches) {
        return;
      }
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener("click", () => {
        if (!desktopQuery.matches) {
          closeNav();
        }
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (!desktopQuery.matches) {
          closeNav();
        }
      });
    });

    const handleBreakpointChange = (event) => {
      placeNav(event.matches);
      if (event.matches) {
        closeNav();
      } else {
        syncAriaHidden();
      }
    };

    placeNav(desktopQuery.matches);
    handleBreakpointChange(desktopQuery);
    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleBreakpointChange);
    } else {
      desktopQuery.addListener(handleBreakpointChange);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteNav.classList.contains("is-open") && !desktopQuery.matches) {
        closeNav({ focusToggle: true });
      }
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
      content.setAttribute("aria-hidden", "true");
      content.classList.remove("is-open");
      item.classList.remove("is-open");
    };

    const openItem = (item) => {
      const button = item.querySelector("[data-faq-toggle]");
      const content = item.querySelector("[data-faq-content]");
      if (!button || !content) {
        return;
      }
      button.setAttribute("aria-expanded", "true");
      content.setAttribute("aria-hidden", "false");
      item.classList.add("is-open");
      content.classList.add("is-open");
    };

    faqItems.forEach((item) => {
      const button = item.querySelector("[data-faq-toggle]");
      const content = item.querySelector("[data-faq-content]");
      if (!button || !content) {
        return;
      }

      button.setAttribute("aria-expanded", "false");
      content.setAttribute("aria-hidden", "true");
      content.classList.remove("is-open");
      item.classList.remove("is-open");

      button.addEventListener("click", () => {
        const isOpen = button.getAttribute("aria-expanded") === "true";
        faqItems.filter((other) => other !== item).forEach((other) => closeItem(other));
        if (isOpen) {
          closeItem(item);
        } else {
          openItem(item);
        }
      });

    });
  }

  const yearHolder = document.querySelector("[data-current-year]");
  if (yearHolder) {
    yearHolder.textContent = String(new Date().getFullYear());
  }
});
