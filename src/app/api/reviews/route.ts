import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface CachedData { reviews: unknown[]; rating: number; total: number; fetchedAt: number }
let cache: CachedData | null = null;
const CACHE_TTL = 3600_000; // 1 hour

export async function GET() {
  const API_KEY = (process.env.GOOGLE_PLACES_API_KEY || "").trim();
  const PLACE_ID = (process.env.GOOGLE_PLACE_ID || "").trim();

  if (!API_KEY || !PLACE_ID) {
    // Return empty — no reviews configured
    return NextResponse.json({ reviews: [], rating: 0, total: 0 });
  }

  // Return cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      console.error("Google Places error:", data.status, data.error_message);
      return NextResponse.json({ reviews: [], rating: 0, total: 0 });
    }

    const result = data.result || {};
    const reviews = (result.reviews || []).map((r: Record<string, unknown>) => ({
      author: r.author_name || "Anonymous",
      rating: r.rating || 5,
      text: r.text || "",
      time: r.relative_time_description || "",
      photo: r.profile_photo_url || "",
    }));

    cache = { reviews, rating: result.rating || 0, total: result.user_ratings_total || 0, fetchedAt: Date.now() };
    return NextResponse.json(cache);
  } catch (err) {
    console.error("Reviews fetch error:", err);
    return NextResponse.json({ reviews: [], rating: 0, total: 0 });
  }
}
