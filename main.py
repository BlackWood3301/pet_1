from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.user.router import app as user_router
from backend.post.router import app as post_router
from backend.comments.router import app as comment_router

app = FastAPI(title="Twitter Clone API")

# Настройка CORS для разрешения запросов с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",],  # React приложение запускается на порту 3000
    allow_credentials=True,  # Важно для работы с куки
    allow_methods=["*"],     # Разрешаем все HTTP методы
    allow_headers=["*"],     # Разрешаем все HTTP заголовки
)

app.include_router(user_router)
app.include_router(post_router)
app.include_router(comment_router)