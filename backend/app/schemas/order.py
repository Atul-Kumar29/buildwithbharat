from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class OrderCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    product_id: int
    quantity: int
    status: Literal["placed", "shipped", "delivered"]
    created_at: datetime
    delivered_at: datetime | None


class VerificationCreate(BaseModel):
    matches_listing: bool
    notes: str | None = Field(default=None, max_length=2000)


class VerificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    user_id: int
    matches_listing: bool
    notes: str | None
    created_at: datetime