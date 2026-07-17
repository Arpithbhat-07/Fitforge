import CrudPage from "@/components/admin/CrudPage";

export default function ServicesAdmin() {
  return (
    <CrudPage
      resource="services"
      title="Programs"
      subtitle="Content Management"
      defaultForm={{ title: "", description: "", icon: "Dumbbell", image: "", order: 0, is_active: true }}
      fields={[
        { name: "title", label: "Title", type: "text", colSpan: 2 },
        { name: "description", label: "Description", type: "textarea", colSpan: 2, rows: 3 },
        { name: "icon", label: "Lucide Icon Name", type: "text", placeholder: "Dumbbell, Flame, Heart..." },
        { name: "order", label: "Display Order", type: "number" },
        { name: "image", label: "Image URL", type: "image", colSpan: 2 },
        { name: "is_active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "order", label: "#" },
        { key: "title", label: "Title" },
        { key: "icon", label: "Icon" },
        { key: "is_active", label: "Status", render: (i) => i.is_active ? <span className="text-[#3DDC84]">● Active</span> : <span className="text-[#8A8A8A]">○ Hidden</span> },
      ]}
    />
  );
}
