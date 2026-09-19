/**
 * Simple keyword-matching chatbot. No real AI/LLM call — good enough
 * for a hackathon demo. Swap this out later for an actual LLM API call
 * (e.g. the Anthropic API) without changing the route's request/response shape.
 */
const RULES = [
  {
    keywords: ["help", "sos", "emergency", "danger", "unsafe"],
    intent: "emergency_guidance",
    reply:
      "If you're in immediate danger, use the SOS button to alert your emergency contacts now. Do you want me to guide you through it?",
  },
  {
    keywords: ["safe", "route", "way", "path", "directions"],
    intent: "route_help",
    reply:
      "I can help you find the safest route. Tell me your starting point and destination and I'll rank routes by safety score.",
  },
  {
    keywords: ["area", "locality", "neighbourhood", "neighborhood"],
    intent: "area_audit_help",
    reply:
      "Tell me the locality name and I'll pull up its safety score, lighting, crowd density, and nearby safe havens.",
  },
  {
    keywords: ["travel", "companion", "circle", "buddy", "group"],
    intent: "travel_circle_help",
    reply:
      "You can post a travel request with your route and time, and I'll match you with other verified travellers heading the same way.",
  },
  {
    keywords: ["hi", "hello", "hey"],
    intent: "greeting",
    reply: "Hi, I'm your SheSuraksha assistant. How can I help you stay safe today?",
  },
];

const DEFAULT_REPLY =
  "I'm not sure I understood that yet, but I can help with safety routes, area safety scores, emergency SOS, or travel circles. What do you need?";

function getChatbotReply(message) {
  const lower = message.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return { reply: rule.reply, intent: rule.intent };
    }
  }

  return { reply: DEFAULT_REPLY, intent: "unknown" };
}

module.exports = { getChatbotReply };
