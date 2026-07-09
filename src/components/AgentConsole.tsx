/*
 * @graphify REQ_PII_MASKING_MIDDLEWARE
 * @graphify REQ_DEMO_PIN_LOCKDOWN
 * @graphify REQ_PRODUCTION_OUTBOUND_TOKEN_REPLACEMENT
 * @graphify REQ_PII_AUDIT_LOGGING
 * @graphify REQ_AI_MULTILINGUAL_CO_PILOT
 * @graphify REQ_OLA_ESCALATION_TEMPLATE
 * @graphify REQ_CUSTOMER_PORTAL_UI
 * @graphify REQ_REALTIME_SMS_NOTIFICATION
 * @graphify REQ_CHANNEL_CONTEXT_SYNC
 * @graphify REQ_AGENT_WYSIWYG_COPILOT
 * @graphify REQ_TWILIO_LIVE_SMS_DRAWER
 * @graphify REQ_TWILIO_SMS_DELIVERY_CALLBACK
 */

import React, { useState, useEffect } from 'react';
import { translations, Locale } from '../locales/i18n';
import { 
  Check, AlertTriangle, FileText, Send, Mail, 
  MessageSquare, Settings, Lock, Eye, AlertOctagon, Sparkles,
  Copy
} from 'lucide-react';
import { Ticket, globalEventBus, L2TeamConfig, TelemetryIntegrations } from '../App';

interface ConsoleProps {
  locale: Locale;
  isAdminAuthenticated: boolean;
  setCurrentTab: (tab: string) => void;
  tickets: Ticket[];
  onResolveTicket: (ticketId: string, replyText?: string, isL2EscalatedComplete?: boolean, manualNote?: string) => void;
  onEscalateTicket: (ticketId: string, team: string, firstReplyContent?: string) => void;
  globalL2Teams: L2TeamConfig[];
  tempRecoveryMinutes: number;
  telemetryIntegrations: TelemetryIntegrations;
}

export const AgentConsole: React.FC<ConsoleProps> = ({
  locale,
  isAdminAuthenticated,
  setCurrentTab,
  tickets,
  onResolveTicket,
  onEscalateTicket,
  globalL2Teams,
  tempRecoveryMinutes,
  telemetryIntegrations
}) => {
  const t = translations[locale];

  // Server-side simulated original database lookup mapping
  const secureServerPiiDb: { [key: string]: string } = {
    "ticket-1": "luka@stark.com",
    "ticket-2": "marcus@oscorp.com",
    "ticket-3": "john@acme.com",
    "ticket-4": "bruce@wayne.com",
    "ticket-5": "norman@oscorp.com"
  };

  const [activeTicket, setActiveTicket] = useState<Ticket>(() => {
    return tickets.find(t => t.status === 'Open') || tickets[0];
  });
  
  const [revealPii, setRevealPii] = useState<boolean>(false);
  const [unmaskedEmail, setUnmaskedEmail] = useState<string>(''); // Dynamic container for unmasked data, kept blank initially
  
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditReason, setAuditReason] = useState<string>('');
  
  // SMS Twilio state simulation
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'delivered' | 'failed'>('idle');
  // Content-based language auto-detector helper
  const detectLanguage = (text: string): 'en' | 'ko' | 'es' => {
    if (!text) return 'en';
    const koreanRegex = /[\uac00-\ud7a3\u3131-\u318e]/;
    if (koreanRegex.test(text)) {
      return 'ko';
    }
    const spanishKeywords = /\b(hola|gracias|por\s+favor|este|para|con|usted|cómo|está|producto|servidor)\b/i;
    const spanishAccents = /[áéíóúñü¿¡]/i;
    if (spanishKeywords.test(text) || spanishAccents.test(text)) {
      return 'es';
    }
    return 'en';
  };

  const [isEscalateForced, setIsEscalateForced] = useState<boolean>(false);
  const [assignedTeam, setAssignedTeam] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [markdownText, setMarkdownText] = useState<string>('');

  const detectedLang = detectLanguage(activeTicket.content);
  const [editorText, setEditorText] = useState(activeTicket.aiSuggestedDraft[detectedLang]);

  // Reset force escalation flag when active ticket changes
  useEffect(() => {
    setIsEscalateForced(false);
  }, [activeTicket.id]);

  // Sync active ticket with updated tickets array from props
  useEffect(() => {
    const synced = tickets.find(t => t.id === activeTicket.id);
    if (synced) {
      setActiveTicket(synced);
    }
  }, [tickets, activeTicket.id]);

  // Sync editor text with ticket dynamic draft using client email auto-detected language
  useEffect(() => {
    const lang = detectLanguage(activeTicket.content);
    
    // 1. L2 resolved state (TRT response generation)
    if (activeTicket.status === 'L2_Resolved') {
      const noteStr = activeTicket.manualEscalationNote ? `\n\n[L2 Engineering Log]\n- ${activeTicket.manualEscalationNote}` : '';
      if (lang === 'ko') {
        setEditorText(`안녕하세요 ${activeTicket.name}님, L2 ${activeTicket.olaEscalatedTeam || 'DevOps'} 부서의 기술 조치가 완료되어 장애 사항이 복구되었습니다.${noteStr}\n\n추가적인 불편사항이나 문의가 있으신 경우 언제든지 회신해주시기 바랍니다. 감사합니다.`);
      } else if (lang === 'es') {
        setEditorText(`Estimado/a ${activeTicket.name}, se ha completado la recuperación técnica en el departamento L2 ${activeTicket.olaEscalatedTeam || 'DevOps'}.${noteStr}\n\nPor favor, avísenos si tiene alguna duda adicional. Gracias.`);
      } else {
        setEditorText(`Hello ${activeTicket.name}, the technical recovery has been completed by L2 ${activeTicket.olaEscalatedTeam || 'DevOps'} department.${noteStr}\n\nPlease let us know if you have any further questions.`);
      }
    } 
    // 2. Open state with L2 suggestion or Force Escalate active (FRT response generation)
    else if (activeTicket.status === 'Open' && (activeTicket.aiSuggestedL2Team || isEscalateForced)) {
      const targetTeam = assignedTeam || activeTicket.aiSuggestedL2Team || 'DevOps';
      if (lang === 'ko') {
        setEditorText(`안녕하세요 ${activeTicket.name}님, 접수해주신 문의 사항은 신속한 기술 분석 및 장애 복구를 위해 L2 ${targetTeam} 팀으로 이관 처리되었습니다. 조치가 마치는 대로 최종 복구 피드백과 함께 추가 답변을 드리겠습니다. 감사합니다.`);
      } else if (lang === 'es') {
        setEditorText(`Estimado/a ${activeTicket.name}, su solicitud ha sido escalada al departamento L2 ${targetTeam} para un análisis técnico profundo. Le informaremos una vez resuelto. Gracias.`);
      } else {
        setEditorText(`Hello ${activeTicket.name}, your inquiry has been successfully escalated to the L2 ${targetTeam} department for advanced technical recovery. We will follow up immediately upon resolution.`);
      }
    } 
    // 3. Normal L1 direct resolve state
    else {
      setEditorText(activeTicket.aiSuggestedDraft[lang]);
    }
  }, [activeTicket.id, activeTicket.status, activeTicket.olaResolved, isEscalateForced, assignedTeam]);

  // Handle PII Reveal verification with strict server emulation
  const handlePiiReveal = (e: React.FormEvent) => {
    e.preventDefault();
    if (auditReason.trim().length >= 5) {
      // Simulate POST /api/audit/pii-view request. Original PII is fetched ONLY here.
      setTimeout(() => {
        const fetchedOriginalEmail = secureServerPiiDb[activeTicket.id] || (activeTicket.id.includes('injected') ? "tony@stark.com" : "support@pii-isolated.com");
        setUnmaskedEmail(fetchedOriginalEmail);
        setRevealPii(true);
        setShowAuditModal(false);
      }, 300);
    }
  };

  // OLA Escalation states

  // Compute L2 teams dynamically from global configs
  const activeClientL2Teams = globalL2Teams.length > 0 ? globalL2Teams : [
    { name: "L2 DevOps", ticketSystem: "jira" as const },
    { name: "Database Admin", ticketSystem: "custom" as const },
    { name: "Compliance", ticketSystem: "github" as const },
    { name: "Infrastructure L2", ticketSystem: "jira" as const }
  ];

  const formatOlaLimit = (minutes: number): string => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h} Hours ${m} Mins` : `${h} Hour${h > 1 ? 's' : ''}`;
    }
    return `${minutes} Mins`;
  };

  const targetLimitText = formatOlaLimit(tempRecoveryMinutes);
  const targetSeverity = tempRecoveryMinutes <= 120 ? 'URGENT' : 'NORMAL';

  const getEscalationMarkdown = () => {
    const email = revealPii ? unmaskedEmail : activeTicket.emailMasked;
    const selectedTeamConfig = activeClientL2Teams.find(t => t.name === assignedTeam);
    const rawTemplate = selectedTeamConfig?.template || `### 🚨 [OLA ESCALATION] {TICKET_ID}
- **B2B Account**: {ACCOUNT_NAME}
- **Assigned L2 Team**: {ASSIGNED_TEAM}
- **OLA Target Limit**: {SLA_TIMER}
- **Requester**: {CUSTOMER_NAME} ({CUSTOMER_EMAIL})
- **Ticket Subject**: {SUBJECT}
- **Incident Description**:
{INCIDENT_DESCRIPTION}`;

    return rawTemplate
      .replace(/{TICKET_ID}/g, activeTicket.id)
      .replace(/{ACCOUNT_NAME}/g, activeTicket.client)
      .replace(/{ASSIGNED_TEAM}/g, assignedTeam)
      .replace(/{SLA_TIMER}/g, targetLimitText)
      .replace(/{CUSTOMER_NAME}/g, activeTicket.name)
      .replace(/{CUSTOMER_EMAIL}/g, email)
      .replace(/{SUBJECT}/g, activeTicket.subject)
      .replace(/{SENTIMENT}/g, activeTicket.sentiment || 'neutral')
      .replace(/{INCIDENT_DESCRIPTION}/g, activeTicket.content);
  };

  // Sync editable markdown template when ticket/team/PII state changes
  useEffect(() => {
    if (assignedTeam) {
      setMarkdownText(getEscalationMarkdown());
    }
  }, [activeTicket, assignedTeam, revealPii, unmaskedEmail]);

  // Sync assigned L2 team if already escalated, or suggest AI pre-selected L2 team
  useEffect(() => {
    const l2Teams = globalL2Teams.length > 0 ? globalL2Teams : [];
    if (activeTicket.olaEscalated && activeTicket.olaEscalatedTeam) {
      setAssignedTeam(activeTicket.olaEscalatedTeam);
    } else if (activeTicket.aiSuggestedL2Team && l2Teams.some(t => t.name === activeTicket.aiSuggestedL2Team)) {
      setAssignedTeam(activeTicket.aiSuggestedL2Team);
    } else if (l2Teams.length > 0) {
      setAssignedTeam(l2Teams[0].name);
    } else {
      setAssignedTeam('L2 DevOps');
    }
  }, [activeTicket, globalL2Teams]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  // Simulate Twilio SMS Outbound webhooks status callbacks
  const handleSmsSend = () => {
    setSmsStatus('sending');
    
    // Webhook 1.5s delay simulation to simulate status callback delivered state
    setTimeout(() => {
      setSmsStatus('delivered');
      
      // Case A: L2 Escalation and FRT mode
      if (activeTicket.status === 'Open' && (activeTicket.aiSuggestedL2Team || isEscalateForced)) {
        const targetTeam = assignedTeam || activeTicket.aiSuggestedL2Team || 'DevOps';
        onEscalateTicket(activeTicket.id, targetTeam, editorText);
        globalEventBus.emit('L2_ESCALATION_DISPATCHED', {
          ticketId: activeTicket.id,
          team: targetTeam
        });
      } 
      // Case B: Final Close & Reply mode (TRT)
      else if (activeTicket.status === 'L2_Resolved') {
        onResolveTicket(activeTicket.id, editorText, activeTicket.olaResolved, activeTicket.manualEscalationNote);
      } 
      // Case C: Standard L1 Direct Resolve mode
      else {
        onResolveTicket(activeTicket.id, editorText);
      }
    }, 1500);
  };

  // Sort tickets: 1) Unresolved (Open) first, 2) Urgent priority first, 3) ID descending (newest first)
  const sortedTickets = [...tickets].sort((a, b) => {
    const aResolved = a.status === 'Resolved' ? 1 : 0;
    const bResolved = b.status === 'Resolved' ? 1 : 0;
    if (aResolved !== bResolved) {
      return aResolved - bResolved;
    }

    const priorityWeight = { 'Urgent': 1, 'Normal': 2, 'Low': 3 };
    const aWeight = priorityWeight[a.priority as keyof typeof priorityWeight] || 99;
    const bWeight = priorityWeight[b.priority as keyof typeof priorityWeight] || 99;
    if (aWeight !== bWeight) {
      return aWeight - bWeight;
    }

    return b.id.localeCompare(a.id);
  });

  return (
    <div className="flex-1 flex bg-slate-950 h-[calc(100vh-64px)] overflow-hidden">
      {}
      <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 justify-between">
        <div className="space-y-4 flex flex-col items-center">
          <div className="p-2 bg-blue-600 rounded text-white cursor-pointer" title="Dashboard" onClick={() => setCurrentTab('sla')}>
            <Mail className="w-4 h-4" />
          </div>
          <div className="p-2 hover:bg-slate-800 rounded text-slate-400 cursor-pointer" title="Console">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="p-2 hover:bg-slate-800 rounded text-slate-400 cursor-pointer" title="Runbooks" onClick={() => setCurrentTab('runbooks')}>
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="p-2 hover:bg-slate-800 rounded text-slate-400 cursor-pointer" title="Settings" onClick={() => setCurrentTab('settings')}>
          <Settings className="w-4 h-4" />
        </div>
      </div>

      {}
      <div className="w-[300px] bg-slate-900/60 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-850">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Inbound Tickets ({tickets.filter(t => t.status === 'Open').length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {sortedTickets.map((ticket) => {
            const isActive = activeTicket.id === ticket.id;
            const isResolved = ticket.status === 'Resolved';
            const isL2Resolved = ticket.status === 'L2_Resolved';
            const isEscalatedStatus = ticket.status === 'Escalated';
            return (
              <div
                key={ticket.id}
                onClick={() => {
                  setActiveTicket(ticket);
                  setRevealPii(false);
                  setUnmaskedEmail('');
                  setSmsStatus('idle');
                  setAuditReason('');
                }}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-slate-800/80 border-blue-500/50' 
                    : isResolved
                      ? 'bg-slate-900/10 border-slate-900/50 opacity-60'
                      : isL2Resolved
                        ? 'bg-indigo-950/10 border-indigo-900/20'
                        : isEscalatedStatus
                          ? 'bg-blue-950/10 border-blue-900/20'
                          : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] text-slate-500 font-mono uppercase">{ticket.id}</span>
                    <span className="text-[8px] bg-slate-950 text-slate-400 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                      {ticket.client}
                    </span>
                  </div>
                  <span className={`text-[9px] px-1 py-0.5 rounded font-black uppercase border ${
                    isResolved 
                      ? 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-950 dark:text-slate-600 dark:border-transparent'
                      : isL2Resolved
                        ? 'bg-indigo-100 text-indigo-950 border-indigo-400 dark:bg-indigo-950/70 dark:border-indigo-500/20 dark:text-indigo-300 animate-pulse'
                        : isEscalatedStatus
                          ? 'bg-blue-100 text-blue-950 border-blue-400 dark:bg-blue-950 dark:border-blue-500/30 dark:text-blue-300'
                          : ticket.priority === 'Urgent'
                            ? 'bg-red-100 text-red-950 border-red-400 dark:bg-red-950 dark:text-red-300 dark:border-transparent'
                            : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-transparent'
                  }`}>
                    {isResolved ? 'Resolved' : isL2Resolved ? 'L2 Resolved' : isEscalatedStatus ? 'Escalated' : ticket.priority}
                  </span>
                </div>
                <div className={`text-xs font-bold mt-1.5 truncate ${
                  isResolved ? 'line-through text-slate-650' : 'text-slate-200'
                }`}>
                  {ticket.subject}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-[10px] text-slate-500 truncate">{ticket.name}</div>
                  {ticket.olaResolved ? (
                    <span className="text-[7.5px] bg-emerald-50 border border-emerald-400 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500/20 dark:text-emerald-300 font-black uppercase px-1 py-0.5 rounded tracking-wide">
                      L2 COMPLETED
                    </span>
                  ) : ticket.olaEscalated ? (
                    <span className="text-[7.5px] bg-indigo-50 border border-indigo-400 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-500/20 dark:text-indigo-300 font-black uppercase px-1 py-0.5 rounded tracking-wide animate-pulse">
                      L2 PROGRESS
                    </span>
                  ) : ticket.aiSuggestedL2Team ? (
                    <span className="text-[7.5px] bg-amber-50 border border-amber-400 text-amber-950 dark:bg-amber-950/40 dark:border-amber-500/20 dark:text-amber-300 font-black uppercase px-1 py-0.5 rounded tracking-wide">
                      L2: {ticket.aiSuggestedL2Team}
                    </span>
                  ) : (
                    <span className="text-[7.5px] bg-slate-100 border border-slate-350 text-slate-800 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300 font-black uppercase px-1 py-0.5 rounded tracking-wide">
                      L1 Resolve
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Ticket Work Area (Single column scrollable layout) */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto">
        {/* Active Ticket Header */}
        <div className="p-5 border-b border-slate-900 bg-slate-900/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-sm font-black text-slate-100">{activeTicket.subject}</h2>
              {activeTicket.aiSuggestedL2Team ? (
                <span className="text-[8.5px] bg-amber-50 border border-amber-400 text-amber-950 dark:bg-amber-950/60 dark:border-amber-500/30 dark:text-amber-400 px-2 py-0.5 rounded font-black uppercase tracking-wider animate-pulse flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-500"></span>
                  <span>L2 SUGGESTED ({activeTicket.aiSuggestedL2Team})</span>
                </span>
              ) : (
                <span className="text-[8.5px] bg-emerald-50 border border-emerald-400 text-emerald-950 dark:bg-emerald-950/60 dark:border-emerald-500/30 dark:text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                  <span>L1 DIRECT RESOLVE</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400">
              <span className="font-bold">{activeTicket.name}</span>
              <span>•</span>
              <span className="font-mono">{revealPii ? unmaskedEmail : activeTicket.emailMasked}</span>
            </div>
          </div>

          {/* PII Reveal Authorization State */}
          <div className="flex items-center space-x-2">
            {!isAdminAuthenticated ? (
              <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-800 px-2 py-1 rounded flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Admin Lock</span>
              </span>
            ) : !revealPii ? (
              <button
                onClick={() => setShowAuditModal(true)}
                className="px-2.5 py-1 border border-blue-500/20 bg-blue-950/20 hover:bg-blue-950/40 text-blue-400 rounded text-[11px] font-black uppercase flex items-center space-x-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.console.revealPii}</span>
              </button>
            ) : (
              <span className="text-[10px] bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded font-bold uppercase">
                PII UNMASKED
              </span>
            )}
          </div>
        </div>

        {/* HIPAA Audit Warn overlay */}
        {revealPii && (
          <div className="bg-red-950/20 border-b border-red-500/30 px-5 py-2 text-[10px] text-coral font-bold flex items-center space-x-2 animate-pulse">
            <AlertOctagon className="w-4 h-4 text-red-500" />
            <span>{t.console.maskAlert}</span>
          </div>
        )}

        {/* Message Thread Area & Editor & Bottom OLA Panel */}
        <div className="p-5 space-y-4">
          {/* 1. Ticket Content */}
          <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent flex items-center justify-center text-xs text-slate-700 dark:text-slate-400 font-bold">
                  {activeTicket.name[0]}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{activeTicket.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026-07-02 09:11</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{activeTicket.content}</p>
          </div>

          {/* Agent Sent Reply Message Card (Timeline Thread) */}
          {activeTicket.replyContent && (
            <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-blue-500/10 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-black">
                    A
                  </div>
                  <span className="text-xs font-bold text-blue-400">Agent Response (Replied)</span>
                </div>
                <span className="text-[10px] text-blue-500 font-mono">2026-07-02 22:31</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{activeTicket.replyContent}</p>
            </div>
          )}

          {/* First Response Sent Notification Card (SLA FRT Satisfied) */}
          {activeTicket.firstResponseSent && activeTicket.firstResponseContent && (
            <div className="p-4 bg-slate-900 border border-blue-500/25 rounded-xl space-y-2 animate-fade-in my-1">
              <div className="flex items-center justify-between border-b border-blue-500/15 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-900 flex items-center justify-center text-[10px] text-white font-black">
                    A
                  </div>
                  <span className="text-xs font-bold text-blue-400">
                    {locale === 'ko' ? '1차 이관 응답 (SLA FRT Satisfied)' : 'First Response (SLA FRT Satisfied)'}
                  </span>
                </div>
                <span className="text-[10px] text-blue-500 font-mono">{activeTicket.firstResponseAt || '2026-07-08 23:44'}</span>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">{activeTicket.firstResponseContent}</p>
            </div>
          )}

          {/* 2. Outbound Co-pilot Reply Editor */}
          {activeTicket.olaResolved && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-400 dark:border-amber-500/30 rounded-xl space-y-1.5 animate-fade-in my-2">
              <div className="flex items-center space-x-2 text-amber-950 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 text-amber-800 dark:text-amber-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-tight">
                  {locale === 'ko' ? 'L2 부서 조치 완료 (OLA Resolved)' : 'L2 Engineering Handover Resolved'}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                {activeTicket.manualEscalationNote ? (
                  <span>
                    {locale === 'ko' ? '수동 조치 증적 피드백: ' : 'Manual Feedback Trace: '}
                    <strong className="text-amber-950 dark:text-amber-300 font-black bg-amber-100 dark:bg-transparent px-1 rounded">{activeTicket.manualEscalationNote}</strong>
                  </span>
                ) : (
                  <span>
                    {locale === 'ko' 
                      ? `L2 ${activeTicket.olaEscalatedTeam || '엔지니어링'} 팀에서 기술 장애 복구를 완료했습니다. 고객에게 최종 해결 피드백을 전달하십시오.` 
                      : `L2 ${activeTicket.olaEscalatedTeam || 'Engineering'} team has successfully completed OLA recovery. Send final reply.`}
                  </span>
                )}
              </p>
            </div>
          )}

          <div className={`p-4 bg-slate-900 border rounded-xl space-y-3 transition-colors ${
            revealPii ? 'border-red-650' : 'border-slate-850'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-450" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">{t.console.outboundTitle}</span>
              </div>
              <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-1 rounded">
                Auto-detected: {detectedLang === 'en' ? 'English' : detectedLang === 'ko' ? 'Korean' : 'Spanish'}
              </span>
            </div>

            <textarea
              value={activeTicket.status === 'Resolved' ? (activeTicket.replyContent || '') : editorText}
              onChange={(e) => setEditorText(e.target.value)}
              disabled={activeTicket.status === 'Resolved'}
              className={`w-full h-24 bg-slate-950 border border-slate-850 rounded p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed ${
                activeTicket.status === 'Resolved' ? 'opacity-65 cursor-not-allowed' : ''
              }`}
            />

            {/* Twilio SMS dispatch state indicator footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                {/* Live Webhook Manual warning status badge */}
                {(() => {
                  const isL2EscalationMode = activeTicket.status === 'Open' && (activeTicket.aiSuggestedL2Team || isEscalateForced);
                  if (isL2EscalationMode) {
                    const targetTeam = assignedTeam || activeTicket.aiSuggestedL2Team || 'DevOps';
                    const selectedTeamConfig = activeClientL2Teams.find(t => t.name === targetTeam);
                    const system = selectedTeamConfig?.ticketSystem || 'jira';
                    const isSystemEnabled = system === 'jira' 
                      ? telemetryIntegrations.jiraEnabled 
                      : system === 'github' 
                        ? telemetryIntegrations.githubEnabled 
                        : telemetryIntegrations.customEnabled;

                    if (!isSystemEnabled) {
                      return (
                        <span className="text-[10px] text-amber-950 dark:text-amber-300 font-black bg-amber-50 dark:bg-amber-950/60 border border-amber-400 dark:border-amber-500/25 px-2 py-0.5 rounded flex items-center space-x-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-amber-900 dark:text-amber-400" />
                          <span>{locale === 'ko' ? '수동 이슈 등록 필요' : 'Manual Sync Required'}</span>
                        </span>
                      );
                    }
                  }
                  return null;
                })()}

                {smsStatus === 'sending' && (
                  <span className="text-[10px] text-slate-400 italic animate-pulse flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-ping"></span>
                    <span>{t.console.sending}</span>
                  </span>
                )}
                {smsStatus === 'delivered' && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5 text-emerald" />
                    <span>{t.console.delivered}</span>
                  </span>
                )}
                {smsStatus === 'failed' && (
                  <span className="text-[10px] text-coral font-bold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t.console.failed}</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleSmsSend}
                disabled={activeTicket.status === 'Resolved' || smsStatus === 'sending'}
                className={`px-4 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                  activeTicket.status === 'Resolved'
                    ? 'bg-slate-800 text-slate-500 border-slate-800/80 cursor-not-allowed shadow-none'
                    : (activeTicket.status === 'Open' && (activeTicket.aiSuggestedL2Team || isEscalateForced))
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                      : activeTicket.status === 'L2_Resolved'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white border-transparent'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                }`}
              >
                <span>
                  {activeTicket.status === 'Resolved' 
                    ? (locale === 'ko' ? '전송 완료됨' : 'Replied') 
                    : (activeTicket.status === 'Open' && (activeTicket.aiSuggestedL2Team || isEscalateForced))
                      ? (locale === 'ko' ? 'L2 이관 및 최초 답변 전송 (FRT)' : 'Send Escalation & FRT')
                      : activeTicket.status === 'L2_Resolved'
                        ? (locale === 'ko' ? '최종 복구 답변 전송 및 종결' : 'Final Close & Reply')
                        : (locale === 'ko' ? '최종 답변 전송 및 종결' : 'Send Reply & Close')
                  }
                </span>
                {activeTicket.status !== 'Resolved' && <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 3. OLA Escalation Gate Panel (Placed at bottom, wide format) */}
          <div className="w-full bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="space-y-0.5">
                <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">OLA Escalation Gate</div>
                <h3 className="text-xs font-black text-slate-100 uppercase tracking-tight">L2 Engineering Handover</h3>
              </div>
              <div className="text-[9px] bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-500 border border-slate-300 dark:border-transparent px-2 py-1 rounded font-bold uppercase">
                {activeTicket.olaEscalated ? (
                  <span className="text-amber-950 dark:text-amber-400 font-black animate-pulse">
                    Escalated to {activeTicket.olaEscalatedTeam}
                  </span>
                ) : (
                  <span>Escalation Shield Active</span>
                )}
              </div>
            </div>

            {!activeTicket.aiSuggestedL2Team && !isEscalateForced ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between animate-fade-in my-1">
                <div className="text-[11px] text-emerald-400 flex items-center space-x-2 font-bold">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>
                    {locale === 'ko' 
                      ? "AI 권장 사항: 이 티켓은 L1 선에서 즉시 종결 처리가 가능하여 L2 이관이 필요하지 않습니다." 
                      : "AI Guideline: L1 direct resolution recommended. L2 escalation is not required."}
                  </span>
                </div>
                <button
                  onClick={() => setIsEscalateForced(true)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-880 hover:border-slate-700 hover:bg-slate-900 text-slate-300 hover:text-slate-100 rounded text-[10px] font-black uppercase transition-all"
                >
                  {locale === 'ko' ? "수동 이관 활성화" : "Force Escalate"}
                </button>
              </div>
            ) : (
              (() => {
                const isMarginViolation = tempRecoveryMinutes * 2 > 360;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-5 pt-1 animate-fade-in">
                    {/* Left Column (Colspan-2): Assigned L2 Team & OLA Safety Guardrails in Vertical Stack */}
                    <div className="md:col-span-2 space-y-4">
                      {/* L2 Team Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Assigned L2 Team</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {activeClientL2Teams.map((tConfig) => {
                            const team = tConfig.name;
                            const isSelected = assignedTeam === team;
                            const isEscalated = activeTicket.olaEscalated === true;
                            const isAiSuggested = activeTicket.aiSuggestedL2Team === team && !isEscalated;
                            return (
                              <button
                                key={team}
                                onClick={() => {
                                  if (!isEscalated) {
                                    setAssignedTeam(team);
                                  }
                                }}
                                disabled={isEscalated}
                                className={`py-1.5 px-2 rounded text-[10px] font-black uppercase transition-all border flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-700 text-white font-black dark:bg-blue-950 dark:border-blue-500/50 dark:text-blue-400'
                                    : isEscalated
                                      ? 'bg-slate-200 border-slate-300 text-slate-400 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-700 cursor-not-allowed'
                                      : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800 hover:text-slate-950 dark:bg-slate-950 dark:border-slate-850 dark:hover:border-slate-750 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                              >
                                <span className="truncate">{team}</span>
                                {isAiSuggested && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 ml-1" title="AI Suggested L2 Team" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Limit settings info */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950 border border-slate-850 p-2 rounded-lg">
                        <div className="space-y-0.5">
                          <span className="block text-[8px] text-slate-500 font-bold uppercase">L2 OLA Time Limit</span>
                          <span className="text-[10px] text-blue-400 font-black">{targetLimitText}</span>
                        </div>
                        <div className="space-y-0.5 border-l border-slate-850 pl-2">
                          <span className="block text-[8px] text-slate-500 font-bold uppercase">SLA Risk Severity</span>
                          <span className={`text-[10px] font-black uppercase ${targetSeverity === 'URGENT' ? 'text-red-500' : 'text-slate-400'}`}>
                            {targetSeverity}
                          </span>
                        </div>
                      </div>

                      {/* OLA Safety Guardrails */}
                      <div className="space-y-2">
                        <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 space-y-2">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                              <span>L1➔L2 Escalation Target</span>
                              <span>{formatOlaLimit(tempRecoveryMinutes)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold border-b border-slate-850 pb-1.5">
                              <span>L2 Target MTTR Resolution</span>
                              <span>{formatOlaLimit(tempRecoveryMinutes)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-355 font-black pt-0.5">
                              <span>Total Expected Recovery</span>
                              <span className={isMarginViolation ? 'text-red-500' : 'text-emerald'}>
                                {formatOlaLimit(tempRecoveryMinutes * 2)}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-850">
                            {isMarginViolation ? (
                              <div className="bg-red-950/20 border border-red-500/20 p-2 rounded text-[9.5px] text-red-400 font-bold leading-normal flex items-start space-x-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                <span>
                                  {locale === 'ko' 
                                    ? '위험: 가합산 복구 시간(2X OLA)이 B2B P1 SLA 한도를 초과합니다! 안전 정책을 위반했습니다.'
                                    : 'CRITICAL: Total OLA margin violates B2B P1 SLA target limits! Resolution required.'}
                                </span>
                              </div>
                            ) : (
                              <div className="bg-emerald-950/20 border border-emerald-500/20 p-2 rounded text-[9.5px] text-emerald-400 font-bold leading-normal flex items-start space-x-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-550 flex-shrink-0 mt-0.5" />
                                <span>
                                  {locale === 'ko' 
                                    ? '안전: 가합산 수치가 SLA 허용 오차 한도 이내입니다. 이관이 승인되었습니다.'
                                    : 'SAFE: Total expected OLA margin satisfies SLA threshold metrics. Escalation approved.'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (Colspan-3): Wide Handover Spec View */}
                    <div className="md:col-span-3 space-y-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-1">
                        <label className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider">
                          {locale === 'ko' ? "L2 이관용 마크다운 기술 스펙 (참고용)" : "L2 Handover Technical Spec (Ref)"}
                        </label>
                        <button
                          onClick={handleCopyMarkdown}
                          className="text-[9px] text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 transition-colors"
                          title="Copy editable markdown template to clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copied ? (locale === 'ko' ? '복사 완료!' : 'Copied!') : (locale === 'ko' ? '복사하기' : 'Copy')}</span>
                        </button>
                      </div>

                      <textarea
                        value={markdownText}
                        onChange={(e) => setMarkdownText(e.target.value)}
                        disabled={activeTicket.olaEscalated}
                        className={`w-full h-36 bg-slate-950 border border-slate-850 rounded p-2.5 text-[10px] font-mono text-slate-355 focus:outline-none focus:border-blue-500 resize-none leading-relaxed flex-1 ${
                          activeTicket.olaEscalated ? 'opacity-65 cursor-not-allowed' : ''
                        }`}
                      />

                      {(() => {
                        const selectedTeamConfig = activeClientL2Teams.find(t => t.name === assignedTeam);
                        const system = selectedTeamConfig?.ticketSystem || 'jira';
                        const isSystemEnabled = system === 'jira' 
                          ? telemetryIntegrations.jiraEnabled 
                          : system === 'github' 
                            ? telemetryIntegrations.githubEnabled 
                            : telemetryIntegrations.customEnabled;

                        return (
                          <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg space-y-1.5 leading-normal">
                            <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 mb-1.5">
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                                {locale === 'ko' ? "L2 연동 연결 상태" : "L2 Integration Status"}
                              </span>
                              {isSystemEnabled ? (
                                <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-400 font-black uppercase px-1.5 py-0.5 rounded flex items-center space-x-1 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                                  <span>{locale === 'ko' ? `API 자동 연동 완료 (${system.toUpperCase()})` : `API Connected (${system.toUpperCase()})`}</span>
                                </span>
                              ) : (
                                <span className="text-[8px] bg-amber-50 dark:bg-amber-950/60 border border-amber-400 dark:border-amber-500/30 text-amber-950 dark:text-amber-400 font-black uppercase px-1.5 py-0.5 rounded flex items-center space-x-1 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400"></span>
                                  <span>{locale === 'ko' ? `수동 이관 필요 (${system.toUpperCase()})` : `Manual Action Required (${system.toUpperCase()})`}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[9.5px] text-slate-400 flex items-start space-x-1.5 font-bold">
                              {isSystemEnabled ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                  <span>
                                    {locale === 'ko' 
                                      ? `이관 승인 시 L2 ${system.toUpperCase()} 티켓이 실시간 자동 발행되며, 고객에게 1차 FRT 답변이 즉시 원클릭 자동 디스패치됩니다.`
                                      : `Escalating triggers real-time ${system.toUpperCase()} issue creation and sends first response to client.`}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-900 dark:text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                                  <span>
                                    {locale === 'ko' 
                                      ? `주의: 본 L2 부서는 API 연동이 비활성화 상태입니다. 이관 답변 전송 후, L2 ${system.toUpperCase()} 시스템에 상담원이 직접 이슈를 수동 생성해 주셔야 합니다.`
                                      : `Warning: API integration is disabled. You must manually register this ticket in ${system.toUpperCase()} system after sending response.`}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>

      {}
      {showAuditModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-[1.5px] z-50 flex items-center justify-center p-4 audit-modal-mask">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-none audit-modal-box">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-100">{t.console.revealReason}</h3>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {locale === 'ko' 
                ? 'HIPAA/GDPR 개인정보 보호정책에 의거, 원본 개인식별정보(PII) 조회 내역이 감사용 데이터베이스(pii_audit_logs)에 영구 기록됩니다. 구체적인 조회 목적을 입력하십시오.'
                : 'Under HIPAA policy guidelines, unmasking PII is logged in pii_audit_logs permanently. Input your target justification reason.'
              }
            </p>

            <form onSubmit={handlePiiReveal} className="space-y-4">
              <textarea
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder={locale === 'ko' ? '조회 목적을 최소 5자 이상 기입하십시오.' : 'Enter reason (at least 5 characters)...'}
                className="w-full h-20 bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                autoFocus
              />

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAuditModal(false); setAuditReason(''); }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 rounded text-xs font-bold"
                >
                  {locale === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={auditReason.trim().length < 5}
                  className={`flex-1 py-2 rounded text-xs font-bold ${
                    auditReason.trim().length >= 5 
                      ? 'bg-red-650 hover:bg-red-700 text-white' 
                      : 'bg-slate-800 text-slate-650 cursor-not-allowed'
                  }`}
                >
                  {t.console.submitReason}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
