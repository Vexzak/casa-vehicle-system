import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaEnvelope, FaCheckDouble, FaCar, FaMotorcycle,
  FaTimesCircle, FaCheckCircle, FaPaperPlane,
  FaInbox, FaExternalLinkAlt, FaShieldAlt, FaReply,
  FaCircle, FaTimes, FaBolt,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');

  @keyframes spin      { to { transform: rotate(360deg); } }
  @keyframes fadeIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes msgPop    { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes toastIn   { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes replySlide{ from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulseRed  { 0%,100%{box-shadow:0 0 0 0 rgba(232,0,29,0.35)} 50%{box-shadow:0 0 0 6px rgba(232,0,29,0)} }
  @keyframes streakIn  { 0%{transform:translateX(-100%);opacity:0} 8%{opacity:1} 92%{opacity:0.6} 100%{transform:translateX(400%);opacity:0} }
  @keyframes dotPulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  * { box-sizing:border-box; margin:0; padding:0; }

  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(232,0,29,0.2); border-radius:2px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(232,0,29,0.5); }

  /* ── Shell ── */
  .um-shell {
    display:flex; flex-direction:column;
    height:calc(100vh - 64px);
    background:#0d0d0d;
    font-family:'Barlow',sans-serif;
    overflow:hidden;
    position:relative;
  }

  /* ── Animated background grid ── */
  .um-bg-grid {
    position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden;
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.018) 40px, rgba(255,255,255,0.018) 41px),
      repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.018) 40px, rgba(255,255,255,0.018) 41px);
  }
  .um-bg-streak {
    position:absolute; height:1px; left:-20%;
    background:linear-gradient(90deg, transparent, rgba(232,0,29,0.4), rgba(245,196,0,0.2), transparent);
    animation:streakIn linear infinite;
    border-radius:1px;
  }

  /* ── Top bar ── */
  .um-topbar {
    background:rgba(8,8,8,0.95);
    border-bottom:1px solid rgba(232,0,29,0.3);
    padding:0 28px; height:64px;
    display:flex; align-items:center; justify-content:space-between;
    flex-shrink:0; z-index:10; position:relative;
    backdrop-filter:blur(12px);
  }
  .um-topbar::after {
    content:''; position:absolute; bottom:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg, transparent, #e8001d 30%, #f5c400 50%, #e8001d 70%, transparent);
  }
  .um-topbar-left { display:flex; align-items:center; gap:14px; }
  .um-topbar-icon {
    width:40px; height:40px;
    background:rgba(232,0,29,0.12); border:1px solid rgba(232,0,29,0.3);
    display:flex; align-items:center; justify-content:center;
    color:#e8001d; font-size:17px;
    clip-path:polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  }
  .um-topbar-title {
    font-family:'Bebas Neue',sans-serif; font-size:28px;
    color:#fff; letter-spacing:0.08em; line-height:1;
  }
  .um-topbar-title span { color:#e8001d; }
  .um-topbar-sub {
    font-family:'Barlow Condensed',sans-serif; font-size:10px;
    font-weight:700; letter-spacing:0.18em; text-transform:uppercase;
    color:rgba(255,255,255,0.25); margin-top:2px;
    display:flex; align-items:center; gap:6px;
  }
  .um-topbar-sub::before {
    content:''; display:inline-block; width:16px; height:1.5px; background:#e8001d;
  }

  /* ── Main layout: sidebar + chat ── */
  .um-body { flex:1; display:flex; overflow:hidden; position:relative; z-index:1; }

  /* ── Left info panel ── */
  .um-sidebar {
    width:220px; flex-shrink:0;
    background:rgba(12,12,12,0.97);
    border-right:1px solid rgba(255,255,255,0.06);
    display:flex; flex-direction:column;
    padding:20px 0;
    animation:slideUp 0.4s ease;
  }
  .um-sidebar-section { padding:0 16px 16px; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:16px; }
  .um-sidebar-label {
    font-family:'Barlow Condensed',sans-serif; font-size:9px; font-weight:700;
    letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.2);
    margin-bottom:12px; display:flex; align-items:center; gap:6px;
  }
  .um-sidebar-label::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.06); }

  .um-admin-card {
    background:rgba(232,0,29,0.06);
    border:1px solid rgba(232,0,29,0.15);
    border-left:2px solid #e8001d;
    padding:12px 14px;
  }
  .um-admin-avatar {
    width:38px; height:38px;
    background:rgba(232,0,29,0.1); border:1.5px solid rgba(232,0,29,0.3);
    display:flex; align-items:center; justify-content:center;
    color:#e8001d; font-size:15px;
    clip-path:polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    margin-bottom:10px;
  }
  .um-admin-name {
    font-family:'Barlow Condensed',sans-serif; font-size:13px;
    font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
    color:#fff; margin-bottom:4px;
  }
  .um-admin-status {
    display:flex; align-items:center; gap:5px;
    font-family:'Barlow Condensed',sans-serif; font-size:10px;
    font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
    color:rgba(255,255,255,0.35);
  }
  .um-admin-status .dot {
    width:6px; height:6px; border-radius:50%; background:#10b981;
    animation:dotPulse 2s ease-in-out infinite;
    box-shadow:0 0 6px rgba(16,185,129,0.5);
  }

  .um-stat-row { display:flex; flex-direction:column; gap:8px; padding:0 16px; }
  .um-stat-item {
    display:flex; justify-content:space-between; align-items:center;
    padding:8px 10px;
    background:rgba(255,255,255,0.02);
    border:1px solid rgba(255,255,255,0.05);
    border-left:2px solid rgba(255,255,255,0.1);
  }
  .um-stat-label {
    font-family:'Barlow Condensed',sans-serif; font-size:10px;
    font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
    color:rgba(255,255,255,0.3);
  }
  .um-stat-value {
    font-family:'Bebas Neue',sans-serif; font-size:18px;
    color:#fff; letter-spacing:0.04em; line-height:1;
  }

  /* ── Chat area ── */
  .um-chat { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#f7f7f8; }

  /* ── Chat header ── */
  .um-chat-header {
    background:#fff; border-bottom:2px solid #f0f0f0;
    padding:14px 24px; display:flex; align-items:center;
    justify-content:space-between; flex-shrink:0;
    box-shadow:0 2px 12px rgba(0,0,0,0.06);
  }
  .um-chat-header-left { display:flex; align-items:center; gap:12px; }
  .um-chat-header-avatar {
    width:44px; height:44px;
    background:linear-gradient(135deg, rgba(232,0,29,0.12), rgba(232,0,29,0.06));
    border:2px solid rgba(232,0,29,0.2);
    display:flex; align-items:center; justify-content:center;
    color:#e8001d; font-size:18px;
    clip-path:polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
  }
  .um-chat-header-name {
    font-family:'Barlow Condensed',sans-serif; font-size:16px;
    font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:#111;
  }
  .um-chat-header-sub {
    font-size:12px; color:#9ca3af; display:flex; align-items:center; gap:5px; margin-top:1px;
  }
  .um-chat-header-sub .dot {
    width:7px; height:7px; border-radius:50%; background:#10b981;
    box-shadow:0 0 6px rgba(16,185,129,0.5);
    animation:dotPulse 2s ease-in-out infinite;
  }
  .um-chat-header-badge {
    display:flex; align-items:center; gap:6px;
    background:rgba(232,0,29,0.07); border:1px solid rgba(232,0,29,0.2);
    padding:5px 12px;
    font-family:'Barlow Condensed',sans-serif; font-size:10px;
    font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#e8001d;
  }

  /* ── Messages scroll area ── */
  .um-messages-area { flex:1; overflow-y:auto; padding:24px 28px 16px; background:#f5f5f7; }
  .um-messages-inner { display:flex; flex-direction:column; gap:4px; }

  /* ── Date divider ── */
  .um-date-divider {
    display:flex; align-items:center; gap:10px;
    font-family:'Barlow Condensed',sans-serif; font-size:10px;
    font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#9ca3af;
    margin:14px 0 8px;
  }
  .um-date-divider::before,.um-date-divider::after {
    content:''; flex:1; height:1px;
    background:linear-gradient(90deg, transparent, #e0e0e0, transparent);
  }

  /* ── Message group ── */
  .um-msg-group { display:flex; flex-direction:column; gap:2px; animation:msgPop 0.22s ease; margin-bottom:14px; }

  /* ── Vehicle card ── */
  .um-vehicle-card {
    display:flex; align-items:stretch;
    background:#fff; border:1px solid #e5e7eb; border-left:3px solid #e8001d;
    overflow:hidden; width:300px;
    align-self:flex-end; margin-right:46px; margin-bottom:6px;
    box-shadow:0 2px 12px rgba(0,0,0,0.08);
    transition:transform 0.2s, box-shadow 0.2s;
  }
  .um-vehicle-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.12); }
  .um-vehicle-card-img { width:90px;flex-shrink:0;background:#111;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative; }
  .um-vehicle-card-img img { width:100%;height:100%;object-fit:cover; }
  .um-vehicle-card-img .no-img { color:rgba(255,255,255,0.15);font-size:24px; }
  .um-vehicle-card-img .type-badge { position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.75);color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;display:flex;align-items:center;gap:3px;border-left:1.5px solid #e8001d; }
  .um-vehicle-card-body { flex:1;padding:10px 12px;min-width:0;display:flex;flex-direction:column;justify-content:space-between; }
  .um-vehicle-card-name { font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:0.04em;color:#111;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  .um-vehicle-card-meta { font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px; }
  .um-vehicle-card-footer { display:flex;align-items:center;justify-content:space-between;gap:6px; }
  .um-vehicle-card-price { font-family:'Bebas Neue',sans-serif;font-size:20px;color:#e8001d;letter-spacing:0.04em;line-height:1; }
  .um-vehicle-card-price span { font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:#e8001d;vertical-align:super;margin-right:1px; }
  .um-vehicle-card-status { font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:3px 7px;display:flex;align-items:center;gap:3px; }
  .um-vehicle-card-link { display:flex;align-items:center;gap:4px;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#e8001d;text-decoration:none;margin-top:5px;opacity:0.7;transition:opacity 0.15s; }
  .um-vehicle-card-link:hover { opacity:1; }
  .um-vehicle-card-skeleton { width:300px;align-self:flex-end;margin-right:46px;height:82px;background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%);background-size:200% 100%;animation:shimmer 1.2s infinite;margin-bottom:6px; }

  /* ── Bubble rows ── */
  .um-bubble-row { display:flex; align-items:flex-end; gap:10px; }
  .um-bubble-row.user-row { flex-direction:row-reverse; }

  .um-bubble-avatar {
    width:32px; height:32px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; flex-shrink:0;
  }
  .um-bubble-avatar.admin-av {
    background:rgba(232,0,29,0.08); border:1.5px solid rgba(232,0,29,0.25);
    color:#e8001d;
  }
  .um-bubble-avatar.user-av {
    background:#111; border:1.5px solid #2a2a2a; color:#fff;
    font-family:'Bebas Neue',sans-serif; font-size:15px;
  }

  .um-bubble-wrap { display:flex; flex-direction:column; }
  .um-bubble-row.user-row .um-bubble-wrap { align-items:flex-end; }

  /* ── Reply action ── */
  .um-bubble-actions {
    display:flex; align-items:center;
    opacity:0; pointer-events:none;
    transition:opacity 0.15s ease 500ms;
    flex-shrink:0;
  }
  .um-bubble-row:hover .um-bubble-actions {
    opacity:1; pointer-events:all;
    transition:opacity 0.15s ease 0s;
  }
  .um-action-btn {
    width:28px; height:28px; border-radius:50%;
    background:#fff; border:1px solid #e5e7eb;
    display:flex; align-items:center; justify-content:center;
    color:#9ca3af; font-size:10px; cursor:pointer;
    box-shadow:0 2px 6px rgba(0,0,0,0.1);
    transition:all 0.15s;
  }
  .um-action-btn:hover { background:#e8001d; border-color:#e8001d; color:#fff; transform:scale(1.1); }

  /* ── Bubbles ── */
  .um-bubble { max-width:440px; padding:11px 16px; font-size:13.5px; line-height:1.7; word-break:break-word; }

  .um-bubble.admin-bubble {
    background:#fff; color:#1f2937;
    border:1px solid #e5e7eb;
    border-bottom-left-radius:4px;
    border-top-left-radius:16px; border-top-right-radius:16px; border-bottom-right-radius:16px;
    box-shadow:0 2px 8px rgba(0,0,0,0.06);
  }
  .um-bubble.user-bubble {
    background:linear-gradient(135deg, #e8001d, #c0001a);
    color:#fff;
    border-bottom-right-radius:4px;
    border-top-left-radius:16px; border-top-right-radius:16px; border-bottom-left-radius:16px;
    box-shadow:0 4px 16px rgba(232,0,29,0.3);
  }

  .um-bubble-time {
    font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:600;
    letter-spacing:0.04em; color:#b0b0b8; margin-top:4px;
    display:flex; align-items:center; gap:4px;
  }
  .um-bubble-row.user-row .um-bubble-time { justify-content:flex-end; }

  /* ── Unread indicator ── */
  .um-unread-dot {
    display:inline-flex; align-items:center; gap:4px;
    font-family:'Barlow Condensed',sans-serif; font-size:9px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase; color:#f5c400;
  }

  /* ── Reply preview inside bubble ── */
  .um-reply-preview {
    border-left:2px solid rgba(255,255,255,0.35);
    padding:5px 10px; margin-bottom:8px;
    font-size:11.5px; opacity:0.8; line-height:1.4;
    background:rgba(0,0,0,0.08); border-radius:4px;
  }
  .um-bubble.admin-bubble .um-reply-preview {
    border-left-color:rgba(232,0,29,0.3); color:#6b7280;
    background:rgba(0,0,0,0.03);
  }
  .um-reply-preview-label {
    font-family:'Barlow Condensed',sans-serif; font-size:9px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase; margin-bottom:2px; opacity:0.6;
  }

  /* ── Reply box ── */
  .um-reply-box {
    background:#fff; border-top:1px solid #eaeaea;
    padding:12px 20px 14px; flex-shrink:0;
    box-shadow:0 -4px 20px rgba(0,0,0,0.06);
  }

  /* ── Reply-to banner ── */
  .um-replying-to-banner {
    display:flex; align-items:center; gap:8px;
    padding:8px 12px;
    background:#fef2f2; border-left:3px solid #e8001d;
    margin-bottom:10px;
    animation:replySlide 0.15s ease;
    border-radius:0 4px 4px 0;
  }
  .um-replying-to-label {
    font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase; color:#e8001d; flex-shrink:0;
  }
  .um-replying-to-text  { font-size:12px; color:#6b7280; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .um-replying-to-close {
    background:none; border:none; color:#9ca3af; cursor:pointer;
    display:flex; align-items:center; padding:2px; font-size:12px; flex-shrink:0;
  }
  .um-replying-to-close:hover { color:#e8001d; }

  .um-reply-inner {
    display:flex; align-items:flex-end; gap:10px;
    background:#f5f5f7; border:1.5px solid transparent;
    padding:10px 14px; border-radius:12px; transition:all 0.2s;
  }
  .um-reply-inner:focus-within {
    background:#fff; border-color:#e8001d;
    box-shadow:0 0 0 4px rgba(232,0,29,0.08);
  }
  .um-reply-textarea {
    flex:1; border:none; background:none; outline:none;
    font-family:'Barlow',sans-serif; font-size:14px; color:#374151;
    resize:none; line-height:1.55; max-height:110px; min-height:20px;
  }
  .um-reply-textarea::placeholder { color:#b0b0b8; }
  .um-reply-send {
    width:38px; height:38px; background:#e8001d; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-size:13px; flex-shrink:0;
    clip-path:polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    transition:all 0.2s;
  }
  .um-reply-send:hover:not(:disabled) { background:#c0001a; transform:scale(1.05); }
  .um-reply-send:disabled { background:#e5e7eb; color:#9ca3af; cursor:not-allowed; }
  .um-reply-hint {
    font-family:'Barlow',sans-serif; font-size:11px; color:#b0b0b8;
    margin-top:6px; text-align:right; letter-spacing:0.02em;
  }

  /* ── Empty state ── */
  .um-empty {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:14px; padding:80px 0; animation:fadeIn 0.4s ease;
  }
  .um-empty-ring {
    width:80px; height:80px; border-radius:50%;
    border:2px dashed rgba(232,0,29,0.25);
    display:flex; align-items:center; justify-content:center;
    font-size:30px; color:rgba(232,0,29,0.2);
    animation:pulseRed 3s ease-in-out infinite;
  }

  /* ── Toast ── */
  .um-toast {
    position:fixed; top:80px; right:24px; z-index:999;
    display:flex; align-items:center; gap:10px; padding:13px 20px;
    font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:700;
    letter-spacing:0.06em; text-transform:uppercase;
    box-shadow:0 8px 32px rgba(0,0,0,0.25);
    animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .um-toast.success { background:#0a2a1a; border-left:3px solid #10b981; color:#34d399; }
  .um-toast.error   { background:#2a0a0a; border-left:3px solid #e8001d; color:#ff6b7a; }
`;

/* ─── Vehicle cache + card ───────────────────────────────────────────────── */
const vehicleCache = {};

const VehicleCard = ({ vehicleId }) => {
  const [vehicle, setVehicle] = useState(vehicleCache[vehicleId] || null);
  const [loading, setLoading] = useState(!vehicleCache[vehicleId]);

  useEffect(() => {
    if (!vehicleId || vehicleCache[vehicleId]) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/vehicles/${vehicleId}`);
        if (!cancelled) { vehicleCache[vehicleId] = res.data; setVehicle(res.data); }
      } catch { }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [vehicleId]);

  if (!vehicleId) return null;
  if (loading)   return <div className="um-vehicle-card-skeleton" />;
  if (!vehicle)  return null;

  const img     = vehicle.images?.[0]?.image_path || null;
  const price   = parseFloat(vehicle.price || 0);
  const isAvail = vehicle.availability_status === 'available';
  const isRes   = vehicle.availability_status === 'reserved';
  const sc      = isAvail
    ? {bg:'rgba(16,185,129,0.1)', c:'#059669'}
    : isRes
    ? {bg:'rgba(245,196,0,0.1)', c:'#b45309'}
    : {bg:'rgba(232,0,29,0.08)', c:'#e8001d'};

  return (
    <div className="um-vehicle-card">
      <div className="um-vehicle-card-img">
        {img
          ? <img src={img} alt={vehicle.name}/>
          : <span className="no-img">{vehicle.type==='motorcycle' ? <FaMotorcycle/> : <FaCar/>}</span>
        }
        <div className="type-badge">
          {vehicle.type==='motorcycle' ? <FaMotorcycle style={{fontSize:8}}/> : <FaCar style={{fontSize:8}}/>}
          {vehicle.type}
        </div>
      </div>
      <div className="um-vehicle-card-body">
        <div>
          <div className="um-vehicle-card-name">{vehicle.name}</div>
          <div className="um-vehicle-card-meta">{vehicle.brand} · {vehicle.year}</div>
        </div>
        <div>
          <div className="um-vehicle-card-footer">
            <div className="um-vehicle-card-price"><span>₱</span>{price.toLocaleString()}</div>
            <div className="um-vehicle-card-status" style={{background:sc.bg, color:sc.c}}>
              <span style={{width:5,height:5,borderRadius:'50%',background:sc.c,display:'inline-block'}}/>
              {vehicle.availability_status}
            </div>
          </div>
          <Link to={`/vehicle/${vehicleId}`} className="um-vehicle-card-link">
            <FaExternalLinkAlt style={{fontSize:8}}/> View listing
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmtFull = (iso) => new Date(iso).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

const groupByDate = (msgs) => {
  const events = [];
  msgs.forEach(m => {
    events.push({ time: new Date(m.created_at), kind: 'user', data: m });
    if (m.reply) {
      events.push({ time: new Date(m.updated_at || m.replied_at || m.created_at), kind: 'admin', data: m });
    }
  });
  events.sort((a, b) => a.time - b.time);
  const out = []; let last = null;
  events.forEach(ev => {
    const d = ev.time.toDateString();
    if (d !== last) { out.push({ type: 'divider', date: ev.time.toISOString() }); last = d; }
    out.push(ev);
  });
  return out;
};

/* ─── Streak background decoration ──────────────────────────────────────── */
const BgStreaks = () => (
  <>
    {[
      { top:'20%', w:'35%', dur:'2.2s', del:'0s',   op:0.5 },
      { top:'42%', w:'50%', dur:'1.7s', del:'0.6s', op:0.3 },
      { top:'65%', w:'28%', dur:'2.8s', del:'1.1s', op:0.4 },
      { top:'80%', w:'42%', dur:'1.9s', del:'0.3s', op:0.35 },
    ].map((s, i) => (
      <div key={i} className="um-bg-streak" style={{ top:s.top, width:s.w, opacity:s.op, animationDuration:s.dur, animationDelay:s.del }} />
    ))}
  </>
);

/* ─── Main ───────────────────────────────────────────────────────────────── */
const UserMessages = () => {
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const messagesAreaRef = useRef(null);
  const textareaRef     = useRef(null);

  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [sending,    setSending]    = useState(false);
  const [alert,      setAlert]      = useState(null);
  const [draft,      setDraft]      = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  useEffect(() => { if (!alert) return; const t = setTimeout(()=>setAlert(null),4000); return ()=>clearTimeout(t); }, [alert]);

  const scrollToBottom = useCallback(() => {
    const el = messagesAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages/user');
      setMessages(res.data);
    } catch { setAlert({type:'error', message:'Failed to load messages.'}); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(t);
  }, [messages, loading, scrollToBottom]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const payload = { message: text };
      if (replyingTo) payload.reply_to_id = replyingTo.id;
      await api.post('/messages', payload);
      setDraft('');
      setReplyingTo(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      await fetchMessages();
    } catch { setAlert({type:'error', message:'Failed to send message.'}); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleReply = (msg, sender) => {
    setReplyingTo({ id: msg.id, text: sender==='admin' ? msg.reply : msg.message, sender });
    textareaRef.current?.focus();
  };

  const grouped     = groupByDate(messages);
  const userInitial = (user?.name?.[0] || 'U').toUpperCase();

  // Stats
  const totalMsgs   = messages.length;
  const repliedMsgs = messages.filter(m => m.reply).length;
  const pendingMsgs = totalMsgs - repliedMsgs;

  return (
    <div className="um-shell">
      <style>{css}</style>

      {/* Animated background */}
      <div className="um-bg-grid"><BgStreaks /></div>

      {/* Toast */}
      {alert && (
        <div className={`um-toast ${alert.type}`}>
          {alert.type==='success' ? <FaCheckCircle/> : <FaTimesCircle/>} {alert.message}
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="um-topbar">
        <div className="um-topbar-left">
          <div className="um-topbar-icon"><FaEnvelope/></div>
          <div>
            <div className="um-topbar-title">MY <span>MESSAGES</span></div>
            <div className="um-topbar-sub">Inquiries to Admin Support</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {pendingMsgs > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(245,196,0,0.1)', border:'1px solid rgba(245,196,0,0.25)', borderLeft:'2px solid #f5c400', padding:'5px 12px' }}>
              <FaBolt style={{ color:'#f5c400', fontSize:10 }} />
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'#f5c400' }}>
                {pendingMsgs} Awaiting Reply
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body: sidebar + chat ── */}
      <div className="um-body">

        {/* ── Left sidebar ── */}
        <div className="um-sidebar">
          <div className="um-sidebar-section">
            <div className="um-sidebar-label">Support Agent</div>
            <div className="um-admin-card">
              <div className="um-admin-avatar"><FaShieldAlt style={{ fontSize:15 }}/></div>
              <div className="um-admin-name">Admin Support</div>
              <div className="um-admin-status">
                <span className="dot"/> Online
              </div>
            </div>
          </div>

          <div className="um-sidebar-label" style={{ padding:'0 16px', marginBottom:12 }}>Overview</div>
          <div className="um-stat-row">
            {[
              { label:'Messages', val: totalMsgs,   accent:'#e8001d' },
              { label:'Replied',  val: repliedMsgs, accent:'#10b981' },
              { label:'Pending',  val: pendingMsgs, accent:'#f5c400' },
            ].map(s => (
              <div key={s.label} className="um-stat-item" style={{ borderLeftColor: s.accent }}>
                <span className="um-stat-label">{s.label}</span>
                <span className="um-stat-value" style={{ color: s.val > 0 ? s.accent : '#fff' }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Info blurb */}
          <div style={{ padding:'16px', marginTop:'auto' }}>
            <div style={{ background:'rgba(232,0,29,0.05)', border:'1px solid rgba(232,0,29,0.12)', borderLeft:'2px solid rgba(232,0,29,0.4)', padding:'10px 12px' }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:6 }}>Response time</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:'#fff', letterSpacing:'0.04em' }}>Within 24hrs</div>
            </div>
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div className="um-chat">

          {/* Chat header */}
          <div className="um-chat-header">
            <div className="um-chat-header-left">
              <div className="um-chat-header-avatar"><FaShieldAlt/></div>
              <div>
                <div className="um-chat-header-name">Admin Support</div>
                <div className="um-chat-header-sub"><span className="dot"/> Available · Replies promptly</div>
              </div>
            </div>
            <div className="um-chat-header-badge">
              <FaEnvelope style={{ fontSize:9 }} />
              {totalMsgs} {totalMsgs === 1 ? 'Message' : 'Messages'}
            </div>
          </div>

          {/* ── Messages scroll area ── */}
          <div className="um-messages-area" ref={messagesAreaRef}>
            {loading ? (
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:200}}>
                <div style={{width:28,height:28,border:'3px solid #e5e7eb',borderTopColor:'#e8001d',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}/>
              </div>
            ) : messages.length===0 ? (
              <div className="um-empty">
                <div className="um-empty-ring"><FaInbox/></div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:'#374151',letterSpacing:'0.06em'}}>No Messages Yet</div>
                <div style={{fontSize:13,color:'#9ca3af',textAlign:'center',maxWidth:260,lineHeight:1.6}}>
                  Send a message below to get in touch with our admin team.
                </div>
              </div>
            ) : (
              <div className="um-messages-inner">
                {grouped.map((item, idx) => {
                  if (item.type === 'divider') return (
                    <div key={`d${idx}`} className="um-date-divider">{fmtDate(item.date)}</div>
                  );

                  const { kind, data: m } = item;

                  if (kind === 'user') return (
                    <div key={`user-${m.id}`} className="um-msg-group">
                      {m.vehicle_id && <VehicleCard vehicleId={m.vehicle_id}/>}
                      <div className="um-bubble-row user-row">
                        <div className="um-bubble-avatar user-av">{userInitial}</div>
                        <div className="um-bubble-wrap">
                          <div className="um-bubble user-bubble">
                            {m.reply_to_text && (
                              <div className="um-reply-preview">
                                <div className="um-reply-preview-label">Replying to</div>
                                {m.reply_to_text}
                              </div>
                            )}
                            {m.message}
                          </div>
                          <div className="um-bubble-time" style={{justifyContent:'flex-end'}}>
                            {fmtFull(m.created_at)}
                            {!m.reply && (
                              <span className="um-unread-dot">
                                <FaCircle style={{fontSize:4,color:'#f5c400'}}/>
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="um-bubble-actions">
                          <button className="um-action-btn" title="Reply" onClick={()=>handleReply(m,'user')}><FaReply/></button>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div key={`admin-${m.id}`} className="um-msg-group">
                      <div className="um-bubble-row" style={{marginTop:4}}>
                        <div className="um-bubble-avatar admin-av"><FaShieldAlt style={{fontSize:11}}/></div>
                        <div className="um-bubble-wrap">
                          <div className="um-bubble admin-bubble">{m.reply}</div>
                          <div className="um-bubble-time">
                            <FaCheckDouble style={{fontSize:9,color:'#10b981'}}/>
                            {fmtFull(m.replied_at || m.updated_at || m.created_at)}
                          </div>
                        </div>
                        <div className="um-bubble-actions">
                          <button className="um-action-btn" title="Reply" onClick={()=>handleReply(m,'admin')}><FaReply/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Message input bar ── */}
          <div className="um-reply-box">
            {replyingTo && (
              <div className="um-replying-to-banner">
                <FaReply style={{color:'#e8001d',fontSize:11,flexShrink:0}}/>
                <span className="um-replying-to-label">Replying to {replyingTo.sender==='admin' ? 'Admin' : 'yourself'}</span>
                <span className="um-replying-to-text">{replyingTo.text}</span>
                <button className="um-replying-to-close" onClick={()=>setReplyingTo(null)}><FaTimes/></button>
              </div>
            )}
            <div className="um-reply-inner">
              <textarea
                ref={textareaRef}
                className="um-reply-textarea"
                rows={1}
                placeholder={replyingTo
                  ? `Reply to ${replyingTo.sender==='admin' ? 'Admin' : 'your message'}...`
                  : 'Message Admin Support...'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={e => { e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,110)+'px'; }}
              />
              <button className="um-reply-send" onClick={sendMessage} disabled={!draft.trim()||sending}>
                {sending
                  ? <span style={{width:13,height:13,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.6s linear infinite'}}/>
                  : <FaPaperPlane style={{fontSize:12}}/>
                }
              </button>
            </div>
            <div className="um-reply-hint">Enter to send · Shift+Enter for new line</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserMessages;