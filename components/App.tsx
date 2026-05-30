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

        <h1 className="text-[40px] font-semibold tracking-[-0.025em] mb-4 leading-[1.05]" style={{ color: "#f5f5f7" }}>
          <span className="font-bold">YOU</span>nfollowed
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

const TUTORIAL_STEPS = [
  {
    title: "Open Instagram",
    desc: "Go to your Profile, then tap the Menu icon (≡) in the top right",
  },
  {
    title: 'Find "Download Your Information"',
    desc: "Settings & Privacy → Your Activity → Download Your Information",
  },
  {
    title: "Select data to export",
    desc: 'Choose "Followers and Following" — or select All Data for a full export',
  },
  {
    title: "Choose JSON format",
    desc: "This is critical — YOUnfollowed only reads JSON, not HTML",
    badge: "⚠ Select JSON, not HTML",
  },
  {
    title: "Request your download",
    desc: 'Tap "Create Files" — Instagram will email you when it\'s ready (24–48h)',
  },
  {
    title: "Download the ZIP file",
    desc: "Check your email and tap the download link — you'll get a .zip file",
    badge: "Come back here once downloaded",
    badgeAccent: true,
  },
];

function TutorialScreen({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col bg-surface overflow-hidden">
      <StatusBar dark />
      <div className="flex items-center gap-3 px-[22px] pt-[14px] pb-2 relative z-10 flex-shrink-0">
        <BackButton onClick={onBack} />
        <span className="text-[17px] font-semibold text-text-primary tracking-[-0.3px]">
          How to get your data
        </span>
      </div>
      <ProgressDots active={2} dark />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-7 pt-[6px] pb-5">
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-text-primary leading-[1.08] mb-4">
            Step 1 — Download your Instagram data
          </h1>
          <div className="flex items-start gap-3 bg-surface-2 rounded-[14px] px-4 py-[14px]">
            <span className="text-[18px] flex-shrink-0 mt-px">⏳</span>
            <p className="text-[14px] text-text-secondary leading-[1.45]">
              Instagram takes <strong className="text-text-primary font-semibold">24–48 hours</strong> to prepare your file. Start the request now while you explore.
            </p>
          </div>
        </div>

        <div className="px-7 pb-5 flex flex-col gap-[10px]">
          {TUTORIAL_STEPS.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-surface-2 rounded-[14px] px-[18px] py-[18px] transition hover:bg-[#ececef]"
            >
              <div className="w-7 h-7 rounded-full border-[1.5px] border-accent flex items-center justify-center text-[14px] font-medium text-accent flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <strong className="block text-[16px] font-medium text-text-primary tracking-[-0.2px] mb-[3px]">
                  {s.title}
                </strong>
                <span className="text-[14px] text-text-secondary leading-[1.45]">
                  {s.desc}
                </span>
                {s.badge && (
                  <div>
                    <span
                      className="inline-block mt-2 px-[9px] py-[3px] bg-white text-[12px] font-medium rounded-[7px]"
                      style={{ color: s.badgeAccent ? "#0071e3" : "#6e6e73" }}
                    >
                      {s.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-7 pt-4 pb-8 flex-shrink-0">
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-[6px] w-full py-[15px] px-6 bg-accent text-white text-[17px] font-medium tracking-[-0.2px] rounded-pill transition hover:bg-accent-hover active:bg-accent-active active:scale-[0.99]"
        >
          I have my file, continue
          <Chevron />
        </button>
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
      className="flex items-center justify-center min-h-[100dvh] w-full p-4 sm:p-10"
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
    </div>
  );
}
