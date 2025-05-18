from backend.dao.dao import BaseDao
from backend.post.model import Post
from backend.database import session
from sqlalchemy import select, or_
from backend.user.model import User

class PostDao(BaseDao):
    model = Post
    
    @classmethod
    async def search_posts(cls, query=None, tag=None):
        async with session.begin() as sess:
            stmt = select(cls.model)
            if query:
                stmt = stmt.where(
                    or_(
                        cls.model.title.ilike(f"%{query}%"),
                        cls.model.short_description.ilike(f"%{query}%"),
                        cls.model.description.ilike(f"%{query}%")
                    )
                )
            
            if tag:
                # Поиск по тегу (используя массив PostgreSQL)
                stmt = stmt.where(cls.model.tags.any(tag))
                
            result = await sess.execute(stmt)
            return result.scalars().all()

    @classmethod
    async def find_with_user_info(cls, **filter_by):
        async with session.begin() as sess:
            # Создаем запрос к базе данных
            query = select(cls.model, User.name.label("user_name"), User.email.label("user_email"))\
                    .join(User, cls.model.user_id == User.id)
                    
            # Добавляем фильтры
            if filter_by:
                query = query.filter_by(**filter_by)
                
            result = await sess.execute(query)
            
            posts_with_user = []
            for row in result:
                post = row[0]
                post_dict = {c.name: getattr(post, c.name) for c in post.__table__.columns}
                post_dict["user_name"] = row[1] 
                post_dict["user_email"] = row[2]  
                posts_with_user.append(post_dict)
                
            return posts_with_user

    @classmethod
    async def find_one_with_user_info(cls, **filter_by):
        async with session.begin() as sess:
            query = select(cls.model, User.name.label("user_name"), User.email.label("user_email"))\
                    .join(User, cls.model.user_id == User.id)\
                    .filter_by(**filter_by)
                    
            result = await sess.execute(query)
            row = result.first()
            
            if not row:
                return None
                
            post = row[0]
            post_dict = {c.name: getattr(post, c.name) for c in post.__table__.columns}
            post_dict["user_name"] = row[1]
            post_dict["user_email"] = row[2]
            
            return post_dict
