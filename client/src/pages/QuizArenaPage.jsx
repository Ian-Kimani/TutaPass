import React from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';

export default function QuizArenaPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tab 3 • Practice Arena (Smart Quiz)
            </span>
            <h1 className="text-xl font-bold text-white mt-1">High-Yield Scenario Questions</h1>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Real enterprise scenarios with instant Distractor Autopsies and one-click Cultural Context Switcher.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-sm">
        <Sparkles className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
        <p className="font-semibold text-slate-200">Practice Arena Shell Initialized</p>
        <p className="text-xs text-slate-400 mt-1">Interactive question runner with Distractor Autopsy and Sheng toggle will be connected in Step 6B.</p>
      </div>
    </div>
  );
}
