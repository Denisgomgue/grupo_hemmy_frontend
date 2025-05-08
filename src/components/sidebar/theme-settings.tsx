"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

export function ThemeSettings() {
    const { layoutMode, setLayoutMode, colorScheme, setColorScheme, sidebarColor, setSidebarColor } = useTheme()

    const handleLayoutChange = (mode: string) => {
        setLayoutMode(mode)
    }

    const handleColorSchemeChange = (scheme: string) => {
        setColorScheme(scheme)
    }

    const handleSidebarColorChange = (color: string) => {
        setSidebarColor(color)
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Settings className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-64">
                <SheetHeader>
                    <SheetTitle>THEME SETTINGS</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-4">
                        <Label className="text-sm font-medium">Layout Mode</Label>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="default" className="text-sm text-muted-foreground">
                                    Default Layout
                                </Label>
                                <Switch
                                    id="default"
                                    checked={layoutMode === "default"}
                                    onCheckedChange={() => handleLayoutChange("default")}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="detached" className="text-sm text-muted-foreground">
                                    Detached Layout
                                </Label>
                                <Switch
                                    id="detached"
                                    checked={layoutMode === "detached"}
                                    onCheckedChange={() => handleLayoutChange("detached")}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-sm font-medium">Color Scheme</Label>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="light" className="text-sm text-muted-foreground">
                                    Light Mode
                                </Label>
                                <Switch
                                    id="light"
                                    checked={colorScheme === "light"}
                                    onCheckedChange={() => handleColorSchemeChange("light")}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dark" className="text-sm text-muted-foreground">
                                    Dark Mode
                                </Label>
                                <Switch
                                    id="dark"
                                    checked={colorScheme === "dark"}
                                    onCheckedChange={() => handleColorSchemeChange("dark")}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-sm font-medium">Left Sidebar Color</Label>
                        <div className="grid gap-2">
                            {["light", "dark", "hemmy"].map((color) => (
                                <div key={color} className="flex items-center justify-between">
                                    <Label htmlFor={`sidebar-${color}`} className="text-sm text-muted-foreground capitalize">
                                        {color}
                                    </Label>
                                    <Switch
                                        id={`sidebar-${color}`}
                                        checked={sidebarColor === color}
                                        onCheckedChange={() => handleSidebarColorChange(color)}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => {
                            setLayoutMode("default")
                            setColorScheme("light")
                            setSidebarColor("light") 
                        }}
                    >
                        Reset Default
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}