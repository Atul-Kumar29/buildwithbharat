from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
	from app.models.product import Product
	from app.models.source import Source
	from app.models.specification import ListingSpecification


class Listing(Base):
	__tablename__ = "listings"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
	source_id: Mapped[int | None] = mapped_column(ForeignKey("sources.id"), nullable=True, index=True)
	source: Mapped[str] = mapped_column(String(100))
	seller_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
	listing_url: Mapped[str | None] = mapped_column(Text, nullable=True)
	title: Mapped[str | None] = mapped_column(String(255), nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
	updated_at: Mapped[datetime] = mapped_column(
		DateTime,
		default=datetime.utcnow,
		onupdate=datetime.utcnow
	)

	product: Mapped["Product"] = relationship(back_populates="listings")
	source_record: Mapped["Source | None"] = relationship(back_populates="listings")
	specifications: Mapped[list["ListingSpecification"]] = relationship(
		back_populates="listing",
		cascade="all, delete-orphan"
	)
