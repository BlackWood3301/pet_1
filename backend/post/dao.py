from backend.dao.dao import BaseDao
from backend.post.model import Post
from backend.database import session
from sqlalchemy import select, or_, desc
from backend.user.model import User
import base64

class PostDao(BaseDao):
    model = Post
    
    @classmethod
    async def search_posts(cls, query=None, tag=None):
        async with session.begin() as sess:
            # Создаем базовый запрос с JOIN к таблице пользователей
            stmt = select(cls.model, User.name.label("user_name"), User.email.label("user_email"))\
                   .join(User, cls.model.user_id == User.id)
            
            # Применяем фильтры, если они предоставлены
            if query:
                # Поиск по заголовку, краткому описанию и полному описанию
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
                
            # Сортировка по id в обратном порядке (новые посты сверху)
            stmt = stmt.order_by(desc(cls.model.id))
                
            result = await sess.execute(stmt)
            
            # Обрабатываем результат и добавляем информацию о пользователе
            posts_with_user = []
            for row in result:
                post = row[0]
                post_dict = {c.name: getattr(post, c.name) for c in post.__table__.columns}
                
                # Добавляем имя пользователя и email
                post_dict["user_name"] = row[1]
                post_dict["user_email"] = row[2]
                
                posts_with_user.append(post_dict)
                
            return posts_with_user

    @classmethod
    async def find_with_user_info(cls, **filter_by):
        async with session.begin() as sess:
            # Создаем запрос к базе данных
            query = select(cls.model, User.name.label("user_name"), User.email.label("user_email"))\
                    .join(User, cls.model.user_id == User.id)
                    
            # Добавляем фильтры явно к модели Post
            if filter_by:
                for key, value in filter_by.items():
                    if key == 'tags' and isinstance(value, list):
                        # Для поиска по тегам используем any
                        for tag in value:
                            query = query.where(cls.model.tags.any(tag))
                    else:
                        # Для остальных полей используем обычное сравнение
                        query = query.where(getattr(cls.model, key) == value)
            
            # Сортировка по id в обратном порядке (новые посты сверху)
            query = query.order_by(desc(cls.model.id))
            
            result = await sess.execute(query)
            
            posts_with_user = []
            for row in result:
                post = row[0]
                post_dict = {c.name: getattr(post, c.name) for c in post.__table__.columns}
                post_dict["user_name"] = row[1] 
                post_dict["user_email"] = row[2]  
                posts_with_user.append(post_dict)
                
            return posts_with_user

