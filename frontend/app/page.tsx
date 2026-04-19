export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-6">
          <span className="bg-blue-500 bg-opacity-20 text-white text-sm font-medium px-4 py-2 rounded-full border border-blue-400 border-opacity-50">
            AI-Powered Insurance Platform
          </span>
        </div>
        <h1 className="text-7xl font-bold text-white mb-6">
          Claim<span className="text-blue-400">Lens</span>
        </h1>
        <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
          File your insurance claim in minutes. Our AI analyzes damage photos instantly and generates professional reports.
        </p>
        <p className="text-slate-400 mb-12">
          Trusted by insurance professionals across America
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/customer" className="bg-blue-500 hover:bg-blue-400 text-white px-10 py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-blue-500/25">
            File a Claim
          </a>
          <a href="/agent" className="bg-transparent hover:bg-blue-800 text-white border-2 border-white border-opacity-50 px-10 py-4 rounded-xl text-lg font-semibold transition">
            Agent Portal
          </a>
        </div>
        <div className="mt-20 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-white">2 min</p>
            <p className="text-slate-400 mt-1">Average claim time</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">98%</p>
            <p className="text-slate-400 mt-1">AI accuracy rate</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">10x</p>
            <p className="text-slate-400 mt-1">Faster than manual</p>
          </div>
        </div>
      </div>
    </main>
  )
}