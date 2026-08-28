import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


async def analyze_damage(images: list[tuple[bytes, str]]) -> dict:
    prompt = """
    You are an expert insurance claims adjuster AI with 20 years of experience. 
    Analyze these vehicle damage photos carefully from multiple angles.

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

    Severity and cost guide:
    - LOW: cosmetic only (light scratches, small dents), $200-$800
    - MEDIUM: moderate (bumper replacement, single panel), $800-$3,000
    - HIGH: significant (multiple panels, structural components), $3,000-$10,000
    - CRITICAL: severe (frame damage, airbags deployed, total loss risk), $10,000-$50,000+

    IMPORTANT: Analyze the specific damage visible in ALL photos carefully.
    Give a precise, narrow cost range based on exact damage observed.
    The range should reflect your confidence — if damage is clear, keep the range tight.
    """

    content = [prompt]
    for image_bytes, mime_type in images:
        content.append({"mime_type": mime_type, "data": image_bytes})

    response = model.generate_content(content)
    cleaned = response.text.strip().replace("```json", "").replace("```", "").strip()
    result = json.loads(cleaned)

    return result