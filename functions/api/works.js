const allowedServices = new Set([
  "iot-embedded",
  "cctv-training",
  "automation-design",
  "web-development",
]);

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function validateWork(input) {
  const work = {
    id: cleanText(input.id, 80),
    title: cleanText(input.title, 140),
    serviceId: cleanText(input.serviceId, 80),
    status: cleanText(input.status, 40),
    date: cleanText(input.date, 20),
    image: cleanText(input.image, 1200000),
    description: cleanText(input.description, 1200),
  };

  if (!work.id || !work.title || !work.serviceId || !work.status || !work.date || !work.image || !work.description) {
    return { error: "All fields are required." };
  }
  if (!allowedServices.has(work.serviceId)) {
    return { error: "Invalid service category." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(work.date)) {
    return { error: "Date must use YYYY-MM-DD format." };
  }
  if (!/^https?:\/\//.test(work.image) && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(work.image)) {
    return { error: "Image must be an http(s) URL or a supported uploaded image." };
  }

  return { work };
}

function isAuthorized(request, env) {
  const configuredToken = env.ADMIN_TOKEN;
  const providedToken = request.headers.get("X-Admin-Token");
  return Boolean(configuredToken && providedToken && providedToken === configuredToken);
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, title, service_id AS serviceId, status, date, image, description FROM works ORDER BY date DESC, created_at DESC"
  ).all();

  return json({ works: results });
}

export async function onRequestPost({ request, env }) {
  if (!isAuthorized(request, env)) return json({ error: "Unauthorized." }, 401);

  const input = await request.json().catch(() => null);
  if (!input) return json({ error: "Invalid JSON body." }, 400);

  const validation = validateWork(input);
  if (validation.error) return json({ error: validation.error }, 400);
  const work = validation.work;

  await env.DB.prepare(
    "INSERT INTO works (id, title, service_id, status, date, image, description) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
  )
    .bind(work.id, work.title, work.serviceId, work.status, work.date, work.image, work.description)
    .run();

  return json({ work }, 201);
}
