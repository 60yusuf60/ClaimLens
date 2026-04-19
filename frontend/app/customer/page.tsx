'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [formData, setFormData] = useState({
    incident_type: '',
    incident_date: '',
    location: '',
    description: '',
  })
  const [files, setFiles] = useState<FileList | null>(null)
  const [claimId, setClaimId] = useState('')

  const incidentTypes = ['Car Accident', 'Hail Damage', 'Flood Damage', 'Theft', 'Vandalism', 'Other']
  const today = new Date().toISOString().split('T')[0]

  const handleSubmitClaim = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/claims/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          incident_date: new Date(formData.incident_date).toISOString(),
          user_id: 'guest-user',
        }),
      })
      const data = await res.json()
      setClaimId(data.claim.id)
      setStep(2)
    } catch (err) {
      alert('Error submitting claim. Please try again.')
    }
    setLoading(false)
  }

  const handleAnalyze = async () => {
    if (!files || files.length === 0) return alert('Please upload at least one photo.')
    setLoading(true)
    try {
      const formDataObj = new FormData()
      for (let i = 0; i < files.length; i++) {
        formDataObj.append('files', files[i])
      }
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/damage/analyze/${claimId}`, {
        method: 'POST',
        body: formDataObj,
      })
      router.push(`/customer/result?id=${claimId}`)
    } catch (err) {
      alert('Error analyzing damage. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center py-12 px-8">
      <div className="w-full max-w-lg">
        <a href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-8 transition w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Back to Home
        </a>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">File a Claim</h1>
          <p className="text-slate-400 text-sm">Complete the form and upload damage photos for AI analysis</p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
            <span>1</span><span>Incident Details</span>
          </div>
          <div className={`flex-1 h-0.5 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
            <span>2</span><span>Upload Photos</span>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-6">Incident Details</h2>
            <div className="space-y-5">
              <div>
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Incident Type</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition text-left flex justify-between items-center"
                  >
                    <span className={formData.incident_type ? 'text-white' : 'text-slate-500'}>
                      {formData.incident_type || 'Select type...'}
                    </span>
                    <span className="text-slate-400">▼</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-xl mt-1 overflow-hidden">
                      {incidentTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, incident_type: type })
                            setDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Incident Date</label>
                <input
                  type="date"
                  max={today}
                  className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition [color-scheme:dark]"
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Location</label>
                <input
                  type="text"
                  placeholder="123 Main St, City, State"
                  className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition placeholder-slate-600"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Description <span className="text-slate-600 normal-case">(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="Describe what happened..."
                  className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none transition placeholder-slate-600 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <button
                onClick={handleSubmitClaim}
                disabled={loading || !formData.incident_type || !formData.incident_date || !formData.location}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-4 rounded-xl font-semibold transition mt-2"
              >
                {loading ? 'Submitting...' : 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-1">Upload Damage Photos</h2>
            <p className="text-slate-400 text-sm mb-6">Upload up to 10 photos for best AI analysis results</p>
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-10 text-center transition">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-white font-medium mb-1">Click to upload photos</p>
                <p className="text-slate-500 text-sm">JPG, PNG, WEBP — up to 10 files</p>
                {files && (
                  <p className="text-blue-400 mt-3 font-medium">{files.length} photo(s) selected ✓</p>
                )}
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="file-upload"
                onChange={(e) => setFiles(e.target.files)}
              />
            </label>
            <button
              onClick={handleAnalyze}
              disabled={loading || !files}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-4 rounded-xl font-semibold transition mt-6"
            >
              {loading ? '🔍 Analyzing with AI...' : 'Analyze Damage →'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}