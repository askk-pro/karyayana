import type React from "react"

interface GradientCardProps {
    title: string
    description: string
    icon: React.ReactNode
    colorFrom: string
    colorTo: string
}

export function GradientCard({ title, description, icon, colorFrom, colorTo }: GradientCardProps) {
    return (
        <div
            className={`rounded-xl p-6 relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br from-${colorFrom}-50 to-${colorTo}-100/30 opacity-30`}></div>
            <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-${colorFrom}-100 flex items-center justify-center mb-4`}>{icon}</div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-transparent to-gray-100 opacity-50"></div>
        </div>
    )
}
