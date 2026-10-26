'use client'

import { useState } from 'react'
import { Search, Sparkles, BookOpen, Scale, ArrowUpRight, CheckCircle2, Loader2, FileText } from 'lucide-react'

interface VectorResult {
  id: string
  content: string
  metadata: {
    category?: string
    section?: string
    ratePerUnit?: string
    eligibility?: string
    sdrfItem?: string
    amountPerUnit?: string
    authority?: string
  }
  similarity: number
}

const PRESET_QUERIES = [
  'Gratuitous relief food and camp water',
  'Compensation for silt removal on agricultural land',
  'Financial assistance for fully damaged pucca houses',
  'Emergency family clothing and kitchen utensils',
  'High-ground cattle fodder camps',
]

export function SdrfVectorSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<VectorResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setIsLoading(true)
    setHasSearched(true)

    try {
      const res = await fetch('/api/vector-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 3 }),
      })

      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
      }
    } catch (err) {
      console.warn('Vector search fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPreset = (preset: string) => {
    setQuery(preset)
    handleSearch(preset)
  }

  return (
    <div className="sdrf-search-card">
      <div className="sdrf-search-header">
        <div className="flex-align-gap">
          <BookOpen size={16} className="text-cyan" />
          <h3 className="panel-title">MHA SDRF LEGAL NORMS // NEON PGVECTOR RETRIEVER</h3>
        </div>
        <span className="live-cadence-pill cyan">
          <Scale size={11} className="mr-1 inline text-cyan" />
          <span>STATUTORY CEILING VERIFIER · MHA 2021-2026</span>
        </span>
      </div>

      <p className="sdrf-search-desc">
        Query the Ministry of Home Affairs State Disaster Response Fund statutory guidelines. The AI searches our Neon pgvector store using cosine similarity over exact government gazette clauses to eliminate hallucinated rates.
      </p>

      {/* Preset Pills */}
      <div className="search-preset-pills">
        <span className="preset-label">FREQUENT AUDIT QUERIES:</span>
        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="search-preset-btn"
          >
            <Sparkles size={11} className="text-yellow" />
            <span>{preset}</span>
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch(query)
        }}
        className="sdrf-search-form"
      >
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon text-cyan" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search MHA relief norms, compensation ceilings, or eligibility clauses..."
            className="sdrf-search-input"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="sdrf-search-submit"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Searching pgvector...</span>
              </>
            ) : (
              <>
                <Search size={13} />
                <span>Verify Norms</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Feed */}
      {hasSearched && (
        <div className="vector-results-container">
          <div className="results-meta-row">
            <span className="results-count-text">
              FOUND {results.length} STATUTORY CLAUSES (NEON PGVECTOR COSINE MATCH)
            </span>
            <span className="authority-stamp">AUTHORITY: MHA DISASTER MANAGEMENT DIVISION</span>
          </div>

          {results.length === 0 && !isLoading ? (
            <div className="empty-results-box">
              <FileText size={24} className="text-muted mb-2" />
              <p>No direct legal norm found matching your query. Try searching for specific items like "camp feeding", "silt", or "clothing".</p>
            </div>
          ) : (
            <div className="vector-cards-grid">
              {results.map((res, idx) => (
                <div key={res.id || idx} className="vector-clause-card">
                  <div className="vcard-top">
                    <span className="sdrf-item-code">
                      {res.metadata?.sdrfItem || `SDRF-CLAUSE-${idx + 1}`}
                    </span>
                    <span className="similarity-badge">
                      {(res.similarity * 100).toFixed(1)}% match
                    </span>
                  </div>

                  <p className="vcard-content">"{res.content}"</p>

                  <div className="vcard-footer">
                    <div className="rate-ceiling">
                      <span className="rate-lbl">STATUTORY NORM:</span>
                      <span className="rate-val">
                        {res.metadata?.ratePerUnit || res.metadata?.amountPerUnit || 'As per MHA Schedule'}
                      </span>
                    </div>
                    {res.metadata?.eligibility && (
                      <span className="eligibility-chip">
                        {res.metadata.eligibility}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
