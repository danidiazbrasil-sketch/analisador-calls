/* ── DOM references ─────────────────────────────────────── */
const el = {
  form:              document.getElementById('analyzeForm'),
  transcricao:       document.getElementById('transcricao'),
  closerName:        document.getElementById('closerName'),
  servico:           document.getElementById('servico'),
  submitBtn:         document.getElementById('submitBtn'),
  emptyResultsCard:  document.getElementById('emptyResultsCard'),
  loadingResultsCard:document.getElementById('loadingResultsCard'),
  resultsArea:       document.getElementById('resultsArea'),
  historyList:       document.getElementById('historyList'),
  scoreNum:          document.getElementById('scoreNum'),
  scoreCircle:       document.getElementById('scoreCircle'),
  classificationPill:document.getElementById('classificationPill'),
  closerNameDisplay: document.getElementById('closerNameDisplay'),
  servicoDisplay:    document.getElementById('servicoDisplay'),
  criteriaGrid:      document.getElementById('criteriaGrid'),
  momentoCritico:    document.getElementById('momentoCritico'),
  fraseIdeal:        document.getElementById('fraseIdeal'),
  errorToast:        document.getElementById('errorToast'),
};

/* ── Helpers ────────────────────────────────────────────── */
function scoreClass(n) {
  if (n >= 8) return 'good';
  if (n >= 5) return 'mid';
  return 'bad';
}

function formatDate(s) {
  const d = new Date(s.replace(' ', 'T') + 'Z');
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(s)));
  return d.innerHTML;
}

const CRITERION_META = {
  rapport:      { label: 'Rapport',       icon: '🤝' },
  qualificacao: { label: 'Qualificação',  icon: '🔍' },
  apresentacao: { label: 'Apresentação',  icon: '📋' },
  objecoes:     { label: 'Objeções',      icon: '💬' },
  fechamento:   { label: 'Fechamento',    icon: '🎯' },
  autoridade:   { label: 'Autoridade',    icon: '⭐' },
};

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
  setTimeout(() => el.errorToast.classList.remove('show'), 4200);
}

/* ── Rendering ──────────────────────────────────────────── */
function renderScore(nota) {
  const cls = scoreClass(nota);
  el.scoreNum.textContent = nota;
  el.scoreCircle.className = `score-circle ${cls}`;
}

function renderCriteria(criterios) {
  el.criteriaGrid.innerHTML = '';

  for (const [key, data] of Object.entries(criterios)) {
    const meta = CRITERION_META[key] || { label: key, icon: '📊' };
    const cls  = scoreClass(data.nota);
    const pct  = (data.nota / 10) * 100;

    const card = document.createElement('div');
    card.className = 'criterion-card';
    card.innerHTML = `
      <div class="criterion-header">
        <span class="criterion-name">${meta.icon} ${meta.label}</span>
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

  // Animate bars on next frame
  requestAnimationFrame(() => {
    document.querySelectorAll('.progress-bar[data-target]').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  });
}

function renderResults(data) {
  renderScore(data.nota_geral);
  el.classificationPill.textContent = data.classificacao;
  el.closerNameDisplay.textContent  = data.closer_name || '—';
  el.servicoDisplay.textContent     = data.servico     || '—';
  el.momentoCritico.textContent     = data.momento_critico;
  el.fraseIdeal.textContent         = data.frase_ideal;
  renderCriteria(data.criterios);
  showPanel('results');
}

function renderHistory(items) {
  if (!items || items.length === 0) {
    el.historyList.innerHTML = '<div class="empty-history">Nenhuma análise realizada ainda</div>';
    return;
  }
  el.historyList.innerHTML = '';
  items.forEach(item => {
    const cls  = scoreClass(item.nota_geral);
    const date = formatDate(item.created_at);
    const div  = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-info">
        <div class="history-closer">${escapeHtml(item.closer_name)}</div>
        <div class="history-meta">${escapeHtml(date)} · ${escapeHtml(item.servico)}</div>
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

/* ── API Calls ──────────────────────────────────────────── */
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
  if (window.innerWidth < 1100) {
    el.loadingResultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  try {
    const data = await apiGetAnalysis(id);
    renderResults(data);
    if (window.innerWidth < 1100) {
      el.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (err) {
    showToast('Erro ao carregar análise: ' + err.message);
    showPanel('empty');
  }
}

async function refreshHistory() {
  try {
    const items = await apiHistory();
    renderHistory(items);
  } catch {
    // silently ignore; history is non-critical
  }
}

/* ── Form submit ────────────────────────────────────────── */
el.form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const transcricao  = el.transcricao.value.trim();
  const closer_name  = el.closerName.value.trim();
  const servico      = el.servico.value;

  if (!transcricao || !closer_name || !servico) {
    showToast('Preencha todos os campos antes de analisar.');
    return;
  }
  if (transcricao.length < 50) {
    showToast('A transcrição parece muito curta. Cole a call completa.');
    return;
  }

  el.submitBtn.disabled = true;
  el.submitBtn.innerHTML = '<span class="spinner-sm"></span> Analisando...';
  showPanel('loading');
  if (window.innerWidth < 1100) {
    el.loadingResultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  try {
    const data = await apiPost({ transcricao, closer_name, servico });
    renderResults(data);
    refreshHistory();
    if (window.innerWidth < 1100) {
      el.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (err) {
    showToast(err.message);
    showPanel('empty');
  } finally {
    el.submitBtn.disabled = false;
    el.submitBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Analisar Call</span>';
  }
});

/* ── Init ───────────────────────────────────────────────── */
refreshHistory();
