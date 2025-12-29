"""
worker.py

Role:
- Main background worker process.
- Consumes job IDs from Redis queue and runs the full inference pipeline.

Code flow:
1. Load diffusion model to GPU once
2. Wait for jobs via BRPOP (blocking)
3. For each job:
   - set status=running
   - read diary_text
   - build prompt with LLM
   - generate image with diffusion
   - upload image to Supabase
   - set status=done + store prompt + image_url
4. If idle for WORKER_IDLE_SECONDS, exit to save GPU cost 
"""

import time
from .core.redis import r
from .core.config import WORKER_IDLE_SECONDS
from .llm.prompt_builder import build_illustration_prompt
from .diffusion.sd3 import load_model_once, generate_png_bytes
from .storage.supabase_storage import upload_png_bytes

QUEUE_KEY = "queue:jobs"
JOB_KEY_PREFIX = "job:"

def update_job(job_id: str, status: str, **fields):
    job_key = f"{JOB_KEY_PREFIX}{job_id}"
    mapping = {"status": status}
    mapping.update(fields)
    r.hset(job_key, mapping=mapping)

def main():
    # load SD3 into GPU memory once per worker lifecycle (Cold Start)
    load_model_once()

    last_work_time = time.time()

    while True:
        # BRPOP blocks until an item appears, reducing CPU waste
        item = r.brpop(QUEUE_KEY, timeout=5)

        if item is None:
            # No job arrived within timeout window -> check for idle shutdown
            if time.time() - last_work_time > WORKER_IDLE_SECONDS:
                print(f"[worker] idle for {WORKER_IDLE_SECONDS}s -> exiting (scale-to-zero)")
                return
            continue

        _, job_id = item
        last_work_time = time.time()

        job_key = f"{JOB_KEY_PREFIX}{job_id}"

        try:
            # Mark as running so clients see progress
            update_job(job_id, "running", prompt="", image_url="", error="")

            
            diary_text = r.hget(job_key, "diary_text")
            if not diary_text:
                raise RuntimeError("diary_text missing in Redis job hash")

            # Step 1: LLM -> prompt
            prompt = build_illustration_prompt(diary_text)

            # Step 2: diffusion -> PNG bytes
            png_bytes = generate_png_bytes(prompt)

            # Step 3: upload -> public URL
            image_url = upload_png_bytes(png_bytes)

            # Mark job done and save outputs for the gateway to return
            update_job(job_id, "done", prompt=prompt, image_url=image_url, error="")
            print(f"[worker] done job_id={job_id}")

        except Exception as e:
            # On any error, mark job as failed and store message for debugging
            update_job(job_id, "error", error=str(e))
            print(f"[worker] error job_id={job_id}: {e}")

if __name__ == "__main__":
    main()
