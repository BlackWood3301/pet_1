from pydantic import BaseModel,EmailStr

class SUser(BaseModel):
    name: str
    email: EmailStr
    password: str

class SUSerSignUp(BaseModel):
    email: EmailStr
    password:str