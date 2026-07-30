def serialize_doc(doc: dict) -> dict:
    """Turn a Mongo document into a plain JSON-friendly dict with a string id."""
    if doc is None:
        return None
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


def serialize_list(docs: list[dict]) -> list[dict]:
    return [serialize_doc(doc) for doc in docs]
