import type { BookingListItemResponse } from '~/types/api'

// Момент начала слота брони: местные дата и время в часовом поясе тура → UTC
export function bookingStart(booking: BookingListItemResponse) {
  const asUtc = new Date(`${booking.slot.date}T${booking.slot.time}Z`)
  return new Date(asUtc.getTime() - timezoneOffsetMs(booking.slot.timezone, asUtc))
}

function timezoneOffsetMs(timeZone: string, at: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(at)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value)
  const local = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'))
  return local - at.getTime()
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

// Смещение часового пояса в момент `at`: «UTC+1», «UTC+0»
export function formatUtcOffset(timeZone: string, at = new Date()) {
  const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(at)
    .find(part => part.type === 'timeZoneName')?.value
    .replace('GMT', 'UTC') ?? timeZone
  return offset === 'UTC' ? 'UTC+0' : offset
}

// «27 сентября, 10:00 (Лиссабон, UTC+1)» — время местное для тура
export function formatBookingSlot(booking: BookingListItemResponse) {
  const date = dateFormatter.format(new Date(`${booking.slot.date}T00:00`))
  const offset = formatUtcOffset(booking.slot.timezone, bookingStart(booking))
  return `${date}, ${booking.slot.time.slice(0, 5)} (${booking.tour.city}, ${offset})`
}
