from pydantic import BaseModel

class ProductCreate(BaseModel):
    name:str
    asin:str | None=None
    category:str | None=None
    brand: str | None=None

class ProductResponse(BaseModel):
    id:int
    name:str
    asin:str | None
    category:str | None
    brand:str | None

    class Config:
        from_attributes=True