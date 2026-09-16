"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function OwnerDashboard() {
  return (
    <main className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-outfit text-4xl font-bold text-white">Owner Dashboard</h1>
          <Button onClick={() => alert('Add New Turf form coming soon!')} className="font-semibold shadow-[0_0_20px_rgba(0,230,118,0.4)]">Add New Turf</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/70 text-sm font-medium uppercase tracking-wider">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">₹45,200</div>
              <p className="text-sm text-primary mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="glass border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/70 text-sm font-medium uppercase tracking-wider">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">38</div>
            </CardContent>
          </Card>
          <Card className="glass border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/70 text-sm font-medium uppercase tracking-wider">Active Turfs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">2</div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Recent Bookings</h2>
        <Card className="glass-panel border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-white/80">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium">Turf</th>
                  <th className="p-4 font-medium">Date & Time</th>
                  <th className="p-4 font-medium">Player</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-4 text-white font-medium">Neon Arena Futsal</td>
                  <td className="p-4">2026-07-25 • 19:00</td>
                  <td className="p-4">John Doe</td>
                  <td className="p-4">₹1200</td>
                  <td className="p-4"><span className="text-primary font-medium bg-primary/10 px-2 py-1 rounded">Confirmed</span></td>
                  <td className="p-4">
                    <Button variant="outline" onClick={() => alert('Slot Blocked')} size="sm" className="h-8 border-white/20 text-white hover:bg-white/10">Block Slot</Button>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-medium">Starlight Cricket</td>
                  <td className="p-4">2026-07-26 • 20:00</td>
                  <td className="p-4">Alice Smith</td>
                  <td className="p-4">₹1500</td>
                  <td className="p-4"><span className="text-yellow-400 font-medium bg-yellow-400/10 px-2 py-1 rounded">Pending</span></td>
                  <td className="p-4">
                    <Button variant="outline" onClick={() => alert('Slot Blocked')} size="sm" className="h-8 border-white/20 text-white hover:bg-white/10">Block Slot</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  )
}
