import asyncio
from services.ai_service import generate_questions_intro

async def main():
    result = await generate_questions_intro(
        job_title="Python Developer",
        job_description="Experience with Python, FastAPI and REST APIs",
        resume_text="Name: Yash Verma. Skills: Python, FastAPI, SQL."
    )

    print(result)

asyncio.run(main())
