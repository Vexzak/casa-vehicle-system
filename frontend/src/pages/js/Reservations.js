import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  FaCar, FaMotorcycle, FaCalendarAlt, FaClock, FaTimesCircle,
  FaCheckCircle, FaInfoCircle, FaMapMarkerAlt, FaChevronRight,
  FaTimes, FaExclamationTriangle, FaCheckDouble, FaRegSadTear,
  FaRedo, FaShieldAlt, FaTag, FaArrowLeft,
  FaFacebook, FaInstagram, FaTwitter, FaYoutube,
  FaPhone, FaEnvelope, FaPalette, FaTrash,
} from 'react-icons/fa';

const CANCEL_REASONS = [
  { id: 'changed_mind',  icon: '🤔', label: 'Changed My Mind',       desc: 'I decided I no longer want this vehicle.' },
  { id: 'better_option', icon: '🔍', label: 'Found a Better Option',  desc: 'I found another vehicle that suits me better.' },
  { id: 'financial',     icon: '💸', label: 'Financial Reasons',      desc: 'My budget or financial situation has changed.' },
  { id: 'too_long',      icon: '⏳', label: 'Wait Time Too Long',     desc: 'I cannot visit the dealership within 10 days.' },
  { id: 'wrong_vehicle', icon: '🚗', label: 'Wrong Vehicle Selected', desc: 'I accidentally reserved the wrong vehicle.' },
  { id: 'other',         icon: '📝', label: 'Other Reason',           desc: 'Something else not listed here.' },
];

/* ─── Cancel Modal ─────────────────────────────────────────────────────────── */
const CancelModal = ({ reservation, onClose, onConfirm, loading }) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [customNote, setCustomNote]         = useState('');
  const [step, setStep]                     = useState(1);
  const canProceed = selectedReason && (selectedReason !== 'other' || customNote.trim().length > 3);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:800,
      background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'20px',
    }} onClick={onClose}>
      <div style={{
        background:'#111', borderTop:'4px solid #e8001d',
        width:'100%', maxWidth:520, position:'relative',
        animation:'resv-modal-in 0.35s cubic-bezier(0.34,1.4,0.64,1)',
        boxShadow:'0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:'24px 28px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, background:'rgba(232,0,29,0.12)', border:'1px solid rgba(232,0,29,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#e8001d', fontSize:20, flexShrink:0 }}>
            <FaExclamationTriangle />
          </div>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:'#fff', letterSpacing:'0.05em', lineHeight:1 }}>CANCEL RESERVATION</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginTop:4 }}>
              {reservation?.vehicle?.name || 'Vehicle'}
            </div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:18, cursor:'pointer', padding:4 }}>
            <FaTimes />
          </button>
        </div>

        {step === 1 ? (
          <>
            <div style={{ padding:'24px 28px 20px' }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ display:'inline-block', width:14, height:2, background:'#e8001d' }} />
                Why are you cancelling?
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                {CANCEL_REASONS.map(r => (
                  <button key={r.id} onClick={() => setSelectedReason(r.id)} style={{
                    display:'flex', alignItems:'center', gap:14, padding:'12px 16px',
                    background: selectedReason === r.id ? 'rgba(232,0,29,0.1)' : 'rgba(255,255,255,0.03)',
                    border: selectedReason === r.id ? '1.5px solid rgba(232,0,29,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
                    cursor:'pointer', textAlign:'left', transition:'all 0.18s',
                    borderLeft: selectedReason === r.id ? '3px solid #e8001d' : '3px solid transparent',
                  }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color: selectedReason === r.id ? '#fff' : 'rgba(255,255,255,0.65)', marginBottom:2 }}>{r.label}</div>
                      <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.4 }}>{r.desc}</div>
                    </div>
                    {selectedReason === r.id && <FaCheckCircle style={{ marginLeft:'auto', color:'#e8001d', flexShrink:0 }} />}
                  </button>
                ))}
              </div>
              {selectedReason === 'other' && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>Tell us more (required)</div>
                  <textarea value={customNote} onChange={e => setCustomNote(e.target.value)} rows={3}
                    placeholder="Please describe your reason..."
                    style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.05)', border:`1.5px solid ${customNote.trim().length > 3 ? 'rgba(232,0,29,0.4)' : 'rgba(255,255,255,0.1)'}`, color:'#fff', fontFamily:"'Barlow',sans-serif", fontSize:13, resize:'none', outline:'none', boxSizing:'border-box' }}
                  />
                </div>
              )}
            </div>
            <div style={{ padding:'0 28px 28px', display:'flex', gap:10 }}>
              <button onClick={onClose} style={{ flex:1, padding:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Keep Reservation</button>
              <button onClick={() => setStep(2)} disabled={!canProceed} style={{ flex:1, padding:'12px', background: canProceed ? '#e8001d' : 'rgba(255,255,255,0.05)', border:'none', color: canProceed ? '#fff' : 'rgba(255,255,255,0.2)', fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor: canProceed ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>Continue →</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding:'28px 28px 20px' }}>
              <div style={{ background:'rgba(232,0,29,0.06)', border:'1px solid rgba(232,0,29,0.2)', borderLeft:'3px solid #e8001d', padding:'16px 18px', marginBottom:20 }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:10 }}>Reservation Summary</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, color:'rgba(255,255,255,0.45)' }}>Vehicle</span>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, color:'#fff' }}>{reservation?.vehicle?.name}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, color:'rgba(255,255,255,0.45)' }}>Reason</span>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, color:'#e8001d' }}>{CANCEL_REASONS.find(r => r.id === selectedReason)?.label}</span>
                </div>
                {customNote.trim() && (
                  <div style={{ marginTop:10, padding:'10px', background:'rgba(255,255,255,0.04)', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:12, color:'rgba(255,255,255,0.45)', fontStyle:'italic' }}>"{customNote.trim()}"</div>
                  </div>
                )}
              </div>
              <div style={{ background:'rgba(245,196,0,0.06)', border:'1px solid rgba(245,196,0,0.2)', padding:'14px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                <FaInfoCircle style={{ color:'#f5c400', flexShrink:0, marginTop:2 }} />
                <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.6, margin:0 }}>
                  This action <strong style={{ color:'#fff' }}>cannot be undone</strong>. The vehicle will become available for other customers immediately.
                </p>
              </div>
            </div>
            <div style={{ padding:'0 28px 28px', display:'flex', gap:10 }}>
              <button onClick={() => setStep(1)} style={{ padding:'12px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>← Back</button>
              <button onClick={() => onConfirm(selectedReason, customNote)} disabled={loading} style={{ flex:1, padding:'12px', background:'#e8001d', border:'none', color:'#fff', fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading
                  ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'resv-spin 0.6s linear infinite' }} /> Cancelling…</>
                  : <><FaTimesCircle style={{ fontSize:13 }} /> Confirm Cancellation</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Delete Modal ──────────────────────────────────────────────────────────── */
const DeleteModal = ({ reservation, onClose, onConfirm, loading }) => (
  <div style={{
    position:'fixed', inset:0, zIndex:800,
    background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
    display:'flex', alignItems:'center', justifyContent:'center', padding:'20px',
  }} onClick={onClose}>
    <div style={{
      background:'#111', borderTop:'4px solid #e8001d',
      width:'100%', maxWidth:420, position:'relative',
      animation:'resv-modal-in 0.35s cubic-bezier(0.34,1.4,0.64,1)',
      boxShadow:'0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
    }} onClick={e => e.stopPropagation()}>

      <div style={{ padding:'24px 28px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:44, height:44, background:'rgba(232,0,29,0.12)', border:'1px solid rgba(232,0,29,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#e8001d', fontSize:20, flexShrink:0 }}>
          <FaTrash />
        </div>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:'#fff', letterSpacing:'0.05em', lineHeight:1 }}>DELETE RECORD</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginTop:4 }}>
            {reservation?.vehicle?.name || 'Vehicle'}
          </div>
        </div>
        <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:18, cursor:'pointer', padding:4 }}>
          <FaTimes />
        </button>
      </div>

      <div style={{ padding:'24px 28px 20px' }}>
        <div style={{ background:'rgba(232,0,29,0.06)', border:'1px solid rgba(232,0,29,0.2)', borderLeft:'3px solid #e8001d', padding:'14px 16px', marginBottom:16, display:'flex', gap:10, alignItems:'flex-start' }}>
          <FaExclamationTriangle style={{ color:'#e8001d', flexShrink:0, marginTop:2 }} />
          <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6, margin:0 }}>
            This will permanently remove this reservation from your history. This action <strong style={{ color:'#fff' }}>cannot be undone</strong>.
          </p>
        </div>
      </div>

      <div style={{ padding:'0 28px 28px', display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, padding:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Keep It</button>
        <button onClick={onConfirm} disabled={loading} style={{ flex:1, padding:'12px', background:'#e8001d', border:'none', color:'#fff', fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading
            ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'resv-spin 0.6s linear infinite' }} /> Deleting…</>
            : <><FaTrash style={{ fontSize:12 }} /> Yes, Delete</>}
        </button>
      </div>
    </div>
  </div>
);

/* ─── Race Lines ────────────────────────────────────────────────────────────── */
const RaceLines = () => (
  <div className="resv-race-lines" aria-hidden="true">
    {[...Array(8)].map((_, i) => <span key={i} />)}
  </div>
);

/* ─── Helper: parse a color field that may be a string or object ─────────────── */
const parseColor = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw;
};

/* ─── Helper: given a vehicle + reserved color, return the best image src ────── */
const resolveImageSrc = (vehicle, reservedColor) => {
  const images = vehicle?.images;
  if (!images || images.length === 0) return null;

  if (reservedColor?.name) {
    const colorMatch = images.find(img => {
      const c = parseColor(img.color);
      return c?.name === reservedColor.name;
    });
    if (colorMatch) return colorMatch.image_path;
  }

  return images[0].image_path || null;
};

/* ─── Reservation Card ─────────────────────────────────────────────────────── */
const ReservationCard = ({ reservation, onCancel, onDelete }) => {
  const navigate = useNavigate();
  const v        = reservation.vehicle || {};

  const reservedColor = parseColor(reservation.selected_color);
  const imgSrc        = resolveImageSrc(v, reservedColor);

  const isActive    = reservation.status === 'active' || reservation.status === 'pending';
  const isCancelled = reservation.status === 'cancelled';
  const isExpired   = reservation.status === 'expired';
  const isDeletable = isCancelled || isExpired;

  const statusCfg = {
    active:    { color:'#10b981', bg:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.4)',  label:'Active',    icon:<FaCheckCircle /> },
    pending:   { color:'#10b981', bg:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.4)',  label:'Active',    icon:<FaCheckCircle /> },
    cancelled: { color:'#ff6b7a', bg:'rgba(232,0,29,0.12)',    border:'rgba(232,0,29,0.4)',    label:'Cancelled', icon:<FaTimesCircle /> },
    expired:   { color:'#f5c400', bg:'rgba(245,196,0,0.12)',   border:'rgba(245,196,0,0.4)',   label:'Expired',   icon:<FaClock /> },
    completed: { color:'#60a5fa', bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.4)',  label:'Completed', icon:<FaCheckDouble /> },
  };
  const cfg = statusCfg[reservation.status] || statusCfg.pending;

  const reservedDate = reservation.created_at
    ? new Date(reservation.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
    : '—';

  const expiryDate = (reservation.expires_at || reservation.expiry_date)
    ? new Date(reservation.expires_at || reservation.expiry_date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
    : null;

  const daysLeft = (() => {
    if (!isActive) return null;
    const exp = reservation.expires_at || reservation.expiry_date;
    if (!exp) return null;
    const diff = Math.ceil((new Date(exp) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const isLightHex = (hex) =>
    ['#f5f5f5','#f0ede8','#fffff0','#e5e4e2','#f5e642','#f5c400','#f7e7ce','#d2b48c','#c2b280','#87ceeb','#c0c0c0'].includes(hex);

  return (
    <div className="resv-card" style={{
      background:'#111',
      borderTop:`3px solid ${isActive ? '#e8001d' : isCancelled ? '#3a1212' : '#222'}`,
      borderLeft:`3px solid ${isActive ? '#e8001d' : isCancelled ? '#3a1212' : '#222'}`,
      position:'relative', overflow:'hidden',
      opacity: isCancelled || isExpired ? 0.8 : 1,
      transition:'transform 0.25s ease, box-shadow 0.25s ease',
      boxShadow:'0 4px 24px rgba(0,0,0,0.25)',
    }}>
      {isActive && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#e8001d,#f5c400,#e8001d)', zIndex:5 }} />
      )}

      <div style={{ display:'flex', gap:0, position:'relative', zIndex:3 }}>

        {/* ── Image ── */}
        <div className="resv-card-img-wrap" style={{
          width:200, flexShrink:0, position:'relative', overflow:'hidden',
          background: isCancelled
            ? 'radial-gradient(ellipse at 65% 55%, #1a0a0a 0%, #0d0d0d 50%, #080808 100%)'
            : 'radial-gradient(ellipse at 65% 55%, #221010 0%, #131313 50%, #0a0a0a 100%)',
          minHeight: 160,
        }}>
          <RaceLines />
          <div className="resv-img-spotlight" style={{
            position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
            background:`
              radial-gradient(ellipse 75% 65% at 62% 58%,
                rgba(232,0,29,${isCancelled ? '0.10' : '0.22'}) 0%,
                rgba(200,60,0,0.08) 38%,
                transparent 68%),
              radial-gradient(ellipse 40% 30% at 62% 80%,
                rgba(232,0,29,0.08) 0%,
                transparent 70%)`,
          }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:40, zIndex:2, pointerEvents:'none', background:'linear-gradient(to top, rgba(232,0,29,0.13) 0%, transparent 100%)', animation:'resv-img-floor 3.2s ease-in-out infinite' }} />

          {imgSrc ? (
            <img src={imgSrc} alt={v.name} className="resv-card-img" style={{ width:'100%', height:'100%', minHeight:160, objectFit:'cover', filter: isCancelled ? 'grayscale(70%) brightness(0.6)' : 'brightness(0.88)', transition:'transform 0.5s, filter 0.4s', display:'block', position:'relative', zIndex:3 }} />
          ) : (
            <div style={{ width:'100%', minHeight:160, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.1)', fontSize:48, position:'relative', zIndex:3 }}>
              {v.type === 'motorcycle' ? <FaMotorcycle /> : <FaCar />}
            </div>
          )}

          <div style={{ position:'absolute', bottom:8, left:8, zIndex:4, display:'flex', alignItems:'center', gap:5, background:'rgba(0,0,0,0.85)', padding:'4px 10px', borderLeft:'2px solid #e8001d' }}>
            <span style={{ color:'#e8001d', fontSize:10 }}>{v.type === 'motorcycle' ? <FaMotorcycle /> : <FaCar />}</span>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)' }}>{v.type || 'Vehicle'}</span>
          </div>

          {reservedColor?.name && (
            <div style={{ position:'absolute', top:8, left:8, zIndex:4, display:'flex', alignItems:'center', gap:5, background:'rgba(0,0,0,0.88)', border:`1px solid ${reservedColor.hex ? `${reservedColor.hex}55` : 'rgba(255,255,255,0.15)'}`, borderLeft: reservedColor.hex ? `2px solid ${reservedColor.hex}` : '2px solid rgba(255,255,255,0.3)', padding:'3px 8px' }}>
              {reservedColor.hex && (
                <span style={{ width:9, height:9, borderRadius:'50%', background: reservedColor.hex, border: isLightHex(reservedColor.hex) ? '1px solid rgba(0,0,0,0.25)' : '1px solid rgba(255,255,255,0.2)', display:'inline-block', flexShrink:0 }} />
              )}
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.75)', whiteSpace:'nowrap' }}>
                {reservedColor.name}
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{ flex:1, padding:'22px 26px', display:'flex', flexDirection:'column', gap:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:'#fff', letterSpacing:'0.04em', lineHeight:1, marginBottom:5 }}>
                {v.name || 'Unknown Vehicle'}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {[v.brand, v.year].filter(Boolean).map((m, i) => (
                  <React.Fragment key={i}>
                    <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)' }}>{m}</span>
                    {i === 0 && <span style={{ color:'rgba(255,255,255,0.15)', fontSize:10 }}>◆</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', flexShrink:0 }}>
              <span style={{ fontSize:10 }}>{cfg.icon}</span>
              {cfg.label}
            </div>
          </div>

          {/* Meta */}
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <FaCalendarAlt style={{ color:'#e8001d', fontSize:11 }} />
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:600, letterSpacing:'0.06em' }}>Reserved {reservedDate}</span>
            </div>
            {expiryDate && (
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <FaClock style={{ color: daysLeft !== null && daysLeft <= 2 ? '#f5c400' : 'rgba(255,255,255,0.3)', fontSize:11 }} />
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, color: daysLeft !== null && daysLeft <= 2 ? '#f5c400' : 'rgba(255,255,255,0.5)', fontWeight:600, letterSpacing:'0.06em' }}>
                  {isActive ? `Expires ${expiryDate}` : `Was due ${expiryDate}`}
                </span>
              </div>
            )}
            {v.location && (
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <FaMapMarkerAlt style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }} />
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:600, letterSpacing:'0.06em' }}>{v.location}</span>
              </div>
            )}
            {reservedColor?.name && (
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <FaPalette style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }} />
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  {reservedColor.hex && (
                    <span style={{ width:10, height:10, borderRadius:'50%', background: reservedColor.hex, border: isLightHex(reservedColor.hex) ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.2)', display:'inline-block', flexShrink:0 }} />
                  )}
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:600, letterSpacing:'0.06em' }}>
                    {reservedColor.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Price + Days Left / Cancel reason */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:4 }}>Vehicle Price</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, color:'#fff', letterSpacing:'0.03em', lineHeight:1 }}>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:700, color:'#e8001d', marginRight:2 }}>₱</span>
                {parseFloat(v.price || 0).toLocaleString()}
              </div>
            </div>

            {isActive && daysLeft !== null && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', background: daysLeft <= 2 ? 'rgba(245,196,0,0.1)' : 'rgba(16,185,129,0.1)', border:`1px solid ${daysLeft <= 2 ? 'rgba(245,196,0,0.4)' : 'rgba(16,185,129,0.3)'}`, borderLeft:`3px solid ${daysLeft <= 2 ? '#f5c400' : '#10b981'}` }}>
                <FaClock style={{ color: daysLeft <= 2 ? '#f5c400' : '#34d399', fontSize:14 }} />
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color: daysLeft <= 2 ? '#f5c400' : '#34d399', lineHeight:1 }}>{daysLeft} {daysLeft === 1 ? 'DAY' : 'DAYS'}</div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>remaining</div>
                </div>
              </div>
            )}

            {isCancelled && reservation.cancel_reason && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:'rgba(232,0,29,0.06)', border:'1px solid rgba(232,0,29,0.2)', borderLeft:'3px solid rgba(232,0,29,0.5)' }}>
                <FaTimesCircle style={{ color:'rgba(232,0,29,0.7)', fontSize:12 }} />
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)' }}>
                  {CANCEL_REASONS.find(r => r.id === reservation.cancel_reason)?.label || reservation.cancel_reason}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions sidebar ── */}
        <div style={{ width:150, flexShrink:0, borderLeft:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column' }}>
          <button onClick={() => navigate(`/vehicle/${v.id}`)} className="resv-action-btn" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(255,255,255,0.03)', border:'none', borderBottom:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:'16px 10px', transition:'all 0.2s', fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            <FaChevronRight style={{ fontSize:15 }} />
            View Vehicle
          </button>

          {isActive ? (
            /* Cancel — only for active reservations */
            <button onClick={() => onCancel(reservation)} className="resv-cancel-btn" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(232,0,29,0.04)', border:'none', color:'rgba(232,0,29,0.65)', cursor:'pointer', padding:'16px 10px', transition:'all 0.2s', fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              <FaTimesCircle style={{ fontSize:15 }} />
              Cancel
            </button>
          ) : isDeletable ? (
            /* Delete — for cancelled or expired reservations */
            <button onClick={() => onDelete(reservation)} className="resv-delete-btn" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(232,0,29,0.04)', border:'none', color:'rgba(232,0,29,0.5)', cursor:'pointer', padding:'16px 10px', transition:'all 0.2s', fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              <FaTrash style={{ fontSize:13 }} />
              Delete
            </button>
          ) : (
            /* Browse more — for completed */
            <button onClick={() => navigate('/')} className="resv-action-btn" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(255,255,255,0.02)', border:'none', color:'rgba(255,255,255,0.25)', cursor:'pointer', padding:'16px 10px', transition:'all 0.2s', fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              <FaRedo style={{ fontSize:13 }} />
              Browse More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ───────────────────────────────────────────────────────── */
const Reservations = () => {
  const { user }                          = useAuth();
  const navigate                          = useNavigate();
  const [reservations, setReservations]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [cancelTarget, setCancelTarget]   = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alert, setAlert]                 = useState(null);
  const [filter, setFilter]               = useState('all');
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => { if (!user) { navigate('/login'); return; } fetchReservations(); }, [user]);
  useEffect(() => {
    if (alert) { const t = setTimeout(() => setAlert(null), 4500); return () => clearTimeout(t); }
  }, [alert]);

const fetchReservations = async () => {
  try {
    setLoading(true);
    const res = await api.get('/reservations/my');
    const deleted = JSON.parse(localStorage.getItem('deletedReservations') || '[]');
    setReservations(res.data.filter(r => !deleted.includes(r.id)));
  } catch {
    setAlert({ type:'error', message:'Failed to load reservations.' });
  } finally { setLoading(false); }
};
  const handleCancelConfirm = async (reason, note) => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await api.patch(`/reservations/${cancelTarget.id}/cancel`, {
        cancel_reason: reason,
        cancel_note: note || null,
      });
      setReservations(prev =>
        prev.map(r => r.id === cancelTarget.id
          ? { ...r, status:'cancelled', cancel_reason: reason, cancel_note: note }
          : r
        )
      );
      setCancelSuccess(true);
      setTimeout(() => { setCancelSuccess(false); setCancelTarget(null); }, 2400);
    } catch (e) {
      setAlert({ type:'error', message: e.response?.data?.message || 'Failed to cancel reservation.' });
      setCancelTarget(null);
    } finally { setCancelLoading(false); }
  };

const handleDeleteConfirm = async () => {
  if (!deleteTarget) return;
  setDeleteLoading(true);
  try {
    const deleted = JSON.parse(localStorage.getItem('deletedReservations') || '[]');
    deleted.push(deleteTarget.id);
    localStorage.setItem('deletedReservations', JSON.stringify(deleted));

    setReservations(prev => prev.filter(r => r.id !== deleteTarget.id));
    setDeleteTarget(null);
    setAlert({ type:'success', message:'Reservation removed from your history.' });
  } catch (e) {
    setAlert({ type:'error', message:'Failed to delete reservation.' });
  } finally { setDeleteLoading(false); }
};

  const filters = [
    { id:'all',       label:'All',       count: reservations.length },
    { id:'active',    label:'Active',    count: reservations.filter(r => r.status==='active'||r.status==='pending').length },
    { id:'cancelled', label:'Cancelled', count: reservations.filter(r => r.status==='cancelled').length },
    { id:'expired',   label:'Expired',   count: reservations.filter(r => r.status==='expired').length },
    { id:'completed', label:'Completed', count: reservations.filter(r => r.status==='completed').length },
  ];

  const filtered = reservations.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'active') return r.status === 'active' || r.status === 'pending';
    return r.status === filter;
  });

  const activeCount = reservations.filter(r => r.status==='active'||r.status==='pending').length;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');

    @keyframes resv-spin         { to { transform: rotate(360deg); } }
    @keyframes resv-streak       { 0%{transform:translateX(0);opacity:0} 8%{opacity:1} 88%{opacity:.9} 100%{transform:translateX(320%);opacity:0} }
    @keyframes resv-fade-in      { from{opacity:0} to{opacity:1} }
    @keyframes resv-slide-up     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes resv-modal-in     { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes resv-toast-in     { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
    @keyframes resv-card-in      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes resv-check-pop    { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
    @keyframes resv-pulse-red    { 0%,100%{box-shadow:0 0 0 0 rgba(232,0,29,0.4)} 50%{box-shadow:0 0 0 10px rgba(232,0,29,0)} }
    @keyframes resv-road         { from{background-position:0 0,0 0} to{background-position:0 200px,0 0} }

    @keyframes resv-card-speed-rush {
      0%   { transform: translateX(0);    opacity: 0; }
      8%   { opacity: 1; }
      88%  { opacity: 0.85; }
      100% { transform: translateX(280%); opacity: 0; }
    }
    @keyframes resv-img-spotlight {
      0%, 100% { opacity: 0.75; transform: scale(1); }
      50%       { opacity: 1;   transform: scale(1.06) translateX(3px); }
    }
    @keyframes resv-img-floor {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }
    @keyframes adSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes adBarFill { from{width:0% !important} }

    .resv-race-lines {
      position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
    }
    .resv-race-lines span {
      position: absolute; left: -60%; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(232,0,29,0.55), rgba(255,180,0,0.3), transparent);
      animation: resv-card-speed-rush linear infinite;
      border-radius: 1px;
    }
    .resv-race-lines span:nth-child(1) { top: 18%; width: 55%; animation-duration: 1.4s; animation-delay: 0.0s; opacity: 0.9; }
    .resv-race-lines span:nth-child(2) { top: 30%; width: 40%; animation-duration: 1.1s; animation-delay: 0.3s; opacity: 0.6; height: 1.5px; }
    .resv-race-lines span:nth-child(3) { top: 44%; width: 65%; animation-duration: 1.7s; animation-delay: 0.7s; opacity: 0.7; }
    .resv-race-lines span:nth-child(4) { top: 57%; width: 45%; animation-duration: 1.2s; animation-delay: 0.1s; opacity: 0.5; }
    .resv-race-lines span:nth-child(5) { top: 68%; width: 50%; animation-duration: 1.5s; animation-delay: 0.5s; opacity: 0.8; height: 1.5px; }
    .resv-race-lines span:nth-child(6) { top: 80%; width: 35%; animation-duration: 1.0s; animation-delay: 0.9s; opacity: 0.4; }
    .resv-race-lines span:nth-child(7) { top: 10%; width: 30%; animation-duration: 1.9s; animation-delay: 0.2s; opacity: 0.5; }
    .resv-race-lines span:nth-child(8) { top: 90%; width: 42%; animation-duration: 1.3s; animation-delay: 0.6s; opacity: 0.6; }

    .resv-img-spotlight { animation: resv-img-spotlight 3.2s ease-in-out infinite; }

    .resv-card:hover .resv-race-lines span    { animation-duration: 0.6s !important; opacity: 1 !important; }
    .resv-card:hover .resv-card-img-wrap      { background: radial-gradient(ellipse at 65% 55%, #2e1010 0%, #181010 50%, #0d0a0a 100%) !important; }
    .resv-card:hover .resv-img-spotlight      { opacity: 1; animation: none;
      background:
        radial-gradient(ellipse 85% 75% at 62% 58%, rgba(232,0,29,0.32) 0%, rgba(200,60,0,0.14) 38%, transparent 68%),
        radial-gradient(ellipse 50% 35% at 62% 82%, rgba(232,0,29,0.15) 0%, transparent 70%) !important;
    }
    .resv-card:hover .resv-card-img           { transform: scale(1.06) !important; filter: brightness(1.0) !important; }
    .resv-card:hover { transform: translateY(-3px) !important; box-shadow: 0 16px 48px rgba(0,0,0,0.35) !important; }
    .resv-action-btn:hover { background: rgba(255,255,255,0.09) !important; color: #fff !important; }
    .resv-cancel-btn:hover { background: rgba(232,0,29,0.16) !important; color: #ff6b7a !important; }
    .resv-delete-btn:hover { background: rgba(232,0,29,0.18) !important; color: #ff4455 !important; }

    .resv-footer { background: #080808; border-top: 3px solid #e8001d; margin-top: 0; }
    .resv-footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
    .resv-footer-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 60px; padding: 56px 0 48px; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .resv-footer-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
    .resv-footer-emblem { width: 38px; height: 38px; background: #e8001d; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
    .resv-footer-brand { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #fff; letter-spacing: 0.08em; }
    .resv-footer-tagline { font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 300; line-height: 1.65; color: rgba(255,255,255,0.4); margin-bottom: 24px; }
    .resv-footer-socials { display: flex; gap: 10px; }
    .resv-social-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 14px; text-decoration: none; clip-path: polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%); transition: all 0.2s; }
    .resv-social-icon:hover { background: #e8001d; border-color: #e8001d; color: #fff; }
    .resv-footer-col-title { font-family: 'Bebas Neue', sans-serif; font-size: 19px; letter-spacing: 0.06em; color: #fff; margin-bottom: 18px; margin-top: 0; }
    .resv-footer-about-text { font-family: 'Barlow', sans-serif; font-size: 13px; line-height: 1.7; font-weight: 300; color: rgba(255,255,255,0.4); margin: 0; }
    .resv-footer-contact-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.4); }
    .resv-footer-contact-icon { color: #e8001d; font-size: 13px; margin-top: 2px; flex-shrink: 0; }
    .resv-footer-bottom { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.25); }
    .resv-footer-bottom-links { display: flex; gap: 24px; }
    .resv-footer-bottom-links a { color: rgba(255,255,255,0.25); text-decoration: none; transition: color 0.2s; }
    .resv-footer-bottom-links a:hover { color: #e8001d; }
    @media (max-width: 900px) {
      .resv-footer-top { grid-template-columns: 1fr 1fr; gap: 36px; }
      .resv-footer-brand-col { grid-column: 1 / -1; }
    }
    @media (max-width: 600px) {
      .resv-footer-top { grid-template-columns: 1fr; gap: 28px; padding: 36px 0 28px; }
      .resv-footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
    }

    .resv-stat-card {
      position: relative; background: #111; padding: 24px 22px 20px; overflow: hidden;
      clip-path: polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .resv-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--accent) inset; }
    .resv-stat-card::before { content: ''; position: absolute; top: -60%; left: -60%; width: 50%; height: 200%; background: linear-gradient(105deg, transparent, rgba(255,255,255,0.03) 50%, transparent); transform: rotate(20deg); transition: left 0.5s ease; pointer-events: none; }
    .resv-stat-card:hover::before { left: 120%; }
    .resv-stat-icon { width: 46px; height: 46px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--accent); position: relative; z-index: 1; clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%); }
    .resv-stat-icon-glow { position: absolute; inset: -4px; background: var(--accent); opacity: 0.12; filter: blur(12px); border-radius: 50%; pointer-events: none; }
    .resv-stat-bar { height: 3px; background: rgba(255,255,255,0.06); overflow: hidden; margin-top: 14px; }
    .resv-stat-bar-fill { height: 100%; background: var(--accent); animation: adBarFill 1.4s cubic-bezier(0.34,1.2,0.64,1) both; }
    .resv-stat-corner { position: absolute; bottom: 14px; right: 0; width: 50px; height: 50px; background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.025) 50%); pointer-events: none; }
  `;

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f4f4f4', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{styles}</style>
      <div style={{ width:40, height:40, border:'3px solid rgba(0,0,0,0.08)', borderTopColor:'#e8001d', borderRadius:'50%', animation:'resv-spin 0.6s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f0f0f0', fontFamily:"'Barlow',sans-serif" }}>
      <style>{styles}</style>

      {/* ── Cancel Modal ── */}
      {cancelTarget && !cancelSuccess && (
        <CancelModal reservation={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancelConfirm} loading={cancelLoading} />
      )}

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteModal reservation={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} loading={deleteLoading} />
      )}

      {/* ── Cancel Success ── */}
      {cancelSuccess && (
        <div style={{ position:'fixed', inset:0, zIndex:900, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ textAlign:'center', animation:'resv-slide-up 0.3s ease' }}>
            <div style={{ width:82, height:82, borderRadius:'50%', background:'rgba(16,185,129,0.15)', border:'2px solid rgba(16,185,129,0.45)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', animation:'resv-check-pop 0.4s ease' }}>
              <FaCheckDouble style={{ fontSize:36, color:'#34d399' }} />
            </div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:34, color:'#fff', letterSpacing:'0.05em', marginBottom:8 }}>Reservation Cancelled</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>The vehicle is now available to others</div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {alert && (
        <div style={{
          position:'fixed', top:80, right:24, zIndex:500, display:'flex', alignItems:'center', gap:10, padding:'13px 20px',
          fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
          boxShadow:'0 8px 32px rgba(0,0,0,0.35)', animation:'resv-toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          ...(alert.type === 'success'
            ? { background:'#0d2a1a', borderLeft:'3px solid #10b981', color:'#34d399' }
            : { background:'#2a0a0a', borderLeft:'3px solid #e8001d', color:'#ff6b7a' })
        }}>
          {alert.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
          {alert.message}
        </div>
      )}

      {/* ── Hero ── */}
      <div style={{ position:'relative', background:'#0a0a0a', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:`repeating-linear-gradient(180deg,transparent 0px,transparent 28px,rgba(232,0,29,0.06) 28px,rgba(232,0,29,0.06) 30px), repeating-linear-gradient(90deg,transparent 0px,transparent 20px,rgba(255,255,255,0.015) 20px,rgba(255,255,255,0.015) 21px)`, backgroundSize:'100% 200px, 60px 100%', animation:'resv-road 2s linear infinite' }} />
        {[
          { top:'15%', w:'40%', dur:'1.6s', del:'0s',   op:.55 },
          { top:'32%', w:'55%', dur:'1.2s', del:'0.4s', op:.32 },
          { top:'50%', w:'30%', dur:'2.0s', del:'0.8s', op:.45 },
          { top:'65%', w:'48%', dur:'1.4s', del:'0.2s', op:.38 },
          { top:'80%', w:'36%', dur:'1.8s', del:'0.6s', op:.5  },
        ].map((s, i) => (
          <div key={i} style={{ position:'absolute', left:'-60%', height:'1px', top:s.top, width:s.w, background:'linear-gradient(90deg,transparent,rgba(232,0,29,0.55),rgba(255,180,0,0.2),transparent)', animation:`resv-streak ${s.dur} linear infinite`, animationDelay:s.del, opacity:s.op }} />
        ))}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#e8001d 25%,#f5c400 50%,#e8001d 75%,transparent)', zIndex:5 }} />
        <div style={{ position:'relative', zIndex:3, padding:'36px 48px 52px', animation:'resv-fade-in 0.6s ease' }}>
          <button onClick={() => navigate('/')} style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.65)', fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'7px 16px', cursor:'pointer', marginBottom:20, transition:'all 0.2s' }}>
            <FaArrowLeft style={{ fontSize:11 }} /> Back to Listings
          </button>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(232,0,29,0.15)', border:'1px solid rgba(232,0,29,0.3)', borderLeft:'3px solid #e8001d', padding:'5px 14px', marginBottom:14 }}>
            <FaCalendarAlt style={{ color:'#e8001d', fontSize:11 }} />
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.8)' }}>My Reservations</span>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:20, flexWrap:'wrap' }}>
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(40px,5.5vw,72px)', color:'#fff', letterSpacing:'0.04em', lineHeight:1, margin:0, textShadow:'0 2px 20px rgba(0,0,0,0.5)' }}>
              YOUR GARAGE
            </h1>
            {activeCount > 0 && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 18px', background:'rgba(232,0,29,0.15)', border:'1px solid rgba(232,0,29,0.45)', animation:'resv-pulse-red 2.5s infinite' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#e8001d', display:'inline-block', flexShrink:0 }} />
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#ff8a95' }}>
                  {activeCount} Active {activeCount === 1 ? 'Reservation' : 'Reservations'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'36px 28px 80px' }}>

        {/* Stats Bar */}
        {reservations.length > 0 && (() => {
          const statCards = [
            { label:'Total',     val: reservations.length,                                                          icon:<FaCalendarAlt />, accent:'#e8001d', sub:'All time'        },
            { label:'Active',    val: reservations.filter(r=>r.status==='active'||r.status==='pending').length,     icon:<FaCheckCircle />, accent:'#10b981', sub:'Pending visit'   },
            { label:'Completed', val: reservations.filter(r=>r.status==='completed').length,                        icon:<FaCheckDouble />, accent:'#3b82f6', sub:'Purchased'       },
            { label:'Cancelled', val: reservations.filter(r=>r.status==='cancelled').length,                        icon:<FaTimesCircle />, accent:'#e8001d', sub:'Released back'   },
          ];
          return (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:3, marginBottom:28, background:'#0a0a0a', padding:3, boxShadow:'0 4px 24px rgba(0,0,0,0.2)' }}>
              {statCards.map((s, i) => (
                <div key={s.label} className="resv-stat-card"
                  style={{ '--accent': s.accent, animationDelay:`${i*0.08}s`, animation:'adSlideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both', borderTop:`3px solid ${s.accent}` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ position:'relative', width:46, height:46 }}>
                      <div className="resv-stat-icon">{s.icon}</div>
                      <div className="resv-stat-icon-glow" />
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:46, color:'#fff', letterSpacing:'0.03em', lineHeight:1, marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:11, color:'rgba(255,255,255,0.25)' }}>{s.sub}</div>
                  <div className="resv-stat-bar">
                    <div className="resv-stat-bar-fill" style={{ width:`${Math.min(100, (s.val || 0) / Math.max(reservations.length, 1) * 100)}%`, animationDelay:`${i*0.08}s` }} />
                  </div>
                  <div className="resv-stat-corner" />
                </div>
              ))}
            </div>
          );
        })()}

        {/* Filter Tabs */}
        {reservations.length > 0 && (
          <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap' }}>
            {filters.map(f => {
              const isActive = filter === f.id;
              return (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', background: isActive ? '#e8001d' : '#1a1a1a', border: `1.5px solid ${isActive ? '#e8001d' : 'rgba(255,255,255,0.1)'}`, color: isActive ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', boxShadow: isActive ? '0 4px 16px rgba(232,0,29,0.4)' : '0 2px 8px rgba(0,0,0,0.15)' }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='#252525'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='#1a1a1a'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}}>
                  <span style={{ width:6, height:6, borderRadius:'50%', flexShrink:0, background: isActive ? '#fff' : 'rgba(255,255,255,0.2)', display:'inline-block', transition:'background 0.2s' }} />
                  {f.label}
                  {f.count > 0 && (
                    <span style={{ padding:'2px 8px', fontSize:11, fontWeight:700, background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)', color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                      {f.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Reservation List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'90px 20px', animation:'resv-fade-in 0.5s ease' }}>
            <div style={{ fontSize:60, marginBottom:20, opacity:0.15 }}>🏁</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:34, color:'#1a1a1a', letterSpacing:'0.05em', marginBottom:10 }}>
              {filter==='all' ? 'No Reservations Yet' : `No ${filter} reservations`}
            </div>
            <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9ca3af', marginBottom:28 }}>
              {filter==='all' ? 'Reserve a vehicle to see it here' : `You have no ${filter} reservations`}
            </p>
            <button onClick={() => navigate('/')} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 30px', background:'#e8001d', border:'none', color:'#fff', fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', boxShadow:'0 4px 20px rgba(232,0,29,0.4)' }}>
              <FaCar style={{ fontSize:14 }} /> Browse Vehicles
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map((r, i) => (
              <div key={r.id} style={{ animation:'resv-card-in 0.4s ease forwards', animationDelay:`${i*0.06}s`, opacity:0 }}>
                <ReservationCard reservation={r} onCancel={setCancelTarget} onDelete={setDeleteTarget} />
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        {reservations.length > 0 && (
          <div style={{ marginTop:32, padding:'18px 24px', background:'#111', border:'1px solid rgba(245,196,0,0.2)', borderLeft:'4px solid #f5c400', display:'flex', gap:14, alignItems:'flex-start', animation:'resv-fade-in 0.6s ease', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
            <FaInfoCircle style={{ color:'#f5c400', fontSize:18, flexShrink:0, marginTop:2 }} />
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#f5c400', marginBottom:5 }}>How It Works</div>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:13, lineHeight:1.7, color:'rgba(255,255,255,0.5)', margin:0 }}>
                Active reservations hold your vehicle for <strong style={{ color:'#fff' }}>10 days</strong>. Visit the dealership within this window to complete your purchase. Cancelled or expired reservations release the vehicle back to the public listing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="resv-footer">
        <div className="resv-footer-inner">
          <div className="resv-footer-top">
            <div className="resv-footer-brand-col">
              <div className="resv-footer-logo">
                <div className="resv-footer-emblem">🏎️</div>
                <span className="resv-footer-brand">VELO<span style={{ color:'#e8001d' }}>MARKET</span></span>
              </div>
              <p className="resv-footer-tagline">Your trusted vehicle reservation dealership. Browse, reserve online, then visit us to complete your dream.</p>
              <div className="resv-footer-socials">
                {[[FaFacebook,'Facebook'],[FaInstagram,'Instagram'],[FaTwitter,'Twitter'],[FaYoutube,'YouTube']].map(([Icon,label]) => (
                  <a key={label} href="#" className="resv-social-icon" aria-label={label}><Icon /></a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="resv-footer-col-title">About Us</h4>
              <p className="resv-footer-about-text">Essak VeloMarket is a premier vehicle dealership specializing in cars and motorcycles. We offer an online reservation system so you can secure your vehicle before visiting our showroom.</p>
            </div>
            <div>
              <h4 className="resv-footer-col-title">Contact</h4>
              {[
                [FaPhone,'+1 (800) 835-6627'],
                [FaEnvelope,'info@velomarket.com'],
                [FaMapMarkerAlt,'123 Speedway Blvd, Motor City, MC 40001'],
              ].map(([Icon,text]) => (
                <div key={text} className="resv-footer-contact-item">
                  <Icon className="resv-footer-contact-icon" /><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="resv-footer-bottom">
            <span>© 2026 Essak. All rights reserved.</span>
            <div className="resv-footer-bottom-links">
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

export default Reservations;