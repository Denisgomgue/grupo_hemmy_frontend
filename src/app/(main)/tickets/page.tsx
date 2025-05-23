// import { useState } from "react"
// import { ViewModeSwitcher } from "@/components/dataTable/view-mode-switcher"
// import { List, LayoutGrid, KanbanSquare } from "lucide-react"

// // Componentes ficticios para cada vista
// function TicketTableView() {
//     return <div className="p-8 bg-white rounded shadow">Tabla de tickets (lista)</div>
// }
// function TicketCardView() {
//     return <div className="p-8 bg-white rounded shadow">Cards de tickets (cuadrícula)</div>
// }
// function TicketKanbanView() {
//     return <div className="p-8 bg-white rounded shadow">Vista Kanban de tickets</div>
// }

// export default function TicketsPage() {
//     const [ viewMode, setViewMode ] = useState("list")

//     const ticketModes = [
//         { value: "list", icon: <List className="h-4 w-4" />, label: "Lista" },
//         { value: "grid", icon: <LayoutGrid className="h-4 w-4" />, label: "Cuadrícula" },
//         { value: "kanban", icon: <KanbanSquare className="h-4 w-4" />, label: "Kanban" },
//     ]

//     return (
//         <div className="max-w-5xl mx-auto p-8">
//             <div className="flex items-center justify-between mb-6">
//                 <h1 className="text-2xl font-bold">Gestión de Tickets</h1>
//                 <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} modes={ticketModes} />
//             </div>
//             {viewMode === "list" && <TicketTableView />}
//             {viewMode === "grid" && <TicketCardView />}
//             {viewMode === "kanban" && <TicketKanbanView />}
//         </div>
//     )
// } 