import React, { useState } from 'react';
import { MatchWeights } from '../../types';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';

interface WeightSliderModalProps {
  weights: MatchWeights;
  onClose: () => void;
  onSave: (weights: MatchWeights) => void;
}

export const WeightSliderModal: React.FC<WeightSliderModalProps> = ({ weights: initialWeights, onClose, onSave }) => {
  const [weights, setWeights] = useState<MatchWeights>({ ...initialWeights });

  const defaultWeights: MatchWeights = {
    eligibility_weight: 0.20,
    required_skills_weight: 0.30,
    preferred_skills_weight: 0.10,
    projects_weight: 0.10,
    internships_weight: 0.05,
    cgpa_weight: 0.10,
    experience_weight: 0.05,
    soft_skills_weight: 0.05,
    certifications_weight: 0.05
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleChange = (key: keyof MatchWeights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: Math.round(value * 100) / 100 }));
  };

  const resetToDefault = () => setWeights({ ...defaultWeights });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-white">Tune Candidate Scoring Formula</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="py-4 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {[
            { key: 'eligibility_weight', label: 'Mandatory Eligibility' },
            { key: 'required_skills_weight', label: 'Required Core Skills' },
            { key: 'preferred_skills_weight', label: 'Preferred Tooling' },
            { key: 'projects_weight', label: 'Project Portfolio Overlap' },
            { key: 'internships_weight', label: 'Internship Industry Exp' },
            { key: 'cgpa_weight', label: 'Academic CGPA Score' },
            { key: 'experience_weight', label: 'Total Tech Duration' },
            { key: 'soft_skills_weight', label: 'Soft Skills & Leadership' },
            { key: 'certifications_weight', label: 'Certifications' }
          ].map((item) => {
            const val = weights[item.key as keyof MatchWeights];
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{item.label}</span>
                  <span className="text-brand-400">{Math.round(val * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={val}
                  onChange={(e) => handleChange(item.key as keyof MatchWeights, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700">
              Cancel
            </button>
            <button
              onClick={() => { onSave(weights); onClose(); }}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 flex items-center gap-1"
            >
              <Check className="w-4 h-4" /> Apply Weights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
