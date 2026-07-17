import React, { useState, useEffect } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader, Button, Card, Input } from "@/components/admin/ui";
import { Loader2, Mail, CheckCircle, XCircle, Play } from "lucide-react";

export default function EmailTesterPage() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("reservation");

  const loadDiagnostics = () => {
    setLoading(true);
    api.get("/admin/mail/diagnostics")
      .then(r => setDiagnostics(r.data))
      .catch(() => toast.error("Failed to load email diagnostics"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const sendTest = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      toast.error("Please enter a valid recipient email.");
      return;
    }
    setSendingTest(true);
    try {
      await api.post("/admin/mail/test-send", { email: testEmail });
      toast.success(`Test email successfully sent to ${testEmail}!`);
      loadDiagnostics(); // Refresh last sent status
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to dispatch test email.");
    } finally {
      setSendingTest(false);
    }
  };

  if (loading && !diagnostics) {
    return <div className="text-[#8A8A8A] flex items-center gap-2 p-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading diagnostics…</div>;
  }

  const templates = [
    { key: "reservation", name: "Booking Reservation", desc: "Sent on session slot confirmations or status updates." },
    { key: "cancelled", name: "Booking Cancelled", desc: "Sent when a coach or admin rejects or reschedules a booking." },
    { key: "contact", name: "Contact Message Acknowledged", desc: "Sent to the user when they submit the general contact form." },
    { key: "enquiry", name: "Membership Enquiry", desc: "Sent on pricing packages and consultation queries." },
    { key: "newsletter", name: "Newsletter Welcome", desc: "Sent on subscribing to the weekly bulletin newsletter." }
  ];

  return (
    <div className="space-y-6" data-testid="admin-email-tester-page">
      <PageHeader
        title="Email System Tester"
        subtitle="Verify SMTP credentials, test email templates, and view mail dispatch activity"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Diagnostics Panel */}
        <Card className="lg:col-span-1 p-6 space-y-4 text-left border border-[#2A2A2A] bg-[#171717]">
          <h3 className="font-semibold text-white text-base border-b border-[#2A2A2A] pb-2">SMTP Server Diagnostics</h3>
          {diagnostics && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A8A8A]">Status:</span>
                {diagnostics.is_connected ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#3DDC84] font-semibold">
                    <CheckCircle size={14} /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#FF3B30] font-semibold">
                    <XCircle size={14} /> Not Configured / Offline
                  </span>
                )}
              </div>
              <div className="text-[10px] text-gray-400 font-mono bg-[#0B0B0B] p-2 border border-[#2A2A2A] break-all leading-normal">
                {diagnostics.connection_message}
              </div>
              <div className="space-y-1.5 text-xs">
                <div><span className="text-[#8A8A8A] block text-[10px] uppercase">SMTP Host</span> <span className="font-mono text-white">{diagnostics.smtp_host || "Local Console Simulation"}</span></div>
                <div><span className="text-[#8A8A8A] block text-[10px] uppercase">SMTP Port</span> <span className="font-mono text-white">{diagnostics.smtp_port}</span></div>
                <div><span className="text-[#8A8A8A] block text-[10px] uppercase">SMTP User</span> <span className="font-mono text-white">{diagnostics.smtp_user || "None"}</span></div>
                <div><span className="text-[#8A8A8A] block text-[10px] uppercase">Sender Address</span> <span className="font-mono text-white">{diagnostics.smtp_from_email}</span></div>
              </div>
              <div className="border-t border-[#2A2A2A] pt-3">
                <span className="text-[#8A8A8A] block text-[10px] uppercase mb-1">Last Send Operation</span>
                <span className="text-xs text-gray-300 italic">{diagnostics.last_send_status}</span>
              </div>
            </div>
          )}
          <Button onClick={loadDiagnostics} className="w-full text-xs uppercase" variant="outline">
            Refresh Server Status
          </Button>
        </Card>

        {/* Live SMTP Dispatcher Panel */}
        <Card className="lg:col-span-2 p-6 space-y-6 text-left border border-[#2A2A2A] bg-[#171717]">
          <div>
            <h3 className="font-semibold text-white text-base">Send Live Test Email</h3>
            <p className="text-xs text-[#8A8A8A] mt-1">Specify a target address to receive a live mock newsletter template.</p>
          </div>
          <form onSubmit={sendTest} className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Recipient Email Address"
                placeholder="you@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={sendingTest}>
              {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {sendingTest ? "Sending" : "Send Test"}
            </Button>
          </form>

          {/* Email Template Previews */}
          <div className="border-t border-[#2A2A2A] pt-4 space-y-4">
            <h3 className="font-semibold text-white text-base">Template Library Previews</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {templates.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTemplate(t.key)}
                  className={`p-3 border text-left rounded-md transition-colors ${activeTemplate === t.key ? "bg-[#FF5A1F]/10 border-[#FF5A1F] text-white" : "border-[#2A2A2A] bg-[#0B0B0B] hover:border-gray-500 text-gray-400"}`}
                >
                  <div className="font-semibold text-xs text-white">{t.name}</div>
                  <div className="text-[10px] text-gray-400 mt-1 leading-normal">{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Rendered Template Box */}
            <div className="border border-[#2A2A2A] rounded-md overflow-hidden">
              <div className="bg-[#0B0B0B] px-4 py-2 text-xs border-b border-[#2A2A2A] text-gray-400 font-mono flex items-center justify-between">
                <span>Viewport: 600px width</span>
                <span>Subject: {activeTemplate.toUpperCase()} TEMPLATE</span>
              </div>
              <div className="bg-[#0B0B0B] p-6 flex justify-center">
                <div className="w-full max-w-[480px] bg-[#171717] border border-[#2A2A2A] text-left">
                  {/* Mock Header */}
                  <div className="bg-black border-b-2 border-[#FF5A1F] p-4 text-center">
                    <span className="font-bold text-white text-lg tracking-wider">FIT<span className="text-[#FF5A1F]">FORGE</span></span>
                  </div>
                  {/* Mock Body */}
                  <div className="p-6 text-xs text-gray-300 space-y-3 leading-relaxed">
                    {activeTemplate === "reservation" && (
                      <>
                        <h4 className="text-white font-semibold text-sm">Session Reservation Confirmation</h4>
                        <p>Hi Arjun Kapoor,</p>
                        <p>Your session reservation has been processed. Here are the booking details:</p>
                        <div className="bg-black/50 border-l-2 border-[#FF5A1F] p-3 text-gray-400 italic">
                          Trainer: Arjun Kapoor<br />Date: 2026-07-20<br />Time: 10:00 AM
                        </div>
                        <p>Status: <span className="text-[#3DDC84] font-bold">APPROVED</span></p>
                      </>
                    )}
                    {activeTemplate === "cancelled" && (
                      <>
                        <h4 className="text-white font-semibold text-sm">Session Reservation Update</h4>
                        <p>Hi Priya Sharma,</p>
                        <p>We regret to inform you that your session reservation with <strong>Arjun Kapoor</strong> on <strong>2026-07-20</strong> at <strong>10:00 AM</strong> has been cancelled.</p>
                        <div className="bg-black/50 border-l-2 border-[#FF5A1F] p-3 text-gray-400 italic">
                          Reason: Trainer leave or slot rescheduled.
                        </div>
                      </>
                    )}
                    {activeTemplate === "contact" && (
                      <>
                        <h4 className="text-white font-semibold text-sm">We've Received Your Message</h4>
                        <p>Hi Rohan Nair,</p>
                        <p>Thank you for getting in touch with FitForge. We have received your message and will review it shortly.</p>
                      </>
                    )}
                    {activeTemplate === "enquiry" && (
                      <>
                        <h4 className="text-white font-semibold text-sm">Membership Enquiry Received</h4>
                        <p>Hi Priya Sharma,</p>
                        <p>Thank you for inquiring about the <strong>Pro Package</strong> membership at FitForge Gym.</p>
                        <p>One of our certified consultants will reach out to you within 24 hours.</p>
                      </>
                    )}
                    {activeTemplate === "newsletter" && (
                      <>
                        <h4 className="text-white font-semibold text-sm">Welcome to the FitForge Newsletter!</h4>
                        <p>Hi there,</p>
                        <p>You're on the list. We send out weekly training programming notes, diet strategies, and coach updates.</p>
                      </>
                    )}
                    <div className="pt-4 border-t border-[#2A2A2A] text-center text-[10px] text-gray-500">
                      © 2026 FitForge Gym. All rights reserved.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
