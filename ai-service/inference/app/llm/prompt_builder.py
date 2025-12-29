"""
llm/prompt_builder.py

Role:
- Convert diary_text into a concise image prompt.
- This will be replacted later
  - Today: OpenAI API
  - Later: SGLang LLM runtime (local/hosted)
"""

from openai import OpenAI
from ..core.config import OPENAI_API_KEY

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set")

client = OpenAI(api_key=OPENAI_API_KEY)

def build_illustration_prompt(diary_text: str) -> str:
    """
    Input:  diary_text (raw user journal entry)
    Output: a single-sentence prompt optimized for Stable Diffusion 3 -> Single Sentence is more stable for consistent style
    """

    template = f"""
You are an illustration prompt generator for a cartoon-style diary app.

Generate ONE concise sentence prompt for Stable Diffusion 3.

Style:
- modern cartoon illustration
- graphic novel style
- clean bold ink outlines
- cel-shaded coloring

Rules:
- human with normal proportions
- one clear scene
- no text, watermark, logo
- avoid photorealism, anime, chibi

Diary Entry:
\"\"\"{diary_text}\"\"\"
"""

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": template}],
    )

    return completion.choices[0].message.content.strip()
