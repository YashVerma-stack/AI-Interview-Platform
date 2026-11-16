from fastapi import FastAPI
from routers import interview

app = FastAPI(title= "AI Interview Service")

app.include_router(interview.router)



