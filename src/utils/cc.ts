// cc short for concat class
// can be used as cc("day", isOldMonthday && "non-month-day") -> add className="day non-month-day" if isOldMonthday is true, return value "day non-month-day"
export function cc(...classes : unknown[]){
    return classes.filter(c => typeof c === "string").join(" ")
}