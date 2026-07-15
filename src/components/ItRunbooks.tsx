/*
 * @graphify REQ_CLIENT_EVENT_BUS_PUBSUB
 */

import React, { useState, useEffect } from 'react';
import { translations, Locale } from '../locales/i18n';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { globalEventBus } from '../App';

import { Ticket, L2TeamConfig, TelemetryIntegrations } from '../App';

interface RunbooksProps {
  locale: Locale;
  isSimulatorActive: boolean;
  tickets: Ticket[];
  onResolveTicket: (ticketId: string, replyText?: string, isL2EscalatedComplete?: boolean, manualNote?: string) => void;
  globalL2Teams: L2TeamConfig[];
  telemetryIntegrations: TelemetryIntegrations;
}

export const ItRunbooks: React.FC<RunbooksProps> = ({ 
  locale, 
  isSimulatorActive, 
  tickets,
  onResolveTicket,
  globalL2Teams,
  telemetryIntegrations
}) => {
  const t = translations[locale];

  const [activePbId, setActivePbId] = useState<string>('pb-1');
  const [toastMsg, setToastMsg] = useState<string>('');

  // Track webhook states dynamically per playbook ID
  const [jiraStatusMap, setJiraStatusMap] = useState<{ [key: string]: boolean }>({});
  const [githubStatusMap, setGithubStatusMap] = useState<{ [key: string]: boolean }>({});

  const [jiraLoading, setJiraLoading] = useState<boolean>(false);
  const [githubLoading, setGithubLoading] = useState<boolean>(false);

  // Manual resolution logging pop-up states
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualNote, setManualNote] = useState<string>('');
  const [manualWorker, setManualWorker] = useState<string>('');
  const [pendingSystem, setPendingSystem] = useState<'jira' | 'github'>('jira');

  // Compute playbooks dynamically based on escalated tickets
  const dynamicPlaybooks = [
    { id: "pb-1", title: "DB Connection Pool Failover", team: "Database Admin", client: "Stark Ind", limitSec: 600, status: isSimulatorActive ? "Active Incident" : "Standby", ticketId: null },
    ...tickets.filter(t => t.olaEscalated).map(t => ({
      id: `ola-${t.id}`,
      title: `${t.client}: ${t.subject.replace(`${t.client}: `, '')}`,
      team: t.olaEscalatedTeam || 'L2 DevOps',
      client: t.client,
      limitSec: t.olaEscalatedTeam === 'Database Admin' ? 3600 : t.olaEscalatedTeam === 'Compliance' ? 7200 : t.olaEscalatedTeam === 'L2 DevOps' ? 14400 : 28800,
      status: t.status === 'Resolved' || t.status === 'L2_Resolved' ? 'Resolved' : 'Active Escalation',
      ticketId: t.id
    }))
  ];

  const currentPb = dynamicPlaybooks.find(p => p.id === activePbId) || dynamicPlaybooks[0];

  const currentTeamConfig = globalL2Teams.find(t => t.name === currentPb.team);
  const currentTeamSystem = currentTeamConfig?.ticketSystem || 'jira';

  const isJiraDone = currentTeamSystem !== 'jira' || !!jiraStatusMap[currentPb.id] || (currentPb.status === 'Resolved' || currentPb.status === 'Standby');
  const isGithubDone = currentTeamSystem !== 'github' || !!githubStatusMap[currentPb.id] || (currentPb.status === 'Resolved' || currentPb.status === 'Standby');

  const showJira = currentTeamSystem === 'jira';
  const showGithub = currentTeamSystem === 'github';

  // Dynamic OLA safe countdown time
  const [olaTimeLeft, setOlaTimeLeft] = useState<number>(600);

  // Sync OLA time left when active playbook switches or changes status
  useEffect(() => {
    if (currentPb) {
      if (currentPb.status === 'Resolved' || currentPb.status === 'Standby') {
        setOlaTimeLeft(0);
      } else {
        const factor = parseFloat(localStorage.getItem('safetyFactor') || '0.8');
        setOlaTimeLeft(Math.round(currentPb.limitSec * factor));
      }
    }
  }, [activePbId, currentPb?.status]);

  // Sync OLA Safety Factor from Event Bus
  useEffect(() => {
    globalEventBus.on('SAFETY_FACTOR_UPDATED', (newFactor: any) => {
      const factor = parseFloat(newFactor) || 0.8;
      if (currentPb && currentPb.status !== 'Resolved' && currentPb.status !== 'Standby') {
        setOlaTimeLeft(Math.round(currentPb.limitSec * factor));
      }
    });
  }, [currentPb]);

  // OLA Timer tick
  useEffect(() => {
    const isPbActiveIncident = currentPb.status === 'Active Incident' || currentPb.status === 'Active Escalation';
    if (!isPbActiveIncident) return;

    const interval = setInterval(() => {
      setOlaTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activePbId, currentPb?.status]);

  // Sync Stark Ind state if resolved
  useEffect(() => {
    if (!isSimulatorActive) {
      setJiraStatusMap(prev => ({ ...prev, 'pb-1': true }));
      setGithubStatusMap(prev => ({ ...prev, 'pb-1': true }));
    } else {
      setJiraStatusMap(prev => ({ ...prev, 'pb-1': false }));
      setGithubStatusMap(prev => ({ ...prev, 'pb-1': false }));
    }
  }, [isSimulatorActive]);

  const formatTimer = (seconds: number): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${pad(m)}:${pad(s)}`;
  };

  // Simulate Jira Completed Webhook
  const handleJiraWebhook = () => {
    setJiraLoading(true);
    setTimeout(() => {
      setJiraLoading(false);
      setJiraStatusMap(prev => ({ ...prev, [currentPb.id]: true }));
      setToastMsg(
        locale === 'ko' 
          ? "Jira Task 완료 웹훅 수신 완료!" 
          : locale === 'es' 
            ? "¡Jira Task Done Webhook Recibido!" 
            : "Jira Task Done Webhook Received."
      );
      setTimeout(() => setToastMsg(''), 2500);

      // Check if resolved based on team settings
      const willResolve = currentTeamSystem === 'jira' || isGithubDone;
      if (willResolve) {
        if (currentPb.ticketId) {
          onResolveTicket(currentPb.ticketId, undefined, true);
        } else {
          globalEventBus.emit('RUNBOOK_SOLVED');
        }
      }
    }, 1200);
  };

  // Simulate GitHub PR Merged Webhook
  const handleGithubWebhook = () => {
    setGithubLoading(true);
    setTimeout(() => {
      setGithubLoading(false);
      setGithubStatusMap(prev => ({ ...prev, [currentPb.id]: true }));
      setToastMsg(
        locale === 'ko' 
          ? "GitHub PR 머지 완료 웹훅 수신 완료!" 
          : locale === 'es' 
            ? "¡Webhook de GitHub PR Merged Recibido!" 
            : "GitHub PR Merged Webhook Received."
      );
      setTimeout(() => setToastMsg(''), 2500);

      // Check if resolved based on team settings
      const willResolve = currentTeamSystem === 'github' || isJiraDone;
      if (willResolve) {
        if (currentPb.ticketId) {
          onResolveTicket(currentPb.ticketId, undefined, true);
        } else {
          globalEventBus.emit('RUNBOOK_SOLVED');
        }
      }
    }, 1200);
  };

  // Simulate or Process Manual Resolution
  const handleManualResolve = (systemType: 'jira' | 'github') => {
    setPendingSystem(systemType);
    setShowManualModal(true);
  };

  const submitManualResolve = () => {
    const isJira = pendingSystem === 'jira';
    if (isJira) {
      setJiraStatusMap(prev => ({ ...prev, [currentPb.id]: true }));
    } else {
      setGithubStatusMap(prev => ({ ...prev, [currentPb.id]: true }));
    }

    setToastMsg(
      locale === 'ko' 
        ? "수동 조치 완료 및 피드백 전송됨!" 
        : locale === 'es' 
          ? "¡Resolución manual registrada!" 
          : "Manual resolution logged."
    );
    setTimeout(() => setToastMsg(''), 2500);

    const willResolve = pendingSystem === 'jira' 
      ? (currentTeamSystem === 'jira' || isGithubDone)
      : (currentTeamSystem === 'github' || isJiraDone);

    if (willResolve) {
      if (currentPb.ticketId) {
        const fullAuditNote = `[L2: ${manualWorker || 'Anonymous'}] ${manualNote || 'No details provided'}`;
        onResolveTicket(currentPb.ticketId, undefined, true, fullAuditNote);
      } else {
        globalEventBus.emit('RUNBOOK_SOLVED');
      }
    }

    setShowManualModal(false);
    setManualWorker('');
    setManualNote('');
  };

  return (
    <div className="flex-1 flex bg-slate-950">
      {/* 1. Left Playbook List Navigation */}
      <div className="w-[250px] bg-slate-900 border-r border-slate-800 p-4 space-y-4">
        <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
          IT Playbooks ({dynamicPlaybooks.length})
        </div>
        <div className="space-y-2">
          {dynamicPlaybooks.map((pb) => {
            const isActivePb = pb.id === activePbId;
            const isIncident = pb.status === 'Active Incident' || pb.status === 'Active Escalation';
            return (
              <div 
                key={pb.id} 
                onClick={() => setActivePbId(pb.id)}
                className={`p-3 border rounded flex flex-col justify-between cursor-pointer transition-colors ${
                  isActivePb 
                    ? 'bg-blue-950/20 border-blue-500/50 shadow-none' 
                    : isIncident 
                      ? 'bg-red-950/20 border-red-500/30 hover:bg-red-950/30'
                      : 'bg-slate-950 border-slate-850/60 hover:bg-slate-900'
                }`}
              >
                {(() => {
                  const originTeamConfig = globalL2Teams.find(t => t.name === pb.team);
                  const sys = originTeamConfig?.ticketSystem || 'jira';
                  const isSysEnabled = sys === 'jira' 
                    ? telemetryIntegrations.jiraEnabled 
                    : sys === 'github' 
                      ? telemetryIntegrations.githubEnabled 
                      : telemetryIntegrations.customEnabled;
                  const isManualEscalated = pb.ticketId && !isSysEnabled;

                  return isManualEscalated ? (
                    <div className="text-[7.5px] bg-amber-950 border border-amber-500/20 text-amber-400 font-black uppercase px-1.5 py-0.5 rounded tracking-wide mb-1 w-max">
                      {locale === 'ko' 
                        ? `수동 이관: ${pb.ticketId.toUpperCase()}` 
                        : locale === 'es'
                          ? `MANUAL: ${pb.ticketId.toUpperCase()}`
                          : `MANUAL: ${pb.ticketId.toUpperCase()}`}
                    </div>
                  ) : null;
                })()}
                <div className="text-xs font-bold text-slate-355 truncate">{pb.title}</div>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[8px] text-slate-500 font-bold">{pb.team}</span>
                  <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded ${
                    isIncident 
                      ? 'bg-red-950 text-red-400 animate-pulse' 
                      : pb.status === 'Resolved'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-slate-900 text-slate-500'
                  }`}>
                    {pb.status === 'Active Escalation' 
                      ? (locale === 'ko' ? '에스컬레이션 활성' : locale === 'es' ? 'Escalación' : 'Escalation')
                      : pb.status === 'Active Incident'
                        ? (locale === 'ko' ? '인시던트 활성' : locale === 'es' ? 'Activo' : 'Active')
                        : pb.status === 'Resolved'
                          ? (locale === 'ko' ? '해결 완료' : locale === 'es' ? 'Resuelto' : 'Resolved')
                          : (locale === 'ko' ? '대기 중' : locale === 'es' ? 'Espera' : 'Standby')
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Work Area */}
      <div className="flex-1 p-6 space-y-6 flex flex-col justify-between relative overflow-y-auto">
        {toastMsg && (
          <div className="absolute top-4 right-4 z-40 bg-emerald text-slate-950 px-4 py-2 rounded text-xs font-black tracking-tight shadow-none flex items-center space-x-2 animate-soft-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-100">{t.runbooks.title}</h2>
              <p className="text-[11px] text-slate-500">
                {locale === 'ko' 
                  ? 'IT 인프라 장애 발생 OLA 복구 대응 현황 및 외부 툴 연동 상태.' 
                  : locale === 'es'
                    ? 'Panel de control de ejecución de OLA con contadores de OLA e incidentes.'
                    : 'Incident management playbook execution dashboard with OLA counters.'}
              </p>
            </div>
            {(currentPb.status === 'Active Incident' || currentPb.status === 'Active Escalation') && (
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-red-950 border border-red-500/30 rounded text-coral text-[10px] font-black uppercase tracking-wider animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span>INCIDENT ACTIVE</span>
              </div>
            )}
          </div>

          {/* OLA Timer */}
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 flex items-center justify-between h-24">
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase">{t.runbooks.olaTimer}</div>
              <div className="text-[11px] text-slate-400 font-bold">
                {(currentPb.status === 'Active Incident' || currentPb.status === 'Active Escalation')
                  ? `${currentPb.team} ${locale === 'ko' ? "장애 기한 OLA 차감 중" : locale === 'es' ? "cuenta regresiva de OLA" : "OLA limit counting down"}` 
                  : (locale === 'ko' ? "장애 해결 완료 (안정화 국면)" : locale === 'es' ? "Incidente resuelto." : "Incident Solved.")
                }
              </div>
            </div>
            <div className={`text-2xl font-mono font-black ${
              (currentPb.status === 'Active Incident' || currentPb.status === 'Active Escalation') ? 'text-coral animate-pulse' : 'text-emerald'
            }`}>
              {(currentPb.status === 'Active Incident' || currentPb.status === 'Active Escalation') ? formatTimer(olaTimeLeft) : '00:00'}
            </div>
          </div>

          {/* Recovery Checklist */}
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="text-[10px] text-slate-500 font-bold uppercase">
              {currentPb.title} Recovery Checklist ({currentPb.team})
            </div>
            
            <div className="space-y-3">
              {/* Task 1: Auto Triage Detection (Always Done) */}
              <div className="flex items-start space-x-3 p-3 bg-slate-950 border border-slate-850 rounded">
                <div className="mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-200">1. {t.runbooks.task1Title}</h4>
                  <p className="text-[10px] text-slate-500">{t.runbooks.task1System}</p>
                </div>
              </div>

              {/* Task 2: Jira Webhook Dispatch */}
              {showJira && (
                <div className={`flex items-start space-x-3 p-3 border rounded transition-colors ${
                  isJiraDone ? 'bg-slate-950 border-slate-850' : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <div className="mt-0.5">
                    {isJiraDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald" />
                    ) : jiraLoading ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 border border-slate-600 rounded-full" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-200">2. {t.runbooks.task2Title}</h4>
                    <p className="text-[10px] text-slate-500">
                      {isJiraDone ? (
                        <span className="text-emerald font-bold">{locale === 'ko' ? '확인자: [이관 및 승인 접수 완료]' : 'Verified: [Jira Task Accepted]'}</span>
                      ) : (
                        t.runbooks.task2Wait
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Task 3: GitHub PR Merge */}
              {showGithub && (
                <div className={`flex items-start space-x-3 p-3 border rounded transition-colors ${
                  isGithubDone ? 'bg-slate-950 border-slate-850' : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <div className="mt-0.5">
                    {isGithubDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald" />
                    ) : githubLoading ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 border border-slate-600 rounded-full" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-200">2. {t.runbooks.task3Title}</h4>
                    <p className="text-[10px] text-slate-500">
                      {isGithubDone ? (
                        <span className="text-emerald font-bold">{locale === 'ko' ? '인프라: [배포 자동 롤아웃 머지 완료]' : 'Infrastructure: [Deploy auto roll-out merged]'}</span>
                      ) : (
                        t.runbooks.task3Wait
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Webhook sim triggers */}
        {(currentPb.status === 'Active Incident' || currentPb.status === 'Active Escalation') ? (
          <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-bold">
              {locale === 'ko' ? "외부 개발자 도구 및 조치 대응 패널:" : "Webhooks Dispatch & Action Panel:"}
            </div>
            <div className="flex space-x-2">
              {showJira && (
                telemetryIntegrations.jiraEnabled ? (
                  <button
                    onClick={handleJiraWebhook}
                    disabled={isJiraDone || jiraLoading}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 border border-transparent ${
                      isJiraDone
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span>Jira webhook dispatch</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleManualResolve('jira')}
                    disabled={isJiraDone}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                      isJiraDone
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent shadow-none' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500'
                    }`}
                  >
                    <span>{locale === 'ko' ? "Jira 수동 조치 완료" : "Confirm Manual Jira Resolution"}</span>
                  </button>
                )
              )}
              {showGithub && (
                telemetryIntegrations.githubEnabled ? (
                  <button
                    onClick={handleGithubWebhook}
                    disabled={isGithubDone || githubLoading}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 border border-transparent ${
                      isGithubDone
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span>GitHub PR merge dispatch</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleManualResolve('github')}
                    disabled={isGithubDone}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                      isGithubDone
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent shadow-none' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500'
                    }`}
                  >
                    <span>
                      {locale === 'ko' 
                        ? "GitHub 수동 조치 완료" 
                        : locale === 'es'
                          ? "Confirmar resolución de GitHub manual"
                          : "Confirm Manual GitHub Resolution"}
                    </span>
                  </button>
                )
              )}
              {currentTeamSystem === 'custom' && (
                telemetryIntegrations.customEnabled ? (
                  <div className="text-[10px] text-amber-500 font-bold bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded w-full text-center">
                    {locale === 'ko' 
                      ? "IT 모니터링: 커스텀 내부 티켓 시스템 연동 상태 (모니터링 대응 중)" 
                      : locale === 'es'
                        ? "Monitoreo de IT: Sistema de tickets interno integrado (Monitoreo en progreso)"
                        : "IT Monitoring: Custom internal ticket system integrated (Monitoring in progress)"}
                  </div>
                ) : (
                  <button
                    onClick={() => handleManualResolve('jira')}
                    disabled={isJiraDone}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                      isJiraDone
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent shadow-none' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500'
                    }`}
                  >
                    <span>
                      {locale === 'ko' 
                        ? "Custom 수동 조치 완료" 
                        : locale === 'es'
                          ? "Confirmar resolución de Custom manual"
                          : "Confirm Manual Custom Resolution"}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-black uppercase">
            {locale === 'ko' 
              ? `[${currentPb.title}] 복구 대응 완전 완료` 
              : locale === 'es'
                ? `[${currentPb.title}] Recuperación completa.`
                : `[${currentPb.title}] Recovery complete.`}
          </div>
        )}
      </div>

      {showManualModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-[1.5px] z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-none">
            <div className="flex items-center space-x-2.5 text-amber-400">
              <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-100">
                {locale === 'ko' 
                  ? '수동 조치 증적 및 피드백 기입' 
                  : locale === 'es'
                    ? 'Registrar acción manual y evidencia'
                    : 'Log Manual Action & Evidence'}
              </h3>
            </div>
            <p className="text-[10.5px] text-slate-500 leading-relaxed">
              {locale === 'ko' 
                ? '외부 API가 미연동된 수동 조치 티켓입니다. 사건의 사후 감사를 위해 담당자와 조치 사항을 기록해야 합니다.'
                : locale === 'es'
                  ? 'La escalación manual requiere documentar los detalles del seguimiento de la acción resuelta para las auditorías de cumplimiento de B2B.'
                  : 'Manual escalation requires documenting the resolved action trace details for B2B compliance audits.'}
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  {locale === 'ko' 
                    ? 'L2 담당자 성명' 
                    : locale === 'es'
                      ? 'Nombre del operador de L2'
                      : 'L2 Operator Name'}
                </label>
                <input
                  type="text"
                  value={manualWorker}
                  onChange={(e) => setManualWorker(e.target.value)}
                  placeholder={locale === 'ko' ? '예: 홍길동' : locale === 'es' ? 'ej. Juan Pérez' : 'e.g. John Doe'}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  {locale === 'ko' 
                    ? '조치 내역 요약' 
                    : locale === 'es'
                      ? 'Resumen de mitigación de acción'
                      : 'Action Mitigation Summary'}
                </label>
                <textarea
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder={locale === 'ko' ? '조치한 상세 사항을 기술하십시오.' : locale === 'es' ? 'ej. Se eliminó la fuga de rotación de registros...' : 'e.g. Cleared log rotation leak...'}
                  className="w-full h-16 bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => { setShowManualModal(false); setManualNote(''); setManualWorker(''); }}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400 dark:hover:text-slate-200 rounded text-xs font-bold transition-all"
              >
                {locale === 'ko' ? '취소' : locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={submitManualResolve}
                disabled={!manualWorker.trim() || !manualNote.trim()}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition-all border ${
                  manualWorker.trim() && manualNote.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white dark:border-transparent' 
                    : 'bg-slate-200 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-600 dark:border-transparent cursor-not-allowed'
                }`}
              >
                {locale === 'ko' ? '기입 완료' : locale === 'es' ? 'Enviar registro' : 'Submit Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
