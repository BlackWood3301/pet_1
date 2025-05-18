from fastapi import APIRouter, Depends, HTTPException, Query
from backend.post.dao import PostDao
from backend.user.auth import *
from backend.post.shemas import SPost
from typing import List
from sqlalchemy import or_

app = APIRouter(prefix="/posts", tags=["СОЗДАНИЕ И ЧТЕНИЕ ПОСТОВ"])

@app.get("/get_all_post")
async def get_all_post():
    all_post = await PostDao.find_with_user_info()
    return all_post

# @app.get("/get_post_{id}")
# async def get_all_post(id: int):
#     post = await PostDao.find_date(id=id)
#     return post

@app.get("/search")
async def search_posts(tag: str = Query(None), query: str = Query(None)):
    if tag and query:
        posts = await PostDao.search_posts(tag=tag, query=query)
        return posts
    elif tag:
        posts = await PostDao.find_date(tags=[tag])
        return posts
    elif query:
        posts = await PostDao.search_posts(query=query)
        return posts
    return await PostDao.find_date()

@app.post("/create_post")
async def create_post(post: SPost, user=Depends(get_current_user)):
    await PostDao.add_date(title=post.title,
                          short_description=post.short_description,
                          description=post.description,
                          time=post.time,
                          tags=post.tags,
                          user_id=int(user.id))
    return "Пост успешно добавлен"

@app.delete("/delete_post_account_{post_id}")
async def delete_post(post_id: int, user=Depends(get_current_user)):
    post = await PostDao.find_one_or_none(id=post_id, user_id=user.id)
    if not post:
        raise HTTPException(status_code=404, detail="Пост не найден")
    await PostDao.delete_date(id=post.id)
    return "Успешно удален пост"

@app.post("/get_post_user")
async def get_post_user(user=Depends(get_current_user)):
    posts = await PostDao.find_date(user_id=user.id)
    return posts
