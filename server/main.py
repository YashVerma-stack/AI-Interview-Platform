from fastapi import FastAPI
from routers import interview
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title= "AI Interview Service")

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(interview.router)



