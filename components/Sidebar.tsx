import { Home, Users, BookOpen, Settings, HelpCircle } from "lucide-react"
import Link from "next/link"

const Sidebar = () => {
  return (
    <div className="bg-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="flex items-center justify-center">
        <span className="text-2xl font-semibold text-blue-600">EduCRM</span>
      </div>
      <nav>
        <Link href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-500 hover:text-white">
          <Home className="inline-block mr-2 h-5 w-5" />
          Dashboard
        </Link>
        <Link href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-500 hover:text-white">
          <Users className="inline-block mr-2 h-5 w-5" />
          Student Leads
        </Link>
        <Link href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-500 hover:text-white">
          <BookOpen className="inline-block mr-2 h-5 w-5" />
          Courses
        </Link>
        <Link href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-500 hover:text-white">
          <Settings className="inline-block mr-2 h-5 w-5" />
          Settings
        </Link>
        <Link href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-500 hover:text-white">
          <HelpCircle className="inline-block mr-2 h-5 w-5" />
          Help
        </Link>
      </nav>
    </div>
  )
}

export default Sidebar

