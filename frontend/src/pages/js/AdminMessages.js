import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaEnvelope, FaCheckDouble, FaCar, FaMotorcycle,
  FaTimesCircle, FaCheckCircle, FaUser, FaPaperPlane,
  FaTimes, FaSearch, FaCircle, FaInbox, FaExternalLinkAlt,
  FaReply, FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes msgPop  { from{opacity:0;transform:translateY(10px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes toastIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes replySlide { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(232,0,29,0.3); border-radius:2px; }
  ::-webkit-scrollbar-thumb:hover { background:#e8001d; }

  .am-shell { display:flex; flex-direction:column; height:100vh; background:#f0f0f0; font-family:'Barlow',sans-serif; overflow:hidden; }

  /* ── Top bar ── */
  .am-topbar { background:#111; border-bottom:3px solid #e8001d; padding:0 24px; height:62px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; z-index:10; }
  .am-topbar-left { display:flex; align-items:center; gap:12px; }
  .am-topbar-icon { width:36px; height:36px; background:rgba(232,0,29,0.15); border:1px solid rgba(232,0,29,0.35); display:flex; align-items:center; justify-content:center; color:#e8001d; font-size:16px; }
  .am-topbar-title { font-family:'Bebas Neue',sans-serif; font-size:26px; color:#fff; letter-spacing:0.06em; line-height:1; }
  .am-topbar-sub   { font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.3); }
  .am-topbar-stats { display:flex; gap:20px; align-items:center; }
  .am-topbar-stat  { display:flex; align-items:center; gap:6px; }
  .am-topbar-stat-val   { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:0.04em; }
  .am-topbar-stat-label { font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.3); }

  .am-body { display:flex; flex:1; overflow:hidden; }

  /* ── Sidebar ── */
  .am-sidebar { width:300px; flex-shrink:0; background:#fff; border-right:1px solid #e5e7eb; display:flex; flex-direction:column; overflow:hidden; }
  .am-sidebar-header { padding:14px 14px 0; flex-shrink:0; }
  .am-sidebar-search { position:relative; margin-bottom:10px; }
  .am-sidebar-search input { width:100%; padding:9px 12px 9px 32px; background:#f3f4f6; border:1.5px solid transparent; font-family:'Barlow',sans-serif; font-size:13px; color:#374151; outline:none; transition:all 0.2s; }
  .am-sidebar-search input:focus { background:#fff; border-color:#e8001d; box-shadow:0 0 0 3px rgba(232,0,29,0.08); }
  .am-sidebar-search .srch-icon  { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#9ca3af; font-size:11px; pointer-events:none; }
  .am-sidebar-search .srch-clear { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9ca3af; font-size:11px; }
  .am-filter-tabs { display:flex; gap:2px; margin-bottom:8px; overflow-x:auto; padding-bottom:2px; }
  .am-filter-tabs::-webkit-scrollbar { height:2px; }
  .am-filter-tab { flex-shrink:0; padding:5px 10px; background:none; border:1px solid #e5e7eb; font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9ca3af; cursor:pointer; transition:all 0.15s; display:flex; align-items:center; gap:4px; }
  .am-filter-tab:hover { background:#f9fafb; color:#374151; }
  .am-filter-tab.active         { background:#111;    border-color:#111;    color:#fff; }
  .am-filter-tab.active.red     { background:#e8001d; border-color:#e8001d; color:#fff; }
  .am-filter-tab.active.yellow  { background:#f5c400; border-color:#f5c400; color:#000; }
  .am-filter-tab.active.green   { background:#10b981; border-color:#10b981; color:#fff; }
  .am-filter-tab .tab-badge { min-width:15px; height:15px; border-radius:99px; background:#e8001d; color:#fff; font-size:9px; font-weight:800; display:inline-flex; align-items:center; justify-content:center; padding:0 3px; }
  .am-filter-tab.active .tab-badge { background:rgba(255,255,255,0.25); }
  .am-filter-tab.active.yellow .tab-badge { background:rgba(0,0,0,0.15); color:#000; }
  .am-conv-list { flex:1; overflow-y:auto; padding:4px 0; }
  .am-conv-item { display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; transition:background 0.15s; border-left:3px solid transparent; }
  .am-conv-item:hover { background:#f9fafb; }
  .am-conv-item.active { background:rgba(232,0,29,0.04); border-left-color:#e8001d; }
  .am-conv-item.unread { background:rgba(232,0,29,0.015); }
  .am-conv-avatar { width:40px; height:40px; border-radius:50%; background:#f3f4f6; border:2px solid #e5e7eb; display:flex; align-items:center; justify-content:center; color:#9ca3af; font-size:15px; flex-shrink:0; position:relative; }
  .am-conv-avatar.unread-av { border-color:#e8001d; background:rgba(232,0,29,0.06); color:#e8001d; }
  .am-unread-dot { position:absolute; bottom:0; right:0; width:11px; height:11px; background:#e8001d; border-radius:50%; border:2px solid #fff; }
  .am-conv-info { flex:1; min-width:0; }
  .am-conv-name { font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#111; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px; }
  .am-conv-item.unread .am-conv-name { color:#e8001d; }
  .am-conv-preview { font-size:12px; color:#9ca3af; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:170px; }
  .am-conv-item.unread .am-conv-preview { color:#374151; font-weight:600; }
  .am-conv-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
  .am-conv-time { font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.04em; color:#9ca3af; }
  .am-conv-item.unread .am-conv-time { color:#e8001d; }
  .am-conv-count { min-width:17px; height:17px; background:#e8001d; color:#fff; border-radius:99px; font-size:9px; font-weight:800; display:flex; align-items:center; justify-content:center; padding:0 3px; }
  .am-conv-replied-icon { color:#10b981; font-size:11px; }
  .am-conv-pending-icon { color:#f5c400; font-size:8px; }
  .am-sidebar-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px; text-align:center; color:#9ca3af; animation:fadeIn 0.3s ease; }
  .am-sidebar-empty svg { font-size:32px; margin-bottom:10px; opacity:0.15; }
  .am-sidebar-empty p { font-size:13px; line-height:1.6; }

  /* ── Chat ── */
  .am-chat { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#f7f7f8; }
  .am-chat-header { background:#fff; border-bottom:1px solid #e5e7eb; padding:14px 22px; display:flex; align-items:center; gap:12px; flex-shrink:0; }
  .am-chat-header-avatar { width:42px; height:42px; border-radius:50%; background:rgba(232,0,29,0.08); border:2px solid rgba(232,0,29,0.2); display:flex; align-items:center; justify-content:center; color:#e8001d; font-size:18px; flex-shrink:0; }
  .am-chat-header-name  { font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#111; }
  .am-chat-header-email { font-size:12px; color:#9ca3af; }
  .am-chat-header-badges { display:flex; gap:6px; margin-left:auto; align-items:center; }
  .am-chat-badge { padding:3px 9px; font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; }

  /* ── Messages area — exact same structure as UserMessages ── */
  .am-messages-area { flex:1; overflow-y:auto; padding:24px 28px 16px; }
  .am-messages-inner { display:flex; flex-direction:column; gap:4px; }

  /* ── Date divider ── */
  .am-date-divider { display:flex; align-items:center; gap:10px; font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#9ca3af; margin:12px 0 6px; }
  .am-date-divider::before, .am-date-divider::after { content:''; flex:1; height:1px; background:#e5e7eb; }

  /* ── Message group ── */
  .am-msg-group { display:flex; flex-direction:column; gap:2px; animation:msgPop 0.22s ease; margin-bottom:12px; }

  /* ── Vehicle card ── */
  .am-vehicle-card { display:flex; align-items:stretch; background:#fff; border:1px solid #e5e7eb; border-left:3px solid #e8001d; overflow:hidden; width:300px; align-self:flex-start; margin-left:38px; margin-bottom:6px; box-shadow:0 2px 8px rgba(0,0,0,0.07); transition:transform 0.15s,box-shadow 0.15s; }
  .am-vehicle-card:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(0,0,0,0.1); }
  .am-vehicle-card-img { width:90px; flex-shrink:0; background:#111; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
  .am-vehicle-card-img img { width:100%; height:100%; object-fit:cover; }
  .am-vehicle-card-img .no-img { color:rgba(255,255,255,0.15); font-size:24px; }
  .am-vehicle-card-img .type-badge { position:absolute; bottom:4px; left:4px; background:rgba(0,0,0,0.7); color:#fff; font-family:'Barlow Condensed',sans-serif; font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:2px 6px; display:flex; align-items:center; gap:3px; }
  .am-vehicle-card-body { flex:1; padding:9px 11px; min-width:0; display:flex; flex-direction:column; justify-content:space-between; }
  .am-vehicle-card-name { font-family:'Bebas Neue',sans-serif; font-size:15px; letter-spacing:0.04em; color:#111; margin-bottom:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .am-vehicle-card-meta { font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#9ca3af; margin-bottom:6px; }
  .am-vehicle-card-footer { display:flex; align-items:center; justify-content:space-between; gap:6px; }
  .am-vehicle-card-price { font-family:'Bebas Neue',sans-serif; font-size:19px; color:#e8001d; letter-spacing:0.04em; line-height:1; }
  .am-vehicle-card-price span { font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; color:#e8001d; vertical-align:super; margin-right:1px; }
  .am-vehicle-card-status { font-family:'Barlow Condensed',sans-serif; font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:2px 6px; display:flex; align-items:center; gap:3px; }
  .am-vehicle-card-link { display:flex; align-items:center; gap:4px; font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#e8001d; text-decoration:none; margin-top:5px; opacity:0.8; transition:opacity 0.15s; }
  .am-vehicle-card-link:hover { opacity:1; }
  .am-vehicle-card-skeleton { width:300px; align-self:flex-start; margin-left:38px; height:78px; background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; margin-bottom:6px; }

  /* ── Bubble rows ── */
  .am-bubble-row { display:flex; align-items:flex-end; gap:8px; }
  .am-bubble-row.admin-row { flex-direction:row-reverse; }
  .am-bubble-avatar { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
  .am-bubble-avatar.user-av  { background:#f3f4f6; border:1.5px solid #e5e7eb; color:#9ca3af; }
  .am-bubble-avatar.admin-av { background:rgba(232,0,29,0.08); border:1.5px solid rgba(232,0,29,0.2); color:#e8001d; }

  /* ── Bubble wrapper ── */
  .am-bubble-wrap { display:flex; flex-direction:column; }
  .am-bubble-row.admin-row .am-bubble-wrap { align-items:flex-end; }

  /* ── Reply action — beside bubble, 600ms fade-out delay ── */
  .am-bubble-actions { display:flex; align-items:center; opacity:0; pointer-events:none; transition:opacity 0.15s ease 600ms; flex-shrink:0; }
  .am-bubble-row:hover .am-bubble-actions { opacity:1; pointer-events:all; transition:opacity 0.15s ease 0s; }
  .am-action-btn { width:26px; height:26px; border-radius:50%; background:#fff; border:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; color:#9ca3af; font-size:10px; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,0.1); transition:all 0.15s; }
  .am-action-btn:hover { background:#e8001d; border-color:#e8001d; color:#fff; transform:scale(1.08); }

  /* ── Bubbles ── */
  .am-bubble { max-width:420px; padding:10px 14px; font-size:13.5px; line-height:1.65; word-break:break-word; }
  .am-bubble.user-bubble  { background:#fff; color:#1f2937; border:1px solid #e5e7eb; border-bottom-left-radius:3px; border-top-left-radius:14px; border-top-right-radius:14px; border-bottom-right-radius:14px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
  .am-bubble.admin-bubble { background:#e8001d; color:#fff; border-bottom-right-radius:3px; border-top-left-radius:14px; border-top-right-radius:14px; border-bottom-left-radius:14px; box-shadow:0 2px 10px rgba(232,0,29,0.28); }

  /* ── Reply preview inside bubble ── */
  .am-reply-preview { border-left:2px solid rgba(255,255,255,0.45); padding:4px 8px; margin-bottom:6px; font-size:11.5px; opacity:0.85; line-height:1.4; }
  .am-bubble.user-bubble .am-reply-preview { border-left-color:rgba(232,0,29,0.35); color:#6b7280; }
  .am-reply-preview-label { font-family:'Barlow Condensed',sans-serif; font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:2px; opacity:0.7; }

  .am-bubble-time { font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:600; letter-spacing:0.04em; color:#9ca3af; margin-top:3px; display:flex; align-items:center; gap:4px; }
  .am-bubble-row.admin-row .am-bubble-time { justify-content:flex-end; }
  .am-bubble-sender { font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9ca3af; margin-bottom:2px; }
  .am-bubble-row.admin-row .am-bubble-sender { text-align:right; color:rgba(232,0,29,0.5); }

  /* ── Reply box ── */
  .am-reply-box { background:#fff; border-top:1px solid #e5e7eb; padding:10px 18px 12px; flex-shrink:0; }
  .am-replying-to-banner { display:flex; align-items:center; gap:8px; padding:7px 12px; background:#fef2f2; border-left:3px solid #e8001d; margin-bottom:8px; animation:replySlide 0.15s ease; }
  .am-replying-to-label { font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#e8001d; flex-shrink:0; }
  .am-replying-to-text  { font-size:12px; color:#6b7280; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .am-replying-to-close { background:none; border:none; color:#9ca3af; cursor:pointer; display:flex; align-items:center; padding:2px; font-size:12px; flex-shrink:0; }
  .am-replying-to-close:hover { color:#e8001d; }
  .am-reply-inner { display:flex; align-items:flex-end; gap:10px; background:#f3f4f6; border:1.5px solid transparent; padding:9px 12px; transition:all 0.2s; }
  .am-reply-inner:focus-within { background:#fff; border-color:#e8001d; box-shadow:0 0 0 3px rgba(232,0,29,0.08); }
  .am-reply-textarea { flex:1; border:none; background:none; outline:none; font-family:'Barlow',sans-serif; font-size:14px; color:#374151; resize:none; line-height:1.5; max-height:110px; min-height:20px; }
  .am-reply-textarea::placeholder { color:#9ca3af; }
  .am-reply-send { width:36px; height:36px; background:#e8001d; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; flex-shrink:0; transition:all 0.2s; }
  .am-reply-send:hover:not(:disabled) { background:#c0001a; transform:scale(1.05); }
  .am-reply-send:disabled { background:#e5e7eb; color:#9ca3af; cursor:not-allowed; }
  .am-reply-hint { font-family:'Barlow',sans-serif; font-size:11px; color:#9ca3af; margin-top:5px; text-align:right; }

  /* ── No selection ── */
  .am-no-select { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f7f7f8; animation:fadeIn 0.3s ease; }
  .am-no-select-ring { width:80px; height:80px; border-radius:50%; border:3px dashed rgba(232,0,29,0.2); display:flex; align-items:center; justify-content:center; font-size:30px; color:rgba(232,0,29,0.25); margin-bottom:18px; }
  .am-no-select h3 { font-family:'Bebas Neue',sans-serif; font-size:22px; color:#374151; letter-spacing:0.05em; margin-bottom:6px; }
  .am-no-select p  { font-size:13px; color:#9ca3af; }

  /* ── Toast ── */
  .am-toast { position:fixed; top:80px; right:24px; z-index:999; display:flex; align-items:center; gap:10px; padding:13px 20px; font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; box-shadow:0 8px 32px rgba(0,0,0,0.2); animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .am-toast.success { background:#0a2a1a; border-left:3px solid #10b981; color:#34d399; }
  .am-toast.error   { background:#2a0a0a; border-left:3px solid #e8001d; color:#ff6b7a; }
`;

/* ── Constants ── */
const FILTERS = [
  { id: 'all',     label: 'All',         color: ''       },
  { id: 'unread',  label: 'Unread',      color: 'red'    },
  { id: 'pending', label: 'Needs Reply', color: 'yellow' },
  { id: 'replied', label: 'Replied',     color: 'green'  },
];

/* ── Helpers ── */
const fmtTime = (iso) => {
  const d = new Date(iso), now = new Date(), diff = now - d;
  if (diff < 60000)     return 'Just now';
  if (diff < 3600000)   return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const fmtFull = (iso) => new Date(iso).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

const groupByUser = (messages) => {
  const map = {};
  messages.forEach(m => {
    if (!map[m.user_id]) map[m.user_id] = { user_id: m.user_id, user_name: m.user_name, user_email: m.user_email, messages: [] };
    map[m.user_id].messages.push(m);
  });
  return Object.values(map);
};

/* ── Same groupByDate as UserMessages but flattens user+admin into time-sorted events ── */
const groupByDate = (msgs) => {
  // Build a flat list of individual bubble events, each with its own timestamp
  const events = [];
  msgs.forEach(m => {
    events.push({ time: new Date(m.created_at), kind: 'user', data: m });
    if (m.reply) {
      events.push({ time: new Date(m.updated_at || m.replied_at || m.created_at), kind: 'admin', data: m });
    }
  });
  // Sort ascending by time — newest bubble always ends up at the bottom
  events.sort((a, b) => a.time - b.time);
  // Inject date dividers exactly like UserMessages does
  const out = []; let last = null;
  events.forEach(ev => {
    const d = ev.time.toDateString();
    if (d !== last) { out.push({ type: 'divider', date: ev.time.toISOString() }); last = d; }
    out.push(ev);
  });
  return out;
};

/* ── Vehicle card ── */
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
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [vehicleId]);
  if (!vehicleId) return null;
  if (loading)   return <div className="am-vehicle-card-skeleton" />;
  if (!vehicle)  return null;
  const img = vehicle.images?.[0]?.image_path || null;
  const price = parseFloat(vehicle.price || 0);
  const isAvail = vehicle.availability_status === 'available';
  const isRes   = vehicle.availability_status === 'reserved';
  const sc = isAvail ? {bg:'rgba(16,185,129,0.1)',c:'#059669'} : isRes ? {bg:'rgba(245,196,0,0.12)',c:'#92400e'} : {bg:'rgba(232,0,29,0.08)',c:'#e8001d'};
  return (
    <div className="am-vehicle-card">
      <div className="am-vehicle-card-img">
        {img ? <img src={img} alt={vehicle.name}/> : <span className="no-img">{vehicle.type==='motorcycle'?<FaMotorcycle/>:<FaCar/>}</span>}
        <div className="type-badge">{vehicle.type==='motorcycle'?<FaMotorcycle style={{fontSize:8}}/>:<FaCar style={{fontSize:8}}/>} {vehicle.type}</div>
      </div>
      <div className="am-vehicle-card-body">
        <div>
          <div className="am-vehicle-card-name">{vehicle.name}</div>
          <div className="am-vehicle-card-meta">{vehicle.brand} · {vehicle.year}</div>
        </div>
        <div>
          <div className="am-vehicle-card-footer">
            <div className="am-vehicle-card-price"><span>₱</span>{price.toLocaleString()}</div>
            <div className="am-vehicle-card-status" style={{background:sc.bg,color:sc.c}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:sc.c,display:'inline-block'}}/> {vehicle.availability_status}
            </div>
          </div>
          <Link to={`/vehicle/${vehicleId}`} className="am-vehicle-card-link" target="_blank" rel="noopener noreferrer">
            <FaExternalLinkAlt style={{fontSize:8}}/> View listing
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ── Main ── */
const AdminMessages = () => {
  const { user, isAdmin } = useAuth();
  const navigate          = useNavigate();

  const messagesAreaRef = useRef(null); // ref on scroll container — same as UserMessages
  const textareaRef     = useRef(null);

  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [alert,      setAlert]      = useState(null);
  const [activeTab,  setActiveTab]  = useState('all');
  const [search,     setSearch]     = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [replyText,  setReplyText]  = useState('');
  const [sending,    setSending]    = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => { if (!user) navigate('/login'); else if (!isAdmin()) navigate('/'); }, [user, isAdmin, navigate]);
  useEffect(() => { if (!alert) return; const t = setTimeout(() => setAlert(null), 4000); return () => clearTimeout(t); }, [alert]);

  // Exact same scrollToBottom as UserMessages
  const scrollToBottom = useCallback(() => {
    const el = messagesAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages/all');
      setMessages(res.data);
    } catch { setAlert({ type: 'error', message: 'Failed to load messages.' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Exact same useEffect as UserMessages — wait one tick after DOM paints, then scroll
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(t);
  }, [messages, loading, selectedId, scrollToBottom]);

  const openConversation = async (userId) => {
    setSelectedId(userId);
    setReplyText('');
    setReplyingTo(null);
    const unread = messages.filter(m => m.user_id === userId && !m.is_read);
    for (const m of unread) { try { await api.put(`/messages/${m.id}/read`); } catch {} }
    if (unread.length) setMessages(prev => prev.map(m => m.user_id === userId ? { ...m, is_read: true } : m));
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !selectedId) return;
    const convoMsgs = messages.filter(m => m.user_id === selectedId);
    const target = [...convoMsgs].reverse().find(m => !m.reply) || convoMsgs[convoMsgs.length - 1];
    if (!target) return;
    setSending(true);
    try {
      await api.put(`/messages/${target.id}/reply`, { reply: text });
      setMessages(prev => prev.map(m =>
        m.id === target.id ? { ...m, reply: text, is_read: true, updated_at: new Date().toISOString() } : m
      ));
      setReplyText('');
      setReplyingTo(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      setAlert({ type: 'success', message: 'Reply sent!' });
    } catch (e) { setAlert({ type: 'error', message: e.response?.data?.message || 'Failed to send.' }); }
    finally { setSending(false); }
  };

  const handleReply = (msg, sender) => {
    setReplyingTo({ id: msg.id, text: sender === 'admin' ? msg.reply : msg.message, sender });
    textareaRef.current?.focus();
  };

  const conversations = groupByUser(messages);

  const filteredConvos = conversations.filter(conv => {
    const hasUnread  = conv.messages.some(m => !m.is_read);
    const hasPending = conv.messages.some(m => !m.reply);
    const hasReplied = conv.messages.some(m => !!m.reply);
    const matchTab = activeTab === 'unread' ? hasUnread : activeTab === 'pending' ? hasPending : activeTab === 'replied' ? hasReplied : true;
    if (!matchTab) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return conv.user_name?.toLowerCase().includes(q) || conv.user_email?.toLowerCase().includes(q)
      || conv.messages.some(m => m.message?.toLowerCase().includes(q) || m.vehicle_name?.toLowerCase().includes(q));
  }).sort((a, b) => {
    const au = a.messages.some(m => !m.is_read) ? 1 : 0, bu = b.messages.some(m => !m.is_read) ? 1 : 0;
    if (au !== bu) return bu - au;
    return new Date(b.messages[b.messages.length - 1]?.created_at || 0) - new Date(a.messages[a.messages.length - 1]?.created_at || 0);
  });

  const selectedConvo = conversations.find(c => c.user_id === selectedId);
  const unreadCount   = conversations.filter(c => c.messages.some(m => !m.is_read)).length;
  const pendingCount  = conversations.filter(c => c.messages.some(m => !m.reply)).length;
  const allReplied    = conversations.filter(c => c.messages.every(m => !!m.reply)).length;
  const tabBadge = (id) => id === 'unread' ? (unreadCount || null) : id === 'pending' ? (pendingCount || null) : null;

  return (
    <div className="am-shell">
      <style>{css}</style>

      {alert && (
        <div className={`am-toast ${alert.type}`}>
          {alert.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />} {alert.message}
        </div>
      )}

      {/* Top bar */}
      <div className="am-topbar">
        <div className="am-topbar-left">
          <div className="am-topbar-icon"><FaEnvelope /></div>
          <div>
            <div className="am-topbar-title">Messages Inbox</div>
            <div className="am-topbar-sub">Customer Inquiries</div>
          </div>
        </div>
        <div className="am-topbar-stats">
          {[
            { label: 'Conversations', val: conversations.length, color: '#fff'    },
            { label: 'Unread',        val: unreadCount,          color: '#e8001d' },
            { label: 'Needs Reply',   val: pendingCount,         color: '#f5c400' },
            { label: 'Replied',       val: allReplied,           color: '#34d399' },
          ].map(s => (
            <div key={s.label} className="am-topbar-stat">
              <span className="am-topbar-stat-val" style={{ color: s.color }}>{s.val}</span>
              <span className="am-topbar-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="am-body">

        {/* Sidebar */}
        <div className="am-sidebar">
          <div className="am-sidebar-header">
            <div className="am-sidebar-search">
              <FaSearch className="srch-icon" />
              <input placeholder="Search conversations…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="srch-clear" onClick={() => setSearch('')}><FaTimes /></button>}
            </div>
            <div className="am-filter-tabs">
              {FILTERS.map(f => {
                const badge = tabBadge(f.id);
                return (
                  <button key={f.id} className={`am-filter-tab ${activeTab === f.id ? `active ${f.color}` : ''}`} onClick={() => setActiveTab(f.id)}>
                    {f.label}{badge ? <span className="tab-badge">{badge}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
              <div style={{ width:26, height:26, border:'3px solid #e5e7eb', borderTopColor:'#e8001d', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} />
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="am-sidebar-empty">
              <FaInbox />
              <p>{search ? `No results for "${search}"` : 'No conversations here yet.'}</p>
            </div>
          ) : (
            <div className="am-conv-list">
              {filteredConvos.map(conv => {
                const lastMsg    = conv.messages[conv.messages.length - 1];
                const hasUnread  = conv.messages.some(m => !m.is_read);
                const hasPending = conv.messages.some(m => !m.reply);
                const isActive   = selectedId === conv.user_id;
                return (
                  <div key={conv.user_id} className={`am-conv-item ${hasUnread ? 'unread' : ''} ${isActive ? 'active' : ''}`} onClick={() => openConversation(conv.user_id)}>
                    <div className={`am-conv-avatar ${hasUnread ? 'unread-av' : ''}`}>
                      <FaUser />{hasUnread && <span className="am-unread-dot" />}
                    </div>
                    <div className="am-conv-info">
                      <div className="am-conv-name">{conv.user_name}</div>
                      <div className="am-conv-preview">
                        {lastMsg.vehicle_name ? `🚗 ${lastMsg.vehicle_name}: ${lastMsg.message}` : lastMsg.reply ? `You: ${lastMsg.reply}` : lastMsg.message}
                      </div>
                    </div>
                    <div className="am-conv-meta">
                      <span className="am-conv-time">{fmtTime(lastMsg.created_at)}</span>
                      {hasUnread ? <span className="am-conv-count">{conv.messages.filter(m => !m.is_read).length}</span>
                        : hasPending ? <FaCircle className="am-conv-pending-icon" />
                        : <FaCheckDouble className="am-conv-replied-icon" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat panel */}
        {!selectedConvo ? (
          <div className="am-no-select">
            <div className="am-no-select-ring"><FaEnvelope /></div>
            <h3>Select a Conversation</h3>
            <p>Choose a customer from the left to view messages and reply.</p>
          </div>
        ) : (
          <div className="am-chat">
            {/* Chat header */}
            <div className="am-chat-header">
              <div className="am-chat-header-avatar"><FaUser /></div>
              <div>
                <div className="am-chat-header-name">{selectedConvo.user_name}</div>
                <div className="am-chat-header-email">{selectedConvo.user_email}</div>
              </div>
              <div className="am-chat-header-badges">
                <span className="am-chat-badge" style={{ background:'rgba(0,0,0,0.05)', color:'#374151' }}>
                  {selectedConvo.messages.length} msg{selectedConvo.messages.length !== 1 ? 's' : ''}
                </span>
                {selectedConvo.messages.every(m => !!m.reply) && (
                  <span className="am-chat-badge" style={{ background:'rgba(16,185,129,0.1)', color:'#065f46' }}>✓ All Replied</span>
                )}
              </div>
            </div>

            {/* Messages — ref on container, same as UserMessages */}
            <div className="am-messages-area" ref={messagesAreaRef}>
              <div className="am-messages-inner">
                {groupByDate(selectedConvo.messages).map((item, idx) => {
                  if (item.type === 'divider') return (
                    <div key={`d${idx}`} className="am-date-divider">{fmtDate(item.date)}</div>
                  );

                  const { kind, data: m } = item;

                  if (kind === 'user') return (
                    <div key={`user-${m.id}`} className="am-msg-group">
                      {m.vehicle_id && <VehicleCard vehicleId={m.vehicle_id} />}
                      <div className="am-bubble-sender">{selectedConvo.user_name}</div>
                      <div className="am-bubble-row">
                        <div className="am-bubble-avatar user-av"><FaUser style={{fontSize:11}}/></div>
                        <div className="am-bubble-wrap">
                          <div className="am-bubble user-bubble">
                            {m.reply_to_text && (
                              <div className="am-reply-preview">
                                <div className="am-reply-preview-label">Replying to</div>
                                {m.reply_to_text}
                              </div>
                            )}
                            {m.message}
                          </div>
                          <div className="am-bubble-time">{fmtFull(m.created_at)}</div>
                        </div>
                        <div className="am-bubble-actions">
                          <button className="am-action-btn" title="Reply" onClick={() => handleReply(m, 'user')}><FaReply /></button>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div key={`admin-${m.id}`} className="am-msg-group">
                      <div className="am-bubble-sender" style={{ textAlign:'right' }}>You (Admin)</div>
                      <div className="am-bubble-row admin-row">
                        <div className="am-bubble-avatar admin-av"><FaShieldAlt style={{fontSize:11}}/></div>
                        <div className="am-bubble-wrap">
                          <div className="am-bubble admin-bubble">{m.reply}</div>
                          <div className="am-bubble-time" style={{ justifyContent:'flex-end' }}>
                            <FaCheckDouble style={{ fontSize:9, color:'#10b981' }} />
                            {fmtFull(m.updated_at || m.replied_at || m.created_at)}
                          </div>
                        </div>
                        <div className="am-bubble-actions">
                          <button className="am-action-btn" title="Reply" onClick={() => handleReply(m, 'admin')}><FaReply /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reply box */}
            <div className="am-reply-box">
              {replyingTo && (
                <div className="am-replying-to-banner">
                  <FaReply style={{ color:'#e8001d', fontSize:11, flexShrink:0 }} />
                  <span className="am-replying-to-label">Replying to {replyingTo.sender === 'admin' ? 'yourself' : selectedConvo.user_name}</span>
                  <span className="am-replying-to-text">{replyingTo.text}</span>
                  <button className="am-replying-to-close" onClick={() => setReplyingTo(null)}><FaTimes /></button>
                </div>
              )}
              <div className="am-reply-inner">
                <textarea
                  ref={textareaRef}
                  className="am-reply-textarea"
                  rows={1}
                  placeholder={replyingTo ? `Reply to ${replyingTo.sender === 'admin' ? 'your message' : selectedConvo.user_name}…` : `Reply to ${selectedConvo.user_name}…`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px'; }}
                />
                <button className="am-reply-send" onClick={handleSendReply} disabled={!replyText.trim() || sending}>
                  {sending
                    ? <span style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.6s linear infinite' }} />
                    : <FaPaperPlane style={{ fontSize:12 }} />}
                </button>
              </div>
              <div className="am-reply-hint">Enter to send · Shift+Enter for new line</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;