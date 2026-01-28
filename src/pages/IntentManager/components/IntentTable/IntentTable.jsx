import { Copy, Edit2, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from 'react'

const ITEMS_PER_PAGE = 10
const PAGE_WINDOW = 3

const IntentTable = ({
  intents,
  selectedIds,
  onToggleAll,
  onToggleOne,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [intents.length])

  const totalPages = Math.max(1, Math.ceil(intents.length / ITEMS_PER_PAGE))

  const paginatedIntents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return intents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [intents, currentPage])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 1)
    let end = start + PAGE_WINDOW - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - PAGE_WINDOW + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <div className="bg-white rounded-4 shadow d-flex flex-column h-100">

      {/* TABLE */}
      <div className="table-responsive flex-grow-1">
        <table className="table table-hover mb-0">
          <thead className="table-light sticky-top">
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={intents.length > 0 && selectedIds.length === intents.length}
                  onChange={onToggleAll}
                />
              </th>

              <th>Intent Name</th>
              <th>Display Name</th>

              <th className="col-category">Category</th>
              <th className="col-phrases">Phrases</th>
              <th className="col-responses">Responses</th>

              <th>Usage (30d)</th>
              <th className="col-confidence">Confidence</th>
              <th>Status</th>
              <th className="col-lastModified">Last Modified</th>

              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedIntents.map(intent => (
              <tr key={intent.id}>

                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.includes(intent.id)}
                    onChange={() => onToggleOne(intent.id)}
                  />
                </td>

                <td
                  className="text-primary fw-bold cursor-pointer"
                  onClick={() => onEdit(intent)}
                >
                  {intent.intent_name}
                </td>

                <td>{intent.name}</td>


                <td className="col-category">
                  <span className="badge badge-category">
                    {intent.category_name}
                  </span>
                </td>

                <td className="col-phrases">{intent.phrases}</td>
                <td className="col-responses">{intent.responses}</td>

                <td>{intent.usage}</td>
                <td className="col-confidence">{intent.confidence}%</td>

                <td>
                  <span
                    className={`badge ${intent.status === "ACTIVE"
                      ? "bg-success"
                      : "bg-danger"
                      }`}
                  >
                    {intent.status}
                  </span>

                </td>

                <td className="col-lastModified">
                  {new Date(intent.last_modified).toLocaleString()}
                </td>

                <td className="text-end">
                  <div className="d-flex gap-3 justify-content-end">
                    <Edit2
                      size={16}
                      className="cursorPointer"
                      onClick={() => onEdit(intent)}
                    />
                    <Copy
                      size={16}
                      className="cursorPointer"
                      onClick={() => onDuplicate?.(intent)}
                    />
                    <Trash2
                      size={16}
                      className="cursorPointer text-danger"
                      onClick={() => onDelete(intent)}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {intents.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-4 text-muted">
                  No intents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
          <small className="text-muted">
            Page {currentPage} of {totalPages}
          </small>

          <nav className="custom-pagination">
            <ul className="pagination pagination-sm mb-0 align-items-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link pill prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Prev
                </button>
              </li>

              {getPageNumbers().map(page => (
                <li
                  key={page}
                  className={`page-item ${currentPage === page ? 'active' : ''}`}
                >
                  <button
                    className="page-link pill"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link pill next"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}

export default IntentTable
