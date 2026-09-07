from pymongo import MongoClient

from .config import settings

_client: MongoClient | None = None


def oid(value: str):
    """Convert a string to bson ObjectId when possible (else return as-is)."""
    from bson import ObjectId
    try:
        return ObjectId(value)
    except Exception:
        return value


def get_collection(name: str):
    """Return a pymongo collection from the shared client + configured db."""
    global _client
    if _client is None:
        _client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
    db = _client[settings.mongo_db_name]
    return db[name]


def get_doctor_context(doctor_id: str) -> dict:
    """Return a doctor's specialty + uploaded document titles.

    Combined, these define the doctor's knowledge domain, used to decide
    whether a question is within the doctor's scope.
    """
    doctor = get_collection("doctors").find_one({"_id": oid(doctor_id)})
    specialty = (doctor or {}).get("specialty") or "General Medicine"
    titles = [
        d.get("title")
        for d in get_collection("doctordocuments").find(
            {"doctor_id": oid(doctor_id)}, {"title": 1}
        )
        if d.get("title")
    ]
    return {"specialty": specialty, "documents": titles}


def get_database():
    global _client
    if _client is None:
        _client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
    return _client[settings.mongo_db_name]


def close_client():
    global _client
    if _client is not None:
        _client.close()
        _client = None