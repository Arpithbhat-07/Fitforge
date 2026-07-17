import ListPage from "@/components/admin/ListPage";

export default function TrialsAdmin() {
  return (
    <ListPage
      endpoint="trial-bookings"
      title="Trial Bookings"
      subtitle="Leads"
      testid="admin-trials-page"
      columns={[
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "preferred_date", label: "Date" },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Booked", render: (i) => new Date(i.created_at).toLocaleDateString() },
      ]}
    />
  );
}
