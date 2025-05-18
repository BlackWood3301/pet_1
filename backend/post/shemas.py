from pydantic import BaseModel

class SPost(BaseModel):
    title:str
    short_description:str
    description:str
    time: int | None
    tags: list[str]

    user_id: int