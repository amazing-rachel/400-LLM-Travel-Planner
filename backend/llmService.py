from dotenv import load_dotenv

import os

from google import genai


# Load .env file locally
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"
client = genai.Client(api_key = GEMINI_API_KEY)

def build_prompt(data):
    return f"""
You are a travel planning assistant.

Create a **day-by-day itinerary** for a trip to {data.destination}, strictly following this format for each day:

Day X — [Date] ([Short Description])
Morning
[Activities or sights to do in the morning, concise, include approximate costs if possible]

Afternoon
[Activities or sights to do in the afternoon, concise, include approximate costs if possible]

Lunch
[Restaurant or meal suggestion, approximate cost]

Evening
[Activities or sights for evening, optional sightseeing or walks]

Dinner
[Restaurant or meal suggestion, approximate cost]

Daily total estimate: [total for that day]

Requirements:
- Include only day-by-day plans, **no extra overview or general notes**.
- Label days as "Day 1", "Day 2", etc., with date and short descriptor in parentheses.
- Include morning, afternoon, lunch, evening, dinner sections for each day.
- Each section must be on a separate line exactly as shown.
- Include approximate costs for activities, meals, or transportation **inside each day only**.
- Do not include a summary, budget breakdown at the end, or extra explanations.
- Keep the formatting clean and consistent as shown above.

Trip details:
- Destination: {data.destination}
- Dates: {data.startDate} to {data.endDate}
- Budget: ${data.budget}
- Preferences: {data.activities}

Return the output exactly in the specified day-by-day format.
"""

def generate_itinerary(data):
    prompt = build_prompt(data)

    response = client.models.generate_content(
        model = GEMINI_MODEL,
        contents = [prompt]
    )

    return response.text