from models.interview import Answer, InterviewSession, InterviewStatusEnum
import uuid
from store.session_store import SESSION_STORE


def create_session() -> InterviewSession:
    session_id = str(uuid.uuid4())
    
    interview_session = InterviewSession(
        session_id = session_id,
        questions=[]
    ) 
    
    SESSION_STORE[session_id] = interview_session
    return interview_session

def get_session(session_id: int) -> InterviewSession:
    session = SESSION_STORE.get(session_id)
    
    if not session:
        return None
    return session

def save_answer(answer: str | None, skip: bool, session: InterviewSession):
    question = session.questions[session.current_index]
    
    session.answer.append(
        Answer(
            question = question,
            answer = None if skip else answer,
            skip = skip 
        )
    )
    
    session.current_index += 1
    
    if session.current_index == len(session.questions):
        session.status = InterviewStatusEnum.COMPLETED
        
        
        
        
        