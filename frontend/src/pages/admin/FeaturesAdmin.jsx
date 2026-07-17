import CrudPage from "@/components/admin/CrudPage";

export default function FeaturesAdmin() {
  return (
    <CrudPage
      resource="features"
      title="Why Choose Us"
      subtitle="Highlights"
      defaultForm={{ title: "", description: "", icon: "ShieldCheck", order: 0, is_active: true }}
      fields={[
        { name: "title", label: "Title", type: "text" },
        { name: "icon", label: "Lucide Icon", type: "text", placeholder: "Award, Dumbbell..." },
        { name: "description", label: "Description", type: "textarea", colSpan: 2, rows: 3 },
        { name: "order", label: "Order", type: "number" },
        { name: "is_active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "order", label: "#" },
        { key: "title", label: "Title" },
        { key: "icon", label: "Icon" },
        { key: "is_active", label: "Status", render: (i) => i.is_active ? <span className="text-[#3DDC84]">● Active</span> : "○ Hidden" },
      ]}
    />
  );
}
