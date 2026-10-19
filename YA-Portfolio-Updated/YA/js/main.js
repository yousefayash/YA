/* ==========================================================================
   Youssef Ayash - Portfolio behaviour
   All content comes from js/config.js. Sections of this file:
   helpers, rendering, navigation, scroll effects, dialogs, contact form.
   ========================================================================== */
(function () {
  "use strict";

  const config = window.PORTFOLIO_CONFIG;
  if (config) {
    try {
      const savedProjects = localStorage.getItem("ya_portfolio_projects");
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        if (Array.isArray(parsedProjects)) config.projects = parsedProjects;
      }
      const savedSettings = JSON.parse(localStorage.getItem("ya_portfolio_settings") || "{}");
      if (savedSettings.ownerName) {
        document.querySelectorAll("[data-owner-name]").forEach((node) => node.textContent = savedSettings.ownerName);
      }
      if (savedSettings.heroLead) {
        const lead = document.querySelector(".hero-lead");
        if (lead) lead.textContent = savedSettings.heroLead;
      }
      if (savedSettings.journeyIntro) {
        const intro = document.querySelector(".journey-heading > p");
        if (intro) intro.textContent = savedSettings.journeyIntro;
      }
    } catch (error) {
      console.warn("Saved portfolio settings could not be loaded.", error);
    }
  }
  if (!config) {
    console.error("Portfolio config not found. Make sure js/config.js loads before js/main.js.");
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Helpers ---------- */

  const ICONS = {
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
    x: '<path d="M4 4l16 16M20 4L4 20"/>',
    email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>'
  };

  function hasUrl(url) {
    return typeof url === "string" && url.trim() !== "";
  }

  function prettyUrl(url) {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  /** Create an element: h("a", { class: "btn", href: "#" }, "Text", childNode) */
  function h(tag, attributes, ...children) {
    const element = document.createElement(tag);
    Object.entries(attributes || {}).forEach(([name, value]) => {
      if (value !== null && value !== undefined && value !== false) {
        element.setAttribute(name, value === true ? "" : value);
      }
    });
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      element.append(child.nodeType ? child : document.createTextNode(child));
    });
    return element;
  }

  function createIcon(name, size) {
    const wrapper = document.createElement("span");
    wrapper.innerHTML =
      '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || "") + "</svg>";
    return wrapper.firstElementChild;
  }

  /** A real link when the URL exists, otherwise a clearly disabled placeholder. */
  function createActionLink(label, url, className) {
    if (hasUrl(url)) {
      return h("a", { class: className, href: url, target: "_blank", rel: "noopener noreferrer" }, label);
    }
    return h(
      "span",
      { class: className, role: "link", "aria-disabled": "true", "aria-label": label + " (link not available yet)", title: "Link not available yet" },
      label
    );
  }

  function pageIsLocked(locked) {
    document.body.classList.toggle("no-scroll", locked);
  }

  /* ---------- Static content from config ---------- */

  function renderOwnerDetails() {
    document.querySelectorAll(".js-profile-image").forEach((image) => {
      image.src = config.owner.profileImage;
      image.alt = config.owner.profileAlt;
    });

    document.getElementById("current-year").textContent = new Date().getFullYear();

    const availability = config.availability || {};
    if (availability.show && availability.text) {
      document.getElementById("availability-text").textContent = availability.text;
      const dot = document.getElementById("availability-dot");
      if (availability.state === "available") dot.classList.add("is-available");
      if (availability.state === "busy") dot.classList.add("is-busy");
      document.getElementById("availability").hidden = false;
    }
  }

  function renderSkills() {
    const grid = document.getElementById("skills-grid");
    config.skills.forEach((group, index) => {
      const card = h(
        "article",
        { class: "skill-card reveal", style: "transition-delay:" + index * 70 + "ms" },
        h("h3", { class: "skill-card-title" }, group.category),
        h("p", { class: "skill-card-desc" }, group.description),
        h("ul", { class: "skill-tags" }, group.items.map((item) => h("li", { class: "skill-tag" }, item)))
      );
      grid.append(card);
    });
  }

  function renderProjects() {
    const grid = document.getElementById("projects-grid");
    config.projects.forEach((project, index) => {
      const detailsButton = h(
        "button",
        { class: "btn btn-ghost btn-small", type: "button", "aria-haspopup": "dialog" },
        "View Details"
      );
      detailsButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openProjectDialog(project, detailsButton);
      });

      const card = h(
        "article",
        { class: "project-card reveal", style: "transition-delay:" + (index % 2) * 90 + "ms" },
        h(
          "div",
          { class: "project-card-image" },
          h("img", { src: project.image, alt: project.imageAlt, width: "640", height: "360", loading: "lazy" })
        ),
        h(
          "div",
          { class: "project-card-body" },
          h("h3", {}, project.name),
          h("p", { class: "project-card-summary" }, project.summary),
          h("ul", { class: "tech-list", "aria-label": "Technologies used" }, project.technologies.map((tech) => h("li", { class: "tech-tag" }, tech))),
          h(
            "div",
            { class: "card-links" },
            createActionLink("Live Demo", project.liveUrl, "btn btn-primary btn-small"),
            createActionLink("Source Code", project.sourceUrl, "btn btn-ghost btn-small"),
            detailsButton
          )
        )
      );

      // The whole card opens the details, except when a link or button inside was used.
      card.addEventListener("click", (event) => {
        if (event.target.closest("a, button, [aria-disabled]")) return;
        openProjectDialog(project, detailsButton);
      });

      grid.append(card);
    });
  }

  function renderContactLinks() {
    const list = document.getElementById("contact-links");
    const footerList = document.getElementById("footer-socials");

    const entries = [];
    entries.push({
      label: "Email",
      icon: "email",
      url: hasUrl(config.contact.email) ? "mailto:" + config.contact.email.trim() : "",
      text: hasUrl(config.contact.email) ? config.contact.email.trim() : ""
    });
    config.socials.forEach((social) => {
      if (social.optional && !hasUrl(social.url)) return;
      entries.push({
        label: social.label,
        icon: social.id,
        url: social.url,
        text: hasUrl(social.url) ? prettyUrl(social.url) : ""
      });
    });

    entries.forEach((entry) => {
      const enabled = hasUrl(entry.url);
      const content = [
        h("span", { class: "contact-icon" }, createIcon(entry.icon, 22)),
        h(
          "span",
          {},
          h("span", { class: "contact-label" }, entry.label),
          h("span", { class: "contact-value" }, enabled ? entry.text : "Not added yet")
        )
      ];

      const item = enabled
        ? h("a", { class: "contact-link", href: entry.url, target: entry.icon === "email" ? null : "_blank", rel: entry.icon === "email" ? null : "noopener noreferrer" }, content)
        : h("span", { class: "contact-link is-disabled", role: "link", "aria-disabled": "true", title: "This link has not been added yet" }, content);
      list.append(h("li", {}, item));

      if (enabled) {
        footerList.append(
          h("li", {}, h("a", { href: entry.url, target: entry.icon === "email" ? null : "_blank", rel: entry.icon === "email" ? null : "noopener noreferrer" }, entry.label))
        );
      }
    });

    footerList.hidden = footerList.children.length === 0;
  }

  /* ---------- Navigation ---------- */

  function setupNavigation() {
    const header = document.getElementById("site-header");
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("nav-links");

    function setMenu(open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) setMenu(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  function setupActiveSection() {
    const links = document.querySelectorAll("[data-nav]");
    const sections = Array.from(links).map((link) => document.getElementById(link.dataset.nav));

    function setActive(id) {
      links.forEach((link) => {
        const active = link.dataset.nav === id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => section && observer.observe(section));
  }

  /* ---------- Scroll effects ---------- */

  function setupScrollEffects() {
    const header = document.getElementById("site-header");
    const backToTop = document.getElementById("back-to-top");
    const contactLink = document.querySelector('[data-nav="contact"]');
    let hideTimer;
    let ticking = false;

    function showBackToTop(show) {
      clearTimeout(hideTimer);
      if (show) {
        backToTop.hidden = false;
        requestAnimationFrame(() => backToTop.classList.add("is-visible"));
      } else {
        backToTop.classList.remove("is-visible");
        hideTimer = setTimeout(() => { backToTop.hidden = true; }, 260);
      }
    }

    function update() {
      ticking = false;
      header.classList.toggle("is-scrolled", window.scrollY > 10);

      const shouldShow = window.scrollY > 600;
      if (shouldShow !== backToTop.classList.contains("is-visible")) showBackToTop(shouldShow);

      // At the very bottom the short Contact section may sit above the observer line.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && contactLink) {
        document.querySelectorAll("[data-nav]").forEach((link) => {
          link.classList.toggle("is-active", link === contactLink);
        });
      }
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  function setupScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((item) => observer.observe(item));
  }

  /* ---------- Project details dialog ---------- */

  const projectDialog = document.getElementById("project-dialog");
  const projectDialogBody = document.getElementById("project-dialog-body");
  let projectOpener = null;

  function createDetailSection(title, content) {
    return h("div", { class: "project-section" }, h("h3", {}, title), content);
  }

  function openProjectDialog(project, opener) {
    projectOpener = opener;

    projectDialogBody.replaceChildren(
      h("img", { class: "project-cover", src: project.image, alt: project.imageAlt, width: "880", height: "495" }),
      h("h2", { class: "project-dialog-title", id: "project-dialog-title" }, project.name),
      h("p", {}, project.overview),
      createDetailSection("Main features", h("ul", { class: "detail-list" }, project.features.map((feature) => h("li", {}, feature)))),
      createDetailSection("Technologies used", h("ul", { class: "tech-list" }, project.technologies.map((tech) => h("li", { class: "tech-tag" }, tech)))),
      createDetailSection(
        "Screenshots",
        h("div", { class: "screenshots-grid" }, project.screenshots.map((shot) => h("img", { src: shot.src, alt: shot.alt, loading: "lazy", width: "400", height: "250" })))
      ),
      createDetailSection("Challenges and learning outcomes", h("ul", { class: "detail-list" }, project.learnings.map((item) => h("li", {}, item)))),
      h(
        "div",
        { class: "project-actions" },
        createActionLink("Live Demo", project.liveUrl, "btn btn-primary"),
        createActionLink("Source on GitHub", project.sourceUrl, "btn btn-ghost")
      )
    );

    projectDialog.scrollTop = 0;
    projectDialog.showModal();
    pageIsLocked(true);
  }

  function setupProjectDialog() {
    document.getElementById("project-dialog-close").addEventListener("click", () => projectDialog.close());
    projectDialog.addEventListener("click", (event) => {
      const box = projectDialog.getBoundingClientRect();
      const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
      if (outside) projectDialog.close();
    });
    projectDialog.addEventListener("close", () => {
      pageIsLocked(false);
      if (projectOpener) projectOpener.focus();
    });
  }

  /* ---------- Contact form ---------- */

  function setupContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    const submitButton = document.getElementById("contact-submit");
    const endpoint = hasUrl(config.contact.formEndpoint) ? config.contact.formEndpoint.trim() : "";
    const email = hasUrl(config.contact.email) ? config.contact.email.trim() : "";

    if (!endpoint && email) submitButton.textContent = "Send via Email App";

    const rules = {
      name: { test: (value) => value.length >= 2, message: "Please enter your name (at least 2 characters)." },
      email: { test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), message: "Please enter a valid email address." },
      subject: { test: (value) => value.length >= 3, message: "Please enter a subject (at least 3 characters)." },
      message: { test: (value) => value.length >= 10, message: "Please write a message of at least 10 characters." }
    };

    function setFieldError(fieldName, message) {
      const input = form.elements[fieldName];
      document.getElementById("contact-" + fieldName + "-error").textContent = message;
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }

    function setStatus(type, message) {
      status.className = "form-status is-" + type;
      status.textContent = message;
    }

    function validate() {
      let firstInvalid = null;
      Object.keys(rules).forEach((fieldName) => {
        const input = form.elements[fieldName];
        const valid = rules[fieldName].test(input.value.trim());
        setFieldError(fieldName, valid ? "" : rules[fieldName].message);
        if (!valid && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    Object.keys(rules).forEach((fieldName) => {
      form.elements[fieldName].addEventListener("input", () => {
        if (form.elements[fieldName].getAttribute("aria-invalid")) setFieldError(fieldName, "");
      });
    });

    async function sendWithService(data) {
      submitButton.disabled = true;
      setStatus("info", "Sending your message...");
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Request failed with status " + response.status);
        form.reset();
        setStatus("success", "Thank you! Your message was sent.");
      } catch (error) {
        console.error(error);
        setStatus("error", "Sorry, the message could not be sent. Please try again later" + (email ? " or email " + email + " directly." : "."));
      } finally {
        submitButton.disabled = false;
      }
    }

    function openEmailApp(data) {
      const body = "Name: " + data.name + "\nEmail: " + data.email + "\n\n" + data.message;
      window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(data.subject) + "&body=" + encodeURIComponent(body);
      setStatus("info", "Your email app should open with the message ready. Nothing is sent until you press send there. If nothing opens, write to " + email + ".");
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      setStatus("info", "");
      if (!validate()) return;

      const data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        subject: form.elements.subject.value.trim(),
        message: form.elements.message.value.trim()
      };

      if (endpoint) sendWithService(data);
      else if (email) openEmailApp(data);
      else setStatus("error", "This form isn't connected yet. Please check back soon or reach out through the links on this page.");
    });
  }

  /* ---------- Theme ---------- */

  function setupThemeToggle() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("ya_portfolio_theme");
    if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
    else root.dataset.theme = "dark";

    function syncButton() {
      const light = root.dataset.theme === "light";
      button.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
      button.title = light ? "Switch to dark theme" : "Switch to light theme";
      const label = button.querySelector(".theme-toggle-label");
      if (label) label.textContent = light ? "Dark mode" : "Light mode";
      const icon = button.querySelector("[aria-hidden='true']");
      if (icon) icon.textContent = light ? "☾" : "☼";
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = light ? "#f4f7fb" : "#07090D";
    }

    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      localStorage.setItem("ya_portfolio_theme", root.dataset.theme);
      syncButton();
    });
    syncButton();
  }

  /* ---------- Start ---------- */

  setupThemeToggle();
  renderOwnerDetails();
  renderSkills();
  renderProjects();
  renderContactLinks();
  setupNavigation();
  setupActiveSection();
  setupScrollEffects();
  setupProjectDialog();
  setupContactForm();
  setupScrollReveal(); // last, so it also covers the cards created above
})();
