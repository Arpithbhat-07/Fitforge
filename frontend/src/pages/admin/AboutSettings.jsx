import SettingsForm from "@/components/admin/SettingsForm";

export default function AboutSettings() {
  return (
    <SettingsForm
      endpoint="about"
      title="About Section"
      subtitle="Home Page"
      schema={[
        { name: "who_we_are", label: "Who We Are", type: "richtext", colSpan: 2 },
        { name: "mission", label: "Mission", type: "richtext", colSpan: 2 },
        { name: "vision", label: "Vision", type: "richtext", colSpan: 2 },
        { name: "core_values", label: "Core Values", type: "objectlist", keys: ["title", "description"] },
        { name: "journey", label: "Our Journey", type: "objectlist", keys: ["year", "title", "description"] },
      ]}
    />
  );
}
