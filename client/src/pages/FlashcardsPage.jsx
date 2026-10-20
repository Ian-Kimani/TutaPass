import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

export default function FlashcardsPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Tab 4 • Weak-Spot Flashcards
            </span>
            <h1 className="text-xl font-bold text-white mt-1">SuperMemo-2 (SM-2) Spaced Repetition</h1>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Automated cards harvested directly from questions you missed during quiz practice.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-sm">
        <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-2 opacity-80" />
        <p className="font-semibold text-slate-200">Weak-Spot Flashcards Shell Initialized</p>
        <p className="text-xs text-slate-400 mt-1">Interactive 3D card flip and SM-2 recall rating buttons will be connected in Step 6B.</p>
      </div>
    </div>
  );
}
