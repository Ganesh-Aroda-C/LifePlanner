import React from 'react';
import {
  Sparkles,
  Bot,
  Mail,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../components/Button';

export const Assistant = () => {
  const roadmapPillars = [
    {
      phase: 'Phase 2',
      title: 'Gmail Intelligence',
      icon: Mail,
      desc: 'Authorized Google OAuth integration to parse actionable deadlines, invoice due dates, and exam announcements directly into task drafts.',
      status: 'In Architecture Planning',
    },
    {
      phase: 'Phase 3',
      title: 'Smart Scheduling & Conflict Detection',
      icon: Calendar,
      desc: 'Deep integration with Google Calendar API to automatically calculate buffer times, resolve overlapping commitments, and propose balanced daily timetables.',
      status: 'Pipeline',
    },
    {
      phase: 'Phase 4',
      title: 'Android Native Companion',
      icon: Clock,
      desc: 'React Native & Expo app featuring Android AlarmManager bridges for unmissable audio alarms, background synchronization, and lock-screen actions.',
      status: 'Pipeline',
    },
    {
      phase: 'Phase 5',
      title: 'WhatsApp & SMS Message Intake',
      icon: MessageSquare,
      desc: 'Secure local parsing of school, university, and community messages with strict user confirmation before committing actions.',
      status: 'Pipeline',
    },
    {
      phase: 'Phase 6',
      title: 'Autonomous Conversational Assistant',
      icon: Bot,
      desc: 'Natural language chat interface with structured JSON function calling, personalized productivity briefings, and proactive advice.',
      status: 'Final Phase Goal',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              LifeOS Copilot
            </h1>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              Phase 6 Preview
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            The future conversational brain of your personal life operating system.
          </p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-7 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Under Active Phased Engineering</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            An AI that does not just talk—it understands your life context.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Unlike generic chat widgets, LifeOS Copilot is being engineered with strict data pipelines to your actual email, calendar, and task graph. In Phase 1, our primary focus is rock-solid foundational task and reminder architecture.
          </p>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-indigo-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Engineering Standard:</strong> In compliance with Phase 1 project specifications, mock or hallucinated AI responses are disabled. All statistics on your dashboard reflect real MongoDB data.
            </span>
          </div>
        </div>
      </div>

      {/* Planned Copilot Capabilities */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Architectural Roadmap Pillars
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Step-by-step evolution path towards full autonomous life management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmapPillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {pillar.phase}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{pillar.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-indigo-600">
                    {pillar.status}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
