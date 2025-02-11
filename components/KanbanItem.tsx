"use client"

import { useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import AddCommentDialog from "./AddCommentDialog"
import CommentItem from "./CommentItem"
import StudentDetailsModal from "./StudentDetailsModal"

interface KanbanItemProps {
  lead: any
  index: number
  onCommentAdded: (leadId: string, comment: string) => void
  onCommentEdited: (leadId: string, commentIndex: number, newComment: string) => void
  onCommentDeleted: (leadId: string, commentIndex: number) => void
  isFiltered: boolean
}

export default function KanbanItem({
  lead,
  index,
  onCommentAdded,
  onCommentEdited,
  onCommentDeleted,
  isFiltered,
}: KanbanItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Draggable draggableId={lead.id} index={index} isDragDisabled={isFiltered}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2 bg-white"
        >
          <CardContent className="p-2">
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                <div className="relative z-10">
                  <AddCommentDialog leadId={lead.id} onCommentAdded={onCommentAdded} />
                </div>
              </div>
              <p className="text-xs text-gray-500 truncate">{lead.email}</p>
              <p className="text-xs text-gray-500 truncate">{lead.phone}</p>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {lead.course}
                </Badge>
                {isFiltered && lead.currentStatus && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {lead.currentStatus}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-400">Modified: {format(new Date(lead.lastModified), "MM/dd/yyyy")}</p>
              {lead.comments && lead.comments.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs font-semibold text-gray-700">Comments:</p>
                  <div className="max-h-20 overflow-y-auto">
                    {lead.comments.map((comment: string, commentIndex: number) => (
                      <CommentItem
                        key={`${lead.id}-comment-${commentIndex}`}
                        comment={comment}
                        onEdit={(newComment) => onCommentEdited(lead.id, commentIndex, newComment)}
                        onDelete={() => onCommentDeleted(lead.id, commentIndex)}
                      />
                    ))}
                  </div>
                </div>
              )}
              <Button variant="link" className="text-xs p-0 h-auto text-red-800" onClick={() => setIsModalOpen(true)}>
                See More
              </Button>
            </div>
          </CardContent>
          <StudentDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lead={lead} />
        </Card>
      )}
    </Draggable>
  )
}

