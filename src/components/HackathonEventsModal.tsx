import React from 'react';
import { ExternalLink, Trophy, Clock, Target, Zap } from 'lucide-react';
import { HackathonEvent } from '../types';

interface HackathonEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: HackathonEvent[];
}

export function HackathonEventsModal({ isOpen, onClose, events }: HackathonEventsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-2xl">
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Active Hackathon Events</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-slate-800/50 border border-cyan-400/20 rounded-xl p-6 hover:border-cyan-400/50 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      event.ecosystem === "MetaMask" 
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}>
                      {event.ecosystem}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300">
                      {event.timeLeft}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{event.name}</h3>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">{event.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-gray-400">Prize Pool</span>
                  </div>
                  <p className="text-lg font-bold text-green-400">{event.prizes}</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-gray-400">Deadline</span>
                  </div>
                  <p className="text-lg font-bold text-cyan-300">{event.deadline}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-gray-300">Prize Tracks</span>
                </div>
                <ul className="space-y-1">
                  {event.tracks.slice(0, 3).map((track, idx) => (
                    <li key={idx} className="text-sm text-gray-400">
                      • {track}
                    </li>
                  ))}
                  {event.tracks.length > 3 && (
                    <li className="text-sm text-gray-500">
                      + {event.tracks.length - 3} more tracks
                    </li>
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-gray-300">Tech Stack</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm font-semibold text-gray-300 block mb-2">Requirements</span>
                <ul className="space-y-1">
                  {event.requirements.map((req, idx) => (
                    <li key={idx} className="text-sm text-gray-400">
                      ✓ {req}
                    </li>
                  ))}
                </ul>
              </div>

              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg text-white font-semibold transition"
                >
                  Register Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
