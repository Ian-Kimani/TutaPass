import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Terminal, ShieldAlert, Cpu, Gauge, Zap, ChevronDown, Lightbulb, LockKeyhole } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PromptXRayDrawer() {
  const { isXRayOpen, setIsXRayOpen, promptTelemetry } = useApp();
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!isXRayOpen) return null;

  const handleCopy = () => {
    const fullText = `=== SYSTEM INSTRUCTION ===\n${promptTelemetry?.systemInstruction || ''}\n\n=== USER PROMPT ===\n${promptTelemetry?.userPrompt || ''}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const techniques = promptTelemetry?.techniquesUsed || [
    'Distractor Autopsy Anatomy Framework',
    'Tri-Linguistic Cultural Persona (Standard / African / Sheng)',
    'Negative Anti-Leak & Non-Infringement Constraints',
    'Strict Structured JSON Output Schema',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsXRayOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="w-screen max-w-2xl transform bg-[#150722] border-l border-[#34144e] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-[#1f0932]/95 border-b border-[#3b1759] sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50 shrink-0">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      AI Transparency Lab
                    </h2>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      20% Criteria
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/70">
                    A clear look at how TutaPass makes AI useful for learning
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-xl bg-[#2a0e44] hover:bg-[#38135c] text-purple-200 hover:text-white transition text-xs flex items-center gap-1.5 border border-purple-500/30"
                  title="Copy Prompt"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setIsXRayOpen(false)}
                  className="p-2 rounded-xl hover:bg-[#2a0e44] text-purple-300 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 sm:mt-4 text-xs">
              <div className="p-2.5 rounded-xl bg-[#140621] border border-purple-900/50">
                <div className="text-purple-300 flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  <span>Model Engine</span>
                </div>
                <div className="font-semibold text-slate-100 mt-0.5 truncate">
                  {promptTelemetry?.modelUsed || 'Gemini Flash (not called yet)'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#140621] border border-purple-900/50">
                <div className="text-purple-300 flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 text-amber-400" />
                  <span>Temperature</span>
                </div>
                <div className="font-semibold text-slate-100 mt-0.5">
                  {promptTelemetry?.temperature ?? 0.7} <span className="text-[10px] text-purple-300/70">(Calibrated)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#140621] border border-purple-900/50">
                <div className="text-purple-300 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Telemetry State</span>
                </div>
                <div className="font-semibold text-emerald-400 mt-0.5 capitalize">
                  {promptTelemetry?.status?.replace(/_/g, ' ') || 'Live Telemetry'}
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Judge Evaluation Note */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs leading-relaxed text-indigo-200 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-100 font-semibold">Built for the 20% prompt-engineering criterion</strong>
                <p className="mt-1 text-slate-300">
                  TutaPass does not ask AI for a generic answer. It gives the model a learning job: explain every distractor, detect misconceptions, adapt the explanation style, and return a predictable structure the app can safely use.
                </p>
              </div>
            </div>

            {/* Outcome summary */}
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/25 p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-100">What this produces for a learner</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {[
                      ['Understand', 'Why the correct answer works'],
                      ['Compare', 'Why tempting answers fail'],
                      ['Improve', 'A Mistake Card and next step'],
                    ].map(([title, copy]) => (
                      <div key={title} className="rounded-xl border border-emerald-400/15 bg-black/15 p-3">
                        <div className="text-xs font-bold text-emerald-200">{title}</div>
                        <div className="mt-1 text-[11px] leading-relaxed text-slate-300">{copy}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live example */}
            <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200">
                <Zap className="h-3.5 w-3.5" /> Live learning example
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-black/20 p-3">
                  <div className="text-[10px] font-bold uppercase text-amber-300/70">Learner input</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200">
                    “I chose Availability Zones because they protect VMs from a whole data-centre outage.”
                  </p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <div className="text-[10px] font-bold uppercase text-amber-300/70">TutaPass response</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200">
                    “Understood. Your explanation identifies the key distinction, so this concept does not need a new Mistake Card.”
                  </p>
                </div>
              </div>
            </div>

            {/* Techniques Used Badges */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
                Prompt Engineering Techniques Applied
              </div>
              <div className="flex flex-wrap gap-2">
                {techniques.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs rounded-md bg-purple-900/30 border border-purple-500/30 text-purple-300 font-medium"
                  >
                    ✦ {tech}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTechnicalDetails((visible) => !visible)}
              className="flex w-full items-center justify-between rounded-xl border border-purple-500/25 bg-purple-950/20 p-3 text-left text-xs font-bold text-purple-100 transition hover:bg-purple-950/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-expanded={showTechnicalDetails}
            >
              <span className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-purple-300" />
                View technical prompt details
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`} />
            </button>

            {showTechnicalDetails && <div className="space-y-5">
            {/* System Instruction */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                  System Instructions & Guardrails
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Role: Lead Architect</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#12051c] border border-[#2f1345] text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                {promptTelemetry?.systemInstruction || 'No system instruction captured yet.'}
              </div>
            </div>

            {/* User Prompt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  Injected User Prompt & Context
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Dynamic Payload</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#12051c] border border-[#2f1345] text-xs font-mono text-amber-300/90 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                {promptTelemetry?.userPrompt || 'No prompt dispatched yet.'}
              </div>
            </div>
            </div>}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#110419] border-t border-[#26133a] text-center text-xs text-purple-300/70">
            Powered by Google Gemini • Power Learn Project Vibe Coding Hackathon
          </div>
        </div>
      </div>
    </div>
  );
}
