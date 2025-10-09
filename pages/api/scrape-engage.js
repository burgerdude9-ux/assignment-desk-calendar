const axios = require('axios');
const cheerio = require('cheerio');

const RSS_URL = 'https://montclair.campuslabs.com/engage/events.rss';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    console.log('Fetching Engage RSS feed...');

    const response = await axios.get(RSS_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('RSS response status:', response.status);
    console.log('RSS response length:', response.data.length);

    const $ = cheerio.load(response.data, { xmlMode: true });
    console.log('Parsed XML, found', $('item').length, 'items');

    const events = [];
    const now = new Date();
    const threeMonthsFromNow = new Date(now);
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    $('item').each((i, elem) => {
      try {
        const title = $(elem).find('title').text().trim();
        const description = $(elem).find('description').text();
        const guid = $(elem).find('guid').text();

        // Parse description for date/time/location
        const $desc = cheerio.load(description);
        const startTimeEl = $desc('time.dt-start');
        const endTimeEl = $desc('time.dt-end');
        const locationEl = $desc('span.p-location');

        const startDatetime = startTimeEl.attr('datetime');
        const endDatetime = endTimeEl.attr('datetime');
        const location = locationEl.text().trim();

        if (startDatetime) {
          const startDate = new Date(startDatetime);
          const endDate = endDatetime ? new Date(endDatetime) : null;

          // Only include events within 3 months from now
          if (!isNaN(startDate.getTime()) && startDate <= threeMonthsFromNow && startDate >= now) {
            // Truncate description for performance
            const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
            const shortDescription = cleanDescription.length > 200 ? 
              cleanDescription.substring(0, 200) + '...' : cleanDescription;

            events.push({
              id: `engage-${guid || title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
              title: title,
              start: startDate.toISOString(),
              end: endDate && !isNaN(endDate.getTime()) ? endDate.toISOString() : null,
              extendedProps: {
                slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                storyType: 'EVENT',
                description: shortDescription,
                location: location,
                status: 'AVAILABLE'
              }
            });
          }
        }
      } catch (itemError) {
        console.error(`Error processing item ${i + 1}:`, itemError.message);
      }
    });

    // Sort by date (most recent first)
    events.sort((a, b) => new Date(b.start) - new Date(a.start));

    console.log(`Successfully processed ${events.length} events from RSS feed (all upcoming events within 3 months).`);
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching RSS feed:', error.message);
    res.status(500).json({
      error: 'Failed to fetch Engage RSS feed',
      details: error.message
    });
  }
}