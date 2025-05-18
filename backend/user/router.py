from fastapi import APIRouter, HTTPException,Response,Depends
from backend.user.schemas import SUser,SUSerSignUp
from backend.user.dao import UserDao
from backend.user.auth import *

app = APIRouter(prefix="/user",tags=["ВХОД И РЕГИСТРАЦИЯ"])

@app.post("/login") #Регистрация 
async def login(user: SUser):
    user_ = await UserDao.find_one_or_none(email = user.email)
    if user_:
        raise HTTPException(status_code=404,detail="Пользователь уже зарегестрирован")
    password_ = hash_password(user.password)
    user.password = password_
    await UserDao.add_date(**user.model_dump())
    return "Успешная регистрация пользователя"

@app.post("/signup")
async def signup(user:SUSerSignUp,responce: Response):
    user_ = await UserDao.find_one_or_none(email = user.email)
    if not user_:
        raise HTTPException(status_code=404,detail="Пользователь не зарегестрирован")
    if not verify_password(user.password,user_.password):
        return "Неверный пароль"
    
    responce.set_cookie(key="id_user",
                        value=user_.id,
                        httponly=True,
                        max_age=3600)
    
    return "Вход успешно произошел"

@app.post("/get_me")
async def get_me(user = Depends(get_current_user)):
    return user

@app.delete("/log_out")
async def log_out(responce: Response):
    responce.delete_cookie(key="id_user")
    return "Выход прошел успешно"