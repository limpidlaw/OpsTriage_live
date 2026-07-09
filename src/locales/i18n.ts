export type Locale = 'en' | 'ko' | 'es';

export const translations = {
  en: {
    nav: {
      hub: "Home Hub",
      sla: "SLA Dashboard",
      console: "Agent Console",
      runbooks: "IT Runbooks",
      settings: "Settings"
    },
    hub: {
      lockMsg: "Admin PIN Authentication Required",
      activeBadge: "Simulator Active",
      authBtn: "Authorize Admin",
      title: "CX Operations Hub Workspace"
    },
    sla: {
      title: "SLA Compliance Dashboard",
      timerLabel: "SLA Deadline Countdown",
      chartLabel: "B2B Accounts Health Index",
      injectBtn: "Inject Simulated Ticket",
      breachLabel: "SLA Breached Time Elapsed",
      loading: "Refreshing Recharts..."
    },
    console: {
      title: "Omnichannel Agent Workspace",
      revealPii: "Reveal Original PII",
      revealReason: "Input PII Access Justification",
      submitReason: "Confirm Audit Logging",
      maskAlert: "[HIPAA WARNING] PII access logged permanently.",
      sending: "Sending...",
      delivered: "Delivered",
      failed: "Failed: Invalid Number",
      outboundTitle: "AI Response Co-pilot Editor"
    },
    runbooks: {
      title: "IT Runbooks & Incident Response",
      olaTimer: "OLA Target Timer (Escalation Safe)",
      statusDone: "Jira Webhook: Done",
      task1Title: "Execute DB connection pool amplification script",
      task1System: "Verified: [System manual recovery batch shell completed]",
      task2Title: "Update Jira incident ticket status (Jira Webhook)",
      task2Wait: "Awaiting confirmation (Awaiting Jira API Hook...)",
      task3Title: "Merge GitHub hotfix release pull request (GitHub Webhook)",
      task3Wait: "Awaiting confirmation (Awaiting GitHub API Hook...)",
      task3System: "Verified: [GitHub Webhook: Done]"
    },
    settings: {
      title: "System Environment Settings",
      saveBtn: "Save Configurations",
      langLabel: "Global System Language",
      presetBtn: "Load US Industry Presets",
      unsaved: "* Unsaved",
      alertMock: "ALERT: Local Mock DB Mode Active (In-Memory Singleton)"
    }
  },
  ko: {
    nav: {
      hub: "메인 메뉴 허브",
      sla: "SLA 관제 대시보드",
      console: "상담원 콘솔",
      runbooks: "IT 인시던트 대응",
      settings: "시스템 환경 설정"
    },
    hub: {
      lockMsg: "최고관리자 PIN 인증 필요",
      activeBadge: "시뮬레이터 활성",
      authBtn: "관리자 인증",
      title: "CX 운영 허브 워크스페이스"
    },
    sla: {
      title: "SLA 준수 & B2B 헬스 관제",
      timerLabel: "SLA 실시간 해결 기한",
      chartLabel: "B2B 고객사 헬스 인덱스",
      injectBtn: "가상 티켓 주입 API 실행",
      breachLabel: "SLA 시간 초과 초과 경과",
      loading: "차트 리프레시 중..."
    },
    console: {
      title: "상담원 옴니채널 워크스페이스",
      revealPii: "PII 원본 정보 조회",
      revealReason: "개인식별정보(PII) 조회 사유 소명",
      submitReason: "감사 로그 승인",
      maskAlert: "[HIPAA WARNING] 개인식별정보(PII) 조회가 감사 로그에 영구 기록 중입니다.",
      sending: "발송 중...",
      delivered: "성공: 전송 완료",
      failed: "실패: 수신자 번호 오류",
      outboundTitle: "AI Co-pilot 답변 추천 에디터"
    },
    runbooks: {
      title: "IT 인시던트 긴급 대응 플레이북",
      olaTimer: "OLA 엔지니어링 이관 목표 타이머",
      statusDone: "Jira Webhook: Done",
      task1Title: "DB 연결 대기 풀 증폭 스크립트 실행",
      task1System: "확인자: [시스템 수동 복구 배치 쉘 완료]",
      task2Title: "Jira 장애 관리 티켓 상태 업데이트 (Jira Webhook)",
      task2Wait: "확인 대기 중 (Jira API Hook 수신 대기)",
      task3Title: "GitHub 핫픽스 릴리즈 풀 리퀘스트 머지 (GitHub Webhook)",
      task3Wait: "확인 대기 중 (GitHub API Hook 수신 대기)",
      task3System: "확인자: [GitHub Webhook: Done]"
    },
    settings: {
      title: "시스템 환경 및 인프라 정책 설정",
      saveBtn: "시스템 환경 설정 저장",
      langLabel: "전역 시스템 언어 설정 (Language)",
      presetBtn: "미국 산업 표준 기본값 불러오기",
      unsaved: "* 미저장",
      alertMock: "ALERT: Local Mock DB Mode Active (인메모리 싱글톤 기동 중)"
    }
  },
  es: {
    nav: {
      hub: "Centro Principal",
      sla: "Panel de SLA",
      console: "Consola de Agente",
      runbooks: "Libro de IT",
      settings: "Configuración"
    },
    hub: {
      lockMsg: "Se requiere autenticación PIN de administrador",
      activeBadge: "Simulador Activo",
      authBtn: "Autorizar Administrador",
      title: "Espacio de Trabajo del Centro de Operaciones"
    },
    sla: {
      title: "Panel de Cumplimiento de SLA",
      timerLabel: "Cuenta Regresiva de SLA",
      chartLabel: "Índice de Salud de Cuentas B2B",
      injectBtn: "Inyectar Boleto Simulado",
      breachLabel: "Tiempo Transcurrido de SLA Incumplido",
      loading: "Actualizando Recharts..."
    },
    console: {
      title: "Espacio de Trabajo de Agente Omnicanal",
      revealPii: "Revelar PII Original",
      revealReason: "Justificación de acceso a PII",
      submitReason: "Confirmar registro de auditoría",
      maskAlert: "[HIPAA WARNING] El acceso a PII se registra permanentemente.",
      sending: "Enviando...",
      delivered: "Entregado",
      failed: "Error: Número no válido",
      outboundTitle: "Editor de AI Co-pilot"
    },
    runbooks: {
      title: "Libro de IT y Respuesta a Incidentes",
      olaTimer: "Temporizador OLA (Seguridad de Escalada)",
      statusDone: "Jira Webhook: Hecho",
      task1Title: "Ejecutar script de amplificación de grupo de conexiones de DB",
      task1System: "Verificado: [Shell de lote de recuperación manual del sistema completado]",
      task2Title: "Actualizar estado del ticket de incidente de Jira (Jira Webhook)",
      task2Wait: "Esperando confirmación (Esperando Jira API Hook...)",
      task3Title: "Fusionar solicitud de extracción de GitHub hotfix (GitHub Webhook)",
      task3Wait: "Esperando confirmación (Esperando GitHub API Hook...)",
      task3System: "Verificado: [GitHub Webhook: Done]"
    },
    settings: {
      title: "Configuración del Entorno del Sistema",
      saveBtn: "Guardar Configuración",
      langLabel: "Idioma Global del Sistema",
      presetBtn: "Cargar valores predeterminados de EE.UU.",
      unsaved: "* Sin Guardar",
      alertMock: "ALERT: Local Mock DB Mode Active (Base de datos en memoria activa)"
    }
  }
};
