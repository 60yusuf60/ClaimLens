'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ResultContent() {
  const searchParams = useSearchParams()
  const claimId = searchParams.get('id')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!claimId) return
    const fetchData = async () => {
      try {
        const reportRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/damage/report/${claimId}`)
        const reportData = await reportRes.json()
        setReport(reportData.damage_report)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchData()
  }, [claimId])

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-500 text-green-50'
      case 'MEDIUM': return 'bg-yellow-500 text-yellow-50'
      case 'HIGH': return 'bg-orange-500 text-orange-50'
      case 'CRITICAL': return 'bg-red-500 text-red-50'
      default: return 'bg-slate-500 text-slate-50'
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🔍</div>
        <p className="text-white text-xl font-semibold">Analyzing damage...</p>
        <p className="text-slate-400 mt-2">Our AI is processing your photos</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center py-12 px-8">
      <div className="w-full max-w-xl">
        <a href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-8 transition w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Back to Home
        </a>

        <div className="flex items-center gap-4 mb-6 bg-green-500 bg-opacity-10 rounded-2xl p-5">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">✓</div>
          <div>
            <h1 className="text-lg font-bold text-white">Claim Successfully Submitted</h1>
            <p className="text-green-100 text-sm">AI damage analysis complete — your claim is under review</p>
          </div>
        </div>

        {report && (
          <div className="space-y-3">
            <div className="card">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Vehicle Information</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Make</p>
                  <p className="text-white font-semibold">{report.vehicle_make || 'Unknown'}</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Model</p>
                  <p className="text-white font-semibold">{report.vehicle_model || 'Unknown'}</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Color</p>
                  <p className="text-white font-semibold">{report.vehicle_color || 'Unknown'}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Damage Assessment</p>
              <div className="flex items-center gap-3 mb-4">
                <span className={`${severityColor(report.severity)} text-xs font-bold px-3 py-1.5 rounded-full`}>
                  {report.severity} SEVERITY
                </span>
                <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300 text-xs">AI Confidence: {Math.round(report.confidence_score * 100)}%</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{report.damage_type}</p>
              <div className="bg-slate-900 rounded-xl p-4 border-l-4 border-blue-500">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">AI Summary</p>
                <p className="text-white text-sm leading-relaxed">{report.ai_summary}</p>
              </div>
            </div>

            <div className="card">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Estimated Repair Cost</p>
              <div className="flex items-end gap-3">
                <p className="text-5xl font-bold text-white">${report.estimated_cost_min.toLocaleString('en-US')}</p>
                <p className="text-slate-400 text-xl mb-1">— ${report.estimated_cost_max.toLocaleString('en-US')}</p>
              </div>
              <p className="text-slate-500 text-xs mt-3">Estimate based on AI photo analysis. Final cost determined by licensed adjuster.</p>
            </div>

            <div className="card flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Claim ID</p>
                <p className="text-white font-mono text-sm">{claimId}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(claimId || '')
                  alert('Claim ID copied!')
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copy ID
              </button>
            </div>

            <a href="/customer" className="block w-full bg-slate-700 hover:bg-slate-600 text-white text-center py-4 rounded-xl font-semibold transition">
              + File Another Claim
            </a>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
      <ResultContent />
    </Suspense>
  )
}