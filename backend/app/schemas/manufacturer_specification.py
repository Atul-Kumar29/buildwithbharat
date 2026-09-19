from pydantic import BaseModel, ConfigDict


class ManufacturerSpecificationCreate(BaseModel):
    specification_name: str
    specification_value: str


class ManufacturerSpecificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    specification_name: str
    specification_value: str