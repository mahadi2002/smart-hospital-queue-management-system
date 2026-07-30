import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import Card from '../../components/ui/Card'
import AddAdminModal from '../../components/admin/AddAdminModal'
import api from '../../services/api'
import { normalizeAdmin } from '../../services/normalize'
import { useAuth } from '../../context/AuthContext'
import { showConfirm, showError, showToast } from '../../utils/toast'

export default function Admins() {
  const { session } = useAuth()
  const [admins, setAdmins] = useState([])
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')

  const refetch = useCallback(async () => {
    const { data } = await api.get('/admins')
    setAdmins(data.map(normalizeAdmin))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return admins
    return admins.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.department?.toLowerCase().includes(q),
    )
  }, [admins, search])

  async function handleAdd(data) {
    try {
      await api.post('/admins', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        role: data.role,
      })
      await refetch()
      setAddOpen(false)
      showToast('Admin added.')
    } catch (err) {
      showError('Could not add admin', err.response?.data?.detail || 'Something went wrong.')
    }
  }

  async function handleRemove(admin) {
    if (admin.id === session.profileId) {
      showError('Cannot remove', 'You cannot remove your own account.')
      return
    }
    const confirmed = await showConfirm({
      title: `Remove ${admin.name}?`,
      text: 'This will remove their admin access.',
      confirmText: 'Remove',
    })
    if (!confirmed) return
    try {
      await api.delete(`/admins/${admin.id}`)
      await refetch()
      showToast('Admin removed.', 'info')
    } catch (err) {
      showError('Could not remove admin', err.response?.data?.detail || 'Something went wrong.')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="h4 fw-bold m-0">Admins</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="me-1" />
          Add Admin
        </button>
      </div>

      <div className="mb-3" style={{ maxWidth: 320 }}>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <Search size={14} />
          </span>
          <input
            className="form-control"
            placeholder="Search by name, email, or department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <p className="text-shq-secondary small mb-3">
        {filtered.length} of {admins.length} admins
      </p>

      <Card className="p-0">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="fw-semibold">
                    {a.name}
                    {a.id === session.profileId && <span className="badge bg-secondary-subtle text-secondary ms-2">You</span>}
                  </td>
                  <td className="text-shq-secondary small">{a.email}</td>
                  <td>{a.department || '—'}</td>
                  <td>
                    <span className="badge bg-success-subtle text-success-emphasis">{a.role}</span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemove(a)}
                      disabled={a.id === session.profileId}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddAdminModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  )
}
