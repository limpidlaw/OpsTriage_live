/*
 * @graphify REQ_INTEGRATION_ROUTING
 * @graphify REQ_CLIENT_EVENT_BUS_PUBSUB
 * @graphify REQ_MOCK_DB_SWITCHING
 * @graphify REQ_OFFLINE_BUILD_COMPILATION
 * @graphify REQ_3WAY_AI_CONFIGS
 */

import React, { useState, useEffect } from 'react';
import { Locale, translations } from './locales/i18n';
import { AiChatbotWidget } from './components/AiChatbotWidget';
import { HubModule } from './components/HubModule';
import { SlaDashboard } from './components/SlaDashboard';
import { AgentConsole } from './components/AgentConsole';
import { ItRunbooks } from './components/ItRunbooks';
import { SettingsConsole } from './components/SettingsConsole';
import { Shield, ShieldAlert, Sun, Moon, LayoutGrid, Activity, Inbox, Terminal, Sliders, ChevronLeft, ChevronRight, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from './utils/supabaseClient';


export interface Ticket {
  id: string;
  client: 'Acme Corp' | 'Stark Ind' | 'Wayne Ent' | 'Oscorp';
  name: string;
  emailMasked: string;
  subject: string;
  content: string;
  aiSuggestedDraft: { [key in Locale]: string };
  priority: 'Urgent' | 'Normal';
  status: 'Open' | 'Escalated' | 'L2_Resolved' | 'Resolved';
  replyContent?: string;
  olaEscalated?: boolean;
  olaEscalatedTeam?: string;
  aiSuggestedL2Team?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  manualEscalationNote?: string;
  olaResolved?: boolean;
  firstResponseSent?: boolean;
  firstResponseContent?: string;
  firstResponseAt?: string;
}

const initialTickets: Ticket[] = [
  {
    id: "ticket-1",
    client: "Stark Ind",
    name: "Luka Jensen",
    emailMasked: "luka@****.com",
    subject: "Stark Ind: Cancel order subscription request",
    content: "Hi support team, Stark Industries requested a full audit review for ordering database. Please cancel subscription for order ID 8943. User billing email: luka@stark.com.",
    aiSuggestedDraft: {
      en: "Hi Luka, we have successfully cancelled your active subscription as requested. An email has been sent.",
      ko: "안녕하세요 Luka님, 요청하신 주문 ID 8943의 구독 취소가 정상 처리되었습니다. 메일이 발송되었습니다.",
      es: "Hola Luka, hemos cancelado con éxito su suscripción activa como solicitó. Se ha enviado un correo."
    },
    priority: "Urgent",
    status: "Open",
    aiSuggestedL2Team: "L2 DevOps"
  },
  {
    id: "ticket-2",
    client: "Oscorp",
    name: "Marcus Allen",
    emailMasked: "marcus@****.com",
    subject: "Oscorp: Device screen repair claim under SLA",
    content: "Hello, my company device screen cracked. Is it possible to get a free repair? My billing address is marcus@oscorp.com.",
    aiSuggestedDraft: {
      en: "Hi Marcus, screen repairs are covered under Premium SLA for Oscorp, please send device to support office.",
      ko: "안녕하세요 Marcus님, 스크린 수리는 프리미엄 SLA에 의해 무상 보증됩니다. 기기를 지원 센터로 발송해 주세요.",
      es: "Hola Marcus, las reparaciones de pantalla están cubiertas por la SLA Premium, envíe el dispositivo a la oficina."
    },
    priority: "Urgent",
    status: "Open",
    aiSuggestedL2Team: "Compliance"
  },
  {
    id: "ticket-3",
    client: "Acme Corp",
    name: "John Doe",
    emailMasked: "john@****.com",
    subject: "Acme Corp: API Gateway webhook integration timeout",
    content: "We are seeing 504 gateway timeouts on webhook registration. Need immediate investigation. Account administrator is john@acme.com.",
    aiSuggestedDraft: {
      en: "Hello John, our engineers are scaling the container nodes to mitigate the 504 timeouts. The fix is rolling out.",
      ko: "안녕하세요 John님, 당사 엔지니어팀이 504 타임아웃 해결을 위해 노드 스케일업을 진행하고 있습니다. 곧 반영됩니다.",
      es: "Hola John, nuestros ingenieros están escalando los nodos del contenedor para mitigar los tiempos de espera 504."
    },
    priority: "Normal",
    status: "Open",
    aiSuggestedL2Team: "L2 DevOps"
  },
  {
    id: "ticket-4",
    client: "Wayne Ent",
    name: "Bruce Wayne",
    emailMasked: "bruce@****.com",
    subject: "Wayne Ent: Cloud Storage block quota expansion",
    content: "Hi, Wayne Enterprises requires 50TB extra block storage immediately. Please authorize. Admin contact: bruce@wayne.com.",
    aiSuggestedDraft: {
      en: "Hi Bruce, Wayne Enterprises block storage quota has been increased by 50TB as requested.",
      ko: "안녕하세요 Bruce님, 요청하신 Wayne Enterprises 블록 스토리지 용량이 50TB 즉각 증설 완료되었습니다.",
      es: "Hola Bruce, el cupo de almacenamiento de Wayne Enterprises se ha incrementado en 50TB según lo solicitado."
    },
    priority: "Urgent",
    status: "Open",
    aiSuggestedL2Team: "Infrastructure L2"
  },
  {
    id: "ticket-5",
    client: "Oscorp",
    name: "Norman Osborn",
    emailMasked: "norman@****.com",
    subject: "Oscorp: Billing payment gateway transaction warning",
    content: "My payment for invoice OSC-984 failed. Need invoice update. Contact: norman@oscorp.com.",
    aiSuggestedDraft: {
      en: "Hello Norman, we have verified invoice OSC-984 and regenerated a manual payment link.",
      ko: "안녕하세요 Norman님, 청구서 OSC-984 건을 검증했으며 수동 수납 링크를 재발급했습니다.",
      es: "Hola Norman, hemos verificado la factura OSC-984 y regeneramos un enlace de pago manual."
    },
    priority: "Normal",
    status: "Open",
    aiSuggestedL2Team: "Billing Support L2"
  },
  {
    id: "ticket-6",
    client: "Oscorp",
    name: "Norman Osborn",
    emailMasked: "norman@****.com",
    subject: "Oscorp: DB connection pool exhaustion warning",
    content: "CRITICAL: Oscorp backend is experiencing database connection pool leaks in the production schema. Needs Database Admin inspection.",
    aiSuggestedDraft: {
      en: "Hello Norman, L2 DB Admins have been notified and are actively scaling the pooled connections.",
      ko: "안녕하세요 Norman님, L2 데이터베이스 관리자에게 알렸으며 커넥션 증설 대응을 진행하고 있습니다.",
      es: "Hola Norman, los administradores de base de datos L2 han sido notificados y están escalando las conexiones."
    },
    priority: "Urgent",
    status: "Open",
    olaEscalated: true,
    olaEscalatedTeam: "Database Admin",
    aiSuggestedL2Team: "Database Admin"
  },
  {
    id: "ticket-7",
    client: "Stark Ind",
    name: "Pepper Potts",
    emailMasked: "pepper@****.com",
    subject: "Stark Ind: Portal account password reset instruction",
    content: "I forgot my portal password and am locked out after multiple failed attempts. Please provide reset links. User email: locked@stark.com.",
    aiSuggestedDraft: {
      en: "Hi Pepper, we have unlocked your account and triggered a secure password reset link to your email. No L2 escalation is required.",
      ko: "안녕하세요 Pepper님, 고객님의 계정 잠금을 해제하였으며 등록된 이메일로 안전한 비밀번호 재설정 링크를 발송해 드렸습니다.",
      es: "Hola Pepper, hemos desbloqueado su cuenta y enviado un enlace seguro de restablecimiento de contraseña a su correo."
    },
    priority: "Normal",
    status: "Open",
    aiSuggestedL2Team: ""
  },
  {
    id: "ticket-8",
    client: "Acme Corp",
    name: "Wile E. Coyote",
    emailMasked: "coyote@****.com",
    subject: "Acme Corp: How to export monthly SLA reports",
    content: "Hi, I am new to the portal. Where can I find the button to export our monthly SLA compliance report in PDF? Contact: newbee@acme.com.",
    aiSuggestedDraft: {
      en: "Hi Wile, you can export the report by clicking the 'Export SLA PDF' button on the top right corner of the SLA Dashboard.",
      ko: "안녕하세요 Wile님, SLA 대시보드 화면 우측 상단의 'SLA PDF 내보내기' 버튼을 클릭하시면 간편하게 리포트를 저장할 수 있습니다.",
      es: "Hola Wile, puede exportar el informe haciendo clic en el botón 'Exportar PDF de SLA' en la esquina superior derecha."
    },
    priority: "Normal",
    status: "Open",
    aiSuggestedL2Team: ""
  },
  {
    id: "ticket-9",
    client: "Wayne Ent",
    name: "Alfred Pennyworth",
    emailMasked: "alfred@****.com",
    subject: "Wayne Ent: Receipt copy request for Invoice-2026-03",
    content: "Hello, we need a copy of the payment receipt for Invoice-2026-03 for internal tax filing. Billing contact: tax@wayne.com.",
    aiSuggestedDraft: {
      en: "Hi Alfred, the requested payment receipt copy for Invoice-2026-03 has been sent directly to tax@wayne.com as a PDF attachment.",
      ko: "안녕하세요 Alfred님, 요청하신 청구서 Invoice-2026-03 건에 대한 수납 영수증 사본을 PDF 메일 첨부로 전달해 드렸습니다.",
      es: "Hola Alfred, la copia del recibo de pago solicitado para Invoice-2026-03 se ha enviado directamente a tax@wayne.com."
    },
    priority: "Normal",
    status: "Open",
    aiSuggestedL2Team: ""
  }
];

// OLA L2 Config definitions
export interface L2TeamConfig {
  name: string;
  ticketSystem: 'jira' | 'github' | 'custom';
  template?: string; // @graphify REQ_OLA_ESCALATION_TEMPLATE
}

export interface TelemetryIntegrations {
  jiraEnabled: boolean;
  jiraWebhookUrl: string;
  jiraToken: string;
  githubEnabled: boolean;
  githubWebhookUrl: string;
  githubToken: string;
  customEnabled: boolean;
  customWebhookUrl: string;
  customToken: string;
}

const defaultTelemetryIntegrations: TelemetryIntegrations = {
  jiraEnabled: true,
  jiraWebhookUrl: "https://your-domain.atlassian.net/rest/api/3/issue",
  jiraToken: "JIRA_API_MOCK_TOKEN_xyz123",
  githubEnabled: false,
  githubWebhookUrl: "https://api.github.com/repos/your-org/your-repo/issues",
  githubToken: "",
  customEnabled: false,
  customWebhookUrl: "https://your-custom-webhook-endpoint.com/webhook",
  customToken: ""
};

export interface SlaPolicyRow {
  tier: 'VIP' | 'Premium' | 'Standard';
  priority: 'P1' | 'P2' | 'P3';
  frt: number;
  trt: number;
}

const defaultSlaPolicies: SlaPolicyRow[] = [
  { tier: 'VIP', priority: 'P1', frt: 15, trt: 60 },
  { tier: 'VIP', priority: 'P2', frt: 30, trt: 180 },
  { tier: 'VIP', priority: 'P3', frt: 60, trt: 360 },
  { tier: 'Premium', priority: 'P1', frt: 30, trt: 120 },
  { tier: 'Premium', priority: 'P2', frt: 60, trt: 360 },
  { tier: 'Premium', priority: 'P3', frt: 120, trt: 720 },
  { tier: 'Standard', priority: 'P1', frt: 60, trt: 240 },
  { tier: 'Standard', priority: 'P2', frt: 120, trt: 720 },
  { tier: 'Standard', priority: 'P3', frt: 240, trt: 1440 }
];

const defaultL2Teams: L2TeamConfig[] = [
  { 
    name: "L2 DevOps", 
    ticketSystem: "jira",
    template: `### 🚨 [L2 DEVOPS ESCALATION] {TICKET_ID}
- **B2B Account**: {ACCOUNT_NAME}
- **SLA Countdown**: {SLA_TIMER}
- **Subject**: {SUBJECT}
- **Requester**: {CUSTOMER_EMAIL}
- **Incident Sentiment**: {SENTIMENT}

**[Action Items]**
1. Review routing logs and API Gateway timeouts.
2. Scale up service container nodes immediately.

**[Incident Context]**
{INCIDENT_DESCRIPTION}`
  },
  { 
    name: "Database Admin", 
    ticketSystem: "custom",
    template: `### 💾 [DATABASE ADMIN ESCALATION] {TICKET_ID}
- **B2B Account**: {ACCOUNT_NAME}
- **SLA Countdown**: {SLA_TIMER}
- **Subject**: {SUBJECT}
- **Requester**: {CUSTOMER_EMAIL}
- **Incident Sentiment**: {SENTIMENT}

**[Action Items]**
1. Check RDS active connection pools and block locks.
2. Optimize slow queries matching the incident signature.

**[Incident Context]**
{INCIDENT_DESCRIPTION}`
  },
  { 
    name: "Compliance", 
    ticketSystem: "github",
    template: `### ⚖️ [COMPLIANCE & AUDIT ESCALATION] {TICKET_ID}
- **B2B Account**: {ACCOUNT_NAME}
- **Subject**: {SUBJECT}
- **Compliance Status**: PII Masking and HIPAA Guardrails Audited.

**[Action Items]**
1. Verify audit logging trail for data access records.
2. Confirm compliance clearance against GDPR/HIPAA policies.

**[Incident Context]**
{INCIDENT_DESCRIPTION}`
  },
  { 
    name: "Infrastructure L2", 
    ticketSystem: "jira",
    template: `### 🌐 [INFRASTRUCTURE L2 ESCALATION] {TICKET_ID}
- **B2B Account**: {ACCOUNT_NAME}
- **SLA Countdown**: {SLA_TIMER}
- **Subject**: {SUBJECT}
- **Requester**: {CUSTOMER_EMAIL}

**[Action Items]**
1. Inspect Cloudflare routing tables and firewall rules.
2. Verify system health dashboard metrics.

**[Incident Context]**
{INCIDENT_DESCRIPTION}`
  }
];

// Simplified Global Event Bus
type EventCallback = (data?: any) => void;
class EventBus {
  private listeners: { [key: string]: EventCallback[] } = {};
  
  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  
  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}
export const globalEventBus = new EventBus();

export interface AiEngineConfig {
  provider: string;
  apiKey: string;
  model: string;
}

export interface AiConfigs {
  engine01: AiEngineConfig;
  engine02: AiEngineConfig;
  engine03: AiEngineConfig;
}

const defaultAiConfigs: AiConfigs = {
  engine01: { provider: 'gemini', apiKey: '••••••••••••', model: 'gemini-1.5-flash' },
  engine02: { provider: 'openai', apiKey: '••••••••••••', model: 'gpt-4o-mini' },
  engine03: { provider: 'anthropic', apiKey: '••••••••••••', model: 'claude-3-5-haiku' }
};

export const App: React.FC = () => {
  // Global States
  const [currentTab, setCurrentTab] = useState<string>('hub');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAdminAuth') === 'true';
  });
  const [locale, setLocale] = useState<Locale>(() => {
    return (localStorage.getItem('locale') as Locale) || 'en';
  });
  const [aiConfigs, setAiConfigs] = useState<AiConfigs>(() => {
    const raw = localStorage.getItem('aiConfigs');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return defaultAiConfigs;
  });
  const [aiChatbotEnabled, setAiChatbotEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem('aiChatbotEnabled');
    return val !== 'false';
  });

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    localStorage.setItem('aiConfigs', JSON.stringify(aiConfigs));
  }, [aiConfigs]);

  useEffect(() => {
    localStorage.setItem('aiChatbotEnabled', aiChatbotEnabled ? 'true' : 'false');
  }, [aiChatbotEnabled]);

  const [globalL2Teams, setGlobalL2Teams] = useState<L2TeamConfig[]>(() => {
    const raw = localStorage.getItem('globalL2Teams');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return defaultL2Teams;
  });

  const [slaPolicies, setSlaPolicies] = useState<SlaPolicyRow[]>(() => {
    const raw = localStorage.getItem('slaPolicies');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return defaultSlaPolicies;
  });

  useEffect(() => {
    localStorage.setItem('slaPolicies', JSON.stringify(slaPolicies));
  }, [slaPolicies]);

  const [l1ToL2Minutes, setL1ToL2Minutes] = useState<number>(() => {
    const val = localStorage.getItem('l1ToL2Minutes');
    return val ? parseInt(val) : 15;
  });

  const [tempRecoveryMinutes, setTempRecoveryMinutes] = useState<number>(() => {
    const val = localStorage.getItem('tempRecoveryMinutes');
    return val ? parseInt(val) : 60;
  });

  const [phiAutoMasking, setPhiAutoMasking] = useState<boolean>(() => {
    const val = localStorage.getItem('phiAutoMasking');
    return val !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('l1ToL2Minutes', l1ToL2Minutes.toString());
  }, [l1ToL2Minutes]);

  useEffect(() => {
    localStorage.setItem('tempRecoveryMinutes', tempRecoveryMinutes.toString());
  }, [tempRecoveryMinutes]);

  useEffect(() => {
    localStorage.setItem('phiAutoMasking', phiAutoMasking.toString());
  }, [phiAutoMasking]);



  useEffect(() => {
    localStorage.setItem('globalL2Teams', JSON.stringify(globalL2Teams));
  }, [globalL2Teams]);

  const [telemetryIntegrations, setTelemetryIntegrations] = useState<TelemetryIntegrations>(() => {
    const raw = localStorage.getItem('telemetryIntegrations');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return defaultTelemetryIntegrations;
  });

  useEffect(() => {
    localStorage.setItem('telemetryIntegrations', JSON.stringify(telemetryIntegrations));
  }, [telemetryIntegrations]);
  
  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed ? 'true' : 'false');
  }, [isSidebarCollapsed]);
  
  // Simulator state: when active, a yellow pulse badge appears on IT Runbooks card.
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(true);
  
  // B2B Health Score state (Stark Industries)
  const [starkHealth, setStarkHealth] = useState<number>(45); // Initial Warn/At Risk state
  const [starkStatus, setStarkStatus] = useState<string>('At Risk');



  // DB Fetch Error telemetry
  const [dbError, setDbError] = useState<string | null>(null);

  // Global Tickets State
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  // Supabase Configuration Status Indicator [REQ_MOCK_DB_SWITCHING]
  const isSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anon-public-key';

  // Fetch data from Supabase live tables
  const fetchSupabaseData = async () => {
    if (!isSupabaseConfigured) return;
    try {
      setDbError(null);
      // 1. Fetch tickets
      const { data: ticketData, error: ticketErr } = await supabase
        .from('tickets')
        .select('*');
      if (ticketErr) throw ticketErr;
      
      if (ticketData) {
        // Map database fields to React Ticket type interface
        const mappedTickets: Ticket[] = ticketData.map((t: any) => ({
          id: t.id,
          client: (t.client_name || 'Acme Corp') as any,
          name: t.customer_name,
          emailMasked: t.email_masked,
          subject: t.title,
          content: t.content_masked,
          aiSuggestedDraft: t.generated_draft || {
            en: "AI suggested reply content...",
            ko: "AI 추천 답변이 생성되는 중입니다...",
            es: "Generando borrador sugerido..."
          },
          priority: t.priority === 'Urgent' ? 'Urgent' : 'Normal',
          status: t.status === 'resolved' ? 'Resolved' 
                : t.status === 'escalated' ? 'Escalated' 
                : t.status === 'l2_resolved' ? 'L2_Resolved' : 'Open',
          replyContent: t.reply_content,
          olaEscalated: t.ola_escalated,
          olaEscalatedTeam: t.ola_escalated_team,
          aiSuggestedL2Team: t.ai_suggested_l2_team,
          sentiment: t.sentiment,
          manualEscalationNote: t.manual_escalation_note,
          olaResolved: t.ola_resolved,
          firstResponseSent: t.first_response_sent,
          firstResponseContent: t.first_response_content,
          firstResponseAt: t.first_response_at
        }));
        
        // Multi-tier Prioritized Sorting [REQ_PRIORITIZED_SORTING]
        const sorted = [...mappedTickets].sort((a, b) => {
          if (a.status === 'Open' && b.status !== 'Open') return -1;
          if (a.status !== 'Open' && b.status === 'Open') return 1;
          if (a.priority === 'Urgent' && b.priority !== 'Urgent') return -1;
          if (a.priority !== 'Urgent' && b.priority === 'Urgent') return 1;
          return b.id.localeCompare(a.id);
        });
        setTickets(sorted);
      }

      // 2. Fetch Stark Ind B2B Account health
      const { data: accountData } = await supabase
        .from('accounts')
        .select('health_score, health_status')
        .eq('company_name', 'Stark Industries')
        .single();
      if (accountData) {
        setStarkHealth(accountData.health_score);
        setStarkStatus(accountData.health_status);
        if (accountData.health_score >= 90) {
          setIsSimulatorActive(false);
        }
      }


    } catch (e: any) {
      console.error("Error fetching live Supabase data:", e);
      setDbError(e.message || String(e));
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSupabaseData();
      
      // Setup Realtime replication subscriber
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'platform_core', table: 'tickets' }, () => {
          fetchSupabaseData();
        })
        .on('postgres_changes', { event: '*', schema: 'platform_core', table: 'accounts' }, () => {
          fetchSupabaseData();
        })
        .on('postgres_changes', { event: '*', schema: 'platform_core', table: 'app_settings' }, () => {
          fetchSupabaseData();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSupabaseConfigured]);

  const handleResolveTicket = async (ticketId: string, replyText?: string, isL2EscalatedComplete?: boolean, manualNote?: string) => {
    // 1. Update React Local States
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        if (t.client === 'Stark Ind') {
          setStarkHealth(95);
          setStarkStatus('Good');
          setIsSimulatorActive(false);
          globalEventBus.emit('HEALTH_GRAPH_REFRESH');
        }
        
        // If L2 completes its workflow without reply text, transition to L2_Resolved
        if (isL2EscalatedComplete && !replyText) {
          return { 
            ...t, 
            status: 'L2_Resolved' as const,
            olaResolved: true,
            manualEscalationNote: manualNote
          };
        }

        return { 
          ...t, 
          status: 'Resolved' as const, 
          replyContent: replyText || t.replyContent,
          olaResolved: isL2EscalatedComplete ? true : t.olaResolved,
          manualEscalationNote: manualNote || t.manualEscalationNote
        };
      }
      return t;
    }));

    // 2. Persist to Supabase Live DB
    if (isSupabaseConfigured) {
      try {
        const ticketStatus = (isL2EscalatedComplete && !replyText) ? 'l2_resolved' : 'resolved';
        await supabase
          .from('tickets')
          .update({
            status: ticketStatus,
            reply_content: replyText || null,
            ola_resolved: isL2EscalatedComplete ? true : null,
            manual_escalation_note: manualNote || null,
            resolved_at: new Date().toISOString()
          })
          .eq('id', ticketId);

        const targetTicket = tickets.find(t => t.id === ticketId);
        if (targetTicket && targetTicket.client === 'Stark Ind') {
          await supabase
            .from('accounts')
            .update({
              health_score: 95,
              health_status: 'Good'
            })
            .eq('company_name', 'Stark Industries');
        }
      } catch (e) {
        console.error("Error persisting resolved ticket to Supabase:", e);
      }
    }
  };

  const handleEscalateTicket = async (ticketId: string, team: string, firstReplyContent?: string) => {
    const formattedDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    // 1. Update React Local States
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { 
          ...t, 
          status: 'Escalated' as const,
          olaEscalated: true, 
          olaEscalatedTeam: team,
          firstResponseSent: true,
          firstResponseContent: firstReplyContent || `[System Notification] Ticket successfully escalated to L2 ${team} department for further diagnostics.`,
          firstResponseAt: formattedDate
        };
      }
      return t;
    }));

    // 2. Persist to Supabase Live DB
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('tickets')
          .update({
            status: 'escalated',
            ola_escalated: true,
            ola_escalated_team: team,
            first_response_sent: true,
            first_response_content: firstReplyContent || `[System Notification] Ticket successfully escalated to L2 ${team} department for further diagnostics.`,
            first_response_at: new Date().toISOString()
          })
          .eq('id', ticketId);
      } catch (e) {
        console.error("Error persisting escalated ticket to Supabase:", e);
      }
    }
  };

  const handleInjectTicket = async () => {
    const nowTimestamp = Date.now();
    const newTicketId = `ticket-injected-${nowTimestamp}`;
    const newTicket: Ticket = {
      id: newTicketId,
      client: "Stark Ind",
      name: "Tony Stark",
      emailMasked: "tony@****.com",
      subject: "Stark Ind: [VIP EMERGENCY] Arc Reactor Cooling Grid Webhook Failure",
      content: "EMERGENCY: Cooling grid sensors are reporting OLA timeout breaches. Immediate API escalation required! Security email: tony@stark.com.",
      aiSuggestedDraft: {
        en: "Dear Tony, we have received the sensor alert and triggered the manual safety dump webhooks.",
        ko: "Tony님, 센서 경보를 수신했으며 비상 냉각 웹훅 강제 전송 대응을 시작했습니다.",
        es: "Estimado Tony, hemos recibido la alerta del sensor y activamos los webhooks de seguridad."
      },
      priority: "Urgent",
      status: "Open",
      aiSuggestedL2Team: "L2 DevOps"
    };

    // 1. Update React Local States
    setTickets(prev => [newTicket, ...prev]);
    setIsSimulatorActive(true);
    setStarkHealth(32);
    setStarkStatus('At Risk');
    globalEventBus.emit('HEALTH_GRAPH_REFRESH');

    // 2. Persist to Supabase Live DB
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('tickets')
          .insert([{
            id: newTicketId,
            client_name: "Stark Ind",
            customer_name: "Tony Stark",
            customer_email: "tony@stark.com",
            email_masked: "tony@****.com",
            title: "Stark Ind: [VIP EMERGENCY] Arc Reactor Cooling Grid Webhook Failure",
            content_original: "EMERGENCY: Cooling grid sensors are reporting OLA timeout breaches. Immediate API escalation required! Security email: tony@stark.com.",
            content_masked: "EMERGENCY: Cooling grid sensors are reporting OLA timeout breaches. Immediate API escalation required! Security email: tony@stark.com.",
            status: "open",
            priority: "Urgent",
            ai_suggested_l2_team: "L2 DevOps",
            generated_draft: newTicket.aiSuggestedDraft
          }]);

        await supabase
          .from('accounts')
          .update({
            health_score: 32,
            health_status: 'At Risk'
          })
          .eq('company_name', 'Stark Industries');
      } catch (e) {
        console.error("Error inserting injected ticket into Supabase:", e);
      }
    }
  };

  // Theme Synchronizer Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {

      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Language Dropdown Click Outside Close Detector
  useEffect(() => {
    if (!isLangDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lang-dropdown-container')) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isLangDropdownOpen]);

  // Sync admin authentication to localStorage
  useEffect(() => {
    localStorage.setItem('isAdminAuth', isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  // Sync locale to localStorage
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);



  // Register event bus listeners
  useEffect(() => {
    const handleInjectedEvent = () => {
      handleInjectTicket();
    };
    globalEventBus.on('TICKET_INJECTED', handleInjectedEvent);
    globalEventBus.on('RUNBOOK_SOLVED', () => {
      setIsSimulatorActive(false);
      setStarkHealth(95);
      setStarkStatus('Good');
      globalEventBus.emit('HEALTH_GRAPH_REFRESH');
    });
    return () => {
      globalEventBus.off('TICKET_INJECTED', handleInjectedEvent);
    };
  }, []);

  const t = translations[locale];

  // Sidebar navigation icon mapping
  const tabIcons: { [key: string]: React.ReactNode } = {
    hub: <LayoutGrid className="w-4 h-4" />,
    sla: <Activity className="w-4 h-4" />,
    console: <Inbox className="w-4 h-4" />,
    runbooks: <Terminal className="w-4 h-4" />,
    settings: <Sliders className="w-4 h-4" />
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col transition-colors duration-300 overflow-hidden">
      {dbError && (
        <div className="bg-red-950/80 border-b border-red-500/30 p-2 text-center text-xs font-mono text-red-300 flex items-center justify-center space-x-2 z-50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>[Supabase Integration Error] {dbError}</span>
        </div>
      )}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* 1. Left Collapsible Sidebar */}
      <aside className={`flex flex-col justify-between border-r border-slate-800 bg-slate-900 transition-all duration-300 z-30 ${
        isSidebarCollapsed ? 'w-16' : 'w-56'
      }`}>
        {/* Top brand area */}
        <div className="p-4 flex flex-col space-y-6">
          <div className={`flex ${isSidebarCollapsed ? 'flex-col space-y-3 items-center justify-center' : 'items-center justify-between'}`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-6.5 h-6.5 rounded bg-blue-600 flex items-center justify-center text-white font-black text-sm">🛡️</div>
                <div>
                  <h1 className="text-xs font-black tracking-tight uppercase leading-none">OpsTriage</h1>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">B2B PLATFORM</span>
                </div>
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-base shadow-none transition-all duration-300">
                🛡️
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors mx-auto ${
                isSidebarCollapsed ? 'mt-1' : ''
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col space-y-1">
            {(['hub', 'sla', 'console', 'runbooks', 'settings'] as const).map((tab) => {
              const isActive = currentTab === tab;
              let label = t.nav[tab];
              const showRunbooksBadge = tab === 'runbooks' && isSimulatorActive;

              return (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  title={isSidebarCollapsed ? label : undefined}
                  className={`w-full py-2.5 rounded transition-colors flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3 space-x-2.5'
                  } ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <div className="relative flex items-center">
                    {tabIcons[tab]}
                    {showRunbooksBadge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-slate-900 animate-pulse"></span>
                    )}
                  </div>
                  {!isSidebarCollapsed && <span className="text-xs font-bold">{label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Controls */}
        <div className={`p-4 border-t border-slate-800/80 flex flex-col ${
          isSidebarCollapsed ? 'space-y-3 items-center' : 'space-y-3.5'
        }`}>
          {/* Admin Lock/Unlock state trigger */}
          <button 
            onClick={() => {
              if (isAdminAuthenticated) {
                setIsAdminAuthenticated(false);
              } else {
                setCurrentTab('hub');
                setTimeout(() => {
                  globalEventBus.emit('OPEN_ADMIN_PIN_MODAL');
                }, 50);
              }
            }}
            title={isSidebarCollapsed ? (isAdminAuthenticated ? "Lock Admin Auth" : "Unlock Admin Auth") : undefined}
            className={`flex items-center justify-center font-bold transition-all ${
              isSidebarCollapsed 
                ? 'w-9.5 h-9.5 rounded-lg border hover:bg-slate-850 hover:text-slate-200 mx-auto' 
                : 'w-full px-2.5 py-1.5 rounded border text-[10px] space-x-1.5'
            } ${
              isAdminAuthenticated 
                ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400' 
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
            }`}
          >
            {isAdminAuthenticated ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />}
            {!isSidebarCollapsed && <span>{isAdminAuthenticated ? 'ADMIN AUTH' : 'LOCKED'}</span>}
          </button>

          {/* Theme Toggle & Language row */}
          <div className={`flex w-full ${isSidebarCollapsed ? 'flex-col space-y-3' : 'items-center space-x-2'}`}>
            {/* Dark/Light Mode Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all ${
                isSidebarCollapsed 
                  ? 'w-9.5 h-9.5 rounded-lg border border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-850 mx-auto' 
                  : 'flex-1 py-1.5 rounded border border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200 text-[10px] font-bold space-x-1.5'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500 animate-soft-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              {!isSidebarCollapsed && <span>{isDarkMode ? 'LIGHT' : 'DARK'}</span>}
            </button>

            {/* Language Selection Selector */}
            <div className={`relative lang-dropdown-container ${isSidebarCollapsed ? 'mx-auto' : 'flex-1'}`}>
              {isSidebarCollapsed ? (
                <button 
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="w-9.5 h-9.5 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors rounded-lg border border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-850 mx-auto"
                  title="Select Language"
                >
                  <Globe className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 hover:text-slate-100 transition-colors text-[10px] font-bold"
                >
                  <div className="flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">
                      {locale === 'en' ? 'EN' : locale === 'ko' ? 'KO' : 'ES'}
                    </span>
                  </div>
                  {isLangDropdownOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              )}

              {isLangDropdownOpen && (
                <div className={`absolute ${
                  isSidebarCollapsed ? 'left-full bottom-0 ml-2' : 'left-0 right-0 bottom-full mb-2'
                } bg-slate-900 border border-slate-800 rounded shadow-none z-50 py-1 ${isSidebarCollapsed ? 'w-28' : ''} flex flex-col`}>
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'ko', label: '한국어' },
                    { code: 'es', label: 'Español' }
                  ].map((lang) => {
                    const isSelected = locale === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLocale(lang.code as Locale);
                          setIsLangDropdownOpen(false);
                        }}
                        className="w-full px-2 py-1.5 text-left hover:bg-slate-850 transition-colors flex items-center space-x-2 text-[10px] font-bold"
                      >
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-transparent' 
                            : 'border-slate-700 bg-transparent'
                        }`}>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <span className={isSelected ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}>
                          {lang.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 flex flex-col relative h-full min-h-0 overflow-hidden">
          {currentTab === 'hub' && (
          <HubModule 
            key={locale}
            locale={locale} 
            isAdminAuthenticated={isAdminAuthenticated} 
            setIsAdminAuthenticated={setIsAdminAuthenticated}
            isSimulatorActive={isSimulatorActive}
            setCurrentTab={setCurrentTab}
            isSupabaseConfigured={isSupabaseConfigured}
          />
        )}
        
        {currentTab === 'sla' && (
          <SlaDashboard 
            key={locale}
            locale={locale} 
            starkHealth={starkHealth} 
            starkStatus={starkStatus}
            tickets={tickets}
            onInjectTicket={handleInjectTicket}
          />
        )}
        
        {currentTab === 'console' && (
          <AgentConsole 
            key={locale}
            locale={locale} 
            isAdminAuthenticated={isAdminAuthenticated}
            setCurrentTab={setCurrentTab}
            tickets={tickets}
            onResolveTicket={handleResolveTicket}
            onEscalateTicket={handleEscalateTicket}
            globalL2Teams={globalL2Teams}
            tempRecoveryMinutes={tempRecoveryMinutes}
            telemetryIntegrations={telemetryIntegrations}
          />
        )}
        
        {currentTab === 'runbooks' && (
          <ItRunbooks 
            key={locale}
            locale={locale} 
            isSimulatorActive={isSimulatorActive}
            tickets={tickets}
            onResolveTicket={handleResolveTicket}
            globalL2Teams={globalL2Teams}
            telemetryIntegrations={telemetryIntegrations}
          />
        )}
        
        {currentTab === 'settings' && (
          <SettingsConsole 
            key={locale}
            locale={locale} 
            setLocale={setLocale}
            isAdminAuthenticated={isAdminAuthenticated}
            aiConfigs={aiConfigs}
            setAiConfigs={setAiConfigs}
            aiChatbotEnabled={aiChatbotEnabled}
            setAiChatbotEnabled={setAiChatbotEnabled}
            setCurrentTab={setCurrentTab}
            globalL2Teams={globalL2Teams}
            setGlobalL2Teams={setGlobalL2Teams}
            slaPolicies={slaPolicies}
            setSlaPolicies={setSlaPolicies}
            l1ToL2Minutes={l1ToL2Minutes}
            setL1ToL2Minutes={setL1ToL2Minutes}
            tempRecoveryMinutes={tempRecoveryMinutes}
            setTempRecoveryMinutes={setTempRecoveryMinutes}
            phiAutoMasking={phiAutoMasking}
            setPhiAutoMasking={setPhiAutoMasking}
            telemetryIntegrations={telemetryIntegrations}
            setTelemetryIntegrations={setTelemetryIntegrations}
          />
        )}
      </main>

      {aiChatbotEnabled && (
        <AiChatbotWidget currentTab={currentTab} aiModelName={aiConfigs.engine03.model} locale={locale} />
      )}
      </div>
    </div>
  </div>
  );
};

export default App;
