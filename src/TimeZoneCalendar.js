import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Calendar from './Calendar'
import { accessor } from './utils/accessors'
import momentLocalizer from './localizers/moment'
import * as moment from 'moment'
var momentTimeZone = require('moment-timezone')
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

Calendar.tz = Intl.DateTimeFormat().resolvedOptions().timeZone
const m = (...args) => momentTimeZone.tz(...args, Calendar.tz)
m.localeData = moment.localeData
const localizer = momentLocalizer(m)

export const convertDateTimeToDate = (datetime, timeZoneName) => {
  const m = momentTimeZone.tz(datetime, timeZoneName)
  return new Date(m.year(), m.month(), m.date(), m.hour(), m.minute(), 0)
}

export const convertDateToDateTime = (date, timeZone) => {
  const dateLocal = zonedTimeToUtc(date, timeZone)
  const dateUtc = utcToZonedTime(dateLocal, 'UTC')
  return dateUtc
}

class TimeZoneCalendar extends Component {
  static propTypes = {
    events: PropTypes.array,
    onSelectSlot: PropTypes.func,
    onEventDrop: PropTypes.func,
    timeZoneName: PropTypes.string,
    startAccessor: PropTypes.func,
    endAccessor: PropTypes.func,
  }

  static defaultProps = {
    startAccessor: 'start',
    endAccessor: 'end',
  }

  startAccessor = event => {
    const start = accessor(event, this.props.startAccessor)
    return convertDateTimeToDate(start, this.props.timeZoneName)
  }

  endAccessor = event => {
    const end = accessor(event, this.props.endAccessor)
    return convertDateTimeToDate(end, this.props.timeZoneName)
  }

  render() {
    const { onSelectSlot, onRangeChange, timeZoneName, ...props } = this.props
    const CalendarProps = {
      ...props,
      localizer,
      startAccessor: this.startAccessor,
      endAccessor: this.endAccessor,
      onSelectSlot:
        onSelectSlot &&
        (({ start, end, slots, action }) => {
          onSelectSlot({
            start: convertDateToDateTime(start, timeZoneName),
            end: convertDateToDateTime(end, timeZoneName),
            slots: slots.map(date => convertDateToDateTime(date, timeZoneName)),
            action,
          })
        }),
      onRangeChange:
        onRangeChange &&
        (range => {
          const isArray = Array.isArray(range)
          onRangeChange({
            start: convertDateToDateTime(
              isArray ? range[0] : range.start,
              timeZoneName
            ),
            end: convertDateToDateTime(
              isArray ? range[range.length - 1] : range.end,
              timeZoneName
            ),
          })
        }),
    }
    return <Calendar {...CalendarProps} />
  }
}
export default TimeZoneCalendar
