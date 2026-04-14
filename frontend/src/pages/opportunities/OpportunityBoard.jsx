import { useState, useEffect, useCallback } from 'react';
import { Search, Briefcase } from 'lucide-react';
import { opportunityService } from '../../services/opportunityService';
import { applicationService } from '../../services/applicationService';
import OpportunityCard from '../../components/cards/OpportunityCard';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Competition', 'Volunteering', 'Job'];

const OpportunityBoard = () => {
  const { currentUser, userProfile } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchOpportunities = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9, status: 'active' };
      if (category !== 'All') params.category = category.toLowerCase();
      const data = await opportunityService.getAll(params);
      let opps = data.opportunities;
      if (search) {
        opps = opps.filter((o) =>
          o.title.toLowerCase().includes(search.toLowerCase()) ||
          o.orgName?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setOpportunities(opps);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      console.error('Opportunity page error:', err);
      toast.error(`Failed to load opportunities: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [category, search, userProfile]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOpportunities(1), 300);
    return () => clearTimeout(timer);
  }, [fetchOpportunities]);

  useEffect(() => {
    if (currentUser?.uid && userProfile?.role === 'student') {
      applicationService.getByStudent(currentUser.uid)
        .then(apps => {
          setAppliedIds(new Set(apps.map(a => String(a.opportunityId).trim())));
        })
        .catch(console.error);
    }
  }, [currentUser, userProfile]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Opportunity <span className="text-gradient">Board</span></h1>
          <p>Internships, competitions, scholarships, and more — all in one place.</p>
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto 24px' }}>
          <div className="search-bar">
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="filter-group" style={{ justifyContent: 'center', marginBottom: '32px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
          {!loading && `${pagination.total} opportunit${pagination.total !== 1 ? 'ies' : 'y'} available`}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={60} />
            <h3>Opportunity Board Empty</h3>
            <p>New opportunities are currently being curated. Please check back later!</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {opportunities.map((o) => (
              <OpportunityCard 
                key={o.id} 
                opportunity={o} 
                isApplied={appliedIds.has(String(o.id).trim())}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => fetchOpportunities(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button key={i+1} className={pagination.page === i+1 ? 'active' : ''} onClick={() => fetchOpportunities(i+1)}>{i+1}</button>
            ))}
            <button onClick={() => fetchOpportunities(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>›</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityBoard;
