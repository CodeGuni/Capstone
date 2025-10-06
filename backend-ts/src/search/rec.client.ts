export async function recSearchImage(
  baseUrl: string,
  payload: { imageKey: string; topK?: number }
) {
  const r = await fetch(`${baseUrl}/search/image`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`rec-svc ${r.status}`);
  return r.json();
}
