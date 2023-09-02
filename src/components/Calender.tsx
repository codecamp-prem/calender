import { useMemo, useState } from "react"
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, eachDayOfInterval, isSameMonth, isBefore, isToday, endOfDay, subMonths, addMonths } from "date-fns"
import { formatDate } from "../utils/formatDate"
import { cc } from "../utils/cc"

export function Calender(){
    const [selectedMonth, setSelectedMonth] = useState(new Date())

    const calendarDays = useMemo(() => {
        const firstWeekStart = startOfWeek(startOfMonth(selectedMonth))
        const lastWeekEnd = endOfWeek(endOfMonth(selectedMonth)) 
        return eachDayOfInterval({ start: firstWeekStart, end: lastWeekEnd })
    }, [selectedMonth])

    return (
        <>
        <div className="calendar">
        <div className="header">
          <button className="btn" onClick={() => setSelectedMonth(new Date())}>Today</button>
          <div>
            <button className="month-change-btn" onClick={() => {
                setSelectedMonth(m => subMonths(m, 1))
                }}>&lt;</button>
            <button className="month-change-btn" onClick={() => {
                setSelectedMonth(m => addMonths(m, 1))
            }}>&gt;</button>
          </div>
          <span className="month-title">{formatDate(selectedMonth, {month:"long", year: "numeric"})}</span>
        </div>
        <div className="days">
            {calendarDays.map((day, index) => (
                <CalenderDay 
                    key={day.getTime()} 
                    day={day} 
                    showWeekName={index < 7} 
                    selectedMonth={selectedMonth} 
                />
                
            ))}
          {/* <div className="day">
            <div className="day-header">
              <div className="day-number">19</div>
              <button className="add-event-btn">+</button>
            </div>
            <div className="events">
              <button className="all-day-event blue event">
                <div className="event-name">Short</div>
              </button>
              <button className="all-day-event blue event">
                <div className="event-name">
                  Long Event Name That Just Keeps Going
                </div>
              </button>
              <button className="event">
                <div className="color-dot blue"></div>
                <div className="event-time">7am</div>
                <div className="event-name">Event Name</div>
              </button>
            </div>
          </div> */}
          {/* <div className="day non-month-day">
            <div className="day-header">
              <div className="day-number">1</div>
              <button className="add-event-btn">+</button>
            </div>
          </div> */}
        </div>
      </div>

      {/* <div className="modal">
        <div className="overlay"></div>
        <div className="modal-body">
          <div className="modal-title">
            6/8/23
            <button className="close-btn">&times;</button>
          </div>
          <div className="events">
            <button className="all-day-event green event">
              <div className="event-name">Short</div>
            </button>
            <button className="event">
              <div className="color-dot blue"></div>
              <div className="event-time">7am</div>
              <div className="event-name">Event Name</div>
            </button>
            <button className="event">
              <div className="color-dot green"></div>
              <div className="event-time">8am</div>
              <div className="event-name">Event Name</div>
            </button>
            <button className="event">
              <div className="color-dot blue"></div>
              <div className="event-time">9am</div>
              <div className="event-name">Event Name</div>
            </button>
            <button className="event">
              <div className="color-dot blue"></div>
              <div className="event-time">10am</div>
              <div className="event-name">Event Name</div>
            </button>
          </div>
        </div>
      </div>

      <div className="modal"></div> */}
        </>
    )
}

type CalenderDayProps = {
    day: Date,
    showWeekName: boolean,
    selectedMonth: Date
}
function CalenderDay({ day, showWeekName, selectedMonth } : CalenderDayProps){
    return (
        <>
        <div 
            className={
                cc(
                    "day", 
                    !isSameMonth(day, selectedMonth) && "non-month-day", 
                    isBefore(endOfDay(day), new Date()) && "old-month-day"
                )
        }>
            <div className="day-header">
                {
                    showWeekName && 
                    <div className="week-name">{formatDate(day, { weekday: "short" })}</div>
                }
                <div className={cc("day-number", isToday(day) && "today")}>{formatDate(day, { day: "numeric" })}</div>
                <button className="add-event-btn">+</button>
            </div>
            {/* <div className="events">
                <button className="all-day-event blue event">
                    <div className="event-name">Short</div>
                </button>
                <button className="all-day-event green event">
                    <div className="event-name">
                    Long Event Name That Just Keeps Going
                    </div>
                </button>
                <button className="event">
                    <div className="color-dot blue"></div>
                    <div className="event-time">7am</div>
                    <div className="event-name">Event Name</div>
                </button>
            </div> */}
        </div>
        </>
    )
}