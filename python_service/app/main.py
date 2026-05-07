from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="MediSync Python Service", version="1.0.0")


class ReportRequest(BaseModel):
    patient_name: str
    summary: str


@app.get("/health")
def health():
    return {"ok": True, "service": "python-medical-automation"}


@app.post("/analysis/risk-score")
def risk_score(payload: dict):
    # Placeholder for future ML pipeline.
    return {"patient": payload.get("patient", "unknown"), "risk_score": 0.22}


@app.post("/reports/generate")
def generate_report(payload: ReportRequest):
    return {
        "title": f"Reporte medico - {payload.patient_name}",
        "content": payload.summary,
        "status": "generated",
    }
