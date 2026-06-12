/* ── DOM references ─────────────────────────────────────── */
const el = {
  // Nav
  navTabs:            document.querySelectorAll('.nav-tab'),
  // Views
  viewAnalise:        document.getElementById('viewAnalise'),
  viewPerformance:    document.getElementById('viewPerformance'),
  viewEquipe:         document.getElementById('viewEquipe'),
  // Form
  form:               document.getElementById('analyzeForm'),
  responsavelSelect:  document.getElementById('responsavelSelect'),
  responsavelLabel:   document.getElementById('responsavelLabel'),
  btnAddCloser:       document.getElementById('btnAddCloser'),
  newCloserRow:       document.getElementById('newCloserRow'),
  newCloserNome:      document.getElementById('newCloserNome'),
  btnCriarCloser:     document.getElementById('btnCriarCloser'),
  cliente:            document.getElementById('cliente'),
  transcricao:        document.getElementById('transcricao'),
  submitBtn:          document.getElementById('submitBtn'),
  submitText:         document.getElementById('submitText'),
  formTitle:          document.getElementById('formTitle'),
  formSubtitle:       document.getElementById('formSubtitle'),
  transcricaoLabel:   document.getElementById('transcricaoLabel'),
  // Panels
  emptyResultsCard:   document.getElementById('emptyResultsCard'),
  loadingResultsCard: document.getElementById('loadingResultsCard'),
  resultsArea:        document.getElementById('resultsArea'),
  // History
  historyList:        document.getElementById('historyList'),
  historyCountLabel:  document.getElementById('historyCountLabel'),
  historyPagination:  document.getElementById('historyPagination'),
  btnLoadMore:        document.getElementById('btnLoadMore'),
  // Results
  scoreNum:           document.getElementById('scoreNum'),
  scoreCircle:        document.getElementById('scoreCircle'),
  classificationPill: document.getElementById('classificationPill'),
  resultTipoBadge:    document.getElementById('resultTipoBadge'),
  responsavelDisplay: document.getElementById('responsavelDisplay'),
  clienteDisplay:     document.getElementById('clienteDisplay'),
  clienteMetaItem:    document.getElementById('clienteMetaItem'),
  servicoMetaItem:    document.getElementById('servicoMetaItem'),
  notasCard:          document.getElementById('notasCard'),
  notasList:          document.getElementById('notasList'),
  metricasCard:       document.getElementById('metricasCard'),
  metricasStats:      document.getElementById('metricasStats'),
  talkRatioCloser:    document.getElementById('talkRatioCloser'),
  talkRatioProspect:  document.getElementById('talkRatioProspect'),
  diagnosticoProporcao: document.getElementById('diagnosticoProporcao'),
  spinCard:           document.getElementById('spinCard'),
  spinGrid:           document.getElementById('spinGrid'),
  spinAvaliacao:      document.getElementById('spinAvaliacao'),
  portfolioCard:      document.getElementById('portfolioCard'),
  portfolioServicos:  document.getElementById('portfolioServicos'),
  portfolioAnalise:   document.getElementById('portfolioAnalise'),
  topicosCard:        document.getElementById('topicosCard'),
  topicosList:        document.getElementById('topicosList'),
  tecnicasCard:       document.getElementById('tecnicasCard'),
  tecnicasGrid:       document.getElementById('tecnicasGrid'),
  criteriaGrid:       document.getElementById('criteriaGrid'),
  criteriaSubtitle:   document.getElementById('criteriaSubtitle'),
  momentoCritico:     document.getElementById('momentoCritico'),
  fraseIdeal:         document.getElementById('fraseIdeal'),
  comentarioInput:    document.getElementById('comentarioInput'),
  btnSalvarComentario:document.getElementById('btnSalvarComentario'),
  downloadBtn:        document.getElementById('downloadBtn'),
  // Performance
  perfTipo:           document.getElementById('perfTipo'),
  perfPeriodo:        document.getElementById('perfPeriodo'),
  btnExportPerfPdf:   document.getElementById('btnExportPerfPdf'),
  kpiGrid:            document.getElementById('kpiGrid'),
  weakCriteriaList:   document.getElementById('weakCriteriaList'),
  rankingList:        document.getElementById('rankingList'),
  closerCharts:       document.getElementById('closerCharts'),
  // Equipe
  btnNovoCloser:      document.getElementById('btnNovoCloser'),
  btnLinkHistory:     document.getElementById('btnLinkHistory'),
  equipeFormCard:     document.getElementById('equipeFormCard'),
  equipeFormTitle:    document.getElementById('equipeFormTitle'),
  equipeNome:         document.getElementById('equipeNome'),
  equipeTipo:         document.getElementById('equipeTipo'),
  equipeMeta:         document.getElementById('equipeMeta'),
  btnSalvarMembro:    document.getElementById('btnSalvarMembro'),
  btnCancelarMembro:  document.getElementById('btnCancelarMembro'),
  equipeTable:        document.getElementById('equipeTable'),
  // Toasts
  errorToast:         document.getElementById('errorToast'),
  successToast:       document.getElementById('successToast'),
};

/* ── State ─────────────────────────────────────────────── */
let currentTipo       = 'vendas';
let currentView       = 'analise';
let currentAnalysis   = null;
let currentAnalysisId = null;
let allClosers        = [];
let selectedCloserId  = null;
let historyPage       = 1;
let historyTotal      = 0;
let historyFilter     = 'all';
let editingCloserId   = null;
let perfCharts        = {};

/* ── Metadata ───────────────────────────────────────────── */
const CRITERIA_VENDAS = {
  rapport:      { label: 'Rapport',       icon: '🤝' },
  qualificacao: { label: 'Qualificação',  icon: '🔍' },
  apresentacao: { label: 'Apresentação',  icon: '📋' },
  objecoes:     { label: 'Objeções',      icon: '💬' },
  fechamento:   { label: 'Fechamento',    icon: '🎯' },
  autoridade:   { label: 'Autoridade',    icon: '⭐' },
};
const CRITERIA_ONBOARDING = {
  abertura:                { label: 'Abertura',                  icon: '👋' },
  contextualizacao:        { label: 'Contextualização',          icon: '📌' },
  conexao_conta:           { label: 'Conexão da Conta',          icon: '🔗' },
  validacao_estrategica:   { label: 'Validação Estratégica',     icon: '✅' },
  script_vendas:           { label: 'Script de Vendas',          icon: '📲' },
  alinhamento_expectativas:{ label: 'Alinhamento de Expectativas', icon: '🎯' },
  suporte:                 { label: 'Suporte e Próximos Passos', icon: '💬' },
  encerramento:            { label: 'Encerramento',              icon: '🏁' },
};
const ALL_CRITERIA_LABELS = {
  rapport: 'Rapport', qualificacao: 'Qualificação', apresentacao: 'Apresentação',
  objecoes: 'Objeções', fechamento: 'Fechamento', autoridade: 'Autoridade',
  abertura: 'Abertura', contextualizacao: 'Contextualização', conexao_conta: 'Conexão da Conta',
  validacao_estrategica: 'Validação Estratégica', script_vendas: 'Script de Vendas',
  alinhamento_expectativas: 'Alinhamento de Expectativas', suporte: 'Suporte', encerramento: 'Encerramento',
};
const SPIN_META = {
  situacao:    { label: 'Situação',    letter: 'S', desc: 'Mapeou o contexto atual?' },
  problema:    { label: 'Problema',    letter: 'P', desc: 'Explorou as dores reais?' },
  implicacao:  { label: 'Implicação',  letter: 'I', desc: 'Aprofundou as consequências?' },
  necessidade: { label: 'Necessidade', letter: 'N', desc: 'Levou o prospect a pedir pela solução?' },
};
const TECNICA_META = {
  escuta_ativa:    { label: 'Escuta Ativa',       icon: '👂' },
  ancoragem_valor: { label: 'Ancoragem de Valor', icon: '⚓' },
  manejo_objecoes: { label: 'Manejo de Objeções', icon: '🛡️' },
  urgencia:        { label: 'Urgência',            icon: '⚡' },
  prova_social:    { label: 'Prova Social',        icon: '🏆' },
};
const SERVICO_ICONS = { 'Google Ads': '📢', 'Fotos IA': '📸', 'Website': '🌐', 'Combo': '⭐' };

/* ── Helpers ────────────────────────────────────────────── */
function scoreClass(n) { return n >= 8 ? 'good' : n >= 5 ? 'mid' : 'bad'; }
function formatDate(s) {
  const d = new Date((s || '').replace(' ', 'T') + 'Z');
  return d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });
}
function escapeHtml(s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(s || '')));
  return d.innerHTML;
}
function showToast(msg, type = 'error') {
  const t = type === 'success' ? el.successToast : el.errorToast;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}
function showPanel(name) {
  el.emptyResultsCard.style.display   = name === 'empty'   ? 'flex'  : 'none';
  el.loadingResultsCard.style.display = name === 'loading' ? 'flex'  : 'none';
  el.resultsArea.style.display        = name === 'results' ? 'block' : 'none';
}

/* ── Main Navigation ────────────────────────────────────── */
function switchView(view) {
  currentView = view;
  el.navTabs.forEach(t => t.classList.toggle('active', t.dataset.view === view));
  el.viewAnalise.style.display    = view === 'analise'     ? '' : 'none';
  el.viewPerformance.style.display = view === 'performance' ? '' : 'none';
  el.viewEquipe.style.display     = view === 'equipe'      ? '' : 'none';
  if (view === 'performance') loadPerformance();
  if (view === 'equipe')      loadEquipe();
}
el.navTabs.forEach(t => t.addEventListener('click', () => switchView(t.dataset.view)));

/* ── Tipo Tabs ──────────────────────────────────────────── */
function switchTipo(tipo) {
  currentTipo = tipo;
  document.querySelectorAll('.tipo-tab').forEach(t => t.classList.toggle('active', t.dataset.tipo === tipo));
  if (tipo === 'onboarding') {
    el.formTitle.textContent        = 'Nova Análise de Onboarding';
    el.formSubtitle.textContent     = 'Cole a transcrição da reunião de início com o cliente';
    el.responsavelLabel.textContent = 'Nome do Gestor';
    el.transcricaoLabel.textContent = 'Transcrição da Reunião de Onboarding';
    el.submitText.textContent       = 'Analisar Onboarding';
  } else {
    el.formTitle.textContent        = 'Nova Análise de Vendas';
    el.formSubtitle.textContent     = 'Cole a transcrição da call e receba feedback detalhado';
    el.responsavelLabel.textContent = 'Nome do Closer';
    el.transcricaoLabel.textContent = 'Transcrição da Call';
    el.submitText.textContent       = 'Analisar Call';
  }
  populateCloserDropdown();
}
document.querySelectorAll('.tipo-tab').forEach(t => t.addEventListener('click', () => switchTipo(t.dataset.tipo)));

/* ── Closer Dropdown ────────────────────────────────────── */
async function loadClosers() {
  try {
    const res = await fetch('/closers');
    allClosers = await res.json();
    populateCloserDropdown();
  } catch { /* ignore */ }
}

function populateCloserDropdown() {
  const tipoFiltro = currentTipo === 'onboarding' ? 'gestor' : 'closer';
  const filtered = allClosers.filter(c => c.ativo && c.tipo === tipoFiltro);
  el.responsavelSelect.innerHTML = `<option value="">Selecione...</option>` +
    filtered.map(c => `<option value="${c.id}" data-nome="${escapeHtml(c.nome)}">${escapeHtml(c.nome)}</option>`).join('') +
    `<option value="__free__">✏️ Digitar nome livremente</option>`;
  selectedCloserId = null;
  el.newCloserRow.style.display = 'none';
}

el.responsavelSelect.addEventListener('change', () => {
  const v = el.responsavelSelect.value;
  if (v === '__free__') {
    el.newCloserRow.style.display = 'flex';
    el.newCloserNome.placeholder  = 'Digite o nome...';
    el.btnCriarCloser.textContent = 'Usar';
    selectedCloserId = null;
  } else if (v) {
    selectedCloserId = parseInt(v);
    el.newCloserRow.style.display = 'none';
  } else {
    selectedCloserId = null;
    el.newCloserRow.style.display = 'none';
  }
});

el.btnAddCloser.addEventListener('click', () => {
  el.newCloserRow.style.display = el.newCloserRow.style.display === 'none' ? 'flex' : 'none';
  el.newCloserNome.placeholder  = 'Nome do novo closer';
  el.btnCriarCloser.textContent = 'Criar';
  if (el.newCloserRow.style.display === 'flex') el.newCloserNome.focus();
});

el.btnCriarCloser.addEventListener('click', async () => {
  const nome = el.newCloserNome.value.trim();
  if (!nome) { showToast('Digite um nome.'); return; }

  // Se modo "Usar" (nome livre sem criar)
  if (el.btnCriarCloser.textContent === 'Usar') {
    selectedCloserId = null;
    el.newCloserRow.style.display = 'none';
    return;
  }

  try {
    const tipo = currentTipo === 'onboarding' ? 'gestor' : 'closer';
    const res  = await fetch('/closers', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ nome, tipo, meta_nota: 7.0 }),
    });
    const novo = await res.json();
    allClosers.push({ ...novo, ativo: 1 });
    populateCloserDropdown();
    el.responsavelSelect.value = novo.id;
    selectedCloserId = novo.id;
    el.newCloserRow.style.display = 'none';
    el.newCloserNome.value = '';
    showToast(`${nome} adicionado com sucesso!`, 'success');
  } catch { showToast('Erro ao criar closer.'); }
});

/* ── History ────────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    historyFilter = btn.dataset.filter;
    loadHistory(true);
  });
});

el.btnLoadMore.addEventListener('click', () => {
  historyPage++;
  loadHistory(false);
});

async function loadHistory(reset = true) {
  if (reset) { historyPage = 1; el.historyList.innerHTML = ''; }
  const tipo = historyFilter === 'all' ? '' : historyFilter;
  try {
    const params = new URLSearchParams({ page: historyPage, limit: 20 });
    if (tipo) params.append('tipo', tipo);
    const res  = await fetch(`/history?${params}`);
    const data = await res.json();
    historyTotal = data.total;
    el.historyCountLabel.textContent = `${historyTotal} análise${historyTotal !== 1 ? 's' : ''} registrada${historyTotal !== 1 ? 's' : ''}`;

    if (!data.items.length && reset) {
      el.historyList.innerHTML = `<div class="empty-history">Nenhuma análise ${historyFilter !== 'all' ? 'deste tipo ' : ''}ainda</div>`;
    } else {
      data.items.forEach(item => {
        const tipo_item = item.tipo_reuniao || 'vendas';
        const cls   = scoreClass(item.nota_geral);
        const name  = item.responsavel || '—';
        const cli   = item.cliente ? ` · ${item.cliente}` : '';
        const sub   = tipo_item === 'onboarding' ? `Onboarding${cli}` : (item.servico || '—') + cli;
        const div   = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div class="history-info">
            <div class="history-tipo ${tipo_item}">${tipo_item === 'onboarding' ? '🚀 Onboarding' : '🎯 Vendas'}</div>
            <div class="history-closer">${escapeHtml(name)}</div>
            <div class="history-meta">${escapeHtml(formatDate(item.created_at))} · ${escapeHtml(sub)}</div>
          </div>
          <div class="history-right">
            <div class="history-score score-${cls}">${item.nota_geral}</div>
            <div class="history-class">${escapeHtml(item.classificacao)}</div>
          </div>`;
        div.addEventListener('click', () => loadAnalysis(item.id));
        el.historyList.appendChild(div);
      });
    }

    const loaded = (historyPage - 1) * 20 + data.items.length;
    if (loaded < historyTotal) {
      el.historyPagination.style.display = 'flex';
      el.btnLoadMore.textContent = `Carregar mais (${historyTotal - loaded} restantes)`;
    } else {
      el.historyPagination.style.display = 'none';
    }
  } catch { /* ignore */ }
}

/* ── Load & Render Analysis ─────────────────────────────── */
async function loadAnalysis(id) {
  showPanel('loading');
  if (window.innerWidth < 1100) el.loadingResultsCard.scrollIntoView({ behavior:'smooth', block:'nearest' });
  try {
    const data = await (await fetch(`/analysis/${id}`)).json();
    renderResults(data);
    currentAnalysisId = id;
    if (window.innerWidth < 1100) el.resultsArea.scrollIntoView({ behavior:'smooth', block:'start' });
  } catch (err) { showToast('Erro ao carregar análise.'); showPanel('empty'); }
}

function renderScore(nota) {
  el.scoreNum.textContent  = nota;
  el.scoreCircle.className = `score-circle ${scoreClass(nota)}`;
}

function renderNotasAvaliador(notas) {
  if (!notas?.length) { el.notasCard.style.display = 'none'; return; }
  el.notasCard.style.display = 'block';
  el.notasList.innerHTML = notas.map(nota => {
    let cls = nota.startsWith('✅') ? 'positivo' : nota.startsWith('🔴') ? 'critico' : nota.startsWith('💡') ? 'oportunidade' : 'neutro';
    return `<div class="nota-item ${cls}">${escapeHtml(nota)}</div>`;
  }).join('');
}

function renderMetricas(metricas) {
  if (!metricas) { el.metricasCard.style.display = 'none'; return; }
  el.metricasCard.style.display = 'block';
  const closer   = metricas.proporcao_fala_closer  || 0;
  const prospect = metricas.proporcao_fala_prospect || 0;
  const cls = closer > 60 ? 'bad' : closer < 35 ? 'mid' : 'good';
  const lbl = { good: 'Ideal ✓', mid: 'Atenção', bad: 'Excessivo' };
  el.metricasStats.innerHTML = `
    <div class="metrica-item">
      <div class="metrica-num">${metricas.perguntas_feitas || 0}</div>
      <div class="metrica-label">Perguntas feitas</div>
    </div>
    <div class="metrica-item">
      <div class="metrica-num score-${cls}">${closer}%</div>
      <div class="metrica-label">Fala do Closer</div>
      <div class="metrica-badge ${cls}">${lbl[cls]}</div>
    </div>
    <div class="metrica-item">
      <div class="metrica-num">${prospect}%</div>
      <div class="metrica-label">Fala do Prospect</div>
    </div>`;
  el.talkRatioCloser.className   = `talk-bar-closer ${cls}`;
  el.talkRatioCloser.style.width = closer + '%';
  el.talkRatioCloser.textContent = closer > 18 ? closer + '%' : '';
  el.talkRatioProspect.style.width = prospect + '%';
  el.talkRatioProspect.textContent = prospect > 18 ? prospect + '%' : '';
  el.diagnosticoProporcao.textContent = metricas.diagnostico_proporcao || '';
}

function renderSpin(spin) {
  if (!spin) { el.spinCard.style.display = 'none'; return; }
  el.spinCard.style.display = 'block';
  el.spinGrid.innerHTML = ['situacao','problema','implicacao','necessidade'].map(key => {
    const m = SPIN_META[key]; const d = spin[key] || {};
    const cls = scoreClass(d.nota || 0);
    return `<div class="spin-item ${d.aplicou ? 'aplicou' : 'nao-aplicou'}">
      <div class="spin-item-header">
        <div class="spin-letter">${m.letter}</div>
        <div class="spin-title-wrap"><div class="spin-title">${m.label}</div><div class="spin-subdesc">${m.desc}</div></div>
        <div class="spin-score score-${cls}">${d.nota || 0}/10</div>
      </div>
      <div class="spin-badge ${d.aplicou ? 'sim' : 'nao'}">${d.aplicou ? '✅ Aplicou' : '❌ Não aplicou'}</div>
      <p class="spin-detalhe">${escapeHtml(d.detalhe || '')}</p>
    </div>`;
  }).join('');
  el.spinAvaliacao.textContent = spin.avaliacao_geral || '';
}

function renderTecnicas(tecnicas) {
  if (!tecnicas) { el.tecnicasCard.style.display = 'none'; return; }
  el.tecnicasCard.style.display = 'block';
  el.tecnicasGrid.innerHTML = Object.entries(tecnicas).map(([key, data]) => {
    const m = TECNICA_META[key] || { label: key, icon: '📊' };
    const cls = scoreClass(data.nota || 0);
    const pct = ((data.nota || 0) / 10) * 100;
    return `<div class="tecnica-item">
      <div class="tecnica-header">
        <span class="tecnica-icon">${m.icon}</span>
        <span class="tecnica-name">${m.label}</span>
        <span class="tecnica-score score-${cls}">${data.nota}/10</span>
      </div>
      <div class="progress-wrap"><div class="progress-bar ${cls}" data-target="${pct}"></div></div>
      <p class="tecnica-obs">${escapeHtml(data.observacao || '')}</p>
    </div>`;
  }).join('');
  requestAnimationFrame(() => {
    el.tecnicasGrid.querySelectorAll('.progress-bar[data-target]').forEach(b => { b.style.width = b.dataset.target + '%'; });
  });
}

function renderPortfolio(servicos, analise) {
  if (!analise && (!servicos?.length)) { el.portfolioCard.style.display = 'none'; return; }
  el.portfolioCard.style.display = 'block';
  el.portfolioServicos.innerHTML = (servicos || []).map(s => `<span class="portfolio-pill">${SERVICO_ICONS[s] || '📦'} ${escapeHtml(s)}</span>`).join('');
  el.portfolioAnalise.textContent = analise || '';
}

function renderTopicos(topicos) {
  if (!topicos?.length) { el.topicosCard.style.display = 'none'; return; }
  el.topicosCard.style.display = 'block';
  el.topicosList.innerHTML = topicos.map(t => `<div class="topico-item"><span class="topico-icon">⚠️</span><span>${escapeHtml(t)}</span></div>`).join('');
}

function renderCriteria(criterios, tipo) {
  el.criteriaGrid.innerHTML = '';
  const meta = tipo === 'onboarding' ? CRITERIA_ONBOARDING : CRITERIA_VENDAS;
  for (const [key, data] of Object.entries(criterios)) {
    const m = meta[key] || { label: key, icon: '📊' };
    const cls = scoreClass(data.nota); const pct = (data.nota / 10) * 100;
    const card = document.createElement('div');
    card.className = 'criterion-card';
    card.innerHTML = `
      <div class="criterion-header">
        <span class="criterion-name">${m.icon} ${m.label}</span>
        <span class="criterion-score score-${cls}">${data.nota}/10</span>
      </div>
      <div class="progress-wrap"><div class="progress-bar ${cls}" data-target="${pct}"></div></div>
      <div class="criterion-row"><span class="row-icon">✅</span><span><strong>Bem:</strong> ${escapeHtml(data.bem)}</span></div>
      <div class="criterion-row"><span class="row-icon">❌</span><span><strong>Falhou:</strong> ${escapeHtml(data.falhou)}</span></div>
      <div class="criterion-tip">💡 ${escapeHtml(data.melhoria)}</div>`;
    el.criteriaGrid.appendChild(card);
  }
  requestAnimationFrame(() => {
    document.querySelectorAll('.progress-bar[data-target]').forEach(b => { b.style.width = b.dataset.target + '%'; });
  });
}

function renderResults(data) {
  const tipo = data.tipo_reuniao || 'vendas';
  renderScore(data.nota_geral);
  el.classificationPill.textContent = data.classificacao;
  el.resultTipoBadge.textContent    = tipo === 'onboarding' ? '🚀 Onboarding de Cliente' : '🎯 Reunião de Vendas';
  el.responsavelDisplay.textContent = data.responsavel || '—';
  el.momentoCritico.textContent     = data.momento_critico || '';
  el.fraseIdeal.textContent         = data.frase_ideal || '';
  el.comentarioInput.value          = data.comentario || '';

  if (data.cliente) {
    el.clienteDisplay.textContent    = data.cliente;
    el.clienteMetaItem.style.display = 'flex';
  } else {
    el.clienteMetaItem.style.display = 'none';
  }

  if (tipo === 'onboarding') {
    el.servicoMetaItem.style.display  = 'none';
    el.criteriaSubtitle.textContent   = '8 etapas do roteiro oficial Rota Studio';
    el.portfolioCard.style.display    = 'none';
    el.notasCard.style.display        = 'none';
    el.metricasCard.style.display     = 'none';
    el.spinCard.style.display         = 'none';
    el.tecnicasCard.style.display     = 'none';
    renderTopicos(data.topicos_perdidos);
  } else {
    el.servicoMetaItem.style.display  = 'none';
    el.criteriaSubtitle.textContent   = '6 critérios de performance do closer';
    el.topicosCard.style.display      = 'none';
    renderNotasAvaliador(data.notas_avaliador);
    renderMetricas(data.metricas);
    renderSpin(data.spin_selling);
    renderPortfolio(data.servicos_identificados, data.estrategia_portfolio);
    renderTecnicas(data.tecnicas);
  }

  renderCriteria(data.criterios, tipo);
  currentAnalysis   = data;
  currentAnalysisId = data.id;
  showPanel('results');
}

/* ── Comentário do Gestor ───────────────────────────────── */
el.btnSalvarComentario.addEventListener('click', async () => {
  if (!currentAnalysisId) return;
  try {
    await fetch(`/analysis/${currentAnalysisId}/comentario`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ comentario: el.comentarioInput.value }),
    });
    showToast('Nota salva!', 'success');
  } catch { showToast('Erro ao salvar nota.'); }
});

/* ── PDF Download ───────────────────────────────────────── */
el.downloadBtn.addEventListener('click', async () => {
  if (!currentAnalysis) return;
  const d    = currentAnalysis;
  const tipo = d.tipo_reuniao === 'onboarding' ? 'Onboarding' : 'Vendas';
  const name = (d.responsavel || 'responsavel').replace(/\s+/g, '_');
  const cli  = d.cliente ? `-${d.cliente.replace(/\s+/g, '_')}` : '';
  const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const filename = `Analise-${tipo}-${name}${cli}-${date}.pdf`;

  el.downloadBtn.disabled   = true;
  el.downloadBtn.innerHTML  = '<span class="spinner-sm"></span> Gerando PDF...';
  const wrap = el.downloadBtn.closest('.results-actions');
  wrap.style.visibility = 'hidden';
  try {
    await html2pdf().set({
      margin: [12,10,12,10], filename,
      image: { type:'jpeg', quality:.97 },
      html2canvas: { scale:2, useCORS:true, logging:false, scrollY:0 },
      jsPDF: { unit:'mm', format:'a4', orientation:'portrait' },
      pagebreak: { mode:['avoid-all','css','legacy'] },
    }).from(document.getElementById('resultsArea')).save();
  } finally {
    wrap.style.visibility = 'visible';
    el.downloadBtn.disabled  = false;
    el.downloadBtn.innerHTML = '📄 Baixar PDF';
  }
});

/* ── Form Submit ────────────────────────────────────────── */
el.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const transcricao = el.transcricao.value.trim();
  const cliente     = el.cliente.value.trim();

  // Resolve nome do closer
  let responsavel   = '';
  let closer_id     = null;
  const sel = el.responsavelSelect.value;
  if (sel && sel !== '__free__') {
    closer_id   = parseInt(sel);
    responsavel = el.responsavelSelect.selectedOptions[0]?.dataset.nome || '';
  } else if (sel === '__free__') {
    responsavel = el.newCloserNome.value.trim();
  }

  if (!responsavel) { showToast('Selecione ou informe o nome do closer.'); return; }
  if (!transcricao || transcricao.length < 50) { showToast('Transcrição muito curta. Cole a reunião completa.'); return; }

  el.submitBtn.disabled = true;
  el.submitBtn.innerHTML = '<span class="spinner-sm"></span> Analisando...';
  showPanel('loading');
  if (window.innerWidth < 1100) el.loadingResultsCard.scrollIntoView({ behavior:'smooth', block:'nearest' });

  try {
    const res = await fetch('/analyze', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ transcricao, responsavel, cliente, servico: '', tipo_reuniao: currentTipo, closer_id }),
    });
    if (!res.ok) { const e = await res.json().catch(()=>({detail:'Erro'})); throw new Error(e.detail); }
    const data = await res.json();
    renderResults(data);
    loadHistory(true);
    if (window.innerWidth < 1100) el.resultsArea.scrollIntoView({ behavior:'smooth', block:'start' });
  } catch (err) { showToast(err.message); showPanel('empty'); }
  finally {
    el.submitBtn.disabled = false;
    el.submitBtn.innerHTML = `<span class="btn-icon">🔍</span><span class="btn-text" id="submitText">${currentTipo === 'onboarding' ? 'Analisar Onboarding' : 'Analisar Call'}</span>`;
  }
});

/* ══════════════════════════════════════════════════════════
   PERFORMANCE
   ══════════════════════════════════════════════════════════ */
el.perfTipo.addEventListener('change',   () => loadPerformance());
el.perfPeriodo.addEventListener('change', () => loadPerformance());

async function loadPerformance() {
  const tipo  = el.perfTipo.value;
  const days  = el.perfPeriodo.value || '';
  const qs    = new URLSearchParams({ tipo_reuniao: tipo });
  if (days) qs.append('days', days);

  try {
    const [perfData, teamStats] = await Promise.all([
      fetch(`/performance?${qs}`).then(r => r.json()),
      fetch(`/team-stats?${qs}`).then(r => r.json()),
    ]);
    renderKpis(teamStats);
    renderWeakCriteria(teamStats);
    renderRanking(perfData, teamStats);
    renderCloserCharts(perfData);
  } catch (err) { showToast('Erro ao carregar performance.'); }
}

function renderKpis(stats) {
  const metaText = stats.closers_count > 0
    ? `${stats.meta_atingida_count}/${stats.closers_count} closers`
    : '—';
  el.kpiGrid.innerHTML = [
    { icon:'📞', value: stats.total_calls,       label:'Calls analisadas' },
    { icon:'⭐', value: stats.avg_nota || '—',   label:'Média geral do time' },
    { icon:'🎯', value: metaText,                 label:'Meta atingida' },
    { icon:'👥', value: stats.closers_count || 0, label:'Closers ativos' },
  ].map(k => `
    <div class="kpi-card">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`).join('');
}

function renderWeakCriteria(stats) {
  const list = stats.weak_criteria || [];
  if (!list.length) {
    el.weakCriteriaList.innerHTML = '<div class="empty-history">Sem dados suficientes</div>';
    return;
  }
  el.weakCriteriaList.innerHTML = list.map(c => {
    const cls = scoreClass(c.avg_nota); const pct = (c.avg_nota / 10) * 100;
    return `<div class="weak-item">
      <div class="weak-item-header">
        <span>${ALL_CRITERIA_LABELS[c.criterio] || c.criterio}</span>
        <span class="criterion-score score-${cls}">${c.avg_nota}/10</span>
      </div>
      <div class="progress-wrap"><div class="progress-bar ${cls}" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

function renderRanking(perfData, teamStats) {
  if (!perfData.length) {
    el.rankingList.innerHTML = '<div class="empty-history">Sem dados no período</div>';
    return;
  }
  el.rankingList.innerHTML = perfData.map((p, i) => {
    const cls      = scoreClass(p.avg_nota);
    const meta     = p.closer?.meta_nota ?? 7.0;
    const atingiu  = p.avg_nota >= meta;
    const badge    = atingiu ? '✅' : p.avg_nota >= meta - 0.5 ? '⚠️' : '🔴';
    return `<div class="ranking-item">
      <div class="ranking-pos">${i + 1}</div>
      <div class="ranking-info">
        <div class="ranking-nome">${escapeHtml(p.closer?.nome || '—')}</div>
        <div class="ranking-sub">${p.total_calls} call${p.total_calls !== 1 ? 's' : ''} · meta: ${meta}</div>
      </div>
      <div class="ranking-right">
        <div class="history-score score-${cls}">${p.avg_nota}</div>
        <div class="ranking-badge">${badge}</div>
      </div>
    </div>`;
  }).join('');
}

function renderCloserCharts(perfData) {
  // Destroy previous charts
  Object.values(perfCharts).forEach(c => c.destroy());
  perfCharts = {};

  if (!perfData.length) {
    el.closerCharts.innerHTML = '<div class="empty-history" style="padding:24px">Nenhum dado para exibir</div>';
    return;
  }

  el.closerCharts.innerHTML = perfData.map((p, i) => {
    const cls = scoreClass(p.avg_nota);
    const meta = p.closer?.meta_nota ?? 7.0;
    return `<div class="card closer-chart-card" id="closerCard_${i}">
      <div class="closer-chart-header">
        <div>
          <div class="closer-chart-nome">${escapeHtml(p.closer?.nome || '—')}</div>
          <div class="closer-chart-sub">${p.total_calls} calls · média <strong class="score-${cls}">${p.avg_nota}</strong> · meta ${meta}</div>
        </div>
      </div>
      <div class="closer-charts-row">
        <div class="closer-chart-wrap">
          <div class="closer-chart-title">Evolução da nota</div>
          <canvas id="chartEvol_${i}" height="120"></canvas>
        </div>
        <div class="closer-chart-wrap">
          <div class="closer-chart-title">Média por critério</div>
          <canvas id="chartCrit_${i}" height="120"></canvas>
        </div>
      </div>
    </div>`;
  }).join('');

  requestAnimationFrame(() => {
    perfData.forEach((p, i) => {
      // Evolução chart
      const ctxE = document.getElementById(`chartEvol_${i}`)?.getContext('2d');
      if (ctxE && p.evolucao?.length) {
        perfCharts[`evol_${i}`] = new Chart(ctxE, {
          type: 'line',
          data: {
            labels: p.evolucao.map(e => e.data),
            datasets: [{
              label: 'Nota', data: p.evolucao.map(e => e.nota),
              borderColor: '#ca853e', backgroundColor: 'rgba(202,133,62,.1)',
              pointBackgroundColor: '#ca853e', tension: 0.3, fill: true,
            }, {
              label: 'Meta', data: p.evolucao.map(() => p.closer?.meta_nota ?? 7),
              borderColor: '#2a7d4f', borderDash: [5,5], pointRadius: 0, tension: 0,
            }],
          },
          options: {
            responsive: true, plugins: { legend: { display: false } },
            scales: { y: { min: 0, max: 10, ticks: { stepSize: 2 } }, x: { ticks: { maxTicksLimit: 6 } } },
          },
        });
      }

      // Critérios chart
      const ctxC = document.getElementById(`chartCrit_${i}`)?.getContext('2d');
      if (ctxC && Object.keys(p.criterios_avg || {}).length) {
        const keys = Object.keys(p.criterios_avg);
        const vals = keys.map(k => p.criterios_avg[k]);
        perfCharts[`crit_${i}`] = new Chart(ctxC, {
          type: 'bar',
          data: {
            labels: keys.map(k => ALL_CRITERIA_LABELS[k] || k),
            datasets: [{
              label: 'Média',
              data: vals,
              backgroundColor: vals.map(v => v >= 8 ? 'rgba(42,125,79,.7)' : v >= 5 ? 'rgba(202,133,62,.7)' : 'rgba(184,50,50,.7)'),
              borderRadius: 4,
            }],
          },
          options: {
            responsive: true, plugins: { legend: { display: false } },
            scales: { y: { min: 0, max: 10, ticks: { stepSize: 2 } } },
          },
        });
      }
    });
  });
}

// Exportar performance como PDF
el.btnExportPerfPdf.addEventListener('click', async () => {
  const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const tipo = el.perfTipo.value === 'onboarding' ? 'Onboarding' : 'Vendas';
  el.btnExportPerfPdf.disabled = true;
  el.btnExportPerfPdf.innerHTML = '<span class="spinner-sm"></span>';
  try {
    await html2pdf().set({
      margin: [10,10,10,10], filename: `Performance-${tipo}-${date}.pdf`,
      image: { type:'jpeg', quality:.95 },
      html2canvas: { scale:1.5, useCORS:true, logging:false },
      jsPDF: { unit:'mm', format:'a4', orientation:'landscape' },
    }).from(document.getElementById('perfDashboard')).save();
  } finally {
    el.btnExportPerfPdf.disabled = false;
    el.btnExportPerfPdf.innerHTML = '📄 Exportar PDF';
  }
});

/* ══════════════════════════════════════════════════════════
   EQUIPE
   ══════════════════════════════════════════════════════════ */
async function loadEquipe() {
  try {
    const closers = await (await fetch('/closers')).json();
    allClosers = closers;
    renderEquipeTable(closers);
  } catch { showToast('Erro ao carregar equipe.'); }
}

function renderEquipeTable(closers) {
  if (!closers.length) {
    el.equipeTable.innerHTML = '<div class="empty-history" style="padding:24px">Nenhum membro cadastrado ainda. Clique em "+ Novo membro" para começar.</div>';
    return;
  }
  el.equipeTable.innerHTML = `
    <table class="equipe-tbl">
      <thead><tr><th>Nome</th><th>Tipo</th><th>Meta</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>${closers.map(c => `
        <tr class="${c.ativo ? '' : 'inativo'}">
          <td class="equipe-nome">${escapeHtml(c.nome)}</td>
          <td><span class="tipo-badge-sm ${c.tipo}">${c.tipo === 'gestor' ? '🚀 Gestor' : '🎯 Closer'}</span></td>
          <td>${c.meta_nota}</td>
          <td><span class="status-badge ${c.ativo ? 'ativo' : 'inativo'}">${c.ativo ? 'Ativo' : 'Inativo'}</span></td>
          <td class="equipe-actions-cell">
            <button class="btn-edit-sm" onclick="showEquipeForm(${c.id})">Editar</button>
            ${c.ativo
              ? `<button class="btn-deact-sm" onclick="deactivateMember(${c.id})">Desativar</button>`
              : `<button class="btn-act-sm"   onclick="activateMember(${c.id})">Ativar</button>`}
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

el.btnNovoCloser.addEventListener('click', () => showEquipeForm(null));

function showEquipeForm(id) {
  editingCloserId = id;
  el.equipeFormCard.style.display = 'block';
  if (id) {
    const c = allClosers.find(x => x.id === id);
    el.equipeFormTitle.textContent = 'Editar Membro';
    el.equipeNome.value  = c?.nome || '';
    el.equipeTipo.value  = c?.tipo || 'closer';
    el.equipeMeta.value  = c?.meta_nota ?? 7.0;
  } else {
    el.equipeFormTitle.textContent = 'Novo Membro da Equipe';
    el.equipeNome.value  = '';
    el.equipeTipo.value  = 'closer';
    el.equipeMeta.value  = '7.0';
  }
  el.equipeNome.focus();
  el.equipeFormCard.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

el.btnCancelarMembro.addEventListener('click', () => { el.equipeFormCard.style.display = 'none'; editingCloserId = null; });

el.btnSalvarMembro.addEventListener('click', async () => {
  const nome     = el.equipeNome.value.trim();
  const tipo     = el.equipeTipo.value;
  const meta     = parseFloat(el.equipeMeta.value) || 7.0;
  if (!nome) { showToast('Informe o nome.'); return; }

  try {
    if (editingCloserId) {
      const c = allClosers.find(x => x.id === editingCloserId);
      await fetch(`/closers/${editingCloserId}`, {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ nome, tipo, ativo: c?.ativo ?? 1, meta_nota: meta }),
      });
    } else {
      await fetch('/closers', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ nome, tipo, meta_nota: meta }),
      });
    }
    showToast('Salvo com sucesso!', 'success');
    el.equipeFormCard.style.display = 'none';
    editingCloserId = null;
    loadEquipe();
    loadClosers();
  } catch { showToast('Erro ao salvar.'); }
});

async function deactivateMember(id) {
  const c = allClosers.find(x => x.id === id);
  if (!c || !confirm(`Desativar ${c.nome}?`)) return;
  await fetch(`/closers/${id}`, {
    method: 'PUT', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ nome: c.nome, tipo: c.tipo, ativo: 0, meta_nota: c.meta_nota }),
  });
  showToast(`${c.nome} desativado.`, 'success');
  loadEquipe(); loadClosers();
}

async function activateMember(id) {
  const c = allClosers.find(x => x.id === id);
  if (!c) return;
  await fetch(`/closers/${id}`, {
    method: 'PUT', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ nome: c.nome, tipo: c.tipo, ativo: 1, meta_nota: c.meta_nota }),
  });
  showToast(`${c.nome} ativado.`, 'success');
  loadEquipe(); loadClosers();
}

el.btnLinkHistory.addEventListener('click', async () => {
  el.btnLinkHistory.disabled = true;
  try {
    const res  = await fetch('/closers/link-history', { method:'POST' });
    const data = await res.json();
    showToast(`${data.linked} análise${data.linked !== 1 ? 's' : ''} vinculada${data.linked !== 1 ? 's' : ''} com sucesso!`, 'success');
  } catch { showToast('Erro ao vincular histórico.'); }
  finally { el.btnLinkHistory.disabled = false; }
});

/* ── Init ───────────────────────────────────────────────── */
loadClosers();
loadHistory(true);
