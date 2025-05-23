import { ChartArea } from "@/components/chart/chart-area"
import { ChartBar } from "@/components/chart/chart-bar"
import { ChartLine } from "@/components/chart/chart-line"
import { ChartPie } from "@/components/chart/chart-pie"

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* genere cista general */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold">Cista general</h2>
          <p className="text-sm text-gray-500">
            Cista general
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">100</span>
              <span className="text-sm text-gray-500"> €</span>
            </div>
          </p>
        </div>
        {/* <ChartLine />
        <ChartBar />
        <ChartArea />
        <ChartPie /> */}
      </div>
    </div>
  )
}

