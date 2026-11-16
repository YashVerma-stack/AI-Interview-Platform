from fastapi import APIRouter, HTTPException
from response_model.AsnwerResponse import AnswerResponse
from services.interview_service import create_session, get_session, save_answer
from request_model import AnswerRequest
from models.interview import InterviewStatusEnum
from starlette import status
from request_model.AnswerRequest import AnswerRequest


router = APIRouter(
    tags = ['Interview'],
    prefix='/interview'
)


@router.get('/start')
async def start_interview():
    questions = [
        "add two number",
        "what is python",
        "what is fastapi"
    ]
    
    session = create_session()
    session.questions = questions
    
    return {
        "introText": "Hello aspirant welcome to ai interview platform",
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
    
@router.get('/report/{session_id}')
async def report(session_id: str):
    # check valid session_id
    session = get_session(session_id)
    if not session or session.status == InterviewStatusEnum.COMPLETED:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Interview Session not found")   
    
    return {
        "result": "Your Interview Report"
    }
