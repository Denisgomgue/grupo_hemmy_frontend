"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell } from "lucide-react"

const notifications = [
    {
        id: 1,
        avatar: "https://ui-avatars.com/api/?name=CP&background=random",
        name: "Cristina Pride",
        message: "Hi, How are you? What about our next...",
        time: "1 min ago",
    },
    {
        id: 2,
        avatar: "https://ui-avatars.com/api/?name=CF&background=random",
        name: "Caleb Flakelar commented on Admin",
        message: "1 min ago",
        time: "1 min ago",
    },
    {
        id: 3,
        avatar: "https://ui-avatars.com/api/?name=KR&background=random",
        name: "Karen Robinson",
        message: "Wow ! this admin looks good and awesome design",
        time: "2 mins ago",
    },
]

export function NotificationsMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                        3
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="text-sm font-medium">Notifications</span>
                    <Button variant="ghost" className="text-xs text-muted-foreground h-auto p-0">
                        Clear All
                    </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} className="flex items-start gap-4 p-4">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={notification.avatar} />
                                <AvatarFallback>{notification.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium leading-none">{notification.name}</p>
                                <p className="text-xs text-muted-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground">{notification.time}</p>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </div>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" className="text-sm text-primary w-full">
                        View All
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

