"""add manufacturer specifications

Revision ID: f1b3d6ea7d2d
Revises: c76fa5c963f3
Create Date: 2026-09-19 20:58:03.107773

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1b3d6ea7d2d'
down_revision: Union[str, Sequence[str], None] = 'c76fa5c963f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "manufacturer_specifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("specification_name", sa.String(length=255), nullable=False),
        sa.Column("specification_value", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_manufacturer_specifications_id"),
        "manufacturer_specifications",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_manufacturer_specifications_product_id"),
        "manufacturer_specifications",
        ["product_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_manufacturer_specifications_product_id"),
        table_name="manufacturer_specifications",
    )

    op.drop_index(
        op.f("ix_manufacturer_specifications_id"),
        table_name="manufacturer_specifications",
    )

    op.drop_table("manufacturer_specifications")
