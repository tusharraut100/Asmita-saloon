import React, { useState, useEffect, useRef } from 'react';
import { 
  Scissors, 
  PlusCircle, 
  BarChart3, 
  Tag, 
  Clock, 
  User, 
  ShoppingBag, 
  Download, 
  Printer, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Edit3, 
  Send, 
  Percent, 
  Menu, 
  X,
  FileText,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const INITIAL_SERVICES = [
  { id: 's1', name: 'Signature Haircut', price: 250 },
  { id: 's2', name: 'Beard Grooming & Shape', price: 150 },
  { id: 's3', name: 'Hair Wash & Blow Dry', price: 180 },
  { id: 's4', name: 'Beard Trim & Razor Line', price: 100 },
  { id: 's5', name: 'Head Massage with Herbal Oil', price: 200 },
  { id: 's6', name: 'Charcoal Deep Cleanse Facial', price: 650 },
  { id: 's7', name: 'O3+ Bridal / Groom Glow Facial', price: 1500 },
  { id: 's8', name: 'D-Tan Pack (Face & Neck)', price: 350 },
  { id: 's9', name: 'Keratin Hair Spa Treatment', price: 1200 },
  { id: 's10', name: 'Anti-Dandruff Scalp Treatment', price: 850 },
  { id: 's11', name: 'Global Hair Color', price: 800 },
  { id: 's12', name: 'Beard Color & Touch-up', price: 300 },
  { id: 's13', name: 'Hair Highlights / Streaks', price: 1100 },
  { id: 's14', name: 'Face Scrub & Steam Pack', price: 400 },
  { id: 's15', name: 'Waxing / Threading (Eyebrows)', price: 80 }
];

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Matte Finish Hair Clay Wax', price: 350 },
  { id: 'p2', name: 'Pure Argan Beard Growth Oil', price: 420 },
  { id: 'p3', name: 'Tea Tree Anti-Dandruff Shampoo', price: 499 },
  { id: 'p4', name: 'Beard Softener Conditioner', price: 380 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('billing'); // 'billing' | 'reports' | 'services' | 'products'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [services, setServices] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('lux_services'));
    if (!saved || saved.length === 0) return INITIAL_SERVICES;
    const map = new Map();
    // Include all new initial services first
    INITIAL_SERVICES.forEach(s => map.set(s.name.toLowerCase().trim(), s));
    // Keep any custom user-added services
    saved.forEach(s => map.set(s.name.toLowerCase().trim(), s));
    return Array.from(map.values());
  });
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem('lux_products')) || INITIAL_PRODUCTS);
  const [visits, setVisits] = useState(() => JSON.parse(localStorage.getItem('lux_visits')) || []);

  // Accurate Local Today Date (YYYY-MM-DD)
  const getLocalTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalTodayDate();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [visitDate, setVisitDate] = useState(todayStr);
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
  const [editSrvModal, setEditSrvModal] = useState(null); // service object when editing
  const [editPrdModal, setEditPrdModal] = useState(null); // product object when editing

  // New catalog item forms
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');

  const [newPrdName, setNewPrdName] = useState('');
  const [newPrdPrice, setNewPrdPrice] = useState('');

  // Fetch initial data from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchCloudData = async () => {
      try {
        const { data: cloudVisits, error: vErr } = await supabase
          .from('salon_visits')
          .select('*')
          .order('created_at', { ascending: false });

        if (!vErr && cloudVisits && cloudVisits.length > 0) {
          const mappedVisits = cloudVisits.map(v => ({
            id: v.id,
            customerName: v.customer_name,
            customerPhone: v.customer_phone,
            date: v.date,
            time: v.time,
            services: v.services || [],
            products: v.products || [],
            servicesTotal: Number(v.services_total) || 0,
            productsTotal: Number(v.products_total) || 0,
            discount: Number(v.discount) || 0,
            grandTotal: Number(v.grand_total) || 0,
            paymentMethod: v.payment_method || 'Cash'
          }));
          setVisits(mappedVisits);
        }

        const { data: cloudServices } = await supabase.from('salon_services').select('*');
        if (cloudServices && cloudServices.length > 0) {
          // Merge to preserve existing services
          setServices(prev => {
            const map = new Map(prev.map(s => [s.id, s]));
            cloudServices.forEach(s => map.set(s.id, { id: s.id, name: s.name, price: Number(s.price) }));
            return Array.from(map.values());
          });
        }

        const { data: cloudProducts } = await supabase.from('salon_products').select('*');
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(prev => {
            const map = new Map(prev.map(p => [p.id, p]));
            cloudProducts.forEach(p => map.set(p.id, { id: p.id, name: p.name, price: Number(p.price) }));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.error('Supabase fetch error:', err);
      }
    };

    fetchCloudData();
  }, []);

  // Persistence to LocalStorage
  useEffect(() => {
    localStorage.setItem('lux_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('lux_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('lux_visits', JSON.stringify(visits));
  }, [visits]);

  const mainRef = useRef(null);

  // Automatically scroll to the top whenever activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Pricing calculations
  const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const productsTotal = Object.entries(selectedProducts).reduce((sum, [pid, qty]) => {
    const prod = products.find(p => p.id === pid);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);
  const grandTotal = Math.max(0, (servicesTotal + productsTotal) - (Number(discount) || 0));

  // Today Total in sidebar
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

  // Phone input handler (strict 10 digits only)
  const handlePhoneChange = (e) => {
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(cleanDigits);
  };

  // Date change handler strictly disallowing future date on all browsers / mobile pickers
  const handleDateChange = (e) => {
    const picked = e.target.value;
    const currentToday = getLocalTodayDate();
    if (picked && picked > currentToday) {
      alert(`⚠️ Future date not allowed! You cannot select ${picked}. Resetting to today (${currentToday}).`);
      setVisitDate(currentToday);
      return;
    }
    setVisitDate(picked);
  };

  // Save Customer Visit
  const handleSaveVisit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (customerPhone && customerPhone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    const currentToday = getLocalTodayDate();
    if (visitDate > currentToday) {
      alert(`Future dates are not allowed! Selected date (${visitDate}) cannot be after today (${currentToday}).`);
      setVisitDate(currentToday);
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

    // Sync to Supabase in background
    if (isSupabaseConfigured && supabase) {
      supabase.from('salon_visits').insert([{
        id: newVisit.id,
        customer_name: newVisit.customerName,
        customer_phone: newVisit.customerPhone,
        date: newVisit.date,
        time: newVisit.time,
        services: newVisit.services,
        products: newVisit.products,
        services_total: newVisit.servicesTotal,
        products_total: newVisit.productsTotal,
        discount: newVisit.discount,
        grand_total: newVisit.grandTotal,
        payment_method: newVisit.paymentMethod
      }]).then(({ error }) => {
        if (error) console.error('Error uploading to Supabase:', error);
      });
    }

    // Success Alert after adding customer
    alert(`✅ Customer Visit Successfully Added!\n\nCustomer: ${newVisit.customerName}\nTotal Bill: ₹${newVisit.grandTotal}\nPayment: ${newVisit.paymentMethod}`);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setSelectedServices([]);
    setSelectedProducts({});
    setDiscount(0);
    setActiveReceipt(newVisit);
  };

  // WhatsApp Invoice Send Helper
  const handleSendWhatsApp = (visit) => {
    if (!visit.customerPhone || visit.customerPhone === 'Walk-in' || visit.customerPhone.length !== 10) {
      alert('Customer does not have a valid 10-digit mobile number to send WhatsApp invoice.');
      return;
    }

    const srvLines = visit.services.map(s => `• ${s.name}: ₹${s.price}`).join('\n');
    const prdLines = visit.products.map(p => `• ${p.name} (x${p.qty}): ₹${p.lineTotal}`).join('\n');
    const itemsText = [srvLines, prdLines].filter(Boolean).join('\n');

    const message = 
`✨ *ASMITA FAMILY SALON INVOICE* ✨
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${visit.customerName}
📱 *Phone:* ${visit.customerPhone}
📅 *Date:* ${visit.date} ${visit.time}
🧾 *Invoice #:* ${visit.id}

💇 *Services & Products:*
${itemsText}
━━━━━━━━━━━━━━━━━━━━
💵 *Subtotal:* ₹${visit.servicesTotal + visit.productsTotal}
${visit.discount > 0 ? `🎁 *Discount Applied:* -₹${visit.discount}\n` : ''}💰 *Total Paid:* ₹${visit.grandTotal} (${visit.paymentMethod})
━━━━━━━━━━━━━━━━━━━━
Thank you for visiting *Asmita Family Salon*! Have a wonderful day ahead! ✂️`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${visit.customerPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Update Service in Catalog
  const handleUpdateService = () => {
    if (!editSrvModal.name.trim() || !editSrvModal.price) {
      alert('Please provide valid name and price');
      return;
    }
    const updated = services.map(s => s.id === editSrvModal.id ? editSrvModal : s);
    setServices(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('salon_services').upsert([{
        id: editSrvModal.id,
        name: editSrvModal.name,
        price: Number(editSrvModal.price),
        category: 'Salon'
      }]).then();
    }
    setEditSrvModal(null);
    alert('✅ Service updated successfully!');
  };

  // Update Retail Product in Catalog
  const handleUpdateProduct = () => {
    if (!editPrdModal.name.trim() || !editPrdModal.price) {
      alert('Please provide valid name and price');
      return;
    }
    const updated = products.map(p => p.id === editPrdModal.id ? editPrdModal : p);
    setProducts(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('salon_products').upsert([{
        id: editPrdModal.id,
        name: editPrdModal.name,
        price: Number(editPrdModal.price),
        category: 'Retail'
      }]).then();
    }
    setEditPrdModal(null);
    alert('✅ Product updated successfully!');
  };

  // Add New Service Without Overwriting Existing Services
  const handleAddNewService = () => {
    if (!newSrvName.trim() || !newSrvPrice) {
      alert('Please enter service name and price');
      return;
    }

    const newServiceObj = {
      id: 's_' + Date.now(),
      name: newSrvName.trim(),
      price: Number(newSrvPrice)
    };

    // Prepend to current services array so existing services are NOT removed
    setServices(prev => [newServiceObj, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('salon_services').insert([{
        id: newServiceObj.id,
        name: newServiceObj.name,
        price: newServiceObj.price,
        category: 'Salon'
      }]).then(({ error }) => {
        if (error) console.error('Error saving new service to Supabase:', error);
      });
    }

    setNewSrvName('');
    setNewSrvPrice('');
    setNewSrvModal(false);
    alert(`✅ New service "${newServiceObj.name}" added successfully!`);
  };

  // Add New Product Without Overwriting Existing Products
  const handleAddNewProduct = () => {
    if (!newPrdName.trim() || !newPrdPrice) {
      alert('Please enter product name and price');
      return;
    }

    const newProductObj = {
      id: 'p_' + Date.now(),
      name: newPrdName.trim(),
      price: Number(newPrdPrice)
    };

    setProducts(prev => [newProductObj, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('salon_products').insert([{
        id: newProductObj.id,
        name: newProductObj.name,
        price: newProductObj.price,
        category: 'Retail'
      }]).then(({ error }) => {
        if (error) console.error('Error saving new product to Supabase:', error);
      });
    }

    setNewPrdName('');
    setNewPrdPrice('');
    setNewPrdModal(false);
    alert(`✅ New product "${newProductObj.name}" added successfully!`);
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
      const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      dateMatch = vDate === yStr;
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
  const metricDiscountTotal = filteredVisits.reduce((acc, v) => acc + (v.discount || 0), 0);
  const metricServicesCount = filteredVisits.reduce((acc, v) => acc + (v.services?.length || 0), 0);
  const metricProductsCount = filteredVisits.reduce((acc, v) => acc + (v.products?.reduce((s, p) => s + p.qty, 0) || 0), 0);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredVisits.length === 0) return alert('No records to export');
    let csv = "Invoice,Date,Time,Customer,Phone,Services,Products,Payment,Discount,Total\n";
    filteredVisits.forEach(v => {
      const srvs = v.services.map(s => s.name).join(' | ');
      const prds = v.products.map(p => `${p.name} (x${p.qty})`).join(' | ');
      csv += `"${v.id}","${v.date}","${v.time}","${v.customerName}","${v.customerPhone}","${srvs}","${prds}","${v.paymentMethod}","${v.discount}","${v.grandTotal}"\n`;
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

  return (
    <div className="app-container">
      {/* Mobile Top Navigation Header */}
      <div className="mobile-header">
        <div className="brand-section" style={{ padding: 0, margin: 0, border: 'none' }}>
          <div className="brand-logo" style={{ width: '38px', height: '38px', overflow: 'hidden', padding: 0 }}>
            <img src="/logo.jpg" alt="Asmita Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="brand-title">
            <h2 style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>ASMITA FAMILY SALON</h2>
          </div>
        </div>
        <button 
          className="btn-counter" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="brand-section">
          <div className="brand-logo" style={{ width: '48px', height: '48px', overflow: 'hidden', padding: 0 }}>
            <img src="/logo.jpg" alt="Asmita Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="brand-title">
            <h2>ASMITA</h2>
            <span>Family Salon</span>
          </div>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false); }}
          >
            <PlusCircle size={18} />
            <span>New Entry</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
          >
            <FileText size={18} />
            <span>Report</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
          >
            <Scissors size={18} />
            <span>Salon Services</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
          >
            <ShoppingBag size={18} />
            <span>Retail Products</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="daily-summary-widget">
            <div className="widget-label">Today's Revenue</div>
            <div className="widget-amount">₹{todayRevenue.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper" ref={mainRef}>
        <header className="header-bar">
          <div className="page-info">
            <h1>
              {activeTab === 'billing' && 'Daily Customer Billing'}
              {activeTab === 'reports' && 'Salon Sales & Customer Reports'}
              {activeTab === 'services' && 'Manage Salon Services'}
              {activeTab === 'products' && 'Manage Retail Products'}
            </h1>
            <p>
              {activeTab === 'billing' && 'Select services, add retail products, and create instant customer bills.'}
              {activeTab === 'reports' && 'Filter and view your daily, monthly, or custom customer visits and revenue reports.'}
              {activeTab === 'services' && 'Add new salon services or edit existing prices.'}
              {activeTab === 'products' && 'Add new retail grooming products or update their pricing.'}
            </p>
          </div>
          <div className="header-tools">
            {activeTab !== 'billing' && (
              <button 
                className="btn btn-sm btn-gold" 
                onClick={() => setActiveTab('billing')}
                title="Go to New Entry"
                style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Home size={16} />
                <span>Home</span>
              </button>
            )}
            <div className="badge-date">
              <Clock size={16} />
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
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
                    <label>Mobile Number (10 Digits)</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="tel" 
                        placeholder="9876543210" 
                        maxLength={10}
                        value={customerPhone}
                        onChange={handlePhoneChange}
                        style={{ width: '100%' }}
                      />
                      {customerPhone && (
                        <span style={{ 
                          position: 'absolute', 
                          right: '10px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          fontSize: '0.72rem', 
                          color: customerPhone.length === 10 ? '#34d399' : '#f87171' 
                        }}>
                          {customerPhone.length}/10
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="input-field">
                    <label>Visit Date (Max: Today)</label>
                    <input 
                      type="date" 
                      max={todayStr}
                      value={visitDate}
                      onChange={handleDateChange}
                    />
                  </div>
                </div>
              </div>

              {/* Services Selector Card (Without Category) */}
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
                        <div className="service-card-top">
                          <span className="srv-name">{srv.name}</span>
                          <div className={`service-check-box ${isSelected ? 'checked' : ''}`}>
                            {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                          </div>
                        </div>
                        <div className="srv-bottom-bar">
                          <span className="srv-price-pill">₹{srv.price}</span>
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
                          <div className="p-sub">₹{p.price}</div>
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
                        <div key={s.id} className="cart-item-card">
                          <div className="cart-item-left">
                            <span className="type-tag" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold)' }}>Service</span>
                            <span className="cart-item-name">{s.name}</span>
                          </div>
                          <div className="cart-item-right">
                            <span className="cart-qty-badge">Qty: 1</span>
                            <strong className="cart-price">₹{s.price}</strong>
                          </div>
                        </div>
                      ))}
                      {Object.entries(selectedProducts).map(([pid, qty]) => {
                        const prod = products.find(p => p.id === pid);
                        if (!prod) return null;
                        return (
                          <div key={pid} className="cart-item-card">
                            <div className="cart-item-left">
                              <span className="type-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>Retail</span>
                              <span className="cart-item-name">{prod.name}</span>
                            </div>
                            <div className="cart-item-right">
                              <span className="cart-qty-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}>Qty: {qty}</span>
                              <strong className="cart-price">₹{prod.price * qty}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                <div className="divider" style={{ margin: '16px 0', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}></div>

                <div className="summary-rows">
                  <div className="sum-row">
                    <span>Services Total:</span>
                    <span>₹{servicesTotal}</span>
                  </div>
                  <div className="sum-row">
                    <span>Products Total:</span>
                    <span>₹{productsTotal}</span>
                  </div>
                  <div className="sum-row" style={{ color: Number(discount) > 0 ? '#f87171' : 'inherit' }}>
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

                {/* Payment Option (Cash & UPI) */}
                <div className="pay-options" style={{ gridTemplateColumns: '1fr 1fr' }}>
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
                    <QrCode size={16} /> UPI / Online
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

        {/* TAB 2: REPORTS (Renamed from Filter & Analytics) */}
        {activeTab === 'reports' && (
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

              {/* Custom Date Range (Max Date = Today) */}
              <div className="custom-date-container">
                <input 
                  type="date" 
                  max={todayStr}
                  value={customStart} 
                  onChange={(e) => {
                    if (e.target.value > todayStr) {
                      alert('Future start date not allowed');
                      setCustomStart(todayStr);
                    } else {
                      setCustomStart(e.target.value);
                      setFilterRange('custom');
                    }
                  }} 
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>to</span>
                <input 
                  type="date" 
                  max={todayStr}
                  value={customEnd} 
                  onChange={(e) => {
                    if (e.target.value > todayStr) {
                      alert('Future end date not allowed');
                      setCustomEnd(todayStr);
                    } else {
                      setCustomEnd(e.target.value);
                      setFilterRange('custom');
                    }
                  }} 
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
                <div className="kpi-ico purple"><Percent size={22} /></div>
                <div className="kpi-text">
                  <span>Discounts Given</span>
                  <h3>₹{metricDiscountTotal.toLocaleString('en-IN')}</h3>
                  <small>Total savings provided</small>
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
              <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(10,12,16,0.6)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', minWidth: '240px' }}>
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
                      <th>Discount</th>
                      <th>Total</th>
                      <th>Actions</th>
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
                            {v.discount > 0 ? (
                              <span style={{ color: '#f87171', fontWeight: 600 }}>-₹{v.discount}</span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)' }}>₹0</span>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: 'var(--gold)' }}>₹{v.grandTotal}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{v.paymentMethod}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                className="btn btn-sm btn-ghost" 
                                onClick={() => setActiveReceipt(v)}
                                title="View Receipt"
                              >
                                View
                              </button>
                              <button 
                                className="btn btn-sm" 
                                style={{ background: '#25D366', color: '#fff', padding: '6px 8px' }}
                                onClick={() => handleSendWhatsApp(v)}
                                title="Send WhatsApp Receipt"
                              >
                                <Send size={13} /> WhatsApp
                              </button>
                            </div>
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

        {/* TAB 3: SEPARATE SALON SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Scissors size={20} /> Salon Services ({services.length})
              </div>
              <button className="btn btn-sm btn-gold" onClick={() => setNewSrvModal(true)}>
                <Plus size={14} /> Add Service
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {services.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,12,16,0.5)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '1rem' }}>{s.name}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--gold)', marginRight: '6px', fontSize: '1.05rem' }}>₹{s.price}</span>
                    <button 
                      className="btn-counter" 
                      title="Edit / Update Service"
                      onClick={() => setEditSrvModal({ ...s })}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      className="btn-counter" 
                      title="Delete Service"
                      onClick={() => {
                        if (confirm(`Delete service "${s.name}"?`)) {
                          setServices(services.filter(item => item.id !== s.id));
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SEPARATE RETAIL PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                <ShoppingBag size={20} /> Retail Products ({products.length})
              </div>
              <button className="btn btn-sm btn-gold" onClick={() => setNewPrdModal(true)}>
                <Plus size={14} /> Add Product
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,12,16,0.5)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ fontSize: '1rem' }}>{p.name}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--emerald)', marginRight: '6px', fontSize: '1.05rem' }}>₹{p.price}</span>
                    <button 
                      className="btn-counter" 
                      title="Edit / Update Product"
                      onClick={() => setEditPrdModal({ ...p })}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      className="btn-counter" 
                      title="Delete Product"
                      onClick={() => {
                        if (confirm(`Delete product "${p.name}"?`)) {
                          setProducts(products.filter(item => item.id !== p.id));
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* RECEIPT MODAL WITH WHATSAPP ACTION & DISCOUNT DISPLAY */}
      {activeReceipt && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-header">
              <h3>Customer Invoice</h3>
              <button className="btn-counter" onClick={() => setActiveReceipt(null)}>✕</button>
            </div>
            
            <div className="receipt-slip" id="printable-receipt">
              <h2>ASMITA FAMILY SALON</h2>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{activeReceipt.servicesTotal + activeReceipt.productsTotal}</span>
                </div>
                {activeReceipt.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c', fontWeight: 600 }}>
                    <span>Discount Applied:</span>
                    <span>-₹{activeReceipt.discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #ccc' }}>
                  <span>Total Paid:</span>
                  <span>₹{activeReceipt.grandTotal}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-sm" 
                style={{ background: '#25D366', color: '#fff', flex: '1' }}
                onClick={() => handleSendWhatsApp(activeReceipt)}
              >
                <Send size={15} /> WhatsApp Receipt
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-sm btn-ghost" onClick={() => window.print()}>
                  <Printer size={15} /> Print
                </button>
                <button className="btn btn-sm btn-gold" onClick={() => setActiveReceipt(null)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE / EDIT SERVICE MODAL (No Category) */}
      {editSrvModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-header">
              <h3>Update Service</h3>
              <button className="btn-counter" onClick={() => setEditSrvModal(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '16px 0' }}>
              <div className="input-field">
                <label>Service Name</label>
                <input 
                  type="text" 
                  value={editSrvModal.name} 
                  onChange={(e) => setEditSrvModal({ ...editSrvModal, name: e.target.value })} 
                />
              </div>
              <div className="input-field">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  value={editSrvModal.price} 
                  onChange={(e) => setEditSrvModal({ ...editSrvModal, price: Number(e.target.value) })} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-ghost" onClick={() => setEditSrvModal(null)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleUpdateService}>Update Service</button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE / EDIT RETAIL PRODUCT MODAL */}
      {editPrdModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-header">
              <h3>Update Retail Product</h3>
              <button className="btn-counter" onClick={() => setEditPrdModal(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '16px 0' }}>
              <div className="input-field">
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={editPrdModal.name} 
                  onChange={(e) => setEditPrdModal({ ...editPrdModal, name: e.target.value })} 
                />
              </div>
              <div className="input-field">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  value={editPrdModal.price} 
                  onChange={(e) => setEditPrdModal({ ...editPrdModal, price: Number(e.target.value) })} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-ghost" onClick={() => setEditPrdModal(null)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleUpdateProduct}>Update Product</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL (No Category) */}
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
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-gold" onClick={handleAddNewService}>Save Service</button>
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
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-gold" onClick={handleAddNewProduct}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
