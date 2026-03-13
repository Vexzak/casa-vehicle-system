import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  FaCar, FaMotorcycle, FaMapMarkerAlt, FaArrowLeft, FaCheckCircle,
  FaTimesCircle, FaGasPump, FaCog, FaTachometerAlt, FaRoad, FaPalette,
  FaUsers, FaTag, FaExpand, FaCompress, FaHeart, FaRegHeart, FaCalendarAlt,
  FaClipboardCheck, FaShieldAlt, FaKey, FaInfoCircle, FaPhoneAlt,
  FaDirections, FaClock, FaCheckDouble, FaTimes, FaBalanceScale, FaCarSide,
  FaWrench, FaSnowflake, FaBluetooth, FaCamera, FaParking,
  FaTachometerAlt as FaSpeed, FaRoad as FaRoad2, FaSun, FaFire, FaLock,
  FaAdjust, FaUsb, FaVolumeUp, FaWifi, FaAngleDoubleUp, FaCompressAlt,
  FaChargingStation, FaEnvelope, FaPaperPlane,
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaPhone,
  FaBoxes,
} from 'react-icons/fa';
import { MdElectricBike, MdAirlineSeatReclineExtra, MdLocalParking } from 'react-icons/md';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/* ─── Feature presets ──────────────────────────────────────────────────────── */
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
  { key: 'abs',           icon: <FaShieldAlt />,               label: 'ABS Brakes' },
  { key: 'traction',      icon: <FaRoad />,                    label: 'Traction Control' },
  { key: 'bluetooth',     icon: <FaBluetooth />,               label: 'Bluetooth Helmet Sync' },
  { key: 'quickshift',    icon: <FaWrench />,                  label: 'Quickshifter' },
  { key: 'ridingmodes',   icon: <FaAdjust />,                  label: 'Riding Modes' },
  { key: 'keyless',       icon: <FaKey />,                     label: 'Keyless Ignition' },
  { key: 'tft',           icon: <FaCamera />,                  label: 'TFT Display' },
  { key: 'cruise',        icon: <FaRoad />,                    label: 'Cruise Control' },
  { key: 'led',           icon: <FaSun />,                     label: 'Full LED Lighting' },
  { key: 'usb',           icon: <FaUsb />,                     label: 'USB Charging Port' },
  { key: 'launch',        icon: <FaFire />,                    label: 'Launch Control' },
  { key: 'wheelie',       icon: <FaTachometerAlt />,           label: 'Wheelie Control' },
  { key: 'cornering',     icon: <FaCompressAlt />,             label: 'Cornering ABS' },
  { key: 'handguards',    icon: <FaLock />,                    label: 'Hand Guards' },
  { key: 'panniers',      icon: <MdLocalParking />,            label: 'Panniers / Saddlebags' },
  { key: 'heated_grips',  icon: <FaSnowflake />,               label: 'Heated Grips' },
  { key: 'ev',            icon: <MdElectricBike />,            label: 'Electric Motor' },
  { key: 'slipper',       icon: <FaWrench />,                  label: 'Slipper Clutch' },
];

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');
  @keyframes spin      { to { transform: rotate(360deg); } }
  @keyframes toastIn   { from{opacity:0;transform:translateX(30px) scale(0.95)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes modalIn   { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes pulseRed  { 0%,100%{box-shadow:0 0 0 0 rgba(232,0,29,0.4)} 50%{box-shadow:0 0 0 12px rgba(232,0,29,0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes msgExpand { from{opacity:0;max-height:0} to{opacity:1;max-height:300px} }
  @keyframes roboGlitch {
    0%,100% { transform: translateX(0);   clip-path: inset(0 0 0 0); }
    10%     { transform: translateX(-4px); clip-path: inset(15% 0 70% 0); filter: hue-rotate(90deg); }
    20%     { transform: translateX(4px);  clip-path: inset(60% 0 10% 0); filter: hue-rotate(180deg); }
    30%     { transform: translateX(-2px); clip-path: inset(0 0 0 0); }
    40%     { transform: translateX(2px);  clip-path: inset(40% 0 40% 0); filter: hue-rotate(270deg); }
    50%     { transform: translateX(0);    clip-path: inset(0 0 0 0); filter: none; }
  }
  @keyframes roboScanLine {
    0%   { top: -4px; opacity: 1; }
    100% { top: 110%; opacity: 0; }
  }
  @keyframes roboPulse {
    0%,100% { opacity: 0; }
    50%     { opacity: 1; }
  }
  @keyframes roboFlicker {
    0%,95%,100% { opacity: 1; }
    96%         { opacity: 0.4; }
    97%         { opacity: 1; }
    98%         { opacity: 0.2; }
    99%         { opacity: 1; }
  }
  @keyframes roadScroll {
    from { background-position: 0 0; }
    to   { background-position: 0 200px; }
  }
  @keyframes speedLines {
    from { transform: translateX(-100%); opacity: 0; }
    60%  { opacity: 1; }
    to   { transform: translateX(200%); opacity: 0; }
  }
  @keyframes bgPulse {
    0%,100% { opacity: 0.6; }
    50%     { opacity: 1; }
  }
  @keyframes spotlightPulse {
    0%,100% { opacity: 0.55; transform: scale(1); }
    50%     { opacity: 0.75; transform: scale(1.06); }
  }
  @keyframes heartPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.4); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  @keyframes stockPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  .vd-img-swap-enter { animation: fadeIn 0.3s ease forwards, roboFlicker 0.3s ease forwards; }
  .vd-img-swap-glitch { animation: roboGlitch 0.18s steps(2) forwards; }
  .vd-scan-line {
    position: absolute; left: 0; right: 0; height: 3px; z-index: 10;
    background: linear-gradient(90deg, transparent, rgba(0,220,255,0.9), rgba(232,0,29,0.7), transparent);
    box-shadow: 0 0 12px rgba(0,220,255,0.8), 0 0 24px rgba(232,0,29,0.4);
    animation: roboScanLine 0.45s cubic-bezier(0.4,0,0.6,1) forwards;
    pointer-events: none;
  }
  .vd-scan-overlay {
    position: absolute; inset: 0; z-index: 9; pointer-events: none;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,220,255,0.03) 2px, rgba(0,220,255,0.03) 4px);
    animation: roboPulse 0.45s ease forwards;
  }
  .vd-corner-tl, .vd-corner-tr, .vd-corner-bl, .vd-corner-br {
    position: absolute; width: 18px; height: 18px; z-index: 11; pointer-events: none;
    animation: roboPulse 0.45s ease forwards;
  }
  .vd-corner-tl { top: 8px; left: 8px; border-top: 2px solid rgba(0,220,255,0.9); border-left: 2px solid rgba(0,220,255,0.9); }
  .vd-corner-tr { top: 8px; right: 8px; border-top: 2px solid rgba(232,0,29,0.9); border-right: 2px solid rgba(232,0,29,0.9); }
  .vd-corner-bl { bottom: 8px; left: 8px; border-bottom: 2px solid rgba(232,0,29,0.9); border-left: 2px solid rgba(232,0,29,0.9); }
  .vd-corner-br { bottom: 8px; right: 8px; border-bottom: 2px solid rgba(0,220,255,0.9); border-right: 2px solid rgba(0,220,255,0.9); }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #ffffff; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #f0f0f0; }
  ::-webkit-scrollbar-thumb { background: #e8001d; border-radius: 2px; }

  .vd-tab-active      { color: #fff !important; border-bottom-color: #e8001d !important; background: rgba(232,0,29,0.06) !important; }
  .vd-spec-hover:hover{ border-left-color: #e8001d !important; background: rgba(232,0,29,0.05) !important; transform: translateX(2px); }
  .vd-related-hover:hover { transform: translateX(6px); border-left-color: #e8001d !important; }
  .vd-feature-item:hover  { background: rgba(232,0,29,0.08) !important; border-color: rgba(232,0,29,0.3) !important; }
  .vd-fullscreen { position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.96);display:flex;align-items:center;justify-content:center; }
  .vd-fullscreen img { max-width:90vw;max-height:90vh;object-fit:contain; }
  .vd-modal-overlay { position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.85);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px; }
  .vd-modal { animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
  .vd-compare-panel { position:fixed;bottom:0;left:0;right:0;z-index:400;transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.34,1.2,0.64,1); }
  .vd-compare-panel.open { transform:translateY(0); }
  select option { background:#1a1a1a;color:#fff; }
  .vd-wishlist-btn:hover svg { color: #e8001d !important; transform: scale(1.2); }
  .vd-wishlist-btn svg { transition: all 0.2s; }

  .vd-racing-bg {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, #0a0a0a 0%, #111 40%, #0d0d0d 100%);
    overflow: hidden; z-index: 0;
  }
  .vd-racing-bg::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      repeating-linear-gradient(180deg, transparent 0px, transparent 30px, rgba(232,0,29,0.08) 30px, rgba(232,0,29,0.08) 32px),
      repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(255,255,255,0.015) 18px, rgba(255,255,255,0.015) 19px);
    background-size: 100% 200px, 60px 100%;
    animation: roadScroll 1.8s linear infinite;
  }
  .vd-racing-bg::after {
    content: '';
    position: absolute; top: 30%; left: -20%; width: 40%; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(232,0,29,0.5), transparent);
    animation: speedLines 1.4s ease-in-out infinite;
    box-shadow: 0 8px 0 rgba(232,0,29,0.2), 0 18px 0 rgba(232,0,29,0.1), 0 -8px 0 rgba(245,196,0,0.15);
  }
  .vd-racing-streak {
    position: absolute; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    animation: speedLines linear infinite; pointer-events: none;
  }
  .vd-racing-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: bgPulse 3s ease-in-out infinite;
  }
  .vd-racing-glow {
    position: absolute; bottom: 0; left: 10%; right: 10%; height: 80px;
    background: radial-gradient(ellipse at center bottom, rgba(232,0,29,0.25) 0%, transparent 70%);
    pointer-events: none; z-index: 1;
  }
  .vd-spotlight {
    position: absolute; z-index: 1; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,255,255,0.13) 0%, rgba(255,240,200,0.07) 35%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 30% 60%, rgba(232,0,29,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 70% 60%, rgba(245,196,0,0.06) 0%, transparent 60%);
    animation: spotlightPulse 3s ease-in-out infinite;
  }
  .vd-vehicle-img {
    position: relative; z-index: 2; width: 100%; height: 100%;
    object-fit: contain !important; padding: 16px 24px;
    filter: drop-shadow(0 4px 20px rgba(0,0,0,0.5)) drop-shadow(0 0 40px rgba(255,255,255,0.08));
  }
  .vd-vehicle-img-cover {
    position: relative; z-index: 2; width: 100%; height: 100%;
    object-fit: cover !important;
  }

  .vd-color-swatch {
    position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 10px 14px 8px; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.1);
    cursor: pointer; transition: all 0.2s; min-width: 72px;
  }
  .vd-color-swatch:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.25); transform: translateY(-2px); }
  .vd-color-swatch.active { border-color: var(--swatch-hex) !important; background: rgba(255,255,255,0.1); box-shadow: 0 0 14px color-mix(in srgb, var(--swatch-hex) 40%, transparent); }
  .vd-color-swatch.out-of-stock { opacity: 0.45; cursor: default; }
  .vd-color-swatch.out-of-stock:hover { transform: none; }
  .vd-color-swatch .dot { width: 26px; height: 26px; border-radius: 50%; background: var(--swatch-hex); transition: box-shadow 0.2s, transform 0.2s; }
  .vd-color-swatch.active .dot { box-shadow: 0 0 10px var(--swatch-hex), 0 0 20px color-mix(in srgb, var(--swatch-hex) 50%, transparent); transform: scale(1.15); }
  .vd-color-swatch .label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.45); text-align: center; white-space: nowrap; transition: color 0.2s; }
  .vd-color-swatch.active .label { color: #fff; }
  .vd-color-swatch .stock-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-align: center; white-space: nowrap; transition: color 0.2s; animation: stockPop 0.3s ease; }
  .vd-color-swatch .active-dot { position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: #e8001d; }

  .vd-pick-color-hint {
    position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
    background: rgba(9,9,9,0.85); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.55); font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 5px 14px; white-space: nowrap; z-index: 3;
    display: flex; align-items: center; gap: 6px; pointer-events: none;
  }

  /* ── Stock Banner ── */
  .vd-stock-banner {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    border-left: 3px solid;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    animation: stockPop 0.3s ease;
  }
  .vd-stock-banner.ok    { background: rgba(16,185,129,0.07); border-color: #10b981; color: #34d399; }
  .vd-stock-banner.low   { background: rgba(245,196,0,0.07);  border-color: #f5c400; color: #f5c400; }
  .vd-stock-banner.out   { background: rgba(232,0,29,0.08);   border-color: #e8001d; color: #ff6b7a; }

  .vd-msg-wrap { overflow: hidden; animation: msgExpand 0.25s ease forwards; margin-bottom: 16px; }
  .vd-msg-box { background: rgba(59,130,246,0.04); border: 1px solid rgba(59,130,246,0.2); border-top: 2px solid #3b82f6; padding: 14px; }
  .vd-msg-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .vd-msg-vehicle { color: rgba(255,255,255,0.55); font-size: 10px; margin-left: 4px; font-weight: 600; letter-spacing: 0.06em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; display: inline-block; vertical-align: middle; }
  .vd-msg-textarea { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-family: 'Barlow', sans-serif; font-size: 13px; line-height: 1.6; resize: none; outline: none; display: block; transition: border-color 0.2s; margin-bottom: 10px; }
  .vd-msg-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .vd-msg-textarea::placeholder { color: rgba(255,255,255,0.22); }
  .vd-msg-actions { display: flex; gap: 8px; align-items: center; }
  .vd-msg-send { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 14px; border: none; cursor: pointer; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.2s; }
  .vd-msg-send:disabled { cursor: not-allowed; }
  .vd-msg-cancel { padding: 10px 13px; background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.35); cursor: pointer; font-size: 12px; transition: all 0.2s; }
  .vd-msg-cancel:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.6); }
  .vd-msg-hint { margin-top: 8px; font-family: 'Barlow', sans-serif; font-size: 10px; color: rgba(255,255,255,0.18); display: flex; align-items: center; gap: 5px; }
  .vd-msg-sent { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 20px 14px; animation: fadeIn 0.3s ease; }
  .vd-msg-sent-icon { width: 40px; height: 40px; border-radius: 50%; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); display: flex; align-items: center; justify-content: center; color: #34d399; font-size: 18px; }
  .vd-msg-sent-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #34d399; }
  .vd-msg-sent-sub { font-family: 'Barlow', sans-serif; font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; }

  /* ── Wishlist Color Modal ── */
  .vd-wl-modal-box {
    background: #111; border-top: 4px solid #e8001d;
    padding: 32px 28px 28px; position: relative;
    max-width: 480px; width: 100%;
    animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .vd-wl-modal-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 28px;
    color: #fff; letter-spacing: 0.05em; margin-bottom: 6px; line-height: 1;
  }
  .vd-wl-modal-sub {
    font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.35);
    margin-bottom: 24px;
  }
  .vd-wl-swatch-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .vd-wl-swatch {
    display: flex; align-items: center; gap: 9px;
    padding: 10px 14px; cursor: pointer;
    background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.1);
    transition: all 0.2s; min-width: 110px;
  }
  .vd-wl-swatch:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
  .vd-wl-swatch.selected { border-color: var(--sw-hex); background: rgba(255,255,255,0.08); box-shadow: 0 0 12px color-mix(in srgb, var(--sw-hex) 35%, transparent); }
  .vd-wl-swatch .sw-dot { width: 20px; height: 20px; border-radius: 50%; background: var(--sw-hex); flex-shrink: 0; transition: transform 0.2s; }
  .vd-wl-swatch.selected .sw-dot { transform: scale(1.2); box-shadow: 0 0 8px var(--sw-hex); }
  .vd-wl-swatch .sw-name { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.55); transition: color 0.2s; }
  .vd-wl-swatch.selected .sw-name { color: #fff; }
  .vd-wl-swatch .sw-check { margin-left: auto; color: #e8001d; font-size: 12px; }

  .vd-wl-modal-actions { display: flex; gap: 10px; }
  .vd-wl-confirm-btn {
    flex: 1; padding: 13px; border: none; cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
  }
  .vd-wl-confirm-btn:disabled { cursor: not-allowed; opacity: 0.5; }
  .vd-wl-cancel-btn {
    padding: 13px 18px; background: none; border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.4); cursor: pointer; font-size: 13px; transition: all 0.2s;
  }
  .vd-wl-cancel-btn:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); }
  .vd-wl-skip-btn {
    width: 100%; margin-top: 10px; padding: 9px; background: none;
    border: 1px dashed rgba(255,255,255,0.1); color: rgba(255,255,255,0.3);
    font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s;
  }
  .vd-wl-skip-btn:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.55); }

  /* ── Footer ── */
  .vd-footer { background: #070707; border-top: 3px solid #e8001d; margin-top: 0; }
  .vd-footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
  .vd-footer-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 60px; padding: 60px 0 50px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .vd-footer-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .vd-footer-emblem { width: 40px; height: 40px; background: #e8001d; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .vd-footer-brand { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #ffffff; letter-spacing: 0.08em; }
  .vd-footer-tagline { font-size: 14px; font-weight: 300; line-height: 1.6; color: rgba(255,255,255,0.45); margin-bottom: 28px; }
  .vd-footer-socials { display: flex; gap: 12px; }
  .vd-social-icon { width: 38px; height: 38px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.45); display: flex; align-items: center; justify-content: center; font-size: 15px; text-decoration: none; clip-path: polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%); transition: all 0.2s; }
  .vd-social-icon:hover { background: #e8001d; border-color: #e8001d; color: #ffffff; }
  .vd-footer-col-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.06em; color: #ffffff; margin-bottom: 20px; }
  .vd-footer-about-text { font-size: 14px; line-height: 1.65; font-weight: 300; color: rgba(255,255,255,0.45); }
  .vd-footer-contact-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.45); }
  .vd-footer-contact-icon { color: #e8001d; font-size: 14px; margin-top: 2px; flex-shrink: 0; }
  .vd-footer-bottom { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
  .vd-footer-bottom-links { display: flex; gap: 24px; }
  .vd-footer-bottom-links a { color: rgba(255,255,255,0.3); text-decoration: none; transition: color 0.2s; }
  .vd-footer-bottom-links a:hover { color: #e8001d; }
  @media (max-width: 1024px) { .vd-footer-top { grid-template-columns: 1fr 1fr; gap: 40px; } .vd-footer-brand-col { grid-column: 1 / -1; } }
  @media (max-width: 768px) { .vd-footer-top { grid-template-columns: 1fr; gap: 28px; padding: 40px 0 30px; } .vd-footer-bottom { flex-direction: column; gap: 12px; text-align: center; } .vd-footer-bottom-links { gap: 16px; flex-wrap: wrap; justify-content: center; } }
`;

/* ─── Wishlist Color Picker Modal ─────────────────────────────────────────── */
const WishlistColorModal = ({ vehicle, colorVariants, onConfirm, onClose }) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async (colorToSave) => {
    setSaving(true);
    await onConfirm(colorToSave);
    setSaving(false);
  };

  const isLight = (hex) =>
    ['#f5f5f5','#f0ede8','#fffff0','#e5e4e2','#f5e642','#f5c400','#f7e7ce','#d2b48c','#c2b280','#87ceeb','#c0c0c0'].includes(hex);

  return (
    <div className="vd-modal-overlay" onClick={onClose}>
      <div className="vd-wl-modal-box" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 17, cursor: 'pointer' }}>
          <FaTimes />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(232,0,29,0.12)', border: '1px solid rgba(232,0,29,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8001d', fontSize: 16 }}>
            <FaHeart style={{ animation: 'heartPop 0.5s ease' }} />
          </div>
          <div>
            <div className="vd-wl-modal-title">SAVE TO WISHLIST</div>
          </div>
        </div>
        <div className="vd-wl-modal-sub">{vehicle.name} — Choose your preferred color</div>

        <div className="vd-wl-swatch-grid">
          {colorVariants.map(c => {
            const isSelected = selectedColor?.name === c.name;
            return (
              <button
                key={c.name}
                className={`vd-wl-swatch ${isSelected ? 'selected' : ''}`}
                style={{ '--sw-hex': c.hex }}
                onClick={() => setSelectedColor(isSelected ? null : c)}
              >
                <span className="sw-dot" style={{ border: isLight(c.hex) ? '1.5px solid rgba(0,0,0,0.2)' : '1.5px solid rgba(255,255,255,0.15)' }} />
                <span className="sw-name">{c.name}</span>
                {isSelected && <FaCheckCircle className="sw-check" />}
              </button>
            );
          })}
        </div>

        <div className="vd-wl-modal-actions">
          <button
            className="vd-wl-confirm-btn"
            disabled={!selectedColor || saving}
            onClick={() => handleConfirm(selectedColor)}
            style={{ background: selectedColor ? '#e8001d' : 'rgba(255,255,255,0.06)', color: selectedColor ? '#fff' : 'rgba(255,255,255,0.2)' }}
          >
            {saving
              ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> Saving…</>
              : <><FaHeart style={{ fontSize: 12 }} /> Save {selectedColor ? `— ${selectedColor.name}` : 'to Wishlist'}</>
            }
          </button>
          <button className="vd-wl-cancel-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <button className="vd-wl-skip-btn" onClick={() => handleConfirm(null)} disabled={saving}>
          Save without selecting a color
        </button>
      </div>
    </div>
  );
};

/* ─── Reservation Modal ───────────────────────────────────────────────────── */
const ReservationModal = ({ vehicle, selectedColor, onClose }) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 10);
  const formatted = expiryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const isLight = (hex) =>
    ['#f5f5f5','#f0ede8','#fffff0','#e5e4e2','#f5e642','#f5c400','#f7e7ce','#d2b48c','#c2b280','#87ceeb','#c0c0c0'].includes(hex);

  return (
    <div className="vd-modal-overlay" onClick={onClose}>
      <div className="vd-modal" style={{ maxWidth: 520, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: '#111', borderTop: '4px solid #e8001d', padding: '36px 32px 32px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer' }}><FaTimes /></button>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pulseRed 2s infinite' }}>
              <FaCheckDouble style={{ fontSize: 30, color: '#34d399' }} />
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#fff', letterSpacing: '0.05em', lineHeight: 1, marginBottom: 6 }}>RESERVATION CONFIRMED</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{vehicle?.name}</div>

            {/* ── Show reserved color if applicable ── */}
            {selectedColor && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '6px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `3px solid ${selectedColor.hex}` }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: selectedColor.hex, border: isLight(selectedColor.hex) ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                  Color: {selectedColor.name}
                </span>
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #e8001d', padding: '18px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Reservation Expires</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: '#f5c400' }}>
                <FaClock style={{ fontSize: 11 }} /> 10 Days
              </div>
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>{formatted}</div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', padding: '16px 18px', marginBottom: 24, lineHeight: 1.7 }}>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              🎉 <strong style={{ color: '#fff' }}>Thank you for your reservation!</strong> Visit the dealership within <strong style={{ color: '#f5c400' }}>10 days</strong> to complete the paperwork and transaction.
            </p>
          </div>
          <div style={{ marginBottom: 24 }}>
            {[
              { icon: <FaCalendarAlt />, step: '01', text: 'Visit our dealership within 10 days' },
              { icon: <FaClipboardCheck />, step: '02', text: 'Bring a valid ID & proof of financing' },
              { icon: <FaKey />, step: '03', text: 'Complete paperwork & transaction' },
              { icon: <FaCarSide />, step: '04', text: 'Drive away in your dream vehicle!' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 32, height: 32, background: 'rgba(232,0,29,0.1)', border: '1px solid rgba(232,0,29,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8001d', fontSize: 13, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#e8001d', marginRight: 8 }}>{s.step}</span>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{s.text}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '13px', background: '#e8001d', border: 'none', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              View My Reservations
            </button>
            <button onClick={onClose} style={{ padding: '13px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><FaPhoneAlt /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Compare Drawer ──────────────────────────────────────────────────────── */
const CompareDrawer = ({ items, onRemove, onClear, onCompare }) => (
  <div className={`vd-compare-panel ${items.length > 0 ? 'open' : ''}`}>
    <div style={{ background: '#111', borderTop: '3px solid #e8001d', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 -8px 40px rgba(0,0,0,0.6)' }}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaBalanceScale style={{ color: '#e8001d' }} /> Compare ({items.length}/3)
      </div>
      <div style={{ display: 'flex', gap: 10, flex: 1 }}>
        {[0, 1, 2].map(i => {
          const v = items[i];
          return (
            <div key={i} style={{ flex: 1, height: 56, border: `1.5px dashed ${v ? 'rgba(232,0,29,0.4)' : 'rgba(255,255,255,0.12)'}`, background: v ? 'rgba(232,0,29,0.06)' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', position: 'relative', transition: 'all 0.25s' }}>
              {v ? (
                <>
                  {v.images?.length > 0 ? <img src={v.images[0].image_path} alt={v.name} style={{ width: 48, height: 36, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 48, height: 36, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}><FaCar /></div>}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: '#fff', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, color: '#e8001d' }}>₱{parseFloat(v.price).toLocaleString()}</div>
                  </div>
                  <button onClick={() => onRemove(v.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 11, padding: 2 }}><FaTimes /></button>
                </>
              ) : (
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>+ Add Vehicle</span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={onCompare} disabled={items.length < 2} style={{ padding: '12px 24px', background: items.length >= 2 ? '#e8001d' : 'rgba(255,255,255,0.05)', border: 'none', color: items.length >= 2 ? '#fff' : 'rgba(255,255,255,0.2)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: items.length >= 2 ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>Compare Now</button>
        <button onClick={onClear} style={{ padding: '12px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Clear</button>
      </div>
    </div>
  </div>
);

/* ─── Compare Page ────────────────────────────────────────────────────────── */
const ComparePage = ({ vehicles, onClose }) => {
  const fields = [
    { key: 'price', label: 'Price',    fmt: v => `₱${parseFloat(v.price).toLocaleString()}` },
    { key: 'brand', label: 'Brand',    fmt: v => v.brand },
    { key: 'year',  label: 'Year',     fmt: v => v.year },
    { key: 'type',  label: 'Type',     fmt: v => v.type },
    { key: 'loc',   label: 'Location', fmt: v => v.location || '—' },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 700, background: '#111', overflowY: 'auto', animation: 'fadeIn 0.3s ease' }}>
      <style>{css}</style>
      <div style={{ background: '#090909', borderBottom: '2px solid #e8001d', padding: '0 40px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaBalanceScale style={{ color: '#e8001d', fontSize: 18 }} />
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#fff', letterSpacing: '0.06em' }}>VEHICLE COMPARISON</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaTimes /> Close
        </button>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `200px repeat(${vehicles.length}, 1fr)`, gap: 2, marginBottom: 2 }}>
          <div />
          {vehicles.map(v => (
            <div key={v.id} style={{ background: '#111', borderTop: '3px solid #e8001d', padding: '20px', textAlign: 'center' }}>
              <div style={{ width: '100%', height: 130, overflow: 'hidden', marginBottom: 14, background: '#1a1a1a' }}>
                {v.images?.length > 0 ? <img src={v.images[0].image_path} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 32 }}><FaCar /></div>}
              </div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#fff', letterSpacing: '0.04em', marginBottom: 4 }}>{v.name}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#e8001d', letterSpacing: '0.04em' }}>₱{parseFloat(v.price).toLocaleString()}</div>
            </div>
          ))}
        </div>
        {fields.map((f, fi) => (
          <div key={f.key} style={{ display: 'grid', gridTemplateColumns: `200px repeat(${vehicles.length}, 1fr)`, gap: 2, marginBottom: 2 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '2px solid #e8001d', padding: '14px 18px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{f.label}</span>
            </div>
            {vehicles.map(v => (
              <div key={v.id} style={{ background: fi % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)', padding: '14px 18px', textAlign: 'center' }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{f.fmt(v)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Racing Background ───────────────────────────────────────────────────── */
const RacingBackground = () => (
  <div className="vd-racing-bg">
    <div className="vd-racing-grid" />
    <div className="vd-racing-streak" style={{ top: '20%', width: '60%', left: '-60%', animationDuration: '1.2s', animationDelay: '0s' }} />
    <div className="vd-racing-streak" style={{ top: '45%', width: '40%', left: '-40%', animationDuration: '0.9s', animationDelay: '0.3s' }} />
    <div className="vd-racing-streak" style={{ top: '65%', width: '55%', left: '-55%', animationDuration: '1.5s', animationDelay: '0.6s' }} />
    <div className="vd-racing-streak" style={{ top: '80%', width: '35%', left: '-35%', animationDuration: '1.1s', animationDelay: '0.9s' }} />
    <div className="vd-racing-glow" />
    <div className="vd-spotlight" />
  </div>
);

/* ─── Stock Banner Component ──────────────────────────────────────────────── */
const StockBanner = ({ stock, colorName }) => {
  if (stock == null) return null;
  const level = stock === 0 ? 'out' : stock <= 2 ? 'low' : 'ok';
  const icon  = stock === 0 ? '✕' : stock <= 2 ? '⚠' : '✓';
  const text  = stock === 0
    ? `${colorName} is out of stock`
    : stock === 1
      ? `Only 1 unit left in ${colorName}`
      : stock <= 2
        ? `Only ${stock} units left in ${colorName}`
        : `${stock} units available in ${colorName}`;
  return (
    <div className={`vd-stock-banner ${level}`}>
      <FaBoxes style={{ fontSize: 13, flexShrink: 0 }} />
      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {icon} {text}
      </span>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────────────────── */
const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const isAdminUser = user && isAdmin && isAdmin();

  const [vehicle, setVehicle]                   = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [alert, setAlert]                       = useState(null);
  const [related, setRelated]                   = useState([]);
  const [activeTab, setActiveTab]               = useState('overview');
  const [fullscreen, setFullscreen]             = useState(false);
  const [wishlisted, setWishlisted]             = useState(false);
  const [wishlistedColor, setWishlistedColor]   = useState(null);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [compareList, setCompareList]           = useState([]);
  const [showComparePage, setShowComparePage]   = useState(false);
  const [reserving, setReserving]               = useState(false);
  const [inCompare, setInCompare]               = useState(false);
  const [selectedColor, setSelectedColor]       = useState(null);
  const [imgKey, setImgKey]                     = useState(0);
  const [isSwapping, setIsSwapping]             = useState(false);
  const [showMsgBox, setShowMsgBox]             = useState(false);
  const [msgText, setMsgText]                   = useState('');
  const [msgSending, setMsgSending]             = useState(false);
  const [msgSent, setMsgSent]                   = useState(false);

  // ── Live color variants (updated optimistically after reserve) ──
  const [liveColorVariants, setLiveColorVariants] = useState([]);

  const DEFAULT_LAT = 6.1127;
  const DEFAULT_LNG = 125.1720;

  useEffect(() => { window.scrollTo(0, 0); fetchVehicle(); }, [id]);
  useEffect(() => {
    if (alert) { const t = setTimeout(() => setAlert(null), 4500); return () => clearTimeout(t); }
  }, [alert]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vehicles/${id}`);
      setVehicle(res.data);
      setSelectedColor(null);
      // Initialize live color variants from the fetched vehicle
      const raw = res.data.colors || res.data.color_variants || [];
      setLiveColorVariants(parseColorVariants(raw));
      fetchRelated(res.data);
      if (user && !isAdminUser) {
        checkWishlistStatus();
      }
    } catch {
      setAlert({ type: 'error', message: 'Failed to load vehicle details.' });
    } finally { setLoading(false); }
  };

  const checkWishlistStatus = async () => {
    try {
      const res = await api.get(`/wishlist/check/${id}`);
      setWishlisted(res.data.wishlisted);
      if (res.data.selected_color) {
        const c = typeof res.data.selected_color === 'string'
          ? JSON.parse(res.data.selected_color)
          : res.data.selected_color;
        setWishlistedColor(c);
      }
    } catch { /* silently ignore */ }
  };

  const fetchRelated = async (v) => {
    try {
      const res = await api.get(`/vehicles?type=${v.type}&brand=${v.brand}`);
      const others = res.data.filter(r => String(r.id) !== String(v.id)).slice(0, 4);
      if (others.length < 2) {
        const fb = await api.get(`/vehicles?type=${v.type}`);
        setRelated(fb.data.filter(r => String(r.id) !== String(v.id)).slice(0, 4));
      } else setRelated(others);
    } catch { setRelated([]); }
  };

  /* ── Parse color variants helper ── */
  const parseColorVariants = (raw) => {
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.map(c => {
      if (typeof c === 'string') {
        const lower = c.toLowerCase();
        const COLOR_MAP = {
          red:'#e8001d', crimson:'#dc143c', maroon:'#800000', blue:'#1d6fe8', navy:'#001f5b',
          cobalt:'#0047ab', sky:'#87ceeb', black:'#1a1a1a', midnight:'#1a1a2e', white:'#f5f5f5',
          pearl:'#f0ede8', silver:'#c0c0c0', gray:'#808080', grey:'#808080', platinum:'#e5e4e2',
          gold:'#f5c400', yellow:'#f5e642', champagne:'#f7e7ce', green:'#22c55e', emerald:'#50c878',
          forest:'#228b22', orange:'#f97316', bronze:'#cd7f32', purple:'#a855f7', burgundy:'#800020',
          brown:'#795548', beige:'#d2b48c', sand:'#c2b280',
        };
        let hex = '#555';
        for (const [key, val] of Object.entries(COLOR_MAP)) {
          if (lower.includes(key)) { hex = val; break; }
        }
        return { name: c, hex, stock: null };
      }
      return {
        name: c.name || 'Color',
        hex: c.hex || '#555',
        stock: c.stock != null ? parseInt(c.stock, 10) : null,
      };
    }).filter(c => c.name);
  };

  /* ── Reserve: pass selected_color, decrement stock optimistically ── */
  const handleReserve = async () => {
    if (!user) { navigate('/login', { state: { from: `/vehicle/${id}` } }); return; }
    if (isAdminUser) { setAlert({ type: 'error', message: 'Admins cannot reserve vehicles.' }); return; }

    // Block if selected color is out of stock
    if (selectedColor && selectedColor.stock === 0) {
      setAlert({ type: 'error', message: `${selectedColor.name} is out of stock.` });
      return;
    }

    setReserving(true);
    try {
      await api.post('/reservations', {
        vehicle_id: id,
        selected_color: selectedColor || null,
      });

      // ── Optimistically decrement the selected color's stock in UI ──
      if (selectedColor) {
        setLiveColorVariants(prev =>
          prev.map(c =>
            c.name === selectedColor.name
              ? { ...c, stock: Math.max(0, (c.stock ?? 1) - 1) }
              : c
          )
        );
        // Also update selectedColor reference so the banner reflects instantly
        setSelectedColor(prev =>
          prev ? { ...prev, stock: Math.max(0, (prev.stock ?? 1) - 1) } : prev
        );
      }

      setShowReservationModal(true);
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.message || 'Failed to reserve vehicle.' });
    } finally { setReserving(false); }
  };

  /* ── Wishlist ── */
  const handleWishlist = () => {
    if (!user) { navigate('/login', { state: { from: `/vehicle/${id}` } }); return; }
    if (isAdminUser) { setAlert({ type: 'error', message: 'Admins cannot add vehicles to wishlist.' }); return; }
    if (wishlisted) { removeFromWishlist(); return; }
    if (!liveColorVariants || liveColorVariants.length === 0) { saveToWishlist(null); return; }
    setShowWishlistModal(true);
  };

  const removeFromWishlist = async () => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishlisted(false);
      setWishlistedColor(null);
      setAlert({ type: 'info', message: 'Removed from wishlist.' });
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.message || 'Failed to remove from wishlist.' });
    }
  };

  const saveToWishlist = async (color) => {
    try {
      await api.post('/wishlist', { vehicle_id: id, selected_color: color });
      setWishlisted(true);
      setWishlistedColor(color);
      setShowWishlistModal(false);
      setAlert({ type: 'success', message: color ? `Saved to wishlist — ${color.name}!` : 'Added to wishlist!' });
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.message || 'Failed to update wishlist.' });
    }
  };

  const handleAddToCompare = () => {
    if (inCompare) {
      setCompareList(prev => prev.filter(v => String(v.id) !== String(vehicle.id)));
      setInCompare(false);
      return;
    }
    if (compareList.length >= 3) { setAlert({ type: 'error', message: 'Maximum 3 vehicles can be compared.' }); return; }
    setCompareList(prev => [...prev, vehicle]);
    setInCompare(true);
    setAlert({ type: 'success', message: 'Added to comparison!' });
  };

  const handleRemoveFromCompare = (vid) => {
    setCompareList(prev => prev.filter(v => String(v.id) !== String(vid)));
    if (String(vid) === String(vehicle?.id)) setInCompare(false);
  };

  const handleSendMessage = async () => {
    if (!user) { navigate('/login', { state: { from: `/vehicle/${id}` } }); return; }
    if (!msgText.trim()) return;
    setMsgSending(true);
    try {
      await api.post('/messages', { vehicle_id: id, subject: `Inquiry about: ${vehicle?.name}`, content: msgText.trim() });
      setMsgText('');
      setMsgSent(true);
      setTimeout(() => { setMsgSent(false); setShowMsgBox(false); }, 3000);
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.message || 'Failed to send message.' });
    } finally { setMsgSending(false); }
  };

  const handleColorSelect = (color) => {
    const isSame = selectedColor?.name === color.name;
    if (isSame) { setSelectedColor(null); setImgKey(k => k + 1); return; }
    setIsSwapping(true);
    setTimeout(() => {
      // Use live variant data so stock is always current
      const liveColor = liveColorVariants.find(c => c.name === color.name) || color;
      setSelectedColor(liveColor);
      setImgKey(k => k + 1);
      setTimeout(() => setIsSwapping(false), 600);
    }, 180);
  };

  const handleToggleMsgBox = () => {
    if (!user) { navigate('/login', { state: { from: `/vehicle/${id}` } }); return; }
    if (isAdminUser) { setAlert({ type: 'error', message: 'Admins cannot message themselves.' }); return; }
    setShowMsgBox(v => !v);
    setMsgSent(false);
    setMsgText('');
  };

  const SectionLabel = ({ children }) => (
    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-block', width: 16, height: 2, background: '#e8001d', flexShrink: 0 }} />
      {children}
    </div>
  );

  const Divider = () => <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '20px 0' }} />;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{css}</style>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(0,0,0,0.08)', borderTopColor: '#e8001d', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
    </div>
  );

  if (!vehicle) return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <style>{css}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.1 }}>🏁</div>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#111', marginBottom: 12 }}>Vehicle Not Found</h2>
        <Link to="/" style={{ color: '#e8001d', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>← Back to listings</Link>
      </div>
    </div>
  );

  const isAvailable = vehicle.availability_status === 'available';
  const price       = parseFloat(vehicle.price);

  // ── Use liveColorVariants for all rendering ──
  const colorVariants = liveColorVariants;

  const isLightHex = (hex) =>
    ['#f5f5f5','#f0ede8','#fffff0','#e5e4e2','#f5e642','#f5c400','#f7e7ce','#d2b48c','#c2b280','#87ceeb','#c0c0c0'].includes(hex);

  const getImageForColor = (colorName) => {
    if (!vehicle.images || vehicle.images.length === 0) return null;
    const match = vehicle.images.find(img => {
      if (!img.color) return false;
      const c = typeof img.color === 'string' ? JSON.parse(img.color) : img.color;
      return c?.name === colorName;
    });
    return match || null;
  };

  const currentImage = (() => {
    if (selectedColor) {
      const colorImg = getImageForColor(selectedColor.name);
      if (colorImg) return colorImg;
    }
    return vehicle.images?.[0] || null;
  })();

  const heroBgImage = currentImage?.image_path || vehicle.images?.[0]?.image_path || null;
  const isPng = currentImage?.image_path?.toLowerCase().endsWith('.png');

  const featurePresets = vehicle.type === 'motorcycle' ? MOTORCYCLE_FEATURES : CAR_FEATURES;
  const vehicleFeatureKeys = Array.isArray(vehicle.features) ? vehicle.features : [];
  const activeFeatures = featurePresets.filter(f => vehicleFeatureKeys.includes(f.key));

  const mapLat = vehicle.latitude ? parseFloat(vehicle.latitude) : DEFAULT_LAT;
  const mapLng = vehicle.longitude ? parseFloat(vehicle.longitude) : DEFAULT_LNG;
  const mapLocation = vehicle.location || 'General Santos City, Philippines';

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <FaCar style={{ fontSize: 11 }} /> },
    { id: 'features', label: 'Features', icon: <FaShieldAlt style={{ fontSize: 11 }} /> },
    { id: 'location', label: 'Location', icon: <FaMapMarkerAlt style={{ fontSize: 11 }} /> },
  ];

  const canSend = msgText.trim().length > 0 && !msgSending;

  // ── Derive whether reserve should be blocked ──
  const selectedColorOutOfStock = selectedColor?.stock === 0;
  const reserveDisabled = !isAvailable || reserving || isAdminUser || selectedColorOutOfStock;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Barlow',sans-serif" }}>
      <style>{css}</style>

      {/* ── Wishlist Color Modal ── */}
      {showWishlistModal && (
        <WishlistColorModal
          vehicle={vehicle}
          colorVariants={colorVariants}
          onConfirm={saveToWishlist}
          onClose={() => setShowWishlistModal(false)}
        />
      )}

      {showComparePage && <ComparePage vehicles={compareList} onClose={() => setShowComparePage(false)} />}

      {/* ── Pass selectedColor into ReservationModal ── */}
      {showReservationModal && (
        <ReservationModal
          vehicle={vehicle}
          selectedColor={selectedColor}
          onClose={() => setShowReservationModal(false)}
        />
      )}

      {fullscreen && currentImage && (
        <div className="vd-fullscreen" onClick={() => setFullscreen(false)}>
          <img src={currentImage.image_path} alt={vehicle.name} />
          <button onClick={() => setFullscreen(false)} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}><FaCompress /></button>
        </div>
      )}

      {alert && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 500,
          display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px',
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          ...(alert.type === 'success' ? { background: '#0a2a1a', borderLeft: '3px solid #10b981', color: '#34d399' }
            : alert.type === 'info'    ? { background: '#0a1a2a', borderLeft: '3px solid #3b82f6', color: '#93c5fd' }
              :                          { background: '#2a0a0a', borderLeft: '3px solid #e8001d', color: '#ff6b7a' })
        }}>
          {alert.type === 'success' ? <FaCheckCircle /> : alert.type === 'info' ? <FaInfoCircle /> : <FaTimesCircle />}
          {alert.message}
        </div>
      )}

      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: 340, display: 'flex', alignItems: 'flex-end', overflow: 'hidden', marginTop: 0 }}>
        <div key={`hero-${imgKey}`} style={{ position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: heroBgImage ? `url(${heroBgImage})` : 'none', backgroundColor: '#111', filter: 'brightness(0.5) saturate(1.1)', animation: 'fadeIn 0.5s ease' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(9,9,9,1) 0%,rgba(9,9,9,0.55) 45%,rgba(9,9,9,0.1) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#e8001d 30%,#f5c400 50%,#e8001d 70%,transparent)', zIndex: 3 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 48px 44px', width: '100%' }}>
          <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 16px', cursor: 'pointer', marginBottom: 20 }}>
            <FaArrowLeft style={{ fontSize: 11 }} /> Back to Listings
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#090909', color: '#fff', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '5px 14px', marginBottom: 14, borderLeft: '3px solid #e8001d' }}>
            {vehicle.type === 'car' ? <FaCar style={{ fontSize: 11 }} /> : <FaMotorcycle style={{ fontSize: 11 }} />}
            {vehicle.type}
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px,5vw,76px)', color: '#fff', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 14 }}>
            {vehicle.name.toUpperCase()}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {[vehicle.brand, vehicle.year].map((m, i) => (
              <React.Fragment key={i}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{m}</span>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 18 }}>·</span>
              </React.Fragment>
            ))}
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: '#e8001d', letterSpacing: '0.04em' }}>₱{price.toLocaleString()}</span>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 18 }}>·</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: isAvailable ? 'rgba(16,185,129,0.12)' : 'rgba(232,0,29,0.12)', border: `1px solid ${isAvailable ? 'rgba(16,185,129,0.35)' : 'rgba(232,0,29,0.35)'}`, color: isAvailable ? '#34d399' : '#ff6b7a' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: isAvailable ? '#10b981' : '#e8001d' }} />
              {vehicle.availability_status}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 28px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Gallery */}
            <div style={{ background: '#111', borderTop: '3px solid #e8001d', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}>
                {currentImage ? (
                  <>
                    {isPng ? (
                      <><RacingBackground /><img key={imgKey} src={currentImage.image_path} alt={vehicle.name} className={`vd-vehicle-img ${isSwapping ? 'vd-img-swap-glitch' : 'vd-img-swap-enter'}`} /></>
                    ) : (
                      <>
                        <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a' }} />
                        <img key={imgKey} src={currentImage.image_path} alt={vehicle.name} className={`vd-vehicle-img-cover ${isSwapping ? 'vd-img-swap-glitch' : 'vd-img-swap-enter'}`} />
                        <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', background: `radial-gradient(ellipse 80% 70% at 50% 40%, rgba(255,255,255,0.10) 0%, rgba(255,240,200,0.05) 40%, transparent 70%), radial-gradient(ellipse 40% 25% at 50% 85%, rgba(232,0,29,0.06) 0%, transparent 70%)`, animation: 'spotlightPulse 3s ease-in-out infinite' }} />
                      </>
                    )}
                    {isSwapping && (<><div className="vd-scan-line" /><div className="vd-scan-overlay" /><div className="vd-corner-tl" /><div className="vd-corner-tr" /><div className="vd-corner-bl" /><div className="vd-corner-br" /></>)}
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', gap: 12, background: 'repeating-linear-gradient(45deg,#111 0px,#111 10px,#141414 10px,#141414 20px)', position: 'absolute', inset: 0 }}>
                    {vehicle.type === 'car' ? <FaCar style={{ fontSize: 48 }} /> : <FaMotorcycle style={{ fontSize: 48 }} />}
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Image Available</span>
                  </div>
                )}

                {/* ── Selected color overlay with stock pill ── */}
                {selectedColor && (
                  <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 3, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(9,9,9,0.82)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `3px solid ${selectedColor.hex}`, padding: '5px 14px', flexWrap: 'wrap' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedColor.hex, border: isLightHex(selectedColor.hex) ? '1px solid rgba(0,0,0,0.3)' : '1px solid rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff' }}>{selectedColor.name}</span>
                    {/* ── Stock pill ── */}
                    {selectedColor.stock != null && (
                      <span style={{
                        padding: '2px 8px',
                        background: selectedColor.stock === 0 ? 'rgba(232,0,29,0.35)' : selectedColor.stock <= 2 ? 'rgba(245,196,0,0.2)' : 'rgba(16,185,129,0.15)',
                        border: `1px solid ${selectedColor.stock === 0 ? 'rgba(232,0,29,0.6)' : selectedColor.stock <= 2 ? 'rgba(245,196,0,0.4)' : 'rgba(16,185,129,0.3)'}`,
                        fontFamily: "'Barlow Condensed',sans-serif",
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: selectedColor.stock === 0 ? '#ff6b7a' : selectedColor.stock <= 2 ? '#f5c400' : '#34d399',
                        animation: 'stockPop 0.3s ease',
                      }}>
                        {selectedColor.stock === 0 ? '✕ Out of Stock' : `${selectedColor.stock} in stock`}
                      </span>
                    )}
                  </div>
                )}

                {!selectedColor && colorVariants.length > 0 && (
                  <div className="vd-pick-color-hint"><FaPalette style={{ color: '#e8001d', fontSize: 11 }} /> Select a color below</div>
                )}
                {currentImage && (
                  <button onClick={() => setFullscreen(true)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, zIndex: 5 }}><FaExpand /></button>
                )}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'linear-gradient(to bottom,#e8001d,#f5c400)', zIndex: 6, pointerEvents: 'none' }} />
              </div>

              {/* ── Color swatches with per-color stock ── */}
              {colorVariants.length > 0 && (
                <div style={{ padding: '16px 16px 18px', background: '#111', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaPalette style={{ color: '#e8001d', fontSize: 11 }} /> Available Colors — click to change image
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {colorVariants.map(c => {
                      const isActive = selectedColor?.name === c.name;
                      const isOut = c.stock === 0;
                      return (
                        <button
                          key={c.name}
                          className={`vd-color-swatch ${isActive ? 'active' : ''} ${isOut ? 'out-of-stock' : ''}`}
                          style={{ '--swatch-hex': c.hex }}
                          onClick={() => !isOut && handleColorSelect(c)}
                          title={`${c.name}${c.stock != null ? ` · ${c.stock} in stock` : ''}`}
                        >
                          <span className="dot" style={{ border: isLightHex(c.hex) ? '1.5px solid rgba(0,0,0,0.25)' : '1.5px solid rgba(255,255,255,0.15)' }} />
                          <span className="label">{c.name}</span>
                          {/* ── Per-color stock indicator ── */}
                          {c.stock != null && (
                            <span className="stock-label" style={{
                              color: isOut ? '#ff6b7a' : c.stock <= 2 ? '#f5c400' : 'rgba(255,255,255,0.3)',
                            }}>
                              {isOut ? 'Out' : `${c.stock} left`}
                            </span>
                          )}
                          {isActive && <span className="active-dot" />}
                          {/* ── Crossed-out overlay for out-of-stock ── */}
                          {isOut && (
                            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                              <span style={{ position: 'absolute', width: '80%', height: 1.5, background: 'rgba(255,100,100,0.7)', transform: 'rotate(-45deg)' }} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ background: '#111', borderTop: '3px solid #e8001d' }}>
              <div style={{ display: 'flex', gap: 0, background: '#111', borderBottom: '2px solid #1a1a1a' }}>
                {TABS.map(t => (
                  <button key={t.id} className={activeTab === t.id ? 'vd-tab-active' : ''} style={{ flex: 1, padding: '14px 10px', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', borderBottom: '2px solid transparent', marginBottom: -2, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }} onClick={() => setActiveTab(t.id)}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '28px 28px 32px', animation: 'slideUp 0.2s ease' }} key={activeTab}>
                {activeTab === 'overview' && (
                  <div>
                    <SectionLabel>About This Vehicle</SectionLabel>
                    <p style={{ fontSize: 14, lineHeight: 1.9, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>{vehicle.description || 'No description available for this vehicle.'}</p>
                    <SectionLabel>Vehicle Details</SectionLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 28 }}>
                      {[
                        { icon: <FaCar />,          label: 'Brand',    val: vehicle.brand },
                        { icon: <FaCalendarAlt />,  label: 'Year',     val: vehicle.year },
                        { icon: <FaTag />,          label: 'Type',     val: vehicle.type === 'car' ? 'Car' : 'Motorcycle' },
                        { icon: <FaMapMarkerAlt />, label: 'Location', val: vehicle.location || '—' },
                        ...(colorVariants.length > 0 ? [{ icon: <FaPalette />, label: 'Colors', val: `${colorVariants.length} variant${colorVariants.length > 1 ? 's' : ''}` }] : []),
                        ...(activeFeatures.length > 0 ? [{ icon: <FaCheckCircle />, label: 'Features', val: `${activeFeatures.length} included` }] : []),
                      ].map(h => (
                        <div key={h.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px', borderLeft: '2px solid #e8001d', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ color: '#e8001d', fontSize: 14 }}>{h.icon}</div>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{h.label}</div>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#fff', letterSpacing: '0.04em', lineHeight: 1 }}>{h.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(245,196,0,0.06)', border: '1px solid rgba(245,196,0,0.2)', borderLeft: '3px solid #f5c400', padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <FaInfoCircle style={{ color: '#f5c400', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f5c400', marginBottom: 4 }}>How Reservations Work</div>
                        <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)' }}>
                          Reserve this vehicle online to hold it for <strong style={{ color: 'rgba(255,255,255,0.8)' }}>10 days</strong>. During this time, no other user can reserve it. Visit the dealership within the reservation window, complete your paperwork and payment, then drive away.
                        </p>
                      </div>
                    </div>
                    {related.length > 0 && (
                      <>
                        <SectionLabel>You Might Also Like</SectionLabel>
                        {related.map(r => (
                          <Link to={`/vehicle/${r.id}`} key={r.id} className="vd-related-hover" style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', textDecoration: 'none', color: 'inherit', borderLeft: '2px solid transparent', transition: 'all 0.2s', marginBottom: 8 }}>
                            <div style={{ position: 'relative', width: 80, height: 58, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
                              {r.images?.length > 0 ? <img src={r.images[0].image_path} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 20 }}>{r.type === 'car' ? <FaCar /> : <FaMotorcycle />}</div>}
                              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', border: '1.5px solid rgba(0,0,0,0.5)', background: r.availability_status === 'available' ? '#10b981' : '#e8001d' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: '0.04em', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{r.name}</div>
                              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{r.brand} · {r.year}</div>
                              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: '#fff' }}><span style={{ color: '#e8001d', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, marginRight: 2 }}>₱</span>{parseFloat(r.price).toLocaleString()}</div>
                            </div>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    {activeFeatures.length > 0 ? (
                      <>
                        <SectionLabel>
                          {vehicle.type === 'motorcycle' ? 'Motorcycle' : 'Car'} Features
                          <span style={{ marginLeft: 8, background: 'rgba(232,0,29,0.15)', border: '1px solid rgba(232,0,29,0.3)', color: '#e8001d', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 8px' }}>{activeFeatures.length} included</span>
                        </SectionLabel>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 28 }}>
                          {activeFeatures.map(f => (
                            <div key={f.key} className="vd-feature-item" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', transition: 'all 0.2s', cursor: 'default' }}>
                              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(232,0,29,0.1)', border: '1px solid rgba(232,0,29,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8001d', fontSize: 18 }}>{f.icon}</div>
                              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>{f.label}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No features listed for this vehicle</div>
                    )}
                    {colorVariants.length > 0 && (
                      <>
                        <SectionLabel>Available Color Variants</SectionLabel>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {colorVariants.map(c => (
                            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', opacity: c.stock === 0 ? 0.45 : 1 }}>
                              <span style={{ width: 16, height: 16, borderRadius: '50%', background: c.hex, border: isLightHex(c.hex) ? '1.5px solid rgba(0,0,0,0.25)' : '1.5px solid rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
                              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>{c.name}</span>
                              {c.stock != null && (
                                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.stock === 0 ? '#ff6b7a' : c.stock <= 2 ? '#f5c400' : 'rgba(255,255,255,0.3)', marginLeft: 4 }}>
                                  {c.stock === 0 ? '(Out)' : `×${c.stock}`}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'location' && (
                  <div>
                    <SectionLabel>Dealership Location</SectionLabel>
                    {mapLocation && (
                      <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaMapMarkerAlt style={{ color: '#e8001d' }} /> {mapLocation}
                      </p>
                    )}
                    <div style={{ height: 360, overflow: 'hidden' }}>
                      <MapContainer center={[mapLat, mapLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                        <Marker position={[mapLat, mapLng]}><Popup><strong>{vehicle.name}</strong><br />{mapLocation}</Popup></Marker>
                      </MapContainer>
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        <FaDirections style={{ color: '#e8001d' }} /> Get Directions
                      </button>
                      <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        <FaPhoneAlt style={{ color: '#e8001d' }} /> Call Dealership
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#111', borderTop: '3px solid #e8001d', padding: '24px' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: '#fff', letterSpacing: '0.02em', lineHeight: 1 }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 700, color: '#e8001d', marginRight: 3, verticalAlign: 'super' }}>₱</span>
                  {price.toLocaleString()}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(232,0,29,0.15)', border: `1px solid ${isAvailable ? 'rgba(16,185,129,0.4)' : 'rgba(232,0,29,0.4)'}`, color: isAvailable ? '#34d399' : '#ff6b7a', marginTop: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isAvailable ? '#10b981' : '#e8001d' }} />
                  {vehicle.availability_status}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {[vehicle.brand, vehicle.year, vehicle.type].map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>{t}</span>
                ))}
              </div>

              {/* Show wishlisted color in sidebar */}
              {wishlisted && wishlistedColor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(232,0,29,0.06)', border: '1px solid rgba(232,0,29,0.2)', borderLeft: '3px solid #e8001d', marginBottom: 14 }}>
                  <FaHeart style={{ color: '#e8001d', fontSize: 11, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Wishlisted Color:</span>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: wishlistedColor.hex, border: isLightHex(wishlistedColor.hex) ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>{wishlistedColor.name}</span>
                </div>
              )}

              {/* ── Sidebar color dots ── */}
              {colorVariants.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaPalette style={{ color: '#e8001d', fontSize: 10 }} />
                    Color
                    {selectedColor && <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>— {selectedColor.name}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {colorVariants.map(c => {
                      const isActive = selectedColor?.name === c.name;
                      const isOut = c.stock === 0;
                      return (
                        <button
                          key={c.name}
                          title={`${c.name}${c.stock != null ? ` · ${c.stock} in stock` : ''}`}
                          onClick={() => !isOut && handleColorSelect(c)}
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: c.hex, cursor: isOut ? 'not-allowed' : 'pointer',
                            border: isActive ? '2.5px solid #fff' : `1.5px solid ${isLightHex(c.hex) ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)'}`,
                            outline: isActive ? `2px solid ${c.hex}` : 'none', outlineOffset: 2,
                            boxShadow: isActive ? `0 0 8px ${c.hex}` : 'none',
                            transition: 'all 0.2s', padding: 0,
                            opacity: isOut ? 0.35 : 1,
                            position: 'relative',
                          }}
                        >
                          {isOut && (
                            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ position: 'absolute', width: '80%', height: 1.5, background: 'rgba(255,100,100,0.85)', transform: 'rotate(-45deg)' }} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Stock Banner: shown when a color is selected ── */}
                  {selectedColor && selectedColor.stock != null && (
                    <div style={{ marginTop: 12 }}>
                      <StockBanner stock={selectedColor.stock} colorName={selectedColor.name} />
                    </div>
                  )}
                </div>
              )}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 18px' }} />

              {/* ── Reserve button — disabled if color out of stock ── */}
              <button
                onClick={handleReserve}
                disabled={reserveDisabled}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 20px', border: 'none',
                  background: reserveDisabled ? 'rgba(255,255,255,0.05)' : '#e8001d',
                  color: reserveDisabled ? 'rgba(255,255,255,0.2)' : '#fff',
                  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: reserveDisabled ? 'not-allowed' : 'pointer',
                  marginBottom: 10,
                  boxShadow: !reserveDisabled ? '0 4px 24px rgba(232,0,29,0.45)' : 'none',
                  transition: 'all 0.2s',
                  animation: !reserveDisabled ? 'pulseRed 2.5s infinite' : 'none',
                }}
              >
                {reserving
                  ? 'Reserving…'
                  : isAdminUser
                    ? <><FaShieldAlt style={{ fontSize: 13 }} /> Admin — Cannot Reserve</>
                    : selectedColorOutOfStock
                      ? <><FaTimes style={{ fontSize: 12 }} /> This Color is Out of Stock</>
                      : isAvailable
                        ? <><FaCalendarAlt style={{ fontSize: 13 }} /> Reserve Now</>
                        : 'Currently Unavailable'}
              </button>

              {/* Wishlist button */}
              <button onClick={handleWishlist} disabled={isAdminUser} className="vd-wishlist-btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: wishlisted ? 'rgba(232,0,29,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${wishlisted ? 'rgba(232,0,29,0.35)' : 'rgba(255,255,255,0.12)'}`, color: isAdminUser ? 'rgba(255,255,255,0.2)' : wishlisted ? '#ff6b7a' : 'rgba(255,255,255,0.6)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: isAdminUser ? 'not-allowed' : 'pointer', marginBottom: 10, transition: 'all 0.2s', opacity: isAdminUser ? 0.4 : 1 }}>
                {wishlisted ? <FaHeart style={{ color: '#e8001d', fontSize: 13 }} /> : <FaRegHeart style={{ fontSize: 13 }} />}
                {isAdminUser ? 'Not Available for Admins' : wishlisted
                  ? (wishlistedColor ? `In Wishlist — ${wishlistedColor.name}` : 'In Wishlist')
                  : 'Add to Wishlist'}
              </button>

              <button onClick={handleAddToCompare} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: inCompare ? 'rgba(245,196,0,0.1)' : 'transparent', border: `1px solid ${inCompare ? 'rgba(245,196,0,0.3)' : 'rgba(255,255,255,0.1)'}`, color: inCompare ? '#f5c400' : 'rgba(255,255,255,0.4)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 10, transition: 'all 0.2s' }}>
                <FaBalanceScale style={{ fontSize: 12 }} />
                {inCompare ? 'In Comparison' : 'Add to Compare'}
              </button>

              {!isAdminUser && (
                <button onClick={handleToggleMsgBox} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: showMsgBox ? 'rgba(59,130,246,0.12)' : 'transparent', border: `1px solid ${showMsgBox ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`, color: showMsgBox ? '#93c5fd' : 'rgba(255,255,255,0.4)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: showMsgBox ? 0 : 16, transition: 'all 0.2s' }}>
                  <FaEnvelope style={{ fontSize: 12 }} />
                  {showMsgBox ? 'Close Message' : 'Message Admin'}
                </button>
              )}

              {!isAdminUser && showMsgBox && (
                <div className="vd-msg-wrap">
                  <div className="vd-msg-box">
                    {msgSent ? (
                      <div className="vd-msg-sent">
                        <div className="vd-msg-sent-icon"><FaCheckDouble /></div>
                        <div className="vd-msg-sent-title">Message Sent!</div>
                        <div className="vd-msg-sent-sub">Admin will respond to your inquiry shortly.</div>
                      </div>
                    ) : (
                      <>
                        <div className="vd-msg-label"><FaEnvelope style={{ color: '#3b82f6', fontSize: 10 }} />Inquiry<span className="vd-msg-vehicle">— {vehicle.name}</span></div>
                        <textarea className="vd-msg-textarea" rows={3} placeholder={`Ask about the ${vehicle.name}…`} value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendMessage(); }} />
                        <div className="vd-msg-actions">
                          <button className="vd-msg-send" onClick={handleSendMessage} disabled={!canSend} style={{ background: canSend ? '#e8001d' : 'rgba(255,255,255,0.05)', color: canSend ? '#fff' : 'rgba(255,255,255,0.2)' }}>
                            {msgSending ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} /> Sending…</> : <><FaPaperPlane style={{ fontSize: 11 }} /> Send</>}
                          </button>
                          <button className="vd-msg-cancel" onClick={() => { setShowMsgBox(false); setMsgText(''); }}><FaTimes /></button>
                        </div>
                        <div className="vd-msg-hint"><FaInfoCircle style={{ fontSize: 9 }} /> Ctrl+Enter to send</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!isAdminUser && !showMsgBox && <div style={{ marginBottom: 6 }} />}

              {isAvailable && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(245,196,0,0.05)', border: '1px solid rgba(245,196,0,0.15)', borderLeft: '3px solid #f5c400', marginBottom: 14 }}>
                  <FaClock style={{ color: '#f5c400', fontSize: 13, flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                    Reservation holds vehicle for <strong style={{ color: '#f5c400' }}>10 days</strong>. Visit dealership to complete purchase.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {['Verified Listing', 'Secure Reservation', 'Buyer Protection'].map(l => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                    <FaCheckCircle style={{ color: '#10b981', fontSize: 10 }} /> {l}
                  </div>
                ))}
              </div>
            </div>

            {activeFeatures.length > 0 && (
              <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', padding: '22px' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 2, background: '#e8001d' }} /> Top Features
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activeFeatures.slice(0, 5).map(f => (
                    <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: '#e8001d', fontSize: 13, flexShrink: 0 }}>{f.icon}</span>
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>{f.label}</span>
                    </div>
                  ))}
                  {activeFeatures.length > 5 && (
                    <button onClick={() => setActiveTab('features')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', marginTop: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                      +{activeFeatures.length - 5} more features
                    </button>
                  )}
                </div>
              </div>
            )}

            <div style={{ background: 'rgb(67, 3, 10)', border: '1px solid rgba(232,0,29,0.2)', padding: '20px' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 2, background: '#e8001d' }} /> Visit Us
              </div>
              {mapLocation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>
                  <FaMapMarkerAlt style={{ color: '#e8001d', flexShrink: 0 }} /> {mapLocation}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setActiveTab('location')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  <FaDirections style={{ color: '#e8001d' }} /> Directions
                </button>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  <FaPhoneAlt style={{ color: '#e8001d' }} /> Call Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="vd-footer">
        <div className="vd-footer-inner">
          <div className="vd-footer-top">
            <div className="vd-footer-brand-col">
              <div className="vd-footer-logo">
                <div className="vd-footer-emblem">🏎️</div>
                <span className="vd-footer-brand">VELO<span style={{ color: '#e8001d' }}>MARKET</span></span>
              </div>
              <p className="vd-footer-tagline">Your trusted vehicle reservation dealership. Browse, reserve online, then visit us to complete your dream.</p>
              <div className="vd-footer-socials">
                <a href="#" className="vd-social-icon" aria-label="Facebook"><FaFacebook /></a>
                <a href="#" className="vd-social-icon" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" className="vd-social-icon" aria-label="Twitter"><FaTwitter /></a>
                <a href="#" className="vd-social-icon" aria-label="YouTube"><FaYoutube /></a>
              </div>
            </div>
            <div className="vd-footer-links-col">
              <h4 className="vd-footer-col-title">About Us</h4>
              <p className="vd-footer-about-text">Essak VeloMarket is a premier vehicle dealership specializing in cars and motorcycles. We offer an online reservation system so you can secure your vehicle before visiting our showroom.</p>
            </div>
            <div className="vd-footer-contact-col">
              <h4 className="vd-footer-col-title">Contact</h4>
              <div className="vd-footer-contact-item"><FaPhone className="vd-footer-contact-icon" /><span>+1 (800) 835-6627</span></div>
              <div className="vd-footer-contact-item"><FaEnvelope className="vd-footer-contact-icon" /><span>info@velomarket.com</span></div>
              <div className="vd-footer-contact-item"><FaMapMarkerAlt className="vd-footer-contact-icon" /><span>123 Speedway Blvd, Motor City, MC 40001</span></div>
            </div>
          </div>
          <div className="vd-footer-bottom">
            <span>© 2026 Essak. All rights reserved.</span>
            <div className="vd-footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Reservation Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <CompareDrawer items={compareList} onRemove={handleRemoveFromCompare} onClear={() => { setCompareList([]); setInCompare(false); }} onCompare={() => setShowComparePage(true)} />
    </div>
  );
};

export default VehicleDetails;