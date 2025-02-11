import { addComment, editComment, deleteComment } from "../../mockDatabase"

export async function POST(request: Request) {
  const { leadId, comment } = await request.json()
  return addComment(leadId, comment)
}

export async function PUT(request: Request) {
  const { leadId, commentIndex, newComment } = await request.json()
  return editComment(leadId, commentIndex, newComment)
}

export async function DELETE(request: Request) {
  const { leadId, commentIndex } = await request.json()
  return deleteComment(leadId, commentIndex)
}

