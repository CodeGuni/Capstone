<<<<<<< HEAD
import axios from "axios";

const RECOMMENDER_URL = process.env.REC_SVC_URL || "http://localhost:8001";

/**
 * 🔹 Fetch text-based recommendations from the AI microservice
 * @param query - Search query (e.g., "red dress")
 * @param k - Number of results to return
 */
export async function getRecommendations(query: string, k = 3) {
  try {
    const res = await axios.get(`${RECOMMENDER_URL}/search/text`, {
      params: { q: query, k },
    });
    return res.data.results;
  } catch (error: any) {
    console.error("❌ Error calling rec_svc (text):", error.message);
    return [];
  }
}

/**
 * 🔹 Fetch image-based recommendations from the AI microservice
 * @param imageUrl - URL of the image
 * @param k - Number of results to return
 */
export async function getImageRecommendations(imageUrl: string, k = 5) {
  try {
    const res = await axios.post(`${RECOMMENDER_URL}/search/image`, {
      image_url: imageUrl,
      k,
    });
    return res.data.results;
  } catch (error: any) {
    console.error("❌ Error calling rec_svc (image):", error.message);
    return [];
  }
=======
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
>>>>>>> origin/main
}
