import ListPage from "@/components/admin/ListPage";

export default function MessagesAdmin() {
  return (
    <ListPage
      endpoint="contact-messages"
      title="Contact Messages"
      subtitle="Inbox"
      testid="admin-messages-page"
      columns={[
        { key: "name", label: "From" },
        { key: "email", label: "Email" },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message", render: (i) => <span className="line-clamp-1 max-w-md inline-block">{i.message}</span> },
        { key: "created_at", label: "Date", render: (i) => new Date(i.created_at).toLocaleDateString() },
      ]}
    />
  );
}
