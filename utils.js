export const ddmmyy = (date) => `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
export const nextWeekSameDay = (date) => new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);