import SettingsForm from "@/components/admin/SettingsForm";

export default function ContactSettings() {
  return (
    <SettingsForm
      endpoint="contact"
      title="Contact Details"
      subtitle="Settings"
      schema={[
        { name: "address", label: "Address", type: "textarea", colSpan: 2 },
        { name: "phone", label: "Phone" },
        { name: "whatsapp", label: "WhatsApp Number" },
        { name: "email", label: "Email" },
        { name: "map_embed_url", label: "Google Map Embed URL", colSpan: 2 },
        { name: "business_hours", label: "Business Hours", type: "objectlist", keys: ["day", "hours"] },
        { name: "socials", label: "Social Media Links", type: "keyvalue", help: "keys: instagram, facebook, youtube, twitter" },
      ]}
    />
  );
}
