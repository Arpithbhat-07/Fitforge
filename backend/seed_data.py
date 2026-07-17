"""Initial seed data for FitForge Gym."""
from datetime import datetime, timezone
from models import (
    HeroContent, AboutContent, ContactContent, SEOSettings, SiteSettings,
    Service, Plan, Trainer, Testimonial, FAQ, ScheduleItem, GalleryImage, Feature,
    GlobalSettings, FeatureFlags
)


def _now():
    return datetime.now(timezone.utc).isoformat()



SEED_SERVICES = [
    Service(title="Strength Training", description="Build raw power with progressive overload programming inside our elite lifting zone.", icon="Dumbbell", order=1),
    Service(title="Weight Loss", description="Sustainable fat-loss coaching backed by nutrition, cardio, and metabolic conditioning.", icon="Flame", order=2),
    Service(title="Personal Training", description="One-on-one coaching designed around your goals, schedule, and biomechanics.", icon="UserCheck", order=3),
    Service(title="CrossFit", description="High-intensity functional workouts in a competitive small-group environment.", icon="Zap", order=4),
    Service(title="HIIT", description="Short bursts, big results. Fat-burning intervals that fit any schedule.", icon="Timer", order=5),
    Service(title="Yoga", description="Mobility, breathwork, and recovery to complement your training week.", icon="Activity", order=6),
    Service(title="Cardio", description="State-of-the-art treadmills, bikes, rowers, and Woodway for engine work.", icon="Heart", order=7),
    Service(title="Functional Fitness", description="Movement patterns that translate directly to real-life strength and resilience.", icon="Move", order=8),
    Service(title="Nutrition Coaching", description="1:1 nutrition strategy — no crash diets, just science and sustainable habits.", icon="Apple", order=9),
]

SEED_PLANS = [
    Plan(name="Starter", price="₹1,499", period="/month", features=[
        "Full Gym Access", "Locker Room", "Cardio Zone", "Free WiFi", "Community Events"
    ], is_highlighted=False, order=1),
    Plan(name="Pro", price="₹2,499", period="/month", features=[
        "Everything in Starter", "Unlimited Group Classes", "Nutrition Starter Guide",
        "Progress Tracking", "Guest Passes (2/mo)", "Recovery Zone Access"
    ], is_highlighted=True, cta_label="Most Popular", order=2),
    Plan(name="Elite", price="₹4,499", period="/month", features=[
        "Everything in Pro", "Dedicated Personal Trainer", "Custom Diet Plan",
        "Monthly Body Analysis", "VIP Support & Priority Booking", "Massage & Recovery Sessions"
    ], is_highlighted=False, order=3),
]

SEED_TRAINERS = [
    Trainer(name="Arjun Kapoor", role="Head Strength Coach", experience="10+ years",
            specialization="Powerlifting, Hypertrophy",
            photo="https://images.pexels.com/photos/3912944/pexels-photo-3912944.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            certifications=["NSCA-CSCS", "USA Weightlifting L2"],
            socials={"instagram": "https://instagram.com/", "linkedin": "https://linkedin.com/"}, order=1),
    Trainer(name="Priya Sharma", role="Yoga & Mobility Lead", experience="8 years",
            specialization="Vinyasa, Recovery, Breathwork",
            photo="https://images.unsplash.com/photo-1550345332-09e3ac987658?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5lciUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NDI3NTY5NXww&ixlib=rb-4.1.0&q=85&w=800",
            certifications=["RYT-500", "FRC Mobility Specialist"],
            socials={"instagram": "https://instagram.com/"}, order=2),
    Trainer(name="Rahul Verma", role="CrossFit & HIIT Coach", experience="7 years",
            specialization="Metcon, Olympic Lifting",
            photo="https://images.unsplash.com/photo-1704223523169-52feeed90365?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwzfHxmaXRuZXNzJTIwdHJhaW5lciUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NDI3NTY5NXww&ixlib=rb-4.1.0&q=85&w=800",
            certifications=["CrossFit L3", "Precision Nutrition L1"],
            socials={"instagram": "https://instagram.com/"}, order=3),
    Trainer(name="Sneha Iyer", role="Nutrition & Weight Loss", experience="6 years",
            specialization="Body Recomposition, Sports Nutrition",
            photo="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80",
            certifications=["ISSN Sports Nutrition", "M.Sc. Dietetics"],
            socials={"instagram": "https://instagram.com/"}, order=4),
]

SEED_TESTIMONIALS = [
    Testimonial(name="Vikram Nair", role="Software Engineer", rating=5,
                story="Lost 18 kg in 7 months. The coaches actually care — they built a plan around my desk job and travel schedule. Genuinely life-changing.",
                before_image="https://images.unsplash.com/photo-1579758682665-53a1a614eea6?auto=format&fit=crop&w=600&q=80",
                after_image="https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=600&q=80", order=1),
    Testimonial(name="Ananya Reddy", role="Marketing Lead", rating=5,
                story="Deadlifted my bodyweight for the first time at 34. The programming here is next level — I've never trained smarter.",
                avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", order=2),
    Testimonial(name="Karan Malhotra", role="Founder", rating=5,
                story="I've been a member of 4 gyms. FitForge is the first one that feels like a real training facility, not a wellness spa.",
                avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", order=3),
]

SEED_FAQS = [
    FAQ(question="Do you offer a free trial?", answer="Yes — every new visitor gets a 3-day trial pass. Book it via the Join Now form or WhatsApp us directly.", order=1),
    FAQ(question="What are your operating hours?", answer="Weekdays 5 AM – 11 PM. Saturday 6 AM – 10 PM. Sunday 7 AM – 8 PM. Elite members get 24/7 access.", order=2),
    FAQ(question="Do I need to book classes in advance?", answer="Group classes require booking via the app 12 hours in advance. Personal training is by appointment.", order=3),
    FAQ(question="Can I freeze my membership?", answer="Yes — Pro and Elite members can freeze up to 30 days per year at no extra cost.", order=4),
    FAQ(question="Do trainers provide diet plans?", answer="Nutrition coaching is included in the Elite plan. Pro members get a starter nutrition guide.", order=5),
    FAQ(question="Is there parking available?", answer="Yes — free covered parking for members and 2 hours free for guests.", order=6),
]

SEED_SCHEDULE = [
    # Morning
    ScheduleItem(day="Mon", time_slot="06:00 AM", period="Morning", class_name="CrossFit", trainer="Rahul", color="#FF5A1F", order=1),
    ScheduleItem(day="Mon", time_slot="07:30 AM", period="Morning", class_name="Yoga Flow", trainer="Priya", color="#3DDC84", order=2),
    ScheduleItem(day="Tue", time_slot="06:00 AM", period="Morning", class_name="HIIT", trainer="Rahul", color="#FF8A00", order=3),
    ScheduleItem(day="Tue", time_slot="07:30 AM", period="Morning", class_name="Strength", trainer="Arjun", color="#FF5A1F", order=4),
    ScheduleItem(day="Wed", time_slot="06:00 AM", period="Morning", class_name="Mobility", trainer="Priya", color="#3DDC84", order=5),
    ScheduleItem(day="Thu", time_slot="06:00 AM", period="Morning", class_name="CrossFit", trainer="Rahul", color="#FF5A1F", order=6),
    ScheduleItem(day="Fri", time_slot="06:00 AM", period="Morning", class_name="Strength", trainer="Arjun", color="#FF5A1F", order=7),
    ScheduleItem(day="Sat", time_slot="08:00 AM", period="Morning", class_name="Open Gym", trainer="—", color="#0A84FF", order=8),
    # Afternoon
    ScheduleItem(day="Mon", time_slot="12:30 PM", period="Afternoon", class_name="Express HIIT", trainer="Rahul", color="#FF8A00", order=9),
    ScheduleItem(day="Wed", time_slot="12:30 PM", period="Afternoon", class_name="Lunch Lift", trainer="Arjun", color="#FF5A1F", order=10),
    ScheduleItem(day="Fri", time_slot="12:30 PM", period="Afternoon", class_name="Yoga Reset", trainer="Priya", color="#3DDC84", order=11),
    # Evening
    ScheduleItem(day="Mon", time_slot="07:00 PM", period="Evening", class_name="Strength Club", trainer="Arjun", color="#FF5A1F", order=12),
    ScheduleItem(day="Tue", time_slot="07:00 PM", period="Evening", class_name="CrossFit", trainer="Rahul", color="#FF5A1F", order=13),
    ScheduleItem(day="Wed", time_slot="07:00 PM", period="Evening", class_name="HIIT", trainer="Rahul", color="#FF8A00", order=14),
    ScheduleItem(day="Thu", time_slot="07:00 PM", period="Evening", class_name="Powerlifting", trainer="Arjun", color="#FF5A1F", order=15),
    ScheduleItem(day="Fri", time_slot="07:00 PM", period="Evening", class_name="Community WOD", trainer="Rahul", color="#0A84FF", order=16),
    ScheduleItem(day="Sat", time_slot="05:00 PM", period="Evening", class_name="Recovery Flow", trainer="Priya", color="#3DDC84", order=17),
]

SEED_GALLERY = [
    GalleryImage(url="https://images.unsplash.com/photo-1637430308606-86576d8fef3c?auto=format&fit=crop&w=1200&q=80", caption="Main floor rack row", category="Gym", order=1),
    GalleryImage(url="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=1200&q=80", caption="Loaded and ready", category="Gym", order=2),
    GalleryImage(url="https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80", caption="Free weights zone", category="Gym", order=3),
    GalleryImage(url="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80", caption="Heavy pull session", category="Workouts", order=4),
    GalleryImage(url="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80", caption="Barbell drills", category="Workouts", order=5),
    GalleryImage(url="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80", caption="Class in session", category="Workouts", order=6),
    GalleryImage(url="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", caption="Community open house", category="Events", order=7),
    GalleryImage(url="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80", caption="Annual lift-off", category="Events", order=8),
    GalleryImage(url="https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=1200&q=80", caption="Member transformation", category="Transformation", order=9),
    GalleryImage(url="https://images.unsplash.com/photo-1583500178690-f7fd39c69f8d?auto=format&fit=crop&w=1200&q=80", caption="Before / after story", category="Transformation", order=10),
    GalleryImage(url="https://images.pexels.com/photos/10960029/pexels-photo-10960029.jpeg?auto=compress&cs=tinysrgb&w=1200", caption="Wrist wrap prep", category="Workouts", order=11),
    GalleryImage(url="https://images.pexels.com/photos/33360904/pexels-photo-33360904.jpeg?auto=compress&cs=tinysrgb&w=1200", caption="Focused session", category="Workouts", order=12),
]

SEED_FEATURES = [
    Feature(title="Certified Trainers", description="Every coach holds nationally recognized certifications.", icon="Award", order=1),
    Feature(title="Premium Equipment", description="Rogue, Eleiko, Woodway, and Life Fitness — commercial-grade throughout.", icon="Dumbbell", order=2),
    Feature(title="Modern Facilities", description="12,000 sq ft floor, recovery lounge, and sauna access.", icon="Building2", order=3),
    Feature(title="Flexible Timings", description="Open early, close late. Elite members train around the clock.", icon="Clock", order=4),
    Feature(title="Nutrition Support", description="Get expert-designed nutrition plans that fit your lifestyle.", icon="Apple", order=5),
    Feature(title="Safe Environment", description="Trained spotters, sanitized equipment, and 24/7 CCTV monitoring.", icon="ShieldCheck", order=6),
    Feature(title="Affordable Membership", description="Transparent pricing. No hidden fees. Cancel anytime.", icon="Wallet", order=7),
    Feature(title="Community Events", description="Powerlifting meets, hikes, potlucks, and challenges every month.", icon="Users", order=8),
]


async def seed_all(db):
    """Idempotent seeder. Only inserts if collection is empty."""
    # Singleton content docs
    if not await db.content.find_one({"_key": "hero"}):
        await db.content.insert_one({"_key": "hero", **HeroContent().model_dump()})
    if not await db.content.find_one({"_key": "about"}):
        await db.content.insert_one({"_key": "about", **AboutContent().model_dump()})
    if not await db.content.find_one({"_key": "contact"}):
        await db.content.insert_one({"_key": "contact", **ContactContent().model_dump()})
    if not await db.content.find_one({"_key": "seo"}):
        await db.content.insert_one({"_key": "seo", **SEOSettings().model_dump()})
    if not await db.content.find_one({"_key": "site_settings"}):
        await db.content.insert_one({"_key": "site_settings", **SiteSettings().model_dump()})
    if not await db.content.find_one({"_key": "global_settings"}):
        await db.content.insert_one({"_key": "global_settings", **GlobalSettings().model_dump()})
    if not await db.content.find_one({"_key": "feature_flags"}):
        await db.content.insert_one({"_key": "feature_flags", **FeatureFlags().model_dump()})

    # Collections
    for coll_name, seeds in [
        ("services", SEED_SERVICES),
        ("plans", SEED_PLANS),
        ("trainers", SEED_TRAINERS),
        ("testimonials", SEED_TESTIMONIALS),
        ("faqs", SEED_FAQS),
        ("schedule", SEED_SCHEDULE),
        ("gallery", SEED_GALLERY),
        ("features", SEED_FEATURES),
    ]:
        existing = await db[coll_name].count_documents({})
        if existing == 0 and seeds:
            await db[coll_name].insert_many([s.model_dump() for s in seeds])
