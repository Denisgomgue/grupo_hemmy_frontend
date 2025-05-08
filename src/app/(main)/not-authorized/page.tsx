'use client'

import { XOctagon } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NotAuthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-primary px-4">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <XOctagon className="w-24 h-24 text-red-500 mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
                <p className="text-xl text-gray-600 mb-8">
                    No tienes permiso para acceder a esta página.
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors duration-300"
                >
                    Volver al inicio
                </Link>
            </motion.div>
        </div>
    )
}
