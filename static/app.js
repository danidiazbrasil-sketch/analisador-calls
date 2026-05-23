/* ── DOM references ─────────────────────────────────────── */
const el = {
  form:                 document.getElementById('analyzeForm'),
  transcricao:          document.getElementById('transcricao'),
  responsavel:          document.getElementById('responsavel'),
  responsavelLabel:     document.getElementById('responsavelLabel'),
  submitBtn:            document.getElementById('submitBtn'),
  submitText:           document.getElementById('submitText'),
  formTitle:            document.getElementById('formTitle'),
  formSubtitle:         document.getElementById('formSubtitle'),
  transcricaoLabel:     document.getElementById('transcricaoLabel'),
  emptyResultsCard:     document.getElementById('emptyResultsCard'),
  loadingResultsCard:   document.getElementById('loadingResultsCard'),
  resultsArea:          document.getElementById('resultsArea'),
  historyList:          document.getElementById('historyList'),
  scoreNum:             document.getElementById('scoreNum'),
  scoreCircle:          document.getElementById('scoreCircle'),
  classificationPill:   document.getElementById('classificationPill'),
  resultTipoBadge:      document.getElementById('resultTipoBadge'),
  responsavelDisplay:   document.getElementById('responsavelDisplay'),
  servicoDisplay:       document.getElementById('servicoDisplay'),
  servicoMetaItem:      document.getElementById('servicoMetaItem'),
  clienteInput:         document.getElementById('cliente'),
  clienteDisplay:       document.getElementById('clienteDisplay'),
  clienteMetaItem:      document.getElementById('clienteMetaItem'),
  // Vendas-only new cards
  notasCard:            document.getElementById('notasCard'),
  notasList:            document.getElementById('notasList'),
  metricasCard:         document.getElementById('metricasCard'),
  metricasStats:        document.getElementById('metricasStats'),
  talkRatioCloser:      document.getElementById('talkRatioCloser'),
  talkRatioProspect:    document.getElementById('talkRatioProspect'),
  diagnosticoProporcao: document.getElementById('diagnosticoProporcao'),
  spinCard:             document.getElementById('spinCard'),
  spinGrid:             document.getElementById('spinGrid'),
  spinAvaliacao:        document.getElementById('spinAvaliacao'),
  tecnicasCard:         document.getElementById('tecnicasCard'),
  tecnicasGrid:         document.getElementById('tecnicasGrid'),
  // Existing cards
  portfolioCard:        document.getElementById('portfolioCard'),
  portfolioServicos:    document.getElementById('portfolioServicos'),
  portfolioAnalise:     document.getElementById('portfolioAnalise'),
  criteriaGrid:         document.getElementById('criteriaGrid'),
  criteriaSubtitle:     document.getElementById('criteriaSubtitle'),
  topicosCard:          document.getElementById('topicosCard'),
  topicosList:          document.getElementById('topicosList'),
  momentoCritico:       document.getElementById('momentoCritico'),
  fraseIdeal:           document.getElementById('fraseIdeal'),
  errorToast:           document.getElementById('errorToast'),
  downloadBtn:          document.getElementById('downloadBtn'),
};

/* ── State ──────────────────────────────────────────────── */
let currentTipo     = 'vendas';
let allHistory      = [];
let currentAnalysis = null;   // último resultado renderizado

/* ── Criteria metadata ──────────────────────────────────── */
const CRITERIA_VENDAS = {
  rapport:      { label: 'Rapport',       icon: '🤝' },
  qualificacao: { label: 'Qualificação',  icon: '🔍' },
  apresentacao: { label: 'Apresentação',  icon: '📋' },
  objecoes:     { label: 'Objeções',      icon: '💬' },
  fechamento:   { label: 'Fechamento',    icon: '🎯' },
  autoridade:   { label: 'Autoridade',    icon: '⭐' },
};

const CRITERIA_ONBOARDING = {
  abertura:                { label: 'Abertura',                 icon: '👋' },
  contextualizacao:        { label: 'Contextualização',         icon: '📌' },
  conexao_conta:           { label: 'Conexão da Conta',         icon: '🔗' },
  validacao_estrategica:   { label: 'Validação Estratégica',    icon: '✅' },
  script_vendas:           { label: 'Script de Vendas',         icon: '📲' },
  alinhamento_expectativas:{ label: 'Alinhamento de Expectativas', icon: '🎯' },
  suporte:                 { label: 'Suporte e Próximos Passos',icon: '💬' },
  encerramento:            { label: 'Encerramento',             icon: '🏁' },
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

/* ── Helpers ────────────────────────────────────────────── */
function scoreClass(n) {
  if (n >= 8) return 'good';
  if (n >= 5) return 'mid';
  return 'bad';
}
function formatDate(s) {
  const d = new Date((s || '').replace(' ', 'T') + 'Z');
  return d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });
}
function escapeHtml(s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(s || '')));
  return d.innerHTML;
}

/* ── UI State ───────────────────────────────────────────── */
function showPanel(name) {
  el.emptyResultsCard.style.display   = 'none';
  el.loadingResultsCard.style.display = 'none';
  el.resultsArea.style.display        = 'none';
  if (name === 'empty')   el.emptyResultsCard.style.display   = 'flex';
  if (name === 'loading') el.loadingResultsCard.style.display = 'flex';
  if (name === 'results') el.resultsArea.style.display        = 'block';
}

function showToast(msg) {
  el.errorToast.textContent = msg;
  el.errorToast.classList.add('show');
  setTimeout(() => el.errorToast.classList.remove('show'), 4500);
}

/* ── Tab switching ──────────────────────────────────────── */
function switchTipo(tipo) {
  currentTipo = tipo;
  document.querySelectorAll('.tipo-tab').forEach(t => t.classList.toggle('active', t.dataset.tipo === tipo));

  if (tipo === 'onboarding') {
    el.formTitle.textContent        = 'Nova Análise de Onboarding';
    el.formSubtitle.textContent     = 'Cole a transcrição da reunião de início com o cliente';
    el.responsavelLabel.textContent = 'Nome do Gestor';
    el.responsavel.placeholder      = 'Ex: Maria Santos';
    el.transcricaoLabel.textContent = 'Transcrição da Reunião de Onboarding';
    el.submitText.textContent       = 'Analisar Onboarding';
  } else {
    el.formTitle.textContent        = 'Nova Análise de Vendas';
    el.formSubtitle.textContent     = 'Cole a transcrição da call e receba feedback detalhado';
    el.responsavelLabel.textContent = 'Nome do Closer';
    el.responsavel.placeholder      = 'Ex: João Silva';
    el.transcricaoLabel.textContent = 'Transcrição da Call';
    el.submitText.textContent       = 'Analisar Call';
  }
}

document.querySelectorAll('.tipo-tab').forEach(tab => {
  tab.addEventListener('click', () => switchTipo(tab.dataset.tipo));
});

/* ── History filter ─────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderHistory(allHistory, btn.dataset.filter);
  });
});

/* ── Rendering ──────────────────────────────────────────── */
function renderScore(nota) {
  el.scoreNum.textContent = nota;
  el.scoreCircle.className = `score-circle ${scoreClass(nota)}`;
}

function renderCriteria(criterios, tipo) {
  el.criteriaGrid.innerHTML = '';
  const meta = tipo === 'onboarding' ? CRITERIA_ONBOARDING : CRITERIA_VENDAS;

  el.criteriaGrid.style.gridTemplateColumns = '1fr 1fr';

  for (const [key, data] of Object.entries(criterios)) {
    const m   = meta[key] || { label: key, icon: '📊' };
    const cls = scoreClass(data.nota);
    const pct = (data.nota / 10) * 100;

    const card = document.createElement('div');
    card.className = 'criterion-card';
    card.innerHTML = `
      <div class="criterion-header">
        <span class="criterion-name">${m.icon} ${m.label}</span>
        <span class="criterion-score score-${cls}">${data.nota}/10</span>
      </div>
      <div class="progress-wrap">
        <div class="progress-bar ${cls}" data-target="${pct}"></div>
      </div>
      <div class="criterion-row">
        <span class="row-icon">✅</span>
        <span><strong>Bem:</strong> ${escapeHtml(data.bem)}</span>
      </div>
      <div class="criterion-row">
        <span class="row-icon">❌</span>
        <span><strong>Falhou:</strong> ${escapeHtml(data.falhou)}</span>
      </div>
      <div class="criterion-tip">💡 ${escapeHtml(data.melhoria)}</div>
    `;
    el.criteriaGrid.appendChild(card);
  }

  requestAnimationFrame(() => {
    document.querySelectorAll('.progress-bar[data-target]').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  });
}

const SERVICO_ICONS = {
  'Google Ads': '📢', 'Fotos IA': '📸', 'Website': '🌐', 'Combo': '⭐',
};

function renderPortfolio(servicos, analise) {
  if (!analise && (!servicos || !servicos.length)) {
    el.portfolioCard.style.display = 'none';
    return;
  }
  el.portfolioCard.style.display = 'block';
  el.portfolioServicos.innerHTML = (servicos || []).map(s => {
    const icon = SERVICO_ICONS[s] || '📦';
    return `<span class="portfolio-pill">${icon} ${escapeHtml(s)}</span>`;
  }).join('');
  el.portfolioAnalise.textContent = analise || '';
}

function renderTopicos(topicos) {
  if (!topicos || topicos.length === 0) {
    el.topicosCard.style.display = 'none';
    return;
  }
  el.topicosCard.style.display = 'block';
  el.topicosList.innerHTML = topicos.map(t => `
    <div class="topico-item">
      <span class="topico-icon">⚠️</span>
      <span>${escapeHtml(t)}</span>
    </div>
  `).join('');
}

function renderNotasAvaliador(notas) {
  if (!notas || !notas.length) { el.notasCard.style.display = 'none'; return; }
  el.notasCard.style.display = 'block';
  el.notasList.innerHTML = notas.map(nota => {
    let cls = 'neutro';
    if (nota.startsWith('✅')) cls = 'positivo';
    else if (nota.startsWith('🔴')) cls = 'critico';
    else if (nota.startsWith('💡')) cls = 'oportunidade';
    return `<div class="nota-item ${cls}">${escapeHtml(nota)}</div>`;
  }).join('');
}

function renderMetricas(metricas) {
  if (!metricas) { el.metricasCard.style.display = 'none'; return; }
  el.metricasCard.style.display = 'block';

  const closer   = metricas.proporcao_fala_closer   || 0;
  const prospect = metricas.proporcao_fala_prospect  || 0;
  // Ideal for consultive sales: closer speaks 40-50% of the time
  const cls      = closer > 60 ? 'bad' : closer > 50 ? 'mid' : closer < 30 ? 'mid' : 'good';
  const labelMap = { good: 'Ideal ✓', mid: 'Atenção', bad: 'Excessivo' };

  el.metricasStats.innerHTML = `
    <div class="metrica-item">
      <div class="metrica-num">${metricas.perguntas_feitas || 0}</div>
      <div class="metrica-label">Perguntas feitas</div>
    </div>
    <div class="metrica-item">
      <div class="metrica-num score-${cls}">${closer}%</div>
      <div class="metrica-label">Fala do Closer</div>
      <div class="metrica-badge ${cls}">${labelMap[cls]}</div>
    </div>
    <div class="metrica-item">
      <div class="metrica-num">${prospect}%</div>
      <div class="metrica-label">Fala do Prospect</div>
    </div>
  `;

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

  const pillars = ['situacao', 'problema', 'implicacao', 'necessidade'];
  el.spinGrid.innerHTML = pillars.map(key => {
    const m   = SPIN_META[key];
    const d   = spin[key] || {};
    const cls = scoreClass(d.nota || 0);
    return `
      <div class="spin-item ${d.aplicou ? 'aplicou' : 'nao-aplicou'}">
        <div class="spin-item-header">
          <div class="spin-letter">${m.letter}</div>
          <div class="spin-title-wrap">
            <div class="spin-title">${m.label}</div>
            <div class="spin-subdesc">${m.desc}</div>
          </div>
          <div class="spin-score score-${cls}">${d.nota || 0}/10</div>
        </div>
        <div class="spin-badge ${d.aplicou ? 'sim' : 'nao'}">${d.aplicou ? '✅ Aplicou' : '❌ Não aplicou'}</div>
        <p class="spin-detalhe">${escapeHtml(d.detalhe || '')}</p>
      </div>
    `;
  }).join('');

  el.spinAvaliacao.textContent = spin.avaliacao_geral || '';
}

function renderTecnicas(tecnicas) {
  if (!tecnicas) { el.tecnicasCard.style.display = 'none'; return; }
  el.tecnicasCard.style.display = 'block';

  el.tecnicasGrid.innerHTML = Object.entries(tecnicas).map(([key, data]) => {
    const m   = TECNICA_META[key] || { label: key, icon: '📊' };
    const cls = scoreClass(data.nota || 0);
    const pct = ((data.nota || 0) / 10) * 100;
    return `
      <div class="tecnica-item">
        <div class="tecnica-header">
          <span class="tecnica-icon">${m.icon}</span>
          <span class="tecnica-name">${m.label}</span>
          <span class="tecnica-score score-${cls}">${data.nota}/10</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar ${cls}" data-target="${pct}"></div>
        </div>
        <p class="tecnica-obs">${escapeHtml(data.observacao || '')}</p>
      </div>
    `;
  }).join('');

  requestAnimationFrame(() => {
    el.tecnicasGrid.querySelectorAll('.progress-bar[data-target]').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  });
}

function renderResults(data) {
  const tipo = data.tipo_reuniao || 'vendas';

  renderScore(data.nota_geral);
  el.classificationPill.textContent = data.classificacao;
  el.resultTipoBadge.textContent    = tipo === 'onboarding' ? '🚀 Onboarding de Cliente' : '🎯 Reunião de Vendas';
  el.responsavelDisplay.textContent = data.responsavel || '—';
  el.momentoCritico.textContent     = data.momento_critico;
  el.fraseIdeal.textContent         = data.frase_ideal;

  if (data.cliente) {
    el.clienteDisplay.textContent      = data.cliente;
    el.clienteMetaItem.style.display   = 'flex';
  } else {
    el.clienteMetaItem.style.display   = 'none';
  }

  if (tipo === 'onboarding') {
    el.servicoMetaItem.style.display = 'none';
    el.criteriaSubtitle.textContent  = '8 etapas do roteiro oficial Rota Studio';
    el.portfolioCard.style.display   = 'none';
    el.notasCard.style.display       = 'none';
    el.metricasCard.style.display    = 'none';
    el.spinCard.style.display        = 'none';
    el.tecnicasCard.style.display    = 'none';
    renderTopicos(data.topicos_perdidos);
  } else {
    el.servicoMetaItem.style.display = 'none';
    el.criteriaSubtitle.textContent  = '6 critérios de performance do closer';
    el.topicosCard.style.display     = 'none';
    renderNotasAvaliador(data.notas_avaliador);
    renderMetricas(data.metricas);
    renderSpin(data.spin_selling);
    renderPortfolio(data.servicos_identificados, data.estrategia_portfolio);
    renderTecnicas(data.tecnicas);
  }

  renderCriteria(data.criterios, tipo);
  currentAnalysis = data;
  showPanel('results');
}

function renderHistory(items, filter = 'all') {
  const filtered = filter === 'all' ? items : items.filter(i => (i.tipo_reuniao || 'vendas') === filter);

  if (!filtered.length) {
    el.historyList.innerHTML = `<div class="empty-history">${items.length ? 'Nenhuma análise deste tipo ainda' : 'Nenhuma análise realizada ainda'}</div>`;
    return;
  }
  el.historyList.innerHTML = '';
  filtered.forEach(item => {
    const tipo = item.tipo_reuniao || 'vendas';
    const cls  = scoreClass(item.nota_geral);
    const date = formatDate(item.created_at);
    const name   = item.responsavel || item.closer_name || '—';
    const cliente = item.cliente ? ` · ${item.cliente}` : '';
    const sub  = tipo === 'onboarding' ? `Onboarding${cliente}` : escapeHtml(item.servico || '—') + escapeHtml(cliente);

    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-info">
        <div class="history-tipo ${tipo}">${tipo === 'onboarding' ? '🚀 Onboarding' : '🎯 Vendas'}</div>
        <div class="history-closer">${escapeHtml(name)}</div>
        <div class="history-meta">${escapeHtml(date)} · ${sub}</div>
      </div>
      <div class="history-right">
        <div class="history-score score-${cls}">${item.nota_geral}</div>
        <div class="history-class">${escapeHtml(item.classificacao)}</div>
      </div>
    `;
    div.addEventListener('click', () => loadAnalysis(item.id));
    el.historyList.appendChild(div);
  });
}

/* ── API ────────────────────────────────────────────────── */
async function apiPost(payload) {
  const res = await fetch('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }));
    throw new Error(err.detail || 'Erro ao analisar');
  }
  return res.json();
}

async function apiHistory() {
  const res = await fetch('/history');
  if (!res.ok) throw new Error('Erro ao carregar histórico');
  return res.json();
}

async function apiGetAnalysis(id) {
  const res = await fetch(`/analysis/${id}`);
  if (!res.ok) throw new Error('Análise não encontrada');
  return res.json();
}

/* ── Actions ────────────────────────────────────────────── */
async function loadAnalysis(id) {
  showPanel('loading');
  if (window.innerWidth < 1100) el.loadingResultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  try {
    const data = await apiGetAnalysis(id);
    renderResults(data);
    if (window.innerWidth < 1100) el.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showToast('Erro ao carregar análise: ' + err.message);
    showPanel('empty');
  }
}

async function refreshHistory() {
  try {
    allHistory = await apiHistory();
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    renderHistory(allHistory, activeFilter);
  } catch { /* silently ignore */ }
}

/* ── Form submit ────────────────────────────────────────── */
el.form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const transcricao  = el.transcricao.value.trim();
  const responsavel  = el.responsavel.value.trim();
  const cliente      = el.clienteInput.value.trim();
  const tipo_reuniao = currentTipo;

  if (!transcricao || !responsavel) {
    showToast('Preencha todos os campos antes de analisar.');
    return;
  }
  if (transcricao.length < 50) {
    showToast('A transcrição parece muito curta. Cole a reunião completa.');
    return;
  }

  el.submitBtn.disabled = true;
  el.submitBtn.innerHTML = '<span class="spinner-sm"></span> Analisando...';
  showPanel('loading');
  if (window.innerWidth < 1100) el.loadingResultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const data = await apiPost({ transcricao, responsavel, cliente, servico: '', tipo_reuniao });
    renderResults(data);
    refreshHistory();
    if (window.innerWidth < 1100) el.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showToast(err.message);
    showPanel('empty');
  } finally {
    el.submitBtn.disabled = false;
    el.submitBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text" id="submitText">' + (currentTipo === 'onboarding' ? 'Analisar Onboarding' : 'Analisar Call') + '</span>';
  }
});

/* ── PDF Download ───────────────────────────────────────── */
el.downloadBtn.addEventListener('click', async () => {
  if (!currentAnalysis) return;

  const d    = currentAnalysis;
  const tipo = d.tipo_reuniao === 'onboarding' ? 'Onboarding' : 'Vendas';
  const resp = d.responsavel || 'responsavel';
  const cli  = d.cliente     ? `-${d.cliente}` : '';
  const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const filename = `Analise-${tipo}-${resp}${cli}-${date}.pdf`.replace(/\s+/g, '_');

  el.downloadBtn.disabled     = true;
  el.downloadBtn.innerHTML    = '<span class="spinner-sm"></span> Gerando PDF...';

  // Elemento a capturar (excluindo o próprio botão)
  const source = document.getElementById('resultsArea');

  const opt = {
    margin:      [12, 10, 12, 10],
    filename,
    image:       { type: 'jpeg', quality: 0.97 },
    html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:   { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    // Oculta o botão durante a captura para não aparecer no PDF
    el.downloadBtn.closest('.results-actions').style.visibility = 'hidden';
    await html2pdf().set(opt).from(source).save();
  } finally {
    el.downloadBtn.closest('.results-actions').style.visibility = 'visible';
    el.downloadBtn.disabled  = false;
    el.downloadBtn.innerHTML = '<span>📄</span> Baixar PDF';
  }
});

/* ── Init ───────────────────────────────────────────────── */
refreshHistory();
