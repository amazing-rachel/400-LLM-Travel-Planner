from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from llmService import generate_itinerary

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripRequest(BaseModel):
    destination: str
    startDate: str
    endDate: str
    budget: int
    activities: str


@app.post("/trip-input")
def trip_input(request: TripRequest):
    try:
        itinerary = generate_itinerary(request)

        return{
            "success": True,
            "itinerary": itinerary
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }