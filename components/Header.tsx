"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { BellIcon, SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StudentDetailsModal from "./StudentDetailsModal" // Import the modal component

interface Lead {
  id: string
  name: string
  email: string
  course: string
  statusHistory: { status: string }[]
}

interface HeaderProps {
  onSearch: (query: string) => void
}

const fetchLeads = async (query: string): Promise<Lead[]> => {
  try {
    const response = await fetch("/api/leads")
    if (!response.ok) throw new Error("Failed to fetch leads")

    const data = await response.json()
    const allLeads: Lead[] = Object.values(data).flat()

    const lowerCaseQuery = query.toLowerCase()
    const regex = new RegExp(`\\b${lowerCaseQuery}`, "i")

    return allLeads
      .filter(
        (lead) =>
          regex.test(lead.name) || 
          regex.test(lead.email) || 
          regex.test(lead.course) ||
          regex.test(lead.statusHistory[lead.statusHistory.length - 1].status)
      )
      .slice(0, 5)
  } catch (error) {
    console.error("Error fetching leads:", error)
    return []
  }
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Lead[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Lead | null>(null) // State for selected student
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setShowSuggestions(false) // Hide suggestions after selection
    onSearch(query)

    if (!query.trim()) {
      onSearch("") // Return to Kanban board if input is empty
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    onSearch("") // Return to Kanban board
  }

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (searchQuery.length > 0) {
      debounceTimer.current = setTimeout(async () => {
        const results = await fetchLeads(searchQuery)
        setSuggestions(results)
        setShowSuggestions(true)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      onSearch("") // Return to Kanban board
    }
  }, [searchQuery])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSuggestions(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
          </div>

          <div className="flex-1 max-w-xl mx-4 relative" ref={searchRef}>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-full pr-20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                aria-label="Search leads"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => handleSearch(searchQuery)}
                aria-label="Search"
              >
                <SearchIcon className="h-5 w-5" />
              </Button>
            </div>

            {showSuggestions && (
              <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-md z-50">
                {suggestions.length > 0 ? (
                  suggestions.map((lead) => (
                    <button
                      key={lead.id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col"
                      onClick={() => setSelectedStudent(lead)} // Set selected student
                    >
                      <span className="font-medium">{lead.name}</span>
                      <span className="text-sm text-gray-500">{lead.email}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-gray-500">No results found</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" aria-label="Notifications">
              <BellIcon className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-10 w-10">
                   
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Counselor Name</p>
                    <p className="text-xs leading-none text-muted-foreground">counselor@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Show StudentDetailsModal when a student is selected */}
      {selectedStudent && (
        <StudentDetailsModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          lead={selectedStudent} // Pass selected student to modal
        />
      )}
    </header>
  )
}
