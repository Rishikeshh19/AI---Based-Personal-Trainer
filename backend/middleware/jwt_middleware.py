from fastapi import Request, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def jwt_middleware(request: Request, call_next):
    token = request.cookies.get("access_token") or request.headers.get("Authorization")
    
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            request.state.user = payload
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    else:
        request.state.user = None

    response = await call_next(request)
    return response