import aiosqlite
import json
from typing import Optional


class Database:
    def __init__(self, db_path: str = "analyses.db"):
        self.db_path = db_path

    async def init(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    responsavel TEXT NOT NULL,
                    cliente TEXT DEFAULT '',
                    servico TEXT NOT NULL,
                    nota_geral REAL NOT NULL,
                    classificacao TEXT NOT NULL,
                    result TEXT NOT NULL,
                    tipo_reuniao TEXT DEFAULT 'vendas'
                )
            """)
            # Migrations for existing databases
            for col, definition in [
                ("tipo_reuniao", "TEXT DEFAULT 'vendas'"),
                ("responsavel", "TEXT DEFAULT ''"),
                ("cliente",     "TEXT DEFAULT ''"),
            ]:
                try:
                    await db.execute(f"ALTER TABLE analyses ADD COLUMN {col} {definition}")
                except Exception:
                    pass
            await db.commit()

    async def save_analysis(
        self, responsavel: str, cliente: str, servico: str, tipo_reuniao: str, result: dict
    ) -> int:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                """
                INSERT INTO analyses (responsavel, cliente, servico, nota_geral, classificacao, result, tipo_reuniao)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    responsavel,
                    cliente,
                    servico,
                    result["nota_geral"],
                    result["classificacao"],
                    json.dumps(result, ensure_ascii=False),
                    tipo_reuniao,
                ),
            )
            await db.commit()
            return cursor.lastrowid

    async def get_history(self) -> list:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                """
                SELECT id, created_at, responsavel, cliente, servico, nota_geral, classificacao, tipo_reuniao
                FROM analyses
                ORDER BY created_at DESC
                LIMIT 20
                """
            )
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def get_analysis(self, analysis_id: int) -> Optional[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM analyses WHERE id = ?",
                (analysis_id,),
            )
            row = await cursor.fetchone()
            if row is None:
                return None
            row_dict = dict(row)
            result = json.loads(row_dict["result"])
            return {
                "id": row_dict["id"],
                "created_at": row_dict["created_at"],
                "responsavel": row_dict.get("responsavel") or row_dict.get("closer_name", ""),
                "cliente": row_dict.get("cliente", ""),
                "servico": row_dict["servico"],
                "tipo_reuniao": row_dict.get("tipo_reuniao", "vendas"),
                **result,
            }
