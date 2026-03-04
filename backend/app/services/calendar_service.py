from datetime import datetime
from icalendar import Calendar, Event
import pytz

def generate_fortune_ics(date_str: str, message: str, element_type: str = "general") -> str:
    """
    Generates an iCalendar (.ics) string for a single all-day event containing fortune advice.
    """
    cal = Calendar()
    cal.add('prodid', '-//FateName Saju Calendar//ko//')
    cal.add('version', '2.0')

    event = Event()
    
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        dt = datetime.now()
        
    kst = pytz.timezone('Asia/Seoul')
    dt_kst = kst.localize(dt)
    
    # Prefix title based on energy type
    prefix = ""
    if element_type == "career":
        prefix = "💼 [직장/사업운] "
    elif element_type == "wealth":
        prefix = "💰 [재물운] "
    elif element_type == "love":
        prefix = "❤️ [애정운] "
    else:
        prefix = "✨ [오늘의 운세] "
        
    event.add('summary', f"{prefix}운명 스케줄링 조언")
    
    # Store the daily message in the event description
    event.add('description', message)
    
    # All-day event
    event.add('dtstart', dt_kst.date())
    event.add('dtstamp', datetime.now(kst))
    
    cal.add_component(event)
    
    return cal.to_ical().decode("utf-8")
