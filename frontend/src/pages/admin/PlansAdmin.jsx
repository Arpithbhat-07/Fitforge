import CrudPage from "@/components/admin/CrudPage";

export default function PlansAdmin() {
  return (
    <CrudPage
      resource="plans"
      title="Membership Plans"
      subtitle="Pricing"
      defaultForm={{ name: "", price: "", period: "/month", features: [], is_highlighted: false, cta_label: "Get Started", order: 0, is_active: true }}
      fields={[
        { name: "name", label: "Plan Name", type: "text" },
        { name: "price", label: "Price (with symbol)", type: "text", placeholder: "₹2,499" },
        { name: "period", label: "Period", type: "text", placeholder: "/month" },
        { name: "cta_label", label: "CTA Label", type: "text" },
        { name: "features", label: "Features (one per line)", type: "list", colSpan: 2 },
        { name: "order", label: "Display Order", type: "number" },
        { name: "is_highlighted", label: "Highlight (Featured)", type: "switch" },
        { name: "is_active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "order", label: "#" },
        { key: "name", label: "Plan" },
        { key: "price", label: "Price" },
        { key: "is_highlighted", label: "Highlighted", render: (i) => i.is_highlighted ? "★ Yes" : "—" },
        { key: "is_active", label: "Status", render: (i) => i.is_active ? <span className="text-[#3DDC84]">● Active</span> : "○ Hidden" },
      ]}
    />
  );
}
