import anthropic
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()

# ── Prompt: Reunião de Vendas (Closers) ──────────────────────────────────────

PROMPT_VENDAS = """Você é um especialista em vendas consultivas B2C para o mercado de saúde mental.
Analise a transcrição desta call de vendas de uma agência de marketing digital que vende {servico} para psicólogos.

Contexto dos produtos:
- Google Ads: gestão de tráfego pago para atrair pacientes, investimento médio R$800-2000/mês
- Fotos IA: identidade visual profissional gerada por IA para o consultório, pagamento único
- Website: criação de site profissional para psicólogo, com SEO e integração com WhatsApp

{contexto_combo}Avalie com base em como um closer experiente neste nicho específico agiria.
Psicólogos são compradores céticos, valorizam confiança, não gostam de pressão e precisam entender o ROI em pacientes novos, não em cliques.

Transcrição:
{transcricao}

Retorne APENAS um JSON válido com esta estrutura exata, sem texto antes ou depois:
{{
  "nota_geral": 7.5,
  "classificacao": "Bom closer",
  "criterios": {{
    "rapport": {{
      "nota": 8,
      "bem": "Personalizou a abordagem para psicólogos",
      "falhou": "Não perguntou sobre a especialidade do psicólogo",
      "melhoria": "Pergunte a especialidade logo no início para personalizar ainda mais"
    }},
    "qualificacao": {{"nota": 6, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "apresentacao": {{"nota": 7, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "objecoes": {{"nota": 5, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "fechamento": {{"nota": 6, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "autoridade": {{"nota": 7, "bem": "...", "falhou": "...", "melhoria": "..."}}
  }},
  "momento_critico": "Trecho exato da transcrição onde o resultado da venda foi definido",
  "frase_ideal": "Frase exata que o closer deveria ter dito naquele momento"
}}"""

# ── Prompt: Reunião de Onboarding (Gestores de Tráfego) ──────────────────────

PROMPT_ONBOARDING = """Você é um especialista em gestão de clientes e onboarding para agências de marketing digital no nicho de saúde.
Analise a transcrição desta reunião de onboarding conduzida por um gestor de tráfego da Rota Studio com um cliente psicólogo.

O roteiro oficial de onboarding da Rota Studio tem 8 etapas obrigatórias:

1. ABERTURA: Cumprimentar e dar boas-vindas, se apresentar ("Sou [NOME], gestor responsável pelo seu tráfego aqui na Rota"), criar conexão com pergunta ("Como você está se sentindo com o início dessa nova fase do seu marketing?")

2. CONTEXTUALIZAÇÃO: Explicar o objetivo da reunião ("Hoje vamos conectar sua conta, validar informações estratégicas e te entregar o Script de Vendas para começarmos com o pé direito")

3. CONEXÃO DA CONTA: Solicitar ou criar acesso ao Google Ads e GTM, verificar Google Meu Negócio se houver, confirmar que os acessos estão prontos

4. VALIDAÇÃO ESTRATÉGICA: Confirmar e registrar — nicho/especialidade, cidade/região de atendimento, formato das sessões (online/presencial), valor da sessão. Justificar: "Pergunto isso para garantir que as campanhas sejam direcionadas para o público certo"

5. ENTREGA DO SCRIPT DE VENDAS: Enviar o script no WhatsApp, orientar o uso, reforçar que "o diferencial não é o volume de leads, e sim a sua conversão"

6. ALINHAMENTO DE EXPECTATIVAS: Explicar o papel da Rota (tráfego + direcionamento), reforçar que Instagram deve estar ativo e com clareza de nicho, que sessão acima de R$250 exige posicionamento, que o cliente deve responder rápido no WhatsApp. Frase obrigatória: "Tráfego traz pessoas até você. Conversão acontece por causa do seu posicionamento e do seu comercial."

7. SUPORTE E PRÓXIMOS PASSOS: Informar sobre aulas da comunidade, encontros mensais com a Cami, suporte no grupo. Transmitir: "Você nunca vai sentir que está sozinho(a)."

8. ENCERRAMENTO: Reforçar segurança e entusiasmo ("Agora é com a gente. Vamos começar suas campanhas."), finalizar com abertura para dúvidas ("Se surgir qualquer dúvida após a reunião, me chama aqui no grupo.")

Avalie com rigor se cada etapa foi executada de forma completa e com qualidade. Psicólogos precisam sentir segurança e clareza. Um gestor que pula etapas ou não transmite confiança compromete toda a retenção do cliente.

As etapas mais críticas (que mais impactam a nota geral) são: VALIDAÇÃO ESTRATÉGICA, ALINHAMENTO DE EXPECTATIVAS e CONEXÃO DA CONTA.

Transcrição:
{transcricao}

Retorne APENAS um JSON válido com esta estrutura exata, sem texto antes ou depois:
{{
  "nota_geral": 7.5,
  "classificacao": "Bom onboarding",
  "criterios": {{
    "abertura": {{"nota": 8, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "contextualizacao": {{"nota": 7, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "conexao_conta": {{"nota": 6, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "validacao_estrategica": {{"nota": 8, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "script_vendas": {{"nota": 7, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "alinhamento_expectativas": {{"nota": 5, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "suporte": {{"nota": 8, "bem": "...", "falhou": "...", "melhoria": "..."}},
    "encerramento": {{"nota": 9, "bem": "...", "falhou": "...", "melhoria": "..."}}
  }},
  "topicos_perdidos": ["Etapa ou tópico obrigatório que não foi coberto ou foi incompleto"],
  "momento_critico": "Trecho exato onde a reunião ganhou ou perdeu qualidade",
  "frase_ideal": "Frase que o gestor deveria ter dito para melhorar aquele momento"
}}"""


async def analyze_call(transcricao: str, servico: str, tipo_reuniao: str = "vendas") -> dict:
    if not transcricao or len(transcricao.strip()) < 50:
        raise ValueError("Transcrição muito curta. Insira a transcrição completa da reunião.")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY não configurada. Verifique o arquivo .env")

    client = anthropic.AsyncAnthropic(api_key=api_key)

    if tipo_reuniao == "onboarding":
        prompt = PROMPT_ONBOARDING.format(transcricao=transcricao)
    else:
        is_combo = "combo" in servico.lower()
        contexto_combo = (
            """Atenção: esta call envolve a venda do COMBO completo (todos os 3 serviços juntos).
Avalie especialmente:
- Se o closer qualificou qual serviço o psicólogo precisa mais antes de apresentar o combo
- Se apresentou os serviços na ordem lógica: Website → Google Ads → Fotos IA
- Se soube ancorar o valor do combo vs. preço individual de cada serviço
- Se propôs próximo passo claro mesmo que o psicólogo não fechasse tudo de uma vez

"""
            if is_combo
            else ""
        )
        prompt = PROMPT_VENDAS.format(
            servico=servico,
            transcricao=transcricao,
            contexto_combo=contexto_combo,
        )

    message = await client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()

    json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text)
    if json_match:
        response_text = json_match.group(1).strip()

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        raise ValueError("A IA retornou uma resposta inválida. Por favor, tente novamente.")
