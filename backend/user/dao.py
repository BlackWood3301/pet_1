from backend.dao.dao import BaseDao
from backend.user.model import User

class UserDao(BaseDao):
    model = User