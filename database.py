import aiosqlite
import json
from datetime import datetime, timedelta
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
            await db.execute("""
                CREATE TABLE IF NOT EXISTS closers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    tipo TEXT DEFAULT 'closer',
                    ativo INTEGER DEFAULT 1,
                    meta_nota REAL DEFAULT 7.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Migrations para bancos existentes
            for col, definition in [
                ("tipo_reuniao", "TEXT DEFAULT 'vendas'"),
                ("responsavel",  "TEXT DEFAULT ''"),
                ("cliente",      "TEXT DEFAULT ''"),
                ("closer_id",    "INTEGER"),
                ("comentario",   "TEXT DEFAULT ''"),
            ]:
                try:
                    await db.execute(f"ALTER TABLE analyses ADD COLUMN {col} {definition}")
                except Exception:
                    pass
            await db.commit()

    # ── Closers CRUD ──────────────────────────────────────────────────────────

    async def get_closers(self, only_active: bool = False) -> list:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            q = "SELECT * FROM closers" + (" WHERE ativo=1" if only_active else "") + " ORDER BY nome"
            cursor = await db.execute(q)
            return [dict(r) for r in await cursor.fetchall()]

    async def create_closer(self, nome: str, tipo: str, meta_nota: float = 7.0) -> int:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                "INSERT INTO closers (nome, tipo, meta_nota) VALUES (?, ?, ?)",
                (nome.strip(), tipo, meta_nota),
            )
            await db.commit()
            # Auto-vincular análises existentes com esse nome
            await db.execute(
                """UPDATE analyses SET closer_id=?
                   WHERE closer_id IS NULL AND LOWER(TRIM(responsavel))=LOWER(TRIM(?))""",
                (cursor.lastrowid, nome.strip()),
            )
            await db.commit()
            return cursor.lastrowid

    async def update_closer(self, closer_id: int, nome: str, tipo: str, ativo: int, meta_nota: float):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "UPDATE closers SET nome=?, tipo=?, ativo=?, meta_nota=? WHERE id=?",
                (nome.strip(), tipo, ativo, meta_nota, closer_id),
            )
            await db.commit()

    async def delete_closer(self, closer_id: int):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("UPDATE closers SET ativo=0 WHERE id=?", (closer_id,))
            await db.commit()

    async def link_analyses_by_name(self) -> int:
        """Vincula análises sem closer_id aos closers cadastrados por nome. Retorna total vinculado."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            closers = await (await db.execute("SELECT id, nome FROM closers")).fetchall()
            total = 0
            for c in closers:
                cur = await db.execute(
                    """UPDATE analyses SET closer_id=?
                       WHERE closer_id IS NULL AND LOWER(TRIM(responsavel))=LOWER(TRIM(?))""",
                    (c["id"], c["nome"]),
                )
                total += cur.rowcount
            await db.commit()
            return total

    # ── Analyses ──────────────────────────────────────────────────────────────

    async def save_analysis(
        self,
        responsavel: str,
        cliente: str,
        servico: str,
        tipo_reuniao: str,
        result: dict,
        closer_id: Optional[int] = None,
    ) -> int:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                """INSERT INTO analyses
                   (responsavel, cliente, servico, nota_geral, classificacao, result, tipo_reuniao, closer_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    responsavel,
                    cliente,
                    servico,
                    result["nota_geral"],
                    result["classificacao"],
                    json.dumps(result, ensure_ascii=False),
                    tipo_reuniao,
                    closer_id,
                ),
            )
            await db.commit()
            return cursor.lastrowid

    async def get_history(
        self,
        page: int = 1,
        limit: int = 20,
        closer_id: Optional[int] = None,
        tipo: Optional[str] = None,
    ) -> dict:
        offset = (page - 1) * limit
        conds, params = [], []
        if closer_id:
            conds.append("closer_id=?"); params.append(closer_id)
        if tipo:
            conds.append("tipo_reuniao=?"); params.append(tipo)
        where = ("WHERE " + " AND ".join(conds)) if conds else ""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            total = (await (await db.execute(f"SELECT COUNT(*) FROM analyses {where}", params)).fetchone())[0]
            cursor = await db.execute(
                f"""SELECT id, created_at, responsavel, cliente, servico,
                           nota_geral, classificacao, tipo_reuniao, closer_id
                    FROM analyses {where} ORDER BY created_at DESC LIMIT ? OFFSET ?""",
                params + [limit, offset],
            )
            items = [dict(r) for r in await cursor.fetchall()]
            return {"items": items, "total": total, "page": page, "limit": limit}

    async def get_analysis(self, analysis_id: int) -> Optional[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            row = await (await db.execute("SELECT * FROM analyses WHERE id=?", (analysis_id,))).fetchone()
            if not row:
                return None
            rd = dict(row)
            return {
                "id":           rd["id"],
                "created_at":   rd["created_at"],
                "responsavel":  rd.get("responsavel") or rd.get("closer_name", ""),
                "cliente":      rd.get("cliente", ""),
                "closer_id":    rd.get("closer_id"),
                "servico":      rd["servico"],
                "tipo_reuniao": rd.get("tipo_reuniao", "vendas"),
                "comentario":   rd.get("comentario", ""),
                **json.loads(rd["result"]),
            }

    async def update_comentario(self, analysis_id: int, comentario: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("UPDATE analyses SET comentario=? WHERE id=?", (comentario, analysis_id))
            await db.commit()

    # ── Performance & Stats ───────────────────────────────────────────────────

    def _date_filter(self, days: Optional[int]):
        if not days:
            return "", []
        since = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
        return "AND created_at >= ?", [since]

    async def get_performance(self, days: Optional[int] = None, tipo_reuniao: str = "vendas") -> list:
        df, dp = self._date_filter(days)
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            closers = {
                c["id"]: dict(c)
                for c in await (await db.execute("SELECT * FROM closers")).fetchall()
            }
            rows = await (await db.execute(
                f"SELECT id, responsavel, closer_id, nota_geral, result, created_at FROM analyses WHERE tipo_reuniao=? {df} ORDER BY created_at ASC",
                [tipo_reuniao] + dp,
            )).fetchall()

            groups: dict = {}
            for r in rows:
                r = dict(r)
                cid = r["closer_id"]
                key = f"id:{cid}" if cid else f"name:{r['responsavel'].strip().upper()}"
                if key not in groups:
                    groups[key] = {
                        "rows": [],
                        "closer": closers.get(cid) if cid else {
                            "id": None, "nome": r["responsavel"], "tipo": "closer", "meta_nota": 7.0, "ativo": 1,
                        },
                    }
                groups[key]["rows"].append(r)

            result = []
            for group in groups.values():
                rs = group["rows"]
                notas = [r["nota_geral"] for r in rs]
                avg = round(sum(notas) / len(notas), 2) if notas else 0

                csum, ccnt = {}, {}
                for r in rs:
                    try:
                        for crit, d in json.loads(r["result"]).get("criterios", {}).items():
                            csum[crit] = csum.get(crit, 0) + d.get("nota", 0)
                            ccnt[crit] = ccnt.get(crit, 0) + 1
                    except Exception:
                        pass
                criterios_avg = {k: round(csum[k] / ccnt[k], 2) for k in csum}

                result.append({
                    "closer":       group["closer"],
                    "total_calls":  len(rs),
                    "avg_nota":     avg,
                    "criterios_avg": criterios_avg,
                    "evolucao":     [{"data": r["created_at"][:10], "nota": r["nota_geral"]} for r in rs],
                })

            result.sort(key=lambda x: x["avg_nota"], reverse=True)
            return result

    async def get_team_stats(self, days: Optional[int] = None, tipo_reuniao: str = "vendas") -> dict:
        df, dp = self._date_filter(days)
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            rows = await (await db.execute(
                f"SELECT nota_geral, result, closer_id FROM analyses WHERE tipo_reuniao=? {df}",
                [tipo_reuniao] + dp,
            )).fetchall()

            if not rows:
                return {"total_calls": 0, "avg_nota": 0, "weak_criteria": [], "closers_count": 0, "meta_atingida_count": 0, "criterios_avg": {}}

            notas = [r["nota_geral"] for r in rows]
            cids = set(r["closer_id"] for r in rows if r["closer_id"])

            csum, ccnt = {}, {}
            for r in rows:
                try:
                    for crit, d in json.loads(r["result"]).get("criterios", {}).items():
                        csum[crit] = csum.get(crit, 0) + d.get("nota", 0)
                        ccnt[crit] = ccnt.get(crit, 0) + 1
                except Exception:
                    pass
            criterios_avg = {k: round(csum[k] / ccnt[k], 2) for k in csum}
            weak = sorted([{"criterio": k, "avg_nota": v} for k, v in criterios_avg.items()], key=lambda x: x["avg_nota"])

            metas = {c["id"]: c["meta_nota"] for c in await (await db.execute("SELECT id, meta_nota FROM closers WHERE ativo=1")).fetchall()}
            closer_notas: dict = {}
            for r in rows:
                if r["closer_id"]:
                    closer_notas.setdefault(r["closer_id"], []).append(r["nota_geral"])
            meta_ok = sum(1 for cid, ns in closer_notas.items() if cid in metas and sum(ns) / len(ns) >= metas[cid])

            return {
                "total_calls":        len(notas),
                "avg_nota":           round(sum(notas) / len(notas), 2),
                "closers_count":      len(cids),
                "meta_atingida_count": meta_ok,
                "weak_criteria":      weak[:5],
                "criterios_avg":      criterios_avg,
            }
