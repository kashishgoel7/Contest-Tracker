import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

// Import default react-big-calendar styling. We override this styling in index.css.
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 1. Configure the localizer for react-big-calendar using moment.js
const localizer = momentLocalizer(moment);

/**
 * CalendarView Component
 * Renders the contests list on a grid calendar view.
 * 
 * Note on React 19 Compatibility:
 * In React 19 / strict mode, the default uncontrolled state of react-big-calendar
 * freezes. Therefore, we manage the 'date' and 'view' states explicitly as a 
 * controlled component, and handle navigations manually.
 */
function CalendarView({ contests }) {
  // Initialize state for the calendar's active date and current view type (month, week, etc.)
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');

  // Callback to handle date navigation (Next, Prev, Today buttons)
  const handleNavigate = useCallback((newDate) => {
    setDate(newDate);
  }, []);

  // Callback to handle view changes (Month, Week, Day tabs)
  const handleView = useCallback((newView) => {
    setView(newView);
  }, []);
  
  // Transform our database contest documents into the schema that react-big-calendar expects
  const events = contests.map((contest) => {
    const startDate = new Date(contest.startTime);
    const endDate = new Date(startDate.getTime() + (contest.durationSeconds * 1000));

    return {
      id: contest._id || contest.externalId,
      title: contest.name,
      start: startDate,
      end: endDate,
      url: contest.url,
      allDay: contest.durationSeconds >= 86400
    };
  });

  /**
   * Click Handler for calendar events.
   * Triggered when a user clicks on an event box in the calendar.
   */
  const handleSelectEvent = (event) => {
    if (event.url && (event.url.startsWith('http://') || event.url.startsWith('https://'))) {
      window.open(event.url, '_blank', 'noopener,noreferrer');
    } else {
      alert('This contest does not have a registration URL available.');
    }
  };

  /**
   * Custom Event styling callback.
   */
  const eventStyleGetter = (event, start, end, isSelected) => {
    return {
      className: 'rbc-event' 
    };
  };

  return (
    <div className="w-full terminal-panel p-6 overflow-hidden">
      {/* 
        This is the main Calendar component.
        We explicitly pass the 'date' and 'view' props and their change handlers 
        to ensure state changes are dispatched correctly and prevent frozen buttons.
      */}
      <div style={{ height: '650px' }} className="w-full text-white">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          
          // State bindings for controlled execution (fixes frozen navigation buttons)
          date={date}
          onNavigate={handleNavigate}
          view={view}
          onView={handleView}
          
          popup={true} // Shows a "+X more" link if multiple events are on the same day
          style={{ height: '100%' }}
        />
      </div>
      
      {/* Visual Guideline legend under the calendar */}
      <div className="mt-4 flex flex-wrap gap-4 justify-between items-center text-xs text-gray-400 border-t border-gray-800 pt-4">
        <p>💡 Tip: Click on any contest event in the calendar to visit its registration page directly on Codeforces.</p>
        <div className="flex gap-3 items-center">
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <span className="w-3 h-3 rounded bg-[#161b22] border-l-4 border-l-brand-green border-y border-r border-[#30363d] block"></span>
            Codeforces Contest
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <span className="w-3 h-3 rounded bg-brand-dimGreen border border-brand-green/30 block"></span>
            Today's Date
          </span>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
