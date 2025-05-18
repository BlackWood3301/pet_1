from passlib.context import CryptContext
from fastapi import Request, HTTPException
from backend.user.dao import UserDao

context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return context.hash(password)

def verify_password(plain_password, real_password) -> bool:
    return context.verify(plain_password, real_password)

async def get_current_user(req: Request):
    cook = req.cookies.get("id_user")
    if not cook:
        raise HTTPException(status_code=401, detail="Пользователь не авторизован")
    user = await UserDao.find_one_or_none(id=int(cook))
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user