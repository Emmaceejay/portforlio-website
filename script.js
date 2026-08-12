const services = [
  {
    id: "iot-embedded",
    title: "IoT & Embedded Systems",
    summary: "Custom connected devices, monitoring units, microcontroller systems, and product prototypes.",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=1200&q=80",
    accent: "#0f75bc",
    features: ["ESP32, Arduino, Raspberry Pi and sensor projects", "Remote monitoring and alert systems", "Prototype development and field testing", "Hardware-to-dashboard integrations"],
    icon: "cpu",
  },
  {
    id: "cctv-training",
    title: "CCTV Installation Training",
    summary: "Hands-on installation training for camera systems, networking, troubleshooting, and client handover.",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80",
    accent: "#c47f16",
    features: ["Camera placement and cabling workflow", "DVR/NVR setup and mobile viewing", "Network configuration basics", "Maintenance and fault diagnosis"],
    icon: "camera",
  },
  {
    id: "automation-design",
    title: "Automation Design",
    summary: "Smart control workflows for homes, businesses, workshops, facilities, and operational processes.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    accent: "#0f9f8f",
    features: ["Lighting, access, and equipment control", "Process automation and timed routines", "Remote commands and status reporting", "Efficiency-focused system design"],
    icon: "settings",
  },
  {
    id: "web-development",
    title: "Websites & Web Apps",
    summary: "Professional websites, dashboards, portals, landing pages, and operational web applications.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    accent: "#ba3d3d",
    features: ["Responsive business websites", "Admin dashboards and internal tools", "Booking, catalog, and data platforms", "API and device data interfaces"],
    icon: "code",
  },
];

const app = document.getElementById("app");
const nav = document.getElementById("site-nav");
const navToggle = document.getElementById("nav-toggle");
let editingId = null;
let worksCache = [];
let adminToken = "";

function createId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `work-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icon(name) {
  const paths = {
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"></rect><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"></path>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"></path><circle cx="12" cy="13" r="3"></circle>',
    settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"></path><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.38 1.07V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.07-.38H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .38-1.07V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.33.34.64.6 1 .28.28.66.43 1.07.43H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15Z"></path>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"></path>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (adminToken && options.method && options.method !== "GET") {
    headers["X-Admin-Token"] = adminToken;
  }
  const response = await fetch(path, {
    headers,
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function loadWorks() {
  try {
    const data = await apiRequest("/api/works");
    worksCache = data.works || [];
  } catch (error) {
    worksCache = [];
    console.error(error);
  }
}

function serviceName(serviceId) {
  return services.find((service) => service.id === serviceId)?.title || "General";
}

function renderHome() {
  app.innerHTML = document.getElementById("home-template").innerHTML + renderServicesSection() + renderWorksSection(worksCache.slice(0, 4), "Recent works");
}

function renderServicesSection() {
  return `
    <section>
      <div class="page-heading">
        <div>
          <p class="eyebrow">Services</p>
          <h2>Specialized delivery areas.</h2>
        </div>
        <p class="lead">Each service page includes a dedicated project log, so your portfolio grows naturally as you complete jobs and publish updates.</p>
      </div>
      <div class="service-grid">
        ${services.map((service) => `
          <a class="service-card" href="#service/${service.id}">
            <div class="service-image"><img src="${service.image}" alt="${service.title}"></div>
            <div class="service-body">
              <div class="service-icon" style="background:${service.accent}">${icon(service.icon)}</div>
              <h3>${service.title}</h3>
              <p>${service.summary}</p>
            </div>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function renderServicesPage() {
  app.innerHTML = renderServicesSection();
}

function renderServiceDetail(id) {
  const service = services.find((item) => item.id === id) || services[0];
  const serviceWorks = worksCache.filter((work) => work.serviceId === service.id);
  app.innerHTML = `
    <section class="service-detail">
      <div class="detail-image"><img src="${service.image}" alt="${service.title}"></div>
      <div class="detail-panel">
        <p class="eyebrow">Service detail</p>
        <h1>${service.title}</h1>
        <p class="lead">${service.summary}</p>
        <ul class="feature-list">
          ${service.features.map((feature) => `<li>${feature}</li>`).join("")}
        </ul>
        <a class="button button-primary" href="#contact">Request this service</a>
      </div>
    </section>
    ${renderWorksSection(serviceWorks, `${service.title} works`)}
  `;
}

function renderWorksSection(works, title = "Works") {
  return `
    <section>
      <div class="page-heading">
        <div>
          <p class="eyebrow">Portfolio log</p>
          <h2>${title}</h2>
        </div>
        <a class="button button-secondary" href="#contact">Start a project</a>
      </div>
      ${renderWorksGrid(works)}
    </section>
  `;
}

function renderWorksGrid(works) {
  if (!works.length) {
    return '<div class="empty-state">No project updates have been published here yet.</div>';
  }
  return `
    <div class="works-grid">
      ${works.map((work) => `
        <article class="work-card">
          <div class="work-image"><img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}"></div>
          <div class="work-body">
            <div class="work-meta">
              <span class="pill">${serviceName(work.serviceId)}</span>
              <span class="pill">${escapeHtml(work.status)}</span>
              <span class="pill">${escapeHtml(work.date)}</span>
            </div>
            <h3>${escapeHtml(work.title)}</h3>
            <p>${escapeHtml(work.description)}</p>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderWorksPage(active = "all") {
  const filtered = active === "all" ? worksCache : worksCache.filter((work) => work.serviceId === active);
  app.innerHTML = `
    <section>
      <div class="page-heading">
        <div>
          <p class="eyebrow">Works and updates</p>
          <h1>Project notes, jobs, and field work.</h1>
        </div>
      </div>
      <div class="filter-bar">
        <button class="${active === "all" ? "active" : ""}" data-filter="all">All</button>
        ${services.map((service) => `<button class="${active === service.id ? "active" : ""}" data-filter="${service.id}">${service.title}</button>`).join("")}
      </div>
      ${renderWorksGrid(filtered)}
    </section>
  `;
  app.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => renderWorksPage(button.dataset.filter));
  });
}

function renderAdmin() {
  app.innerHTML = `
    <section>
      <div class="page-heading">
        <div>
          <p class="eyebrow">Private admin</p>
          <h1>Manage portfolio updates.</h1>
        </div>
        <p class="admin-help">Updates are now saved through the backend API into Cloudflare D1. Protect this route before production with Cloudflare Access or another login layer.</p>
      </div>
      <div class="admin-layout">
        <div class="admin-panel">
          <form class="admin-form" id="work-form">
            <label>Admin token
              <input name="adminToken" type="password" required placeholder="Enter your private admin token">
            </label>
            <label>Title
              <input name="title" required maxlength="140" placeholder="Example: Smart gate control installation">
            </label>
            <label>Service
              <select name="serviceId" required>
                ${services.map((service) => `<option value="${service.id}">${service.title}</option>`).join("")}
              </select>
            </label>
            <label>Status
              <input name="status" required maxlength="40" placeholder="Live, Training, Prototype, Completed">
            </label>
            <label>Date
              <input name="date" type="date" required>
            </label>
            <label>Image URL
              <input name="image" required placeholder="Paste image link here or choose a file below">
            </label>
            <label>Upload image
              <input name="imageFile" type="file" accept="image/*">
            </label>
            <label>Description
              <textarea name="description" required maxlength="1200" placeholder="Write a short professional update about this job or work sample."></textarea>
            </label>
            <div class="form-actions">
              <button class="button button-primary" type="submit">Save update</button>
              <button class="button button-secondary" id="reset-form" type="button">Clear form</button>
            </div>
          </form>
        </div>
        <div class="admin-panel">
          <h2>Published updates</h2>
          <div class="admin-list">
            ${worksCache.map((work) => `
              <article class="admin-row">
                <div class="admin-thumb"><img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}"></div>
                <div>
                  <strong>${escapeHtml(work.title)}</strong>
                  <span>${serviceName(work.serviceId)} | ${escapeHtml(work.status)} | ${escapeHtml(work.date)}</span>
                </div>
                <div class="row-actions">
                  <button data-edit="${work.id}">Edit</button>
                  <button data-delete="${work.id}">Delete</button>
                </div>
              </article>
            `).join("") || '<div class="empty-state">No published updates yet.</div>'}
          </div>
        </div>
      </div>
    </section>
  `;
  bindAdminEvents();
}

function bindAdminEvents() {
  const form = document.getElementById("work-form");
  form.elements.date.value = new Date().toISOString().slice(0, 10);

  form.elements.imageFile.addEventListener("change", () => {
    const file = form.elements.imageFile.files[0];
    if (!file) return;
    if (file.size > 900000) {
      alert("Please choose an image below 900 KB for this simple database-backed version.");
      form.elements.imageFile.value = "";
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      form.elements.image.value = reader.result;
    });
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const entry = Object.fromEntries(formData.entries());
    adminToken = entry.adminToken;
    delete entry.adminToken;
    delete entry.imageFile;

    try {
      if (editingId) {
        await apiRequest(`/api/works/${encodeURIComponent(editingId)}`, {
          method: "PUT",
          body: JSON.stringify(entry),
        });
        editingId = null;
      } else {
        await apiRequest("/api/works", {
          method: "POST",
          body: JSON.stringify({ id: createId(), ...entry }),
        });
      }
      await loadWorks();
      renderAdmin();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("reset-form").addEventListener("click", () => {
    editingId = null;
    form.reset();
    form.elements.date.value = new Date().toISOString().slice(0, 10);
  });

  app.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const work = worksCache.find((item) => item.id === button.dataset.edit);
      if (!work) return;
      editingId = work.id;
      form.elements.title.value = work.title;
      form.elements.serviceId.value = work.serviceId;
      form.elements.status.value = work.status;
      form.elements.date.value = work.date;
      form.elements.image.value = work.image;
      form.elements.description.value = work.description;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  app.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const confirmed = confirm("Delete this portfolio update?");
      if (!confirmed) return;
      try {
        await apiRequest(`/api/works/${encodeURIComponent(button.dataset.delete)}`, { method: "DELETE" });
        await loadWorks();
        renderAdmin();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function renderContact() {
  app.innerHTML = document.getElementById("contact-template").innerHTML;
}

function setActiveNav(route) {
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const target = link.getAttribute("href").replace("#", "");
    link.classList.toggle("active", route.startsWith(target));
  });
}

async function router() {
  const route = location.hash.replace("#", "") || "home";
  const [page, id] = route.split("/");
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  setActiveNav(page);
  await loadWorks();

  if (page === "services") renderServicesPage();
  else if (page === "service") renderServiceDetail(id);
  else if (page === "works") renderWorksPage();
  else if (page === "admin") renderAdmin();
  else if (page === "contact") renderContact();
  else renderHome();

  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("hashchange", router);
router();
