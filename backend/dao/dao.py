from sqlalchemy import select,insert,update,delete
from backend.database import session

class BaseDao:
    model = None

    @classmethod
    async def find_date(cls, **filter):
        async with session.begin() as sess:
            query = select(cls.model).filter_by(**filter)
            result = await sess.execute(query)
            return result.scalars().all()
        
    @classmethod
    async def find_one_or_none(cls, **filter):
        async with session.begin() as sess:
            query = select(cls.model).filter_by(**filter)
            result = await sess.execute(query)
            return result.scalars().one_or_none()
        
    @classmethod
    async def add_date(cls, **value):
        async with session.begin() as sess:
            query = insert(cls.model).values(**value)
            result = await sess.execute(query)
            return 1
        
    @classmethod
    async def delete_date(cls, id: int):
        async with session.begin() as sess:
            query = delete(cls.model).where(cls.model.id == id)
            result = await sess.execute(query)
            return 1