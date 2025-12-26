"""
routes/jobs.py

This file defines the gateway's core HTTP APIs

The gateway never runs AI models
It only:
  1. Accepts user request
  2. Creates jobs
  3. Pushes jobs into Redis queue
  4. Returns job status

Actual inference is handled by a separate GPU worker service
"""


from fastapi import APIRouter, HTTPException
from uuid import uuid4
from ..core.redis import r
from ..schemas.jobs import CreateJobRequest, CreateJobResponse, JobStatusResponse

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("", response_model=CreateJobResponse)
def create_job(req: CreateJobRequest):
    job_id = uuid4().hex
    key = f"job:{job_id}"

    r.hset(key, mapping={
        "status": "queued",
        "diary_text": req.diary_text,
        "prompt": "",
        "image_url": "",
        "error": "",
    })

    r.lpush("queue:jobs", job_id)

    return CreateJobResponse(job_id=job_id, status="queued")

@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job(job_id: str):
    key = f"job:{job_id}"
    if not r.exists(key):
        raise HTTPException(status_code=404, detail="job not found")

    data = r.hgetall(key)
    return JobStatusResponse(
        job_id=job_id,
        status=data.get("status", "queued"),
        prompt=data.get("prompt") or None,
        image_url=data.get("image_url") or None,
        error=data.get("error") or None,
    )
