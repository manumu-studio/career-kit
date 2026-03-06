"""Create analysis_history table.

Revision ID: 001
Revises:
Create Date: 2026-03-06

"""

from collections.abc import Sequence
from typing import Optional, Union

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON, UUID

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Optional[Union[str, Sequence[str]]] = None  # noqa: UP007,UP045
branch_labels: Optional[Union[str, Sequence[str]]] = None  # noqa: UP007,UP045
depends_on: Optional[Union[str, Sequence[str]]] = None  # noqa: UP007,UP045


def upgrade() -> None:
    """Create analysis_history table with all columns and indexes."""
    op.create_table(
        "analysis_history",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", sa.String(255), nullable=False),
        sa.Column("analysis_type", sa.String(50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("company_url_hash", sa.String(64), nullable=True),
        sa.Column("jd_hash", sa.String(64), nullable=True),
        sa.Column("company_name", sa.String(255), nullable=True),
        sa.Column("job_title", sa.String(255), nullable=True),
        sa.Column("job_description_preview", sa.String(500), nullable=True),
        sa.Column("cv_filename", sa.String(255), nullable=True),
        sa.Column("company_research_json", JSON, nullable=True),
        sa.Column("optimization_result_json", JSON, nullable=True),
        sa.Column("llm_model", sa.String(100), nullable=False),
        sa.Column("total_cost_usd", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("cache_hit", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "source_analysis_id",
            UUID(as_uuid=True),
            sa.ForeignKey("analysis_history.id"),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_analysis_history_user_id",
        "analysis_history",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        "ix_analysis_history_expires_at",
        "analysis_history",
        ["expires_at"],
        unique=False,
    )
    op.create_index(
        "ix_analysis_history_company_url_hash",
        "analysis_history",
        ["company_url_hash"],
        unique=False,
    )
    op.create_index(
        "ix_analysis_history_jd_hash",
        "analysis_history",
        ["jd_hash"],
        unique=False,
    )
    op.create_index(
        "ix_analysis_history_user_company",
        "analysis_history",
        ["user_id", "company_url_hash"],
        unique=False,
    )
    op.create_index(
        "ix_analysis_history_user_jd",
        "analysis_history",
        ["user_id", "jd_hash"],
        unique=False,
    )


def downgrade() -> None:
    """Drop analysis_history table."""
    op.drop_index("ix_analysis_history_user_jd", table_name="analysis_history")
    op.drop_index("ix_analysis_history_user_company", table_name="analysis_history")
    op.drop_index("ix_analysis_history_jd_hash", table_name="analysis_history")
    op.drop_index("ix_analysis_history_company_url_hash", table_name="analysis_history")
    op.drop_index("ix_analysis_history_expires_at", table_name="analysis_history")
    op.drop_index("ix_analysis_history_user_id", table_name="analysis_history")
    op.drop_table("analysis_history")
