'use client';

import { X, FileText, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job } from '../types/jobs';

interface ResumeOptimizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export function ResumeOptimizationPanel({
  isOpen,
  onClose,
  job,
}: ResumeOptimizationPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm" />

      {/* Sidebar Panel */}
      <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#682A53] to-[#7d3463] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Resume Optimization</h2>
              <p className="text-xs text-white/80">AI-Powered Resume Enhancement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Job Info Banner */}
        {job && (
          <div className="bg-purple-50 border-b border-purple-200 px-6 py-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
                <p className="text-xs text-gray-600">{job.company} • {job.location}</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                <span className="text-xs font-bold text-green-700">{job.matchScore}%</span>
                <span className="text-xs text-green-600">Match</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Work in Progress Placeholder */}
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-[#682A53]" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Resume Optimization
              </h3>

              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                AI-powered resume optimization is coming soon! This feature will help you tailor your resume to match job requirements perfectly.
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-left space-y-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  🚀 Upcoming Features:
                </h4>

                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>Analyze your base resume against job requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>AI-powered keyword optimization and suggestions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>Rephrase bullet points for maximum impact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>Highlight missing skills and experience gaps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>Download optimized resume in PDF/DOCX format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>Track job-specific resume versions</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">🔨 Work in Progress:</span> This feature is currently under development. Check back soon for AI-powered resume optimization!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Feature coming soon...
            </p>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="h-9"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
