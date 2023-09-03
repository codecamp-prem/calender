import { FormEvent, Fragment, useId, useMemo, useRef, useState } from "react"
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, eachDayOfInterval, isSameMonth, isBefore, isToday, endOfDay, subMonths, addMonths, isSameDay, parse } from "date-fns"
import { formatDate } from "../utils/formatDate"
import { cc } from "../utils/cc"
import { EVENT_COLOR, useEvents } from "../context/useEvent"
import { Modal, ModalProps } from "./Modal"
import { UnionOmit } from "../utils/types"
import { Event } from "../context/Events"

export function Calender(){
    const [selectedMonth, setSelectedMonth] = useState(new Date())

    const calendarDays = useMemo(() => {
        const firstWeekStart = startOfWeek(startOfMonth(selectedMonth))
        const lastWeekEnd = endOfWeek(endOfMonth(selectedMonth)) 
        return eachDayOfInterval({ start: firstWeekStart, end: lastWeekEnd })
    }, [selectedMonth])

    const { events } = useEvents()

    return (
        <>
        <div className="calendar">
            <div className="header">
            <button className="btn" onClick={() => setSelectedMonth(new Date())}>Today</button>
            <div>
                <button 
                    className="month-change-btn" 
                    onClick={() => {
                    setSelectedMonth(m => subMonths(m, 1))
                    }}
                >&lt;</button>
                <button 
                    className="month-change-btn" 
                    onClick={() => {
                    setSelectedMonth(m => addMonths(m, 1))
                    }}
                >&gt;</button>
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
                        events={events.filter(event => isSameDay(day, event.date))}
                    />
                    
                ))}
            </div>
        </div>
        </>
    )
}

type CalenderDayProps = {
    day: Date,
    showWeekName: boolean,
    selectedMonth: Date,
    events: Event[]
}
function CalenderDay({ day, showWeekName, selectedMonth, events } : CalenderDayProps){
    const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
    const { addEvent } = useEvents()

    const sortedEvents = useMemo(() => {
        const timeToNumber = (time: string) => parseFloat(time.replace(":","."))

        return [...events].sort((a,b) => {
            if (a.allDay && b.allDay) {
                return 0
            }else if (a.allDay) {
                return -1
            }else if (b.allDay) {
                return 1
            }else {
                return timeToNumber(a.startTime) - timeToNumber(b.startTime)
            }
        })
    },[events])

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
                <div 
                    className={cc("day-number", isToday(day) && "today")}
                >{formatDate(day, { day: "numeric" })}</div>
                <button 
                    className="add-event-btn" onClick={() => setIsNewEventModalOpen(true)}
                >+</button>
            </div>
            {sortedEvents.length > 0 && (
                <div className="events">
                    {sortedEvents.map(event => (
                        <CalenderEvent key={event.id} event={event} />
                    ))}
                </div>
            )}
            <EventFormModal 
                date={day}
                isOpen={isNewEventModalOpen}
                onClose={() => setIsNewEventModalOpen(false)}
                onSubmit={addEvent} 
            />
        </div>
        </>
    )
}

function CalenderEvent({ event} : { event: Event }){
    const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false)
    const { updateEvent, deleteEvent } = useEvents()

    return (
        <>
            <button 
                className={cc("event", event.color, event.allDay && "all-day-event")}
                onClick={() => setIsEditEventModalOpen(true)}
            >
                {
                    event.allDay ? (
                        <div className="event-name">{event.name}</div>
                    ) : (
                        <>
                        <div className={`color-dot ${event.color}`}></div>
                        <div className="event-time">
                            {
                                formatDate(
                                    parse(event.startTime, "HH:mm", event.date),
                                    {
                                        timeStyle: "short",
                                    }
                                )
                            }
                        </div>
                        <div className="event-name">{event.name}</div>
                        </>
                    )
                }
            </button>
            <EventFormModal 
                event={event}
                isOpen={isEditEventModalOpen}
                onClose={() => setIsEditEventModalOpen(false)}
                onSubmit={e => updateEvent(event.id, e)} 
                onDelete={() => deleteEvent(event.id)}
            />
        </>
    )
}

type EventFormModalProps = {
    onSubmit: (event: UnionOmit<Event, "id">) => void, 
} & (
    | {   onDelete: () => void, 
        event: Event, 
        date?: never, 
    } 
    | {   
        onDelete?: never, 
        event?: never, 
        date: Date, 
    }
) & Omit<ModalProps, "children">

function EventFormModal({ onSubmit, onDelete, event, date, ...modalProps } : EventFormModalProps){
    const isNew = event == null
    const formId = useId()
    const [selectedColor, setSelectedColor] = useState(event?.color || EVENT_COLOR[0])
    const [isAllDayChecked, setIsAllDayChecked] = useState(event?.allDay || false)
    const [startTime, setStartTime] = useState(event?.startTime || "")
    const nameRef = useRef<HTMLInputElement>(null)
    const endTimeRef = useRef<HTMLInputElement>(null)

    function handleSubmit(e: FormEvent){
        e.preventDefault()
    
        const name = nameRef.current?.value 
        const endTime = endTimeRef.current?.value 

        if(name == null || name.trim() === "") return
        
        const commonProps = {
            name,
            date: date || event?.date,
            color: selectedColor
        }

        let newEvent: UnionOmit<Event, "id">
        if(isAllDayChecked) {
            newEvent = {
                ...commonProps,
                allDay: true,
            }
        }else{
            if(
                startTime == null || startTime.trim() === "" ||
                endTime == null || endTime.trim() === ""
            ){ return }

            newEvent = {
                ...commonProps,
                allDay: false,
                startTime,
                endTime,
            }
        }

        modalProps.onClose()
        onSubmit(newEvent)
    }

    return(
        <>
        <Modal {...modalProps}>
        <div className="modal-title">
            <div>{ isNew ? "Add": "Edit"} Event</div>
            <small>{formatDate(date || event.date, { dateStyle: "short" })}</small>
            <button className="close-btn" onClick={modalProps.onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor={`${formId}-name`}>Name</label>
              <input 
                type="text" 
                id={`${formId}-name`} 
                ref={nameRef}
                defaultValue={event?.name}
                required
                />
            </div>
            <div className="form-group checkbox">
              <input 
                type="checkbox" 
                id={`${formId}-all-day`} 
                checked={isAllDayChecked}
                onChange={(e) => setIsAllDayChecked(e.target.checked)}
                />
              <label htmlFor={`${formId}-all-day`}>All Day?</label>
            </div>
            <div className="row">
              <div className="form-group">
                <label htmlFor={`${formId}-start-time`}>Start Time</label>
                <input 
                    type="time"  
                    id={`${formId}-start-time`} 
                    required={!isAllDayChecked}
                    disabled={isAllDayChecked}
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor={`${formId}-end-time`}>End Time</label>
                <input 
                    type="time" 
                    id={`${formId}-end-time`} 
                    required={!isAllDayChecked}
                    disabled={isAllDayChecked}
                    min={startTime}
                    ref={endTimeRef}
                    defaultValue={event?.endTime}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className="row left">
                {EVENT_COLOR.map(color => (
                    <Fragment key={color}>
                        <input
                        type="radio"
                        name="color"
                        value={color}
                        id={`${formId}-${color}`}
                        checked={selectedColor === color}
                        onChange={() => setSelectedColor(color)}
                        className="color-radio"
                        />
                        <label htmlFor={`${formId}-${color}`}><span className="sr-only">{color}</span></label>
                    </Fragment>
                ))}
                
              </div>
            </div>
            <div className="row">
                <button  className="btn btn-success" type="submit">
                    {isNew ? "Add":"Edit"}
                </button>
                {
                    onDelete 
                    && 
                    <button onClick={onDelete} className="btn btn-delete" type="button">Delete</button>
                }
            </div>
        </form>
        </Modal>
        </>
    )
}
