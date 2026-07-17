"""FitForge Gym backend regression tests."""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8000').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@fitforge.com"
ADMIN_PASSWORD = "FitForge@2026"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- Health ----------------
class TestHealth:
    def test_root(self, s):
        r = s.get(f"{API}/", timeout=15)
        assert r.status_code == 200

    def test_health(self, s):
        r = s.get(f"{API}/health", timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


# ---------------- Auth ----------------
class TestAuth:
    def test_login_success(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"
        assert d["access_token"]

    def test_login_invalid(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code in (401, 429)

    def test_me_requires_token(self, s):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_admin_endpoint_unauth(self):
        r = requests.get(f"{API}/admin/services")
        assert r.status_code == 401


# ---------------- Public content ----------------
class TestPublicContent:
    @pytest.mark.parametrize("key", ["hero", "about", "contact", "seo", "site-settings"])
    def test_content_get(self, key):
        r = requests.get(f"{API}/content/{key}")
        assert r.status_code == 200
        assert isinstance(r.json(), dict)

    def test_hero_has_stats(self):
        r = requests.get(f"{API}/content/hero")
        d = r.json()
        assert d["tagline"]
        assert len(d["stats"]) == 4

    @pytest.mark.parametrize("name", ["services", "plans", "trainers", "testimonials", "faqs", "schedule", "gallery", "features"])
    def test_public_list(self, name):
        r = requests.get(f"{API}/{name}")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)

    def test_services_seeded(self):
        r = requests.get(f"{API}/services")
        assert len(r.json()) >= 1


# ---------------- BMI ----------------
class TestBMI:
    def test_bmi_healthy(self):
        r = requests.post(f"{API}/bmi", json={"height_cm": 170, "weight_kg": 70})
        assert r.status_code == 200
        d = r.json()
        assert d["bmi"] == round(70 / 1.7 / 1.7, 1)
        assert d["category"] == "Healthy"
        assert d["advice"]

    def test_bmi_invalid(self):
        r = requests.post(f"{API}/bmi", json={"height_cm": 0, "weight_kg": 70})
        assert r.status_code == 400


# ---------------- Lead submissions ----------------
class TestLeads:
    def test_inquiry(self):
        r = requests.post(f"{API}/inquiries", json={
            "name": "TEST_Inquirer", "phone": "+919999999999",
            "email": "test_inq@example.com", "fitness_goal": "Weight loss",
            "plan": "Pro", "preferred_time": "Morning", "message": "TEST"
        })
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_newsletter(self):
        email = f"test_news_{uuid.uuid4().hex[:6]}@example.com"
        r = requests.post(f"{API}/newsletter/subscribe", json={"email": email})
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_contact(self):
        r = requests.post(f"{API}/contact", json={
            "name": "TEST_Contact", "email": "test_c@example.com",
            "phone": "1234", "subject": "TEST", "message": "TEST msg"
        })
        assert r.status_code == 200

    def test_trial(self):
        r = requests.post(f"{API}/trial-bookings", json={
            "name": "TEST_Trial", "phone": "12345",
            "email": "test_trial@example.com", "preferred_date": "2026-02-01"
        })
        assert r.status_code == 200


# ---------------- Admin Services CRUD ----------------
class TestServicesCRUD:
    created_id = None

    def test_create(self, auth_headers):
        r = requests.post(f"{API}/admin/services", headers=auth_headers, json={
            "title": "TEST_Service", "description": "Test desc",
            "icon": "Dumbbell", "order": 99, "is_active": True
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["title"] == "TEST_Service"
        TestServicesCRUD.created_id = d["id"]

    def test_list_admin(self, auth_headers):
        r = requests.get(f"{API}/admin/services", headers=auth_headers)
        assert r.status_code == 200
        ids = [i["id"] for i in r.json()]
        assert TestServicesCRUD.created_id in ids

    def test_update(self, auth_headers):
        r = requests.put(f"{API}/admin/services/{TestServicesCRUD.created_id}",
                         headers=auth_headers, json={
                             "title": "TEST_Service_Updated", "description": "Test desc",
                             "icon": "Dumbbell", "order": 99, "is_active": True
                         })
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_Service_Updated"

    def test_public_reflects(self):
        r = requests.get(f"{API}/services")
        titles = [i["title"] for i in r.json()]
        assert "TEST_Service_Updated" in titles

    def test_delete(self, auth_headers):
        r = requests.delete(f"{API}/admin/services/{TestServicesCRUD.created_id}", headers=auth_headers)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/admin/services/{TestServicesCRUD.created_id}", headers=auth_headers)
        assert r2.status_code == 404


# ---------------- Admin content update ----------------
class TestAdminContent:
    def test_update_hero(self, auth_headers):
        r0 = requests.get(f"{API}/content/hero")
        current = r0.json()
        # keep values, just PUT them back
        r = requests.put(f"{API}/admin/content/hero", headers=auth_headers, json=current)
        assert r.status_code == 200, r.text

    def test_update_site_settings(self, auth_headers):
        r0 = requests.get(f"{API}/content/site-settings")
        payload = r0.json()
        r = requests.put(f"{API}/admin/content/site-settings", headers=auth_headers, json=payload)
        assert r.status_code == 200


# ---------------- Admin leads listing ----------------
class TestAdminLeads:
    @pytest.mark.parametrize("path", ["inquiries", "newsletter", "contact-messages", "trial-bookings"])
    def test_list(self, auth_headers, path):
        r = requests.get(f"{API}/admin/{path}", headers=auth_headers)
        assert r.status_code == 200
        assert "items" in r.json()

    def test_inquiry_status_update(self, auth_headers):
        # Create then update status
        requests.post(f"{API}/inquiries", json={
            "name": "TEST_Status", "phone": "1", "email": "test_st@example.com"
        })
        lst = requests.get(f"{API}/admin/inquiries", headers=auth_headers).json()["items"]
        target = next((i for i in lst if i["name"] == "TEST_Status"), None)
        assert target
        r = requests.patch(f"{API}/admin/inquiries/{target['id']}", headers=auth_headers,
                           json={"status": "contacted"})
        assert r.status_code == 200
        r2 = requests.delete(f"{API}/admin/inquiries/{target['id']}", headers=auth_headers)
        assert r2.status_code == 200


# ---------------- Analytics / audit ----------------
class TestAnalytics:
    def test_overview(self, auth_headers):
        r = requests.get(f"{API}/admin/analytics/overview", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ["inquiries_total", "messages_total", "subscribers", "trial_bookings", "visits_total"]:
            assert k in d

    def test_recent_activity(self, auth_headers):
        r = requests.get(f"{API}/admin/activity/recent", headers=auth_headers)
        assert r.status_code == 200
        assert "items" in r.json()

    def test_visits_track(self):
        r = requests.post(f"{API}/visits/track")
        assert r.status_code == 200


# ---------------- Media upload ----------------
class TestMedia:
    def test_upload_and_list(self, auth_headers):
        # 1x1 PNG
        png = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
            "890000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
        )
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        r = requests.post(f"{API}/admin/media/upload", headers=auth_headers, files=files, data={"folder": "gallery"})
        assert r.status_code == 200, r.text
        item = r.json()
        assert item["url"]
        media_id = item["id"]

        lst = requests.get(f"{API}/admin/media", headers=auth_headers).json()
        assert any(i["id"] == media_id for i in lst["items"])

        # Delete (soft)
        rd = requests.delete(f"{API}/admin/media/{media_id}", headers=auth_headers)
        assert rd.status_code == 200
