from datetime import datetime, timezone


def initials(name: str) -> str:
    parts = name.replace("Dr.", "").strip().split()
    letters = "".join(p[0] for p in parts[:2])
    return letters.upper()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
