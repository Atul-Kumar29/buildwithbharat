"""add reviews orders and feature verifications

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table("reviews", sa.Column("id", sa.Integer(), nullable=False), sa.Column("product_id", sa.Integer(), nullable=False), sa.Column("user_id", sa.Integer(), nullable=False), sa.Column("rating", sa.Integer(), nullable=False), sa.Column("body", sa.Text(), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False), sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"), sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("product_id", "user_id", name="uq_review_product_user"))
    op.create_index("ix_reviews_id", "reviews", ["id"])
    op.create_index("ix_reviews_product_id", "reviews", ["product_id"])
    op.create_index("ix_reviews_user_id", "reviews", ["user_id"])
    op.create_table("orders", sa.Column("id", sa.Integer(), nullable=False), sa.Column("user_id", sa.Integer(), nullable=False), sa.Column("product_id", sa.Integer(), nullable=False), sa.Column("quantity", sa.Integer(), nullable=False), sa.Column("status", sa.String(length=20), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False), sa.Column("delivered_at", sa.DateTime(), nullable=True), sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"), sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_orders_id", "orders", ["id"])
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_index("ix_orders_product_id", "orders", ["product_id"])
    op.create_table("feature_verifications", sa.Column("id", sa.Integer(), nullable=False), sa.Column("order_id", sa.Integer(), nullable=False), sa.Column("user_id", sa.Integer(), nullable=False), sa.Column("matches_listing", sa.Boolean(), nullable=False), sa.Column("notes", sa.Text(), nullable=True), sa.Column("created_at", sa.DateTime(), nullable=False), sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"), sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("order_id", name="uq_verification_order"))
    op.create_index("ix_feature_verifications_id", "feature_verifications", ["id"])
    op.create_index("ix_feature_verifications_order_id", "feature_verifications", ["order_id"])
    op.create_index("ix_feature_verifications_user_id", "feature_verifications", ["user_id"])


def downgrade() -> None:
    op.drop_table("feature_verifications")
    op.drop_table("orders")
    op.drop_table("reviews")