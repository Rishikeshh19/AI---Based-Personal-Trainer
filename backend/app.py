from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from config import settings

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Based Personal Trainer Assistant API!"}