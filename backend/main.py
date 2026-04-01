from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

messages = []

class Message(BaseModel):
    text: str

@app.get("/")
def root():
    return {"status": "ok", "time": datetime.now().isoformat()}

@app.get("/messages")
def get_messages():
    return messages

@app.post("/messages")
def post_message(msg: Message):
    entry = {"id": len(messages) + 1, "text": msg.text, "time": datetime.now().isoformat()}
    messages.append(entry)
    return entry
