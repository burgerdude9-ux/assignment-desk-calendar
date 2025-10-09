import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog } from '@headlessui/react';

export default function Home() {
  const [view, setView] = useState('dayGridMonth');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [isListOpen, setIsListOpen] = useState(false);

  // Reference to the FullCalendar instance so we can call its API to switch views
  const calendarRef = useRef(null);

  // When the `view` state changes (Month/Week buttons), instruct FullCalendar to change view
  useEffect(() => {
    if (calendarRef.current && typeof calendarRef.current.getApi === 'function') {
      try {
        calendarRef.current.getApi().changeView(view);
      } catch (e) {
        console.error('Failed to change calendar view:', e);
      }
    }
  }, [view]);

  const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  };

  const truncateTitle = (title, maxLength = 15) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const truncateDesc = (desc, maxLength = 120) => {
    if (!desc) return '';
    return desc.length > maxLength ? desc.substring(0, maxLength) + '...' : desc;
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsOpen(true);
  };

  const [form, setForm] = useState({ 
    slug: '', 
    storyType: '', 
    description: '', 
    location: '', 
    date: new Date().toISOString().split('T')[0], 
    startTime: '', 
    endTime: '', 
    producer: '' 
  });

  // Load events from API on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Close the list panel on Escape
  useEffect(() => {
    if (!isListOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsListOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isListOpen]);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events from API...');
      const response = await fetch('/api/events');
      console.log('API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded events:', data.length);
        setEvents(data);
      } else {
        console.error('Failed to fetch events:', response.status);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const saveEvents = async (newEvents) => {
    try {
      console.log('Saving events to API...', newEvents.length);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvents),
      });
      console.log('Save response status:', response.status);
      if (!response.ok) {
        console.error('Failed to save events');
      } else {
        console.log('Events saved successfully');
      }
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  useEffect(() => {
    if (events.length > 0) {
      saveEvents(events);
    }
  }, [events]);

  const handleEventDrop = (info) => {
    const newStart = info.event.startStr;
    setEvents(events.map(e => e.id === info.event.id ? {...e, start: newStart} : e));
  };

  const handleDelete = async () => {
    const eventId = selectedEvent.id;
    console.log('Deleting event:', eventId);
    
    // Remove from local state
    const updatedEvents = events.filter(e => e.id !== eventId);
    setEvents(updatedEvents);
    
    // Explicitly save to API
    try {
      console.log('Saving updated events after delete...');
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvents)
      });
      
      if (response.ok) {
        console.log('Event successfully deleted from storage');
      } else {
        console.error('Failed to delete event from storage');
        // Revert local state on error
        setEvents(events);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      // Revert local state on error
      setEvents(events);
    }
    
    setIsOpen(false);
  };

  const handleClaim = () => {
    const producer = window.prompt('Enter producer name:');
    if (producer) {
      setEvents(events.map(e => e.id === selectedEvent.id ? {...e, extendedProps: {...e.extendedProps, status: 'CLAIMED', producer}} : e));
      setIsOpen(false);
    }
  };

  const handleEdit = () => {
    setEditingEvent(selectedEvent);
    setIsEditing(true);
    // Populate form with event data
    const event = selectedEvent;
    const startTime = event.startStr.includes('T') ? event.startStr.split('T')[1].substring(0,5) : '';
    const endTime = event.endStr ? event.endStr.split('T')[1].substring(0,5) : '';
    setForm({
      slug: event.extendedProps.slug,
      storyType: event.extendedProps.storyType,
      description: event.extendedProps.description,
      location: event.extendedProps.location,
      date: event.startStr.split('T')[0],
      startTime,
      endTime,
      producer: event.extendedProps.producer || '',
    });
    setIsOpen(false);
    setIsNewOpen(true);
  };

  const handleNewEvent = () => {
    const start = form.startTime ? `${form.date}T${form.startTime}` : form.date;
    const title = form.slug || 'New Event';
    if (isEditing && editingEvent) {
      // Update existing event
      setEvents(events.map(e => e.id === editingEvent.id ? {
        ...e,
        title,
        start,
        end: form.endTime ? `${form.date}T${form.endTime}` : null,
        extendedProps: {
          ...e.extendedProps,
          slug: form.slug,
          storyType: form.storyType,
          description: form.description,
          location: form.location,
          producer: form.producer,
        },
      } : e));
      setIsEditing(false);
      setEditingEvent(null);
    } else {
      // Create new event
      const newEvent = {
        id: Date.now().toString(),
        title,
        start,
        end: form.endTime ? `${form.date}T${form.endTime}` : null,
        extendedProps: {
          slug: form.slug,
          storyType: form.storyType,
          description: form.description,
          location: form.location,
          producer: form.producer,
          status: 'AVAILABLE',
        },
      };
      setEvents([...events, newEvent]);
    }
    setForm({ 
      slug: '', 
      storyType: '', 
      description: '', 
      location: '', 
      date: new Date().toISOString().split('T')[0], 
      startTime: '', 
      endTime: '', 
      producer: '' 
    });
    setIsNewOpen(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-red-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Montclair News Lab Assignment Desk</h1>
          <img src="/logo/logo.png" alt="Montclair News Lab" className="h-10 w-10 object-contain ml-4" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setView('dayGridMonth')}
              className={`mr-2 px-4 py-2 rounded ${view === 'dayGridMonth' ? 'bg-red-800' : 'bg-red-500'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('timeGridWeek')}
              className={`mr-4 px-4 py-2 rounded ${view === 'timeGridWeek' ? 'bg-red-800' : 'bg-red-500'}`}
            >
              Week
            </button>
            <button
              onClick={() => setIsListOpen(true)}
              className={`mr-4 px-4 py-2 rounded ${isListOpen ? 'bg-red-800' : 'bg-red-500'}`}
            >
              List
            </button>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setIsNewOpen(true)}
              className="bg-green-600 px-4 py-2 rounded"
            >
              New Event
            </button>
          </div>
        </div>
      </header>
      {/* Left-side events list panel */}
      {isListOpen && (
        <div className="fixed inset-y-0 left-0 w-80 max-w-full z-50">
          <div className="h-full bg-white shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Events</h2>
                <p className="text-sm text-gray-500">{events.length} total</p>
              </div>
              <button aria-label="Close events list" onClick={() => setIsListOpen(false)} className="text-gray-600 hover:text-gray-900">✕</button>
            </div>
            <div className="p-2 overflow-auto">
              {events.length === 0 ? (
                <div className="p-4 text-gray-500">No events</div>
              ) : (
                // sort chronologically
                [...events].sort((a,b) => new Date(a.start) - new Date(b.start)).map(e => (
                  <div key={e.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer" onClick={() => {
                    // navigate calendar to date and open details
                    try {
                      if (calendarRef.current && calendarRef.current.getApi) {
                        calendarRef.current.getApi().gotoDate(e.start);
                      }
                    } catch (err) {
                      console.error('Failed to navigate to date', err);
                    }
                    // set a selectedEvent-like object that the dialog expects
                    setSelectedEvent({
                      id: e.id,
                      extendedProps: e.extendedProps || {},
                      startStr: e.start,
                      endStr: e.end || ''
                    });
                    setIsListOpen(false);
                    setIsOpen(true);
                  }}>
                    <div className="text-sm text-gray-600">{new Date(e.start).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: e.start.includes('T') ? 'short' : undefined })}</div>
                    <div className="font-medium text-gray-900">{e.title || e.extendedProps?.slug || 'Untitled'}</div>
                    {e.extendedProps?.location && <div className="text-sm text-gray-500">{e.extendedProps.location}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={'dayGridMonth'}
          events={events}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventContent={function(arg) {
            const title = arg.event.title;
            const status = arg.event.extendedProps.status;
            let color = 'gray'; // default
            if (status === 'AVAILABLE') color = 'green';
            else if (status === 'CLAIMED') color = 'blue';
            // add more colors for other statuses if needed

            const dot = `<span style="color: ${color};">●</span> `;
            const displayTitle = truncateTitle(title);

            if (arg.view.type === 'dayGridMonth') {
              // Check if event has time (not all-day)
              const hasTime = arg.event.start && arg.event.start.toTimeString() !== '00:00:00 GMT+0000 (Coordinated Universal Time)';
              if (!hasTime) {
                // all-day
                return { html: `${dot}• <strong>${displayTitle}</strong>` };
              } else {
                // timed
                const timeStr = arg.event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');
                return { html: `${dot}<span style="font-weight: normal;">${timeStr}</span> • <strong>${displayTitle}</strong>` };
              }
            } else {
              // week view: show more details inside the event box
              const timeStr = arg.event.start ? arg.event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '') + ' • ' : '';
              const fullTitle = title;
              const storyType = arg.event.extendedProps.storyType || '';
              const location = arg.event.extendedProps.location || '';
              const producer = arg.event.extendedProps.producer ? `Producer: ${arg.event.extendedProps.producer}` : '';
              const statusText = arg.event.extendedProps.status ? `${arg.event.extendedProps.status}` : '';
              const desc = truncateDesc(arg.event.extendedProps.description, 140);

              // Week view layout: line1 = time + slug (white)
              // line2 = location (light gray), line3 = truncated description (lighter gray)
              const descShort = truncateDesc(arg.event.extendedProps.description, 120);

              const line1 = `<div style="color:#fff;font-weight:700;line-height:1.1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${timeStr}<span>${fullTitle}</span></div>`;
              const line2 = location ? `<div style="font-size:0.82rem;color:#d1d5db;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;margin-top:3px;">${location}</div>` : '';
              // include full description in data-full for post-render fitting
              const line3 = descShort ? `<div class="fd-desc" data-full="${(arg.event.extendedProps.description || '').replace(/"/g, '&quot;')}"><span>${descShort}</span></div>` : '';

              const container = `${line1}${line2}${line3}`;
              return { html: container };
            }
          }}
          eventDidMount={(info) => {
            // After the event is rendered, try to fit the description into the available space
            try {
              const descEl = info.el.querySelector('.fd-desc');
              if (!descEl) return;

              const inner = descEl.querySelector('span');
              const full = descEl.dataset.full || '';
              if (!full) return;

              // Set full text first
              inner.textContent = full;

              // If it fits, nothing to do
              if (descEl.scrollHeight <= descEl.clientHeight) return;

              // Binary search for maximum characters that fit
              let lo = 0, hi = full.length, best = '';
              while (lo <= hi) {
                const mid = Math.floor((lo + hi) / 2);
                inner.textContent = full.slice(0, mid) + '...';
                if (descEl.scrollHeight <= descEl.clientHeight) {
                  best = inner.textContent;
                  lo = mid + 1;
                } else {
                  hi = mid - 1;
                }
              }
              inner.textContent = best || full.slice(0, 20) + '...';
            } catch (e) {
              // non-fatal
              console.error('eventDidMount fit error', e);
            }
          }}
          editable={true}
          height="100%"
        />
      </div>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 max-w-md w-full">
            <Dialog.Title className="text-lg font-bold mb-4">Event Details</Dialog.Title>
            {selectedEvent && (
              <div>
                <p><strong>Slug:</strong> {selectedEvent.extendedProps.slug}</p>
                <p><strong>Date:</strong> {selectedEvent.startStr.split('T')[0]}</p>
                {selectedEvent.startStr.includes('T') && <p><strong>Start Time:</strong> {formatTime12Hour(selectedEvent.startStr.split('T')[1].substring(0,5))}</p>}
                {selectedEvent.endStr && <p><strong>End Time:</strong> {formatTime12Hour(selectedEvent.endStr.split('T')[1].substring(0,5))}</p>}
                <p><strong>Type:</strong> {selectedEvent.extendedProps.storyType}</p>
                <p><strong>Description:</strong> {selectedEvent.extendedProps.description}</p>
                <p><strong>Location:</strong> {selectedEvent.extendedProps.location}</p>
                {selectedEvent.extendedProps.producer && selectedEvent.extendedProps.status === 'CLAIMED' ? (
                  <p><strong>Producer:</strong> {selectedEvent.extendedProps.producer}</p>
                ) : (
                  <p><strong>Unclaimed</strong></p>
                )}
                <div className="mt-4 flex gap-2">
                  {selectedEvent.extendedProps.status === 'AVAILABLE' && (
                    <button onClick={handleClaim} className="bg-blue-600 text-white px-4 py-2 rounded">Claim</button>
                  )}
                  <button onClick={handleEdit} className="bg-orange-600 text-white px-4 py-2 rounded">Edit</button>
                  <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog open={isNewOpen} onClose={() => { setIsNewOpen(false); setIsEditing(false); setEditingEvent(null); }} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 max-w-md w-full">
            <Dialog.Title className="text-lg font-bold mb-4">{isEditing ? 'Edit Event' : 'New Event'}</Dialog.Title>
            <form onSubmit={(e) => { e.preventDefault(); handleNewEvent(); }}>
              <input type="text" placeholder="Slug" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="w-full p-2 border mb-2" required />
              <input type="date" placeholder="Date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full p-2 border mb-2" required />
              <input type="time" placeholder="Start Time" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} className="w-full p-2 border mb-2" />
              <input type="time" placeholder="End Time" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} className="w-full p-2 border mb-2" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full p-2 border mb-2" maxLength="500"></textarea>
              <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full p-2 border mb-2" />
              <input type="text" placeholder="Story Type" value={form.storyType} onChange={(e) => setForm({...form, storyType: e.target.value})} className="w-full p-2 border mb-2" />
              <input type="text" placeholder="Producer" value={form.producer} onChange={(e) => setForm({...form, producer: e.target.value})} className="w-full p-2 border mb-2" />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">{isEditing ? 'Update' : 'Create'}</button>
            </form>
            <button
              onClick={() => { setIsNewOpen(false); setIsEditing(false); setEditingEvent(null); }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}