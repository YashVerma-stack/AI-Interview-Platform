from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional

class InterviewStatusEnum(str, Enum):
    IN_PROGRESSS = "in_progress"
    COMPLETED = "completed"

class Answer(BaseModel):
    question: str
    answer: Optional[str]
    skip: bool = False
    
class InterviewSession(BaseModel):
    session_id: str
    questions: List[str]
    status: InterviewStatusEnum = InterviewStatusEnum.IN_PROGRESSS
    answer: List[Answer] = Field(default_factory=list)
    current_index: int = 0
    introText: str = ""