import SettingsForm from "@/components/admin/SettingsForm";

export default function GlobalSettingsPage() {
  return (
    <SettingsForm
      endpoint="global-settings"
      title="Branding & Gym Settings"
      subtitle="Configure corporate identity, color tokens, typography, and timezone"
      schema={[
        { name: "gym_name", label: "Gym Name", type: "text" },
        { name: "logo_url", label: "Logo URL / Upload", type: "image" },
        { name: "favicon_url", label: "Favicon URL / Upload", type: "image" },
        { name: "primary_color", label: "Primary Theme Color (Hex)", type: "text", help: "Primary color code (e.g., #FF5A1F)" },
        { name: "secondary_color", label: "Secondary Accent Color (Hex)", type: "text", help: "Secondary color code (e.g., #FF8A00)" },
        { name: "typography_font", label: "Typography Font Family", type: "text", help: "Google Font name (e.g., Inter, Outfit, Roboto)" },
        { name: "timezone", label: "Timezone", type: "text", help: "Default timezone (e.g., Asia/Kolkata, UTC)" },
        { name: "currency", label: "Currency Display Symbol", type: "text", help: "Currency sign or acronym (e.g., ₹, $, INR)" },
        { name: "maintenance_mode", label: "Maintenance Mode (Lock site access)", type: "switch", colSpan: 2 },
      ]}
    />
  );
}
