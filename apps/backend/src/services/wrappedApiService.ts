import { AuditLogger } from './auditLogger';

// ─── Wrapped API Service ─────────────────────────────────────
// Generic caller for Locus Wrapped APIs
// Endpoint: POST /api/wrapped/{provider}/{endpoint}

const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';
const LOCUS_API_KEY = process.env.LOCUS_API_KEY || 'claw_dev_DUMMY_KEY';

const audit = AuditLogger.getInstance();

interface WrappedApiResponse {
  data: any;
  cost: number;
  provider: string;
}

/**
 * Generic Wrapped API caller
 */
async function callWrappedApi(
  provider: string,
  endpoint: string,
  body: Record<string, any>,
  tripId: string
): Promise<WrappedApiResponse> {
  audit.log({
    tripId,
    agentName: 'Research',
    action: `Calling ${provider}/${endpoint}`,
    reasoning: `Using Locus Wrapped API marketplace`,
    apiProvider: provider,
    apiCost: 0.01, // estimated
    severity: 'info',
  });

  // DUMMY: Return mock data
  // TODO: Replace with real API call
  // const res = await fetch(`${LOCUS_API_BASE}/wrapped/${provider}/${endpoint}`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${LOCUS_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(body)
  // });
  // if (res.status === 202) {
  //   // Cost exceeds threshold — need human approval
  //   const approval = await res.json();
  //   audit.log({ ... });
  //   return { data: null, cost: 0, provider, needsApproval: true, approvalUrl: approval.url };
  // }

  return { data: {}, cost: 0.01, provider };
}

// ─── Brave Search ────────────────────────────────────────────

export async function searchWeb(
  query: string,
  tripId: string
): Promise<{ results: Array<{ title: string; url: string; description: string }> }> {
  audit.log({
    tripId,
    agentName: 'Research',
    action: `Searching: "${query}"`,
    reasoning: 'Finding the best flight and hotel options',
    apiProvider: 'brave-search',
    apiCost: 0.005,
    severity: 'info',
  });

  // DUMMY: Return mock search results
  return {
    results: [
      {
        title: 'Best Hotels in Tokyo 2026 - TripAdvisor',
        url: 'https://tripadvisor.com/Hotels-Tokyo',
        description: 'Top rated hotels in Tokyo from $150/night',
      },
      {
        title: 'Cheap Flights to Tokyo - Skyscanner',
        url: 'https://skyscanner.com/flights/tokyo',
        description: 'Find flights from $450 round trip',
      },
      {
        title: 'Tokyo Travel Guide - Lonely Planet',
        url: 'https://lonelyplanet.com/tokyo',
        description: 'Everything you need to know about visiting Tokyo',
      },
    ],
  };
}

// ─── Firecrawl (Web Scraping) ────────────────────────────────

export async function scrapeUrl(
  url: string,
  tripId: string
): Promise<{ content: string; title: string; price?: string }> {
  audit.log({
    tripId,
    agentName: 'Research',
    action: `Scraping ${new URL(url).hostname}`,
    reasoning: 'Extracting price and details from booking page',
    apiProvider: 'firecrawl',
    apiCost: 0.01,
    severity: 'info',
  });

  // DUMMY
  return {
    title: 'Hotel Gracery Shinjuku',
    content: 'Modern hotel in the heart of Shinjuku, walking distance to major attractions...',
    price: '$185/night',
  };
}

// ─── OpenWeather ─────────────────────────────────────────────

export interface WeatherForecast {
  location: string;
  dates: string;
  avgTemp: number;
  conditions: string;
  alerts: string[];
}

export async function getWeather(
  location: string,
  dates: string,
  tripId: string
): Promise<WeatherForecast> {
  audit.log({
    tripId,
    agentName: 'Research',
    action: `Checking weather for ${location}`,
    reasoning: `Ensuring no severe weather during trip dates (${dates})`,
    apiProvider: 'openweather',
    apiCost: 0.002,
    severity: 'info',
  });

  // DUMMY
  return {
    location,
    dates,
    avgTemp: 24,
    conditions: 'Partly cloudy with occasional sunshine',
    alerts: [],
  };
}

// ─── Mapbox ──────────────────────────────────────────────────

export async function getTransitTime(
  from: string,
  to: string,
  tripId: string
): Promise<{ duration: string; distance: string; mode: string }> {
  audit.log({
    tripId,
    agentName: 'Research',
    action: `Calculating transit: ${from} → ${to}`,
    reasoning: 'Optimizing hotel selection based on proximity to attractions',
    apiProvider: 'mapbox',
    apiCost: 0.003,
    severity: 'info',
  });

  // DUMMY
  return {
    duration: '25 minutes',
    distance: '12.3 km',
    mode: 'taxi',
  };
}

// ─── Gemini 2.5 (AI Synthesis) ───────────────────────────────

export async function synthesizeItinerary(
  researchData: Record<string, any>,
  tripId: string
): Promise<{
  summary: string;
  recommendedFlight: any;
  recommendedHotel: any;
  recommendedActivities: any[];
  totalEstimatedCost: number;
}> {
  audit.log({
    tripId,
    agentName: 'Research',
    action: 'Synthesizing research into ranked itinerary',
    reasoning: 'Using Gemini 2.5 to analyze all data and create optimal travel plan',
    apiProvider: 'gemini',
    apiCost: 0.03,
    severity: 'info',
  });

  // DUMMY: Return a mock itinerary
  const result = {
    summary: `Based on my research, I recommend a 5-day trip to ${researchData.destination || 'Tokyo'}. The weather looks great with average temperatures of 24°C. I found excellent flight and hotel options within your budget.`,
    recommendedFlight: {
      airline: 'ANA (All Nippon Airways)',
      route: 'SFO → NRT',
      price: 520,
      class: 'Economy',
      duration: '11h 15m',
      departure: '2026-07-15T10:00:00Z',
    },
    recommendedHotel: {
      name: 'Hotel Gracery Shinjuku',
      location: 'Shinjuku, Tokyo',
      pricePerNight: 185,
      totalNights: 5,
      totalPrice: 925,
      rating: 4.5,
      amenities: ['WiFi', 'Breakfast', 'City View'],
    },
    recommendedActivities: [
      { name: 'Senso-ji Temple Tour', price: 15, duration: '3h' },
      { name: 'Tsukiji Outer Market Food Walk', price: 45, duration: '2.5h' },
      { name: 'Mt. Fuji Day Trip', price: 120, duration: '10h' },
    ],
    totalEstimatedCost: 520 + 925 + 15 + 45 + 120,
  };

  audit.log({
    tripId,
    agentName: 'Research',
    action: `Itinerary ready — estimated total: $${result.totalEstimatedCost}`,
    reasoning: `Flight: $${result.recommendedFlight.price} (${result.recommendedFlight.airline}) | Hotel: $${result.recommendedHotel.totalPrice} (${result.recommendedHotel.name}) | Activities: $${result.recommendedActivities.reduce((s, a) => s + a.price, 0)}`,
    severity: 'success',
  });

  return result;
}

// ─── ScreenshotOne ───────────────────────────────────────────

export async function captureScreenshot(
  url: string,
  tripId: string
): Promise<{ imageUrl: string }> {
  audit.log({
    tripId,
    agentName: 'Delivery',
    action: `Capturing booking confirmation screenshot`,
    reasoning: `Proof of booking from ${new URL(url).hostname}`,
    apiProvider: 'screenshotone',
    apiCost: 0.01,
    severity: 'info',
  });

  // DUMMY
  return {
    imageUrl: `https://via.placeholder.com/800x600?text=Booking+Confirmation`,
  };
}
