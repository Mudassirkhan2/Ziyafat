from datetime import datetime
from beanie import Document


class PasswordResetToken(Document):
    user_id: str
    token_hash: str
    expires_at: datetime
    used: bool = False

    class Settings:
        name = "password_reset_tokens"
