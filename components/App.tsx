"use client";

import { useEffect, useRef, useState } from "react";
import type { Account, AnalysisResult, ParsedData } from "@/types/instagram";
import { parseInstagramZip } from "@/lib/parser";
import { analyze } from "@/lib/analyzer";
import { getSampleData } from "@/lib/sampleData";
import {
  avatarColor,
  formatCount,
  formatLongDate,
  initials,
} from "@/lib/format";

const INITIAL_RENDER_CAP = 50;

type ScreenId = 1 | 2 | 3 | 4 | 5;

/* ============================= Shared UI ============================= */

function StatusBar({ dark = false }: { dark?: boolean }) {
  const stroke = dark ? "#1d1d1f" : "#fff";
  return (
    <div
      className="absolute top-0 left-0 right-0 h-[54px] flex items-start justify-between px-[30px] pt-[15px] z-[99] pointer-events-none"
      style={{ color: dark ? "#1d1d1f" : "#fff" }}
    >
      <span className="text-[15px] font-semibold tracking-[-0.3px]">9:41</span>
      <div className="flex items-center gap-[6px]">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill={stroke}>
          <rect x="2" y="16" width="3" height="6" rx="0.5" />
          <rect x="7.5" y="12" width="3" height="10" rx="0.5" />
          <rect x="13" y="8" width="3" height="14" rx="0.5" />
          <rect x="18.5" y="4" width="3" height="18" rx="0.5" opacity="0.3" />
        </svg>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <path
            d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg viewBox="0 0 24 24" className="w-4 h-4">
          <rect x="2" y="7" width="18" height="10" rx="2" stroke={stroke} strokeWidth="1.5" fill="none" />
          <rect x="20" y="10" width="2" height="4" rx="1" fill={stroke} />
          <rect x="3.5" y="8.5" width="14" height="7" rx="1" fill={stroke} />
        </svg>
      </div>
    </div>
  );
}

function ProgressDots({
  active,
  dark = false,
  className = "",
}: {
  active: ScreenId;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-[7px] relative z-10 ${className}`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const isActive = n === active;
        const isDone = n < active;
        let bg: string;
        if (dark) {
          bg = isActive ? "#0071e3" : isDone ? "#b9d8f7" : "#d2d2d7";
        } else {
          bg = isActive
            ? "#fff"
            : isDone
            ? "rgba(255,255,255,0.7)"
            : "rgba(255,255,255,0.35)";
        }
        return (
          <span
            key={n}
            className="h-[6px] rounded-[4px] transition-all duration-300"
            style={{ width: isActive ? 22 : 6, background: bg }}
          />
        );
      })}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back"
      className="w-[34px] h-[34px] rounded-full bg-surface-2 flex items-center justify-center text-accent flex-shrink-0 transition active:scale-95 hover:bg-[#ececef]"
    >
      <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

function Chevron() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function HomeIndicator({ light = false }: { light?: boolean }) {
  return (
    <div className="h-[34px] flex items-center justify-center flex-shrink-0">
      <div
        className="w-[134px] h-[5px] rounded-[3px]"
        style={{ background: light ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.18)" }}
      />
    </div>
  );
}

/* ============================= Screen 1: Landing ============================= */

function LandingScreen({ onNext }: { onNext: () => void }) {
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{
        background: "radial-gradient(900px 500px at 50% -5%, #1a1a1f 0%, #000 70%)",
        color: "#f5f5f7",
      }}
    >
      <StatusBar />
      <ProgressDots active={1} className="pt-[18px] pb-[8px]" />

      <div className="fade-up flex-1 flex flex-col items-center justify-center px-9 pb-12 pt-16 text-center">
        <div className="w-[76px] h-[76px] rounded-[22px] flex items-center justify-center mb-7 border border-white/[0.12] bg-white/[0.08]">
          <svg viewBox="0 0 24 24" className="w-[38px] h-[38px]" fill="none" stroke="#fff" strokeWidth="1.6">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 10-16 0" />
            <path d="M16 11l2 2 4-4" strokeWidth="2.5" />
          </svg>
        </div>

        <h1 className="mb-4 leading-[0.95] flex items-baseline justify-center select-none">
          <span
            className="text-[44px] font-extrabold tracking-[-0.04em]"
            style={{
              background: "linear-gradient(180deg,#ffffff 0%,#9fc2ff 130%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            YOU
          </span>
          <span className="text-[44px] font-light tracking-[-0.04em] text-white/85">
            nfollowed
          </span>
        </h1>

        <p className="text-[19px] leading-[1.45] mb-12 max-w-[280px] tracking-[-0.01em]" style={{ color: "#a1a1a6" }}>
          Find out who doesn&apos;t follow you back. No login required.
        </p>

        <div className="flex flex-col gap-px w-full mb-11 rounded-[18px] overflow-hidden bg-white/[0.06]">
          <FeatureItem
            title="Privacy-first"
            sub="Your data never leaves your device"
            icon={
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </>
            }
          />
          <FeatureItem
            title="Your data only"
            sub="Uses Instagram's official export"
            icon={<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />}
          />
          <FeatureItem
            title="Instant analysis"
            sub="Results in under 3 seconds"
            icon={<path d="M13 2L3 14h9l-1 8 10-12h-9z" />}
          />
        </div>

        <div className="w-full">
          <button
            onClick={onNext}
            className="flex items-center justify-center gap-[6px] w-full py-4 px-6 bg-accent text-white text-[17px] font-medium tracking-[-0.2px] rounded-pill transition hover:bg-accent-hover active:bg-accent-active active:scale-[0.99]"
          >
            Get Started
            <Chevron />
          </button>
          <p className="mt-[18px] text-[13px]" style={{ color: "#6e6e73" }}>
            Works with any Instagram account · Free forever
          </p>
        </div>
      </div>

      <HomeIndicator light />
    </div>
  );
}

function FeatureItem({
  title,
  sub,
  icon,
}: {
  title: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-[18px] text-left">
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-white">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <div>
        <strong className="block text-[16px] font-medium tracking-[-0.2px] mb-[2px]" style={{ color: "#f5f5f7" }}>
          {title}
        </strong>
        <span className="text-[13px]" style={{ color: "#86868b" }}>
          {sub}
        </span>
      </div>
    </div>
  );
}

/* ============================= Screen 2: Tutorial ============================= */

/* ---- Tutorial mock building blocks (generic mockups, zero PII) ---- */

const tIco = {
  gear: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 13a7.6 7.6 0 0 0 .1-1l1.9-1.5-1.9-3.3-2.3 1a7.5 7.5 0 0 0-1.7-1l-.4-2.4h-3.8l-.4 2.4a7.5 7.5 0 0 0-1.7 1l-2.3-1L3 9.5 4.9 11a7.6 7.6 0 0 0 0 2L3 14.5l1.9 3.3 2.3-1a7.5 7.5 0 0 0 1.7 1l.4 2.4h3.8l.4-2.4a7.5 7.5 0 0 0 1.7-1l2.3 1 1.9-3.3z" /></svg>),
  user: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>),
  info: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h6M8 12h8M8 16h5" /></svg>),
  exp: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 3h7v7M21 3l-9 9M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>),
  cal: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>),
  file: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>),
  expand: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>),
  check: (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
  dl: (<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
};

function TRow({
  icon, title, sub, chev, white, hl, check, dim, pill,
}: {
  icon?: React.ReactNode; title: string; sub?: string; chev?: boolean;
  white?: boolean; hl?: boolean; check?: "on" | "off"; dim?: boolean; pill?: string;
}) {
  return (
    <div
      className={hl ? "tut-hl" : ""}
      style={{
        display: "flex", alignItems: "center", gap: 11,
        background: white ? "#fff" : "#1c1c1e",
        color: white ? "#111" : "#fff",
        border: white ? "1px solid #e7e7e9" : "none",
        borderRadius: 13, padding: "10px 13px", opacity: dim ? 0.5 : 1,
      }}
    >
      {check && (
        <span style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: check === "on" ? "var(--accent)" : "transparent",
          border: check === "on" ? "2px solid var(--accent)" : "2px solid #aaa",
        }}>{check === "on" && tIco.check}</span>
      )}
      {icon && (
        <span style={{ width: 20, display: "flex", justifyContent: "center", flexShrink: 0, color: white ? "#111" : "#fff" }}>{icon}</span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 500 }}>{title}</span>
        {sub && <span style={{ display: "block", fontSize: 11, color: white ? "#777" : "#a8a8a8", marginTop: 1 }}>{sub}</span>}
        {pill && <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--accent)", marginTop: 2 }}>{pill}</span>}
      </span>
      {chev && <span style={{ color: white ? "#bbb" : "#888", fontSize: 15 }}>›</span>}
    </div>
  );
}

const tAv = <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#3a3a3c", flexShrink: 0 }} />;

type TutStep = { title: string; desc: React.ReactNode; viz: React.ReactNode; finger?: React.CSSProperties };

const TUT_STEPS: TutStep[] = [
  {
    title: "Open your profile menu",
    desc: (<>On your Instagram profile, tap the <b>☰ menu</b> in the top-right corner.</>),
    viz: (
      <div style={{ width: "86%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1c1c1e", borderRadius: 13, padding: "12px 14px", color: "#fff" }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>yourname ▾</span>
          <span style={{ display: "flex", gap: 13, alignItems: "center" }}>
            <span>♡</span>
            <span className="tut-hl round" style={{ display: "inline-flex", flexDirection: "column", gap: 3 }}>
              <i style={{ width: 17, height: 2, background: "#fff", borderRadius: 2, display: "block" }} />
              <i style={{ width: 17, height: 2, background: "#fff", borderRadius: 2, display: "block" }} />
              <i style={{ width: 17, height: 2, background: "#fff", borderRadius: 2, display: "block" }} />
            </span>
          </span>
        </div>
      </div>
    ),
    finger: { top: 66, right: 40 },
  },
  {
    title: "Tap Settings and activity",
    desc: (<>In the menu that slides up, tap <b>Settings and activity</b> at the top.</>),
    viz: (<div style={{ width: "86%" }}><TRow icon={tIco.gear} title="Settings and activity" chev hl /></div>),
    finger: { top: 70, left: 28 },
  },
  {
    title: "Open Accounts Center",
    desc: (<>At the top of Settings, tap <b>Accounts Center</b>.</>),
    viz: (<div style={{ width: "86%" }}><TRow icon={tIco.user} title="Accounts Center" sub="Password, security, personal details" chev hl /></div>),
    finger: { top: 84, left: 28 },
  },
  {
    title: "Your information & permissions",
    desc: (<>In Accounts Center, tap <b>Your information and permissions</b>.</>),
    viz: (<div style={{ width: "86%" }}><TRow icon={tIco.info} title="Your information and permissions" chev hl /></div>),
    finger: { top: 80, left: 28 },
  },
  {
    title: "Export your information",
    desc: (<>Tap <b>Export your information</b>, then the blue <b>Create export</b> button.</>),
    viz: (
      <div style={{ width: "86%", display: "flex", flexDirection: "column", gap: 9 }}>
        <TRow white title="Export your information" icon={tIco.exp} />
        <div className="tut-hl" style={{ background: "#1877f2", color: "#fff", borderRadius: 20, textAlign: "center", padding: 11, fontSize: 13.5, fontWeight: 600 }}>Create export</div>
      </div>
    ),
    finger: { top: 118, left: "50%" },
  },
  {
    title: "Choose your profile",
    desc: (<>Select your <b>Instagram</b> profile from the list.</>),
    viz: (
      <div style={{ width: "86%", display: "flex", flexDirection: "column", gap: 8 }}>
        <TRow white title="yourname" sub="Facebook" icon={tAv} />
        <TRow white title="yourname" sub="Instagram" icon={tAv} chev hl />
      </div>
    ),
    finger: { top: 116, left: "50%" },
  },
  {
    title: "Export to device",
    desc: (<>Choose <b>Export to device</b> so you get the .zip file directly.</>),
    viz: (
      <div style={{ width: "86%", display: "flex", flexDirection: "column", gap: 8 }}>
        <TRow white title="Export to device" chev hl />
        <TRow white title="Export to external service" chev />
      </div>
    ),
    finger: { top: 70, left: "50%" },
  },
  {
    title: "This is the settings screen",
    desc: (<>You&apos;ll land on <b>Confirm your export</b>. The next 3 steps each open one row here — tap each, set it, come back.</>),
    viz: (
      <div style={{ width: "90%", display: "flex", flexDirection: "column", gap: 6 }}>
        <TRow white icon={tIco.info} title="Customize information" chev hl />
        <TRow white icon={tIco.cal} title="Date range" chev hl />
        <TRow white icon={tIco.file} title="Format" chev hl />
        <TRow white icon={tIco.expand} title="Media quality" chev hl />
      </div>
    ),
  },
  {
    title: "Customize information",
    desc: (<>Open that row and check <b>only</b>: Followers &amp; following, Likes, Comments, Story interactions. Leave everything else off.</>),
    viz: (
      <div style={{ width: "90%", display: "flex", flexDirection: "column", gap: 6 }}>
        <TRow white check="on" title="Followers and following" />
        <TRow white check="on" title="Likes" />
        <TRow white check="on" title="Comments & Story interactions" />
        <TRow white check="off" title="Messages, posts, media…" dim />
      </div>
    ),
  },
  {
    title: "Date range → All time",
    desc: (<>Open <b>Date range</b> and choose <b>All time</b>. Skipping this gives incomplete follower data.</>),
    viz: (<div style={{ width: "86%" }}><TRow white icon={tIco.cal} title="Date range" pill="All time" chev hl /></div>),
    finger: { top: 68, right: 28 },
  },
  {
    title: "Format → JSON · Quality → Lower",
    desc: (<>Set <b>Format</b> to <b>JSON</b> (required — HTML won&apos;t work) and <b>Media quality</b> to <b>Lower</b> to keep the file small.</>),
    viz: (
      <div style={{ width: "86%", display: "flex", flexDirection: "column", gap: 8 }}>
        <TRow white icon={tIco.file} title="Format" pill="JSON" chev hl />
        <TRow white icon={tIco.expand} title="Media quality" pill="Lower quality" chev hl />
      </div>
    ),
  },
  {
    title: "Start the export",
    desc: (<>Tap <b>Start export</b>. Instagram may ask you to re-enter your password — that&apos;s normal security, not us.</>),
    viz: (<div style={{ width: "86%" }}><div className="tut-hl" style={{ background: "#1877f2", color: "#fff", borderRadius: 20, textAlign: "center", padding: 12, fontSize: 14, fontWeight: 600 }}>Start export</div></div>),
    finger: { top: 86, left: "50%" },
  },
  {
    title: "Download, then upload here",
    desc: (<>Instagram emails you when it&apos;s ready (minutes to a day). Download the <b>.zip</b> and drop it into YOUnfollowed — read <b>100% in your browser</b>, never uploaded.</>),
    viz: (
      <div style={{ width: "86%", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", margin: "0 auto", background: "linear-gradient(135deg,#0071e3,#34a0ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>{tIco.dl}</div>
      </div>
    ),
  },
];

const TUT_STEP_MS = 2800;

function TutorialScreen({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [vizKey, setVizKey] = useState(0);
  const total = TUT_STEPS.length;
  const last = cur === total - 1;
  const step = TUT_STEPS[cur];

  useEffect(() => setVizKey((k) => k + 1), [cur]);

  useEffect(() => {
    if (!playing) return;
    if (last) { setPlaying(false); return; }
    const t = setTimeout(() => setCur((c) => Math.min(total - 1, c + 1)), TUT_STEP_MS);
    return () => clearTimeout(t);
  }, [playing, cur, last, total]);

  const go = (n: number) => { setPlaying(false); setCur(Math.max(0, Math.min(total - 1, n))); };

  return (
    <div className="absolute inset-0 flex flex-col bg-surface overflow-hidden">
      <StatusBar dark />
      <div className="flex items-center gap-3 px-[22px] pt-[14px] pb-2 relative z-10 flex-shrink-0">
        <BackButton onClick={onBack} />
        <span className="text-[17px] font-semibold text-text-primary tracking-[-0.3px] flex-1">
          How to get your data
        </span>
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause walkthrough" : "Auto-play walkthrough"}
          className="text-accent text-[13px] font-medium min-h-[36px] px-2 flex items-center gap-1 rounded-full hover:bg-surface-2 transition"
        >
          {playing ? "❚❚ Pause" : "▶ Play"}
        </button>
      </div>
      <ProgressDots active={2} dark />

      <div className="flex-1 flex items-center justify-center px-5 pb-2">
        <div className="w-full bg-white rounded-[30px] shadow-soft-lg overflow-hidden flex flex-col border border-border-light">
          <div className="h-[3px] bg-surface-2">
            <div
              key={vizKey + (playing ? "-p" : "-s")}
              className="h-full bg-accent"
              style={{
                width: playing ? "100%" : `${((cur + 1) / total) * 100}%`,
                transition: playing ? `width ${TUT_STEP_MS}ms linear` : "width .3s ease",
              }}
            />
          </div>

          <div className="relative h-[200px] bg-[#0b0b0c] flex items-center justify-center overflow-hidden">
            <div key={vizKey} className="tut-viz-in w-full flex items-center justify-center">
              {step.viz}
            </div>
            {step.finger && (
              <span
                className="tut-finger"
                style={{ ...step.finger, ...(step.finger.left === "50%" ? { marginLeft: -14 } : {}) }}
              />
            )}
          </div>

          <div className="px-6 pt-5 pb-4 text-center">
            <div className="text-[10.5px] font-bold tracking-[0.5px] uppercase text-accent mb-[7px]">
              Step {cur + 1} of {total}
            </div>
            <h2 className="text-[18px] font-semibold tracking-[-0.3px] text-text-primary mb-[7px] leading-[1.25]">
              {step.title}
            </h2>
            <p className="text-[13px] text-text-secondary leading-[1.5] min-h-[58px]">
              {step.desc}
            </p>
          </div>

          <div className="flex items-center justify-between px-5 pb-5">
            <button
              onClick={() => go(cur - 1)}
              disabled={cur === 0}
              aria-label="Previous step"
              className="w-[40px] h-[40px] rounded-full bg-surface-2 text-text-primary text-[18px] flex items-center justify-center transition active:scale-95 disabled:opacity-30"
            >
              ‹
            </button>
            <div className="flex items-center gap-[5px]">
              {TUT_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className="h-[6px] rounded-full transition-all"
                  style={{ width: i === cur ? 18 : 6, background: i === cur ? "var(--accent)" : "#d2d2d7" }}
                />
              ))}
            </div>
            {last ? (
              <button
                onClick={onNext}
                className="h-[40px] px-4 rounded-full bg-accent text-white text-[14px] font-semibold flex items-center transition active:scale-95 hover:bg-accent-hover"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => go(cur + 1)}
                aria-label="Next step"
                className="w-[40px] h-[40px] rounded-full bg-accent text-white text-[18px] flex items-center justify-center transition active:scale-95 hover:bg-accent-hover"
              >
                ›
              </button>
            )}
          </div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}

/* ============================= Screen 3: Upload ============================= */

function UploadScreen({
  onBack,
  onFile,
  onSample,
  error,
}: {
  onBack: () => void;
  onFile: (file: File) => void;
  onSample: () => void;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col bg-surface overflow-hidden">
      <StatusBar dark />
      <div className="flex items-center gap-3 px-[22px] pt-[14px] pb-2 relative z-10 flex-shrink-0">
        <BackButton onClick={onBack} />
        <span className="text-[17px] font-semibold text-text-primary tracking-[-0.3px]">
          Upload your data
        </span>
      </div>
      <ProgressDots active={3} dark />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-7 pt-[6px] pb-7 flex flex-col gap-5">
          <div>
            <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-text-primary leading-[1.08] mb-3">
              Step 2 — Upload your data
            </h1>
            <p className="text-[16px] text-text-secondary leading-[1.45] tracking-[-0.01em]">
              Select the ZIP file Instagram sent you, or try with sample data.
            </p>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-3 bg-[#fff0f0] rounded-[14px] px-4 py-[14px]">
              <span className="text-[16px] flex-shrink-0 mt-px">⚠️</span>
              <p className="text-[13.5px] leading-[1.45]" style={{ color: "#c0392b" }}>
                {error}
              </p>
            </div>
          )}

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload your Instagram ZIP file"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragover(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragover(true);
            }}
            onDragLeave={() => setDragover(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragover(false);
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            className="border-[1.5px] border-dashed rounded-[20px] px-6 py-11 flex flex-col items-center justify-center gap-3 cursor-pointer text-center transition"
            style={{
              borderColor: dragover ? "#0071e3" : "#d2d2d7",
              background: dragover ? "#f0f7ff" : "#f5f5f7",
              transform: dragover ? "scale(1.01)" : "none",
            }}
          >
            <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-soft-sm">
              <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" fill="none" stroke="#0071e3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-[17px] font-medium text-text-primary tracking-[-0.2px]">
              Drag your Instagram ZIP here
            </p>
            <p className="text-[14px] text-text-muted">or click to browse files</p>
            <div className="flex gap-2 mt-[6px]">
              <span className="px-[11px] py-1 bg-white border border-border-light rounded-lg text-[12px] font-medium text-text-secondary">
                .zip
              </span>
              <span className="px-[11px] py-1 bg-white border border-border-light rounded-lg text-[12px] font-medium text-text-secondary">
                JSON
              </span>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".zip"
            aria-label="Instagram ZIP file"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />

          <div className="flex items-start gap-3 bg-surface-2 rounded-[14px] px-4 py-[14px]">
            <span className="text-[16px] flex-shrink-0 mt-px">🔒</span>
            <p className="text-[13.5px] text-text-secondary leading-[1.45]">
              Your file never leaves your device. All processing happens locally in your browser — we never see your data.
            </p>
          </div>

          <div className="flex items-center gap-[14px] text-text-muted text-[13px] before:content-[''] before:flex-1 before:h-px before:bg-border-light after:content-[''] after:flex-1 after:h-px after:bg-border-light">
            or try a demo
          </div>

          <button
            onClick={onSample}
            aria-label="Use sample demo data"
            className="flex items-center justify-center gap-[7px] py-[14px] min-h-[40px] rounded-xl text-[15px] text-accent transition hover:text-accent-hover hover:underline"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Use sample data (demo)
          </button>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}

/* ============================= Screen 4: Processing ============================= */

const PROCESSING_STEPS = [
  "Reading your data...",
  "Parsing followers list...",
  "Parsing following list...",
  "Comparing relationships...",
  "Calculating engagement scores...",
];

function ProcessingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0); // index of the currently-active step
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const delays = [200, 400, 400, 500, 500];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      elapsed += delays[i];
      timers.push(
        setTimeout(() => {
          setStep(i);
          setProgress(((i + 1) / PROCESSING_STEPS.length) * 100);
        }, elapsed)
      );
    }
    timers.push(setTimeout(() => onDone(), elapsed + 500));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="absolute inset-0 flex flex-col bg-surface overflow-hidden">
      <StatusBar dark />
      <ProgressDots active={4} dark className="pt-[56px]" />

      <div className="flex-1 flex flex-col items-center justify-center px-10 pb-14 text-center">
        <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mb-8 pulse-icon">
          <svg viewBox="0 0 24 24" className="w-9 h-9 spin-slow" fill="none" stroke="#0071e3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
          </svg>
        </div>

        <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-text-primary mb-2">
          Analyzing your data
        </h2>
        <p className="text-[16px] text-text-secondary mb-11 tracking-[-0.01em]">
          This takes just a moment...
        </p>

        <div className="w-full h-[5px] bg-border-light rounded-[3px] overflow-hidden mb-8">
          <div
            className="h-full bg-accent rounded-[3px] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="w-full flex flex-col gap-[6px] text-left">
          {PROCESSING_STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={i}
                className="flex items-center gap-[14px] px-4 py-[13px] rounded-xl transition-all duration-300"
                style={{
                  opacity: done || active ? 1 : 0.4,
                  background: done ? "#f5f5f7" : active ? "#f0f7ff" : "transparent",
                }}
              >
                <div
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    border: done
                      ? "2px solid #0071e3"
                      : active
                      ? "2px solid #0071e3"
                      : "2px solid #d2d2d7",
                    background: done ? "#0071e3" : "transparent",
                    borderTopColor: active ? "transparent" : undefined,
                    animation: active ? "spin 0.8s linear infinite" : undefined,
                  }}
                >
                  {done && (
                    <span
                      style={{
                        width: 9,
                        height: 5,
                        borderLeft: "2px solid #fff",
                        borderBottom: "2px solid #fff",
                        transform: "rotate(-45deg) translateY(-1px)",
                        display: "block",
                      }}
                    />
                  )}
                </div>
                <span
                  className="text-[15px] tracking-[-0.01em]"
                  style={{
                    color: active ? "#0071e3" : done ? "#1d1d1f" : "#6e6e73",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}

/* ============================= Screen 5: Dashboard ============================= */

type TabId =
  | "not-following-back"
  | "you-dont-follow"
  | "deactivated"
  | "recently-unfollowed"
  | "engagement";

const TABS: { id: TabId; label: string }[] = [
  { id: "not-following-back", label: "Don't Follow Back" },
  { id: "you-dont-follow", label: "You Don't Follow" },
  { id: "deactivated", label: "Deactivated" },
  { id: "recently-unfollowed", label: "Unfollowed" },
  { id: "engagement", label: "You Engage Most" },
];

const DEACTIVATED_STORAGE_KEY = "younfollowed:deactivated";

/** Lowercased usernames the user has manually marked as deactivated.
 * Persisted to localStorage so the classification survives a refresh. */
function loadDeactivated(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DEACTIVATED_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveDeactivated(set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DEACTIVATED_STORAGE_KEY,
      JSON.stringify(Array.from(set))
    );
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

function Avatar({ username, size = 42 }: { username: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 tracking-[-0.2px]"
      style={{
        width: size,
        height: size,
        background: avatarColor(username),
        fontSize: size > 44 ? 16 : 14,
      }}
    >
      {initials(username)}
    </div>
  );
}

function UserCard({
  account,
  sinceLabel,
  actionLabel,
  ghost,
  secondaryAction,
  onSecondary,
}: {
  account: Account;
  sinceLabel: string;
  actionLabel: string;
  ghost?: boolean;
  /** Optional compact icon control: deactivate (in the main list) or
   * restore (in the Deactivated list). */
  secondaryAction?: "deactivate" | "restore";
  onSecondary?: (a: Account) => void;
}) {
  const secondaryTitle =
    secondaryAction === "deactivate"
      ? "Mark as deactivated"
      : "Restore to list";

  return (
    <div className="flex items-center gap-[12px] bg-white rounded-[14px] px-[14px] py-[14px] shadow-soft-sm">
      <Avatar username={account.username} size={34} />
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-text-primary tracking-[-0.2px] truncate">
          @{account.username}
        </p>
        {account.timestamp ? (
          <p className="text-[12px] text-text-muted mt-[2px] truncate">
            {sinceLabel}
          </p>
        ) : null}
        {ghost && (
          <span className="inline-block mt-[5px] px-2 py-[2px] bg-surface-2 text-text-muted text-[11px] font-medium rounded-md">
            Never engaged
          </span>
        )}
      </div>
      <div className="flex flex-col items-stretch gap-[6px] flex-shrink-0">
        <a
          href={account.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${actionLabel.replace(/[↗✦\s]+$/, "")} @${account.username} on Instagram`}
          className="px-[14px] py-[6px] min-h-[32px] flex items-center justify-center bg-surface-2 rounded-pill text-[13px] font-medium text-accent whitespace-nowrap transition hover:bg-[#ececef]"
        >
          {actionLabel}
        </a>
        {secondaryAction && onSecondary && (
          <button
            onClick={() => onSecondary(account)}
            aria-label={`${secondaryTitle} — @${account.username}`}
            title={secondaryTitle}
            className="px-[14px] py-[6px] min-h-[30px] flex items-center justify-center gap-[5px] rounded-pill bg-transparent text-text-muted text-[12px] font-medium whitespace-nowrap transition hover:bg-surface-2 active:scale-95"
          >
            {secondaryAction === "deactivate" ? (
              <>
                {/* user-with-slash: mark as deactivated/banned */}
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M9 7a4 4 0 1 0 4 4" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                Deactivated
              </>
            ) : (
              <>
                {/* counter-clockwise arrow: restore */}
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.89" />
                </svg>
                Restore
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  top,
  num,
  label,
  badge,
}: {
  top: string;
  num: number;
  label: string;
  badge?: string;
}) {
  return (
    <div className="bg-white rounded-[20px] px-[22px] py-6 shadow-soft-sm">
      <div className="flex items-center gap-2 mb-[10px]">
        <p className="text-[13px] font-medium text-text-secondary tracking-[-0.01em]">
          {top}
        </p>
        {badge && (
          <span className="px-[8px] py-[2px] bg-surface-2 text-text-muted text-[11px] font-medium rounded-md whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      <p className="text-[56px] font-semibold tracking-[-0.035em] leading-none mb-[10px] text-accent">
        {formatCount(num)}
      </p>
      <p className="text-[14px] text-text-secondary leading-[1.4]">{label}</p>
    </div>
  );
}

function AccountList({
  accounts,
  noun,
  sinceLabel,
  actionLabel,
  secondaryAction,
  onSecondary,
}: {
  accounts: Account[];
  noun: string;
  sinceLabel: (a: Account) => string;
  actionLabel: string;
  secondaryAction?: "deactivate" | "restore";
  onSecondary?: (a: Account) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = accounts.length;
  const shown = expanded ? accounts : accounts.slice(0, INITIAL_RENDER_CAP);

  return (
    <>
      {shown.map((a) => (
        <UserCard
          key={a.username}
          account={a}
          sinceLabel={sinceLabel(a)}
          actionLabel={actionLabel}
          secondaryAction={secondaryAction}
          onSecondary={onSecondary}
        />
      ))}
      {total > INITIAL_RENDER_CAP && (
        <div className="py-2 pb-3 text-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="text-accent text-[15px] px-4 py-2 min-h-[40px] transition hover:underline"
          >
            {expanded
              ? "Show less"
              : `Show all ${formatCount(total)} ${noun}`}
          </button>
        </div>
      )}
    </>
  );
}

function DashboardScreen({
  result,
  onRestart,
}: {
  result: AnalysisResult;
  onRestart: () => void;
}) {
  const [tab, setTab] = useState<TabId>("not-following-back");
  const [chartReady, setChartReady] = useState(false);

  // Usernames (lowercased) the user has manually flagged as deactivated.
  const [deactivated, setDeactivated] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    setDeactivated(loadDeactivated());
  }, []);

  const markDeactivated = (a: Account) => {
    setDeactivated((prev) => {
      const next = new Set(prev);
      next.add(a.username.toLowerCase());
      saveDeactivated(next);
      return next;
    });
  };
  const restoreAccount = (a: Account) => {
    setDeactivated((prev) => {
      const next = new Set(prev);
      next.delete(a.username.toLowerCase());
      saveDeactivated(next);
      return next;
    });
  };

  // Split the "not following back" list by the manual deactivated flag.
  const notFollowingBackActive = result.notFollowingBack.filter(
    (a) => !deactivated.has(a.username.toLowerCase())
  );
  const deactivatedAccounts = result.notFollowingBack.filter((a) =>
    deactivated.has(a.username.toLowerCase())
  );

  useEffect(() => {
    if (tab === "engagement") {
      setChartReady(false);
      const t = setTimeout(() => setChartReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [tab]);

  const maxScore = Math.max(1, ...result.topEngaged.map((e) => e.score));

  return (
    <div className="absolute inset-0 flex flex-col bg-surface-2 overflow-hidden">
      <StatusBar dark />

      <div className="px-6 pt-2 pb-5 border-b border-border-light flex-shrink-0 bg-white/80 backdrop-blur-xl backdrop-saturate-[180%]">
        <div className="h-[44px]" />
        <div className="flex items-center gap-[14px] mb-5">
          <div className="w-[46px] h-[46px] rounded-full bg-text-primary flex items-center justify-center text-[16px] font-medium text-white tracking-[-0.3px]">
            YN
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-text-muted">Welcome back</p>
            <p className="text-[19px] font-semibold text-text-primary tracking-[-0.4px]">
              @yourname
            </p>
          </div>
          <button
            onClick={onRestart}
            title="Start over"
            aria-label="Start over"
            className="w-[40px] h-[40px] rounded-full bg-surface-2 flex items-center justify-center text-text-secondary transition active:scale-95"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.89" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <Stat num={result.followingCount} label="Following" />
          <Stat num={result.followersCount} label="Followers" />
          <Stat num={notFollowingBackActive.length} label="Not back" highlight />
          <Stat num={result.youDontFollowBack.length} label="You don't" />
        </div>
        <p className="mt-[10px] text-[11.5px] text-text-muted leading-[1.45] text-center px-1">
          {deactivatedAccounts.length > 0 ? (
            <>
              {formatCount(result.followingCount)} in your export ·{" "}
              {formatCount(deactivatedAccounts.length)} marked deactivated.
            </>
          ) : (
            <>{formatCount(result.followingCount)} in your export.</>
          )}{" "}
          This can read higher than your live profile — Instagram keeps
          deactivated &amp; banned accounts in the file but hides them from
          your on-app count.
        </p>
      </div>

      <ProgressDots active={5} dark className="py-[6px] pt-[10px] bg-surface-2" />

      <div className="flex bg-white/80 backdrop-blur-xl backdrop-saturate-[180%] border-b border-border-light overflow-x-auto no-scrollbar flex-shrink-0 px-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-label={t.label}
            aria-pressed={tab === t.id}
            className="px-3 py-[14px] min-h-[40px] text-[14px] whitespace-nowrap border-b-2 transition tracking-[-0.01em]"
            style={{
              color: tab === t.id ? "#1d1d1f" : "#6e6e73",
              fontWeight: tab === t.id ? 500 : 400,
              borderBottomColor: tab === t.id ? "#1d1d1f" : "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tab === "not-following-back" && (
          <div className="p-4 flex flex-col gap-2">
            <SummaryCard
              top="Not following you back"
              num={notFollowingBackActive.length}
              label="accounts you follow that don't follow you"
            />
            <div className="px-1 -mt-1 mb-1 text-[12.5px] text-text-muted leading-[1.5]">
              Spot a deactivated or banned account? Tap{" "}
              <span className="font-medium text-text-secondary">Deactivated</span>{" "}
              on a row to move it out of this list — those accounts can&apos;t be
              assessed for whether they follow you back.
            </div>
            <AccountList
              accounts={notFollowingBackActive}
              noun="accounts"
              actionLabel="View ↗"
              sinceLabel={(a) => `Followed since ${formatLongDate(a.timestamp)}`}
              secondaryAction="deactivate"
              onSecondary={markDeactivated}
            />
            {notFollowingBackActive.length === 0 && <EmptyState text="Everyone you follow follows you back. Nice." />}
          </div>
        )}

        {tab === "deactivated" && (
          <div className="p-4 flex flex-col gap-2">
            <SummaryCard
              top="Deactivated accounts"
              num={deactivatedAccounts.length}
              label="accounts you marked as deactivated or banned"
            />
            <div className="px-1 -mt-1 mb-1 text-[12.5px] text-text-muted leading-[1.5]">
              Deactivated accounts can&apos;t be assessed for whether they still
              follow you back — when an account is deactivated or banned, it
              disappears from both the followers and following lists in your
              export, so there&apos;s no way to tell. They&apos;re kept here,
              separate from your real &quot;don&apos;t follow back&quot; results.
              Tap <span className="font-medium text-text-secondary">Restore</span>{" "}
              to move one back.
            </div>
            <AccountList
              accounts={deactivatedAccounts}
              noun="accounts"
              actionLabel="View ↗"
              sinceLabel={(a) => `Followed since ${formatLongDate(a.timestamp)}`}
              secondaryAction="restore"
              onSecondary={restoreAccount}
            />
            {deactivatedAccounts.length === 0 && (
              <EmptyState text="No accounts marked as deactivated yet. In the “Don't Follow Back” list, tap “Deactivated” on any account you know is deactivated or banned to move it here." />
            )}
          </div>
        )}

        {tab === "you-dont-follow" && (
          <div className="p-4 flex flex-col gap-2">
            <SummaryCard
              top="Following you, but you don't follow back"
              num={result.youDontFollowBack.length}
              label="accounts following you that you haven't followed back"
            />
            <AccountList
              accounts={result.youDontFollowBack}
              noun="accounts"
              actionLabel="Follow ✦"
              sinceLabel={(a) => `Following you since ${formatLongDate(a.timestamp)}`}
            />
            {result.youDontFollowBack.length === 0 && <EmptyState text="You follow back everyone who follows you." />}
          </div>
        )}

        {tab === "recently-unfollowed" && (
          <div className="p-4 flex flex-col gap-2">
            <SummaryCard
              top="Recently unfollowed you"
              num={result.recentlyUnfollowed.length}
              label="accounts that unfollowed you, newest first"
              badge="~90 days"
            />
            <div className="px-1 -mt-1 mb-1 text-[12.5px] text-text-muted leading-[1.5]">
              Instagram only retains roughly the last 90 days of unfollow
              history, so this list is intentionally short.
            </div>
            <AccountList
              accounts={result.recentlyUnfollowed}
              noun="accounts"
              actionLabel="View ↗"
              sinceLabel={(a) => `Unfollowed you ${formatLongDate(a.timestamp)}`}
            />
            {result.recentlyUnfollowed.length === 0 && (
              <EmptyState text="No recent unfollows are recorded in your export — and that's completely normal. Instagram only keeps roughly the last 90 days of unfollow history, so an empty list here usually just means nobody unfollowed you in that window, not that anything went wrong." />
            )}
          </div>
        )}

        {tab === "engagement" && (
          <div className="p-4 flex flex-col gap-2">
            {result.hasEngagementData && result.topEngaged.length > 0 ? (
              <>
                <div className="bg-white rounded-[14px] p-5 shadow-soft-sm">
                  <p className="text-[15px] font-semibold text-text-primary mb-[18px] tracking-[-0.2px]">
                    Accounts you engage with most
                  </p>
                  {result.topEngaged.map((e) => (
                    <div key={e.username} className="flex items-center gap-3 mb-[13px]">
                      <span className="w-20 text-[12.5px] text-text-secondary truncate flex-shrink-0">
                        @{e.username}
                      </span>
                      <div className="flex-1 h-2 bg-surface-2 rounded-[4px] overflow-hidden">
                        <div
                          className="h-full rounded-[4px] bg-accent transition-all duration-700"
                          style={{ width: chartReady ? `${(e.score / maxScore) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="text-[12.5px] font-medium text-text-primary w-[30px] text-right flex-shrink-0">
                        {e.score}
                      </span>
                    </div>
                  ))}
                  <div className="mt-[18px] px-4 py-[14px] bg-surface-2 rounded-xl text-[13.5px] text-text-secondary leading-[1.5]">
                    ✨ These are the accounts whose posts <strong className="text-text-primary font-medium">you</strong> like and comment on most. Instagram&apos;s export only records your own activity — not who engages with you.
                  </div>
                </div>

                <div className="bg-white rounded-[14px] p-5 shadow-soft-sm">
                  <p className="text-[15px] font-semibold text-text-primary mb-4 tracking-[-0.2px]">
                    Engagement overview
                  </p>
                  <div className="grid grid-cols-2 gap-[10px]">
                    <OverviewStat num={result.mutuals.length} label="Mutuals" />
                    <OverviewStat num={result.topEngaged.length} label="You engage" color="#34a853" />
                    <OverviewStat num={result.recentlyUnfollowed.length} label="Unfollowed you" />
                    <OverviewStat num={result.followersCount} label="Followers" />
                  </div>
                </div>
                <div className="pb-3" />
              </>
            ) : (
              <EmptyState text="Engagement insights need your likes and comments data. Re-export including 'Likes' and 'Comments' to unlock this." />
            )}
          </div>
        )}
      </div>
      <HomeIndicator />
    </div>
  );
}

function Stat({ num, label, highlight }: { num: number; label: string; highlight?: boolean }) {
  return (
    <div className="text-center px-1 py-1">
      <div
        className="text-[28px] font-semibold tracking-[-0.03em] leading-none mb-[6px]"
        style={{ color: highlight ? "#0071e3" : "#1d1d1f" }}
      >
        {formatCount(num)}
      </div>
      <div className="text-[11px] text-text-muted leading-[1.2]">{label}</div>
    </div>
  );
}

function OverviewStat({ num, label, color }: { num: number; label: string; color?: string }) {
  return (
    <div className="bg-surface-2 rounded-xl p-4 text-center">
      <p className="text-[28px] font-semibold tracking-[-0.03em] mb-1" style={{ color: color ?? "#1d1d1f" }}>
        {formatCount(num)}
      </p>
      <p className="text-[12px] text-text-muted">{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-[14px] px-5 py-8 shadow-soft-sm text-center text-[14px] text-text-secondary leading-[1.5]">
      {text}
    </div>
  );
}

/* ============================= Root App ============================= */

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parsedRef = useRef<ParsedData | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [animKey, setAnimKey] = useState(0);

  function go(n: ScreenId) {
    setScreen(n);
    setAnimKey((k) => k + 1);
  }

  async function handleFile(file: File) {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Please upload the .zip file Instagram sent you.");
      return;
    }
    setAnalyzing(true);
    try {
      const parsed = await parseInstagramZip(file);
      parsedRef.current = parsed;
      setResult(analyze(parsed));
      setAnalyzing(false);
      go(4);
    } catch (e) {
      setAnalyzing(false);
      setError(e instanceof Error ? e.message : "Something went wrong reading that file.");
    }
  }

  function handleSample() {
    setError(null);
    const data = getSampleData();
    parsedRef.current = data;
    setResult(analyze(data));
    go(4);
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[100dvh] w-full p-4 sm:p-10"
      style={{ background: "radial-gradient(1200px 600px at 50% -10%, #ffffff 0%, #f5f5f7 60%)" }}
    >
      <div className="relative w-[393px] max-w-full flex-shrink-0">
        <div className="bg-[#1d1d1f] rounded-[56px] p-3 shadow-soft-lg max-[430px]:rounded-none max-[430px]:p-0 max-[430px]:shadow-none">
          {/* Dynamic island */}
          <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[118px] h-[33px] bg-black rounded-[20px] z-[100] flex items-center justify-end pr-3 gap-[6px] max-[430px]:top-[10px]">
            <div className="w-[5px] h-[5px] bg-[#14242e] rounded-full" />
            <div className="w-[9px] h-[9px] bg-[#0a0a0a] rounded-full border border-[#1a1a1a]" />
          </div>

          <div className="relative bg-white rounded-[44px] overflow-hidden h-[844px] max-[430px]:rounded-none max-[430px]:h-[100dvh] flex flex-col">
            <div key={animKey} className="screen-enter absolute inset-0">
              {screen === 1 && <LandingScreen onNext={() => go(2)} />}
              {screen === 2 && <TutorialScreen onBack={() => go(1)} onNext={() => go(3)} />}
              {screen === 3 && (
                <UploadScreen
                  onBack={() => go(2)}
                  onFile={handleFile}
                  onSample={handleSample}
                  error={error}
                />
              )}
              {screen === 4 && <ProcessingScreen onDone={() => go(5)} />}
              {screen === 5 && result && (
                <DashboardScreen result={result} onRestart={() => go(1)} />
              )}
            </div>

            {/* Analyzing overlay (during real file parse) */}
            <div
              className="absolute inset-0 bg-white/[0.96] backdrop-blur-md flex flex-col items-center justify-center gap-[18px] z-[200] transition-opacity duration-300"
              style={{
                opacity: analyzing ? 1 : 0,
                pointerEvents: analyzing ? "all" : "none",
              }}
            >
              <div className="w-10 h-10 rounded-full border-[3px] border-border-light border-t-accent spin" />
              <p className="text-[16px] font-medium text-text-primary tracking-[-0.01em]">
                Analyzing your data...
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className="max-[430px]:hidden mt-6 text-center text-[13px] text-text-muted">
        Built by{" "}
        <a
          href="https://linkedin.com/in/arthiknepal"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:underline"
        >
          Arthik
        </a>
      </footer>
    </div>
  );
}
