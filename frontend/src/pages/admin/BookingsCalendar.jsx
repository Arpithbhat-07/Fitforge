import React, { useState, useEffect } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader, Button, Card, Input, Select } from "@/components/admin/ui";
import {
  Loader2, Calendar as CalendarIcon, Check, X, Clock, User, Plus, Trash2, ShieldAlert
} from "lucide-react";

export default function BookingsCalendar() {
  const [bookings, setBookings] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("week"); // month, week, day
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Exception Form State
  const [excOpen, setExcOpen] = useState(false);
  const [excForm, setExcForm] = useState({
    trainer_id: "",
    type: "leave",
    start_date: "",
    end_date: "",
    title: "",
    is_active: true
  });
  const [excSaving, setExcSaving] = useState(false);

  // Reschedule Form State
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    time_slot: ""
  });

  const loadData = () => {
    setLoading(true);
    // Load trainers first
    api.get("/admin/trainers")
      .then(r => {
        const trList = r.data.items || r.data || [];
        setTrainers(trList);
      })
      .catch(() => toast.error("Failed to load trainers"));

    // Load bookings and exceptions
    api.get("/admin/bookings", { params: selectedTrainer ? { trainer_id: selectedTrainer } : {} })
      .then(r => {
        setBookings(r.data.bookings || []);
        setExceptions(r.data.exceptions || []);
      })
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrainer]);

  const updateStatus = async (bookingId, newStatus) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}`, { status: newStatus });
      toast.success(`Booking ${newStatus} successfully!`);
      loadData();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to update booking status.");
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await api.patch(`/admin/bookings/${selectedBooking.id}`, {
        date: rescheduleForm.date,
        time_slot: rescheduleForm.time_slot
      });
      toast.success("Booking rescheduled successfully!");
      setRescheduleOpen(false);
      setSelectedBooking(null);
      loadData();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to reschedule booking.");
    }
  };

  const handleAddException = async (e) => {
    e.preventDefault();
    setExcSaving(true);
    try {
      const payload = { ...excForm };
      if (!payload.trainer_id) payload.trainer_id = null; // gym-wide exception
      await api.post("/admin/calendar-exceptions", payload);
      toast.success("Leave/Holiday registered successfully!");
      setExcOpen(false);
      setExcForm({
        trainer_id: "",
        type: "leave",
        start_date: "",
        end_date: "",
        title: "",
        is_active: true
      });
      loadData();
    } catch (err) {
      toast.error("Failed to add leave/holiday exception.");
    } finally {
      setExcSaving(false);
    }
  };

  const handleDeleteException = async (excId) => {
    if (!window.confirm("Are you sure you want to delete this block/leave exception?")) return;
    try {
      await api.delete(`/admin/calendar-exceptions/${excId}`);
      toast.success("Leave/Holiday block removed.");
      loadData();
    } catch (err) {
      toast.error("Failed to delete exception.");
    }
  };

  if (loading && trainers.length === 0) {
    return <div className="text-[#8A8A8A] flex items-center gap-2 p-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading Calendar...</div>;
  }

  return (
    <div className="space-y-6" data-testid="admin-bookings-calendar-page">
      <PageHeader
        title="Trainer Scheduling Calendar"
        subtitle="Manage personal training reservations, approvals, blocked slots, and coach leaves"
        actions={
          <div className="flex gap-2 items-center flex-wrap">
            <Select value={selectedTrainer} onChange={(e) => setSelectedTrainer(e.target.value)} className="w-48 bg-[#171717] border-[#2A2A2A]">
              <option value="">All Coaches</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>

            <Button type="button" variant="secondary" onClick={() => setExcOpen(true)}>
              <Plus className="w-4 h-4" /> Block Date / Leave
            </Button>

            <div className="flex bg-[#171717] p-1 border border-[#2A2A2A]">
              {["month", "week", "day"].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold transition-colors ${view === v ? "bg-[#FF5A1F] text-black" : "text-[#8A8A8A] hover:text-white"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar View Area */}
        <div className="xl:col-span-3 space-y-6">
          {view === "week" && (
            <Card className="p-6">
              <div className="text-sm font-semibold text-white mb-4 uppercase tracking-widest text-left">Weekly Schedule Matrix</div>
              <div className="grid grid-cols-7 gap-2 border-b border-[#2A2A2A] pb-2 mb-2 text-center">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                  <div key={day} className="text-[10px] text-[#8A8A8A] uppercase tracking-widest font-bold">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 min-h-[300px]">
                {/* Simulated weekly slot layout for reservations display */}
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName, idx) => {
                  const dayBookings = bookings.filter(b => {
                    const bDate = new Date(b.date);
                    // Match day index (Monday = 1, etc.)
                    const dayNum = bDate.getDay();
                    const adjusted = dayNum === 0 ? 7 : dayNum;
                    return adjusted === (idx + 1);
                  });
                  return (
                    <div key={dayName} className="bg-[#0B0B0B] border border-[#2A2A2A] p-2 space-y-2 min-h-[250px] text-left">
                      <div className="text-[9px] uppercase tracking-widest font-bold text-gray-500 border-b border-[#2A2A2A] pb-1">{dayName}</div>
                      {dayBookings.map(b => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSelectedBooking(b);
                            setRescheduleForm({ date: b.date, time_slot: b.time_slot });
                            setRescheduleOpen(true);
                          }}
                          className={`p-2 border text-[10px] leading-relaxed cursor-pointer transition-colors ${b.status === "approved" ? "bg-[#3DDC84]/10 border-[#3DDC84]/30 text-white" : b.status === "rejected" ? "bg-[#FF3B30]/10 border-[#FF3B30]/30 text-gray-400" : "bg-[#FF8A00]/10 border-[#FF8A00]/30 text-white"}`}
                        >
                          <div className="font-semibold truncate">{b.name}</div>
                          <div>{b.time_slot}</div>
                          <div className="text-[8px] text-[#8A8A8A] truncate">{b.trainer_name}</div>
                        </div>
                      ))}
                      {dayBookings.length === 0 && (
                        <div className="text-[9px] text-[#8A8A8A] italic">No classes</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {view === "month" && (
            <Card className="p-6 text-left">
              <div className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Monthly Reservation Agenda</div>
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between border border-[#2A2A2A] p-3 bg-[#0B0B0B]">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="text-[#FF5A1F] w-4 h-4" />
                      <div>
                        <div className="text-xs font-semibold text-white">{b.name} ({b.email})</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {b.date} @ {b.time_slot} • Coach: {b.trainer_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 ${b.status === "approved" ? "text-[#3DDC84] bg-[#3DDC84]/10" : b.status === "rejected" ? "text-[#FF3B30] bg-[#FF3B30]/10" : "text-[#FF8A00] bg-[#FF8A00]/10"}`}>
                        {b.status}
                      </span>
                      {b.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(b.id, "approved")} className="p-1 text-[#3DDC84] hover:bg-white/10" title="Approve"><Check size={16} /></button>
                          <button onClick={() => updateStatus(b.id, "rejected")} className="p-1 text-[#FF3B30] hover:bg-white/10" title="Reject"><X size={16} /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <div className="text-xs text-[#8A8A8A] italic">No reservations booked yet.</div>}
              </div>
            </Card>
          )}

          {view === "day" && (
            <Card className="p-6 text-left">
              <div className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Daily Appointments Timeline</div>
              <div className="space-y-3">
                {bookings.filter(b => b.date === new Date().toISOString().split("T")[0]).map(b => (
                  <div key={b.id} className="border border-[#2A2A2A] p-4 bg-[#171717] flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-white">{b.name}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{b.time_slot} • Trainer: {b.trainer_name}</div>
                    </div>
                    <span className="text-xs text-[#FF5A1F] font-semibold uppercase">{b.status}</span>
                  </div>
                ))}
                {bookings.filter(b => b.date === new Date().toISOString().split("T")[0]).length === 0 && (
                  <div className="text-xs text-[#8A8A8A] italic">No active appointments scheduled for today.</div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar Leaves & Exceptions Panel */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="p-6 text-left space-y-4">
            <div>
              <h3 className="font-semibold text-white text-base">Leaves & Gym Closures</h3>
              <p className="text-[10px] text-[#8A8A8A] mt-0.5">Active schedule exceptions blocking bookings</p>
            </div>
            
            <div className="space-y-3">
              {exceptions.map(exc => (
                <div key={exc.id} className="border border-[#2A2A2A] p-3 bg-[#0B0B0B] flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-xs text-white">{exc.title}</div>
                    <div className="text-[9px] text-[#FF8A00] uppercase mt-1">{exc.type}</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">
                      {exc.start_date} to {exc.end_date}
                    </div>
                    {exc.trainer_name && <div className="text-[9px] text-gray-400 font-medium">Coach: {exc.trainer_name}</div>}
                  </div>
                  <button onClick={() => handleDeleteException(exc.id)} className="text-[#FF3B30] hover:bg-[#FF3B30]/10 p-1" title="Delete Exception">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {exceptions.length === 0 && <div className="text-xs text-[#8A8A8A] italic">No leave blocks registered.</div>}
            </div>
          </Card>
        </div>
      </div>

      {/* Exception Creation Modal */}
      {excOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddException} className="bg-[#0B0B0B] border border-[#2A2A2A] p-6 max-w-md w-full relative space-y-4 text-left">
            <h3 className="font-display text-xl uppercase tracking-wider text-white">Block Schedule / Trainer Leave</h3>
            
            <Select
              label="Trainer Affected"
              value={excForm.trainer_id}
              onChange={(e) => setExcForm({ ...excForm, trainer_id: e.target.value })}
            >
              <option value="">Gym-Wide (Closed / Holiday)</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>

            <Select
              label="Block Type"
              value={excForm.type}
              onChange={(e) => setExcForm({ ...excForm, type: e.target.value })}
            >
              <option value="leave">Trainer Leave</option>
              <option value="holiday">Gym Holiday</option>
              <option value="gym_closed">Facility Closed</option>
            </Select>

            <Input
              label="Exception Description (Title)"
              placeholder="e.g. Boxing coach wedding, Independence day holiday"
              value={excForm.title}
              onChange={(e) => setExcForm({ ...excForm, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Date"
                type="date"
                value={excForm.start_date}
                onChange={(e) => setExcForm({ ...excForm, start_date: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={excForm.end_date}
                onChange={(e) => setExcForm({ ...excForm, end_date: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-[#2A2A2A]">
              <Button type="button" variant="outline" onClick={() => setExcOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={excSaving}>
                {excSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register Exception"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleReschedule} className="bg-[#0B0B0B] border border-[#2A2A2A] p-6 max-w-md w-full relative space-y-4 text-left">
            <h3 className="font-display text-xl uppercase tracking-wider text-white">Reschedule Booking</h3>
            <p className="text-xs text-[#8A8A8A]">Move booking slot for customer {selectedBooking?.name}.</p>
            
            <Input
              label="New Target Date"
              type="date"
              value={rescheduleForm.date}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
              required
            />

            <Select
              label="Select Time Slot"
              value={rescheduleForm.time_slot}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, time_slot: e.target.value })}
              required
            >
              <option value="08:00 AM">08:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="06:00 PM">06:00 PM</option>
            </Select>

            <div className="flex gap-2 justify-end pt-4 border-t border-[#2A2A2A]">
              <Button type="button" variant="outline" onClick={() => { setRescheduleOpen(false); setSelectedBooking(null); }}>Cancel</Button>
              <Button type="submit">Reschedule Slot</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
