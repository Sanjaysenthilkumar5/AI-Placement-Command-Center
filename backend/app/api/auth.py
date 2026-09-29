from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token, oauth2_scheme
from app.models.models import User, Student
from app.schemas.schemas import Token, UserLogin, UserRegister, UserOut, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account inactive")

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email
    )

@router.post("/register", response_model=Token)
def register(reg_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == reg_data.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=reg_data.email.lower().strip(),
        hashed_password=get_password_hash(reg_data.password),
        full_name=reg_data.full_name,
        role=reg_data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if reg_data.role == "student":
        roll = reg_data.roll_number or f"2026{reg_data.department or 'CSE'}{user.id:03d}"
        student = Student(
            user_id=user.id,
            roll_number=roll,
            department=reg_data.department or "CSE",
            batch_year=reg_data.batch_year or 2026,
            cgpa=reg_data.cgpa or 7.5,
            placement_readiness_score=70.0
        )
        db.add(student)
        db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=Token)
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.full_name is not None and data.full_name.strip():
        current_user.full_name = data.full_name.strip()
    if data.email is not None and data.email.strip():
        new_email = data.email.lower().strip()
        existing = db.query(User).filter(User.email == new_email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use by another user")
        current_user.email = new_email
    if data.password is not None and len(data.password) >= 6:
        current_user.hashed_password = get_password_hash(data.password)

    db.commit()
    db.refresh(current_user)

    token = create_access_token(subject=current_user.id, role=current_user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        role=current_user.role,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email
    )

@router.post("/demo-login/{role}", response_model=Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    role_email_map = {
        "admin": "admin@placement.edu",
        "student": "rahul.sharma@student.edu",
        "recruiter": "recruiter@technova.com"
    }
    email = role_email_map.get(role.lower(), "admin@placement.edu")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = db.query(User).filter(User.role == role.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Demo user for role {role} not found")

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email
    )
