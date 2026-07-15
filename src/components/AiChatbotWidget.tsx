import React, { useState, useEffect } from 'react';
import { Send, Maximize2, Minimize2, Sparkles, MessageSquare } from 'lucide-react';
import { Locale } from '../locales/i18n';

interface ChatbotProps {
  currentTab: string;
  aiModelName: string;
  locale: Locale;
}

export const AiChatbotWidget: React.FC<ChatbotProps> = ({ currentTab, aiModelName, locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scrolling ref
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Context-aware badge and quick buttons
  const getContextInfo = () => {
    switch (currentTab) {
      case 'sla':
        return {
          badge: locale === 'ko' ? "B2B 헬스 관제 코파일럿" : locale === 'es' ? "Asistente de Salud B2B" : "B2B Health Assistant Mode",
          questions: locale === 'ko' 
            ? ["VIP 고객사 헬스 하락 리스크 요약해 줘", "SLA 만료 발생 이력 원인 분석해 줘"]
            : locale === 'es'
              ? ["Resumir riesgo de caída de salud VIP", "Analizar causa de vencimiento de SLA"]
              : ["Summarize VIP clients health drop risks", "Analyze SLA breach history reasons"]
        };
      case 'console':
        return {
          badge: locale === 'ko' ? "상담원 답변 코파일럿" : locale === 'es' ? "Co-pilot de Consola de Agente" : "Agent Console Co-pilot",
          questions: locale === 'ko'
            ? ["답변 초안 작성 보안 규칙 안내해 줘", "감사 로그 수동 조회 소명 방법 보여줘"]
            : locale === 'es'
              ? ["Guía de seguridad para borradores", "Cómo justificar consulta de logs de auditoría"]
              : ["Security rules for drafting responses", "How to justify audit log manual query"]
        };
      case 'runbooks':
        return {
          badge: locale === 'ko' ? "IT 인시던트 가이드 모드" : locale === 'es' ? "Guía de Incidentes de IT" : "IT Incident Guide Mode",
          questions: locale === 'ko'
            ? ["DB 커넥션 풀 고갈 장애 스텝 분석해 줘", "Jira 웹훅 수동 트리거 매뉴얼 보여줘"]
            : locale === 'es'
              ? ["Analizar falla de agotamiento de DB pool", "Guía para disparador manual de Jira webhook"]
              : ["Analyze DB pool exhaustion failure steps", "Show manual Jira webhook trigger guide"]
        };
      case 'settings':
        return {
          badge: locale === 'ko' ? "인프라 정책 관리자 모드" : locale === 'es' ? "Gestor de Políticas de Infraestructura" : "Infrastructure Policy Manager",
          questions: locale === 'ko'
            ? ["SLA/OLA 미국 표준 템플릿 임계치 기준 설명해 줘", "OLA 안전 마진 수식 계산법 요약해 줘"]
            : locale === 'es'
              ? ["Límites estándar de EE.UU. SLA/OLA", "Resumir cálculo de margen de seguridad OLA"]
              : ["Explain US standard SLA/OLA template limits", "Summarize OLA safety margin calculation"]
        };
      default:
        return {
          badge: locale === 'ko' ? "통합 어드바이저 모드" : locale === 'es' ? "Modo de Asesor Global" : "Global Advisor Mode",
          questions: locale === 'ko'
            ? ["OpsTriage 플랫폼 전체 아키텍처 요약해 줘", "최고관리자 PIN 락다운 해제 규칙 안내해 줘"]
            : locale === 'es'
              ? ["Resumen de arquitectura global OpsTriage", "Guía de desbloqueo de PIN de administrador"]
              : ["Summarize OpsTriage global architecture", "Show administrator PIN bypass rules"]
        };
    }
  };

  const context = getContextInfo();

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsTyping(true);

    // Simulate 0.9s thinking indicator and typing effect
    setTimeout(() => {
      setIsTyping(false);
      let reply = "";
      const isHealth = text.includes("헬스") || text.includes("health") || text.includes("salud");
      const isSec = text.includes("보안") || text.includes("감사") || text.includes("security") || text.includes("audit") || text.includes("seguridad");
      const isOla = text.includes("OLA") || text.includes("수식") || text.includes("formula") || text.includes("margen");

      if (isHealth) {
        reply = locale === 'ko' 
          ? "Stark Industries의 DB OLA 브리치로 인해 헬스 스코어가 하락 중이었으나, Jira 및 GitHub 런북 복구 웹훅 처리를 성공하여 87점(Good)으로 상향 연동 복구되었습니다."
          : locale === 'es'
            ? "La salud de Stark Industries bajaba por brecha de OLA, pero se recuperó a 87 (Bueno) tras ejecutar webhooks en Jira y GitHub."
            : "Stark Industries health was dropping due to OLA breach, but restored to 87 (Good) after executing Jira and GitHub webhooks.";
      } else if (isSec) {
        reply = locale === 'ko'
          ? "상담원 콘솔 내 PII 정보는 API 단에서 원천 배제되어 암호화 마스킹됩니다. [PII 원본 보기] 클릭 시 5자 이상의 소명 사유가 pii_audit_logs DB에 영구 기록됩니다."
          : locale === 'es'
            ? "Los datos PII en consola están enmascarados. Revelar PII registra permanentemente la justificación en pii_audit_logs."
            : "PII data in console is masked. Revealing PII logs access justification in pii_audit_logs permanently.";
      } else if (isOla) {
        reply = locale === 'ko'
          ? "OLA 임계 기준은 OLA Target = SLA Target * Safety Factor(예: 0.8 안전마진) 공식을 준수하며, 설정 콘솔 탭 3에서 OLA 마진 저장을 통해 런북 타이머에 실시간 주입됩니다."
          : locale === 'es'
            ? "El objetivo de OLA = SLA * Factor de seguridad (ej. 0.8 de margen). Se configura en Ajustes y se actualiza en tiempo real."
            : "OLA Target = SLA * Safety Factor (e.g., 0.8 margin formula). Configured in Settings and dynamically injected into timers.";
      } else {
        reply = locale === 'ko'
          ? `요청하신 '${text}'에 대한 Co-pilot 지침 가이드라인을 백엔드 ${aiModelName} 모델 인프라 구조상에서 정상 탐색 완료했습니다. 3개 국어(en/ko/es) 팽창 레이아웃 가드를 가동 중입니다.`
          : locale === 'es'
            ? `He encontrado la guía Co-pilot para '${text}' usando el modelo ${aiModelName}. Soporte multiidioma (en/ko/es) activo.`
            : `Found Co-pilot guidelines for '${text}' using ${aiModelName} backend. Active multi-language (en/ko/es) expansion guard.`;
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 900);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out flex flex-col ${
      isOpen 
        ? `${isExpanded ? 'w-[650px]' : 'w-[380px]'} h-[580px] bg-slate-900 dark:bg-slate-900 border border-slate-700/50 rounded-xl shadow-none` 
        : 'w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 items-center justify-center cursor-pointer'
    }`}
    onClick={() => { if(!isOpen) setIsOpen(true); }}
    >
      {!isOpen ? (
        <div className="w-full h-full flex items-center justify-center text-white">
          <MessageSquare className="w-5 h-5 animate-pulse" />
        </div>
      ) : (
        <div className="flex flex-col h-full text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/40 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <div className="text-sm font-black tracking-tight">AI Co-pilot</div>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                {aiModelName}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                title="Expand width"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsExpanded(false); }}
                className="text-xs text-slate-400 hover:text-slate-200 px-1"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Context Badge */}
          <div className="bg-slate-950/60 px-3 py-1.5 text-[10px] text-blue-300 font-black border-b border-slate-800 flex justify-between items-center">
            <span>{context.badge}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-900/90">
            {messages.length === 0 && (
              <div className="text-xs text-slate-300 text-center py-8 font-bold leading-relaxed">
                현재 페이지 컨텍스트에 맞춰 최적화되었습니다. <br />아래 퀵 버튼을 눌러보세요.
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded px-3 py-2 text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none font-bold' 
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/30 font-bold'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-850 text-slate-300 rounded-bl-none text-[11px] italic px-3 py-2 font-bold">
                  {locale === 'ko' ? "Co-pilot 생각 중..." : locale === 'es' ? "Co-pilot pensando..." : "Co-pilot thinking..."}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="p-2 bg-slate-950/30 border-t border-slate-800 space-y-1.5">
            <div className="text-[10px] text-slate-400 font-black px-1">
              {locale === 'ko' ? '추천 질문 가이드:' : locale === 'es' ? 'Guía de preguntas recomendadas:' : 'Suggested Questions:'}
            </div>
            <div className="flex flex-wrap gap-1">
              {context.questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); handleSend(q); }}
                  className="text-[10px] bg-slate-800 hover:bg-slate-750 text-blue-200 hover:text-blue-100 px-2 py-1 rounded border border-slate-750/50 text-left transition-colors font-bold"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/20 rounded-b-xl flex items-center space-x-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(inputText); }}
              placeholder={locale === 'ko' ? '질문을 입력하세요...' : locale === 'es' ? 'Escribe tu pregunta aquí...' : 'Enter your question...'}
              className="flex-1 bg-slate-800 border border-slate-750 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSend(inputText)}
              className="p-1.5 bg-blue-600 hover:bg-blue-750 rounded text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
