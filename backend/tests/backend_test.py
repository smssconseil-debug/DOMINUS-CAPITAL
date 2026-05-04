"""Backend tests for Trading Dashboard"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://analytics-board-46.preview.emergentagent.com').rstrip('/')


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def authed_session(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": "admin@example.com", "password": "admin123"})
    assert r.status_code == 200, f"Login failed: {r.text}"
    return session


# -- Auth tests --
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "admin@example.com", "password": "admin123"})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == "admin@example.com"
        assert data["role"] == "admin"
        assert "password_hash" not in data
        assert "access_token" in r.cookies

    def test_login_invalid(self, session):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "admin@example.com", "password": "wrong"})
        assert r.status_code == 401

    def test_me_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_authenticated(self, authed_session):
        r = authed_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == "admin@example.com"


# -- Dashboard metrics tests --
class TestDashboard:
    def test_metrics_unauth(self):
        r = requests.get(f"{BASE_URL}/api/dashboard/metrics")
        assert r.status_code == 401

    def test_metrics_full(self, authed_session):
        r = authed_session.get(f"{BASE_URL}/api/dashboard/metrics")
        assert r.status_code == 200
        d = r.json()
        for key in ["kpis", "daily", "monthly", "hourly", "mep", "chart"]:
            assert key in d
        kpis = d["kpis"]
        for key in ["lucro_liquido", "lucro_bruto", "custos", "operacoes",
                    "gains", "loss", "assertividade", "dias_operados",
                    "drawdown", "runup"]:
            assert key in kpis
        assert kpis["operacoes"] > 0
        assert kpis["gains"] + kpis["loss"] == kpis["operacoes"]

    def test_metrics_filter_mes(self, authed_session):
        r = authed_session.get(f"{BASE_URL}/api/dashboard/metrics?mes=janeiro")
        assert r.status_code == 200
        d = r.json()
        # Filtered dataset should have only 1 month group
        assert len(d["monthly"]) <= 1

    def test_metrics_filter_dia(self, authed_session):
        r = authed_session.get(f"{BASE_URL}/api/dashboard/metrics?dia=5")
        assert r.status_code == 200
        d = r.json()
        for row in d["daily"]:
            assert row["dia"] == 5

    def test_metrics_filter_periodo(self, authed_session):
        r = authed_session.get(f"{BASE_URL}/api/dashboard/metrics?periodo=Manhã")
        assert r.status_code == 200

    def test_logout(self, authed_session):
        r = authed_session.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200
