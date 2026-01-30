import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex justify-center gap-4 md:gap-6 mb-10 flex-wrap">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        
        return (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300",
              isActive && "bg-slate-700/80 opacity-100",
              isDone && "bg-green-900/50 opacity-100",
              !isActive && !isDone && "bg-slate-800/50 opacity-50"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                isActive && "bg-blue-500 text-white",
                isDone && "bg-green-500 text-white",
                !isActive && !isDone && "bg-slate-600 text-slate-300"
              )}
            >
              {isDone ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            <span className="text-sm font-medium hidden sm:block">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}