import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from contextlib import asynccontextmanager
from analyzer import analyze_call
from database import Database
from dotenv import load_dotenv

load_dotenv()

db = Database()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init()
    yield


app = FastAPI(title="Analisador de Calls · Rota Studio", lifespan=lifespan)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    return FileResponse("static/index.html")


class AnalyzeRequest(BaseModel):
    transcricao: str
    responsavel: str
    servico: str = ""
    tipo_reuniao: str = "vendas"


@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        result = await analyze_call(request.transcricao, request.servico, request.tipo_reuniao)
        analysis_id = await db.save_analysis(
            responsavel=request.responsavel,
            servico=request.servico or request.tipo_reuniao,
            tipo_reuniao=request.tipo_reuniao,
            result=result,
        )
        return {
            "id": analysis_id,
            "responsavel": request.responsavel,
            "servico": request.servico,
            "tipo_reuniao": request.tipo_reuniao,
            **result,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar análise: {str(e)}")


@app.get("/history")
async def history():
    try:
        return await db.get_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: int):
    analysis = await db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    return analysis


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
