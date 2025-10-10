'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';

export default function Home() {
  const [view, setView] = useState('dayGridMonth');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [engageEvents, setEngageEvents] = useState([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimProducer, setClaimProducer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingEngage, setIsLoadingEngage] = useState(false);
  const [listMode, setListMode] = useState('calendar'); // 'calendar' or 'engage'
  const [formErrors, setFormErrors] = useState({});
  const [unscheduledExpanded, setUnscheduledExpanded] = useState(true);
  const [scheduledExpanded, setScheduledExpanded] = useState(true);
  const [availableExpanded, setAvailableExpanded] = useState(true);
  const [claimedExpanded, setClaimedExpanded] = useState(true);

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

  const formatSlug = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const truncateTitle = (title, maxLength = 15) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const truncateDesc = (desc, maxLength = 120) => {
    if (!desc) return '';
    return desc.length > maxLength ? desc.substring(0, maxLength) + '...' : desc;
  };

  const isUnscheduledEvent = (event) => {
    return event.extendedProps?.type === 'unscheduled';
  };

  const isScheduledEvent = (event) => {
    return event.extendedProps?.type === 'scheduled';
  };

  const isAvailableEvent = (event) => {
    return isScheduledEvent(event) && event.extendedProps?.status === 'AVAILABLE';
  };

  const isClaimedEvent = (event) => {
    return isScheduledEvent(event) && event.extendedProps?.status !== 'AVAILABLE';
  };

  const eventContent = (arg) => {
    const title = formatSlug(arg.event.title);
    const status = arg.event.extendedProps.status || 'AVAILABLE';
    let color = 'green'; // default to green for available
    if (status === 'CLAIMED') color = 'blue';
    else if (status === 'IN_PROGRESS') color = 'orange';
    else if (status === 'APPROVED') color = 'purple';
    else if (status === 'COMPLETED') color = 'gray';

    const dot = `<span style="color: ${color};">●</span> `;
    const displayTitle = truncateTitle(title);

    if (arg.view.type === 'dayGridMonth') {
      // Check if event has time (not all-day)
      const hasTime = arg.event.start && arg.event.start.toTimeString() !== '00:00:00 GMT+0000 (Coordinated Universal Time)' && !arg.event.allDay;
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
      const timeStr = arg.event.allDay ? 'All Day • ' : (arg.event.start ? arg.event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '') + ' • ' : '');
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
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.slug.trim()) {
      errors.slug = 'Slug is required';
    }
    
    // Date is now optional - news packages can be created without specific dates
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEventClick = (info) => {
    // Extract only serializable properties to avoid circular references
    const eventData = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      allDay: info.event.allDay,
      extendedProps: info.event.extendedProps || {},
      startStr: info.event.startStr,
      endStr: info.event.endStr
    };
    setSelectedEvent(eventData);
    setIsOpen(true);
  };

  const [form, setForm] = useState({ 
    slug: '', 
    storyType: '', 
    description: '', 
    location: '', 
    date: '', // Leave empty for news packages
    startHour: '', 
    startMin: '', 
    startAmpm: '', 
    endHour: '', 
    endMin: '', 
    endAmpm: '', 
    producer: '',
    status: 'AVAILABLE' 
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
        
        // Migration: Add type field to existing events that don't have it
        const migratedEvents = data.map(event => ({
          ...event,
          extendedProps: {
            ...event.extendedProps,
            type: event.extendedProps?.type || (event.start ? 'scheduled' : 'unscheduled')
          }
        }));
        
        setEvents(migratedEvents);
        setErrorMessage('');
      } else {
        const errorText = `Failed to fetch events: ${response.status}`;
        console.error(errorText);
        setErrorMessage(errorText);
      }
    } catch (error) {
      const errorText = 'Error fetching events: ' + error.message;
      console.error(errorText);
      setErrorMessage(errorText);
    }
  };

  const saveEvents = async (newEvents) => {
    try {
      console.log('Saving events to API...', newEvents.length);
      
      // Deep clean events to remove any circular references or non-serializable data
      const cleanEvents = newEvents.map(event => {
        // Only include known serializable properties
        const cleanEvent = {
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: event.allDay,
          extendedProps: {}
        };
        
        // Clean extendedProps - only include plain data
        if (event.extendedProps) {
          cleanEvent.extendedProps = {
            slug: event.extendedProps.slug,
            storyType: event.extendedProps.storyType,
            description: event.extendedProps.description,
            location: event.extendedProps.location,
            producer: event.extendedProps.producer,
            status: event.extendedProps.status,
            type: event.extendedProps.type // NEW: Include type field
          };
        }
        
        return cleanEvent;
      });
      
      console.log('Clean events for saving:', cleanEvents);
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanEvents),
      });
      console.log('Save response status:', response.status);
      if (!response.ok) {
        const errorText = 'Failed to save events';
        console.error(errorText);
        setErrorMessage(errorText);
      } else {
        console.log('Events saved successfully');
        setErrorMessage('');
      }
    } catch (error) {
      const errorText = 'Error saving events: ' + error.message;
      console.error(errorText, error.stack);
      setErrorMessage(errorText);
    }
  };

  const fetchEngageEvents = async () => {
    setIsLoadingEngage(true);
    try {
      console.log('Fetching Engage events...');
      const response = await fetch('/api/scrape-engage');
      if (response.ok) {
        const engageEventsData = await response.json();
        console.log('Fetched Engage events:', engageEventsData.length);
        setEngageEvents(engageEventsData);
        setListMode('engage');
        setIsListOpen(true); // Open the list after fetching
        setErrorMessage('');
      } else {
        const errorText = 'Failed to fetch Engage events';
        console.error(errorText);
        setErrorMessage(errorText);
      }
    } catch (error) {
      const errorText = 'Error fetching Engage events: ' + error.message;
      console.error(errorText);
      setErrorMessage(errorText);
    } finally {
      setIsLoadingEngage(false);
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
    
    // Explicitly save to API using the cleaned saveEvents function
    await saveEvents(updatedEvents);
    
    setIsOpen(false);
  };

  const handleClaim = () => {
    setIsClaiming(true);
    setClaimProducer('');
  };

  const handleClaimSubmit = async () => {
    if (claimProducer.trim()) {
      const updatedEvents = events.map(e => e.id === selectedEvent.id ? {...e, extendedProps: {...e.extendedProps, status: 'CLAIMED', producer: claimProducer.trim()}} : e);
      setEvents(updatedEvents);
      
      // Use the cleaned saveEvents function
      await saveEvents(updatedEvents);
      
      setIsClaiming(false);
      setIsOpen(false);
    }
  };

  const handleEdit = () => {
    // Ensure editingEvent contains only clean data
    const cleanEvent = {
      id: selectedEvent.id,
      title: selectedEvent.title,
      start: selectedEvent.start,
      end: selectedEvent.end,
      allDay: selectedEvent.allDay,
      extendedProps: {
        slug: selectedEvent.extendedProps?.slug,
        storyType: selectedEvent.extendedProps?.storyType,
        description: selectedEvent.extendedProps?.description,
        location: selectedEvent.extendedProps?.location,
        producer: selectedEvent.extendedProps?.producer,
        status: selectedEvent.extendedProps?.status,
        type: selectedEvent.extendedProps?.type // NEW: Preserve type field
      },
      startStr: selectedEvent.startStr,
      endStr: selectedEvent.endStr
    };
    
    setEditingEvent(cleanEvent);
    setIsEditing(true);
    // Populate form with event data
    const event = cleanEvent;
    const startTime = event.startStr && event.startStr.includes('T') ? event.startStr.split('T')[1].substring(0,5) : '';
    const endTime = event.endStr && event.endStr.includes('T') ? event.endStr.split('T')[1].substring(0,5) : '';
    
    // Parse start time
    let startHour = '', startMin = '', startAmpm = '';
    if (startTime) {
      const [hourStr, min] = startTime.split(':');
      const hour = parseInt(hourStr);
      startAmpm = hour >= 12 ? 'PM' : 'AM';
      startHour = (hour % 12 || 12).toString();
      startMin = min;
    }
    
    // Parse end time
    let endHour = '', endMin = '', endAmpm = '';
    if (endTime) {
      const [hourStr, min] = endTime.split(':');
      const hour = parseInt(hourStr);
      endAmpm = hour >= 12 ? 'PM' : 'AM';
      endHour = (hour % 12 || 12).toString();
      endMin = min;
    }
    
    setForm({
      slug: event.extendedProps.slug,
      storyType: event.extendedProps.storyType,
      description: event.extendedProps.description,
      location: event.extendedProps.location,
      date: event.startStr ? event.startStr.split('T')[0] : '',
      startHour,
      startMin,
      startAmpm,
      endHour,
      endMin,
      endAmpm,
      producer: event.extendedProps.producer || '',
      status: event.extendedProps.status || 'AVAILABLE',
    });
    setIsOpen(false);
    setIsNewOpen(true);
  };

  const handleNewEvent = () => {
    if (!validateForm()) return;
    // Combine start time
    let startTime = '';
    if (form.startHour && form.startMin && form.startAmpm) {
      const hour24 = form.startAmpm === 'PM' && form.startHour !== '12' ? parseInt(form.startHour) + 12 : 
                     form.startAmpm === 'AM' && form.startHour === '12' ? 0 : parseInt(form.startHour);
      startTime = `${hour24.toString().padStart(2, '0')}:${form.startMin}`;
    }
    
    // Combine end time
    let endTime = '';
    if (form.endHour && form.endMin && form.endAmpm) {
      const hour24 = form.endAmpm === 'PM' && form.endHour !== '12' ? parseInt(form.endHour) + 12 : 
                     form.endAmpm === 'AM' && form.endHour === '12' ? 0 : parseInt(form.endHour);
      endTime = `${hour24.toString().padStart(2, '0')}:${form.endMin}`;
    }
    
    const title = form.slug || 'New Event';
    const hasDate = !!form.date;
    const hasTime = !!startTime;
    const eventType = hasDate ? 'scheduled' : 'unscheduled'; // NEW: Explicit type field
    
    if (isEditing && editingEvent) {
      // Update existing event - create clean updated event
      const updatedEvent = {
        id: editingEvent.id,
        title,
        start: hasDate ? (hasTime ? `${form.date}T${startTime}` : form.date) : null,
        end: hasDate && endTime ? `${form.date}T${endTime}` : null,
        allDay: hasDate && !hasTime,
        extendedProps: {
          slug: form.slug,
          storyType: form.storyType,
          description: form.description,
          location: form.location,
          producer: form.producer,
          status: form.status,
          type: eventType // NEW: Explicit type field
        },
      };
      setEvents(events.map(e => e.id === editingEvent.id ? updatedEvent : e));
      setIsEditing(false);
      setEditingEvent(null);
    } else {
      // Create new event
      const newEvent = {
        id: Date.now().toString(),
        title,
        start: hasDate ? (hasTime ? `${form.date}T${startTime}` : form.date) : null,
        end: hasDate && endTime ? `${form.date}T${endTime}` : null,
        allDay: hasDate && !hasTime,
        extendedProps: {
          slug: form.slug,
          storyType: form.storyType,
          description: form.description,
          location: form.location,
          producer: form.producer,
          status: form.status,
          type: eventType // NEW: Explicit type field
        },
      };
      setEvents([...events, newEvent]);
    }
    setForm({ 
      slug: '', 
      storyType: '', 
      description: '', 
      location: '', 
      date: '', // Leave empty for news packages
      startHour: '', 
      startMin: '', 
      startAmpm: '', 
      endHour: '', 
      endMin: '', 
      endAmpm: '', 
      producer: '',
      status: 'AVAILABLE' 
    });
    setIsNewOpen(false);
  };

  const handleDateFilterChange = (value) => {
    if (value === 'custom') {
      // Initialize temp values with current custom dates
      setTempStartDate(customStartDate);
      setTempEndDate(customEndDate);
    }
    setDateFilter(value);
  };

  const handleApplyCustomDates = () => {
    setCustomStartDate(tempStartDate);
    setCustomEndDate(tempEndDate);
  };

  // Memoize filtered events for performance
  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Choose which events to show based on list mode
    const eventsToFilter = listMode === 'engage' ? engageEvents : events;

    return eventsToFilter.filter(e => {
      // For engage events, don't filter by date since they might be from different sources
      if (listMode === 'engage') {
        // Only apply keyword filter for engage events
        if (keywordFilter && 
            !e.title.toLowerCase().includes(keywordFilter.toLowerCase()) &&
            !e.extendedProps?.description?.toLowerCase().includes(keywordFilter.toLowerCase()) &&
            !e.extendedProps?.location?.toLowerCase().includes(keywordFilter.toLowerCase())) {
          return false;
        }
        return true;
      }

      // For calendar events, apply all filters
      // Skip date filtering for unscheduled events (they have no dates)
      const isUnscheduled = isUnscheduledEvent(e);
      
      if (!isUnscheduled) {
        const eventDate = new Date(e.start);
        eventDate.setHours(0, 0, 0, 0);

        // Exclude past events
        if (eventDate < today) return false;

        // Date filter
        if (dateFilter === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (eventDate < today || eventDate >= tomorrow) return false;
        } else if (dateFilter === 'thisWeek') {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          if (eventDate < weekStart || eventDate >= weekEnd) return false;
        } else if (dateFilter === 'nextWeek') {
          const nextWeekStart = new Date(today);
          nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
          const nextWeekEnd = new Date(nextWeekStart);
          nextWeekEnd.setDate(nextWeekStart.getDate() + 7);
          if (eventDate < nextWeekStart || eventDate >= nextWeekEnd) return false;
        } else if (dateFilter === 'thisMonth') {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          if (eventDate < monthStart || eventDate >= monthEnd) return false;
        } else if (dateFilter === 'nextMonth') {
          const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 1);
          if (eventDate < nextMonthStart || eventDate >= nextMonthEnd) return false;
        } else if (dateFilter === 'custom') {
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            end.setDate(end.getDate() + 1); // Include the end date
            if (eventDate < start || eventDate >= end) return false;
          }
        }
      }

      // Keyword filter: check title, description, location (applies to all events)
      if (keywordFilter && 
          !e.title.toLowerCase().includes(keywordFilter.toLowerCase()) &&
          !e.extendedProps?.description?.toLowerCase().includes(keywordFilter.toLowerCase()) &&
          !e.extendedProps?.location?.toLowerCase().includes(keywordFilter.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Unscheduled events (no date) come FIRST - completely separate from scheduled events
      const aIsUnscheduled = isUnscheduledEvent(a);
      const bIsUnscheduled = isUnscheduledEvent(b);
      
      // If one is unscheduled and the other is scheduled, unscheduled comes first
      if (aIsUnscheduled && !bIsUnscheduled) return -1;
      if (!aIsUnscheduled && bIsUnscheduled) return 1;
      
      // If both are unscheduled, sort by title/slug
      if (aIsUnscheduled && bIsUnscheduled) {
        const aTitle = formatSlug(a.title || a.extendedProps?.slug) || 'Untitled';
        const bTitle = formatSlug(b.title || b.extendedProps?.slug) || 'Untitled';
        return aTitle.localeCompare(bTitle);
      }
      
      // Both are scheduled events - sort by date (earliest first)
      const aDate = new Date(a.start);
      const bDate = new Date(b.start);
      return aDate - bDate;
    });
  }, [events, engageEvents, keywordFilter, dateFilter, customStartDate, customEndDate, listMode]);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-red-600 text-white p-4">
        <div className="flex items-center">
          <Image src="/logo/logo.png" alt="Montclair News Lab" width={64} height={64} className="object-contain mr-4" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{`Montclair News Lab\u00A0\u00A0\u00A0Assignment Desk`}</h1>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setView('dayGridMonth')}
                  className={`mr-2 px-4 py-2 rounded border border-red-900 ${view === 'dayGridMonth' ? 'bg-red-800' : 'bg-red-500 hover:bg-red-800'}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView('timeGridWeek')}
                  className={`mr-2 px-4 py-2 rounded border border-red-900 ${view === 'timeGridWeek' ? 'bg-red-800' : 'bg-red-500 hover:bg-red-800'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => {
                    setListMode('calendar');
                    setIsListOpen(true);
                  }}
                  className={`mr-2 px-4 py-2 rounded border border-red-900 ${isListOpen && listMode === 'calendar' ? 'bg-red-800' : 'bg-red-500 hover:bg-red-800'}`}
                >
                  Packages
                </button>
                <button
                  onClick={fetchEngageEvents}
                  disabled={isLoadingEngage}
                  className="mr-2 px-4 py-2 rounded border border-red-900 bg-red-500 hover:bg-red-800 disabled:opacity-50"
                >
                  {isLoadingEngage ? 'Loading...' : 'Engage'}
                </button>
                <button
                  onClick={() => {
                    setForm({ 
                      slug: '', 
                      storyType: '', 
                      description: '', 
                      location: '', 
                      date: '', // Leave empty for news packages
                      startHour: '', 
                      startMin: '', 
                      startAmpm: '', 
                      endHour: '', 
                      endMin: '', 
                      endAmpm: '', 
                      producer: '',
                      status: 'AVAILABLE' 
                    });
                    setIsEditing(false);
                    setEditingEvent(null);
                    setIsNewOpen(true);
                  }}
                  className="mr-2 bg-white text-red-600 border border-red-900 px-4 py-2 rounded hover:bg-red-50"
                >
                  New Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <span className="text-red-500">×</span>
          </button>
        </div>
      )}
      {/* Left-side events list panel */}
      {isListOpen && (
        <div className="fixed inset-y-0 left-0 w-80 max-w-full z-50">
          <div className="h-full bg-white shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{listMode === 'engage' ? 'Engage Events' : 'Packages'}</h2>
                <p className="text-sm text-gray-500">{filteredEvents.length} total</p>
              </div>
              <button aria-label="Close events list" onClick={() => setIsListOpen(false)} className="text-gray-600 hover:text-gray-900">✕</button>
            </div>
            <div className="p-4 border-b">
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="Search by keyword..."
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                {listMode === 'calendar' && (
                  <select
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="all">All Upcoming</option>
                    <option value="today">Today</option>
                    <option value="thisWeek">This Week</option>
                    <option value="nextWeek">Next Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="nextMonth">Next Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                )}
                {listMode === 'calendar' && dateFilter === 'custom' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="date"
                      placeholder="End Date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={handleApplyCustomDates}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-2 overflow-auto">
              {filteredEvents.length === 0 ? (
                <div className="p-4 text-gray-500">No events match the filters</div>
              ) : listMode === 'engage' ? (
                // Engage events - simple list
                filteredEvents.map(e => (
                  <div key={e.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer" onClick={() => {
                    // Import Engage event: populate form and open new event modal
                    const title = e.title || '';
                    const desc = e.extendedProps.description || '';
                    let cleanDesc = desc;
                    if (desc.toLowerCase().startsWith(title.toLowerCase())) {
                      cleanDesc = desc.substring(title.length).trim();
                      cleanDesc = cleanDesc.replace(/^[\s,:;-]+/, '');
                    }
                    const startTimeStr = e.start.includes('T') ? e.start.split('T')[1].substring(0,5) : '';
                    const endTimeStr = e.end && e.end.includes('T') ? e.end.split('T')[1].substring(0,5) : '';
                    
                    // Parse start time
                    let startHour = '', startMin = '', startAmpm = '';
                    if (startTimeStr) {
                      const [hourStr, min] = startTimeStr.split(':');
                      const hour = parseInt(hourStr);
                      startAmpm = hour >= 12 ? 'PM' : 'AM';
                      startHour = (hour % 12 || 12).toString();
                      startMin = min;
                    }
                    
                    // Parse end time
                    let endHour = '', endMin = '', endAmpm = '';
                    if (endTimeStr) {
                      const [hourStr, min] = endTimeStr.split(':');
                      const hour = parseInt(hourStr);
                      endAmpm = hour >= 12 ? 'PM' : 'AM';
                      endHour = (hour % 12 || 12).toString();
                      endMin = min;
                    }
                    
                    setForm({
                      slug: formatSlug(e.extendedProps.slug || e.title || ''),
                      storyType: e.extendedProps.storyType || '',
                      description: cleanDesc,
                      location: e.extendedProps.location || '',
                      date: e.start.split('T')[0],
                      startHour,
                      startMin,
                      startAmpm,
                      endHour,
                      endMin,
                      endAmpm,
                      producer: '',
                      status: 'AVAILABLE',
                    });
                    setIsNewOpen(true);
                    setIsListOpen(false);
                  }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{formatSlug(e.title || e.extendedProps?.slug) || 'Untitled'}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-2">ENGAGE</span>
                          {e.extendedProps?.storyType && <span className="text-gray-500">{e.extendedProps.storyType}</span>}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {e.extendedProps?.description ? (
                            <div className="line-clamp-2">{e.extendedProps.description}</div>
                          ) : null}
                        </div>
                        {e.extendedProps?.location && <div className="text-sm text-gray-500">{e.extendedProps.location}</div>}
                      </div>
                      <div className="ml-2 text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Calendar events - separated into dropdown sections
                <>
                  {/* Unscheduled Events dropdown */}
                  <div className="mb-2">
                    <button
                      onClick={() => setUnscheduledExpanded(!unscheduledExpanded)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-red-50 hover:bg-red-100 text-red-800 text-sm font-medium border-b"
                    >
                      <span>Unscheduled Events ({filteredEvents.filter(isUnscheduledEvent).length})</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${unscheduledExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {unscheduledExpanded && filteredEvents.filter(isUnscheduledEvent).length > 0 && (
                      <div className="bg-gray-50">
                        {filteredEvents.filter(isUnscheduledEvent).map(e => (
                          <div key={e.id} className="p-3 border-b hover:bg-gray-100 cursor-pointer" onClick={() => {
                            // Handle undated packages
                            setSelectedEvent({
                              id: e.id,
                              extendedProps: e.extendedProps || {},
                              startStr: null,
                              endStr: '',
                              allDay: false
                            });
                            setIsListOpen(false);
                            setIsOpen(true);
                          }}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{formatSlug(e.title || e.extendedProps?.slug) || 'Untitled'}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {e.extendedProps?.producer && <span className="mr-2">{e.extendedProps.producer}</span>}
                                  {e.extendedProps?.status && (
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      e.extendedProps.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                      e.extendedProps.status === 'CLAIMED' ? 'bg-yellow-100 text-yellow-800' :
                                      e.extendedProps.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                                      e.extendedProps.status === 'APPROVED' ? 'bg-purple-100 text-purple-800' :
                                      e.extendedProps.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {e.extendedProps.status}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  <span className="text-gray-900 font-medium">News Package</span>
                                </div>
                                {e.extendedProps?.location && <div className="text-sm text-gray-500">{e.extendedProps.location}</div>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Scheduled Events section */}
                  <div className="mb-2">
                    <button
                      onClick={() => setScheduledExpanded(!scheduledExpanded)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-red-50 hover:bg-red-100 text-red-800 text-sm font-medium border-b"
                    >
                      <span>Scheduled Events ({filteredEvents.filter(isScheduledEvent).length})</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${scheduledExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {scheduledExpanded && (
                      <div>
                        {/* Available Events subsection */}
                        <div className="ml-2">
                          <button
                            onClick={() => setAvailableExpanded(!availableExpanded)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-green-50 hover:bg-green-100 text-green-800 text-sm font-medium border-b"
                          >
                            <span>Available Events ({filteredEvents.filter(isAvailableEvent).length})</span>
                            <svg 
                              className={`w-4 h-4 transition-transform ${availableExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {availableExpanded && filteredEvents.filter(isAvailableEvent).length > 0 && (
                            <div className="bg-green-25">
                              {filteredEvents.filter(isAvailableEvent).map(e => (
                                <div key={e.id} className="p-3 border-b hover:bg-gray-100 cursor-pointer" onClick={() => {
                                  // Regular event - navigate calendar to date and open details
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
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{formatSlug(e.title || e.extendedProps?.slug) || 'Untitled'}</div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mr-2">AVAILABLE</span>
                                      </div>
                                      <div className="text-sm text-gray-500 mt-1">
                                        {e.start ? new Date(e.start).toLocaleDateString() : 'Undated Package'}
                                        {e.start && e.start.includes('T') && ` at ${new Date(e.start).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`}
                                        {e.end && e.end !== e.start && ` - ${new Date(e.end).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`}
                                      </div>
                                      {e.extendedProps?.location && <div className="text-sm text-gray-500">{e.extendedProps.location}</div>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Claimed Events subsection */}
                        <div className="ml-2">
                          <button
                            onClick={() => setClaimedExpanded(!claimedExpanded)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 text-sm font-medium border-b"
                          >
                            <span>Claimed Events ({filteredEvents.filter(isClaimedEvent).length})</span>
                            <svg 
                              className={`w-4 h-4 transition-transform ${claimedExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {claimedExpanded && filteredEvents.filter(isClaimedEvent).length > 0 && (
                            <div className="bg-yellow-25">
                              {filteredEvents.filter(isClaimedEvent).map(e => (
                                <div key={e.id} className="p-3 border-b hover:bg-gray-100 cursor-pointer" onClick={() => {
                                  // Regular event - navigate calendar to date and open details
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
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{formatSlug(e.title || e.extendedProps?.slug) || 'Untitled'}</div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        {e.extendedProps?.status && (
                                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mr-2 ${
                                            e.extendedProps.status === 'CLAIMED' ? 'bg-yellow-100 text-yellow-800' :
                                            e.extendedProps.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                                            e.extendedProps.status === 'APPROVED' ? 'bg-purple-100 text-purple-800' :
                                            e.extendedProps.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {e.extendedProps.status}
                                          </span>
                                        )}
                                        {e.extendedProps?.producer && <span>{e.extendedProps.producer}</span>}
                                      </div>
                                      <div className="text-sm text-gray-500 mt-1">
                                        {e.start ? new Date(e.start).toLocaleDateString() : 'Undated Package'}
                                        {e.start && e.start.includes('T') && ` at ${new Date(e.start).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`}
                                        {e.end && e.end !== e.start && ` - ${new Date(e.end).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`}
                                      </div>
                                      {e.extendedProps?.location && <div className="text-sm text-gray-500">{e.extendedProps.location}</div>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                </>
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
          events={events.filter(e => e.start)} // Only show events with dates on calendar
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventContent={eventContent}
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
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold">{isClaiming ? 'Claim Event' : 'Event Details'}</Dialog.Title>
              <button onClick={() => { setIsOpen(false); setIsClaiming(false); }} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            {selectedEvent && (
              <div>
                {isClaiming ? (
                  <div>
                    <p><strong>Slug:</strong> {formatSlug(selectedEvent.extendedProps.slug)}</p>
                    <p><strong>Date:</strong> {selectedEvent.startStr.split('T')[0]}</p>
                    {selectedEvent.startStr.includes('T') && <p><strong>Start Time:</strong> {formatTime12Hour(selectedEvent.startStr.split('T')[1].substring(0,5))}</p>}
                    {selectedEvent.endStr && <p><strong>End Time:</strong> {formatTime12Hour(selectedEvent.endStr.split('T')[1].substring(0,5))}</p>}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Producer Name</label>
                      <input
                        type="text"
                        value={claimProducer}
                        onChange={(e) => setClaimProducer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleClaimSubmit()}
                        placeholder="Enter producer name"
                        className="w-full p-2 border rounded"
                        autoFocus
                      />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={handleClaimSubmit} className="bg-white text-red-600 border border-red-800 px-4 py-2 rounded hover:bg-red-50">Claim Event</button>
                      <button onClick={() => setIsClaiming(false)} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p><strong>Slug:</strong> {formatSlug(selectedEvent.extendedProps.slug)}</p>
                    {selectedEvent.startStr && <p><strong>Date:</strong> {selectedEvent.startStr.split('T')[0]}</p>}
                    {selectedEvent.startStr && selectedEvent.startStr.includes('T') && !selectedEvent.allDay && <p><strong>Start Time:</strong> {formatTime12Hour(selectedEvent.startStr.split('T')[1].substring(0,5))}</p>}
                    {selectedEvent.endStr && !selectedEvent.allDay && <p><strong>End Time:</strong> {formatTime12Hour(selectedEvent.endStr.split('T')[1].substring(0,5))}</p>}
                    {selectedEvent.allDay && <p><strong>Time:</strong> All Day</p>}
                    {!selectedEvent.startStr && <p><strong>Type:</strong> Undated Package</p>}
                    <p><strong>Story Type:</strong> {selectedEvent.extendedProps.storyType}</p>
                    <p><strong>Description:</strong> {selectedEvent.extendedProps.description}</p>
                    <p><strong>Location:</strong> {selectedEvent.extendedProps.location}</p>
                    <p><strong>Status:</strong> {selectedEvent.extendedProps.status || 'AVAILABLE'}</p>
                    {selectedEvent.extendedProps.producer && selectedEvent.extendedProps.status === 'CLAIMED' ? (
                      <p><strong>Producer:</strong> {selectedEvent.extendedProps.producer}</p>
                    ) : (
                      <p><strong>Available</strong></p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button onClick={handleEdit} className="bg-white text-red-600 border border-red-800 px-4 py-2 rounded hover:bg-red-50">Edit</button>
                      <button onClick={handleClaim} disabled={!!selectedEvent.extendedProps.producer} className="bg-white text-red-600 border border-red-800 px-4 py-2 rounded hover:bg-red-50">Claim</button>
                      <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
              <input type="date" placeholder="Date (optional for news packages)" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full p-2 border mb-2" />
              <div className="flex space-x-2 mb-2">
                <select value={form.startHour} onChange={(e) => setForm({...form, startHour: e.target.value})} className="flex-1 p-2 border">
                  <option value="">Hour</option>
                  {Array.from({length: 12}, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select value={form.startMin} onChange={(e) => setForm({...form, startMin: e.target.value})} className="flex-1 p-2 border">
                  <option value="">Min</option>
                  <option value="00">00</option>
                  <option value="30">30</option>
                </select>
                <select value={form.startAmpm} onChange={(e) => setForm({...form, startAmpm: e.target.value})} className="flex-1 p-2 border">
                  <option value="">AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              <div className="flex space-x-2 mb-2">
                <select value={form.endHour} onChange={(e) => setForm({...form, endHour: e.target.value})} className="flex-1 p-2 border">
                  <option value="">Hour</option>
                  {Array.from({length: 12}, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select value={form.endMin} onChange={(e) => setForm({...form, endMin: e.target.value})} className="flex-1 p-2 border">
                  <option value="">Min</option>
                  <option value="00">00</option>
                  <option value="30">30</option>
                </select>
                <select value={form.endAmpm} onChange={(e) => setForm({...form, endAmpm: e.target.value})} className="flex-1 p-2 border">
                  <option value="">AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full p-2 border mb-2" maxLength="500"></textarea>
              <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full p-2 border mb-2" />
              <input type="text" placeholder="Story Type" value={form.storyType} onChange={(e) => setForm({...form, storyType: e.target.value})} className="w-full p-2 border mb-2" />
              <input type="text" placeholder="Producer" value={form.producer} onChange={(e) => setForm({...form, producer: e.target.value})} className="w-full p-2 border mb-2" />
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full p-2 border mb-2">
                <option value="AVAILABLE">Available</option>
                <option value="CLAIMED">Claimed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <button type="submit" className="bg-white text-red-600 border border-red-800 px-4 py-2 rounded hover:bg-red-50">{isEditing ? 'Update' : 'Create'}</button>
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