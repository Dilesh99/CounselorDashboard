import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import KanbanItem from "./KanbanItem"

interface KanbanColumnProps {
  title: string
  leads: any[]
  provided: any
  color: string
  onCommentAdded: (leadId: string, comment: string) => void
  onCommentEdited: (leadId: string, commentIndex: number, newComment: string) => void
  onCommentDeleted: (leadId: string, commentIndex: number) => void
  isFiltered: boolean
}

export default function KanbanColumn({
  title,
  leads,
  provided,
  color,
  onCommentAdded,
  onCommentEdited,
  onCommentDeleted,
  isFiltered,
}: KanbanColumnProps) {
  return (
    <Card className={`w-72 flex-shrink-0 ${color}`}>
      <CardHeader className="py-2">
        <CardTitle className="text-sm font-semibold flex justify-between items-center">
          {title}
          <span className="text-xs font-normal text-gray-500">
            {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent
        {...provided.droppableProps}
        ref={provided.innerRef}
        className="h-[calc(100vh-180px)] overflow-y-auto p-1"
      >
        {leads.map((lead: any, index: number) => (
          <KanbanItem
            key={lead.id}
            lead={lead}
            index={index}
            onCommentAdded={onCommentAdded}
            onCommentEdited={onCommentEdited}
            onCommentDeleted={onCommentDeleted}
            isFiltered={isFiltered}
          />
        ))}
        {provided.placeholder}
      </CardContent>
    </Card>
  )
}

