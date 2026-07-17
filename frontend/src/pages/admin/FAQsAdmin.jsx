import CrudPage from "@/components/admin/CrudPage";

export default function FAQsAdmin() {
  return (
    <CrudPage
      resource="faqs"
      title="FAQs"
      subtitle="Support"
      defaultForm={{ question: "", answer: "", order: 0, is_active: true }}
      fields={[
        { name: "question", label: "Question", type: "text", colSpan: 2 },
        { name: "answer", label: "Answer", type: "textarea", colSpan: 2, rows: 4 },
        { name: "order", label: "Order", type: "number" },
        { name: "is_active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "order", label: "#" },
        { key: "question", label: "Question", render: (i) => <span className="line-clamp-1">{i.question}</span> },
        { key: "is_active", label: "Status", render: (i) => i.is_active ? <span className="text-[#3DDC84]">● Active</span> : "○ Hidden" },
      ]}
    />
  );
}
