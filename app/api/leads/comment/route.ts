import { NextResponse } from "next/server"

// This is a mock database. In a real application, you would use a proper database.
const leads = {
  new_leads: [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      course: "Computer Science",
      phone: "(555) 123-4567",
      lastModified: "2023-05-15T10:30:00Z",
      comments: [],
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      course: "Engineering",
      phone: "(555) 234-5678",
      lastModified: "2023-05-14T14:45:00Z",
      comments: [],
    },
  ],
  contacted: [
    {
      id: "3",
      name: "Charlie Brown",
      email: "charlie@example.com",
      course: "Business",
      phone: "(555) 345-6789",
      lastModified: "2023-05-16T09:15:00Z",
      comments: [],
    },
    {
      id: "4",
      name: "Diana Ross",
      email: "diana@example.com",
      course: "Arts",
      phone: "(555) 456-7890",
      lastModified: "2023-05-16T11:00:00Z",
      comments: [],
    },
  ],
  application_sent: [
    {
      id: "5",
      name: "Edward Norton",
      email: "edward@example.com",
      course: "Law",
      phone: "(555) 567-8901",
      lastModified: "2023-05-15T16:30:00Z",
      comments: [],
    },
  ],
  interview_scheduled: [
    {
      id: "6",
      name: "Fiona Apple",
      email: "fiona@example.com",
      course: "Music",
      phone: "(555) 678-9012",
      lastModified: "2023-05-16T13:45:00Z",
      comments: [],
    },
  ],
  accepted: [
    {
      id: "7",
      name: "George Clooney",
      email: "george@example.com",
      course: "Film Studies",
      phone: "(555) 789-0123",
      lastModified: "2023-05-16T15:00:00Z",
      comments: [],
    },
  ],
}

export async function POST(request: Request) {
  const { leadId, comment } = await request.json()

  // Find the lead and add the comment
  for (const status in leads) {
    const leadIndex = leads[status].findIndex((lead: any) => lead.id === leadId)
    if (leadIndex !== -1) {
      leads[status][leadIndex].comments.push(comment)
      leads[status][leadIndex].lastModified = new Date().toISOString()
      return NextResponse.json({ success: true })
    }
  }

  return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 })
}

export async function PUT(request: Request) {
  const { leadId, commentIndex, newComment } = await request.json()

  // Find the lead and edit the comment
  for (const status in leads) {
    const leadIndex = leads[status].findIndex((lead: any) => lead.id === leadId)
    if (leadIndex !== -1) {
      leads[status][leadIndex].comments[commentIndex] = newComment
      leads[status][leadIndex].lastModified = new Date().toISOString()
      return NextResponse.json({ success: true })
    }
  }

  return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 })
}

export async function DELETE(request: Request) {
  const { leadId, commentIndex } = await request.json()

  // Find the lead and delete the comment
  for (const status in leads) {
    const leadIndex = leads[status].findIndex((lead: any) => lead.id === leadId)
    if (leadIndex !== -1) {
      leads[status][leadIndex].comments.splice(commentIndex, 1)
      leads[status][leadIndex].lastModified = new Date().toISOString()
      return NextResponse.json({ success: true })
    }
  }

  return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 })
}

