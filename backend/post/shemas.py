from pydantic import BaseModel
from typing import Optional, List

class SPost(BaseModel):
    title: str
    short_description: str
    description: str
    time: Optional[int] = None
    tags: List[str]
    

