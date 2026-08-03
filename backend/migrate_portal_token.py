"""
One-shot migration: backfill portal_token for existing Booking documents
that have portal_token: null or missing.

Run from the backend/ directory with the venv activated:
    python migrate_portal_token.py
"""
import asyncio
import secrets
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings


async def main() -> None:
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db]
    bookings = db["bookings"]

    # Find all docs where portal_token is null or the field doesn't exist
    query = {"$or": [{"portal_token": None}, {"portal_token": {"$exists": False}}]}
    cursor = bookings.find(query, {"_id": 1})
    docs = await cursor.to_list(length=None)

    if not docs:
        print("No documents need backfilling.")
    else:
        print(f"Backfilling {len(docs)} document(s)...")
        for doc in docs:
            token = secrets.token_urlsafe(32)
            await bookings.update_one(
                {"_id": doc["_id"]},
                {"$set": {"portal_token": token}},
            )
        print("Done.")

    # Drop the stale partial index if it somehow already exists with nulls
    # (Beanie will recreate it correctly on next startup)
    try:
        await bookings.drop_index("portal_token_1")
        print("Dropped stale portal_token_1 index (will be recreated on startup).")
    except Exception:
        print("portal_token_1 index not found or already clean — skipping drop.")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
