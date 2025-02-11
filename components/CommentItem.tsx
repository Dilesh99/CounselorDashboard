"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, X, Check } from "lucide-react"

interface CommentItemProps {
  comment: string
  onEdit: (newComment: string) => void
  onDelete: () => void
}

export default function CommentItem({ comment, onEdit, onDelete }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(comment)

  const handleEdit = () => {
    onEdit(editedComment)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedComment(comment)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex flex-col space-y-1">
        <Textarea
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
          className="text-xs min-h-[40px] p-1"
        />
        <div className="flex justify-end space-x-1">
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 px-2">
            <X className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleEdit} className="h-6 px-2">
            <Check className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between group py-1">
      <p className="text-xs text-gray-600 truncate flex-grow">{comment}</p>
      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-5 w-5 p-0">
          <Pencil className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="h-5 w-5 p-0">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

