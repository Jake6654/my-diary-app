"""
main.py

Entry point for the gateway service.

Responsibilities:
- Initialize FastAPI app
- Register API routes
- Provide health check endpoint

The gateway is:
- CPU-only
- Always on
- Stateless except for Redis
"""

from fastapi import FastAPI
from .routes.jobs import router as jobs_router

app = FastAPI()
app.include_router(jobs_router)

@app.get("/health")
def health():
    return {"ok": True}
