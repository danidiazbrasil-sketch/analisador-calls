import anthropic
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()

# ── Prompt: Reunião de Vendas (Closers) ──────────────────────────────────────

PROMPT_VENDAS = """Você é um avaliador especialista em vendas consultivas B2C para o mercado de saúde mental.
Analise esta transcrição de call de vendas com o rigor de um coach de alto nível, como se fosse dar um feedback completo ao closer.

PORTFÓLIO DA AGÊNCIA:
- Google Ads: tráfego pago para atrair pacientes, R$800-2000/mês (recorrente)
- Fotos IA: identidade visual profissional gerada por IA para o consultório (pagamento único)
- Website: site profissional com SEO e WhatsApp (pagamento único)
- Combo: todos os serviços em pacote com desconto

AVALIE OBRIGATORIAMENTE TODOS OS PONTOS ABAIXO:

1. MÉTRICAS OBJETIVAS — conte com precisão:
   - Quantas perguntas o closer fez ao longo da call? (conte cada "?" ou pergunta implícita)
   - Estime o percentual de tempo de fala: closer vs. prospect
   - Na venda consultiva o ideal é o closer falar no máximo 40-50% do tempo

2. SPIN SELLING — avalie cada pilar com rigor:
   - SITUAÇÃO: fez perguntas para mapear o contexto atual? (quantos pacientes, como os consegue, tem site, já investe em marketing, especialidade, atende online/presencial)
   - PROBLEMA: explorou as dores reais? (depende de indicação, agenda irregular, mês ruim financeiramente, quer desligar dos planos de saúde)
   - IMPLICAÇÃO: aprofundou as consequências do problema? (quanto deixa de ganhar sem previsibilidade, impacto na vida, quanto tempo ainda aguenta assim)
   - NECESSIDADE: levou o prospect a reconhecer e PEDIR pela solução? (o cliente verbalizou que precisava ou o closer empurrou?)

3. TÉCNICAS DE VENDA CONSULTIVA:
   - Escuta ativa: repetiu, validou e usou as palavras do próprio prospect?
   - Ancoragem de valor: traduziu o serviço em pacientes novos, não em cliques ou métricas técnicas?
   - Manejo de objeções: usou técnica (validar → explorar → recontextualizar) ou foi defensivo?
   - Urgência: criou motivo real para decidir agora sem ser manipulador?
   - Prova social: citou cases reais de outros psicólogos de forma específica?

4. ESTRATÉGIA DE PORTFÓLIO — analise o contexto para determinar:
   - Quais serviços foram discutidos
   - Se foram os certos dado o contexto deste psicólogo
   - Se houve oportunidade de cross-sell não aproveitada

CONTEXTO IMPORTANTE: Psicólogos são compradores céticos. Valorizam confiança, não pressão. O ROI deve sempre ser traduzido em pacientes novos, não em cliques. Pressão cria resistência e perde a venda.

TRANSCRIÇÃO:
{transcricao}

Retorne APENAS JSON válido, sem nenhum texto antes ou depois:
{{
  "nota_geral": 7.5,
  "classificacao": "Bom closer",
  "metricas": {{
    "perguntas_feitas": 8,
    "proporcao_fala_closer": 65,
    "proporcao_fala_prospect": 35,
    "diagnostico_proporcao": "Frase direta avaliando a proporção: se >60% closer é ruim para venda consultiva, se ~40-50% é ideal, se <40% pode ser que não conduziu bem"
  }},
  "spin_selling": {{
    "situacao": {{"aplicou": true, "nota": 7, "detalhe": "O que o closer fez ou deixou de fazer neste pilar com exemplo da transcrição"}},
    "problema": {{"aplicou": true, "nota": 6, "detalhe": "..."}},
    "implicacao": {{"aplicou": false, "nota": 3, "detalhe": "..."}},
    "necessidade": {{"aplicou": false, "nota": 2, "detalhe": "..."}},
    "avaliacao_geral": "1-2 frases resumindo o nível de SPIN usado na call e o impacto disso no resultado"
  }},
  "tecnicas": {{
    "escuta_ativa": {{"nota": 6, "observacao": "exemplo concreto da transcrição"}},
    "ancoragem_valor": {{"nota": 7, "observacao": "..."}},
    "manejo_objecoes": {{"nota": 5, "observacao": "..."}},
    "urgencia": {{"nota": 4, "observacao": "..."}},
    "prova_social": {{"nota": 6, "observacao": "..."}}
  }},
  "notas_avaliador": [
    "✅ Ponto positivo 1 específico com referência ao que aconteceu na call",
    "✅ Ponto positivo 2 específico",
    "🔴 Ponto crítico 1 com exemplo exato do que foi dito ou deixado de dizer",
    "🔴 Ponto crítico 2 com impacto claro",
    "💡 Oportunidade perdida específica que mudaria o resultado"
  ],
  "servicos_identificados": ["Google Ads"],
  "estrategia_portfolio": "2-3 frases sobre quais serviços o closer ofereceu, se foi a estratégia certa dado o contexto do psicólogo e o que poderia ter feito diferente",
  "criterios": {{
    "rapport": {{"nota": 8, "bem": "máximo 2 frases", "falhou": "máximo 2 frases", "melhoria": "1 frase direta e prática"}},
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
        prompt = PROMPT_VENDAS.format(transcricao=transcricao)

    message = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()

    json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text)
    if json_match:
        response_text = json_match.group(1).strip()

    # Fallback: extract from first { to last } in case there's surrounding text
    if not response_text.startswith('{'):
        brace_match = re.search(r'(\{[\s\S]*\})', response_text)
        if brace_match:
            response_text = brace_match.group(1)

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        raise ValueError("A IA retornou uma resposta inválida. Por favor, tente novamente.")
