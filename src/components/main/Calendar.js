// General notes

// Date Object data is very accurate, so startOf() and endOf() methods are very important
// especially for date comparisons.

// Date Object declarations should always be made from Luxon methods to avoid shallow copying.

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DateTime, Settings } from 'luxon';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import CalendarTable from './CalendarTable';
import './Calendar.css';

function Calendar({
  ariaNextBtn = 'Next',
  ariaPrevBtn = 'Previous',
  customDateClick = () => {},
  fixed,
  lang = 'en-US',
  max = { day: 31, month: 12, year: 2100 },
  min = { day: 1, month: 1, year: 1900 },
  monthsOnly,
  start,
  style,
}) {
  Settings.defaultLocale = lang;

  // Defines maximum, minimum and current date objects based on Props.

  let maxDt, minDt;
  if (typeof fixed === 'string') {
    maxDt = DateTime.now().endOf(fixed).startOf('day');
    minDt = DateTime.now().startOf(fixed);
  } else if (typeof fixed === 'object') {
    maxDt = DateTime.fromObject(fixed)
      .endOf(Object.keys(fixed).includes('month') ? 'month' : 'year')
      .startOf('day');
    minDt = DateTime.fromObject(fixed);
  } else {
    maxDt = max === 'now' ? DateTime.now().startOf('day') : DateTime.fromObject(max);
    minDt = min === 'now' ? DateTime.now().startOf('day') : DateTime.fromObject(min);
  }

  const nowDt = DateTime.now().startOf('day');

  // Defines start date object based on previous declarations and 'start' Prop.

  let startDt;
  if (start) startDt = DateTime.fromObject(start);
  else if (nowDt >= minDt && nowDt <= maxDt) startDt = DateTime.now().startOf('day');
  else if (typeof fixed === 'object') startDt = DateTime.fromObject(fixed);
  else startDt = DateTime.fromObject(min);

  // React Hooks

  const [selectedDt, setSelectedDt] = useState(startDt);
  const [showMonths, setShowMonths] = useState(monthsOnly);

  // Function declarations.

  const renderCalendarHeader = () => (
    <div className='calendar__header'>
      <div>
        <button
          type='button'
          className='calendar__arrow-button'
          aria-label={ariaPrevBtn}
          onClick={() => {
            setSelectedDt(selectedDt.minus(!showMonths ? { month: 1 } : { year: 1 }));
          }}
          disabled={
            (showMonths && selectedDt.hasSame(minDt, 'year')) ||
            (selectedDt.hasSame(minDt, 'month') && selectedDt.hasSame(minDt, 'year'))
          }
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      </div>
      <div className='calendar__main-button-container'>
        <button
          type='button'
          className='calendar__main-button'
          onClick={() => setShowMonths(!showMonths)}
          disabled={
            showMonths || (minDt.hasSame(maxDt, 'month') && minDt.hasSame(maxDt, 'year'))
          }
        >
          {!showMonths && selectedDt.monthLong} {selectedDt.year}
        </button>
      </div>
      <div>
        <button
          type='button'
          className='calendar__arrow-button'
          aria-label={ariaNextBtn}
          onClick={() => {
            setSelectedDt(selectedDt.plus(!showMonths ? { month: 1 } : { year: 1 }));
          }}
          disabled={
            (showMonths && selectedDt.hasSame(maxDt, 'year')) ||
            (selectedDt.hasSame(maxDt, 'month') && selectedDt.hasSame(maxDt, 'year'))
          }
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );

  const renderMonthButtons = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(selectedDt.startOf('year').plus({ month: i }));
    }

    return (
      <div className='calendar__month-buttons-container'>
        {months.map((el) => (
          <button
            type='button'
            key={el.monthLong}
            className={cx('calendar__month-button', {
              'calendar__month-button--alt-bg':
                el.toMillis() === nowDt.startOf('month').toMillis() &&
                el > minDt.startOf('month') &&
                el < maxDt,
            })}
            onClick={() => {
              if (monthsOnly) {
                customDateClick(el);
              } else {
                setSelectedDt(el);
                setShowMonths(false);
              }
            }}
            disabled={el > maxDt || el < minDt.startOf('month')}
          >
            {el.monthLong}
          </button>
        ))}
      </div>
    );
  };

  // Main element render.

  return (
    <div className='calendar' style={style}>
      {renderCalendarHeader()}
      {showMonths ? (
        renderMonthButtons()
      ) : (
        <CalendarTable
          customDateClick={customDateClick}
          maxDt={maxDt}
          minDt={minDt}
          selectedDt={selectedDt}
        />
      )}
    </div>
  );
}

Calendar.propTypes = {
  ariaPrevBtn: PropTypes.string,
  ariaNextBtn: PropTypes.string,
  customDateClick: PropTypes.func,
  fixed: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  lang: PropTypes.string,
  max: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  min: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  monthsOnly: PropTypes.bool,
  start: PropTypes.object,
  style: PropTypes.object,
};

export default Calendar;
