from pydantic import BaseModel
from pydantic import EmailStr


class SubscribeRequest(BaseModel):

    email: EmailStr


class SubscribeResponse(BaseModel):

    success: bool

    message: str