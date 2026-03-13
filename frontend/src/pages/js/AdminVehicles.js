import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import {
  FaPlus, FaEdit, FaTrash, FaCar, FaMotorcycle, FaSearch,
  FaImage, FaTimes, FaCheck, FaPalette, FaTag,
  FaSnowflake, FaBluetooth, FaCamera, FaParking, FaShieldAlt,
  FaWrench, FaGasPump, FaTachometerAlt, FaUsb, FaVolumeUp,
  FaKey, FaLock, FaRoad, FaWifi, FaSun, FaAdjust,
  FaChargingStation, FaAngleDoubleUp, FaFire, FaCompressAlt,
  FaBoxes,
} from 'react-icons/fa';
import { MdElectricBike, MdAirlineSeatReclineExtra, MdLocalParking } from 'react-icons/md';
import '../css/AdminVehicles.css';

/* ─── Feature presets ───────────────────────────────────────────────────────── */
const CAR_FEATURES = [
  { key: 'climate',       icon: <FaSnowflake />,               label: 'Climate Control' },
  { key: 'bluetooth',     icon: <FaBluetooth />,               label: 'Bluetooth' },
  { key: 'camera360',     icon: <FaCamera />,                  label: '360° Camera' },
  { key: 'parkassist',    icon: <FaParking />,                 label: 'Park Assist' },
  { key: 'laneassist',    icon: <FaShieldAlt />,               label: 'Lane Assist' },
  { key: 'sportexhaust',  icon: <FaWrench />,                  label: 'Sport Exhaust' },
  { key: 'sunroof',       icon: <FaSun />,                     label: 'Sunroof / Moonroof' },
  { key: 'heatedseats',   icon: <FaFire />,                    label: 'Heated Seats' },
  { key: 'keylessentry',  icon: <FaKey />,                     label: 'Keyless Entry' },
  { key: 'pushstart',     icon: <FaKey />,                     label: 'Push Start' },
  { key: 'reversecam',    icon: <FaCamera />,                  label: 'Reverse Camera' },
  { key: 'cruisecontrol', icon: <FaRoad />,                    label: 'Cruise Control' },
  { key: 'wifi',          icon: <FaWifi />,                    label: 'Built-in Wi-Fi' },
  { key: 'usb',           icon: <FaUsb />,                     label: 'USB Charging' },
  { key: 'navigation',    icon: <FaAdjust />,                  label: 'GPS Navigation' },
  { key: 'blindspot',     icon: <FaShieldAlt />,               label: 'Blind Spot Monitor' },
  { key: 'autoemerbrake', icon: <FaCompressAlt />,             label: 'Auto Emergency Brake' },
  { key: 'powerwindow',   icon: <FaAngleDoubleUp />,           label: 'Power Windows' },
  { key: 'leatherseats',  icon: <MdAirlineSeatReclineExtra />, label: 'Leather Seats' },
  { key: 'soundsystem',   icon: <FaVolumeUp />,                label: 'Premium Sound System' },
  { key: 'turbo',         icon: <FaTachometerAlt />,           label: 'Turbocharged Engine' },
  { key: 'ev',            icon: <FaChargingStation />,         label: 'Electric / Hybrid' },
];

const MOTORCYCLE_FEATURES = [
  { key: 'abs',          icon: <FaShieldAlt />,    label: 'ABS Brakes' },
  { key: 'traction',     icon: <FaRoad />,          label: 'Traction Control' },
  { key: 'bluetooth',    icon: <FaBluetooth />,     label: 'Bluetooth Helmet Sync' },
  { key: 'quickshift',   icon: <FaWrench />,        label: 'Quickshifter' },
  { key: 'ridingmodes',  icon: <FaAdjust />,        label: 'Riding Modes' },
  { key: 'keyless',      icon: <FaKey />,           label: 'Keyless Ignition' },
  { key: 'tft',          icon: <FaCamera />,        label: 'TFT Display' },
  { key: 'cruise',       icon: <FaRoad />,          label: 'Cruise Control' },
  { key: 'led',          icon: <FaSun />,           label: 'Full LED Lighting' },
  { key: 'usb',          icon: <FaUsb />,           label: 'USB Charging Port' },
  { key: 'launch',       icon: <FaFire />,          label: 'Launch Control' },
  { key: 'wheelie',      icon: <FaTachometerAlt />, label: 'Wheelie Control' },
  { key: 'cornering',    icon: <FaCompressAlt />,   label: 'Cornering ABS' },
  { key: 'handguards',   icon: <FaLock />,          label: 'Hand Guards' },
  { key: 'panniers',     icon: <MdLocalParking />,  label: 'Panniers / Saddlebags' },
  { key: 'heated_grips', icon: <FaSnowflake />,     label: 'Heated Grips' },
  { key: 'ev',           icon: <MdElectricBike />,  label: 'Electric Motor' },
  { key: 'slipper',      icon: <FaWrench />,        label: 'Slipper Clutch' },
];

/* ─── Color palette ─────────────────────────────────────────────────────────── */
const COLOR_PALETTE = [
  { name: 'Midnight Black',  hex: '#1a1a1a' },
  { name: 'Pearl White',     hex: '#f0ede8' },
  { name: 'Silver',          hex: '#c0c0c0' },
  { name: 'Crimson Red',     hex: '#dc143c' },
  { name: 'Racing Red',      hex: '#e8001d' },
  { name: 'Cobalt Blue',     hex: '#0047ab' },
  { name: 'Sky Blue',        hex: '#87ceeb' },
  { name: 'Navy',            hex: '#001f5b' },
  { name: 'Forest Green',    hex: '#228b22' },
  { name: 'Emerald',         hex: '#50c878' },
  { name: 'Champagne Gold',  hex: '#f7e7ce' },
  { name: 'Matte Gold',      hex: '#f5c400' },
  { name: 'Bronze',          hex: '#cd7f32' },
  { name: 'Titanium Gray',   hex: '#808080' },
  { name: 'Platinum',        hex: '#e5e4e2' },
  { name: 'Burnt Orange',    hex: '#f97316' },
  { name: 'Burgundy',        hex: '#800020' },
  { name: 'Purple',          hex: '#a855f7' },
  { name: 'Sand Beige',      hex: '#c2b280' },
  { name: 'Matte Black',     hex: '#28282b' },
];

const LIGHT_COLORS = ['#f0ede8','#c0c0c0','#87ceeb','#f7e7ce','#f5c400','#e5e4e2','#c2b280','#50c878'];
const isLight = (hex) => LIGHT_COLORS.includes(hex);

/* ─── Toast ─────────────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`av-toast ${type}`}>
      {type === 'success' ? <FaCheck /> : <FaTimes />}
      {msg}
    </div>
  );
}

/* ─── Confirm Dialog ─────────────────────────────────────────────────────────── */
function ConfirmDialog({ title, text, onConfirm, onCancel }) {
  return (
    <div className="av-confirm-backdrop">
      <div className="av-confirm-box">
        <div className="av-confirm-icon">⚠️</div>
        <div className="av-confirm-title">{title}</div>
        <div className="av-confirm-text">{text}</div>
        <div className="av-confirm-actions">
          <button className="av-btn av-btn-primary" onClick={onConfirm}>Confirm</button>
          <button className="av-btn av-btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Color Picker Modal — now includes a stock input ───────────────────────── */
function ColorPickerModal({ imagePreview, imageName, existingColor, onConfirm, onSkip }) {
  const [selected, setSelected] = useState(existingColor?.name ? existingColor : null);
  // stock for this specific color variant — default to existingColor.stock or 1
  const [colorStock, setColorStock] = useState(
    existingColor?.stock != null ? existingColor.stock : 1
  );

  const handleConfirm = () => {
    if (selected) {
      onConfirm({ ...selected, stock: Math.max(1, parseInt(colorStock, 10) || 1) });
    } else {
      onConfirm(null);
    }
  };

  return (
    <div className="av-confirm-backdrop" style={{ zIndex: 1200 }}>
      <div className="av-color-modal">
        <div className="av-color-modal-header">
          <div className="av-color-modal-title">
            <FaPalette style={{ color: '#e8001d' }} />
            Tag Image Color &amp; Stock
          </div>
          <p className="av-color-modal-sub">
            Select the color variant this image represents, then set how many units are in stock for this color.
          </p>
        </div>

        {/* Preview */}
        <div className="av-color-modal-preview">
          <img src={imagePreview} alt={imageName} className="av-color-modal-img" />
          <div className="av-color-modal-filename">{imageName}</div>
        </div>

        {/* Color grid */}
        <div className="av-color-grid">
          {COLOR_PALETTE.map(c => {
            const isSel = selected?.name === c.name;
            return (
              <button key={c.name} title={c.name} onClick={() => setSelected(isSel ? null : c)}
                className={`av-color-swatch-btn ${isSel ? 'selected' : ''}`}
                style={{
                  '--swatch-color': c.hex,
                  '--swatch-border': isLight(c.hex) ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                }}>
                <span className="av-color-dot" />
                <span className="av-color-dot-label">{c.name}</span>
                {isSel && <FaCheck className="av-color-check" />}
              </button>
            );
          })}
        </div>

        {/* ── Stock input — only shown when a color is selected ── */}
        {selected && (
          <div className="av-color-stock-row">
            <div className="av-color-stock-preview">
              <span
                className="av-color-stock-dot"
                style={{
                  background: selected.hex,
                  border: isLight(selected.hex) ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.15)',
                }}
              />
              <span className="av-color-stock-name">{selected.name}</span>
            </div>
            <div className="av-color-stock-input-wrap">
              <FaBoxes style={{ color: '#e8001d', fontSize: 12 }} />
              <label className="av-color-stock-label">Units in stock</label>
              <div className="av-color-stock-stepper">
                <button
                  type="button"
                  className="av-stock-step-btn"
                  onClick={() => setColorStock(v => Math.max(1, (parseInt(v, 10) || 1) - 1))}
                >−</button>
                <input
                  type="number"
                  min="1"
                  max="999"
                  className="av-stock-step-input"
                  value={colorStock}
                  onChange={e => setColorStock(Math.max(1, parseInt(e.target.value, 10) || 1))}
                />
                <button
                  type="button"
                  className="av-stock-step-btn"
                  onClick={() => setColorStock(v => Math.min(999, (parseInt(v, 10) || 1) + 1))}
                >+</button>
              </div>
            </div>
          </div>
        )}

        <div className="av-color-modal-actions">
          <button className="av-btn av-btn-ghost" onClick={onSkip}>Skip / No Color</button>
          <button className="av-btn av-btn-primary" onClick={handleConfirm}>
            {selected
              ? `Tag as "${selected.name}" · ${colorStock} unit${colorStock !== 1 ? 's' : ''}`
              : 'Confirm (No Tag)'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Selector ──────────────────────────────────────────────────────── */
function FeatureSelector({ vehicleType, selected, onChange }) {
  const features = vehicleType === 'motorcycle' ? MOTORCYCLE_FEATURES : CAR_FEATURES;
  const toggle = (key) => {
    const next = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];
    onChange(next);
  };
  return (
    <div className="av-features-grid">
      {features.map(f => {
        const active = selected.includes(f.key);
        return (
          <button type="button" key={f.key}
            className={`av-feature-btn ${active ? 'active' : ''}`}
            onClick={() => toggle(f.key)}>
            <span className="av-feature-icon">{f.icon}</span>
            <span className="av-feature-label">{f.label}</span>
            {active && <FaCheck className="av-feature-check" />}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Empty form ────────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  id: '', name: '', type: 'car', brand: '',
  year: new Date().getFullYear(), price: '',
  description: '', location: '',
  latitude: '', longitude: '',
  availability_status: 'available',
};

/* ─── Main Component ────────────────────────────────────────────────────────── */
const AdminVehicles = () => {
  const [vehicles, setVehicles]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [formData, setFormData]     = useState(EMPTY_FORM);

  // images: [{file, preview, color: {name, hex, stock} | null, name}]
  const [imageItems, setImageItems]         = useState([]);
  const [colorPickerIdx, setColorPickerIdx] = useState(null);

  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const [dragOver, setDragOver]         = useState(false);
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy]             = useState('id');
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState(null);
  const [confirmDel, setConfirmDel]     = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* ── stats ── */
  const totalVehicles = vehicles.length;
  const available     = vehicles.filter(v => v.availability_status === 'available').length;
  const reserved      = vehicles.filter(v => v.availability_status === 'reserved').length;
  const sold          = vehicles.filter(v => v.availability_status === 'sold').length;
  const totalStock    = vehicles.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
  const avgPrice      = vehicles.length
    ? Math.round(vehicles.reduce((a, v) => a + parseFloat(v.price || 0), 0) / vehicles.length)
    : 0;

  /* ── filter / sort ── */
  const filtered = vehicles
    .filter(v => {
      const q = search.toLowerCase();
      const matchQ = !q || v.name?.toLowerCase().includes(q) || v.brand?.toLowerCase().includes(q);
      const matchT = !filterType   || v.type === filterType;
      const matchS = !filterStatus || v.availability_status === filterStatus;
      return matchQ && matchT && matchS;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === 'year_desc')  return b.year - a.year;
      if (sortBy === 'name')       return a.name?.localeCompare(b.name);
      return b.id - a.id;
    });

  /* ── image add: queue color picker for each new image ── */
  const addFiles = (files) => {
    const arr = Array.from(files);
    const newItems = [];
    let processed = 0;
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = e => {
        newItems.push({ file, preview: e.target.result, color: null, name: file.name });
        processed++;
        if (processed === arr.length) {
          setImageItems(prev => {
            const startIdx = prev.length;
            const updated = [...prev, ...newItems];
            setColorPickerIdx(startIdx);
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /* ── color confirmed for current image ── */
  const handleColorConfirm = (color) => {
    setImageItems(prev => {
      const updated = prev.map((item, i) =>
        i === colorPickerIdx ? { ...item, color } : item
      );
      // find next untagged image after current
      const nextIdx = updated.findIndex((item, i) => i > colorPickerIdx && item.color === null);
      setColorPickerIdx(nextIdx !== -1 ? nextIdx : null);
      return updated;
    });
  };

  const handleColorSkip = () => {
    setImageItems(prev => {
      const nextIdx = prev.findIndex((item, i) => i > colorPickerIdx && item.color === null);
      setColorPickerIdx(nextIdx !== -1 ? nextIdx : null);
      return prev;
    });
  };

  const removeImage = (idx) => {
    setImageItems(prev => prev.filter((_, i) => i !== idx));
    if (colorPickerIdx === idx) setColorPickerIdx(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  /* ── form change ── */
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'type') setSelectedFeatures([]);
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Build colors array from tagged images — deduplicated, stock summed per color
      const colorMap = {};
      imageItems.forEach(item => {
        if (!item.color) return;
        const key = item.color.name;
        if (!colorMap[key]) {
          colorMap[key] = { ...item.color, stock: parseInt(item.color.stock, 10) || 1 };
        } else {
          // If same color tagged on multiple images, sum stock
          colorMap[key].stock += parseInt(item.color.stock, 10) || 1;
        }
      });
      const colors = Object.values(colorMap);

      // Total stock = sum of all color stocks (or 1 if no colors tagged)
      const totalStock = colors.length > 0
        ? colors.reduce((sum, c) => sum + c.stock, 0)
        : 1;

      const payload = {
        ...formData,
        features: selectedFeatures,
        colors,
        color_variants: colors,
        stock: totalStock,
      };
      delete payload.id;

      let vehicleId = formData.id;

      if (editMode) {
        await api.put(`/vehicles/${formData.id}`, payload);
        showToast('Vehicle updated successfully!');
      } else {
        const res = await api.post('/vehicles', payload);
        vehicleId = res.data?.id ?? res.data?.vehicle?.id ?? res.data?.data?.id;
        showToast('Vehicle created successfully!');
      }

      // Upload images with color + stock metadata
      if (imageItems.length > 0 && vehicleId) {
        const imgForm = new FormData();
        imageItems.forEach((item, i) => {
          imgForm.append('images', item.file);
          if (item.color) {
            imgForm.append(`image_color_${i}`, JSON.stringify(item.color));
          }
        });
        imgForm.append('colors', JSON.stringify(colors));
        try {
          await api.post(`/vehicles/${vehicleId}/images`, imgForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch {
          showToast('Vehicle saved but image upload failed. Add images via edit.', 'error');
          resetForm(); fetchVehicles();
          return;
        }
      }

      resetForm(); fetchVehicles();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Unknown server error';
      showToast('Error: ' + msg, 'error');
    } finally { setSaving(false); }
  };

  const handleEdit = (v) => {
    setFormData({
      id: v.id, name: v.name, type: v.type, brand: v.brand,
      year: v.year, price: v.price, description: v.description || '',
      location: v.location || '', latitude: v.latitude || '',
      longitude: v.longitude || '', availability_status: v.availability_status,
    });
    setImageItems([]);
    setSelectedFeatures(v.features || []);
    setEditMode(true); setShowForm(true);
  };

  const handleDelete = (id) => setConfirmDel(id);

  const confirmDelete = async () => {
    try {
      await api.delete(`/vehicles/${confirmDel}`);
      showToast('Vehicle deleted.');
      fetchVehicles();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error deleting vehicle.';
      showToast(msg, 'error');
    } finally {
      setConfirmDel(null);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setImageItems([]); setColorPickerIdx(null);
    setSelectedFeatures([]);
    setEditMode(false); setShowForm(false);
  };

  /* ── derived: tagged colors with their stocks ── */
  const taggedColors = Object.values(
    imageItems
      .filter(i => i.color)
      .reduce((acc, i) => {
        const key = i.color.name;
        if (!acc[key]) acc[key] = { ...i.color, stock: parseInt(i.color.stock, 10) || 1 };
        else acc[key].stock += parseInt(i.color.stock, 10) || 1;
        return acc;
      }, {})
  );

  const totalTaggedStock = taggedColors.reduce((sum, c) => sum + c.stock, 0);

  return (
    <div className="av-page">
      <div className="av-container">

        {/* ── HEADER ── */}
        <div className="av-header">
          <div className="av-header-left">
            <span className="av-header-sup">Admin Panel</span>
            <h1 className="av-header-title">Vehicle Management</h1>
          </div>
          <div className="av-header-actions">
            <button className="av-btn av-btn-ghost" onClick={fetchVehicles}>↺ Refresh</button>
            <button className="av-btn av-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
              <FaPlus /> Add Vehicle
            </button>
          </div>
        </div>

        {/* ── STATS — added Total Stock tile ── */}
        <div className="av-stats">
          <div className="av-stat">
            <span className="av-stat-val">{totalVehicles}</span>
            <span className="av-stat-label">Total Listings</span>
          </div>
          <div className="av-stat av-stat-stock">
            <span className="av-stat-val">{totalStock}</span>
            <span className="av-stat-label">Total Units</span>
          </div>
          <div className="av-stat">
            <span className="av-stat-val">{available}</span>
            <span className="av-stat-label">Available</span>
          </div>
          <div className="av-stat">
            <span className="av-stat-val">{reserved}</span>
            <span className="av-stat-label">Reserved</span>
          </div>
          <div className="av-stat av-stat-sold">
            <span className="av-stat-val">{sold}</span>
            <span className="av-stat-label">Sold</span>
          </div>
          <div className="av-stat av-stat-price">
            <span className="av-stat-val">₱{avgPrice.toLocaleString()}</span>
            <span className="av-stat-label">Avg. Price</span>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="av-toolbar">
          <div className="av-search-wrap">
            <span className="av-search-icon"><FaSearch size={12} /></span>
            <input className="av-search" placeholder="Search by name or brand…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="av-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="car">Cars</option>
            <option value="motorcycle">Motorcycles</option>
          </select>
          <select className="av-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
          <select className="av-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="id">Newest First</option>
            <option value="name">Name A–Z</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="year_desc">Year ↓</option>
          </select>
          {(search || filterType || filterStatus) && (
            <button className="av-btn av-btn-ghost"
              onClick={() => { setSearch(''); setFilterType(''); setFilterStatus(''); }}>
              <FaTimes /> Clear
            </button>
          )}
        </div>

        {/* ── TABLE ── */}
        {loading ? <div className="av-loader" /> : (
          <div className="av-table-wrap">
            <table className="av-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Colors</th>
                  <th>Features</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={11}>
                    <div className="av-empty">
                      <div className="av-empty-icon">🏎️</div>
                      <p>No vehicles found</p>
                    </div>
                  </td></tr>
                ) : filtered.map(v => {
                  const vColors   = v.colors || v.color_variants || [];
                  const vFeatures = v.features || [];
                  const vStock    = parseInt(v.stock, 10) || 0;
                  const allFeatures = v.type === 'motorcycle' ? MOTORCYCLE_FEATURES : CAR_FEATURES;
                  return (
                    <tr key={v.id}>
                      <td className="av-td-id">#{v.id}</td>
                      <td>
                        <div className="av-vehicle-cell">
                          {v.images?.length > 0
                            ? <img src={v.images[0].image_path} className="av-thumb" alt=""
                                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                            : null}
                          <div className="av-thumb-placeholder"
                            style={{ display: v.images?.length > 0 ? 'none' : 'flex' }}>
                            {v.type === 'car' ? <FaCar /> : <FaMotorcycle />}
                          </div>
                          <div>
                            <div className="av-vehicle-name">{v.name}</div>
                            <div className="av-vehicle-brand">{v.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`av-type-badge ${v.type}`}>
                          {v.type === 'car' ? <FaCar size={9} /> : <FaMotorcycle size={9} />}
                          {v.type}
                        </span>
                      </td>
                      <td className="av-td-year">{v.year}</td>
                      <td>
                        <span className="av-price">
                          <span className="av-price-sym">₱</span>
                          {parseFloat(v.price).toLocaleString()}
                        </span>
                      </td>

                      {/* Colors column — now shows per-color stock on hover via title */}
                      <td>
                        {vColors.length > 0 ? (
                          <div className="av-color-dots-row">
                            {vColors.slice(0, 5).map(c => (
                              <span
                                key={c.name}
                                title={`${c.name}${c.stock != null ? ` · ${c.stock} unit${c.stock !== 1 ? 's' : ''}` : ''}`}
                                className="av-color-dot-table"
                                style={{
                                  background: c.hex,
                                  border: isLight(c.hex) ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.12)',
                                }}
                              />
                            ))}
                            {vColors.length > 5 && (
                              <span className="av-color-more">+{vColors.length - 5}</span>
                            )}
                          </div>
                        ) : <span className="av-td-none">—</span>}
                      </td>

                      {/* Features column */}
                      <td>
                        {vFeatures.length > 0 ? (
                          <div className="av-features-pills-row">
                            {vFeatures.slice(0, 3).map(fkey => {
                              const f = allFeatures.find(ff => ff.key === fkey);
                              return f ? (
                                <span key={fkey} className="av-feature-pill" title={f.label}>
                                  {f.icon}
                                </span>
                              ) : null;
                            })}
                            {vFeatures.length > 3 && (
                              <span className="av-feature-more">+{vFeatures.length - 3}</span>
                            )}
                          </div>
                        ) : <span className="av-td-none">—</span>}
                      </td>

                      {/* ── Stock column ── */}
                      <td>
                        <div className="av-stock-cell">
                          <span className={`av-stock-badge ${vStock === 0 ? 'out' : vStock <= 2 ? 'low' : 'ok'}`}>
                            {vStock === 0 ? '✕ Out' : `${vStock} unit${vStock !== 1 ? 's' : ''}`}
                          </span>
                          {/* Per-color breakdown tooltip if colors have stock */}
                          {vColors.length > 0 && vColors.some(c => c.stock != null) && (
                            <div className="av-stock-breakdown">
                              {vColors.map(c => (
                                <div key={c.name} className="av-stock-breakdown-row">
                                  <span
                                    className="av-stock-breakdown-dot"
                                    style={{
                                      background: c.hex,
                                      border: isLight(c.hex) ? '1px solid rgba(0,0,0,0.2)' : '1px solid transparent',
                                    }}
                                  />
                                  <span className="av-stock-breakdown-name">{c.name}</span>
                                  <span className={`av-stock-breakdown-qty ${(c.stock || 0) === 0 ? 'zero' : ''}`}>
                                    {c.stock ?? '—'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className={`av-status-badge ${v.availability_status}`}>
                          {v.availability_status}
                        </span>
                      </td>
                      <td className="av-td-location">{v.location || '—'}</td>
                      <td>
                        <div className="av-actions">
                          <button className="av-icon-btn edit" title="Edit" onClick={() => handleEdit(v)}>
                            <FaEdit size={11} />
                          </button>
                          <button className="av-icon-btn delete" title="Delete" onClick={() => handleDelete(v.id)}>
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > 0 && (
              <div className="av-table-footer">
                Showing {filtered.length} of {totalVehicles} vehicles · {totalStock} total units in stock
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showForm && (
        <div className="av-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="av-modal">
            <div className="av-modal-header">
              <span className="av-modal-title">{editMode ? '✏️ Edit Vehicle' : '＋ New Vehicle'}</span>
              <button className="av-modal-close" onClick={resetForm}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="av-modal-body">

                {/* BASIC INFO */}
                <div className="av-form-section">
                  <div className="av-form-section-title">Basic Info</div>
                  <div className="av-form-row">
                    <div className="av-form-group">
                      <label className="av-label">Vehicle Name *</label>
                      <input className="av-input" name="name" value={formData.name}
                        onChange={handleChange} placeholder="e.g. Honda CBR1000RR" required />
                    </div>
                    <div className="av-form-group">
                      <label className="av-label">Type *</label>
                      <select className="av-select" name="type" value={formData.type}
                        onChange={handleChange} required>
                        <option value="car">🚗 Car</option>
                        <option value="motorcycle">🏍️ Motorcycle</option>
                      </select>
                    </div>
                    <div className="av-form-group">
                      <label className="av-label">Brand *</label>
                      <input className="av-input" name="brand" value={formData.brand}
                        onChange={handleChange} placeholder="e.g. Honda" required />
                    </div>
                    <div className="av-form-group">
                      <label className="av-label">Year *</label>
                      <input className="av-input" type="number" name="year" value={formData.year}
                        onChange={handleChange} min="1900" max="2030" required />
                    </div>
                  </div>
                </div>

                {/* PRICING & STATUS */}
                <div className="av-form-section">
                  <div className="av-form-section-title">Pricing & Status</div>
                  <div className="av-form-row">
                    <div className="av-form-group">
                      <label className="av-label">Price (₱) *</label>
                      <input className="av-input av-input-price" type="number" name="price"
                        value={formData.price} onChange={handleChange}
                        placeholder="e.g. 2500000" required />
                    </div>
                    <div className="av-form-group">
                      <label className="av-label">Availability</label>
                      <select className="av-select" name="availability_status"
                        value={formData.availability_status} onChange={handleChange}>
                        <option value="available">✅ Available</option>
                        <option value="reserved">🟡 Reserved</option>
                        <option value="sold">🔴 Sold</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="av-form-section">
                  <div className="av-form-section-title">Description</div>
                  <div className="av-form-group full">
                    <label className="av-label">Description</label>
                    <textarea className="av-textarea" name="description"
                      value={formData.description} onChange={handleChange}
                      placeholder="Vehicle details, condition, highlights…" rows={3} />
                  </div>
                </div>

                {/* FEATURES */}
                <div className="av-form-section">
                  <div className="av-form-section-title">
                    <FaTag />
                    {formData.type === 'motorcycle' ? 'Motorcycle' : 'Car'} Features
                    {selectedFeatures.length > 0 && (
                      <span className="av-features-count">{selectedFeatures.length} selected</span>
                    )}
                  </div>
                  <p className="av-features-hint">
                    Click to toggle features this vehicle has. These will display on the vehicle detail page.
                  </p>
                  <FeatureSelector
                    vehicleType={formData.type}
                    selected={selectedFeatures}
                    onChange={setSelectedFeatures}
                  />
                  {selectedFeatures.length > 0 && (
                    <button type="button" className="av-btn-link"
                      onClick={() => setSelectedFeatures([])}>
                      Clear all features
                    </button>
                  )}
                </div>

                {/* LOCATION */}
                <div className="av-form-section">
                  <div className="av-form-section-title">Location</div>
                  <div className="av-form-row">
                    <div className="av-form-group full">
                      <label className="av-label">Location Name</label>
                      <input className="av-input" name="location" value={formData.location}
                        onChange={handleChange} placeholder="e.g. Davao City, PH" />
                    </div>
                    <div className="av-form-group">
                      <label className="av-label">Latitude</label>
                      <input className="av-input" type="number" step="any" name="latitude"
                        value={formData.latitude} onChange={handleChange} placeholder="7.0707" />
                    </div>
                    <div className="av-form-group">
                      <label className="av-label">Longitude</label>
                      <input className="av-input" type="number" step="any" name="longitude"
                        value={formData.longitude} onChange={handleChange} placeholder="125.6087" />
                    </div>
                  </div>
                </div>

                {/* IMAGES */}
                <div className="av-form-section">
                  <div className="av-form-section-title">
                    <FaImage />
                    Images, Color Variants &amp; Stock
                    {taggedColors.length > 0 && (
                      <span className="av-features-count">
                        {taggedColors.length} color{taggedColors.length > 1 ? 's' : ''} · {totalTaggedStock} units total
                      </span>
                    )}
                  </div>
                  <p className="av-features-hint">
                    After uploading, you'll tag each image with its color variant and set how many units
                    of that color are in stock. Total stock is calculated automatically.
                  </p>

                  {/* Tagged color + stock preview */}
                  {taggedColors.length > 0 && (
                    <div className="av-tagged-colors-preview">
                      {taggedColors.map(c => (
                        <div key={c.name} className="av-tagged-color-item">
                          <span className="av-tagged-color-dot"
                            style={{
                              background: c.hex,
                              border: isLight(c.hex) ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.15)',
                            }} />
                          <span className="av-tagged-color-name">{c.name}</span>
                          <span className="av-tagged-color-stock">× {c.stock}</span>
                        </div>
                      ))}
                      <div className="av-tagged-total">
                        <FaBoxes style={{ fontSize: 10 }} /> Total: {totalTaggedStock} unit{totalTaggedStock !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  <div
                    className={`av-upload-area ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="av-upload-icon">📸</div>
                    <div className="av-upload-text">Drag & drop images here</div>
                    <div className="av-upload-sub">
                      PNG, JPG, WEBP — You'll tag each image with its color variant and stock count
                    </div>
                    <div className="av-upload-btn" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                      <FaImage size={10} /> Browse Files
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" multiple
                      className="av-upload-input"
                      onChange={e => addFiles(e.target.files)} />
                  </div>

                  {imageItems.length > 0 && (
                    <div className="av-image-previews">
                      {imageItems.map((item, i) => {
                        const light = item.color && isLight(item.color.hex);
                        return (
                          <div className="av-preview-item" key={i}>
                            <img src={item.preview} className="av-preview-img" alt="" />
                            {item.color ? (
                              <div className="av-preview-color-tag"
                                style={{
                                  background: item.color.hex,
                                  color: light ? '#111' : '#fff',
                                  border: light ? '1px solid rgba(0,0,0,0.15)' : 'none',
                                }}>
                                {item.color.name}
                                {item.color.stock != null && (
                                  <span className="av-preview-stock-badge">×{item.color.stock}</span>
                                )}
                              </div>
                            ) : (
                              <div className="av-preview-color-tag av-preview-no-color"
                                onClick={e => { e.stopPropagation(); setColorPickerIdx(i); }}>
                                + Tag Color
                              </div>
                            )}
                            <button type="button" className="av-preview-remove"
                              onClick={() => removeImage(i)}>×</button>
                            {item.color && (
                              <button type="button" className="av-preview-retag"
                                title="Change color / stock"
                                onClick={e => { e.stopPropagation(); setColorPickerIdx(i); }}>
                                <FaPalette size={9} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              <div className="av-modal-footer">
                <button type="button" className="av-btn av-btn-ghost" onClick={resetForm}>Cancel</button>
                <button type="submit" className="av-btn av-btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving…' : editMode ? '✓ Update Vehicle' : '＋ Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COLOR PICKER MODAL ── */}
      {colorPickerIdx !== null && imageItems[colorPickerIdx] && (
        <ColorPickerModal
          imagePreview={imageItems[colorPickerIdx].preview}
          imageName={imageItems[colorPickerIdx].name}
          existingColor={imageItems[colorPickerIdx].color}
          onConfirm={handleColorConfirm}
          onSkip={handleColorSkip}
        />
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmDel && (
        <ConfirmDialog
          title="Delete Vehicle?"
          text="This action cannot be undone. The vehicle and all its images will be permanently removed."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* ── TOAST ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminVehicles;