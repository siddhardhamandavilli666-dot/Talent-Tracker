import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Users } from 'lucide-react';
import { userService } from '../../services/userService';
import TalentCard from '../../components/cards/TalentCard';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Sports', 'Music', 'Design', 'Leadership', 'Volunteering', 'Technical', 'Academic'];

const TalentDiscovery = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ skill: '', college: '', location: '', category: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.skill = search;
      if (filters.college) params.college = filters.college;
      if (filters.location) params.location = filters.location;

      const data = await userService.searchStudents(params);
      setStudents([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Discover page error:', err);
      toast.error(`Failed to load students: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(1), 400);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Discover <span className="text-gradient">Talent</span></h1>
          <p>Find exceptional students across sports, music, tech, design, and more.</p>
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto 32px' }}>
          <div className="search-bar">
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              placeholder="Search by skill, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <input
            className="form-input" placeholder="College..."
            value={filters.college} onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            style={{ maxWidth: 200 }}
          />
          <input
            className="form-input" placeholder="Location..."
            value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            style={{ maxWidth: 200 }}
          />
        </div>

        <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
          {!loading && `${pagination.total} student${pagination.total !== 1 ? 's' : ''} found`}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" />
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <Users size={60} />
            <h3>No students found</h3>
            <p>Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {students.map((s) => <TalentCard key={s.uid} student={s} />)}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => fetchStudents(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button key={i+1} className={pagination.page === i+1 ? 'active' : ''} onClick={() => fetchStudents(i+1)}>
                {i+1}
              </button>
            ))}
            <button onClick={() => fetchStudents(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>›</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentDiscovery;
