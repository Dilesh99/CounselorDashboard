"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import StudentDetailsModal from "./StudentDetailsModal"

interface Lead {
  id: string
  name: string
  email: string
  course: string
  statusHistory: { status: string }[]
}

interface SearchComponentProps {
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
          regex.test(lead.statusHistory[lead.statusHistory.length - 1].status),
      )
      .slice(0, 5)
  } catch (error) {
    console.error("Error fetching leads:", error)
    return []
  }
}

export default function SearchComponent({ onSearch }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Lead[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Lead | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setShowSuggestions(false)
    onSearch(query)

    if (!query.trim()) {
      onSearch("")
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    onSearch("")
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
      onSearch("")
    }
  }, [searchQuery, onSearch])

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
                onClick={() => setSelectedStudent(lead)}
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

      {selectedStudent && (
        <StudentDetailsModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          lead={selectedStudent}
        />
      )}
    </div>
  )
}

