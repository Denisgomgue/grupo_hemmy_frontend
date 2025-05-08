import { ChartArea } from "@/components/chart/chart-area"
import { ChartBar } from "@/components/chart/chart-bar"
import { ChartLine } from "@/components/chart/chart-line"
import { ChartPie } from "@/components/chart/chart-pie"

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartLine />
        <ChartBar />
        <ChartArea />
        <ChartPie />
      </div>
    </div>
  )
}

