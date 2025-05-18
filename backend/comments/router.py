from fastapi import APIRouter,Depends, HTTPException
from backend.user.auth import *
from backend.comments.dao import CommentDAo
from backend.comments.schemas import SComment
from backend.post.dao import PostDao

app = APIRouter(prefix="/comment",tags=["КОММЕНТАРИИ"])

@app.get("/get_comment_post/{id}")
async def comment_for_post(id:int):
    comment = await CommentDAo.find_with_user_info(post_id=id)
    return comment

@app.post("/create_comment")
async def create_comment(comment: SComment, user = Depends(get_current_user)):
    post = await PostDao.find_one_or_none(id=comment.post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Пост не найден")
    
    comment_data = comment.model_dump()
    comment_data["user_id"] = user.id
    await CommentDAo.add_date(**comment_data)
    return "Комментарий успешно создан"