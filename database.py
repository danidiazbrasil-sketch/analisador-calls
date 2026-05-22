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
                    closer_name TEXT NOT NULL,
                    servico TEXT NOT NULL,
                    nota_geral REAL NOT NULL,
                    classificacao TEXT NOT NULL,
                    result TEXT NOT NULL
                )
            """)
            await db.commit()

    async def save_analysis(self, closer_name: str, servico: str, result: dict) -> int:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                """
                INSERT INTO analyses (closer_name, servico, nota_geral, classificacao, result)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    closer_name,
                    servico,
                    result["nota_geral"],
                    result["classificacao"],
                    json.dumps(result, ensure_ascii=False),
                ),
            )
            await db.commit()
            return cursor.lastrowid

    async def get_history(self) -> list:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                """
                SELECT id, created_at, closer_name, servico, nota_geral, classificacao
                FROM analyses
                ORDER BY created_at DESC
                LIMIT 10
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
                "closer_name": row_dict["closer_name"],
                "servico": row_dict["servico"],
                **result,
            }
