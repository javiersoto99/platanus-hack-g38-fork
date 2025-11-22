from enum import Enum


class ReminderInstanceStatus(str, Enum):
    PENDING = "pending"
    WAITING = "waiting"
    FAILURE = "failure"
    SUCCESS = "success"
    REJECTED = "rejected"
