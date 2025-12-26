"""
schemas/jobs.py

Purpose:
- Define request and response shapes using Pydantic.

State machine:
- queued  : job created and waiting in queue
- running : inference worker picked up the job
- done    : image generation completed successfully
- error   : inference failed

"""


from pydantic import BaseModel
from typing import Optional, Literal

# request body for creating a new job
class CreateJobRequest(BaseModel):
    diary_text: str

# response returned right after job creation
class CreateJobResponse(BaseModel):
    job_id: str
    status: Literal["queued", "running", "done", "error"]

# response for checking job status
class JobStatusResponse(BaseModel):
    job_id: str
    status: Literal["queued", "running", "done", "error"]
    prompt: Optional[str] = None
    image_url: Optional[str] = None
    error: Optional[str] = None
