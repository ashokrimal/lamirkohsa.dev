'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  X,
} from 'lucide-react'

export interface Column<T> {
  header: string
  accessor?: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  sortKey?: keyof T
  className?: string
  width?: string
}

interface CmsTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (row: T) => string | number
  searchPlaceholder?: string
  searchFields?: (keyof T)[]
  filterOptions?: {
    label: string
    key: keyof T
    options: { label: string; value: string }[]
  }
  pageSize?: number
  onRowClick?: (row: T) => void
  batchActions?: {
    onDelete?: (selectedKeys: (string | number)[]) => void
    onPublish?: (selectedKeys: (string | number)[]) => void
    customActions?: React.ReactNode
  }
  emptyMessage?: string
  emptySubtext?: string
  onEmptyAction?: () => void
  emptyActionLabel?: string
}

export function CmsTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchFields = [],
  filterOptions,
  pageSize = 8,
  onRowClick,
  batchActions,
  emptyMessage = 'No records found',
  emptySubtext = 'Try adjusting your search terms or filter criteria.',
  onEmptyAction,
  emptyActionLabel,
}: CmsTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  // Filter & Search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Category / Status Filter
      if (filterOptions && selectedFilter !== 'ALL') {
        const itemVal = String(item[filterOptions.key] || '')
        if (itemVal.toLowerCase() !== selectedFilter.toLowerCase()) {
          return false
        }
      }

      // Text search
      if (!searchTerm.trim()) return true
      const term = searchTerm.toLowerCase()
      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field]
          return String(val ?? '').toLowerCase().includes(term)
        })
      }
      // fallback search in all string properties
      return Object.values(item).some((v) =>
        typeof v === 'string' || typeof v === 'number'
          ? String(v).toLowerCase().includes(term)
          : false
      )
    })
  }, [data, searchTerm, selectedFilter, filterOptions, searchFields])

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal === bVal) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortKey, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc')
      else {
        setSortKey(null)
        setSortOrder('asc')
      }
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const toggleSelectAll = () => {
    if (selectedKeys.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedKeys(new Set())
    } else {
      const next = new Set<string | number>()
      paginatedData.forEach((row) => next.add(keyExtractor(row)))
      setSelectedKeys(next)
    }
  }

  const toggleSelectRow = (key: string | number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const hasSelected = selectedKeys.size > 0

  return (
    <div className="w-full flex flex-col">
      {/* Table Toolbar */}
      <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={searchPlaceholder}
              className="w-full text-xs pl-8.5 pr-7 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          {filterOptions && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">
                {filterOptions.label}:
              </span>
              <select
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="ALL">All ({data.length})</option>
                {filterOptions.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters shortcut */}
          {(searchTerm || selectedFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setSelectedFilter('ALL')
                setCurrentPage(1)
              }}
              className="text-xs text-teal-700 hover:text-teal-800 font-medium px-2 py-1 rounded-md hover:bg-teal-50 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Batch Action Bar if items selected */}
      {hasSelected && batchActions && (
        <div className="px-4 py-2 bg-teal-50/70 border-b border-teal-100 flex items-center justify-between text-xs text-teal-950 animate-in fade-in-50">
          <span className="font-semibold">
            {selectedKeys.size} item{selectedKeys.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            {batchActions.onPublish && (
              <button
                type="button"
                onClick={() => {
                  batchActions.onPublish?.(Array.from(selectedKeys))
                  setSelectedKeys(new Set())
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-teal-200 text-teal-800 hover:bg-teal-100/50 font-medium transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Publish
              </button>
            )}
            {batchActions.onDelete && (
              <button
                type="button"
                onClick={() => {
                  batchActions.onDelete?.(Array.from(selectedKeys))
                  setSelectedKeys(new Set())
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
            {batchActions.customActions}
            <button
              type="button"
              onClick={() => setSelectedKeys(new Set())}
              className="text-slate-400 hover:text-slate-600 ml-1"
              aria-label="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Table Element */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              {batchActions && (
                <th scope="col" className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      selectedKeys.size === paginatedData.length
                    }
                    onChange={toggleSelectAll}
                    aria-label="Select all rows on current page"
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                </th>
              )}
              {columns.map((col, idx) => {
                const isSortable = col.sortable && col.sortKey
                const isCurrentSort = sortKey === col.sortKey
                return (
                  <th
                    key={idx}
                    scope="col"
                    className={`px-4 py-3 ${col.className || ''}`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.sortKey!)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        {col.header}
                        <ArrowUpDown
                          className={`w-3 h-3 ${
                            isCurrentSort ? 'text-teal-600' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (batchActions ? 1 : 0)}
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{emptyMessage}</p>
                    <p className="text-xs text-slate-500 mt-1">{emptySubtext}</p>
                    {onEmptyAction && emptyActionLabel && (
                      <button
                        type="button"
                        onClick={onEmptyAction}
                        className="mt-4 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                      >
                        {emptyActionLabel}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const key = keyExtractor(row)
                const isSelected = selectedKeys.has(key)
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors hover:bg-slate-50/70 ${
                      isSelected ? 'bg-teal-50/30' : ''
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {batchActions && (
                      <td
                        className="w-10 px-4 py-3 text-center"
                        onClick={(e) => toggleSelectRow(key, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Select row ${key}`}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, idx) => {
                      let cellContent: React.ReactNode = null
                      if (typeof col.accessor === 'function') {
                        cellContent = col.accessor(row)
                      } else if (col.accessor) {
                        cellContent = row[col.accessor] as React.ReactNode
                      }
                      return (
                        <td
                          key={idx}
                          className={`px-4 py-3 text-xs text-slate-700 align-middle ${
                            col.className || ''
                          }`}
                        >
                          {cellContent}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{sortedData.length}</span>{' '}
          records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
