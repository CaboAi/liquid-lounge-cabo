import type { Metadata } from 'next'
import { ClassesClient } from './classes-client'

export const metadata: Metadata = { title: 'Browse Classes — Cabo Fit Pass' }

export default function ClassesPage() {
  return (
    <main className="container py-8 pb-24">
      <h1 className="mb-6 text-2xl font-bold">Browse Classes</h1>
      <ClassesClient />
    </main>
  )
}
