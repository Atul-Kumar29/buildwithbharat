from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
	from app.models.listing import Listing
	from app.models.product import Product


class ProductSpecification(Base):
	__tablename__ = "product_specifications"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
	specification_name: Mapped[str] = mapped_column(String(100))
	specification_value: Mapped[str] = mapped_column(Text)
	created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
	updated_at: Mapped[datetime] = mapped_column(
		DateTime,
		default=datetime.utcnow,
		onupdate=datetime.utcnow
	)

	product: Mapped["Product"] = relationship(back_populates="specifications")


class ListingSpecification(Base):
	__tablename__ = "listing_specifications"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), index=True)
	specification_name: Mapped[str] = mapped_column(String(100))
	specification_value: Mapped[str] = mapped_column(Text)
	created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
	updated_at: Mapped[datetime] = mapped_column(
		DateTime,
		default=datetime.utcnow,
		onupdate=datetime.utcnow
	)

	listing: Mapped["Listing"] = relationship(back_populates="specifications")
