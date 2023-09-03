import { ReactNode, createContext, useState } from "react";
import { UnionOmit } from "../utils/types";
import { EVENT_COLOR } from "./useEvent";


export type Event = {
    id: string,
    name: string,
    color: (typeof EVENT_COLOR)[number]
    date: Date
} & (
   | { allDay: false; startTime: string; endTime: string} 
   | { allDay: true; startTime?: never; endTime?: never}
)

type EventsContext = {
    events: Event[]
    addEvent: (event: UnionOmit<Event, "id">) => void
    deleteEvent: (id: string) => void
    updateEvent: (id: string, event: UnionOmit<Event, "id">) => void
}
export const Context = createContext<EventsContext | null>(null)

type EventsProviderProps = {
    children: ReactNode
}
export function EventsProvider({ children } : EventsProviderProps){
    const [events, setEvents] = useState<Event[]>([])

    function addEvent(eventDetails: UnionOmit<Event, "id">){
        setEvents(e => [...e, { ...eventDetails, id: crypto.randomUUID() }])
    }

    function updateEvent(id: string, eventDetails: UnionOmit<Event, "id">){
        setEvents(e => {
            return e.map(event => {
                return event.id === id ? { id, ...eventDetails } : event
            })
        })
    }

    function deleteEvent(id: string){
        setEvents(e => e.filter(event => event.id !== id))
    }

    return <Context.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>{children}</Context.Provider>
}