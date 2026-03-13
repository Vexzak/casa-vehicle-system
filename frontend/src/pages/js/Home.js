import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FaCar, FaMotorcycle, FaStar, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaCheck, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import '../css/Home.css';

import motorcycleSample from '../aimages/motorcycle_sample.png';
import carSample from '../aimages/car_sample.png';

/* ── Icons ── */
const ChevronIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const CloseIcon = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ── Filter config ── */
const YEAR_RANGES = (() => {
  const current = new Date().getFullYear();
  const ranges = [];
  for (let y = current + 1; y >= current - 9; y--) {
    ranges.push({ label: `${y} – ${y + 1}`, min: String(y), max: String(y + 1) });
  }
  return ranges;
})();

const PRICE_RANGES = [
  { label: 'Under $20,000',       min: '0',      max: '20000'  },
  { label: '$20,000 – $40,000',   min: '20000',  max: '40000'  },
  { label: '$40,000 – $60,000',   min: '40000',  max: '60000'  },
  { label: '$60,000 – $80,000',   min: '60000',  max: '80000'  },
  { label: '$80,000 – $100,000',  min: '80000',  max: '100000' },
  { label: '$100,000 – $150,000', min: '100000', max: '150000' },
  { label: '$150,000 – $200,000', min: '150000', max: '200000' },
  { label: 'Over $200,000',       min: '200000', max: ''       },
];

function FilterPill({ placeholder, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [open]);
  const selected = options.find(o => o.value === value);
  return (
    <div className="fpw" ref={ref}>
      <button className={`fp-btn ${value ? 'active' : ''}`} onClick={() => setOpen(o => !o)}>
        <span>{selected ? selected.label : placeholder}</span>
        {value
          ? <span className="fp-x" onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }}><CloseIcon /></span>
          : <span className="fp-chev"><ChevronIcon /></span>}
      </button>
      {open && (
        <div className="fp-drop">
          {options.map(opt => (
            <button key={opt.value} className={`fp-opt ${value === opt.value ? 'sel' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PresetRangePill({ label, valueMin, valueMax, onChangeMin, onChangeMax, ranges }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [open]);
  const isActive = !!(valueMin || valueMax);
  const selected = ranges.find(r => r.min === valueMin && r.max === valueMax);
  return (
    <div className="fpw" ref={ref}>
      <button className={`fp-btn ${isActive ? 'active' : ''}`} onClick={() => setOpen(o => !o)}>
        <span>{selected ? selected.label : label}</span>
        {isActive
          ? <span className="fp-x" onClick={e => { e.stopPropagation(); onChangeMin(''); onChangeMax(''); setOpen(false); }}><CloseIcon /></span>
          : <span className="fp-chev"><ChevronIcon /></span>}
      </button>
      {open && (
        <div className="fp-drop">
          {ranges.map(r => (
            <button key={r.label} className={`fp-opt ${r.min === valueMin && r.max === valueMax ? 'sel' : ''}`}
              onClick={() => { onChangeMin(r.min); onChangeMax(r.max); setOpen(false); }}>
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Static data ── */
const MARQUEE_ITEMS = [
  '🏁 Premium Vehicles', '⚡ Reserve Online', '🏍️ Sport Motorcycles',
  '🔥 Exclusive Models', '🏆 Top Brands', '🚀 Zero to Thrill', '💨 Drive Your Dream',
  '🏁 Premium Vehicles', '⚡ Reserve Online', '🏍️ Sport Motorcycles',
  '🔥 Exclusive Models', '🏆 Top Brands', '🚀 Zero to Thrill', '💨 Drive Your Dream',
];

const FEATURES = [
  {
    icon: '🏍️',
    title: 'Find the Right Vehicle',
    desc: 'Explore our curated collection of motorcycles and cars to find the perfect vehicle that fits your needs and style.',
  },
  {
    icon: '📋',
    title: 'Reserve Now at the Best Price',
    desc: 'Reserve your preferred vehicle online quickly and easily before visiting the dealership — no payment required upfront.',
  },
  {
    icon: '🏎️',
    title: 'Enjoy the Ride',
    desc: 'Visit the dealership within 10 days, complete the paperwork and transaction, then drive away in your dream vehicle.',
  },
];

const CHECKLIST = [
  'No credit-card fees',
  'Price match guarantee',
  'Online reservation management',
  'Free cancellations & amendments',
  '24/7 Customer Service',
];

/* ═══════════════════════════════════
   HOME COMPONENT
═══════════════════════════════════ */
const Home = () => {
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filters, setFilters]     = useState({ type: '', brand: '', minYear: '', maxYear: '', minPrice: '', maxPrice: '' });
  const [brands, setBrands]       = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);

  const CARDS_PER_VIEW = 4;

  /* Reservation modal */
  const [showReservationModal, setShowReservationModal] = useState(false);

  // ─── DRAG STATE ───────────────────────────────────────────────
  // All in a ref — zero re-renders during drag, no React batching delays.
  const drag = useRef({ active: false, startX: 0, startScrollLeft: 0, didDrag: false });

  useEffect(() => {
    const track = carouselRef.current;
    if (!track) return;

    const onMouseDown = (e) => {
      if (e.button !== 0) return; // left-click only
      drag.current = {
        active: true,
        startX: e.clientX,
        startScrollLeft: track.scrollLeft,
        didDrag: false,
      };
      track.classList.add('is-dragging');
      e.preventDefault(); // stops text selection while dragging
    };

    const onMouseMove = (e) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      if (Math.abs(dx) > 3) drag.current.didDrag = true;
      // Direct DOM write — instant, no scroll-behavior, no snap fighting
      track.scrollLeft = drag.current.startScrollLeft - dx;
    };

    const onMouseUp = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      track.classList.remove('is-dragging');
    };

    // mousedown on the track itself; move + up on document
    // so fast drags that leave the element still work perfectly
    track.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      track.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  // Re-attach after vehicles load so the ref element is fully rendered
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles]);

  // Prevent <Link> navigation when user dragged instead of clicking
  const handleCardClick = (e) => {
    if (drag.current.didDrag) {
      e.preventDefault();
      drag.current.didDrag = false;
    }
  };
  // ──────────────────────────────────────────────────────────────

  useEffect(() => { fetchVehicles(); fetchBrands(); }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search)           params.append('search',   search);
      if (filters.type)     params.append('type',     filters.type);
      if (filters.brand)    params.append('brand',    filters.brand);
      if (filters.minYear)  params.append('minYear',  filters.minYear);
      if (filters.maxYear)  params.append('maxYear',  filters.maxYear);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      const res = await api.get(`/vehicles?${params.toString()}`);
      setVehicles(res.data);
      setCarouselIndex(0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchBrands = async () => {
    try { const res = await api.get('/vehicles/brands'); setBrands(res.data); }
    catch (e) { console.error(e); }
  };

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const handleSearch = (e) => { e.preventDefault(); fetchVehicles(); };
  const activeCount = Object.values(filters).filter(Boolean).length;
  const clearAll = () => {
    setFilters({ type: '', brand: '', minYear: '', maxYear: '', minPrice: '', maxPrice: '' });
    setSearch('');
    setTimeout(fetchVehicles, 100);
  };

  /* ── Carousel button / dot scroll ── */
  const totalDots = Math.max(1, Math.ceil(vehicles.length / CARDS_PER_VIEW));
  const maxIndex  = Math.max(0, vehicles.length - CARDS_PER_VIEW);

  const scrollCarousel = (dir) => {
    setCarouselIndex(prev => {
      const next = prev + dir * CARDS_PER_VIEW;
      return Math.max(0, Math.min(next, maxIndex));
    });
  };
  const goToDot = (dotIdx) => setCarouselIndex(Math.min(dotIdx * CARDS_PER_VIEW, maxIndex));

  // Smooth scroll only for button/dot clicks, never during drag
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || drag.current.active) return;
    const card = el.querySelector('.vehicle-card');
    if (!card) return;
    el.scrollTo({ left: carouselIndex * (card.offsetWidth + 20), behavior: 'smooth' });
  }, [carouselIndex]);

  const activeDotIndex = Math.min(Math.round(carouselIndex / CARDS_PER_VIEW), totalDots - 1);

  return (
    <div className="home-page">

      {/* ── RESERVATION MODAL ── */}
      {showReservationModal && (
        <div className="reservation-modal-overlay" onClick={() => setShowReservationModal(false)}>
          <div className="reservation-modal" onClick={e => e.stopPropagation()}>
            <div className="reservation-modal-badge">RESERVATION NOTICE</div>
            <div className="reservation-modal-icon">📋</div>
            <h2 className="reservation-modal-title">Reservation Confirmed!</h2>
            <div className="reservation-modal-divider" />
            <p className="reservation-modal-body">
              Dear customer, thank you for reserving this vehicle. Please remember that you must claim or complete
              the transaction at the dealership <strong>within 10 days</strong>. If the vehicle is not claimed within
              this period, it will automatically become available again for other customers to reserve.
            </p>
            <p className="reservation-modal-note">Thank you for choosing our dealership.</p>
            <button className="reservation-modal-close" onClick={() => setShowReservationModal(false)}>
              Got It — I'll Visit Soon
            </button>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          <div className="navbar-emblem">🏎️</div>
          <span className="navbar-brand">ESSAK<span className="brand-accent">MARKET</span></span>
        </Link>
        <div className="navbar-center">
          <Link to="/"             className="nav-link">Home</Link>
          <a href="#garage"        className="nav-link" onClick={e => { e.preventDefault(); document.getElementById('garage')?.scrollIntoView({ behavior: 'smooth' }); }}>Vehicles</a>
          <Link to="/reservations" className="nav-link">Reservations</Link>
          <Link to="/list"         className="nav-link">List</Link>
          <a href="#contact"       className="nav-link" onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
        </div>
        <div className="navbar-auth">
          <Link to="/login"    className="btn-login">Log in</Link>
          <Link to="/register" className="btn-register">Reserve Now</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero-section">
        <div className="hero-bg-layer">
          <div className="hero-speed-lines">
            {[...Array(8)].map((_, i) => <div key={i} className="speed-line" />)}
          </div>
          <div className="hero-slash" />
          <div className="hero-grid-tex" />
          <img src={motorcycleSample} className="hero-bg-motorcycle" alt="" />
          <img src={carSample}        className="hero-bg-car"        alt="" />
        </div>
        <div className="hero-bottom-bar" />
        <div className="hero-content">
          <div className="hero-text-anim">
            <div className="hero-label">
              <span className="hero-label-dot" />
              Vehicle Reservation Dealership
            </div>
            <h1 className="hero-title">
              <span className="hero-title-line"><span>RESERVE YOUR</span></span>
              <span className="hero-title-line"><span className="hero-red">DREAM</span></span>
              <span className="hero-title-line"><span>VEHICLE</span></span>
            </h1>
            <p className="hero-subtitle">
              Browse online, reserve your vehicle, then visit us within 10 days to complete your transaction
            </p>
          </div>
          <div className="search-filter-wrap">
            <form onSubmit={handleSearch} className="search-bar">
              <input type="text" placeholder="Search by name, brand, or model..."
                value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
              <button type="submit" className="search-btn"><SearchIcon /><span>Search</span></button>
            </form>
            <div className="filter-pills-row">
              <FilterPill placeholder="Vehicle Type" value={filters.type} onChange={v => setF('type', v)}
                options={[{ value: 'car', label: '🚗  Car' }, { value: 'motorcycle', label: '🏍️  Motorcycle' }]} />
              <FilterPill placeholder="Brand" value={filters.brand} onChange={v => setF('brand', v)}
                options={brands.map(b => ({ value: b, label: b }))} />
              <PresetRangePill label="Year" valueMin={filters.minYear} valueMax={filters.maxYear}
                onChangeMin={v => setF('minYear', v)} onChangeMax={v => setF('maxYear', v)} ranges={YEAR_RANGES} />
              <PresetRangePill label="Price" valueMin={filters.minPrice} valueMax={filters.maxPrice}
                onChangeMin={v => setF('minPrice', v)} onChangeMax={v => setF('maxPrice', v)} ranges={PRICE_RANGES} />
              {activeCount > 0 && (
                <button onClick={clearAll} className="clear-pill"><CloseIcon /> Clear All</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="marquee-item">
              {item}{i < MARQUEE_ITEMS.length - 1 && <span className="marquee-dot"> ✦ </span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── VEHICLE CAROUSEL ── */}
      <div className="grid-section" id="garage">
        <div className="grid-header">
          <div>
            <span className="grid-title-sub">⚡ All Listings</span>
            <h2 className="grid-title">THE GARAGE</h2>
          </div>
          <div className="grid-header-right">
            {!loading && (
              <span className="results-count">
                <strong>{vehicles.length}</strong> vehicle{vehicles.length !== 1 ? 's' : ''}
              </span>
            )}
            {vehicles.length > CARDS_PER_VIEW && (
              <div className="carousel-arrows">
                <button className="carousel-arrow" onClick={() => scrollCarousel(-1)} disabled={carouselIndex === 0}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button className="carousel-arrow" onClick={() => scrollCarousel(1)} disabled={carouselIndex >= maxIndex}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loader" />
        ) : vehicles.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🏁</div>
            <p>No vehicles found</p>
            <small>Try adjusting your search or filters</small>
          </div>
        ) : (
          <>
            <div className="carousel-viewport">
              <div
                className="vehicles-grid carousel-track"
                ref={carouselRef}
              >
                {vehicles.map(vehicle => (
                  <Link
                    to={`/vehicle/${vehicle.id}`}
                    key={vehicle.id}
                    className="vehicle-card"
                    onClick={handleCardClick}
                  >
                    <div className="vehicle-image">
                      <div className="race-lines">
                        {[...Array(8)].map((_, i) => <span key={i} />)}
                      </div>
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <>
                          <img src={vehicle.images[0].image_path} alt={vehicle.name}
                            onError={e => {
                              e.target.style.display = 'none';
                              const fb = e.target.closest('.vehicle-image').querySelector('.no-image');
                              if (fb) fb.style.display = 'flex';
                            }} />
                          <div className="no-image" style={{ display: 'none' }}>
                            {vehicle.type === 'car' ? <FaCar size={36} /> : <FaMotorcycle size={36} />}
                            <span>No Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="no-image">
                          {vehicle.type === 'car' ? <FaCar size={36} /> : <FaMotorcycle size={36} />}
                          <span>No Image</span>
                        </div>
                      )}
                      <div className="image-gradient" />
                      <div className="image-hover-overlay" />
                      <div className="vehicle-type-badge">
                        {vehicle.type === 'car' ? <FaCar /> : <FaMotorcycle />}{vehicle.type}
                      </div>
                      <div className={`status-badge ${vehicle.availability_status}`}>
                        {vehicle.availability_status === 'available'
                          ? '● Available'
                          : vehicle.availability_status === 'reserved'
                          ? '◌ Reserved'
                          : '✕ Unavailable'}
                      </div>
                    </div>
                    <div className="vehicle-info">
                      <h3 className="vehicle-name">{vehicle.name}</h3>
                      <div className="vehicle-meta">
                        <span className="vehicle-brand">{vehicle.brand} · {vehicle.year}</span>
                      </div>
                      <div className="vehicle-footer">
                        <div className="vehicle-price"><span className="price-symbol">$</span>{parseFloat(vehicle.price).toLocaleString()}</div>
                        <div className="card-cta">Reserve <span className="card-cta-arrow"><ArrowRight /></span></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {totalDots > 1 && (
              <div className="carousel-dots">
                {Array.from({ length: totalDots }).map((_, i) => (
                  <button key={i} className={`carousel-dot${i === activeDotIndex ? ' active' : ''}`}
                    onClick={() => goToDot(i)} aria-label={`Page ${i + 1}`} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FEATURES SECTION ── */}
      <div className="features-section">
        <div className="features-inner">
          <div className="features-header">
            <span className="features-sub">✦ How It Works</span>
            <h2 className="features-title">YOUR JOURNEY STARTS HERE</h2>
            <p className="features-tagline">Three simple steps to your dream vehicle</p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-step">0{i + 1}</div>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-card-line" />
              </div>
            ))}
          </div>

          <div className="checklist-section">
            <div className="checklist-left">
              <span className="checklist-sup">⚡ Why Reserve With Us</span>
              <h3 className="checklist-title">Everything you need,<br />nothing you don't.</h3>
            </div>
            <div className="checklist-right">
              {CHECKLIST.map((item, i) => (
                <div className="checklist-item" key={i}>
                  <span className="checklist-icon"><FaCheck size={11} /></span>
                  <span className="checklist-text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="site-footer" id="contact">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand-col">
              <div className="footer-logo">
                <div className="navbar-emblem footer-emblem">🏎️</div>
                <span className="navbar-brand footer-brand-text">ESSAK<span className="brand-accent">MARKET</span></span>
              </div>
              <p className="footer-tagline">
                Your trusted vehicle reservation dealership. Browse, reserve online, then visit us to complete your dream.
              </p>
              <div className="footer-socials">
                <a href="#" className="social-icon" aria-label="Facebook"><FaFacebook /></a>
                <a href="#" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
                <a href="#" className="social-icon" aria-label="YouTube"><FaYoutube /></a>
              </div>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">About Us</h4>
              <p className="footer-about-text">
                Essak Market is a premier vehicle dealership specializing in cars and motorcycles.
                We offer an online reservation system so you can secure your vehicle before visiting our showroom.
              </p>
            </div>

            <div className="footer-contact-col">
              <h4 className="footer-col-title">Contact</h4>
              <div className="footer-contact-item">
                <FaPhone className="footer-contact-icon" />
                <span>+1 (800) 835-6627</span>
              </div>
              <div className="footer-contact-item">
                <FaEnvelope className="footer-contact-icon" />
                <span>info@essakmarket.com</span>
              </div>
              <div className="footer-contact-item">
                <FaMapMarkerAlt className="footer-contact-icon" />
                <span>123 Speedway Blvd, Motor City, MC 40001</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Essak. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Reservation Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;