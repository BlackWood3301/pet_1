from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, ARRAY, String
from backend.database import Base
from typing import Optional, List

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    short_description: Mapped[str]
    description: Mapped[str]
    time: Mapped[int | None]
    tags: Mapped[List[str]] = mapped_column(ARRAY(String))

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    
