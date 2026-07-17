"""Pydantic models for FitForge Gym."""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uid() -> str:
    return str(uuid.uuid4())


class BaseDoc(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)


# ---------- Auth ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseDoc):
    id: str
    email: str
    name: str
    role: str


# ---------- Content: Hero / About / Contact / SEO ----------
class HeroContent(BaseDoc):
    title: str = "FitForge Gym"
    tagline: str = "Stronger Every Day."
    description: str = "A premium fitness experience engineered for strength, discipline, and transformation."
    cta_primary_label: str = "Join Now"
    cta_secondary_label: str = "Book Free Trial"
    background_image: str = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80"
    stats: List[Dict[str, str]] = Field(default_factory=lambda: [
        {"value": "2500+", "label": "Active Members"},
        {"value": "12+", "label": "Certified Trainers"},
        {"value": "8+", "label": "Years Experience"},
        {"value": "24/7", "label": "Gym Access"},
    ])


class AboutContent(BaseDoc):
    who_we_are: str = "FitForge is a next-generation fitness collective built for athletes, professionals, and everyday warriors chasing something greater."
    mission: str = "Forge stronger bodies, sharper minds, and unbreakable habits — every single day."
    vision: str = "To become the most respected performance training destination in the country."
    core_values: List[Dict[str, str]] = Field(default_factory=lambda: [
        {"title": "Discipline", "description": "Consistency beats intensity — we build systems that stick."},
        {"title": "Community", "description": "You train harder when the room believes in you."},
        {"title": "Progress", "description": "Every session moves the needle. Measurably."},
        {"title": "Integrity", "description": "Honest coaching, honest programming, honest results."},
    ])
    journey: List[Dict[str, str]] = Field(default_factory=lambda: [
        {"year": "2017", "title": "The First Barbell", "description": "FitForge opened its doors with a single squat rack and 40 founding members."},
        {"year": "2019", "title": "Elite Coaching Team", "description": "Brought together 10+ nationally certified strength and conditioning coaches."},
        {"year": "2022", "title": "New Flagship Facility", "description": "Moved into our 12,000 sq ft flagship with performance zones and recovery suites."},
        {"year": "2025", "title": "2500+ Strong", "description": "A thriving community of athletes forged inside our walls."},
    ])


class ContactContent(BaseDoc):
    address: str = "24 Ironworks Avenue, Bengaluru, KA 560001"
    phone: str = "+91 98765 43210"
    whatsapp: str = "+91 98765 43210"
    email: str = "hello@fitforge.gym"
    map_embed_url: str = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.045!2d77.594!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBengaluru!5e0!3m2!1sen!2sin!4v1700000000000"
    business_hours: List[Dict[str, str]] = Field(default_factory=lambda: [
        {"day": "Mon – Fri", "hours": "05:00 AM – 11:00 PM"},
        {"day": "Saturday", "hours": "06:00 AM – 10:00 PM"},
        {"day": "Sunday", "hours": "07:00 AM – 08:00 PM"},
    ])
    socials: Dict[str, str] = Field(default_factory=lambda: {
        "instagram": "https://instagram.com/fitforge",
        "facebook": "https://facebook.com/fitforge",
        "youtube": "https://youtube.com/@fitforge",
        "twitter": "https://twitter.com/fitforge",
    })


class SEOSettings(BaseDoc):
    meta_title: str = "FitForge Gym — Stronger Every Day"
    meta_description: str = "Premium strength & conditioning gym. Personal training, group classes, nutrition coaching, and 24/7 access."
    meta_keywords: str = "gym, fitness, personal training, strength training, crossfit, yoga, weight loss"
    og_title: str = "FitForge Gym — Stronger Every Day"
    og_description: str = "Train with the best. Certified coaches, premium equipment, real results."
    og_image: str = ""
    twitter_card: str = "summary_large_image"
    robots: str = "index,follow"
    favicon_url: str = ""
    google_analytics_id: str = ""


class SiteSettings(BaseDoc):
    discount_banner_enabled: bool = True
    discount_banner_text: str = "🔥 New Year Offer — Get 30% OFF on Annual Memberships. Ends soon."
    referral_banner_enabled: bool = True
    referral_banner_text: str = "Refer a friend and unlock 1 month free."
    exit_intent_enabled: bool = True
    exit_intent_title: str = "Wait — before you go"
    exit_intent_message: str = "Claim your free 3-day trial pass. No card required."
    whatsapp_float_enabled: bool = True
    sticky_cta_enabled: bool = True


# ---------- Services ----------
class Service(BaseDoc):
    id: str = Field(default_factory=_uid)
    title: str
    description: str
    icon: str = "Dumbbell"
    image: str = ""
    order: int = 0
    is_active: bool = True
    is_deleted: bool = False
    created_at: str = Field(default_factory=_now)


class ServiceIn(BaseModel):
    title: str
    description: str
    icon: str = "Dumbbell"
    image: str = ""
    order: int = 0
    is_active: bool = True


# ---------- Plans ----------
class Plan(BaseDoc):
    id: str = Field(default_factory=_uid)
    name: str
    price: str
    period: str = "/month"
    features: List[str] = Field(default_factory=list)
    is_highlighted: bool = False
    cta_label: str = "Get Started"
    order: int = 0
    is_active: bool = True
    is_deleted: bool = False


class PlanIn(BaseModel):
    name: str
    price: str
    period: str = "/month"
    features: List[str] = Field(default_factory=list)
    is_highlighted: bool = False
    cta_label: str = "Get Started"
    order: int = 0
    is_active: bool = True


# ---------- Trainers ----------
class Trainer(BaseDoc):
    id: str = Field(default_factory=_uid)
    name: str
    role: str
    experience: str
    specialization: str
    photo: str = ""
    certifications: List[str] = Field(default_factory=list)
    socials: Dict[str, str] = Field(default_factory=dict)
    order: int = 0
    is_active: bool = True
    is_deleted: bool = False
    available_slots: List[str] = Field(default_factory=lambda: ["08:00 AM", "10:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"])


class TrainerIn(BaseModel):
    name: str
    role: str
    experience: str
    specialization: str
    photo: str = ""
    certifications: List[str] = Field(default_factory=list)
    socials: Dict[str, str] = Field(default_factory=dict)
    order: int = 0
    is_active: bool = True
    available_slots: List[str] = Field(default_factory=lambda: ["08:00 AM", "10:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"])


# ---------- Testimonials ----------
class Testimonial(BaseDoc):
    id: str = Field(default_factory=_uid)
    name: str
    role: str = ""
    story: str
    rating: int = 5
    before_image: str = ""
    after_image: str = ""
    avatar: str = ""
    video_url: str = ""
    order: int = 0
    is_active: bool = True
    is_deleted: bool = False


class TestimonialIn(BaseModel):
    name: str
    role: str = ""
    story: str
    rating: int = 5
    before_image: str = ""
    after_image: str = ""
    avatar: str = ""
    video_url: str = ""
    order: int = 0
    is_active: bool = True


# ---------- FAQs ----------
class FAQ(BaseDoc):
    id: str = Field(default_factory=_uid)
    question: str
    answer: str
    order: int = 0
    is_active: bool = True
    is_deleted: bool = False


class FAQIn(BaseModel):
    question: str
    answer: str
    order: int = 0
    is_active: bool = True


# ---------- Schedule ----------
class ScheduleItem(BaseDoc):
    id: str = Field(default_factory=_uid)
    day: str  # Mon, Tue, ...
    time_slot: str  # e.g. "06:00 AM"
    period: str = "Morning"  # Morning/Afternoon/Evening
    class_name: str
    trainer: str = ""
    duration: str = "45 min"
    color: str = "#FF5A1F"
    order: int = 0
    is_active: bool = True
    is_deleted: bool = False
    difficulty: str = "Intermediate"
    availability: str = "Available"
    class_type: str = "Strength"


class ScheduleItemIn(BaseModel):
    day: str
    time_slot: str
    period: str = "Morning"
    class_name: str
    trainer: str = ""
    duration: str = "45 min"
    color: str = "#FF5A1F"
    order: int = 0
    is_active: bool = True
    difficulty: str = "Intermediate"
    availability: str = "Available"
    class_type: str = "Strength"


# ---------- Gallery ----------
class GalleryImage(BaseDoc):
    id: str = Field(default_factory=_uid)
    url: str
    caption: str = ""
    category: str = "Gym"  # Gym/Workouts/Events/Transformation
    order: int = 0
    is_active: bool = True
    is_deleted: bool = False
    created_at: str = Field(default_factory=_now)


class GalleryImageIn(BaseModel):
    url: str
    caption: str = ""
    category: str = "Gym"
    order: int = 0
    is_active: bool = True


# ---------- Why Choose Us ----------
class Feature(BaseDoc):
    id: str = Field(default_factory=_uid)
    title: str
    description: str = ""
    icon: str = "ShieldCheck"
    order: int = 0
    is_active: bool = True
    is_deleted: bool = False


class FeatureIn(BaseModel):
    title: str
    description: str = ""
    icon: str = "ShieldCheck"
    order: int = 0
    is_active: bool = True


# ---------- Inquiries / Newsletter / Contact Messages ----------
class InquiryIn(BaseModel):
    name: str
    phone: str
    email: EmailStr
    fitness_goal: str = ""
    plan: str = ""
    preferred_time: str = ""
    message: str = ""


class Inquiry(BaseDoc):
    id: str = Field(default_factory=_uid)
    name: str
    phone: str
    email: str
    fitness_goal: str = ""
    plan: str = ""
    preferred_time: str = ""
    message: str = ""
    status: str = "new"  # new/contacted/converted/closed
    notes: str = ""
    created_at: str = Field(default_factory=_now)


class InquiryUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class NewsletterIn(BaseModel):
    email: EmailStr


class NewsletterSubscriber(BaseDoc):
    id: str = Field(default_factory=_uid)
    email: str
    subscribed_at: str = Field(default_factory=_now)
    is_active: bool = True


class ContactMessageIn(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    subject: str = ""
    message: str


class ContactMessage(BaseDoc):
    id: str = Field(default_factory=_uid)
    name: str
    email: str
    phone: str = ""
    subject: str = ""
    message: str
    is_read: bool = False
    created_at: str = Field(default_factory=_now)


class TrialBookingIn(BaseModel):
    name: str
    phone: str
    email: EmailStr
    preferred_date: str = ""


class TrialBooking(BaseDoc):
    id: str = Field(default_factory=_uid)
    name: str
    phone: str
    email: str
    preferred_date: str = ""
    status: str = "pending"
    created_at: str = Field(default_factory=_now)


# ---------- Media Library ----------
class MediaItem(BaseDoc):
    id: str = Field(default_factory=_uid)
    storage_path: str
    url: str
    original_filename: str
    content_type: str
    size: int
    folder: str = "media"
    is_deleted: bool = False
    created_at: str = Field(default_factory=_now)


# ---------- Audit Logs ----------
class AuditLog(BaseDoc):
    id: str = Field(default_factory=_uid)
    actor_email: str
    action: str  # create/update/delete/login
    entity: str  # e.g. "trainer", "plan"
    entity_id: str = ""
    details: str = ""
    created_at: str = Field(default_factory=_now)


# ---------- BMI ----------
class BMIRequest(BaseModel):
    height_cm: float
    weight_kg: float


class BMIResponse(BaseModel):
    bmi: float
    category: str
    advice: str


# ---------- Global Settings ----------
class GlobalSettings(BaseDoc):
    gym_name: str = "FitForge Gym"
    logo_url: str = ""
    favicon_url: str = ""
    primary_color: str = "#FF5A1F"
    secondary_color: str = "#FF8A00"
    typography_font: str = "Inter"
    timezone: str = "UTC"
    currency: str = "USD"
    maintenance_mode: bool = False


# ---------- Feature Flags ----------
class FeatureFlagDetail(BaseDoc):
    enabled: bool = True
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class FeatureFlags(BaseDoc):
    trainer_booking: FeatureFlagDetail = Field(default_factory=FeatureFlagDetail)
    newsletter: FeatureFlagDetail = Field(default_factory=FeatureFlagDetail)
    whatsapp: FeatureFlagDetail = Field(default_factory=FeatureFlagDetail)
    transformation_slider: FeatureFlagDetail = Field(default_factory=FeatureFlagDetail)
    analytics: FeatureFlagDetail = Field(default_factory=FeatureFlagDetail)
    dark_mode: FeatureFlagDetail = Field(default_factory=FeatureFlagDetail)
    class_schedule: FeatureFlagDetail = Field(default_factory=FeatureFlagDetail)


# ---------- Trainer Bookings ----------
class TrainerBooking(BaseDoc):
    id: str = Field(default_factory=_uid)
    name: str
    email: EmailStr
    phone: str
    trainer_id: str
    date: str # YYYY-MM-DD
    time_slot: str # e.g. "10:00 AM"
    status: str = "pending" # pending/approved/rejected
    notes: str = ""
    created_at: str = Field(default_factory=_now)


class TrainerBookingIn(BaseModel):
    name: str
    email: EmailStr
    phone: str
    trainer_id: str
    date: str
    time_slot: str
    notes: str = ""


# ---------- Calendar Exceptions (Leaves, Blocked slots, Holidays) ----------
class CalendarException(BaseDoc):
    id: str = Field(default_factory=_uid)
    trainer_id: Optional[str] = None # If None, gym-wide holiday/closed
    type: str # holiday / leave / gym_closed
    start_date: str # YYYY-MM-DD
    end_date: str # YYYY-MM-DD
    title: str
    is_active: bool = True


class CalendarExceptionIn(BaseModel):
    trainer_id: Optional[str] = None
    type: str
    start_date: str
    end_date: str
    title: str
    is_active: bool = True


# ---------- Revisions (Diff-Tracking CMS revisions) ----------
class Revision(BaseDoc):
    id: str = Field(default_factory=_uid)
    collection: str
    document_id: str
    action: str  # create / update / delete / restore
    changed_by: str
    timestamp: str = Field(default_factory=_now)
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    changed_fields: List[str] = Field(default_factory=list)


# ---------- Legal Content (Privacy Policy / Terms) ----------
class LegalContent(BaseDoc):
    title: str
    content: str

