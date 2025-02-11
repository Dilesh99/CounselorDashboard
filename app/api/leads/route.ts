import { NextResponse } from "next/server"

// Mock database for leads in different categories
const leads = {
  new_leads: [],
  call_round_1: [],
  call_round_2: [],
  new_call_round: [],
  sms_rounds: [],
  email_rounds: [],
  pending: [],
  positive_leads: [],
  dead_leads: [],
  lecturer_assigned: [],
  application_fee_paid: [],
  exam_slot_booked: [],
  exam_passed: [],
  gd_pi_cleared: [],
  token_fee_paid: [],
  enrolled: [],
}

// Sample data for testing
const sampleLeads = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    course: "Computer Science",
    phone: "(555) 123-4567",
    lastModified: "2023-05-15T10:30:00Z",
    statusHistory: [{ status: "new_leads", date: "2023-05-15T10:30:00Z" }],
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    course: "Engineering",
    phone: "(555) 234-5678",
    lastModified: "2023-05-14T14:45:00Z",
    statusHistory: [{ status: "call_round_1", date: "2023-05-14T14:45:00Z" }],
  },
]

sampleLeads.forEach((lead) => {
  const currentStatus = lead.statusHistory[lead.statusHistory.length - 1].status
  leads[currentStatus].push(lead)
})

// GET all leads
export async function GET() {
  return NextResponse.json(leads)
}

// Function to normalize strings for comparison
const normalizeString = (str: string) => str.trim().toLowerCase()
const normalizePhone = (phone: string) => phone.replace(/\D/g, "") // Remove non-numeric characters

// POST - Add a new lead
export async function POST(request: Request) {
  const newLead = await request.json()
  newLead.id = String(Date.now())
  newLead.lastModified = new Date().toISOString()
  newLead.statusHistory = [{ status: "new_leads", date: newLead.lastModified }]

  // Normalize input for case-insensitive comparison
  const newName = normalizeString(newLead.name)
  const newEmail = normalizeString(newLead.email)
  const newPhone = normalizePhone(newLead.phone)

  // Check for duplicates across all lead categories
  const isDuplicate = Object.values(leads).some((category) =>
    category.some(
      (lead: any) =>
        normalizeString(lead.name) === newName || // Name comparison
        normalizeString(lead.email) === newEmail || // Email comparison
        normalizePhone(lead.phone) === newPhone // Phone comparison
    )
  )

  if (isDuplicate) {
    return NextResponse.json(
      { success: false, error: "Lead with the same name, email, or phone already exists" },
      { status: 400 }
    )
  }

  // If no duplicate found, add the lead
  leads.new_leads.push(newLead)

  return NextResponse.json({ success: true, lead: newLead })
}
