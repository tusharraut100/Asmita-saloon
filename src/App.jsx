import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  PlusCircle, 
  BarChart3, 
  Tag, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  ShoppingBag, 
  Download, 
  Printer, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Sparkles,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_SERVICES = [
  { id: 's1', name: 'Signature Haircut', category: 'Hair', price: 250 },
  { id: 's2', name: 'Beard Grooming & Shape', category: 'Beard', price: 150 },
  { id: 's3', name: 'Hair Wash & Conditioning', category: 'Hair', price: 180 },
  { id: 's4', name: 'Deep Cleanse Charcoal Facial', category: 'Facial', price: 650 },
  { id: 's5', name: 'Head Massage with Herbal Oil', category: 'Therapy', price: 200 },
  { id: 's6', name: 'Hair Color & Highlights', category: 'Color', price: 800 },
  { id: 's7', name: 'Keratin Hair Spa Treatment', category: 'Therapy', price: 1200 }
];

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Matte Finish Hair Clay Wax', price: 350, category: 'Styling' },
  { id: 'p2', name: 'Pure Argan Beard Growth Oil', price: 420, category: 'Beard Care' },
  { id: 'p3', name: 'Tea Tree Anti-Dandruff Shampoo', price: 499, category: 'Hair Care' },
  { id: 'p4', name: 'Beard Softener Conditioner', price: 380, category: 'Beard Care' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('billing'); // 'billing' | 'analytics' | 'catalog'
  const [services, setServices] = useState(() => JSON.parse(localStorage.getItem('lux_services')) || INITIAL_SERVICES);
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem('lux_products')) || INITIAL_PRODUCTS);
  const [visits, setVisits] = useState(() => JSON.parse(localStorage.getItem('lux_visits')) || []);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Filter State
  const [filterRange, setFilterRange] = useState('today'); // 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [newSrvModal, setNewSrvModal] = useState(false);
  const [newPrdModal, setNewPrdModal] = useState(false);

  // New catalog item forms
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvCat, setNewSrvCat] = useState('Hair');

  const [newPrdName, setNewPrdName] = useState('');
  const [newPrdPrice, setNewPrdPrice] = useState('');
  const [newPrdCat, setNewPrdCat] = useState('Retail');

  // Persistence
  useEffect(() => {
    localStorage.setItem('lux_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('lux_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('lux_visits', JSON.stringify(visits));
  }, [visits]);

  // Pricing calculations
  const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const productsTotal = Object.entries(selectedProducts).reduce((sum, [pid, qty]) => {
    const prod = products.find(p => p.id === pid);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);
  const grandTotal = Math.max(0, (servicesTotal + productsTotal) - (Number(discount) || 0));

  // Today Total in sidebar
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = visits
    .filter(v => v.date === todayStr)
    .reduce((sum, v) => sum + v.grandTotal, 0);

  // Toggle Service
  const toggleService = (srv) => {
    if (selectedServices.some(s => s.id === srv.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  // Adjust Product Qty
  const adjustProductQty = (pid, delta) => {
    const current = selectedProducts[pid] || 0;
    const next = current + delta;
    if (next <= 0) {
      const copy = { ...selectedProducts };
      delete copy[pid];
      setSelectedProducts(copy);
    } else {
      setSelectedProducts({ ...selectedProducts, [pid]: next });
    }
  };

  // Save Customer Visit
  const handleSaveVisit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (selectedServices.length === 0 && Object.keys(selectedProducts).length === 0) {
      alert('Please select at least 1 service or 1 product');
      return;
    }

    const recordedProducts = Object.entries(selectedProducts).map(([pid, qty]) => {
      const p = products.find(item => item.id === pid);
      return { id: pid, name: p?.name, price: p?.price, qty, lineTotal: (p?.price || 0) * qty };
    });

    const newVisit = {
      id: 'INV-' + Date.now().toString().slice(-6),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || 'Walk-in',
      date: visitDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      services: [...selectedServices],
      products: recordedProducts,
      servicesTotal,
      productsTotal,
      discount: Number(discount) || 0,
      grandTotal,
      paymentMethod
    };

    setVisits([newVisit, ...visits]);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setSelectedServices([]);
    setSelectedProducts({});
    setDiscount(0);
    setActiveReceipt(newVisit);
  };

  // Filtering Visits
  const filteredVisits = visits.filter(v => {
    const now = new Date();
    const vDate = v.date;

    let dateMatch = true;
    if (filterRange === 'today') {
      dateMatch = vDate === todayStr;
    } else if (filterRange === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      dateMatch = vDate === y.toISOString().split('T')[0];
    } else if (filterRange === 'week') {
      const w = new Date();
      w.setDate(w.getDate() - 7);
      dateMatch = new Date(vDate) >= w && new Date(vDate) <= now;
    } else if (filterRange === 'month') {
      const d = new Date(vDate);
      dateMatch = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    } else if (filterRange === 'custom') {
      if (customStart && customEnd) {
        dateMatch = vDate >= customStart && vDate <= customEnd;
      }
    }

    if (!dateMatch) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return v.customerName.toLowerCase().includes(q) || v.customerPhone.includes(q);
    }
    return true;
  });

  // Analytics Metrics
  const metricRevenue = filteredVisits.reduce((acc, v) => acc + v.grandTotal, 0);
  const metricServicesRev = filteredVisits.reduce((acc, v) => acc + v.servicesTotal, 0);
  const metricProductsRev = filteredVisits.reduce((acc, v) => acc + v.productsTotal, 0);
  const metricServicesCount = filteredVisits.reduce((acc, v) => acc + (v.services?.length || 0), 0);
  const metricProductsCount = filteredVisits.reduce((acc, v) => acc + (v.products?.reduce((s, p) => s + p.qty, 0) || 0), 0);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredVisits.length === 0) return alert('No records to export');
    let csv = "Invoice,Date,Time,Customer,Phone,Services,Products,Payment,Total\n";
    filteredVisits.forEach(v => {
      const srvs = v.services.map(s => s.name).join(' | ');
      const prds = v.products.map(p => `${p.name} (x${p.qty})`).join(' | ');
      csv += `"${v.id}","${v.date}","${v.time}","${v.customerName}","${v.customerPhone}","${srvs}","${prds}","${v.paymentMethod}","${v.grandTotal}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `salon_report_${filterRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Seed sample records
  const handleSeedDemo = () => {
    const yDate = new Date();
    yDate.setDate(yDate.getDate() - 1);
    const yStr = yDate.toISOString().split('T')[0];

    const demo = [
      {
        id: 'INV-1092',
        customerName: 'Rohit Sharma',
        customerPhone: '9812345670',
        date: todayStr,
        time: '10:30 AM',
        services: [{ id: 's1', name: 'Signature Haircut', price: 250 }],
        products: [{ id: 'p1', name: 'Matte Finish Hair Clay Wax', price: 350, qty: 1, lineTotal: 350 }],
        servicesTotal: 250,
        productsTotal: 350,
        discount: 50,
        grandTotal: 550,
        paymentMethod: 'UPI'
      },
      {
        id: 'INV-1093',
        customerName: 'Karan Mehra',
        customerPhone: '9928374650',
        date: todayStr,
        time: '11:45 AM',
        services: [{ id: 's4', name: 'Deep Cleanse Charcoal Facial', price: 650 }, { id: 's2', name: 'Beard Grooming & Shape', price: 150 }],
        products: [],
        servicesTotal: 800,
        productsTotal: 0,
        discount: 0,
        grandTotal: 800,
        paymentMethod: 'Cash'
      },
      {
        id: 'INV-1088',
        customerName: 'Anil Kapoor',
        customerPhone: '9845012345',
        date: yStr,
        time: '04:15 PM',
        services: [{ id: 's7', name: 'Keratin Hair Spa Treatment', price: 1200 }],
        products: [{ id: 'p2', name: 'Pure Argan Beard Growth Oil', price: 420, qty: 1, lineTotal: 420 }],
        servicesTotal: 1200,
        productsTotal: 420,
        discount: 100,
        grandTotal: 1520,
        paymentMethod: 'Card'
      }
    ];

    setVisits([...demo, ...visits]);
    alert('Demo data loaded successfully!');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">
            <Scissors size={22} />
          </div>
          <div className="brand-title">
            <h2>LUXECUT</h2>
            <span>Salon & Grooming</span>
          </div>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            <PlusCircle size={18} />
            <span>New Daily Entry</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            <span>Filter & Analytics</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Tag size={18} />
            <span>Services & Products</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="daily-summary-widget">
            <div className="widget-label">Today's Revenue</div>
            <div className="widget-amount">₹{todayRevenue.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <main className="main-wrapper">
        <header className="header-bar">
          <div className="page-info">
            <h1>
              {activeTab === 'billing' && 'Daily Customer Billing & POS'}
              {activeTab === 'analytics' && 'Customer History & Date Filters'}
              {activeTab === 'catalog' && 'Salon Services & Product Catalog'}
            </h1>
            <p>
              {activeTab === 'billing' && 'Select services done, retail products purchased, and create instant bills.'}
              {activeTab === 'analytics' && 'Inspect your salon sales with daily, monthly, or custom range filters.'}
              {activeTab === 'catalog' && 'Manage your salon services and retail inventory pricing.'}
            </p>
          </div>
          <div className="header-tools">
            <div className="badge-date">
              <Clock size={16} />
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            <button className="btn btn-outline-gold btn-sm" onClick={handleSeedDemo}>
              <Sparkles size={14} /> Load Demo
            </button>
          </div>
        </header>

        {/* TAB 1: BILLING / NEW ENTRY */}
        {activeTab === 'billing' && (
          <div className="billing-layout">
            <div className="billing-form">
              {/* Customer Info Card */}
              <div className="glass-panel">
                <div className="panel-title">
                  <User size={18} /> 1. Customer Details
                </div>
                <div className="form-grid-2" style={{ marginTop: '14px' }}>
                  <div className="input-field">
                    <label>Customer Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="input-field">
                    <label>Mobile Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                  <div className="input-field">
                    <label>Visit Date</label>
                    <input 
                      type="date" 
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Services Selector Card */}
              <div className="glass-panel" style={{ marginTop: '20px' }}>
                <div className="panel-header">
                  <div className="panel-title">
                    <Scissors size={18} /> 2. Services Done
                  </div>
                  <span className="badge-pill">{selectedServices.length} Selected</span>
                </div>
                <div className="service-selector-grid">
                  {services.map(srv => {
                    const isSelected = selectedServices.some(s => s.id === srv.id);
                    return (
                      <div 
                        key={srv.id} 
                        className={`service-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleService(srv)}
                      >
                        {isSelected && <Check size={16} className="selected-check" />}
                        <div className="srv-name">{srv.name}</div>
                        <div className="srv-meta">
                          <span className="srv-cat">{srv.category}</span>
                          <span className="srv-price">₹{srv.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Retail Products Card */}
              <div className="glass-panel" style={{ marginTop: '20px' }}>
                <div className="panel-header">
                  <div className="panel-title">
                    <ShoppingBag size={18} /> 3. Retail Products Purchased
                  </div>
                  <span className="badge-pill">
                    {Object.values(selectedProducts).reduce((a, b) => a + b, 0)} Items
                  </span>
                </div>
                <div className="product-picker-list">
                  {products.map(p => {
                    const qty = selectedProducts[p.id] || 0;
                    return (
                      <div key={p.id} className="product-row">
                        <div className="p-details">
                          <div className="p-name">{p.name}</div>
                          <div className="p-sub">₹{p.price} • {p.category}</div>
                        </div>
                        <div className="qty-controls">
                          <button 
                            className="btn-counter" 
                            onClick={() => adjustProductQty(p.id, -1)}
                            disabled={qty === 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-val">{qty}</span>
                          <button 
                            className="btn-counter" 
                            onClick={() => adjustProductQty(p.id, 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Cart Sidebar */}
            <div className="billing-summary-panel">
              <div className="glass-panel" style={{ position: 'sticky', top: '24px' }}>
                <div className="panel-header">
                  <h3>Order Summary</h3>
                  <span className="badge-pill">Active Bill</span>
                </div>

                <div className="cart-items">
                  {selectedServices.length === 0 && Object.keys(selectedProducts).length === 0 ? (
                    <div className="cart-empty">Click services or products to begin bill</div>
                  ) : (
                    <>
                      {selectedServices.map(s => (
                        <div key={s.id} className="cart-row">
                          <div><span className="type-tag">Service</span>{s.name}</div>
                          <strong>₹{s.price}</strong>
                        </div>
                      ))}
                      {Object.entries(selectedProducts).map(([pid, qty]) => {
                        const prod = products.find(p => p.id === pid);
                        if (!prod) return null;
                        return (
                          <div key={pid} className="cart-row">
                            <div><span className="type-tag">Retail</span>{prod.name} × {qty}</div>
                            <strong>₹{prod.price * qty}</strong>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                <div className="divider"></div>

                <div className="summary-rows">
                  <div className="sum-row">
                    <span>Services Total:</span>
                    <span>₹{servicesTotal}</span>
                  </div>
                  <div className="sum-row">
                    <span>Products Total:</span>
                    <span>₹{productsTotal}</span>
                  </div>
                  <div className="sum-row">
                    <span>Discount (₹):</span>
                    <input 
                      type="number" 
                      min="0"
                      value={discount} 
                      onChange={(e) => setDiscount(e.target.value)}
                      style={{ width: '80px', padding: '4px 8px', textAlign: 'right' }}
                    />
                  </div>
                  <div className="sum-row grand">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Payment Option */}
                <div className="pay-options">
                  <button 
                    type="button" 
                    className={`pay-btn ${paymentMethod === 'Cash' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Cash')}
                  >
                    <Banknote size={16} /> Cash
                  </button>
                  <button 
                    type="button" 
                    className={`pay-btn ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <QrCode size={16} /> UPI
                  </button>
                  <button 
                    type="button" 
                    className={`pay-btn ${paymentMethod === 'Card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Card')}
                  >
                    <CreditCard size={16} /> Card
                  </button>
                </div>

                <button 
                  className="btn btn-gold btn-block" 
                  onClick={handleSaveVisit}
                  style={{ padding: '14px', fontSize: '1rem' }}
                >
                  <Check size={18} /> Save Customer Visit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & FILTERING */}
        {activeTab === 'analytics' && (
          <div>
            {/* Filter Bar */}
            <div className="glass-panel filter-bar-wrap">
              <div className="filter-pills">
                <button className={`pill-btn ${filterRange === 'today' ? 'active' : ''}`} onClick={() => setFilterRange('today')}>Today</button>
                <button className={`pill-btn ${filterRange === 'yesterday' ? 'active' : ''}`} onClick={() => setFilterRange('yesterday')}>Yesterday</button>
                <button className={`pill-btn ${filterRange === 'week' ? 'active' : ''}`} onClick={() => setFilterRange('week')}>This Week</button>
                <button className={`pill-btn ${filterRange === 'month' ? 'active' : ''}`} onClick={() => setFilterRange('month')}>This Month</button>
                <button className={`pill-btn ${filterRange === 'all' ? 'active' : ''}`} onClick={() => setFilterRange('all')}>All Time</button>
              </div>

              {/* Custom Date Range */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={(e) => { setCustomStart(e.target.value); setFilterRange('custom'); }} 
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>to</span>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={(e) => { setCustomEnd(e.target.value); setFilterRange('custom'); }} 
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                />
              </div>

              {/* Export Tools */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-sm btn-ghost" onClick={handleExportCSV}>
                  <Download size={15} /> Export CSV
                </button>
                <button className="btn btn-sm btn-outline-gold" onClick={() => window.print()}>
                  <Printer size={15} /> Print
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-row">
              <div className="kpi-box">
                <div className="kpi-ico gold">₹</div>
                <div className="kpi-text">
                  <span>Total Revenue</span>
                  <h3>₹{metricRevenue.toLocaleString('en-IN')}</h3>
                  <small>Filtered Range</small>
                </div>
              </div>

              <div className="kpi-box">
                <div className="kpi-ico blue"><User size={22} /></div>
                <div className="kpi-text">
                  <span>Customers Served</span>
                  <h3>{filteredVisits.length}</h3>
                  <small>Total Visits</small>
                </div>
              </div>

              <div className="kpi-box">
                <div className="kpi-ico purple"><Scissors size={22} /></div>
                <div className="kpi-text">
                  <span>Services Sales</span>
                  <h3>₹{metricServicesRev.toLocaleString('en-IN')}</h3>
                  <small>{metricServicesCount} services done</small>
                </div>
              </div>

              <div className="kpi-box">
                <div className="kpi-ico emerald"><ShoppingBag size={22} /></div>
                <div className="kpi-text">
                  <span>Product Sales</span>
                  <h3>₹{metricProductsRev.toLocaleString('en-IN')}</h3>
                  <small>{metricProductsCount} retail items</small>
                </div>
              </div>
            </div>

            {/* Customer Records Table */}
            <div className="glass-panel">
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(10,12,16,0.6)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
                  <Search size={16} color="var(--text-dim)" />
                  <input 
                    type="text" 
                    placeholder="Search customer name or phone..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: 'transparent', border: 'none', padding: '0', width: '100%', color: '#fff' }}
                  />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing {filteredVisits.length} Records
                </div>
              </div>

              <div className="table-wrap">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Customer Details</th>
                      <th>Services</th>
                      <th>Products</th>
                      <th>Payment</th>
                      <th>Total</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisits.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                          No customer entries found for this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredVisits.map(v => (
                        <tr key={v.id}>
                          <td>
                            <strong>{v.date}</strong><br />
                            <small style={{ color: 'var(--text-dim)' }}>{v.time}</small>
                          </td>
                          <td>
                            <strong>{v.customerName}</strong><br />
                            <small style={{ color: 'var(--text-dim)' }}>{v.customerPhone}</small>
                          </td>
                          <td>
                            {v.services.length > 0 ? v.services.map(s => (
                              <span key={s.id} className="badge-tag-srv">{s.name}</span>
                            )) : <span style={{ color: 'var(--text-dim)' }}>None</span>}
                          </td>
                          <td>
                            {v.products.length > 0 ? v.products.map(p => (
                              <span key={p.id} className="badge-tag-prd">{p.name} ×{p.qty}</span>
                            )) : <span style={{ color: 'var(--text-dim)' }}>None</span>}
                          </td>
                          <td>
                            <span className={`badge-pay ${v.paymentMethod}`}>{v.paymentMethod}</span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--gold)' }}>₹{v.grandTotal}</strong>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-ghost" 
                              onClick={() => setActiveReceipt(v)}
                              title="View Invoice"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES & PRODUCTS CATALOG */}
        {activeTab === 'catalog' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Services List */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Scissors size={18} /> Salon Services
                </div>
                <button className="btn btn-sm btn-gold" onClick={() => setNewSrvModal(true)}>
                  <Plus size={14} /> Add Service
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {services.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,12,16,0.5)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Category: {s.category}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--gold)' }}>₹{s.price}</span>
                      <button 
                        className="btn-counter" 
                        onClick={() => setServices(services.filter(item => item.id !== s.id))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products List */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <ShoppingBag size={18} /> Retail Products
                </div>
                <button className="btn btn-sm btn-gold" onClick={() => setNewPrdModal(true)}>
                  <Plus size={14} /> Add Product
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {products.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,12,16,0.5)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div>
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{p.category}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>₹{p.price}</span>
                      <button 
                        className="btn-counter" 
                        onClick={() => setProducts(products.filter(item => item.id !== p.id))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RECEIPT MODAL */}
      {activeReceipt && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-header">
              <h3>Customer Invoice</h3>
              <button className="btn-counter" onClick={() => setActiveReceipt(null)}>✕</button>
            </div>
            
            <div className="receipt-slip" id="printable-receipt">
              <h2>LUXECUT SALON</h2>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666' }}>Invoice #{activeReceipt.id}</p>
              <div className="divider" style={{ background: '#ddd' }}></div>
              <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                <div><strong>Customer:</strong> {activeReceipt.customerName}</div>
                <div><strong>Phone:</strong> {activeReceipt.customerPhone}</div>
                <div><strong>Date:</strong> {activeReceipt.date} {activeReceipt.time}</div>
                <div><strong>Payment:</strong> {activeReceipt.paymentMethod}</div>
              </div>
              <div className="divider" style={{ background: '#ddd' }}></div>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeReceipt.services.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{s.name}</span>
                    <span>₹{s.price}</span>
                  </div>
                ))}
                {activeReceipt.products.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{p.name} (x{p.qty})</span>
                    <span>₹{p.lineTotal}</span>
                  </div>
                ))}
              </div>
              <div className="divider" style={{ background: '#ddd' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
                <span>Total Amount:</span>
                <span>₹{activeReceipt.grandTotal}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-ghost" onClick={() => window.print()}>
                <Printer size={15} /> Print
              </button>
              <button className="btn btn-gold" onClick={() => setActiveReceipt(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {newSrvModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-header">
              <h3>Add New Service</h3>
              <button className="btn-counter" onClick={() => setNewSrvModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '16px 0' }}>
              <div className="input-field">
                <label>Service Name</label>
                <input type="text" placeholder="e.g. Hair Spa" value={newSrvName} onChange={(e) => setNewSrvName(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Price (₹)</label>
                <input type="number" placeholder="500" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Category</label>
                <select value={newSrvCat} onChange={(e) => setNewSrvCat(e.target.value)}>
                  <option value="Hair">Hair</option>
                  <option value="Beard">Beard</option>
                  <option value="Facial">Facial</option>
                  <option value="Therapy">Therapy</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-gold" onClick={() => {
                if (!newSrvName || !newSrvPrice) return alert('Enter name and price');
                setServices([...services, { id: 's_' + Date.now(), name: newSrvName, price: Number(newSrvPrice), category: newSrvCat }]);
                setNewSrvName('');
                setNewSrvPrice('');
                setNewSrvModal(false);
              }}>Save Service</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {newPrdModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-header">
              <h3>Add Retail Product</h3>
              <button className="btn-counter" onClick={() => setNewPrdModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '16px 0' }}>
              <div className="input-field">
                <label>Product Name</label>
                <input type="text" placeholder="e.g. Hair Clay" value={newPrdName} onChange={(e) => setNewPrdName(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Price (₹)</label>
                <input type="number" placeholder="350" value={newPrdPrice} onChange={(e) => setNewPrdPrice(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Category</label>
                <input type="text" placeholder="Styling / Care" value={newPrdCat} onChange={(e) => setNewPrdCat(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-gold" onClick={() => {
                if (!newPrdName || !newPrdPrice) return alert('Enter name and price');
                setProducts([...products, { id: 'p_' + Date.now(), name: newPrdName, price: Number(newPrdPrice), category: newPrdCat }]);
                setNewPrdName('');
                setNewPrdPrice('');
                setNewPrdModal(false);
              }}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
