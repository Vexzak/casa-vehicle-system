import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  FaHeart, FaRegHeart, FaCar, FaMotorcycle, FaCalendarAlt,
  FaTrashAlt, FaBalanceScale, FaCheckCircle, FaTimesCircle,
  FaInfoCircle, FaTimes, FaArrowLeft, FaMapMarkerAlt,
  FaThLarge, FaList, FaSortAmountDown, FaPalette,
  FaFacebook, FaInstagram, FaTwitter, FaYoutube,
  FaPhone, FaEnvelope,
} from 'react-icons/fa';
import '../css/Wishlist.css';

/* ─────────────────────────────────────────────────────────────── */
/*  Inline Compare Page (no extra route needed)                    */
/* ─────────────────────────────────────────────────────────────── */
const getColorImage = (vehicle) => {
  const images = vehicle.images ?? [];
  if (images.length === 0) return null;
  if (!vehicle.selected_color) return images[0]?.image_path ?? null;

  const selectedObj = typeof vehicle.selected_color === 'string'
    ? (() => { try { return JSON.parse(vehicle.selected_color); } catch { return null; } })()
    : vehicle.selected_color;
  const wantedName = selectedObj?.name?.toLowerCase().trim();

  if (!wantedName) return images[0]?.image_path ?? null;

  const match = images.find(img => {
    if (!img.color) return false;
    const colorObj = typeof img.color === 'string'
      ? (() => { try { return JSON.parse(img.color); } catch { return null; } })()
      : img.color;
    return colorObj?.name?.toLowerCase().trim() === wantedName;
  });

  return (match ?? images[0])?.image_path ?? null;
};

/* ── Reusable race lines — same as Home garage cards ── */
const RaceLines = () => (
  <div className="wl-race-lines" aria-hidden="true">
    {[...Array(8)].map((_, i) => <span key={i} />)}
  </div>
);

const ComparePage = ({ vehicles, onClose }) => {
  const fields = [
    { label: 'Price',    fmt: v => `₱${parseFloat(v.price).toLocaleString()}` },
    { label: 'Brand',    fmt: v => v.brand },
    { label: 'Year',     fmt: v => v.year },
    { label: 'Type',     fmt: v => v.type },
    { label: 'Location', fmt: v => v.location || '—' },
    { label: 'Status',   fmt: v => v.availability_status },
  ];
  return (
    <div className="wl-compare-page">
      <div className="wl-compare-page__bar">
        <div className="wl-compare-page__title">
          <FaBalanceScale style={{ color: '#e8001d' }} /> Vehicle Comparison
        </div>
        <button className="wl-compare-page__close" onClick={onClose}>
          <FaArrowLeft /> Back to Wishlist
        </button>
      </div>
      <div className="wl-compare-page__body">
        {/* Header row */}
        <div className="wl-cmp-grid" style={{ '--cols': vehicles.length }}>
          <div className="wl-cmp-label-cell" />
          {vehicles.map(v => {
            const thumb = getColorImage(v);
            return (
            <div key={v.id} className="wl-cmp-vehicle-header">
              <div className="wl-cmp-vehicle-img">
                {thumb
                  ? <img src={thumb} alt={v.name} />
                  : <div className="wl-cmp-vehicle-img-placeholder">{v.type === 'car' ? <FaCar /> : <FaMotorcycle />}</div>
                }
              </div>
              <div className="wl-cmp-vehicle-name">{v.name}</div>
              <div className="wl-cmp-vehicle-price">₱{parseFloat(v.price).toLocaleString()}</div>
              {v.selected_color && (
                <div className="wl-cmp-vehicle-color">
                  <span className="wl-cmp-color-dot" style={{ background: v.selected_color.hex }} />
                  {v.selected_color.name}
                </div>
              )}
            </div>
            );
          })}
        </div>
        {/* Data rows */}
        {fields.map((f, fi) => (
          <div key={f.label} className={`wl-cmp-grid wl-cmp-row ${fi % 2 === 0 ? 'even' : ''}`} style={{ '--cols': vehicles.length }}>
            <div className="wl-cmp-label-cell">{f.label}</div>
            {vehicles.map(v => (
              <div key={v.id} className="wl-cmp-value-cell">{f.fmt(v)}</div>
            ))}
          </div>
        ))}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 12 }}>
          {vehicles.map(v => (
            <Link key={v.id} to={`/vehicle/${v.id}`} className="wl-compare-page__view-btn">
              View {v.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/*  Wishlist Page                                                   */
/* ─────────────────────────────────────────────────────────────── */
const Wishlist = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [items,          setItems]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [alert,          setAlert]          = useState(null);
  const [removing,       setRemoving]       = useState(null);
  const [viewMode,       setViewMode]       = useState('grid');
  const [sortBy,         setSortBy]         = useState('newest');
  const [filterType,     setFilterType]     = useState('all');
  const [compareList,    setCompareList]    = useState([]);
  const [showComparePage, setShowComparePage] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/user/wishlist' } }); return; }
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    if (alert) { const t = setTimeout(() => setAlert(null), 4000); return () => clearTimeout(t); }
  }, [alert]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      const list = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.data) ? res.data.data : [];
      setItems(list);
    } catch {
      setAlert({ type: 'error', message: 'Failed to load your wishlist.' });
    } finally { setLoading(false); }
  };

  const handleRemove = async (vehicleId) => {
    setRemoving(vehicleId);
    try {
      await api.delete(`/wishlist/${vehicleId}`);
      setItems(prev => prev.filter(i => {
        const id = i.vehicle_id ?? i.vehicle?.id ?? i.id;
        return String(id) !== String(vehicleId);
      }));
      setCompareList(prev => prev.filter(v => String(v.id) !== String(vehicleId)));
      setAlert({ type: 'info', message: 'Removed from wishlist.' });
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.message || 'Failed to remove item.' });
    } finally { setRemoving(null); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Remove all vehicles from your wishlist?')) return;
    try {
      await Promise.all(items.map(i => {
        const id = i.vehicle_id ?? i.vehicle?.id ?? i.id;
        return api.delete(`/wishlist/${id}`);
      }));
      setItems([]);
      setCompareList([]);
      setAlert({ type: 'info', message: 'Wishlist cleared.' });
    } catch {
      setAlert({ type: 'error', message: 'Failed to clear wishlist.' });
    }
  };

  const handleToggleCompare = (vehicle) => {
    const exists = compareList.some(v => String(v.id) === String(vehicle.id));
    if (exists) {
      setCompareList(prev => prev.filter(v => String(v.id) !== String(vehicle.id)));
    } else {
      if (compareList.length >= 3) { setAlert({ type: 'error', message: 'Maximum 3 vehicles can be compared.' }); return; }
      setCompareList(prev => [...prev, vehicle]);
      setAlert({ type: 'success', message: 'Added to comparison!' });
    }
  };

  const toVehicle = (item) => {
    const base = item.vehicle ? { ...item.vehicle } : { ...item, id: item.vehicle_id ?? item.id };
    const rawColor = item.selected_color;
    if (rawColor) {
      base.selected_color = typeof rawColor === 'string' ? JSON.parse(rawColor) : rawColor;
    }
    base.wishlist_id = item.id;
    return base;
  };

  const processedItems = items
    .map(toVehicle)
    .filter(v => filterType === 'all' || v.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      return (b.id ?? 0) - (a.id ?? 0);
    });

  const counts = {
    all:        items.length,
    car:        items.filter(i => toVehicle(i).type === 'car').length,
    motorcycle: items.filter(i => toVehicle(i).type === 'motorcycle').length,
  };

  const isLightHex = (hex) =>
    ['#f5f5f5','#f0ede8','#fffff0','#e5e4e2','#f5e642','#f5c400','#f7e7ce','#d2b48c','#c2b280','#87ceeb','#c0c0c0'].includes(hex);

  /* ─── Card (grid view) ─── */
  const WishCard = ({ vehicle }) => {
    const isAvailable = vehicle.availability_status === 'available';
    const price       = parseFloat(vehicle.price);
    const thumb       = getColorImage(vehicle);
    const inCompare   = compareList.some(v => String(v.id) === String(vehicle.id));
    const isRemoving  = removing === vehicle.id;
    const color       = vehicle.selected_color;

    return (
      <div className={`wl-card ${isRemoving ? 'wl-card--removing' : ''}`}>
        <Link to={`/vehicle/${vehicle.id}`} className="wl-card__thumb">
          {/* ── Race lines — same animation as Home garage cards ── */}
          <RaceLines />

          {thumb
            ? <img src={thumb} alt={vehicle.name} />
            : <div className="wl-card__thumb-placeholder">
                {vehicle.type === 'car' ? <FaCar /> : <FaMotorcycle />}
              </div>
          }
          <span className={`wl-card__badge wl-card__badge--${isAvailable ? 'available' : 'unavailable'}`}>
            <span className="wl-card__badge-dot" />
            {vehicle.availability_status}
          </span>
          <div className="wl-card__type-tag">
            {vehicle.type === 'car' ? <FaCar /> : <FaMotorcycle />}
            {vehicle.type}
          </div>
        </Link>

        <div className="wl-card__body">
          <Link to={`/vehicle/${vehicle.id}`} className="wl-card__name">{vehicle.name}</Link>

          <div className="wl-card__meta">
            <span>{vehicle.brand}</span>
            <span className="wl-card__meta-dot">·</span>
            <span>{vehicle.year}</span>
            {vehicle.location && (
              <>
                <span className="wl-card__meta-dot">·</span>
                <span className="wl-card__meta-loc"><FaMapMarkerAlt /> {vehicle.location}</span>
              </>
            )}
          </div>

          {color ? (
            <div className="wl-card__color-pill">
              <span
                className="wl-card__color-dot"
                style={{
                  background: color.hex,
                  border: isLightHex(color.hex) ? '1.5px solid rgba(0,0,0,0.2)' : '1.5px solid rgba(255,255,255,0.2)',
                }}
              />
              <FaPalette style={{ fontSize: 9, color: '#e8001d' }} />
              <span>{color.name}</span>
            </div>
          ) : (
            <div className="wl-card__color-pill wl-card__color-pill--none">
              <FaPalette style={{ fontSize: 9 }} /> No color selected
            </div>
          )}

          <div className="wl-card__price">
            <span className="wl-card__price-sym">₱</span>
            {price.toLocaleString()}
          </div>

          <div className="wl-card__actions">
            <Link to={`/vehicle/${vehicle.id}`} className="wl-card__btn wl-card__btn--primary">
              View Details
            </Link>
            <button
              className={`wl-card__btn wl-card__btn--compare ${inCompare ? 'active' : ''}`}
              onClick={() => handleToggleCompare(vehicle)}
              title={inCompare ? 'Remove from compare' : 'Add to compare'}
            >
              <FaBalanceScale />
            </button>
            <button
              className="wl-card__btn wl-card__btn--remove"
              onClick={() => handleRemove(vehicle.id)}
              disabled={isRemoving}
              title="Remove from wishlist"
            >
              {isRemoving ? <span className="wl-spinner" /> : <FaTrashAlt />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ─── Row (list view) ─── */
  const WishRow = ({ vehicle }) => {
    const isAvailable = vehicle.availability_status === 'available';
    const price       = parseFloat(vehicle.price);
    const thumb       = getColorImage(vehicle);
    const inCompare   = compareList.some(v => String(v.id) === String(vehicle.id));
    const isRemoving  = removing === vehicle.id;
    const color       = vehicle.selected_color;

    return (
      <div className={`wl-row ${isRemoving ? 'wl-row--removing' : ''}`}>
        <Link to={`/vehicle/${vehicle.id}`} className="wl-row__thumb">
          {/* ── Race lines for list view thumbnail ── */}
          <RaceLines />
          {thumb
            ? <img src={thumb} alt={vehicle.name} />
            : <div className="wl-row__thumb-placeholder">
                {vehicle.type === 'car' ? <FaCar /> : <FaMotorcycle />}
              </div>
          }
        </Link>
        <div className="wl-row__info">
          <Link to={`/vehicle/${vehicle.id}`} className="wl-row__name">{vehicle.name}</Link>
          <div className="wl-row__meta">
            <span>{vehicle.brand}</span>
            <span className="wl-card__meta-dot">·</span>
            <span>{vehicle.year}</span>
            <span className="wl-card__meta-dot">·</span>
            <span style={{ textTransform: 'capitalize' }}>{vehicle.type}</span>
            {vehicle.location && (
              <>
                <span className="wl-card__meta-dot">·</span>
                <span><FaMapMarkerAlt style={{ marginRight: 3 }} />{vehicle.location}</span>
              </>
            )}
            {color && (
              <>
                <span className="wl-card__meta-dot">·</span>
                <span className="wl-row__color">
                  <span className="wl-row__color-dot" style={{ background: color.hex, border: isLightHex(color.hex) ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.15)' }} />
                  {color.name}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="wl-row__price">
          <span className="wl-card__price-sym">₱</span>{price.toLocaleString()}
        </div>
        <div className={`wl-row__status wl-row__status--${isAvailable ? 'available' : 'unavailable'}`}>
          <span className="wl-card__badge-dot" />
          {vehicle.availability_status}
        </div>
        <div className="wl-row__actions">
          <Link to={`/vehicle/${vehicle.id}`} className="wl-card__btn wl-card__btn--primary" style={{ fontSize: 11, padding: '8px 14px' }}>View</Link>
          <button className={`wl-card__btn wl-card__btn--compare ${inCompare ? 'active' : ''}`} onClick={() => handleToggleCompare(vehicle)}><FaBalanceScale /></button>
          <button className="wl-card__btn wl-card__btn--remove" onClick={() => handleRemove(vehicle.id)} disabled={isRemoving}>
            {isRemoving ? <span className="wl-spinner" /> : <FaTrashAlt />}
          </button>
        </div>
      </div>
    );
  };

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="wl-root">

      {showComparePage && (
        <ComparePage vehicles={compareList} onClose={() => setShowComparePage(false)} />
      )}

      {alert && (
        <div className={`wl-toast wl-toast--${alert.type}`}>
          {alert.type === 'success' ? <FaCheckCircle /> : alert.type === 'info' ? <FaInfoCircle /> : <FaTimesCircle />}
          {alert.message}
        </div>
      )}

      {/* Hero */}
      <div className="wl-hero">
        <div className="wl-hero__grid" />
        <div className="wl-hero__inner">
          <button className="wl-back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Listings
          </button>
          <div className="wl-hero__eyebrow">
            <FaHeart className="wl-hero__heart" /> My Wishlist
          </div>
          <h1 className="wl-hero__title">SAVED VEHICLES</h1>
          <p className="wl-hero__sub">
            {items.length > 0
              ? `${items.length} vehicle${items.length > 1 ? 's' : ''} saved — ready when you are.`
              : 'Your wishlist is empty. Browse listings to save vehicles.'}
          </p>
        </div>
        <div className="wl-hero__stripe" />
      </div>

      {/* Main */}
      <div className="wl-main">
        {loading ? (
          <div className="wl-loading">
            <span className="wl-loading__spinner" />
            <span className="wl-loading__label">Loading Wishlist…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="wl-empty">
            <div className="wl-empty__icon"><FaRegHeart /></div>
            <div className="wl-empty__title">No Saved Vehicles</div>
            <p className="wl-empty__text">
              Browse our inventory and hit <strong>Add to Wishlist</strong> on any vehicle to save it here.
            </p>
            <Link to="/" className="wl-empty__cta">Browse Inventory</Link>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="wl-toolbar">
              <div className="wl-filter-tabs">
                {['all', 'car', 'motorcycle'].map(t => (
                  <button key={t} className={`wl-filter-tab ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
                    {t === 'all' ? 'All' : t === 'car' ? <><FaCar /> Cars</> : <><FaMotorcycle /> Motos</>}
                    <span className="wl-filter-tab__count">{counts[t]}</span>
                  </button>
                ))}
              </div>
              <div className="wl-toolbar__right">
                <div className="wl-sort">
                  <FaSortAmountDown className="wl-sort__icon" />
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="wl-sort__select">
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                  </select>
                </div>
                <div className="wl-view-toggle">
                  <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Grid view"><FaThLarge /></button>
                  <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="List view"><FaList /></button>
                </div>
                {items.length > 0 && (
                  <button className="wl-clear-btn" onClick={handleClearAll}>
                    <FaTrashAlt /> Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="wl-results-label">
              Showing <strong>{processedItems.length}</strong> of <strong>{items.length}</strong> saved vehicles
            </div>

            {processedItems.length === 0 ? (
              <div className="wl-empty" style={{ marginTop: 24 }}>
                <div className="wl-empty__title" style={{ fontSize: 18 }}>No vehicles match this filter</div>
                <button className="wl-empty__cta" style={{ marginTop: 16 }} onClick={() => setFilterType('all')}>Show All</button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="wl-grid">
                {processedItems.map(v => <WishCard key={v.id} vehicle={v} />)}
              </div>
            ) : (
              <div className="wl-list">
                {processedItems.map(v => <WishRow key={v.id} vehicle={v} />)}
              </div>
            )}

            {compareList.length > 0 && (
              <div className="wl-compare-bar">
                <div className="wl-compare-bar__label">
                  <FaBalanceScale style={{ color: '#e8001d' }} />
                  Compare ({compareList.length}/3)
                </div>
                <div className="wl-compare-bar__slots">
                  {[0, 1, 2].map(i => {
                    const v = compareList[i];
                    return (
                      <div key={i} className={`wl-compare-slot ${v ? 'filled' : ''}`}>
                        {v ? (
                          <>
                            {v.images?.[0]?.image_path
                              ? <img src={v.images[0].image_path} alt={v.name} />
                              : <FaCar style={{ color: 'rgba(255,255,255,0.2)' }} />
                            }
                            <div className="wl-compare-slot__info">
                              <span className="wl-compare-slot__name">{v.name}</span>
                              {v.selected_color && (
                                <span className="wl-compare-slot__color">
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.selected_color.hex, display: 'inline-block', flexShrink: 0 }} />
                                  {v.selected_color.name}
                                </span>
                              )}
                            </div>
                            <button onClick={() => setCompareList(prev => prev.filter(x => String(x.id) !== String(v.id)))} className="wl-compare-slot__remove"><FaTimes /></button>
                          </>
                        ) : (
                          <span className="wl-compare-slot__empty">+ Add Vehicle</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="wl-compare-bar__actions">
                  <button
                    className="wl-compare-bar__btn"
                    disabled={compareList.length < 2}
                    onClick={() => setShowComparePage(true)}
                  >
                    Compare Now
                  </button>
                  <button className="wl-compare-bar__clear" onClick={() => setCompareList([])}>Clear</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="wl-footer">
        <div className="wl-footer__inner">
          <div className="wl-footer__top">
            <div className="wl-footer__brand-col">
              <div className="wl-footer__logo">
                <div className="wl-footer__emblem">🏎️</div>
                <span className="wl-footer__brand">VELO<span style={{ color: '#e8001d' }}>MARKET</span></span>
              </div>
              <p className="wl-footer__tagline">Your trusted vehicle reservation dealership. Browse, reserve online, then visit us to complete your dream.</p>
              <div className="wl-footer__socials">
                <a href="#" className="wl-social-icon" aria-label="Facebook"><FaFacebook /></a>
                <a href="#" className="wl-social-icon" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" className="wl-social-icon" aria-label="Twitter"><FaTwitter /></a>
                <a href="#" className="wl-social-icon" aria-label="YouTube"><FaYoutube /></a>
              </div>
            </div>
            <div className="wl-footer__about-col">
              <h4 className="wl-footer__col-title">About Us</h4>
              <p className="wl-footer__about-text">Essak VeloMarket is a premier vehicle dealership specializing in cars and motorcycles. We offer an online reservation system so you can secure your vehicle before visiting our showroom.</p>
            </div>
            <div className="wl-footer__contact-col">
              <h4 className="wl-footer__col-title">Contact</h4>
              <div className="wl-footer__contact-item"><FaPhone className="wl-footer__contact-icon" /><span>+1 (800) 835-6627</span></div>
              <div className="wl-footer__contact-item"><FaEnvelope className="wl-footer__contact-icon" /><span>info@velomarket.com</span></div>
              <div className="wl-footer__contact-item"><FaMapMarkerAlt className="wl-footer__contact-icon" /><span>123 Speedway Blvd, Motor City, MC 40001</span></div>
            </div>
          </div>
          <div className="wl-footer__bottom">
            <span>© 2026 Essak. All rights reserved.</span>
            <div className="wl-footer__links">
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

export default Wishlist;