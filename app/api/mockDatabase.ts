import { NextResponse } from "next/server"

// Mock database
const leads = {
  new_leads: [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      course: "Computer Science",
      phone: "(555) 123-4567",
      lastModified: "2023-05-15T10:30:00Z",
      statusHistory: [{ status: "new_leads", date: "2023-05-15T10:30:00Z" }],
      comments: [],
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      course: "Engineering",
      phone: "(555) 234-5678",
      lastModified: "2023-05-14T14:45:00Z",
      statusHistory: [{ status: "new_leads", date: "2023-05-14T14:45:00Z" }],
      comments: [],
    },
  ],
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

// Helper functions
const normalizeString = (str: string) => str.trim().toLowerCase()
const normalizePhone = (phone: string) => phone.replace(/\D/g, "")

// API functions
export async function getLeads() {
  return NextResponse.json(leads)
}

export async function addLead(newLead: any) {
  newLead.id = String(Date.now())
  newLead.lastModified = new Date().toISOString()
  newLead.statusHistory = [{ status: "new_leads", date: newLead.lastModified }]
  newLead.comments = []

  const newName = normalizeString(newLead.name)
  const newEmail = normalizeString(newLead.email)
  const newPhone = normalizePhone(newLead.phone)

  const isDuplicate = Object.values(leads).some((category) =>
    category.some(
      (lead: any) =>
        normalizeString(lead.name) === newName ||
        normalizeString(lead.email) === newEmail ||
        normalizePhone(lead.phone) === newPhone,
    ),
  )

  if (isDuplicate) {
    return NextResponse.json(
      { success: false, error: "Lead with the same name, email, or phone already exists" },
      { status: 400 },
    )
  }

  leads.new_leads.push(newLead)
  return NextResponse.json({ success: true, lead: newLead })
}

export async function updateLeadStatus(leadId: string, newStatus: string) {
  let updatedLead = null

  for (const status in leads) {
    const leadIndex = leads[status].findIndex((lead: any) => lead.id === leadId)
    if (leadIndex !== -1) {
      updatedLead = leads[status][leadIndex]
      updatedLead.lastModified = new Date().toISOString()
      updatedLead.statusHistory.push({ status: newStatus, date: updatedLead.lastModified })
      leads[status].splice(leadIndex, 1)
      leads[newStatus].push(updatedLead)
      break
    }
  }

  if (updatedLead) {
    return NextResponse.json({ success: true, lead: updatedLead })
  } else {
    return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 })
  }
}

export async function addComment(leadId: string, comment: string) {
  let updatedLead = null

  for (const status in leads) {
    const leadIndex = leads[status].findIndex((lead: any) => lead.id === leadId)
    if (leadIndex !== -1) {
      updatedLead = leads[status][leadIndex]
      updatedLead.comments.push(comment)
      updatedLead.lastModified = new Date().toISOString()
      break
    }
  }

  if (updatedLead) {
    return NextResponse.json({ success: true, lead: updatedLead })
  } else {
    return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 })
  }
}

export async function editComment(leadId: string, commentIndex: number, newComment: string) {
  let updatedLead = null

  for (const status in leads) {
    const leadIndex = leads[status].findIndex((lead: any) => lead.id === leadId)
    if (leadIndex !== -1) {
      updatedLead = leads[status][leadIndex]
      if (commentIndex >= 0 && commentIndex < updatedLead.comments.length) {
        updatedLead.comments[commentIndex] = newComment
        updatedLead.lastModified = new Date().toISOString()
      } else {
        return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 })
      }
      break
    }
  }

  if (updatedLead) {
    return NextResponse.json({ success: true, lead: updatedLead })
  } else {
    return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 })
  }
}

export async function deleteComment(leadId: string, commentIndex: number) {
  let updatedLead = null

  for (const status in leads) {
    const leadIndex = leads[status].findIndex((lead: any) => lead.id === leadId)
    if (leadIndex !== -1) {
      updatedLead = leads[status][leadIndex]
      if (commentIndex >= 0 && commentIndex < updatedLead.comments.length) {
        updatedLead.comments.splice(commentIndex, 1)
        updatedLead.lastModified = new Date().toISOString()
      } else {
        return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 })
      }
      break
    }
  }

  if (updatedLead) {
    return NextResponse.json({ success: true, lead: updatedLead })
  } else {
    return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 })
  }
}

