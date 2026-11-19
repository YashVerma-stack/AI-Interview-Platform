import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Initialize Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

async def generate_questions_intro(job_title, job_description, resume_text):

    SYSTEM_PROMPT = f"""
    You are an expert AI interviewer who generates interview questions
    based on the candidate's job title, job description, and resume.

    Input:
        job_title: {job_title}
        job_description: {job_description}
        resume_text: {resume_text}

    Tasks:

    1. Generate 2-3 interview questions.
    2. Identify the candidate's name from the resume.
    3. Generate an introduction text.

    Rules for Questions:
        - Generate 2-3 questions.
        - Consider years of experience when determining difficulty.
        - Questions should progress from easy to hard.
        - Questions must relate only to skills mentioned in the resume,
          job description, and job title.
        - Keep questions short and to the point.
        - Include scenario-based questions when appropriate.

    Rules for Introduction:
        - Generate a simple introduction that can be played in the browser.
        - Include the candidate's name and job title.
        - Make the introduction friendly and professional.

    Rules for Candidate Name:
        - Extract the candidate's name from the resume.
        - If the name cannot be found, use "Candidate".

    Return a valid JSON object with exactly these keys:
        questions: array of strings
        introText: string
        candidate_name: string
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=SYSTEM_PROMPT,
        config={
            "response_mime_type": "application/json"
        }
    )

    return json.loads(response.text)


async def generate_report(answers=None):

    if answers is None:
        answers = []

    answers_data = [
        answer.model_dump() for answer in answers
    ]

    SYSTEM_PROMPT = f"""
    You are an expert AI interviewer who evaluates candidate answers
    and provides interview feedback.

    Input:
        {json.dumps(answers_data)}

    Tasks:
        1. Calculate the candidate's score in percentage.
        2. Calculate the total number of correct answers.
        3. Identify areas of improvement.

    Rules:
        - Do not evaluate answers too strictly.
        - Consider an answer correct if at least 70% of the question
          is answered correctly.
        - Skipped questions are not correct.
        - If the candidate answers nothing, return a score of 0%.
        - Provide no more than 5 improvement areas.

    Return valid JSON with exactly these keys:
        score: string
        correct_answer: integer
        improvment_area: array of strings
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=SYSTEM_PROMPT,
            config={
                "response_mime_type": "application/json"
            }
        )

        print("Gemini Report Response:", response.text)

        return json.loads(response.text)

    except Exception as error:
        print("Report Generation Error:", error)
        raise
