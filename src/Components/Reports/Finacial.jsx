import React, { useMemo, useState } from 'react';
import { FiFilter, FiChevronDown, FiSearch, FiCalendar, FiDownload } from 'react-icons/fi';
import './Finacial.css';
import { reportAPI } from '../../services/api';

const projects = ['All Projects','Website Revamp','Mobile App','API Backend'];
const rows = [
  { id: 'tr-1', date: '2025-11-01', project: 'Website Revamp', type: 'Invoice', desc: 'Milestone 2 Payment', amount: 3200 },
  { id: 'tr-2', date: '2025-11-03', project: 'API Backend', type: 'Expense', desc: 'Server costs', amount: -240 },
  { id: 'tr-3', date: '2025-11-07', project: 'Mobile App', type: 'Invoice', desc: 'Sprint 3', amount: 1800 },
  { id: 'tr-4', date: '2025-11-08', project: 'Website Revamp', type: 'Expense', desc: 'Stock assets', amount: -60 },
  { id: 'tr-5', date: '2025-11-10', project: 'Website Revamp', type: 'Invoice', desc: 'Maintenance', amount: 900 },
];

const monthBars = [
  { m: 'Jun', rev: 4200, exp: 1200 },
  { m: 'Jul', rev: 3800, exp: 1350 },
  { m: 'Aug', rev: 5100, exp: 1600 },
  { m: 'Sep', rev: 4700, exp: 1550 },
  { m: 'Oct', rev: 5300, exp: 1700 },
  { m: 'Nov', rev: 5900, exp: 1900 },
];

export default function Finacial() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await reportAPI.getFinancial();
        setReportData(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  const [q, setQ] = useState('');
  const [proj, setProj] = useState('All Projects');
  const [range, setRange] = useState({ from: '', to: '' });

  const filtered = useMemo(() => rows.filter(r => {
    if (q && !`${r.desc} ${r.project} ${r.type}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (proj !== 'All Projects' && r.project !== proj) return false;
    if (range.from && r.date < range.from) return false;
    if (range.to && r.date > range.to) return false;
    return true;
  }), [q, proj, range]);

  const revenue = filtered.filter(r=>r.amount>0).reduce((s,r)=>s+r.amount,0);
  const expenses = Math.abs(filtered.filter(r=>r.amount<0).reduce((s,r)=>s+r.amount,0));
  const profit = revenue - expenses;
  const outstanding = 2200; // mock

  return (
    <div className="fin-container">
      <div className="fin-header">
        <div>
          <h2>Financial Reports</h2>
          <p>Overview of revenues, expenses, profit and cash flow by projects.</p>
        </div>
        <div className="actions">
          <button className="btn-outline"><FiDownload/> Export CSV</button>
        </div>
      </div>

      <div className="filters">
        <div className="search">
          <FiSearch className="icon" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search transactions..." />
        </div>
        <div className="select">
          <FiFilter className="icon" />
          <select value={proj} onChange={e=>setProj(e.target.value)}>
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <FiChevronDown className="chev" />
        </div>
        <div className="daterange">
          <FiCalendar className="icon"/>
          <input type="date" value={range.from} onChange={e=>setRange(r=>({...r, from:e.target.value}))}/>
          <span>to</span>
          <input type="date" value={range.to} onChange={e=>setRange(r=>({...r, to:e.target.value}))}/>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi">
          <div className="label">Revenue</div>
          <div className="value green">${revenue.toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="label">Expenses</div>
          <div className="value red">-${expenses.toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="label">Profit</div>
          <div className={`value ${profit>=0?'green':'red'}`}>${profit.toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="label">Outstanding</div>
          <div className="value purple">${outstanding.toLocaleString()}</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-head">Revenue vs Expenses (Last 6 months)</div>
        <div className="bar-chart">
          {monthBars.map(b => (
            <div key={b.m} className="bar-col">
              <div className="bar rev" style={{height:`${(b.rev/6000)*180}px`}} title={`$${b.rev}`}></div>
              <div className="bar exp" style={{height:`${(b.exp/6000)*180}px`}} title={`$${b.exp}`}></div>
              <div className="bar-label">{b.m}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="table">
        <div className="thead">
          <div>Date</div>
          <div>Project</div>
          <div>Type</div>
          <div>Description</div>
          <div className="right">Amount</div>
        </div>
        <div className="tbody">
          {filtered.map(r => (
            <div className="row" key={r.id}>
              <div>{r.date}</div>
              <div>{r.project}</div>
              <div>{r.type}</div>
              <div className="truncate" title={r.desc}>{r.desc}</div>
              <div className={`right mono ${r.amount<0?'neg':'pos'}`}>{r.amount<0?'-':''}${Math.abs(r.amount).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

