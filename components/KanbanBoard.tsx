"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { DragDropContext, Droppable, type DropResult, type DragStart, type DragUpdate } from "@hello-pangea/dnd"
import KanbanColumn from "./KanbanColumn"
import AddLeadDialog from "./AddLeadDialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { format, isEqual, parseISO } from "date-fns"

const statuses = [
  { id: "new_leads", title: "New Leads", color: "bg-yellow-100 border-yellow-500" },
  { id: "call_round_1", title: "Call Round 1", color: "bg-blue-100 border-blue-500" },
  { id: "call_round_2", title: "Call Round 2", color: "bg-indigo-100 border-indigo-500" },
  { id: "new_call_round", title: "New Call Round", color: "bg-purple-100 border-purple-500" },
  { id: "sms_rounds", title: "SMS Rounds", color: "bg-pink-100 border-pink-500" },
  { id: "email_rounds", title: "Email Rounds", color: "bg-red-100 border-red-500" },
  { id: "pending", title: "Pending", color: "bg-orange-100 border-orange-500" },
  { id: "positive_leads", title: "Positive Leads", color: "bg-green-100 border-green-500" },
  { id: "dead_leads", title: "Dead Leads", color: "bg-gray-100 border-gray-500" },
  { id: "lecturer_assigned", title: "Lecturer Assigned", color: "bg-teal-100 border-teal-500" },
  { id: "application_fee_paid", title: "Application Fee Paid", color: "bg-cyan-100 border-cyan-500" },
  { id: "exam_slot_booked", title: "Exam Slot Booked", color: "bg-sky-100 border-sky-500" },
  { id: "exam_passed", title: "Exam Passed", color: "bg-emerald-100 border-emerald-500" },
  { id: "gd_pi_cleared", title: "GD & PI Cleared", color: "bg-lime-100 border-lime-500" },
  { id: "token_fee_paid", title: "Token Fee Paid", color: "bg-amber-100 border-amber-500" },
  { id: "enrolled", title: "Enrolled", color: "bg-green-200 border-green-600" },
]

export default function KanbanBoard() {
  const [leads, setLeads] = useState<{ [key: string]: any[] }>({})
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isDragging, setIsDragging] = useState(false)
  const [scrollLeft, setScrollLeft] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<number | null>(null)
  const scrollStartTimeRef = useRef<number | null>(null)
  const columnWidthRef = useRef<number>(0)
  const columnRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    const response = await fetch("/api/leads")
    const data = await response.json()
    setLeads(data)
  }

  const filteredAndSortedLeads = useMemo(() => {
    let filteredLeads: { [key: string]: any[] } = {}

    if (selectedDate) {
      statuses.forEach((status) => {
        filteredLeads[status.id] = []
      })

      Object.values(leads)
        .flat()
        .forEach((lead) => {
          const statusOnSelectedDate = lead.statusHistory.find((history) =>
            isEqual(parseISO(history.date).setHours(0, 0, 0, 0), selectedDate.setHours(0, 0, 0, 0)),
          )

          if (statusOnSelectedDate) {
            filteredLeads[statusOnSelectedDate.status].push({
              ...lead,
              currentStatus: statusOnSelectedDate.status,
            })
          }
        })
    } else {
      filteredLeads = leads
    }

    Object.keys(filteredLeads).forEach((status) => {
      filteredLeads[status].sort((a, b) => {
        const dateA = new Date(a.lastModified).getTime()
        const dateB = new Date(b.lastModified).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      })
    })

    return filteredLeads
  }, [leads, selectedDate, sortOrder])

  const onDragStart = useCallback((initial: DragStart) => {
    setIsDragging(true)
    scrollStartTimeRef.current = null
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
    }
    // Calculate and store the column width
    if (containerRef.current && containerRef.current.children.length > 0) {
      columnWidthRef.current = containerRef.current.children[0].getBoundingClientRect().width
    }
  }, [])

  const getScrollSpeed = useCallback((distance: number, elapsedTime: number) => {
    const baseSpeed = 5
    const acceleration = 0.2
    const maxSpeed = 50

    const speed = Math.min(baseSpeed + acceleration * elapsedTime, maxSpeed)
    return Math.sign(distance) * Math.pow(Math.abs(distance) / 150, 2) * speed
  }, [])

  const getCorrectDroppableId = useCallback(
    (clientX: number | undefined) => {
      if (!containerRef.current || typeof clientX === "undefined") return null

      const containerRect = containerRef.current.getBoundingClientRect()
      const relativeX = clientX - containerRect.left + scrollLeft

      const columnIndex = Math.floor(relativeX / columnWidthRef.current)
      return statuses[columnIndex]?.id || null
    },
    [scrollLeft],
  )

  const onDragUpdate = useCallback(
    (update: DragUpdate) => {
      if (!containerRef.current || !update.client) return

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const scrollThreshold = 150 // pixels from the edge to start scrolling

      const startAutoScroll = () => {
        if (autoScrollIntervalRef.current) return

        if (!scrollStartTimeRef.current) {
          scrollStartTimeRef.current = Date.now()
        }

        autoScrollIntervalRef.current = window.setInterval(() => {
          if (containerRef.current && update.client) {
            const containerRect = containerRef.current.getBoundingClientRect()
            const mouseX = update.client.x

            const distanceFromLeft = mouseX - containerRect.left
            const distanceFromRight = containerRect.right - mouseX

            const elapsedTime = (Date.now() - scrollStartTimeRef.current!) / 1000 // in seconds

            if (distanceFromLeft < scrollThreshold) {
              const scrollSpeed = getScrollSpeed(scrollThreshold - distanceFromLeft, elapsedTime)
              containerRef.current.scrollLeft -= scrollSpeed
              setScrollLeft(containerRef.current.scrollLeft)
            } else if (distanceFromRight < scrollThreshold) {
              const scrollSpeed = getScrollSpeed(scrollThreshold - distanceFromRight, elapsedTime)
              containerRef.current.scrollLeft += scrollSpeed
              setScrollLeft(containerRef.current.scrollLeft)
            }

            // Force a re-render to update draggable positions
            setIsDragging((prev) => !prev)
          }
        }, 16) // ~60fps
      }

      startAutoScroll()
    },
    [getScrollSpeed],
  )

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
    scrollStartTimeRef.current = null
  }, [])

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      setIsDragging(false)
      stopAutoScroll()

      if (selectedDate) return

      const { source, destination, draggableId } = result

      // If there's no destination, or the item is dropped in the same position, do nothing
      if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
        return
      }

      const correctDestinationId = result.client ? getCorrectDroppableId(result.client.x) : destination.droppableId

      if (!correctDestinationId) return

      const finalDestination = {
        droppableId: correctDestinationId,
        index: destination.index,
      }

      const sourceColumn = leads[source.droppableId]
      const destColumn = leads[finalDestination.droppableId]
      const draggedLead = sourceColumn[source.index]

      if (!sourceColumn || !destColumn || !draggedLead) return

      // Remove the lead from the source column
      const newSourceColumn = Array.from(sourceColumn)
      newSourceColumn.splice(source.index, 1)

      let newDestColumn

      if (source.droppableId === finalDestination.droppableId) {
        // If moving within the same column, reorder the items
        newDestColumn = newSourceColumn
        newDestColumn.splice(finalDestination.index, 0, draggedLead)
      } else {
        // If moving to a different column, add to the destination column
        newDestColumn = Array.from(destColumn)
        newDestColumn.splice(finalDestination.index, 0, draggedLead)
      }

      const newLeads = {
        ...leads,
        [source.droppableId]: newSourceColumn,
        [finalDestination.droppableId]: newDestColumn,
      }

      const updatedLead = {
        ...draggedLead,
        lastModified: new Date().toISOString(),
      }

      // Only update status history if the lead has moved to a different column
      if (source.droppableId !== finalDestination.droppableId) {
        updatedLead.statusHistory.push({ status: finalDestination.droppableId, date: updatedLead.lastModified })
      }

      newLeads[finalDestination.droppableId][finalDestination.index] = updatedLead

      setLeads(newLeads)

      // Only make API call if the lead has moved to a different column
      if (source.droppableId !== finalDestination.droppableId) {
        await fetch("/api/leads", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: draggableId,
            newStatus: finalDestination.droppableId,
            lastModified: updatedLead.lastModified,
          }),
        })
      }
    },
    [leads, selectedDate, stopAutoScroll, getCorrectDroppableId],
  )

  const clearDateFilter = () => {
    setSelectedDate(undefined)
  }

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"))
  }

  const handleNewLead = (newLead: any) => {
    setLeads((prevLeads) => ({
      ...prevLeads,
      new_leads: [{ ...newLead, comments: [] }, ...prevLeads.new_leads],
    }))
  }

  const handleCommentAdded = (leadId: string, comment: string) => {
    setLeads((prevLeads) => {
      const newLeads = { ...prevLeads }
      for (const status in newLeads) {
        const leadIndex = newLeads[status].findIndex((lead) => lead.id === leadId)
        if (leadIndex !== -1) {
          const updatedLead = { ...newLeads[status][leadIndex] }
          updatedLead.comments = updatedLead.comments || []
          updatedLead.comments.push(comment)
          updatedLead.lastModified = new Date().toISOString()
          newLeads[status][leadIndex] = updatedLead
          break
        }
      }
      return newLeads
    })
  }

  const handleCommentEdited = (leadId: string, commentIndex: number, newComment: string) => {
    setLeads((prevLeads) => {
      const newLeads = { ...prevLeads }
      for (const status in newLeads) {
        const leadIndex = newLeads[status].findIndex((lead) => lead.id === leadId)
        if (leadIndex !== -1) {
          const updatedLead = { ...newLeads[status][leadIndex] }
          updatedLead.comments[commentIndex] = newComment
          newLeads[status][leadIndex] = updatedLead
          break
        }
      }
      return newLeads
    })
  }

  const handleCommentDeleted = (leadId: string, commentIndex: number) => {
    setLeads((prevLeads) => {
      const newLeads = { ...prevLeads }
      for (const status in newLeads) {
        const leadIndex = newLeads[status].findIndex((lead) => lead.id === leadId)
        if (leadIndex !== -1) {
          const updatedLead = { ...newLeads[status][leadIndex] }
          updatedLead.comments.splice(commentIndex, 1)
          newLeads[status][leadIndex] = updatedLead
          break
        }
      }
      return newLeads
    })
  }

  const handleScroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setScrollLeft(containerRef.current.scrollLeft + scrollAmount)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const handleScrollEvent = () => {
        setScrollLeft(container.scrollLeft)
      }
      container.addEventListener("scroll", handleScrollEvent)
      return () => {
        container.removeEventListener("scroll", handleScrollEvent)
      }
    }
  }, [])

  useEffect(() => {
    if (isDragging && containerRef.current) {
      const container = containerRef.current
      let scrollAnimationFrame: number | null = null

      const handleMouseMove = (e: MouseEvent) => {
        if (!container) return

        const containerRect = container.getBoundingClientRect()
        const scrollThreshold = 100 // Adjust if needed

        const distanceFromLeft = e.clientX - containerRect.left
        const distanceFromRight = containerRect.right - e.clientX

        let scrollDirection: "left" | "right" | null = null

        if (distanceFromLeft < scrollThreshold && container.scrollLeft > 0) {
          scrollDirection = "left"
        } else if (
          distanceFromRight < scrollThreshold &&
          container.scrollLeft + container.clientWidth < container.scrollWidth
        ) {
          scrollDirection = "right"
        } else {
          scrollDirection = null
        }

        // Stop auto-scrolling if user moves away from edges
        if (!scrollDirection && scrollAnimationFrame) {
          cancelAnimationFrame(scrollAnimationFrame)
          scrollAnimationFrame = null
          return
        }

        // Start auto-scrolling when near edges
        if (scrollDirection && !scrollAnimationFrame) {
          const scrollStep = () => {
            if (!scrollDirection || !containerRef.current) return
            containerRef.current.scrollBy({ left: scrollDirection === "left" ? -10 : 10, behavior: "smooth" })
            scrollAnimationFrame = requestAnimationFrame(scrollStep)
          }
          scrollAnimationFrame = requestAnimationFrame(scrollStep)
        }

        // Ensure dragging updates continue
        onDragUpdate({ client: { x: e.clientX, y: e.clientY } } as DragUpdate)
      }

      document.addEventListener("mousemove", handleMouseMove)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        if (scrollAnimationFrame) cancelAnimationFrame(scrollAnimationFrame)
      }
    }
  }, [isDragging, onDragUpdate])

  return (
    <div className="relative">
      <div className="mb-4 flex items-center space-x-2">
        <AddLeadDialog onLeadAdded={handleNewLead} />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-[240px] justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
          </PopoverContent>
        </Popover>
        {selectedDate && (
          <Button onClick={clearDateFilter} variant="ghost">
            Clear filter
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Sort by Date <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder("desc")}>Newest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder("asc")}>Oldest First</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DragDropContext onDragStart={onDragStart} onDragUpdate={onDragUpdate} onDragEnd={onDragEnd}>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <div ref={containerRef} className="flex space-x-4 overflow-x-auto pb-4 px-8">
            {statuses.map((status) => (
              <Droppable key={status.id} droppableId={status.id} isDropDisabled={!!selectedDate}>
                {(provided) => (
                  <div
                    ref={(el) => {
                      provided.innerRef(el)
                      columnRefs.current[status.id] = el
                    }}
                    {...provided.droppableProps}
                    className="w-72 min-h-[500px] bg-gray-100 rounded-lg p-4"
                  >
                    <KanbanColumn
                      title={status.title}
                      leads={filteredAndSortedLeads[status.id] || []}
                      provided={provided}
                      color={status.color}
                      onCommentAdded={handleCommentAdded}
                      onCommentEdited={handleCommentEdited}
                      onCommentDeleted={handleCommentDeleted}
                      isFiltered={!!selectedDate}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}

