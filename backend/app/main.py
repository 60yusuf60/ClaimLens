from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .routes.claims import router as claims_router
from .routes.damage import router as damage_router

load_dotenv()

app = FastAPI(
    title="ClaimLens API",
    description="AI-powered insurance claims processing",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(claims_router)
app.include_router(damage_router)

@app.get("/")
def root():
    return {"message": "ClaimLens API is running"}