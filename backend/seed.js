const { createClient } = require('redis');

const client = createClient();

client.on('error', (err) => console.log('Redis Client Error', err));

async function seed() {
  await client.connect();
  console.log('Connected to Redis...');

  // Clear existing event data to avoid duplicates during seeding
  const eventKeys = await client.keys('event:*');
  if (eventKeys.length > 0) {
      await client.del(eventKeys);
  }
  const ticketKeys = await client.keys('ticket:*');
  if (ticketKeys.length > 0) {
      await client.del(ticketKeys);
  }
  await client.del('events:all');

  const events = [
    {
      id: '1',
      title: 'The Weeknd: After Hours til Dawn Tour',
      description: 'Experience the stadium tour of a lifetime. The Weeknd brings his record-breaking hits to the stage. Due to extreme demand, dynamic pricing is active.',
      location: 'Jakarta International Stadium',
      date: 'Sat, Dec 31 • 9:00 PM',
      category: 'Concert',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000'
    },
    {
      id: '2',
      title: 'Coldplay: Music of the Spheres',
      description: 'The record-breaking world tour continues. Grab your tickets before they sell out in seconds.',
      location: 'Gelora Bung Karno, Jakarta',
      date: 'Wed, Nov 15 • 7:00 PM',
      category: 'Concert',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1000'
    },
    {
      id: '3',
      title: 'Arctic Monkeys Asia Tour',
      description: 'British indie rock legends bring their signature sound to the capital for one night only.',
      location: 'Beach City International Stadium',
      date: 'Sat, Mar 18 • 8:00 PM',
      category: 'Concert',
      image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=1000'
    },
    {
      id: '4',
      title: 'Taylor Swift | The Eras Tour',
      description: 'A journey through the musical eras of Taylor Swift. Extremely high demand expected.',
      location: 'National Stadium, Singapore',
      date: 'Sat, Mar 2 • 6:00 PM',
      category: 'Concert',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000'
    }
  ];

  const tickets = {
    '1': [
      { id: 'vip', name: 'VIP Access', base_price: 1500000, initial_stock: 50 },
      { id: 'regular', name: 'General Admission', base_price: 500000, initial_stock: 500 }
    ],
    '2': [
      { id: 'cat1', name: 'CAT 1 (Seating)', base_price: 5000000, initial_stock: 20 },
      { id: 'festival', name: 'Festival (Standing)', base_price: 3500000, initial_stock: 300 }
    ],
    '3': [
      { id: 'vip', name: 'VIP Standing', base_price: 3000000, initial_stock: 100 },
      { id: 'tribune', name: 'Tribune', base_price: 1300000, initial_stock: 800 }
    ],
    '4': [
      { id: 'vip', name: 'VIP Package', base_price: 11000000, initial_stock: 5 },
      { id: 'cat3', name: 'CAT 3', base_price: 3500000, initial_stock: 150 }
    ]
  };

  for (const event of events) {
    // 1. Save Event Details as Hash
    await client.hSet(`event:${event.id}`, {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
      category: event.category,
      image: event.image
    });

    // 2. Add Event ID to the set of all events
    await client.sAdd('events:all', event.id);

    // 3. Save Ticket variations
    const eventTickets = tickets[event.id];
    for (const ticket of eventTickets) {
      await client.hSet(`ticket:${event.id}:${ticket.id}`, {
        id: ticket.id,
        name: ticket.name,
        base_price: ticket.base_price,
        initial_stock: ticket.initial_stock
      });
      // Set initial stock string for decrementing
      await client.set(`ticket:${event.id}:${ticket.id}:stock`, ticket.initial_stock);
      // Reset viewers and revenue
      await client.set(`ticket:${event.id}:${ticket.id}:viewers`, 0);
      await client.set(`ticket:${event.id}:${ticket.id}:revenue`, 0);
    }
  }

  console.log('✅ Successfully seeded dummy data into Redis!');
  await client.quit();
}

seed();
