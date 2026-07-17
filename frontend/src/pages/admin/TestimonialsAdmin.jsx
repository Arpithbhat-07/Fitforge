import CrudPage from "@/components/admin/CrudPage";

export default function TestimonialsAdmin() {
  return (
    <CrudPage
      resource="testimonials"
      title="Testimonials"
      subtitle="Stories"
      defaultForm={{ name: "", role: "", story: "", rating: 5, before_image: "", after_image: "", avatar: "", video_url: "", order: 0, is_active: true }}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "role", label: "Role", type: "text" },
        { name: "story", label: "Story", type: "textarea", colSpan: 2, rows: 4 },
        { name: "rating", label: "Rating (1-5)", type: "number" },
        { name: "video_url", label: "Video URL", type: "text" },
        { name: "avatar", label: "Avatar", type: "image" },
        { name: "before_image", label: "Before Image", type: "image" },
        { name: "after_image", label: "After Image", type: "image" },
        { name: "order", label: "Order", type: "number" },
        { name: "is_active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "rating", label: "Rating", render: (i) => "★".repeat(i.rating || 0) },
        { key: "is_active", label: "Status", render: (i) => i.is_active ? <span className="text-[#3DDC84]">● Active</span> : "○ Hidden" },
      ]}
    />
  );
}
