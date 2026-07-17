import SettingsForm from "@/components/admin/SettingsForm";

export default function SiteSettingsPage() {
  return (
    <SettingsForm
      endpoint="site-settings"
      title="Site Settings"
      subtitle="Banners & CTAs"
      schema={[
        { name: "discount_banner_enabled", label: "Discount Banner", type: "switch" },
        { name: "discount_banner_text", label: "Discount Banner Text", colSpan: 2 },
        { name: "referral_banner_enabled", label: "Referral Banner", type: "switch" },
        { name: "referral_banner_text", label: "Referral Banner Text", colSpan: 2 },
        { name: "exit_intent_enabled", label: "Exit-Intent Popup", type: "switch" },
        { name: "exit_intent_title", label: "Exit Popup Title" },
        { name: "exit_intent_message", label: "Exit Popup Message", type: "textarea", colSpan: 2 },
        { name: "whatsapp_float_enabled", label: "WhatsApp Float", type: "switch" },
        { name: "sticky_cta_enabled", label: "Sticky Join CTA", type: "switch" },
      ]}
    />
  );
}
