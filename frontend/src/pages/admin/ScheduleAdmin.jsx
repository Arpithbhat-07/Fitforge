import CrudPage from "@/components/admin/CrudPage";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PERIODS = ["Morning", "Afternoon", "Evening"];

export default function ScheduleAdmin() {
  return (
    <CrudPage
      resource="schedule"
      title="Class Schedule"
      subtitle="Timetable"
      defaultForm={{ day: "Mon", time_slot: "06:00 AM", period: "Morning", class_name: "", trainer: "", duration: "45 min", color: "#FF5A1F", order: 0, is_active: true }}
      fields={[
        { name: "day", label: "Day", type: "select", options: DAYS },
        { name: "period", label: "Period", type: "select", options: PERIODS },
        { name: "time_slot", label: "Time Slot", type: "text", placeholder: "06:00 AM" },
        { name: "duration", label: "Duration", type: "text", placeholder: "45 min" },
        { name: "class_name", label: "Class Name", type: "text" },
        { name: "trainer", label: "Trainer", type: "text" },
        { name: "color", label: "Accent Color (hex)", type: "text", placeholder: "#FF5A1F" },
        { name: "order", label: "Order", type: "number" },
        { name: "is_active", label: "Active", type: "switch" },
      ]}
      columns={[
        { key: "day", label: "Day" },
        { key: "time_slot", label: "Time" },
        { key: "period", label: "Period" },
        { key: "class_name", label: "Class" },
        { key: "trainer", label: "Trainer" },
        { key: "color", label: "Color", render: (i) => <span className="inline-block w-4 h-4 border border-[#2A2A2A]" style={{ background: i.color }} /> },
      ]}
    />
  );
}
