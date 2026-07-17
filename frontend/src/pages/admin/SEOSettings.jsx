import SettingsForm from "@/components/admin/SettingsForm";

export default function SEOSettings() {
  return (
    <SettingsForm
      endpoint="seo"
      title="SEO Settings"
      subtitle="Metadata"
      schema={[
        { name: "meta_title", label: "Meta Title", colSpan: 2 },
        { name: "meta_description", label: "Meta Description", type: "textarea", colSpan: 2 },
        { name: "meta_keywords", label: "Meta Keywords", colSpan: 2 },
        { name: "og_title", label: "OG Title" },
        { name: "og_description", label: "OG Description" },
        { name: "og_image", label: "OG Image URL", colSpan: 2 },
        { name: "twitter_card", label: "Twitter Card Type" },
        { name: "robots", label: "Robots" },
        { name: "favicon_url", label: "Favicon URL", colSpan: 2 },
        { name: "google_analytics_id", label: "Google Analytics ID" },
      ]}
    />
  );
}
