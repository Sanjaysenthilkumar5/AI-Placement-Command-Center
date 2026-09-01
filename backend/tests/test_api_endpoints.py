import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_and_root():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    root_res = client.get("/")
    assert root_res.status_code == 200
    assert "AI Placement Command Center" in root_res.json()["app"]

def test_auth_login_and_demo():
    # Demo login
    res = client.post("/api/v1/auth/demo-login/admin")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "admin"

    # Student demo login
    st_res = client.post("/api/v1/auth/demo-login/student")
    assert st_res.status_code == 200
    assert st_res.json()["role"] == "student"

def test_get_students_and_filters():
    res = client.get("/api/v1/students?department=CSE")
    assert res.status_code == 200
    students = res.json()
    assert len(students) > 0
    assert all(s["department"] == "CSE" for s in students)

def test_get_jobs_and_ranking():
    jobs_res = client.get("/api/v1/jobs")
    assert jobs_res.status_code == 200
    jobs = jobs_res.json()
    assert len(jobs) > 0
    
    first_job_id = jobs[0]["id"]
    cand_res = client.get(f"/api/v1/matching/jobs/{first_job_id}/candidates")
    assert cand_res.status_code == 200
    candidates = cand_res.json()
    assert len(candidates) > 0
    assert candidates[0]["rank"] == 1
    assert candidates[0]["match_score"] >= candidates[1]["match_score"]

def test_analytics_and_eval():
    ana_res = client.get("/api/v1/analytics/dashboard")
    assert ana_res.status_code == 200
    ana_data = ana_res.json()
    assert ana_data["kpis"]["total_students"] >= 50

    eval_res = client.get("/api/v1/eval/benchmarks")
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["total_test_cases"] > 0
    assert eval_data["overall_accuracy_pct"] >= 80.0
