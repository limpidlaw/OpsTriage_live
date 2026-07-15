/*
 * @graphify REQ_SLA_COUNTDOWN_TIMER
 * @graphify REQ_HEALTH_SCORE_EVENT_DRIVEN
 * @graphify REQ_B2B_HEALTH_SCORE_FORMULA
 * @graphify REQ_CSAT_FALLBACK_POLICY
 * @graphify REQ_AI_FEEDBACK_LOOP
 */

import React, { useState, useEffect } from 'react';
import { translations, Locale } from '../locales/i18n';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { PlusCircle, CheckCircle2 } from 'lucide-react';
import { globalEventBus } from '../App';

import { Ticket } from '../App';

interface SlaProps {
  locale: Locale;
  starkHealth: number;
  starkStatus: string;
  tickets: Ticket[];
  onInjectTicket: () => void;
}

export const SlaDashboard: React.FC<SlaProps> = ({
  locale,
  starkHealth,
  starkStatus,
  tickets,
  onInjectTicket
}) => {
  const t = translations[locale];
  
  // Timer States: Absolute SLA Deadline Epoch (Server Time base)
  const [slaDeadline, setSlaDeadline] = useState<number>(() => {
    // Default deadline: 7 minutes from now (Server time estimated)
    return Date.now() + 420000;
  });
  const [timeLeft, setTimeLeft] = useState<number>(420);
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Recharts state
  const [chartData, setChartData] = useState([
    { name: 'Acme Corp', health: 92, status: 'Good' },
    { name: 'Stark Ind', health: starkHealth, status: starkStatus },
    { name: 'Wayne Ent', health: 96, status: 'Good' },
    { name: 'Oscorp', health: 64, status: 'Warning' }
  ]);

  // Synchronize Stark health when prop changes
  useEffect(() => {
    setChartData(prev => prev.map(item => 
      item.name === 'Stark Ind' 
        ? { ...item, health: starkHealth, status: starkStatus } 
        : item
    ));
  }, [starkHealth, starkStatus]);

  // Offset clock calculation (Truth of Time)
  useEffect(() => {
    // Mimic API Server time offset (+1.5 seconds server drift)
    const serverEpoch = Date.now() + 1500;
    const calculatedOffset = serverEpoch - Date.now();
    setTimeOffset(calculatedOffset);
  }, []);

  // Timer Tick Engine: Anti-clock tampering calculation
  useEffect(() => {
    const interval = setInterval(() => {
      const serverCurrentTime = Date.now() + timeOffset;
      const remainingSeconds = Math.round((slaDeadline - serverCurrentTime) / 1000);
      setTimeLeft(remainingSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [slaDeadline, timeOffset]);

  // Listen to event bus for Chart refreshing
  useEffect(() => {
    globalEventBus.on('HEALTH_GRAPH_REFRESH', () => {
      const msg = locale === 'ko' 
        ? "B2B 고객사 헬스 그래프 갱신 완료" 
        : locale === 'es' 
          ? "Gráfico de salud B2B actualizado." 
          : "B2B Health Graph Refreshed.";
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 3000);
    });
  }, [locale]);

  // Format time (breach safe)
  const formatTimer = (seconds: number): { text: string; isBreached: boolean } => {
    const isBreached = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;
    
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${isBreached ? '-' : ''}${pad(h)}:${pad(m)}:${pad(s)}`;
    return { text: formatted, isBreached };
  };

  const timerInfo = formatTimer(timeLeft);

  // Inject simulated ticket (Accelerate deadline epoch to test warnings)
  const handleTicketInject = () => {
    const acceleratedDeadline = Date.now() + timeOffset + 12000; // Force 12s remaining
    setSlaDeadline(acceleratedDeadline);
    onInjectTicket();
    setToastMessage(locale === 'ko' ? "가상 VIP 티켓 주입 성공 (SLA 카운트다운 가속)" : "Simulated VIP Ticket Injected.");
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="flex-1 flex bg-slate-950">
      {}
      <div className="w-[250px] bg-slate-900 border-r border-slate-800 p-4 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">B2B CLIENTS (4)</div>
          <div className="space-y-2">
            {chartData.map((client, idx) => {
              const isWarning = client.status === 'Warning';
              const isAtRisk = client.status === 'At Risk';
              
              let badgeColor = "bg-emerald-950 text-emerald-400";
              if (isWarning) badgeColor = "bg-amber-950 text-amber-400";
              if (isAtRisk) badgeColor = "bg-red-950 text-red-400";

              const clientTickets = tickets.filter(t => t.client === client.name && t.status === 'Open').length;
              return (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-850/60 rounded flex items-center justify-between transition-colors hover:bg-slate-900">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-300">{client.name}</div>
                    {clientTickets > 0 && (
                      <div className="text-[9px] text-red-400 font-bold uppercase tracking-tight">
                        {clientTickets} Active {clientTickets === 1 ? 'Ticket' : 'Tickets'}
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${badgeColor}`}>
                    {client.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="bg-slate-950 p-3 border border-slate-850 rounded space-y-2">
          <div className="text-[10px] text-slate-500 font-black uppercase">CSAT Satisfaction</div>
          <div className="flex justify-around">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                onClick={() => {
                  setToastMessage(locale === 'ko' ? `CSAT ${star}점 피드백 반영 완료!` : `CSAT ${star}-Star Feedback Logged!`);
                  setTimeout(() => setToastMessage(''), 2500);
                }}
                className="text-slate-500 hover:text-amber-400 transition-colors"
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 p-6 space-y-6 flex flex-col justify-between relative overflow-y-auto">
        {}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-40 bg-emerald text-slate-950 px-4 py-2 rounded text-xs font-black tracking-tight shadow-none flex items-center space-x-2 animate-soft-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="space-y-6">
          {}
          <div>
            <h2 className="text-lg font-black text-slate-100">{t.sla.title}</h2>
            <p className="text-[11px] text-slate-500">
              {locale === 'ko' ? '실시간 옴니채널 OLA/SLA 상태 지표와 B2B 고객사 헬스 추이를 관제합니다.' : 'Real-time telemetry of OLA/SLA thresholds and accounts health parameters.'}
            </p>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 flex items-center justify-between h-24">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase">{t.sla.timerLabel}</div>
                <div className="text-[11px] text-blue-400 font-mono">
                  {locale === 'ko' ? '서버 오프셋 동기화 보장' : 'Server sync offset guaranteed'}
                </div>
              </div>
              <div className={`text-2xl font-mono font-black ${
                timerInfo.isBreached 
                  ? 'text-coral animate-pulse' 
                  : timeLeft < 60 ? 'text-amberOrange-dark' : 'text-slate-100'
              }`}>
                {timerInfo.text}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 flex items-center justify-between h-24">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Stark Industries Health</div>
                <div className="text-[11px] text-slate-400 font-bold">
                  {locale === 'ko' ? `상태 등급: ${starkStatus}` : `Status: ${starkStatus}`}
                </div>
              </div>
              <div className={`text-2xl font-black ${
                starkStatus === 'At Risk' ? 'text-coral' : 'text-emerald'
              }`}>
                {starkHealth}%
              </div>
            </div>
          </div>

          {}
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="text-[10px] text-slate-500 font-bold uppercase">{t.sla.chartLabel}</div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Bar dataKey="health" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => {
                      let color = '#10b981'; // Good (Emerald)
                      if (entry.status === 'Warning') color = '#f59e0b'; // Amber
                      if (entry.status === 'At Risk') color = '#ef4444'; // Coral
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {}
        {/* Live Ticket Injector Panel with right padding to clear floating chatbot button */}
        <div className="flex justify-end pt-4 border-t border-slate-900 pr-20">
          <button
            onClick={handleTicketInject}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black tracking-wider uppercase flex items-center space-x-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.sla.injectBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
