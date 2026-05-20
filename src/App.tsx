import { useState } from 'react';

// === HELPER COMPONENTS UNTUK INLINE SVG ICONS ===

// Icon Logo SurgeTicket
const SurgeTicketLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 13.71L14 10a1 1 0 1 1 1.42 1.42l-3.71 3.71"></path>
    <path d="M13.71 10.29L10 14a1 1 0 1 0-1.42-1.42l3.71-3.71"></path>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
  </svg>
);

// Icon Petir untuk Surge Pricing
const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

// Icon Orang (User)
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Icon Cart
const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

// Icon Lokasi (Pin)
const MapPinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

// Icon Cari (Search)
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Icon Tiket (Untuk yang besar di card)
const TicketIconLarge = () => (
  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9.5a2 2 0 1 1 0 4 2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 7 13.5a2.5 2.5 0 0 0-2.5-2.5A2.5 2.5 0 0 0 2 9.5Z"></path>
    <path d="M22 9.5a2 2 0 1 0 0 4 2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 17 13.5a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 1 22 9.5Z"></path>
    <path d="M12 9.5a2 2 0 1 1 0 4"></path>
    <path d="M2 9.5v11.5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9.5"></path>
    <path d="M2 9.5V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5.5"></path>
  </svg>
);

// Icon Grafik (Activity)
const ActivityIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

// Icon Tiket Kecil untuk tombol
const TicketIconSmall = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 9.5a2 2 0 1 1 0 4 2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 7 13.5a2.5 2.5 0 0 0-2.5-2.5A2.5 2.5 0 0 0 2 9.5Z"></path>
    <path d="M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2"></path>
    <path d="M13 2v20"></path>
  </svg>
);

function App() {
  const [ticketData] = useState({
    viewers: 3455,
    stok: 100,
    harga_sekarang: 150000, 
    status: "CRITICAL SURGE (2.5X)",
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #2DD4BF, #93C5FD, #C084FC)',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white',
      margin: 0
    }}>
      
      {/* NAVBAR */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(17, 24, 39, 0.9)',
        color: 'white',
        borderRadius: '9999px',
        padding: '1rem 1.5rem',
        marginBottom: '3rem',
        maxWidth: '1200px',
        margin: '0 auto 3rem auto',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <SurgeTicketLogo />
          <span>SurgeTicket</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
          <a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Browse Events</a>
          <a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>How It Works</a>
          <a href="#" style={{ color: '#D1D5DB', textDecoration: 'none' }}>Support</a>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#D1D5DB' }}>
          <UserIcon />
          <CartIcon />
          <button style={{
            border: '1px solid #4B5563',
            background: 'transparent',
            borderRadius: '9999px',
            padding: '0.375rem 1rem',
            color: 'white',
            cursor: 'pointer'
          }}>
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', color: 'white' }}>
        <h1 style={{ fontSize: '3.75rem', fontWeight: 'bold', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          Discover events around you.
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#F3F4F6', marginBottom: '2rem' }}>
          Find your next memory in seconds.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '672px'
          }}>
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search for Events Nearby..." 
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                color: '#374151',
                background: 'transparent',
                marginLeft: '0.5rem',
                fontSize: '1rem'
              }}
            />
            <div style={{ borderLeft: '1px solid #D1D5DB', height: '1.5rem', margin: '0 1rem' }}></div>
            <MapPinIcon />
            <select style={{
              border: 'none',
              outline: 'none',
              color: '#374151',
              background: 'transparent',
              fontSize: '1rem',
              cursor: 'pointer',
              marginLeft: '0.5rem'
            }}>
              <option>New York, NY</option>
              <option>Jakarta, ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#FDFDF9',
        borderRadius: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '2.5rem',
        color: '#111827'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Featured</h2>
        
        {/* FEATURED CARD */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          border: '1px solid #E5E7EB',
          padding: '1.5rem',
          display: 'flex',
          gap: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* MESH BACKGROUND DUMMY */}
          <div style={{
            position: 'absolute',
            top: 0, right: 0,
            width: '300px', height: '300px',
            background: 'conic-gradient(from 180deg at 50% 50%, #2DD4BF 0deg, #C084FC 360deg)',
            opacity: 0.1,
            filter: 'blur(30px)',
            zIndex: 0
          }}></div>

          {/* Left: Graphic */}
          <div style={{
            background: '#E5EEED',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '33%',
            aspectRatio: '16/10',
            position: 'relative',
            zIndex: 1
          }}>
            <TicketIconLarge />
          </div>

          {/* Middle: Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
            <h3 style={{ fontSize: '1.875rem', fontWeight: '900', color: '#111827', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              VIP CONCERT ACCESS: <br /> STEVE AOKI
            </h3>
            <p style={{ color: '#4B5563', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              July 26, 2026 • <MapPinIcon /> Gelora Bung Karno, ID
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0F766E', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', background: '#14B8A6', borderRadius: '50%' }}></div>
              <span style={{ fontWeight: 'bold' }}>LIVE Metrics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#111827' }}>
              <ActivityIcon />
              <div>
                <div style={{ fontSize: '1.875rem', fontWeight: '900' }}>{ticketData.viewers.toLocaleString('id-ID')}</div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Active web traffic</div>
              </div>
            </div>
          </div>

          {/* Right: Checkout */}
          <div style={{
            width: '30%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderLeft: '1px solid #E5E7EB',
            paddingLeft: '1.5rem',
            zIndex: 1
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#1F2937', textTransform: 'uppercase', marginBottom: '0.25rem' }}>LIVE Metrics</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.875rem', fontWeight: '900', color: '#111827' }}>
                <UserIcon />
                {ticketData.viewers.toLocaleString('id-ID')}
              </div>
            </div>

            <div style={{
              width: '100%',
              background: '#E5E7EB',
              borderRadius: '9999px',
              height: '10px',
              marginBottom: '0.5rem'
            }}>
              <div style={{ width: `${ticketData.stok}%`, background: '#111827', height: '10px', borderRadius: '9999px' }}></div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.5rem' }}>{ticketData.stok} tickets left.</p>

            {/* Badge Surge Pricing */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#B91C1C',
              background: '#FEE2E2',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              border: '1px solid #FECACA',
              width: 'max-content'
            }}>
              <ZapIcon />
              {ticketData.status}
            </div>

            <button style={{
              width: '100%',
              background: '#111827',
              color: 'white',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <TicketIconSmall />
              Instant Checkout
            </button>
          </div>
        </div>

        {/* TRENDING NOW SECTION */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Trending Now</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #E5E7EB',
                padding: '1rem',
                height: '240px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  background: '#E5EEED',
                  borderRadius: '0.5rem',
                  flex: 1,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TicketIconLarge />
                </div>
                <h4 style={{ fontWeight: 'bold', color: '#111827', margin: 0 }}>Event Title {item}</h4>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0.25rem 0' }}>Date & Time</p>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Venue / Location</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;