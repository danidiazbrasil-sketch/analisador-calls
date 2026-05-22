import anthropic
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()

PROMPT_TEMPLATE = """Você é um especialista em vendas consultivas B2C para o mercado de saúde mental.
Analise a transcrição desta call de vendas de uma agência de marketing digital que vende {servico} para psicólogos.

Contexto do produto sendo vendido:
- Google Ads: gestão de tráfego pago para atrair pacientes, investimento médio R$800-2000/mês
- Fotos IA: identidade visual profissional gerada por IA para o consultório, pagamento único
- Website: criação de site profissional para psicólogo, com SEO e integração com WhatsApp

Avalie com base em como um closer experiente neste nicho específico agiria.
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
    "qualificacao": {{
      "nota": 6,
      "bem": "...",
      "falhou": "...",
      "melhoria": "..."
    }},
    "apresentacao": {{
      "nota": 7,
      "bem": "...",
      "falhou": "...",
      "melhoria": "..."
    }},
    "objecoes": {{
      "nota": 5,
      "bem": "...",
      "falhou": "...",
      "melhoria": "..."
    }},
    "fechamento": {{
      "nota": 6,
      "bem": "...",
      "falhou": "...",
      "melhoria": "..."
    }},
    "autoridade": {{
      "nota": 7,
      "bem": "...",
      "falhou": "...",
      "melhoria": "..."
    }}
  }},
  "momento_critico": "Trecho exato da transcrição onde o resultado da venda foi definido",
  "frase_ideal": "Frase exata que o closer deveria ter dito naquele momento"
}}"""


async def analyze_call(transcricao: str, servico: str) -> dict:
    if not transcricao or len(transcricao.strip()) < 50:
        raise ValueError("Transcrição muito curta. Insira a transcrição completa da call.")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY não configurada. Verifique o arquivo .env")

    client = anthropic.AsyncAnthropic(api_key=api_key)

    prompt = PROMPT_TEMPLATE.format(servico=servico, transcricao=transcricao)

    message = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()

    # Extract JSON from markdown code blocks if present
    json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text)
    if json_match:
        response_text = json_match.group(1).strip()

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        raise ValueError("A IA retornou uma resposta inválida. Por favor, tente novamente.")
