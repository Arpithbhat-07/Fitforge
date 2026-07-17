import SettingsForm from "@/components/admin/SettingsForm";

export default function HeroSettings() {
  return (
    <SettingsForm
      endpoint="hero"
      title="Hero Section"
      subtitle="Home Page"
      schema={[
        { name: "title", label: "Title" },
        { name: "tagline", label: "Tagline" },
        { name: "description", label: "Description", type: "textarea", colSpan: 2 },
        { name: "cta_primary_label", label: "Primary CTA Label" },
        { name: "cta_secondary_label", label: "Secondary CTA Label" },
        { name: "background_image", label: "Background Image URL", colSpan: 2 },
        { name: "stats", label: "Stats", type: "objectlist", keys: ["value", "label"] },
      ]}
    />
  );
}
