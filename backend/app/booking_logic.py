from datetime import time, datetime, timedelta, timezone, date

from fastapi import HTTPException
from sqlalchemy.orm import Session
from zoneinfo import ZoneInfo

from .models import Booking


# define start and end timing:
WORK_START = time(9, 0)
WORK_END = time(18, 0)
IST = ZoneInfo("Asia/Kolkata")

def validate_booking_time(start_time: time, end_time: time):
    # if end time is before start time or equal to sstart time:
    if end_time <= start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time."
        )

    # print("START: ", start_time)
    # print("END: ",end_time)

    # if start time is before *THE DEFINED WORK START TIME* or end time is after *THE DEFINED END TIME*
    if start_time < WORK_START or end_time > WORK_END:
        raise HTTPException(
            status_code=400,
            detail="Booking must be between 09:00 and 18:00."
        )


def check_booking_conflict(
    db: Session,
    room_id: int,
    booking_date: date,
    start_time: time,
    end_time: time
):
    # filter out all bookings that exists for provided room id on the given date:
    existing_bookings = (
        db.query(Booking)
        .filter(
            Booking.room_id == room_id,
            Booking.date == booking_date
        )
        .order_by(Booking.start_time)
        .all()
    )

    # EXAMPLE: 
    # existing booking: 10:00 - 12:00
    # new booking: 11:00 - 12:00
    for booking in existing_bookings:
        # Two bookings conflict only when their time ranges actually overlap.
        # Using < and > here deliberately allows back-to-back bookings. --> a booking for 10-11 and 11-12 can be made!!
        overlaps = (
            start_time < booking.end_time
            and end_time > booking.start_time
        )

        if overlaps:
            raise HTTPException(
                status_code=409,            # status code 409 -- conflicting condition
                detail=(
                    f"Room is already booked from "
                    f"{booking.start_time.strftime('%H:%M')} to "
                    f"{booking.end_time.strftime('%H:%M')} "
                    f"for '{booking.title}'."
                )
            )


def find_next_available_slot(
    bookings: list[Booking],
    booking_date: date,
    duration_minutes: int
):
    if duration_minutes <= 0:
        raise HTTPException(
            status_code=400,
            detail="Duration must be greater than 0 minutes."
        )

    required_duration = timedelta(minutes=duration_minutes)

    working_start = datetime.combine(
        booking_date,
        WORK_START
    )

    working_end = datetime.combine(
        booking_date,
        WORK_END
    )

    now = datetime.now(IST).replace(
        second=0,
        microsecond=0,
        tzinfo=None
    )

    # if booking date is today:
    if booking_date == now.date():
        current_time = max(
            working_start,
            now
        )
    else:
        current_time = working_start

    if current_time >= working_end:
        return None
    
    for booking in bookings:
        booking_start = datetime.combine(
            booking_date,
            booking.start_time
        )

        booking_end = datetime.combine(
            booking_date,
            booking.end_time
        )

        if booking_end <= current_time:
            continue

        # The first gap large enough for the requested duration is
        # automatically the earliest possible available slot.
        if booking_start - current_time >= required_duration:
            return {
                "start_time": current_time.time(),
                "end_time": (
                    current_time + required_duration
                ).time()
            }

        if booking_end > current_time:
            current_time = booking_end

    # After checking all existing bookings, there may still be
    # enough free time before the working day ends.
    if working_end - current_time >= required_duration:
        return {
            "start_time": current_time.time(),
            "end_time": (
                current_time + required_duration
            ).time()
        }

    return None


def validate_booking_not_in_past(
    booking_date: date,
    start_time: time
):
    now = datetime.now()

    booking_start = datetime.combine(
        booking_date,
        start_time
    )

    if booking_start < now:
        raise HTTPException(
            status_code=400,
            detail="Cannot create a booking for a past date or time."
        )