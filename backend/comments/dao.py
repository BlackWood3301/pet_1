from backend.dao.dao import BaseDao
from backend.comments.model import Comment
from sqlalchemy import select
from backend.user.model import User
from backend.database import session

class CommentDAo(BaseDao):
    model = Comment

    @classmethod
    async def find_with_user_info(cls, **filter_by):
        async with session.begin() as sess:
            # Создаем базовый запрос с присоединением таблицы пользователей
            query = select(cls.model, User.name.label("user_name"), User.email.label("user_email"))\
                   .join(User, cls.model.user_id == User.id)
            
            # Добавляем фильтры, если они переданы - применяем их к модели Comment, а не к объединенному запросу
            if filter_by:
                for key, value in filter_by.items():
                    query = query.where(getattr(cls.model, key) == value)
            
            result = await sess.execute(query)
            
            # Формируем результат с данными пользователя
            comments_with_user = []
            for row in result:
                comment = row[0]
                comment_dict = {c.name: getattr(comment, c.name) for c in comment.__table__.columns}
                comment_dict["user_name"] = row[1]
                comment_dict["user_email"] = row[2]
                comments_with_user.append(comment_dict)
            
            return comments_with_user
            
    @classmethod
    async def find_one_with_user_info(cls, **filter_by):
        async with session.begin() as sess:
            # Создаем запрос с присоединением таблицы пользователей
            query = select(cls.model, User.name.label("user_name"), User.email.label("user_email"))\
                   .join(User, cls.model.user_id == User.id)
            
            # Применяем фильтры к модели Comment напрямую
            if filter_by:
                for key, value in filter_by.items():
                    query = query.where(getattr(cls.model, key) == value)
            
            result = await sess.execute(query)
            row = result.first()
            
            if not row:
                return None
            
            comment = row[0]
            comment_dict = {c.name: getattr(comment, c.name) for c in comment.__table__.columns}
            comment_dict["user_name"] = row[1]
            comment_dict["user_email"] = row[2]
            
            return comment_dict