/*
 * @graphify REQ_DEMO_PIN_LOCKDOWN
 * @graphify REQ_MULTILINGUAL_I18N
 * @graphify REQ_AUTO_MIGRATION_DDL
 * @graphify REQ_3WAY_AI_CONFIGS
 */

import React, { useState } from 'react';
import { Locale, translations } from '../locales/i18n';
import { Settings, Brain, Clock, Shield, Save, CheckCircle2, ChevronRight } from 'lucide-react';
import { L2TeamConfig, SlaPolicyRow, AiConfigs, TelemetryIntegrations } from '../App';

interface SettingsProps {
  locale: Locale;
  setLocale: (l: Locale) => void;
  isAdminAuthenticated: boolean;
  aiConfigs: AiConfigs;
  setAiConfigs: (c: AiConfigs) => void;
  aiChatbotEnabled: boolean;
  setAiChatbotEnabled: (val: boolean) => void;
  setCurrentTab: (tab: string) => void;
  globalL2Teams: L2TeamConfig[];
  setGlobalL2Teams: React.Dispatch<React.SetStateAction<L2TeamConfig[]>>;
  slaPolicies: SlaPolicyRow[];
  setSlaPolicies: React.Dispatch<React.SetStateAction<SlaPolicyRow[]>>;
  l1ToL2Minutes: number;
  setL1ToL2Minutes: (val: number) => void;
  tempRecoveryMinutes: number;
  setTempRecoveryMinutes: (val: number) => void;
  phiAutoMasking: boolean;
  setPhiAutoMasking: (val: boolean) => void;
  telemetryIntegrations: TelemetryIntegrations;
  setTelemetryIntegrations: React.Dispatch<React.SetStateAction<TelemetryIntegrations>>;
}

export const SettingsConsole: React.FC<SettingsProps> = ({
  locale,
  setLocale,
  isAdminAuthenticated,
  aiConfigs,
  setAiConfigs,
  aiChatbotEnabled,
  setAiChatbotEnabled,
  setCurrentTab,
  globalL2Teams,
  setGlobalL2Teams,
  slaPolicies,
  setSlaPolicies,
  l1ToL2Minutes,
  setL1ToL2Minutes,
  tempRecoveryMinutes,
  setTempRecoveryMinutes,
  phiAutoMasking,
  setPhiAutoMasking,
  telemetryIntegrations,
  setTelemetryIntegrations
}) => {
  const t = translations[locale];
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'ai' | 'sla' | 'ola' | 'escalation' | 'telemetry'>('ai');
  const [toastMsg, setToastMsg] = useState<string>('');

  // AI config state (3-way engines)
  const [tempAiConfigs, setTempAiConfigs] = useState<AiConfigs>({
    engine01: { ...aiConfigs.engine01 },
    engine02: { ...aiConfigs.engine02 },
    engine03: { ...aiConfigs.engine03 }
  });
  const [tempChatbotEnabled, setTempChatbotEnabled] = useState<boolean>(aiChatbotEnabled);
  const [useSingleApiKey, setUseSingleApiKey] = useState<boolean>(() => {
    const stored = localStorage.getItem('useSingleApiKey');
    if (stored !== null) return stored === 'true';
    const k1 = aiConfigs.engine01.apiKey;
    const k2 = aiConfigs.engine02.apiKey;
    const k3 = aiConfigs.engine03.apiKey;
    return (k1 === k2 && k2 === k3);
  });
  const [singleApiKey, setSingleApiKey] = useState<string>(() => {
    return localStorage.getItem('singleApiKey') || aiConfigs.engine01.apiKey;
  });
  const [bulkKeyProvider, setBulkKeyProvider] = useState<string>(() => {
    return localStorage.getItem('bulkKeyProvider') || aiConfigs.engine01.provider;
  });

  React.useEffect(() => {
    setTempAiConfigs({
      engine01: { ...aiConfigs.engine01 },
      engine02: { ...aiConfigs.engine02 },
      engine03: { ...aiConfigs.engine03 }
    });
    setSingleApiKey(aiConfigs.engine01.apiKey);
    setBulkKeyProvider(aiConfigs.engine01.provider);
    const k1 = aiConfigs.engine01.apiKey;
    const k2 = aiConfigs.engine02.apiKey;
    const k3 = aiConfigs.engine03.apiKey;
    setUseSingleApiKey(k1 === k2 && k2 === k3);
  }, [aiConfigs]);

  React.useEffect(() => {
    setTempChatbotEnabled(aiChatbotEnabled);
  }, [aiChatbotEnabled]);

  // Industry-specific dual-threshold presets
  const industryPresets = {
    finance: [
      { tier: 'VIP', priority: 'P1', frt: 5, trt: 30 },
      { tier: 'VIP', priority: 'P2', frt: 15, trt: 60 },
      { tier: 'VIP', priority: 'P3', frt: 30, trt: 120 },
      { tier: 'Premium', priority: 'P1', frt: 15, trt: 60 },
      { tier: 'Premium', priority: 'P2', frt: 30, trt: 180 },
      { tier: 'Premium', priority: 'P3', frt: 60, trt: 360 },
      { tier: 'Standard', priority: 'P1', frt: 30, trt: 120 },
      { tier: 'Standard', priority: 'P2', frt: 60, trt: 240 },
      { tier: 'Standard', priority: 'P3', frt: 120, trt: 720 }
    ],
    enterprise: [
      { tier: 'VIP', priority: 'P1', frt: 15, trt: 60 },
      { tier: 'VIP', priority: 'P2', frt: 30, trt: 180 },
      { tier: 'VIP', priority: 'P3', frt: 60, trt: 360 },
      { tier: 'Premium', priority: 'P1', frt: 30, trt: 120 },
      { tier: 'Premium', priority: 'P2', frt: 60, trt: 360 },
      { tier: 'Premium', priority: 'P3', frt: 120, trt: 720 },
      { tier: 'Standard', priority: 'P1', frt: 60, trt: 240 },
      { tier: 'Standard', priority: 'P2', frt: 120, trt: 720 },
      { tier: 'Standard', priority: 'P3', frt: 240, trt: 1440 }
    ],
    ecommerce: [
      { tier: 'VIP', priority: 'P1', frt: 10, trt: 90 },
      { tier: 'VIP', priority: 'P2', frt: 20, trt: 240 },
      { tier: 'VIP', priority: 'P3', frt: 45, trt: 480 },
      { tier: 'Premium', priority: 'P1', frt: 20, trt: 180 },
      { tier: 'Premium', priority: 'P2', frt: 45, trt: 480 },
      { tier: 'Premium', priority: 'P3', frt: 90, trt: 960 },
      { tier: 'Standard', priority: 'P1', frt: 45, trt: 360 },
      { tier: 'Standard', priority: 'P2', frt: 90, trt: 960 },
      { tier: 'Standard', priority: 'P3', frt: 180, trt: 1440 }
    ],
    healthcare: [
      { tier: 'VIP', priority: 'P1', frt: 10, trt: 45 },
      { tier: 'VIP', priority: 'P2', frt: 20, trt: 120 },
      { tier: 'VIP', priority: 'P3', frt: 45, trt: 240 },
      { tier: 'Premium', priority: 'P1', frt: 20, trt: 90 },
      { tier: 'Premium', priority: 'P2', frt: 45, trt: 240 },
      { tier: 'Premium', priority: 'P3', frt: 90, trt: 480 },
      { tier: 'Standard', priority: 'P1', frt: 45, trt: 180 },
      { tier: 'Standard', priority: 'P2', frt: 90, trt: 480 },
      { tier: 'Standard', priority: 'P3', frt: 180, trt: 960 }
    ]
  } as const;

  // SLA config states
  const [tempSlaPolicies, setTempSlaPolicies] = useState<SlaPolicyRow[]>([]);
  const [unsavedSlaRows, setUnsavedSlaRows] = useState<number[]>([]);

  // Sync tempSlaPolicies when props update
  React.useEffect(() => {
    setTempSlaPolicies(JSON.parse(JSON.stringify(slaPolicies)));
  }, [slaPolicies]);

  // OLA global inputs local states
  const [tempL1ToL2, setTempL1ToL2] = useState(l1ToL2Minutes);
  const [tempRecMins, setTempRecMins] = useState(tempRecoveryMinutes);
  const [tempPhi, setTempPhi] = useState(phiAutoMasking);
  const [unsavedOlaDetails, setUnsavedOlaDetails] = useState<boolean>(false);

  React.useEffect(() => {
    setTempL1ToL2(l1ToL2Minutes);
    setTempRecMins(tempRecoveryMinutes);
    setTempPhi(phiAutoMasking);
  }, [l1ToL2Minutes, tempRecoveryMinutes, phiAutoMasking]);

  // Global OLA L2 config state
  const [tempL2Configs, setTempL2Configs] = useState<L2TeamConfig[]>([]);

  // Sync tempL2Configs when globalL2Teams updates
  React.useEffect(() => {
    setTempL2Configs(JSON.parse(JSON.stringify(globalL2Teams)));
  }, [globalL2Teams]);

  const handleEditL2Name = (idx: number, name: string) => {
    setTempL2Configs(prev => {
      const copy = [...prev];
      copy[idx].name = name;
      return copy;
    });
  };



  const handleEditL2TicketSystem = (idx: number, system: 'jira' | 'github' | 'custom') => {
    setTempL2Configs(prev => {
      const copy = [...prev];
      copy[idx].ticketSystem = system;
      return copy;
    });
  };

  const handleAddL2Team = () => {
    setTempL2Configs(prev => [
      ...prev,
      { 
        name: "New L2 Team",
        ticketSystem: "jira",
        template: `### 🚨 [Escalation Alert] {TICKET_ID}
- **B2B Account**: {ACCOUNT_NAME}
- **Subject**: {SUBJECT}

**[Action Items]**
1. DevOps Incident Review required.

**[Incident Description]**
{INCIDENT_DESCRIPTION}`
      }
    ]);
  };

  const handleRemoveL2Team = (idx: number) => {
    setTempL2Configs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveL2Teams = () => {
    setGlobalL2Teams(tempL2Configs);
    setToastMsg(locale === 'ko' ? "글로벌 OLA L2 이관 부서 목록이 최종 저장되었습니다!" : "Global OLA L2 Teams Saved.");
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Escalation template states
  const [selectedTemplateTeam, setSelectedTemplateTeam] = useState<string>(() => {
    return globalL2Teams.length > 0 ? globalL2Teams[0].name : '';
  });
  
  React.useEffect(() => {
    if (!selectedTemplateTeam && globalL2Teams.length > 0) {
      setSelectedTemplateTeam(globalL2Teams[0].name);
    }
  }, [globalL2Teams, selectedTemplateTeam]);

  const [tempTemplates, setTempTemplates] = useState<{ [teamName: string]: string }>({});

  React.useEffect(() => {
    const map: { [teamName: string]: string } = {};
    globalL2Teams.forEach(team => {
      map[team.name] = team.template || '';
    });
    setTempTemplates(prev => {
      const merged = { ...map };
      Object.keys(prev).forEach(k => {
        if (globalL2Teams.some(t => t.name === k)) {
          merged[k] = prev[k];
        }
      });
      return merged;
    });
  }, [globalL2Teams]);

  const [unsavedTemplate, setUnsavedTemplate] = useState<boolean>(false);

  // Connection settings states
  const [tempLocale, setTempLocale] = useState<Locale>(locale);
  const [tempTelemetry, setTempTelemetry] = useState<TelemetryIntegrations>(() => JSON.parse(JSON.stringify(telemetryIntegrations)));
  const [unsavedTelemetry, setUnsavedTelemetry] = useState<boolean>(false);

  React.useEffect(() => {
    setTempLocale(locale);
  }, [locale]);

  React.useEffect(() => {
    setTempTelemetry(JSON.parse(JSON.stringify(telemetryIntegrations)));
  }, [telemetryIntegrations]);



  // Handle SLA input changes
  const handleSlaChange = (idx: number, field: 'frt' | 'trt', val: string) => {
    const num = Math.max(1, parseInt(val) || 0);
    setTempSlaPolicies(prev => {
      const copy = [...prev];
      copy[idx][field] = num;
      return copy;
    });
    if (!unsavedSlaRows.includes(idx)) {
      setUnsavedSlaRows(prev => [...prev, idx]);
    }
  };

  // Load industry presets
  const loadPreset = (industry: keyof typeof industryPresets) => {
    setTempSlaPolicies(JSON.parse(JSON.stringify(industryPresets[industry])));
    setUnsavedSlaRows(Array.from({ length: 9 }, (_, i) => i));
  };

  // Save SLA matrix
  const handleSlaSave = () => {
    setSlaPolicies(tempSlaPolicies);
    setUnsavedSlaRows([]);
    setToastMsg(locale === 'ko' ? "SLA 관제 매트릭스 정책 저장 완료!" : "SLA Matrix Policy Updated.");
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Save AI Config
  const handleAiSave = () => {
    let finalConfigs = { ...tempAiConfigs };
    if (useSingleApiKey) {
      if (finalConfigs.engine01.provider === bulkKeyProvider) {
        finalConfigs.engine01.apiKey = singleApiKey;
      }
      if (finalConfigs.engine02.provider === bulkKeyProvider) {
        finalConfigs.engine02.apiKey = singleApiKey;
      }
      if (finalConfigs.engine03.provider === bulkKeyProvider) {
        finalConfigs.engine03.apiKey = singleApiKey;
      }
    }
    
    // Persist UI states to localStorage explicitly
    localStorage.setItem('useSingleApiKey', useSingleApiKey ? 'true' : 'false');
    localStorage.setItem('singleApiKey', singleApiKey);
    localStorage.setItem('bulkKeyProvider', bulkKeyProvider);

    setAiConfigs(finalConfigs);
    setAiChatbotEnabled(tempChatbotEnabled);
    setToastMsg(locale === 'ko' ? "삼원화 AI 엔진 설정 통합 저장 완료!" : "Three-Way AI Engine Configs Saved.");
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Save OLA Safety policy and variables
  const handleOlaSave = () => {
    setL1ToL2Minutes(tempL1ToL2);
    setTempRecoveryMinutes(tempRecMins);
    setPhiAutoMasking(tempPhi);
    setUnsavedOlaDetails(false);
    setToastMsg(locale === 'ko' ? "OLA 구성 및 보안 가드레일이 저장되었습니다." : "OLA Configurations and Security Guardrails Saved.");
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Save telemetry & locale connection config
  const handleTelemetrySave = () => {
    setLocale(tempLocale);
    setTelemetryIntegrations(tempTelemetry);
    setUnsavedTelemetry(false);
    
    // Multi-language translation completion toast
    let confirmText = "System environment & API integrations saved successfully.";
    if (tempLocale === 'ko') confirmText = "시스템 환경 및 외부 API 연동 설정이 성공적으로 저장되었습니다.";
    if (tempLocale === 'es') confirmText = "Entorno del sistema e integraciones de API guardadas.";

    setToastMsg(confirmText);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="flex-1 flex bg-white dark:bg-slate-950 h-full min-h-0 text-slate-900 dark:text-slate-100">
      {/* Settings Side Navigation */}
      <div className="w-[250px] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-2">
        <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-4">SETTINGS PANELS</div>
        
        {/* Settings Sub-tabs */}
        {[
          { id: 'ai', label: locale === 'ko' ? 'AI 서비스 설정' : 'AI Configuration', icon: Brain },
          { id: 'sla', label: locale === 'ko' ? 'SLA 정책 매트릭스' : 'SLA Policy Manager', icon: Clock },
          { id: 'ola', label: locale === 'ko' ? 'OLA 안전 마진' : 'OLA Safety Calculator', icon: Settings },
          { id: 'escalation', label: locale === 'ko' ? '에스컬레이션 템플릿' : 'Escalation Templates', icon: Save },
          { id: 'telemetry', label: locale === 'ko' ? '연동 상태 & 언어' : 'Connections & Locale', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full px-3 py-2 text-xs font-bold rounded flex items-center justify-between transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-950'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          );
        })}
      </div>

      {}
      <div className="flex-1 p-6 space-y-6 flex flex-col justify-between relative overflow-y-auto">
        {}
        {toastMsg && (
          <div className="absolute top-4 right-4 z-40 bg-emerald text-slate-950 px-4 py-2 rounded text-xs font-black tracking-tight shadow-none flex items-center space-x-2 animate-soft-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {}
          <div>
            <h2 className="text-lg font-black text-slate-100">{t.settings.title}</h2>
            <p className="text-[11px] text-slate-500">
              {locale === 'ko' ? '인프라 동작 정책 변수 및 B2B SLA/OLA 계약 매트릭스를 조율합니다.' : 'Configure global telemetry variables, translation packs, and OLA margin metrics.'}
            </p>
          </div>

          {}
          {activeTab === 'ai' && (
            <div className="relative space-y-6">
              {/* Admin Lock Overlay */}
              {!isAdminAuthenticated && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] rounded-xl z-20 flex flex-col items-center justify-center space-y-2 text-center p-4">
                  <Shield className="w-6 h-6 text-slate-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.hub.lockMsg}</span>
                  <button 
                    onClick={() => setCurrentTab('hub')}
                    className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-black uppercase"
                  >
                    Authorize Admin
                  </button>
                </div>
              )}

              {/* API Key Single Integration Toggle Panel */}
              <div className="bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-50 dark:bg-blue-950/40 text-amber-600 dark:text-blue-400 border border-amber-300 dark:border-blue-500/25 rounded-lg text-xs mt-0.5">🔑</div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {locale === 'ko' ? '3대 AI 엔진 API Key 단일 연동' : 'Single AI Engine API Key Integration'}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {locale === 'ko'
                          ? '스위치가 켜지면 3개 AI 엔진이 하나의 공통 API Key를 공유하고, 꺼지면 개별 카드로 분리되어 각각 별도 입력합니다.'
                          : 'When enabled, all 3 engines share one common API Key. When disabled, keys can be entered individually.'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-950 border border-slate-850 p-2 rounded-lg self-start md:self-auto min-w-[240px] justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">
                      {locale === 'ko' ? '단일 API Key 통합 사용:' : 'Use Single API Key:'}
                    </span>
                    
                    {/* Neumorphic style ON/OFF toggle - Forced contrast */}
                    <button
                      type="button"
                      disabled={!isAdminAuthenticated}
                      onClick={() => setUseSingleApiKey(!useSingleApiKey)}
                      className={`w-16 h-8 rounded-full p-1 transition-all relative focus:outline-none flex items-center border ${
                        useSingleApiKey 
                          ? 'bg-[#10b981] border-[#059669]' 
                          : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                      } ${!isAdminAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className={`absolute text-[9px] font-black tracking-wider transition-all select-none ${
                        useSingleApiKey 
                          ? 'left-2 text-slate-950 block' 
                          : 'right-2 text-slate-500 dark:text-slate-400 block'
                      }`}>
                        {useSingleApiKey ? 'ON' : 'OFF'}
                      </span>
                      <div 
                        className={`w-6 h-6 rounded-full border border-slate-350 shadow transform transition-transform ${
                          useSingleApiKey ? 'translate-x-8' : 'translate-x-0'
                        }`} 
                        style={{ backgroundColor: '#ffffff', opacity: 1 }}
                      />
                    </button>
                  </div>
                </div>

                {useSingleApiKey && (
                  <div className="pt-2.5 border-t border-slate-850/50 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">🔑 통합 키 대상 공급자 (Target Provider)</label>
                      <select
                        value={bulkKeyProvider}
                        disabled={!isAdminAuthenticated}
                        onChange={(e) => setBulkKeyProvider(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                      >
                        <option value="gemini">Google Gemini Key</option>
                        <option value="openai">OpenAI Key</option>
                        <option value="anthropic">Anthropic Claude Key</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">통합 공통 API Key</label>
                      <input
                        type="password"
                        placeholder={locale === 'ko' ? "공통 API Key 입력" : "Enter Common API Key"}
                        value={singleApiKey}
                        disabled={!isAdminAuthenticated}
                        onChange={(e) => setSingleApiKey(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono font-bold w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3-column AI Engine Configurations */}
              <div className={`grid grid-cols-1 xl:grid-cols-3 gap-5 ${useSingleApiKey ? 'hidden' : ''}`}>
                {/* Engine 01 */}
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
                  <div>
                    <div className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">ENGINE 01</div>
                    <h3 className="text-xs font-black text-slate-200 mt-1 flex items-center space-x-1.5">
                      <span>🏷️</span>
                      <span>{locale === 'ko' ? '티켓 자동 분류 엔진' : 'Ticket Classification Engine'}</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                      {locale === 'ko' 
                        ? '고객 문의 인입 즉시 감정(sentiment), 우선순위, 카테고리를 고속 식별/태깅합니다.' 
                        : 'Classifies sentiment, priority, and category instantly on ticket ingestion.'
                      }
                    </p>
                  </div>

                  {useSingleApiKey ? (
                    <div className="pt-3 border-t border-slate-850/50 space-y-2.5 text-[10px] text-slate-400">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">{locale === 'ko' ? 'API 공급자' : 'Provider'}</span>
                        <span className="font-mono text-slate-300 font-bold uppercase">{tempAiConfigs.engine01.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">{locale === 'ko' ? '기동 모델명' : 'Model Name'}</span>
                        <span className="font-mono text-slate-300 font-bold">{tempAiConfigs.engine01.model}</span>
                      </div>
                      <div className="p-2 bg-blue-950/20 border border-blue-900/30 rounded text-[9px] text-blue-400 font-bold text-center">
                        {tempAiConfigs.engine01.provider === bulkKeyProvider 
                          ? (locale === 'ko' ? '✓ 통합 API Key 자동 상속 연동 중' : '✓ Inheriting Shared API Key')
                          : (locale === 'ko' ? 'ℹ 개별 고유 API Key 작동 중 (미상속)' : 'ℹ Using Dedicated API Key')
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">API 공급자</label>
                        <select
                          value={tempAiConfigs.engine01.provider}
                          onChange={(e) => setTempAiConfigs(prev => ({
                            ...prev,
                            engine01: { ...prev.engine01, provider: e.target.value }
                          }))}
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                        >
                          <option value="gemini">Google Gemini 1.5 Flash (Default)</option>
                          <option value="openai">OpenAI GPT-4o-mini (Default)</option>
                          <option value="anthropic">Anthropic Claude 3.5 Haiku (Default)</option>
                          <option value="custom">Custom AI Engine Endpoint</option>
                        </select>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">API Key</label>
                        <input
                          type="password"
                          value={tempAiConfigs.engine01.apiKey}
                          disabled={!isAdminAuthenticated}
                          onChange={(e) => setTempAiConfigs(prev => ({
                            ...prev,
                            engine01: { ...prev.engine01, apiKey: e.target.value }
                          }))}
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">기동 모델명</label>
                        <input
                          type="text"
                          value={tempAiConfigs.engine01.model}
                          onChange={(e) => setTempAiConfigs(prev => ({
                            ...prev,
                            engine01: { ...prev.engine01, model: e.target.value }
                          }))}
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Engine 02 */}
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
                  <div>
                    <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">ENGINE 02</div>
                    <h3 className="text-xs font-black text-slate-200 mt-1 flex items-center space-x-1.5">
                      <span>✍️</span>
                      <span>{locale === 'ko' ? '답변 및 이관 초안 엔진' : 'Response & Draft Engine'}</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                      {locale === 'ko' 
                        ? 'SLA와 PHI 마스킹 정보들을 대조하여 상세 답안 및 Jira/Linear/GitHub 이관 템플릿을 생성합니다.' 
                        : 'Generates responses and OLA ticket escalation templates automatically.'
                      }
                    </p>
                  </div>

                  {useSingleApiKey ? (
                    <div className="pt-3 border-t border-slate-850/50 space-y-2.5 text-[10px] text-slate-400">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">{locale === 'ko' ? 'API 공급자' : 'Provider'}</span>
                        <span className="font-mono text-slate-300 font-bold uppercase">{tempAiConfigs.engine02.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">{locale === 'ko' ? '기동 모델명' : 'Model Name'}</span>
                        <span className="font-mono text-slate-300 font-bold">{tempAiConfigs.engine02.model}</span>
                      </div>
                      <div className="p-2 bg-blue-950/20 border border-blue-900/30 rounded text-[9px] text-blue-400 font-bold text-center">
                        {tempAiConfigs.engine02.provider === bulkKeyProvider 
                          ? (locale === 'ko' ? '✓ 통합 API Key 자동 상속 연동 중' : '✓ Inheriting Shared API Key')
                          : (locale === 'ko' ? 'ℹ 개별 고유 API Key 작동 중 (미상속)' : 'ℹ Using Dedicated API Key')
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">API 공급자</label>
                        <select
                          value={tempAiConfigs.engine02.provider}
                          onChange={(e) => setTempAiConfigs(prev => ({
                            ...prev,
                            engine02: { ...prev.engine02, provider: e.target.value }
                          }))}
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                        >
                          <option value="gemini">Google Gemini 1.5 Flash (Default)</option>
                          <option value="openai">OpenAI GPT-4o-mini (Default)</option>
                          <option value="anthropic">Anthropic Claude 3.5 Haiku (Default)</option>
                          <option value="custom">Custom AI Engine Endpoint</option>
                        </select>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">API Key</label>
                        <input
                          type="password"
                          value={tempAiConfigs.engine02.apiKey}
                          disabled={!isAdminAuthenticated}
                          onChange={(e) => setTempAiConfigs(prev => ({
                            ...prev,
                            engine02: { ...prev.engine02, apiKey: e.target.value }
                          }))}
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">기동 모델명</label>
                        <input
                          type="text"
                          value={tempAiConfigs.engine02.model}
                          onChange={(e) => setTempAiConfigs(prev => ({
                            ...prev,
                            engine02: { ...prev.engine02, model: e.target.value }
                          }))}
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Engine 03 */}
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
                  <div>
                    <div className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">ENGINE 03</div>
                    <h3 className="text-xs font-black text-slate-200 mt-1 flex items-center space-x-1.5">
                      <span>💬</span>
                      <span>{locale === 'ko' ? '플로팅 지원 챗봇 엔진' : 'Assistant Chatbot Engine'}</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                      {locale === 'ko' 
                        ? '고객 포털 우하단에서 대화 형태로 지원 문의에 실시간 응대하고 자동 해결을 시도합니다.' 
                        : 'Interacts with customers on portal to resolve incidents in real-time.'
                      }
                    </p>
                  </div>

                  {useSingleApiKey ? (
                    <div className="pt-3 border-t border-slate-850/50 space-y-2.5 text-[10px] text-slate-400">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">{locale === 'ko' ? 'API 공급자' : 'Provider'}</span>
                        <span className="font-mono text-slate-300 font-bold uppercase">{tempAiConfigs.engine03.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">{locale === 'ko' ? '기동 모델명' : 'Model Name'}</span>
                        <span className="font-mono text-slate-300 font-bold">{tempAiConfigs.engine03.model}</span>
                      </div>
                      <div className="p-2 bg-blue-950/20 border border-blue-900/30 rounded text-[9px] text-blue-400 font-bold text-center">
                        {tempAiConfigs.engine03.provider === bulkKeyProvider 
                          ? (locale === 'ko' ? '✓ 통합 API Key 자동 상속 연동 중' : '✓ Inheriting Shared API Key')
                          : (locale === 'ko' ? 'ℹ 개별 고유 API Key 작동 중 (미상속)' : 'ℹ Using Dedicated API Key')
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">API 공급자</label>
                        <select
                          value={tempAiConfigs.engine03.provider}
                          onChange={(e) => setTempAiConfigs(prev => ({
                            ...prev,
                            engine03: { ...prev.engine03, provider: e.target.value }
                          }))}
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                        >
                          <option value="gemini">Google Gemini 1.5 Flash (Default)</option>
                          <option value="openai">OpenAI GPT-4o-mini (Default)</option>
                          <option value="anthropic">Anthropic Claude 3.5 Haiku (Default)</option>
                          <option value="custom">Custom AI Engine Endpoint</option>
                        </select>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">API Key</label>
                        <input
                          type="password"
                          value={tempAiConfigs.engine03.apiKey}
                          disabled={!isAdminAuthenticated}
                          onChange={(e) => setTempAiConfigs(prev => ({
                            ...prev,
                            engine03: { ...prev.engine03, apiKey: e.target.value }
                          }))}
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">기동 모델명</label>
                        <input
                          type="text"
                          value={tempAiConfigs.engine03.model}
                          onChange={(e) => setTempAiConfigs(prev => ({
                            ...prev,
                            engine03: { ...prev.engine03, model: e.target.value }
                          }))}
                          className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RAG Knowledge Policy & Widget Switch Toggle */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-500/25 rounded-lg text-xs mt-0.5">🛡️</div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-200">
                      {locale === 'ko' ? 'RAG 지식 정합성 결합 정책 (FAQ & IT Runbook)' : 'RAG Knowledge Compliance Policy'}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      {locale === 'ko'
                        ? '설정된 모든 AI 엔진은 공통 Q&A 차트 데이터 및 운영 지침 컨텍스트들을 균일하게 조회 및 동기화합니다.'
                        : 'All configured AI engines retrieve and synchronize common Q&A and operational documents consistently.'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-slate-950 border border-slate-850 p-2 rounded-lg self-start md:self-auto min-w-[240px] justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">
                    {locale === 'ko' ? 'AI 채팅 위젯 활성화:' : 'Enable AI Chatbot:'}
                  </span>
                  
                  {/* Neumorphic style ON/OFF toggle - Forced contrast */}
                  <button
                    type="button"
                    onClick={() => setTempChatbotEnabled(!tempChatbotEnabled)}
                    className={`w-16 h-8 rounded-full p-1 transition-all relative focus:outline-none flex items-center border ${
                      tempChatbotEnabled 
                        ? 'bg-[#10b981] border-[#059669]' 
                        : 'bg-slate-200 dark:bg-slate-800 border-slate-350 dark:border-slate-700'
                    }`}
                  >
                    <span className={`absolute text-[9px] font-black tracking-wider transition-all select-none ${
                      tempChatbotEnabled 
                        ? 'left-2 text-slate-950 block' 
                        : 'right-2 text-slate-500 dark:text-slate-400 block'
                    }`}>
                      {tempChatbotEnabled ? 'ON' : 'OFF'}
                    </span>
                    <div 
                      className={`w-6 h-6 rounded-full border border-slate-350 shadow transform transition-transform ${
                        tempChatbotEnabled ? 'translate-x-8' : 'translate-x-0'
                      }`} 
                      style={{ backgroundColor: '#ffffff', opacity: 1 }}
                    />
                  </button>
                </div>
              </div>

              {/* Save Integrated Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleAiSave}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {locale === 'ko' ? '삼원화 AI 엔진 통합 설정 저장' : 'Save Integrated AI Configs'}
                  </span>
                </button>
              </div>

            </div>
          )}

          {}
          {activeTab === 'sla' && (
            <div className="space-y-6">
              {/* Upper Panel: Industry Preset Loader */}
              <div className="bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] text-amber-605 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                      <span>⚡</span>
                      <span>{locale === 'ko' ? '미국 ITIL & SaaS 산업 표준 SLA 프리셋' : 'US ITIL & SaaS Industry Standard SLA'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-500">
                      {locale === 'ko'
                        ? '글로벌 엔터프라이즈 업계에서 널리 권장되는 ITIL 및 SaaS 기준 규격 패키지를 테이블에 일괄 로드합니다.'
                        : 'Load industry-proven ITIL v4 and enterprise SaaS baseline packages into the configuration table.'
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadPreset('enterprise')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold text-center transition-colors whitespace-nowrap"
                  >
                    {locale === 'ko' ? '미국 ITIL/SaaS 산업 표준 권장값 불러오기' : 'Load US SaaS/ITIL Standard'}
                  </button>
                </div>

                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-850/50">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">
                    {locale === 'ko' ? '표준 권장 수치 산출 근거 및 가이드라인' : 'Standard Baseline Guidelines & Rationales'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-slate-600 dark:text-slate-500 leading-relaxed">
                    <div className="bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-850/40 p-2.5 rounded shadow-sm">
                      <span className="font-bold text-slate-800 dark:text-slate-300 block mb-1">VIP TIER</span>
                      {locale === 'ko'
                        ? 'ITIL v4 High Priority Incident 조치 규격 반영. 핵심 비즈니스 단절 방지를 위해 최초 응대 15분 및 최종 복구 1시간(60분) 제한 적용.'
                        : 'Aligned with ITIL v4 high priority incident response. Immediate response in 15m and full recovery within 1 hour (60m).'
                      }
                    </div>
                    <div className="bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-850/40 p-2.5 rounded shadow-sm">
                      <span className="font-bold text-slate-800 dark:text-slate-300 block mb-1">Premium TIER</span>
                      {locale === 'ko'
                        ? '엔터프라이즈 SaaS B2B Gold 등급 계약 기준. 일반적인 99.9% 가동율 SLA 약정 수준인 응대 30분, 최종 복구 2시간(120분) 보증.'
                        : 'Standard B2B Gold tier support package. Guarantees initial response in 30m and resolution target in 2 hours (120m).'
                      }
                    </div>
                    <div className="bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-850/40 p-2.5 rounded shadow-sm">
                      <span className="font-bold text-slate-800 dark:text-slate-300 block mb-1">Standard TIER</span>
                      {locale === 'ko'
                        ? '비-임계 및 일반 요건 지원 수준. 인프라 운영 영향도가 낮은 장애를 상정하여 응대 1~4시간 및 영업일 기준 1일 이내 해결 권장.'
                        : 'Best effort general support level. Designed for non-critical incidents with 1-4 hour response and next business day resolution.'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Panel: 2D Matrix Grid Table */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
                <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <span>📊</span>
                  <span>{locale === 'ko' ? 'B2B 고객 SLA 목표 임계점 정의' : 'B2B Client SLA Thresholds Definition'}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-[10px] text-slate-550 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">{locale === 'ko' ? '고객 등급 (TIER)' : 'Tier'}</th>
                        <th className="py-3 px-2">{locale === 'ko' ? '우선순위 (PRIORITY)' : 'Priority'}</th>
                        <th className="py-3 px-2">{locale === 'ko' ? '최초 응대 시간 (FRT)' : 'First Response (FRT)'}</th>
                        <th className="py-3 px-2">{locale === 'ko' ? '최종 해결 시간 (TRT)' : 'Resolution Time (TRT)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/30">
                      {tempSlaPolicies.map((row, idx) => {
                        const isUnsaved = unsavedSlaRows.includes(idx);
                        return (
                          <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                            <td className="py-3 px-2 text-xs font-black text-slate-200">{row.tier}</td>
                            <td className="py-3 px-2 text-xs text-slate-400 font-bold font-mono">{row.priority}</td>
                            
                            {/* FRT Input cell */}
                            <td className="py-3 px-2">
                              <div className="flex items-center space-x-2">
                                <div className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 flex items-center space-x-1.5 w-24">
                                  <input
                                    type="number"
                                    min={1}
                                    value={row.frt}
                                    onChange={(e) => handleSlaChange(idx, 'frt', e.target.value)}
                                    className="bg-transparent text-xs font-bold text-slate-250 focus:outline-none w-12 text-right"
                                  />
                                  <span className="text-[9px] text-slate-550 font-bold">{locale === 'ko' ? '분' : 'm'}</span>
                                </div>
                                {isUnsaved && (
                                  <span className="text-[8px] text-amber-500 font-bold animate-pulse uppercase">
                                    {t.settings.unsaved}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* TRT Input cell */}
                            <td className="py-3 px-2">
                              <div className="flex items-center space-x-2">
                                <div className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 flex items-center space-x-1.5 w-28">
                                  <input
                                    type="number"
                                    min={1}
                                    value={row.trt}
                                    onChange={(e) => handleSlaChange(idx, 'trt', e.target.value)}
                                    className="bg-transparent text-xs font-bold text-slate-250 focus:outline-none w-16 text-right"
                                  />
                                  <span className="text-[9px] text-slate-550 font-bold">{locale === 'ko' ? '분' : 'm'}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSlaSave}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t.settings.saveBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ola' && (
            <div className="space-y-6">
              {/* Layout: 2-column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                
                {/* Left Panel: SLA-OLA Guardrail Alert & Formula */}
                <div className="bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl p-5 space-y-4">
                  <div className="text-[10px] text-emerald-650 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                    <span>🛡️</span>
                    <span>{locale === 'ko' ? 'SLA-OLA 가드레일 안전 수식 검증' : 'SLA-OLA Guardrail Verification'}</span>
                  </div>
                  
                  {(() => {
                    const vipP1SlaLimit = slaPolicies.find(p => p.tier === 'VIP' && p.priority === 'P1')?.trt || 60;
                    const sumMinutes = tempL1ToL2 + tempRecMins;
                    const isValid = sumMinutes <= vipP1SlaLimit;
                    return (
                      <div className="space-y-3.5">
                        <div className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/60 p-4 rounded border border-slate-200 dark:border-slate-850">
                          {locale === 'ko' ? (
                            <>
                              사내 내부 이관 시간과 복구 시간의 합은 현재 최종 B2B 고객사 <span className="font-bold text-amber-950 bg-amber-100/50 px-1 rounded dark:text-amber-400 dark:bg-transparent">VIP P1 등급 티켓 해결 시간 목표치({vipP1SlaLimit}분)</span>를 절대로 초과할 수 없습니다.
                            </>
                          ) : (
                            <>
                              The sum of internal L1➔L2 transfer and recovery time must not exceed the B2B client <span className="font-bold text-amber-950 bg-amber-100/50 px-1 rounded dark:text-amber-400 dark:bg-transparent">VIP P1 SLA Resolution Target ({vipP1SlaLimit}m)</span>.
                            </>
                          )}
                        </div>

                        {/* Visual Status Indicator */}
                        <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
                          isValid 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/25 text-emerald-800 dark:text-emerald-400' 
                            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-500/25 text-red-950 dark:text-red-400 animate-pulse'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span>{isValid ? '✓' : '⚠️'}</span>
                            <span className="font-bold">
                              {isValid 
                                ? (locale === 'ko' ? '안전 공식 검증 통과 (합격)' : 'Guardrail Constraint Passed') 
                                : (locale === 'ko' ? '검증 공식 불합격 (초과 위반)' : 'SLA Threshold Exceeded')
                              }
                            </span>
                          </div>
                          <span className="font-mono font-bold text-[10px]">
                            {tempL1ToL2}m + {tempRecMins}m = {sumMinutes}m / {vipP1SlaLimit}m
                          </span>
                        </div>

                        {/* Formula Display Callout */}
                        <div className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 p-3 rounded text-[10px] text-slate-700 dark:text-slate-400 flex items-center space-x-2">
                          <span className="text-blue-650 dark:text-blue-400 font-bold">ℹ</span>
                          <span>
                            {locale === 'ko'
                              ? `검증 공식: [L1➔L2 이관 시간] + [임시 복구 시간] ≤ [VIP P1 SLA 해결 한도]`
                              : `Formula: [L1➔L2 Transfer] + [Temp Recovery] ≤ [VIP P1 SLA Limit]`
                            }
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Right Panel: OLA Inputs & PHI Toggle */}
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
                  <div className="space-y-4">
                    {/* Input 1 */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">
                        {locale === 'ko' ? 'L1 ➔ L2 내부 이관 목표 제한 시간 (분)' : 'L1 ➔ L2 Internal Transfer Target (Mins)'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={tempL1ToL2}
                        onChange={(e) => {
                          setTempL1ToL2(Math.max(1, parseInt(e.target.value) || 0));
                          setUnsavedOlaDetails(true);
                        }}
                        className="bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono font-bold"
                      />
                    </div>

                    {/* Input 2 */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">
                        {locale === 'ko' ? '임시 복구 조치 목표 제한 시간 (분)' : 'Temporary Recovery Action Target (Mins)'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={tempRecMins}
                        onChange={(e) => {
                          setTempRecMins(Math.max(1, parseInt(e.target.value) || 0));
                          setUnsavedOlaDetails(true);
                        }}
                        className="bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono font-bold"
                      />
                    </div>

                    {/* PHI Toggle Switch */}
                    <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-850 rounded-lg">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-350 font-bold block">
                          {locale === 'ko' ? '환자 건강 정보(PHI) 자동 마스킹' : 'Protected Health Information (PHI) Masking'}
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          {locale === 'ko' ? 'SLA 모니터링 시 PHI 정보 비식별화 필터 적용' : 'Apply PHI de-identification filter on SLA monitoring'}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setTempPhi(!tempPhi);
                          setUnsavedOlaDetails(true);
                        }}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors relative focus:outline-none ${
                          tempPhi ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform ${
                          tempPhi ? 'translate-x-4.5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleOlaSave}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-black uppercase rounded text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>✓</span>
                      <span>
                        {locale === 'ko' ? 'OLA 구성 및 보안 가드레일 저장' : 'Save OLA & Security Guardrails'}
                      </span>
                      {unsavedOlaDetails && (
                        <span className="ml-1 text-[8px] bg-slate-950 text-amber-500 px-1 py-0.5 rounded font-bold animate-pulse">
                          {locale === 'ko' ? '* 미저장' : '* UNSAVED'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Global L2 Escalation Target Settings */}
              <div className="relative bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
                {!isAdminAuthenticated && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] rounded-xl z-20 flex flex-col items-center justify-center space-y-2 text-center p-4">
                    <Shield className="w-6 h-6 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.hub.lockMsg}</span>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 font-bold uppercase">Global L2 Escalation Target Settings</div>
                <p className="text-[11px] text-slate-500">
                  {locale === 'ko'
                    ? '플랫폼 사용사의 전역 OLA L2 엔지니어링 대응 부서 목록 및 기본 해결 마감 시간(분 단위)을 설정합니다.'
                    : 'Configure global OLA L2 engineering support teams and default resolution target limits in minutes.'
                  }
                </p>

                <div className="flex flex-col space-y-4 pt-1">
                  <div className="space-y-2.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Configure OLA L2 Teams ({tempL2Configs.length})</label>
                    
                    {tempL2Configs.length === 0 ? (
                      <div className="text-center py-4 bg-slate-950 border border-slate-850 rounded text-xs text-slate-550">
                        {locale === 'ko' ? '등록된 L2 팀이 없습니다.' : 'No L2 teams configured.'}
                      </div>
                    ) : (
                      <div className="space-y-2 max-w-xl">
                        {tempL2Configs.map((team, idx) => (
                          <div key={idx} className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded w-full max-w-md">
                            <div className="flex-1 flex flex-col space-y-1">
                              <label className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">L2 Team Name</label>
                              <input
                                type="text"
                                value={team.name}
                                onChange={(e) => handleEditL2Name(idx, e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                              />
                            </div>
                            <div className="flex flex-col space-y-1 w-24">
                              <label className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">Ticket System</label>
                              <select
                                value={team.ticketSystem || 'jira'}
                                onChange={(e) => handleEditL2TicketSystem(idx, e.target.value as any)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                              >
                                <option value="jira">Jira</option>
                                <option value="github">GitHub</option>
                                <option value="custom">Custom</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveL2Team(idx)}
                              className="px-2 py-1.5 mt-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400 rounded text-[10px] font-black uppercase transition-colors focus:outline-none"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 max-w-xl">
                    <button
                      type="button"
                      onClick={handleAddL2Team}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded text-xs font-bold transition-colors"
                    >
                      + Add L2 Team
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveL2Teams}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{locale === 'ko' ? '글로벌 L2 부서 저장' : 'Save Global L2 Teams'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'escalation' && (
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Escalation Dispatch templates</div>
              
              <div className="flex flex-col space-y-1.5 max-w-sm">
                <label className="text-[10px] text-slate-400 font-bold">Target L2 Team</label>
                <select
                  value={selectedTemplateTeam}
                  onChange={(e) => {
                    setSelectedTemplateTeam(e.target.value);
                  }}
                  className="bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                >
                  <option value="">-- Select L2 Team --</option>
                  {globalL2Teams.map(team => (
                    <option key={team.name} value={team.name}>{team.name} ({(team.ticketSystem || 'jira').toUpperCase()})</option>
                  ))}
                </select>
              </div>

              {selectedTemplateTeam ? (
                <div className="space-y-2.5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400 font-bold">
                        {selectedTemplateTeam} Escalation Markdown Template
                      </label>
                      <span className="text-[8px] bg-slate-950 text-slate-500 px-1 py-0.5 rounded font-mono font-bold">
                        Supports: {"{TICKET_ID}"}, {"{ACCOUNT_NAME}"}, {"{SUBJECT}"}, {"{SLA_TIMER}"}, {"{CUSTOMER_EMAIL}"}, {"{SENTIMENT}"}, {"{INCIDENT_DESCRIPTION}"}
                      </span>
                    </div>
                    <textarea
                      value={tempTemplates[selectedTemplateTeam] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTempTemplates(prev => ({
                          ...prev,
                          [selectedTemplateTeam]: val
                        }));
                        setUnsavedTemplate(true);
                      }}
                      className="w-full h-48 bg-slate-950 border border-slate-850 rounded p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                      placeholder="Enter markdown escalation template..."
                    />
                    {unsavedTemplate && <p className="text-[9px] text-amberOrange-dark animate-pulse">{t.settings.unsaved}</p>}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        const currentVal = tempTemplates[selectedTemplateTeam] || '';
                        const updatedTeams = globalL2Teams.map(t => {
                          if (t.name === selectedTemplateTeam) {
                            return { ...t, template: currentVal };
                          }
                          return t;
                        });
                        setGlobalL2Teams(updatedTeams);
                        setUnsavedTemplate(false);
                        setToastMsg(locale === 'ko' ? `${selectedTemplateTeam} 템플릿 저장 완료!` : `${selectedTemplateTeam} Template updated.`);
                        setTimeout(() => setToastMsg(''), 2500);
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{locale === 'ko' ? '템플릿 저장' : 'Save Template'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-950 border border-slate-850 rounded text-xs text-slate-500 font-bold">
                  {locale === 'ko' ? '템플릿을 편집할 L2 팀을 상단에서 선택하십시오.' : 'Please select an L2 team to edit its template.'}
                </div>
              )}
            </div>
          )}

          {}
          {activeTab === 'telemetry' && (
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-5">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Locale & Telemetry connections</div>
              
              {/* Alert Mock */}
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-500/30 rounded-xl text-red-950 dark:text-coral text-xs font-black uppercase animate-soft-pulse">
                {t.settings.alertMock}
              </div>

              {/* Language Selector */}
              <div className="flex flex-col space-y-1.5 max-w-sm">
                <label className="text-[10px] text-slate-400 font-bold">{t.settings.langLabel}</label>
                <div className="flex items-center space-x-3">
                  <select
                    value={tempLocale}
                    onChange={(e) => { setTempLocale(e.target.value as Locale); setUnsavedTelemetry(true); }}
                    className="bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 flex-1"
                  >
                    <option value="en">English (Default)</option>
                    <option value="ko">한국어 (Korean)</option>
                    <option value="es">Español (Spanish)</option>
                  </select>
                  {unsavedTelemetry && <span className="text-[9px] text-amber-500 animate-pulse">{t.settings.unsaved}</span>}
                </div>
              </div>

              <div className="border-t border-slate-850 my-4" />

              {/* @graphify REQ_TELEMETRY_API_INTEGRATIONS */}
              {/* Webhooks & APIs Integrations Section */}
              <div className="space-y-4">
                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                  {locale === 'ko' ? "🔌 외부 API & 웹훅 실시간 연동 (API Integrations)" : "🔌 External API & Webhooks Integrations"}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Jira Integration Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-250">Jira Integration</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempTelemetry(prev => ({ ...prev, jiraEnabled: !prev.jiraEnabled }));
                          setUnsavedTelemetry(true);
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none border ${
                          tempTelemetry.jiraEnabled 
                            ? 'bg-blue-600 border-blue-700' 
                            : 'bg-slate-200 border-slate-350 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md border border-slate-300 dark:border-transparent transform transition-transform ${
                          tempTelemetry.jiraEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    {tempTelemetry.jiraEnabled && (
                      <div className="space-y-2.5 pt-1 animate-fade-in">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-slate-400 font-bold">Jira Webhook URL</label>
                          <input
                            type="text"
                            value={tempTelemetry.jiraWebhookUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempTelemetry(prev => ({ ...prev, jiraWebhookUrl: val }));
                              setUnsavedTelemetry(true);
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-slate-400 font-bold">Jira API Token</label>
                          <input
                            type="password"
                            placeholder="Enter Token..."
                            value={tempTelemetry.jiraToken}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempTelemetry(prev => ({ ...prev, jiraToken: val }));
                              setUnsavedTelemetry(true);
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GitHub Integration Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-250">GitHub Integration</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempTelemetry(prev => ({ ...prev, githubEnabled: !prev.githubEnabled }));
                          setUnsavedTelemetry(true);
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none border ${
                          tempTelemetry.githubEnabled 
                            ? 'bg-purple-600 border-purple-700' 
                            : 'bg-slate-200 border-slate-350 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md border border-slate-300 dark:border-transparent transform transition-transform ${
                          tempTelemetry.githubEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    {tempTelemetry.githubEnabled && (
                      <div className="space-y-2.5 pt-1 animate-fade-in">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-slate-400 font-bold">GitHub Repository Webhook URL</label>
                          <input
                            type="text"
                            value={tempTelemetry.githubWebhookUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempTelemetry(prev => ({ ...prev, githubWebhookUrl: val }));
                              setUnsavedTelemetry(true);
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-slate-400 font-bold">Personal Access Token (PAT)</label>
                          <input
                            type="password"
                            placeholder="Enter PAT..."
                            value={tempTelemetry.githubToken}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempTelemetry(prev => ({ ...prev, githubToken: val }));
                              setUnsavedTelemetry(true);
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom Webhook Integration Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-250">Custom Webhook</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempTelemetry(prev => ({ ...prev, customEnabled: !prev.customEnabled }));
                          setUnsavedTelemetry(true);
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none border ${
                          tempTelemetry.customEnabled 
                            ? 'bg-emerald-600 border-emerald-700' 
                            : 'bg-slate-200 border-slate-350 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md border border-slate-300 dark:border-transparent transform transition-transform ${
                          tempTelemetry.customEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    {tempTelemetry.customEnabled && (
                      <div className="space-y-2.5 pt-1 animate-fade-in">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-slate-400 font-bold">Custom Webhook Endpoint URL</label>
                          <input
                            type="text"
                            value={tempTelemetry.customWebhookUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempTelemetry(prev => ({ ...prev, customWebhookUrl: val }));
                              setUnsavedTelemetry(true);
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-slate-400 font-bold">Authorization Bearer Token</label>
                          <input
                            type="password"
                            placeholder="Enter Bearer Token..."
                            value={tempTelemetry.customToken}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempTelemetry(prev => ({ ...prev, customToken: val }));
                              setUnsavedTelemetry(true);
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Save */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleTelemetrySave}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{locale === 'ko' ? "연동 정보 및 언어 저장" : t.settings.saveBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
