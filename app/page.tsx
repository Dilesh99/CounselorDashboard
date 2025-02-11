"use client"

import { useState } from "react"
import KanbanBoard from "@/components/KanbanBoard"
import Header from "@/components/Header"


export default function CounselorDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header onSearch={handleSearch} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Welcome to Counselor Dashboard</h1>
          </div>
          <KanbanBoard searchQuery={searchQuery} />
        </div>
      </main>
    </div>
  )
}

