import CrudPage from "@/components/admin/CrudPage";

const CATS = ["Gym", "Workouts", "Events", "Transformation"];

export default function GalleryAdmin() {
  return (
    <CrudPage
      resource="gallery"
      title="Gallery"
      subtitle="Media"
      defaultForm={{ url: "", caption: "", category: "Gym", order: 0, is_active: true }}
      fields={[
        { name: "url", label: "Image", type: "image", colSpan: 2 },
        { name: "caption", label: "Caption", type: "text" },
        { name: "category", label: "Category", type: "select", options: CATS },
        { name: "order", label: "Order", type: "number" },
        { name: "is_active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "url", label: "", render: (i) => i.url ? <img src={i.url} alt="" className="w-16 h-16 object-cover" /> : "—" },
        { key: "caption", label: "Caption" },
        { key: "category", label: "Category" },
        { key: "is_active", label: "Status", render: (i) => i.is_active ? <span className="text-[#3DDC84]">● Active</span> : "○ Hidden" },
      ]}
    />
  );
}
