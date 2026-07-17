import ListPage from "@/components/admin/ListPage";

export default function NewsletterAdmin() {
  return (
    <ListPage
      endpoint="newsletter"
      title="Newsletter Subscribers"
      subtitle="Marketing"
      testid="admin-newsletter-page"
      columns={[
        { key: "email", label: "Email" },
        { key: "subscribed_at", label: "Subscribed", render: (i) => new Date(i.subscribed_at).toLocaleString() },
        { key: "is_active", label: "Active", render: (i) => i.is_active ? "● Active" : "○ Unsubscribed" },
      ]}
    />
  );
}
