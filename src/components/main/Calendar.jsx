import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { DateTime, Settings } from 'luxon';
import cx from 'classnames';

import CalendarTable from './CalendarTable.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../../styles/Calendar.css';

function Calendar({
  ariaNextBtn = 'Next',
  ariaPrevBtn = 'Previous',
  customDateClick = () => {},
  fixed,
  fontSize,
  height,
  lang = 'en-US',
  max = { day: 31, month: 12, year: 2100 },
  min = { day: 1, month: 1, year: 1900 },
  start,
  width,
}) {
  Settings.defaultLocale = lang;

  let maxDt;
  if (fixed) maxDt = DateTime.now().endOf(fixed).startOf('day');
  else if (max === 'now') maxDt = DateTime.now().startOf('day');
  else maxDt = DateTime.fromObject(max);

  let minDt;
  if (fixed) minDt = DateTime.now().startOf(fixed).startOf('day');
  else if (min === 'now') minDt = DateTime.now().startOf('day');
  else minDt = DateTime.fromObject(min);

  const nowDt = DateTime.now().startOf('day');

  let startDt;
  if (start) startDt = DateTime.fromObject(start);
  else if (nowDt >= minDt && nowDt <= maxDt) startDt = DateTime.now().startOf('day');
  else startDt = DateTime.fromObject(min);

  const calendarRef = useRef();
  const [selectedDt, setSelectedDt] = useState(startDt);
  const [showMonths, setShowMonths] = useState(false);

  const renderMonths = () => {
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
              'bg--alt':
                el.toMillis() === nowDt.startOf('month').toMillis() &&
                el > minDt.startOf('month') &&
                el < maxDt,
            })}
            onClick={() => {
              setSelectedDt(el);
              setShowMonths(false);
            }}
            disabled={el > maxDt || el < minDt.startOf('month')}
          >
            {el.monthLong}
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (fontSize) calendarRef.current.style.fontSize = fontSize;
    if (height) calendarRef.current.style.height = height;
    if (width) calendarRef.current.style.width = width;
  }, []);

  return (
    <div className='calendar' ref={calendarRef}>
      <div className='calendar__header'>
        <div>
          <button
            type='button'
            className='calendar__header__arrow-button'
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
        <div className='calendar__header__main-button-container'>
          <button
            type='button'
            className='calendar__header__main-button'
            onClick={() => setShowMonths(!showMonths)}
            disabled={
              showMonths ||
              (minDt.hasSame(maxDt, 'month') && minDt.hasSame(maxDt, 'year'))
            }
          >
            {!showMonths && selectedDt.monthLong} {selectedDt.year}
          </button>
        </div>
        <div>
          <button
            type='button'
            className='calendar__header__arrow-button'
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
      {showMonths ? (
        renderMonths()
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
  absolute: PropTypes.bool,
  ariaPrevBtn: PropTypes.string,
  ariaNextBtn: PropTypes.string,
  customDateClick: PropTypes.func,
  fixed: PropTypes.string,
  fontSize: PropTypes.string,
  height: PropTypes.string,
  lang: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  max: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  start: PropTypes.object,
  width: PropTypes.string,
};

export default Calendar;
