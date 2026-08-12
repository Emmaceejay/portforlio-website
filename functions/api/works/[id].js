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
    title: cleanText(input.title, 140),
    serviceId: cleanText(input.serviceId, 80),
    status: cleanText(input.status, 40),
    date: cleanText(input.date, 20),
    image: cleanText(input.image, 1200000),
    description: cleanText(input.description, 1200),
  };

  if (!work.title || !work.serviceId || !work.status || !work.date || !work.image || !work.description) {
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

export async function onRequestPut({ request, env, params }) {
  if (!isAuthorized(request, env)) return json({ error: "Unauthorized." }, 401);

  const input = await request.json().catch(() => null);
  if (!input) return json({ error: "Invalid JSON body." }, 400);

  const id = cleanText(params.id, 80);
  const validation = validateWork(input);
  if (validation.error) return json({ error: validation.error }, 400);
  const work = validation.work;

  const result = await env.DB.prepare(
    "UPDATE works SET title = ?1, service_id = ?2, status = ?3, date = ?4, image = ?5, description = ?6, updated_at = CURRENT_TIMESTAMP WHERE id = ?7"
  )
    .bind(work.title, work.serviceId, work.status, work.date, work.image, work.description, id)
    .run();

  if (!result.meta.changes) return json({ error: "Portfolio update not found." }, 404);
  return json({ work: { id, ...work } });
}

export async function onRequestDelete({ request, env, params }) {
  if (!isAuthorized(request, env)) return json({ error: "Unauthorized." }, 401);

  const id = cleanText(params.id, 80);
  const result = await env.DB.prepare("DELETE FROM works WHERE id = ?1").bind(id).run();
  if (!result.meta.changes) return json({ error: "Portfolio update not found." }, 404);
  return json({ ok: true });
}
