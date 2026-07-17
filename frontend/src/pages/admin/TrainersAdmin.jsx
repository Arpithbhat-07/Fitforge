import CrudPage from "@/components/admin/CrudPage";

export default function TrainersAdmin() {
  return (
    <CrudPage
      resource="trainers"
      title="Trainers"
      subtitle="Coaching Team"
      defaultForm={{ name: "", role: "", experience: "", specialization: "", photo: "", certifications: [], socials: {}, order: 0, is_active: true }}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "role", label: "Role", type: "text" },
        { name: "experience", label: "Experience", type: "text", placeholder: "10+ years" },
        { name: "specialization", label: "Specialization", type: "text" },
        { name: "certifications", label: "Certifications (one per line)", type: "list", colSpan: 2 },
        { name: "socials", label: "Socials (key: url per line)", type: "keyvalue", colSpan: 2, help: "e.g. instagram: https://instagram.com/name" },
        { name: "photo", label: "Photo", type: "image", colSpan: 2 },
        { name: "order", label: "Order", type: "number" },
        { name: "is_active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "photo", label: "", render: (i) => i.photo ? <img src={i.photo} alt="" className="w-12 h-12 object-cover" /> : <div className="w-12 h-12 bg-[#2A2A2A]" /> },
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "experience", label: "Exp." },
        { key: "is_active", label: "Status", render: (i) => i.is_active ? <span className="text-[#3DDC84]">● Active</span> : "○ Hidden" },
      ]}
    />
  );
}
