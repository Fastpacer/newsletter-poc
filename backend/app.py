import secrets

from fastapi import FastAPI
from fastapi import Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from backend.database import Base
from backend.database import engine
from backend.database import get_db

from backend.models import Subscriber

from backend.schemas import (
    SubscribeRequest,
    SubscribeResponse
)

from backend.email_service import (
    send_verification_email
)

import os
from dotenv import load_dotenv

load_dotenv()


Base.metadata.create_all(
    bind=engine
)

app = FastAPI(
    title="Newsletter POC"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://localhost:8000",
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:3000",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)


@app.get("/")
def home():

    return {
        "message":
        "Newsletter Backend Running"
    }


@app.post(
    "/subscribe",
    response_model=SubscribeResponse
)
def subscribe(
    payload: SubscribeRequest,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(Subscriber)
        .filter(
            Subscriber.email == payload.email
        )
        .first()
    )

    if existing_user:

        return {
            "success": False,
            "message":
            "Email already registered."
        }

    token = secrets.token_urlsafe(
        32
    )

    subscriber = Subscriber(

        email=payload.email,

        verification_token=token,

        is_verified=False
    )

    db.add(subscriber)

    db.commit()

    verification_link = (
        f"{os.getenv('BASE_URL')}/verify/{token}"
    )

    email_sent = send_verification_email(
        payload.email,
        verification_link
    )

    if not email_sent:

        return {

            "success": False,

            "message":
            "Failed to send verification email."
        }

    return {

        "success": True,

        "message":
        "Verification email sent successfully."
    }


@app.get("/subscribers")
def get_subscribers(
    db: Session = Depends(get_db)
):

    subscribers = (
        db.query(Subscriber)
        .all()
    )

    return subscribers


@app.get(
    "/verify/{token}",
    response_class=HTMLResponse
)
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):

    subscriber = (

        db.query(Subscriber)

        .filter(
            Subscriber.verification_token
            == token
        )

        .first()
    )

    if not subscriber:

        return """
        <h1>
        Invalid Verification Link
        </h1>

        <p>
        This verification token does not exist.
        </p>
        """

    if subscriber.is_verified:

        return """
        <h1>
        Already Verified
        </h1>

        <p>
        This email address has already been verified.
        </p>
        """

    subscriber.is_verified = True

    db.commit()

    return """
    <h1>
    Success!
    </h1>

    <p>
    Your newsletter subscription has been verified.
    </p>
    """