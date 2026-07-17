import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import HeroSettings from "@/pages/admin/HeroSettings";
import AboutSettings from "@/pages/admin/AboutSettings";
import ContactSettings from "@/pages/admin/ContactSettings";
import SEOSettings from "@/pages/admin/SEOSettings";
import SiteSettingsPage from "@/pages/admin/SiteSettingsPage";
import ServicesAdmin from "@/pages/admin/ServicesAdmin";
import PlansAdmin from "@/pages/admin/PlansAdmin";
import TrainersAdmin from "@/pages/admin/TrainersAdmin";
import TestimonialsAdmin from "@/pages/admin/TestimonialsAdmin";
import FAQsAdmin from "@/pages/admin/FAQsAdmin";
import ScheduleAdmin from "@/pages/admin/ScheduleAdmin";
import GalleryAdmin from "@/pages/admin/GalleryAdmin";
import FeaturesAdmin from "@/pages/admin/FeaturesAdmin";
import InquiriesAdmin from "@/pages/admin/InquiriesAdmin";
import MessagesAdmin from "@/pages/admin/MessagesAdmin";
import NewsletterAdmin from "@/pages/admin/NewsletterAdmin";
import TrialsAdmin from "@/pages/admin/TrialsAdmin";
import MediaLibrary from "@/pages/admin/MediaLibrary";
import AuditLogs from "@/pages/admin/AuditLogs";
import BookingsCalendar from "@/pages/admin/BookingsCalendar";
import GlobalSettingsPage from "@/pages/admin/GlobalSettingsPage";
import FeatureFlagsPage from "@/pages/admin/FeatureFlagsPage";
import EmailTesterPage from "@/pages/admin/EmailTesterPage";
import TrashSystemPage from "@/pages/admin/TrashSystemPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: { background: "#171717", border: "1px solid #2A2A2A", color: "#fff" },
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="hero" element={<HeroSettings />} />
            <Route path="about" element={<AboutSettings />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="plans" element={<PlansAdmin />} />
            <Route path="trainers" element={<TrainersAdmin />} />
            <Route path="testimonials" element={<TestimonialsAdmin />} />
            <Route path="faqs" element={<FAQsAdmin />} />
            <Route path="schedule" element={<ScheduleAdmin />} />
            <Route path="gallery" element={<GalleryAdmin />} />
            <Route path="features" element={<FeaturesAdmin />} />
            <Route path="inquiries" element={<InquiriesAdmin />} />
            <Route path="trials" element={<TrialsAdmin />} />
            <Route path="messages" element={<MessagesAdmin />} />
            <Route path="newsletter" element={<NewsletterAdmin />} />
            <Route path="contact-settings" element={<ContactSettings />} />
            <Route path="seo" element={<SEOSettings />} />
            <Route path="site-settings" element={<SiteSettingsPage />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="bookings" element={<BookingsCalendar />} />
            <Route path="global-settings" element={<GlobalSettingsPage />} />
            <Route path="feature-flags" element={<FeatureFlagsPage />} />
            <Route path="email-diagnostics" element={<EmailTesterPage />} />
            <Route path="trash" element={<TrashSystemPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
