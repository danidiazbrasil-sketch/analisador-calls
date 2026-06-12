import os
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from contextlib import asynccontextmanager
from typing import Optional
from analyzer import analyze_call
from database import Database
from dotenv import load_dotenv

load_dotenv()

_db_path = os.getenv("DATABASE_PATH", "analyses.db")
db = Database(db_path=_db_path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init()
    yield


app = FastAPI(title="Analisador de Calls · Rota Studio", lifespan=lifespan)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    return FileResponse("static/index.html")


# ── Closers ───────────────────────────────────────────────────────────────────

class CloserCreate(BaseModel):
    nome: str
    tipo: str = "closer"
    meta_nota: float = 7.0

class CloserUpdate(BaseModel):
    nome: str
    tipo: str
    ativo: int
    meta_nota: float


@app.get("/closers")
async def list_closers(only_active: bool = False):
    return await db.get_closers(only_active=only_active)


@app.post("/closers")
async def create_closer(body: CloserCreate):
    try:
        closer_id = await db.create_closer(body.nome, body.tipo, body.meta_nota)
        return {"id": closer_id, "nome": body.nome, "tipo": body.tipo, "meta_nota": body.meta_nota}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/closers/{closer_id}")
async def update_closer(closer_id: int, body: CloserUpdate):
    await db.update_closer(closer_id, body.nome, body.tipo, body.ativo, body.meta_nota)
    return {"ok": True}


@app.delete("/closers/{closer_id}")
async def delete_closer(closer_id: int):
    await db.delete_closer(closer_id)
    return {"ok": True}


@app.post("/closers/link-history")
async def link_history():
    total = await db.link_analyses_by_name()
    return {"linked": total}


# ── Analyses ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    transcricao: str
    responsavel: str
    cliente: str = ""
    servico: str = ""
    tipo_reuniao: str = "vendas"
    closer_id: Optional[int] = None


@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        result = await analyze_call(request.transcricao, request.servico, request.tipo_reuniao)
        analysis_id = await db.save_analysis(
            responsavel=request.responsavel,
            cliente=request.cliente,
            servico=request.servico or request.tipo_reuniao,
            tipo_reuniao=request.tipo_reuniao,
            result=result,
            closer_id=request.closer_id or None,
        )
        return {
            "id":           analysis_id,
            "responsavel":  request.responsavel,
            "cliente":      request.cliente,
            "servico":      request.servico,
            "tipo_reuniao": request.tipo_reuniao,
            "closer_id":    request.closer_id,
            "comentario":   "",
            **result,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar análise: {str(e)}")


@app.get("/history")
async def history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    closer_id: Optional[int] = None,
    tipo: Optional[str] = None,
):
    try:
        return await db.get_history(page=page, limit=limit, closer_id=closer_id, tipo=tipo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: int):
    analysis = await db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    return analysis


class ComentarioBody(BaseModel):
    comentario: str


@app.put("/analysis/{analysis_id}/comentario")
async def update_comentario(analysis_id: int, body: ComentarioBody):
    await db.update_comentario(analysis_id, body.comentario)
    return {"ok": True}


# ── Performance & Stats ───────────────────────────────────────────────────────

@app.get("/performance")
async def performance(days: Optional[int] = None, tipo_reuniao: str = "vendas"):
    try:
        return await db.get_performance(days=days, tipo_reuniao=tipo_reuniao)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/team-stats")
async def team_stats(days: Optional[int] = None, tipo_reuniao: str = "vendas"):
    try:
        return await db.get_team_stats(days=days, tipo_reuniao=tipo_reuniao)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
