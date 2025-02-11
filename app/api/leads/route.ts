import { getLeads, addLead, updateLeadStatus } from "../mockDatabase"

export async function GET() {
  return getLeads()
}

export async function POST(request: Request) {
  const newLead = await request.json()
  return addLead(newLead)
}

export async function PUT(request: Request) {
  const { leadId, newStatus } = await request.json()
  return updateLeadStatus(leadId, newStatus)
}

