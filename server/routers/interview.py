from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from response_model.AsnwerResponse import AnswerResponse
from services.ai_service import generate_questions_intro, generate_report
from services.interview_service import create_session, get_session, save_answer
from request_model import AnswerRequest
from models.interview import InterviewStatusEnum
from starlette import status
from request_model.AnswerRequest import AnswerRequest
from util.file_util import extract_text, validate_file


router = APIRouter(
    tags = ['Interview'],
    prefix='/interview'
)

@router.post('/generate-question')
async def generate_questions(
    job_title: str = Form(...),
    job_description: str = Form(...),
    resume: UploadFile = File(...)
):
    # validate resume file
    await validate_file(resume)
    
    # extract text from resume
    resume_text = await extract_text(resume)
    
    # Generate question and intro text using titlee, description, resume
    resp = await generate_questions_intro(job_title=job_title, job_description=job_description, resume_text=resume_text)
    session = create_session()
    session.questions = resp.get("questions")
    session.introText = resp.get("introText")
  
    
    return{"session_id": session.session_id}

@router.get('/start/{session_id}')
async def start_interview(session_id: str):
    # check valid session_id
    session = get_session(session_id)
    if not session or session.status == InterviewStatusEnum.COMPLETED:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Interview Session not found")
        
    return {
        "introText": session.introText,
        "session_id": session.session_id,
        "firstQuestion": session.questions[0]
    }

@router.post('/submit', response_model=AnswerResponse)
async def submit_answer(answerReq: AnswerRequest):
    # check valid session_id
    session = get_session(answerReq.session_id)
    if not session or session.status == InterviewStatusEnum.COMPLETED:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Interview Session not found")
    
    # save answer in interview session
    save_answer(answerReq.answer, answerReq.skip, session)
    
    #return
    if session.status == InterviewStatusEnum.COMPLETED:
        return {
            "interviewEnded": True
        }
        
    return {
        "interviewEnded": False,
        "nextQuestion": session.questions[session.current_index]
    }
   
@router.put('/end/{session_id}')    
async def end_interview(session_id: str):
    # check valid session_id
    session = get_session(session_id)
    if not session or session.status == InterviewStatusEnum.COMPLETED:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Interview Session not found")   
    
    session.status = InterviewStatusEnum.COMPLETED
    
    return {
        "interviewEnded": True
    }
    
@router.get("/report/{session_id}")
async def report(session_id: str):
    # Check valid session_id
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview Session Not Found")
    
    resp = await generate_report(session.answer)

    return { "result":  resp }