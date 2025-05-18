from backend.database import Base
from sqlalchemy.orm import Mapped,mapped_column
from sqlalchemy import ForeignKey

class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id",ondelete="CASCADE"))
    description: Mapped[str]
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id",ondelete="CASCADE"))