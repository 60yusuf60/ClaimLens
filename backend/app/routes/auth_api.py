import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from ..auth import verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(credentials: LoginRequest):
    correct_username = os.getenv("AGENT_USERNAME")
    correct_password_hash = os.getenv("AGENT_PASSWORD_HASH")

    if credentials.username != correct_username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not verify_password(credentials.password, correct_password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token = create_access_token(data={"sub": credentials.username})
    return {"access_token": access_token, "token_type": "bearer"}