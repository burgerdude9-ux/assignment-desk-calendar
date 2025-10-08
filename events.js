import { put, head } from '@vercel/blob';

const sampleEvents = [
  {
    id: '1',
    title: 'WiFi–Campus–1006',
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
    title: 'Homecoming–Prep–1007',
    start: '2025-10-08',
    extendedProps: {
      slug: 'Homecoming–Prep–1007',
      storyType: 'PACKAGE',
      description: 'Preparation for homecoming event.',
      location: 'Campus Green',
      status: 'CLAIMED',
    },
  },
];

const EVENTS_FILENAME = 'events.json';

export default async function handler(req, res) {
  console.log('API called:', req.method, req.url);

  if (req.method === 'GET') {
    try {
      console.log('Fetching events from blob...');
      // Check if events file exists
      const headResult = await head(EVENTS_FILENAME).catch(() => null);
      console.log('Head result:', headResult ? 'File exists' : 'File not found');

      if (headResult) {
        // File exists, fetch it
        const response = await fetch(headResult.url);
        const events = await response.json();
        console.log('Loaded events:', events.length);
        res.status(200).json(events);
      } else {
        // Initialize with sample events
        console.log('Initializing with sample events...');
        const eventsJson = JSON.stringify(sampleEvents);
        const blob = await put(EVENTS_FILENAME, eventsJson, {
          access: 'public',
          contentType: 'application/json',
        });
        console.log('Sample events saved to blob');
        res.status(200).json(sampleEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  } else if (req.method === 'POST') {
    try {
      const events = req.body;
      console.log('Saving events:', events.length, 'events');
      const eventsJson = JSON.stringify(events);

      // Upload to blob (overwrites existing file)
      await put(EVENTS_FILENAME, eventsJson, {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true,  // ✅ Allow overwriting existing blob
      });
      console.log('Events saved successfully');
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving events:', error);
      res.status(500).json({ error: 'Failed to save events' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}