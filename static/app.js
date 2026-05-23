/* ── DOM references ─────────────────────────────────────── */
const el = {
  form:               document.getElementById('analyzeForm'),
  transcricao:        document.getElementById('transcricao'),
  responsavel:        document.getElementById('responsavel'),
  responsavelLabel:   document.getElementById('responsavelLabel'),
  servico:            document.getElementById('servico'),
  servicoGroup:       document.getElementById('servicoGroup'),
  submitBtn:          document.getElementById('submitBtn'),
  submitText:         document.getElementById('submitText'),
  formTitle:          document.getElementById('formTitle'),
  formSubtitle:       document.getElementById('formSubtitle'),
  transcricaoLabel:   document.getElementById('transcricaoLabel'),
  emptyResultsCard:   document.getElementById('emptyResultsCard'),
  loadingResultsCard: document.getElementById('loadingResultsCard'),
  resultsArea:        document.getElementById('resultsArea'),
  historyList:        document.getElementById('historyList'),
  scoreNum:           document.getElementById('scoreNum'),
  scoreCircle:        document.getElementById('scoreCircle'),
  classificationPill: document.getElementById('classificationPill'),
  resultTipoBadge:    document.getElementById('resultTipoBadge'),
  responsavelDisplay: document.getElementById('responsavelDisplay'),
  servicoDisplay:     document.getElementById('servicoDisplay'),
  servicoMetaItem:    document.getElementById('servicoMetaItem'),
  criteriaGrid:       document.getElementById('criteriaGrid'),
  criteriaSubtitle:   document.getElementById('criteriaSubtitle'),
  topicosCard:        document.getElementById('topicosCard'),
  topicosList:        document.getElementById('topicosList'),
  momentoCritico:     document.getElementById('momentoCritico'),
  fraseIdeal:         document.getElementById('fraseIdeal'),
  errorToast:         document.getElementById('errorToast'),
};

/* ── State ──────────────────────────────────────────────── */
let currentTipo = 'vendas';
let allHistory  = [];

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
    el.formTitle.textContent      = 'Nova Análise de Onboarding';
    el.formSubtitle.textContent   = 'Cole a transcrição da reunião de início com o cliente';
    el.responsavelLabel.textContent = 'Nome do Gestor';
    el.responsavel.placeholder    = 'Ex: Maria Santos';
    el.transcricaoLabel.textContent = 'Transcrição da Reunião de Onboarding';
    el.servicoGroup.style.display = 'none';
    el.servico.required           = false;
    el.submitText.textContent     = 'Analisar Onboarding';
  } else {
    el.formTitle.textContent      = 'Nova Análise de Vendas';
    el.formSubtitle.textContent   = 'Cole a transcrição da call e receba feedback detalhado';
    el.responsavelLabel.textContent = 'Nome do Closer';
    el.responsavel.placeholder    = 'Ex: João Silva';
    el.transcricaoLabel.textContent = 'Transcrição da Call';
    el.servicoGroup.style.display = '';
    el.servico.required           = true;
    el.submitText.textContent     = 'Analisar Call';
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

  // Onboarding has 8 criteria → 2 columns still works, vendas has 6
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

function renderResults(data) {
  const tipo = data.tipo_reuniao || 'vendas';

  renderScore(data.nota_geral);
  el.classificationPill.textContent = data.classificacao;
  el.resultTipoBadge.textContent    = tipo === 'onboarding' ? '🚀 Onboarding de Cliente' : '🎯 Reunião de Vendas';
  el.responsavelDisplay.textContent = data.responsavel || '—';
  el.momentoCritico.textContent     = data.momento_critico;
  el.fraseIdeal.textContent         = data.frase_ideal;

  if (tipo === 'onboarding') {
    el.servicoMetaItem.style.display  = 'none';
    el.criteriaSubtitle.textContent   = '8 etapas do roteiro oficial Rota Studio';
    renderTopicos(data.topicos_perdidos);
  } else {
    el.servicoMetaItem.style.display  = 'flex';
    el.servicoDisplay.textContent     = data.servico || '—';
    el.criteriaSubtitle.textContent   = '6 critérios de performance do closer';
    el.topicosCard.style.display      = 'none';
  }

  renderCriteria(data.criterios, tipo);
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
    const name = item.responsavel || item.closer_name || '—';
    const sub  = tipo === 'onboarding' ? 'Onboarding' : escapeHtml(item.servico || '—');

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
  const servico      = currentTipo === 'onboarding' ? '' : el.servico.value;
  const tipo_reuniao = currentTipo;

  if (!transcricao || !responsavel) {
    showToast('Preencha todos os campos antes de analisar.');
    return;
  }
  if (currentTipo === 'vendas' && !servico) {
    showToast('Selecione o serviço sendo vendido.');
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
    const data = await apiPost({ transcricao, responsavel, servico, tipo_reuniao });
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

/* ── Init ───────────────────────────────────────────────── */
refreshHistory();
