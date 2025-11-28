from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from models.member import Member
from config import settings

# In-memory storage for demo purposes
members_db = {}

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = settings.SECRET_KEY if hasattr(settings, 'SECRET_KEY') else "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security scheme
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_by_email(email: str):
    """Get user from in-memory database"""
    return members_db.get(email)

async def create_user(name: str, email: str, password: str, role: str = "member"):
    """Create user in in-memory database"""
    members_db[email] = {
        'name': name,
        'email': email,
        'password': password,
        'role': role
    }
    return members_db[email]

async def get_member_by_email(email: str):
    """Alias for get_user_by_email"""
    user = await get_user_by_email(email)
    if user:
        return Member(**user)
    return None

async def save_member(member: Member):
    """Save member to in-memory database"""
    members_db[member.email] = {
        'name': member.name,
        'email': member.email,
        'password': member.password
    }

async def authenticate_member(email: str, password: str):
    member = await get_member_by_email(email)
    if not member or not verify_password(password, member.password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password",
        )
    return member

async def signup_member(email: str, password: str, name: str):
    if await get_member_by_email(email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )
    hashed_password = get_password_hash(password)
    new_member = Member(email=email, password=hashed_password, name=name)
    await save_member(new_member)
    return new_member

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_member(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current member from JWT token"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    member = await get_member_by_email(email)
    if member is None:
        raise HTTPException(status_code=401, detail="User not found")
    return member