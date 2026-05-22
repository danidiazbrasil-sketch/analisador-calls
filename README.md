# Analisador de Calls

Ferramenta de análise de calls de vendas com IA para agências de marketing digital que vendem para psicólogos.

## Requisitos

- Python 3.10+
- Chave de API da Anthropic

## Instalação

```bash
# 1. Clone ou acesse o diretório
cd analisador-de-calls

# 2. Crie e ative um ambiente virtual
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure a chave de API
cp .env.example .env
# Edite o arquivo .env e insira sua ANTHROPIC_API_KEY
```

## Configuração

Edite o arquivo `.env` com sua chave da Anthropic:

```
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
```

Obtenha sua chave em: https://console.anthropic.com/

## Execução

```bash
uvicorn main:app --reload --port 8000
```

Acesse: http://localhost:8000

## Funcionalidades

- Análise de calls por IA (Claude Haiku) com 6 critérios avaliados
- Nota geral com classificação (Iniciante → Excelente)
- Breakdown por critério com barra de progresso colorida
- Identificação do momento crítico da call
- Sugestão de frase ideal
- Histórico das últimas 10 análises com recarregamento
- Suporte a 3 serviços: Google Ads, Fotos IA, Website

## Estrutura

```
analisador-de-calls/
├── main.py          # API FastAPI
├── analyzer.py      # Integração Anthropic + prompt
├── database.py      # SQLite (aiosqlite)
├── static/
│   ├── index.html   # Interface principal
│   ├── style.css    # Estilos
│   └── app.js       # Lógica frontend
├── requirements.txt
├── .env.example
└── README.md
```
