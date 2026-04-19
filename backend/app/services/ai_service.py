import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


async def analyze_damage(images: list[tuple[bytes, str]]) -> dict:
    prompt = """
    You are an expert insurance claims adjuster AI. Analyze these vehicle/property damage photos.
    Multiple angles are provided for a more accurate assessment.

    Respond ONLY with a valid JSON object, no extra text:
    {
      "damage_type": "detailed description of all damaged areas",
      "vehicle_make": "car brand if visible, otherwise Unknown",
      "vehicle_model": "car model if visible, otherwise Unknown",
      "vehicle_color": "car color if visible, otherwise Unknown",
      "severity": "LOW or MEDIUM or HIGH or CRITICAL",
      "estimated_cost_min": 1000,
      "estimated_cost_max": 3000,
      "confidence_score": 0.85,
      "ai_summary": "2-3 sentence professional summary based on all photos"
    }

    Severity guide:
    - LOW: cosmetic damage, under $500
    - MEDIUM: moderate damage, $500-$3000
    - HIGH: significant damage, $3000-$10000
    - CRITICAL: severe damage, over $10000
    """

    content = [prompt]
    for image_bytes, mime_type in images:
        content.append({"mime_type": mime_type, "data": image_bytes})

    response = model.generate_content(content)
    cleaned = response.text.strip().replace("```json", "").replace("```", "").strip()
    result = json.loads(cleaned)

    return result