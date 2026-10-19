(function () {
  "use strict";
  const STORAGE_PROJECTS = "ya_portfolio_projects";
  const STORAGE_SETTINGS = "ya_portfolio_settings";
  const STORAGE_THEME = "ya_portfolio_theme";
  const DEFAULT_PASSWORD = "change-this-password"; // Change this only for a local demo; it is not server security.
  const config = window.PORTFOLIO_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const loginPanel = $("#login-panel");
  const dashboard = $("#dashboard");
  const loginForm = $("#login-form");
  const loginMessage = $("#login-message");
  const projectList = $("#project-admin-list");
  const projectForm = $("#project-form");
  const toast = $("#toast");
  let projects = [];
  let settings = {};
  let toastTimer;

  function loadData() {
    try {
      const storedProjects = localStorage.getItem(STORAGE_PROJECTS);
      projects = storedProjects ? JSON.parse(storedProjects) : JSON.parse(JSON.stringify(config.projects));
      if (!Array.isArray(projects)) projects = JSON.parse(JSON.stringify(config.projects));
      settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || "{}");
    } catch (error) {
      projects = JSON.parse(JSON.stringify(config.projects));
      settings = {};
    }
  }
  function persistProjects() {
    localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(projects));
    renderProjects();
    updateStats();
    notify("Projects saved in this browser.");
  }
  function notify(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }
  function safeText(element, value) { element.textContent = value == null ? "" : String(value); }
  function goToTab(name) {
    document.querySelectorAll(".tab-panel").forEach((panel) => { panel.hidden = panel.id !== "tab-" + name; });
    document.querySelectorAll("[data-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === name));
    const titles = { overview: "Overview", projects: "Projects", profile: "Profile & story", data: "Backup & data" };
    safeText($("#page-title"), titles[name] || "Overview");
  }
  function updateStats() {
    safeText($("#stat-projects"), projects.length);
    safeText($("#stat-skills"), config.skills.length);
    safeText($("#stat-theme"), document.documentElement.dataset.theme === "light" ? "Light" : "Dark");
  }
  function renderProjects() {
    projectList.replaceChildren();
    if (!projects.length) {
      const empty = document.createElement("div");
      empty.className = "content-card";
      empty.textContent = "No projects yet. Use Add project to create one.";
      projectList.append(empty);
      return;
    }
    projects.forEach((project, index) => {
      const row = document.createElement("article");
      row.className = "project-row";
      const image = document.createElement("img");
      image.src = project.image || "assets/images/favicon.svg";
      image.alt = "";
      image.loading = "lazy";
      image.onerror = () => { image.src = "assets/images/favicon.svg"; };
      const info = document.createElement("div");
      const title = document.createElement("h3");
      safeText(title, project.name || "Untitled project");
      const summary = document.createElement("p");
      safeText(summary, project.summary || "No description added yet.");
      info.append(title, summary);
      const actions = document.createElement("div");
      actions.className = "row-actions";
      const edit = document.createElement("button");
      edit.type = "button"; edit.textContent = "Edit";
      edit.addEventListener("click", () => openProjectEditor(index));
      const remove = document.createElement("button");
      remove.type = "button"; remove.className = "delete-project"; remove.textContent = "Delete";
      remove.addEventListener("click", () => {
        if (!window.confirm('Delete "' + (project.name || "this project") + '" from the local portfolio list?')) return;
        projects.splice(index, 1);
        persistProjects();
      });
      actions.append(edit, remove);
      row.append(image, info, actions);
      projectList.append(row);
    });
  }
  function openProjectEditor(index) {
    const existing = Number.isInteger(index) && index >= 0 ? projects[index] : null;
    $("#project-form-title").textContent = existing ? "Edit project" : "Add project";
    $("#project-id").value = existing ? String(index) : "";
    $("#project-name").value = existing ? existing.name || "" : "";
    $("#project-image").value = existing ? existing.image || "" : "assets/images/projects/";
    $("#project-summary").value = existing ? existing.summary || "" : "";
    $("#project-tech").value = existing ? (existing.technologies || []).join(", ") : "HTML5, CSS3, JavaScript";
    $("#project-live").value = existing ? existing.liveUrl || "" : "";
    $("#project-source").value = existing ? existing.sourceUrl || "" : "";
    $("#project-overview").value = existing ? existing.overview || "" : "";
    $("#project-message").textContent = "";
    projectForm.hidden = false;
    projectForm.scrollIntoView({ behavior: "smooth", block: "start" });
    $("#project-name").focus();
  }
  function closeProjectEditor() { projectForm.hidden = true; projectForm.reset(); }
  function readSettingsForm() {
    $("#profile-name").value = settings.ownerName || "Youssef Ayash.";
    $("#profile-tagline").value = settings.heroLead || "I build responsive, modern web experiences with clean code, thoughtful design, and attention to detail.";
    $("#profile-journey").value = settings.journeyIntro || "I'm Youssef Ayash, a front-end developer who enjoys turning ideas into useful, polished web experiences. Over the last four years, I've grown from learning the basics of the web to building multi-page projects, working with APIs, and exploring how the front end connects to real data. I'm still learning, and every project gives me a new problem to solve.";
  }
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_THEME, theme);
    updateStats();
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if ($("#admin-password").value === DEFAULT_PASSWORD) {
      loginPanel.hidden = true;
      dashboard.hidden = false;
      loadData();
      renderProjects();
      readSettingsForm();
      updateStats();
      goToTab("overview");
      return;
    }
    loginMessage.textContent = "That password doesn't match. Update DEFAULT_PASSWORD in js/admin.js for your local demo.";
    $("#admin-password").select();
  });
  document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => goToTab(button.dataset.tab)));
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => goToTab(button.dataset.go)));
  $("#logout-button").addEventListener("click", () => {
    dashboard.hidden = true; loginPanel.hidden = false; $("#admin-password").value = ""; loginMessage.textContent = "";
  });
  $("#admin-theme").addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"));
  $("#add-project").addEventListener("click", () => openProjectEditor(-1));
  $("#cancel-project").addEventListener("click", closeProjectEditor);
  $("#cancel-project-bottom").addEventListener("click", closeProjectEditor);
  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const indexValue = $("#project-id").value;
    const name = $("#project-name").value.trim();
    const image = $("#project-image").value.trim();
    const summary = $("#project-summary").value.trim();
    const technologies = $("#project-tech").value.split(",").map((item) => item.trim()).filter(Boolean);
    const liveUrl = $("#project-live").value.trim();
    const sourceUrl = $("#project-source").value.trim();
    const overview = $("#project-overview").value.trim();
    if (!name || !image || !summary || !technologies.length) {
      $("#project-message").textContent = "Add a name, image path, description, and at least one technology.";
      return;
    }
    for (const url of [liveUrl, sourceUrl]) {
      if (url && !/^https?:\/\//i.test(url)) {
        $("#project-message").textContent = "Links must begin with https:// or http://.";
        return;
      }
    }
    const previous = indexValue !== "" ? projects[Number(indexValue)] : null;
    const item = {
      ...(previous || {}),
      id: previous ? previous.id : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36),
      name, summary, image, imageAlt: name + " project preview", technologies,
      liveUrl, sourceUrl, overview: overview || summary,
      features: previous ? previous.features || [] : [],
      screenshots: previous ? previous.screenshots || [{ src: image, alt: name + " project preview" }] : [{ src: image, alt: name + " project preview" }],
      learnings: previous ? previous.learnings || [] : []
    };
    if (indexValue !== "") projects[Number(indexValue)] = item;
    else projects.push(item);
    persistProjects();
    closeProjectEditor();
  });
  $("#profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    settings = {
      ownerName: $("#profile-name").value.trim(),
      heroLead: $("#profile-tagline").value.trim(),
      journeyIntro: $("#profile-journey").value.trim()
    };
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
    $("#profile-message").textContent = "Profile settings saved in this browser.";
    notify("Profile settings saved.");
  });
  $("#reset-profile").addEventListener("click", () => {
    settings = {};
    localStorage.removeItem(STORAGE_SETTINGS);
    readSettingsForm();
    $("#profile-message").textContent = "Profile fields reset to the original copy. Save nothing else to keep defaults.";
  });
  $("#export-data").addEventListener("click", () => {
    const data = { version: 1, projects, settings, theme: localStorage.getItem(STORAGE_THEME) || "dark" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "youssef-portfolio-backup.json"; link.click();
    URL.revokeObjectURL(url);
    $("#data-message").textContent = "Backup prepared.";
  });
  $("#import-data").addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || data.version !== 1 || !Array.isArray(data.projects) || typeof data.settings !== "object") throw new Error("Invalid backup format.");
      projects = data.projects;
      settings = data.settings || {};
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(projects));
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
      if (data.theme === "light" || data.theme === "dark") applyTheme(data.theme);
      renderProjects(); readSettingsForm(); updateStats();
      $("#data-message").textContent = "Backup restored in this browser.";
      notify("Backup restored.");
    } catch (error) {
      $("#data-message").textContent = "Could not import this file. Choose a JSON backup exported by this dashboard.";
    } finally { event.target.value = ""; }
  });
  $("#reset-data").addEventListener("click", () => {
    if (!window.confirm("Remove saved project and profile overrides from this browser?")) return;
    localStorage.removeItem(STORAGE_PROJECTS);
    localStorage.removeItem(STORAGE_SETTINGS);
    localStorage.removeItem(STORAGE_THEME);
    projects = JSON.parse(JSON.stringify(config.projects)); settings = {};
    applyTheme("dark"); renderProjects(); readSettingsForm(); updateStats();
    $("#data-message").textContent = "Local overrides removed.";
    notify("Default content restored.");
  });

  const theme = localStorage.getItem(STORAGE_THEME);
  if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
  loadData();
  updateStats();
})();
