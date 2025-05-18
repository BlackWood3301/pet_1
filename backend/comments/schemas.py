from pydantic import BaseModel

class SComment(BaseModel):
    description: str
    post_id: int