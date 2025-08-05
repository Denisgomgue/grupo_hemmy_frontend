import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from "lucide-react";

export function PaymentSummaryCards() {
    // Datos ficticios
    const summaryData = {
        totalPayments: 15420,
        pendingPayments: 2340,
        approvedPayments: 12080,
        voidedPayments: 1000
    };

    const cards = [
        {
            title: "Total Pagos",
            value: `S/ ${summaryData.totalPayments.toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
            change: "+12.5%",
            changeType: "positive"
        },
        {
            title: "Pagos Pendientes",
            value: `S/ ${summaryData.pendingPayments.toLocaleString()}`,
            icon: CreditCard,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            change: "+5.2%",
            changeType: "neutral"
        },
        {
            title: "Pagos Aprobados",
            value: `S/ ${summaryData.approvedPayments.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            change: "+8.7%",
            changeType: "positive"
        },
        {
            title: "Pagos Anulados",
            value: `S/ ${summaryData.voidedPayments.toLocaleString()}`,
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            change: "-2.1%",
            changeType: "negative"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' :
                                card.changeType === 'negative' ? 'text-red-600' :
                                    'text-gray-600'
                            }`}>
                            {card.change} desde el mes pasado
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
} 