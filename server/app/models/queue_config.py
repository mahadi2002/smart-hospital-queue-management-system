from pydantic import BaseModel


class QueueConfig(BaseModel):
    max_daily_tokens_per_doctor: int = 40
    emergency_cap_per_doctor_per_day: int = 8
    walk_in_slots_per_doctor_per_day: int = 5
    no_show_timeout_minutes: int = 15
    grace_period_minutes: int = 5
    booking_window_hours: int = 24
