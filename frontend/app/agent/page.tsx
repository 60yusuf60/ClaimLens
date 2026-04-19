'use client'

import { useEffect, useState } from 'react'

export default function AgentPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [filter, setFilter] = useState('ALL')
  const [photos, setPhotos] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/claims/`)
        const data = await res.json()
        setClaims(data.claims)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchClaims()
  }, [])

  const fetchReport = async (claimId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/damage/report/${claimId}`)
      const data = await res.json()
      setReport(data.damage_report)
    } catch (err) {
      setReport(null)
    }
  }

  const fetchPhotos = async (claimId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/damage/photos/${claimId}`)
      const data = await res.json()
      setPhotos(data.photos)
    } catch (err) {
      setPhotos([])
    }
  }

  const handleSelectClaim = (claim: any) => {
    setSelected(claim)
    setReport(null)
    setPhotos([])
    setLightboxIndex(null)
    fetchReport(claim.id)
    fetchPhotos(claim.id)
  }

  const updateStatus = async (claimId: string, status: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/claims/${claimId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setClaims(claims.map(c => c.id === claimId ? { ...c, status } : c))
      setSelected({ ...selected, status })
    } catch (err) {
      alert('Error updating status')
    }
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-500 text-green-50'
      case 'MEDIUM': return 'bg-yellow-500 text-yellow-50'
      case 'HIGH': return 'bg-orange-500 text-orange-50'
      case 'CRITICAL': return 'bg-red-500 text-red-50'
      default: return 'bg-slate-500 text-slate-50'
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 text-yellow-900 font-bold'
      case 'UNDER_REVIEW': return 'bg-blue-500 text-white font-bold'
      case 'APPROVED': return 'bg-green-500 text-white font-bold'
      case 'REJECTED': return 'bg-red-500 text-white font-bold'
      default: return 'bg-slate-500 text-white font-bold'
    }
  }

  const filteredClaims = claims
    .filter(c => filter === 'ALL' ? true : c.status === filter)
    .filter(c =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.incident_type.toLowerCase().includes(search.toLowerCase())
    )

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900">
      <div className="border-b border-slate-700 bg-slate-900 bg-opacity-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-2xl font-bold text-white">Claim<span className="text-blue-400">Lens</span></a>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Agent Portal</span>
        </div>
        <p className="text-slate-400 text-sm">{claims.length} total claims</p>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        <div className="w-96 border-r border-slate-700 overflow-y-auto bg-slate-900 flex flex-col" style={{scrollbarColor: '#334155 #0f172a'}}>
          
          <div className="p-3 border-b border-slate-700">
            <input
              type="text"
              placeholder="Search by ID, location, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="p-3 border-b border-slate-700 flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${filter === s ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              >
                {s} {s === 'ALL' ? `(${claims.length})` : `(${claims.filter(c => c.status === s).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-slate-400">Loading claims...</p>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-slate-400">No claims found</p>
            </div>
          ) : (
            filteredClaims.map((claim) => (
              <div
                key={claim.id}
                onClick={() => handleSelectClaim(claim)}
                className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-800 transition ${selected?.id === claim.id ? 'bg-slate-800 border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">{claim.incident_type}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(claim.status)}`}>{claim.status}</span>
                </div>
                <p className="text-slate-400 text-xs mb-1">{claim.location}</p>
                <p className="text-slate-500 text-xs">{formatDate(claim.incident_date)}</p>
                <p className="text-slate-600 text-xs font-mono mt-1">{claim.id}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-white font-semibold text-lg">Select a claim</p>
                <p className="text-slate-400 text-sm mt-1">Click on a claim to view details</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selected.incident_type}</h2>
                  <p className="text-slate-400 text-sm">{selected.location} · {formatDate(selected.incident_date)}</p>
                </div>
                <span className={`text-xs px-3 py-1.5 rounded-full ${statusColor(selected.status)}`}>{selected.status}</span>
              </div>

              {selected.description && (
                <div className="card">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Description</p>
                  <p className="text-white text-sm">{selected.description}</p>
                </div>
              )}

              {photos.length > 0 && (
                <div className="card">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Damage Photos ({photos.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Photo ${i + 1}`}
                        onClick={() => setLightboxIndex(i)}
                        className="w-full h-24 object-cover rounded-xl hover:opacity-80 transition cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}

              {report ? (
                <>
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
                      <p className="text-4xl font-bold text-white">${report.estimated_cost_min.toLocaleString('en-US')}</p>
                      <p className="text-slate-400 text-xl mb-1">— ${report.estimated_cost_max.toLocaleString('en-US')}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card">
                  <p className="text-slate-400 text-sm">No damage report yet for this claim.</p>
                </div>
              )}

              {selected.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(selected.id, 'APPROVED')}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-semibold transition"
                  >
                    ✓ Approve Claim
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, 'REJECTED')}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-semibold transition"
                  >
                    ✕ Reject Claim
                  </button>
                </div>
              )}

              {selected.status === 'APPROVED' && (
                <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-xl p-4 text-center">
                  <p className="text-white font-semibold">✓ This claim has been approved</p>
                </div>
              )}

              {selected.status === 'REJECTED' && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-4 text-center">
                  <p className="text-white font-semibold">✕ This claim has been rejected</p>
                </div>
              )}

              <div className="card flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Claim ID</p>
                  <p className="text-white font-mono text-sm">{selected.id}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selected.id)
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
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-slate-300 transition"
            >
              ✕
            </button>
            <p className="text-slate-400 text-xs text-center mb-3">{lightboxIndex + 1} / {photos.length}</p>
            <img
              src={photos[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              className="w-full max-h-[75vh] object-contain rounded-xl"
              onWheel={(e) => {
                e.preventDefault()
                const img = e.currentTarget
                const rect = img.getBoundingClientRect()
                const offsetX = ((e.clientX - rect.left) / rect.width) * 100
                const offsetY = ((e.clientY - rect.top) / rect.height) * 100
                const currentScale = parseFloat(img.dataset.scale || '1')
                const newScale = e.deltaY < 0 ? Math.min(currentScale + 0.15, 4) : Math.max(currentScale - 0.15, 0.5)
                img.dataset.scale = String(newScale)
                img.style.transformOrigin = `${offsetX}% ${offsetY}%`
                img.style.transform = `scale(${newScale})`
              }}
            />
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setLightboxIndex(i => i !== null && i > 0 ? i - 1 : photos.length - 1)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition"
              >
                ← Previous
              </button>
              <p className="text-slate-400 text-sm">Scroll to zoom</p>
              <button
                onClick={() => setLightboxIndex(i => i !== null && i < photos.length - 1 ? i + 1 : 0)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}