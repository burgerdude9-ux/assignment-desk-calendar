import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog } from '@headlessui/react';

export default function Home() {
  const [view, setView] = useState('dayGridMonth');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: '10:30a • WiFi–Campus–1006',
      start: '2025-10-07T10:30:00',
      extendedProps: {
        slug: 'WiFi–Campus–1006',
        storyType: 'VO_SOT',
        description: 'Students report poor speeds; IT response pending.',
        location: 'Blanton Hall 2F',
        status: 'AVAILABLE',
      },
    },
    {
      id: '2',
      title: '• Homecoming–Prep–1007',
      start: '2025-10-08',
      extendedProps: {
        slug: 'Homecoming–Prep–1007',
        storyType: 'PACKAGE',
        description: 'Preparation for homecoming event.',
        location: 'Campus Green',
        status: 'CLAIMED',
      },
    },
  ]);

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

  useEffect(() => {
    const saved = localStorage.getItem('events');
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const handleEventDrop = (info) => {
    const newStart = info.event.startStr;
    setEvents(events.map(e => e.id === info.event.id ? {...e, start: newStart} : e));
  };

  const handleDelete = () => {
    setEvents(events.filter(e => e.id !== selectedEvent.id));
    setIsOpen(false);
  };

  const handleClaim = () => {
    const producer = window.prompt('Enter producer name:');
    if (producer) {
      setEvents(events.map(e => e.id === selectedEvent.id ? {...e, extendedProps: {...e.extendedProps, status: 'CLAIMED', producer}} : e));
      setIsOpen(false);
    }
  };

  const handleNewEvent = () => {
    const start = form.startTime ? `${form.date}T${form.startTime}` : form.date;
    const title = form.startTime ? `${form.startTime} • ${form.slug}` : `• ${form.slug}`;
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
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Assignment Desk Calendar</h1>
        <div className="mt-2 flex items-center">
          <button
            onClick={() => setView('dayGridMonth')}
            className={`mr-2 px-4 py-2 rounded ${view === 'dayGridMonth' ? 'bg-blue-800' : 'bg-blue-500'}`}
          >
            Month
          </button>
          <button
            onClick={() => setView('timeGridWeek')}
            className={`mr-4 px-4 py-2 rounded ${view === 'timeGridWeek' ? 'bg-blue-800' : 'bg-blue-500'}`}
          >
            Week
          </button>
          <button
            onClick={() => setIsNewOpen(true)}
            className="bg-green-600 px-4 py-2 rounded"
          >
            New Event
          </button>
        </div>
      </header>
      <div className="flex-1 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          events={events}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
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
                {selectedEvent.startStr.includes('T') && <p><strong>Start Time:</strong> {selectedEvent.startStr.split('T')[1].substring(0,5)}</p>}
                {selectedEvent.endStr && <p><strong>End Time:</strong> {selectedEvent.endStr.split('T')[1].substring(0,5)}</p>}
                <p><strong>Type:</strong> {selectedEvent.extendedProps.storyType}</p>
                <p><strong>Description:</strong> {selectedEvent.extendedProps.description}</p>
                <p><strong>Location:</strong> {selectedEvent.extendedProps.location}</p>
                {selectedEvent.extendedProps.producer && selectedEvent.extendedProps.status === 'CLAIMED' ? (
                  <p><strong>Producer:</strong> {selectedEvent.extendedProps.producer}</p>
                ) : (
                  <p><strong>Unclaimed</strong></p>
                )}
                <div className="mt-4">
                  {selectedEvent.extendedProps.status === 'AVAILABLE' && (
                    <button onClick={handleClaim} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Claim</button>
                  )}
                  <button className="bg-gray-600 text-white px-4 py-2 rounded mr-2">Edit</button>
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

      <Dialog open={isNewOpen} onClose={() => setIsNewOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 max-w-md w-full">
            <Dialog.Title className="text-lg font-bold mb-4">New Event</Dialog.Title>
            <form onSubmit={(e) => { e.preventDefault(); handleNewEvent(); }}>
              <input type="text" placeholder="Slug" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="w-full p-2 border mb-2" required />
              <input type="date" placeholder="Date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full p-2 border mb-2" required />
              <input type="time" placeholder="Start Time" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} className="w-full p-2 border mb-2" />
              <input type="time" placeholder="End Time" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} className="w-full p-2 border mb-2" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full p-2 border mb-2" maxLength="500"></textarea>
              <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full p-2 border mb-2" />
              <input type="text" placeholder="Story Type" value={form.storyType} onChange={(e) => setForm({...form, storyType: e.target.value})} className="w-full p-2 border mb-2" />
              <input type="text" placeholder="Producer" value={form.producer} onChange={(e) => setForm({...form, producer: e.target.value})} className="w-full p-2 border mb-2" />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
            </form>
            <button
              onClick={() => setIsNewOpen(false)}
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