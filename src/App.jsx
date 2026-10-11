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
  Home,
  Users,
  MapPin,
  Lock,
  LogOut,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck
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

const INITIAL_EMPLOYEES = [
  {
    id: 'emp1',
    name: 'Suresh Kumar',
    phone: '9876543211',
    role: 'Senior Stylist & Hair Specialist',
    aadhaarNumber: 'XXXX-XXXX-4589',
    address: 'Shop 4, Market Complex, Main Road',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp2',
    name: 'Pooja Verma',
    phone: '9876543212',
    role: 'Skin & Facial Expert',
    aadhaarNumber: 'XXXX-XXXX-8921',
    address: 'Near City Park, Sector 5',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('billing'); // 'billing' | 'reports' | 'services' | 'products' | 'employees'
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
  const [employees, setEmployees] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('lux_employees'));
    return (saved && saved.length > 0) ? saved : INITIAL_EMPLOYEES;
  });
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

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('lux_auth') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('lux_admin_pwd') || 'admin123';
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Forgot Password Modal State
  const [forgotModal, setForgotModal] = useState(false);
  const [resetSecurityCode, setResetSecurityCode] = useState('');
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('lux_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid credentials! Check your username and password.');
    }
  };

  // Handle Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    // Master Salon recovery PIN / security verification
    if (resetSecurityCode.trim() !== '7788' && resetSecurityCode.trim().toLowerCase() !== 'asmita') {
      setForgotError('Invalid Security PIN! Enter the salon master security key (Default: 7788 or ASMITA)');
      return;
    }

    if (!newPasswordVal || newPasswordVal.length < 4) {
      setForgotError('New password must be at least 4 characters long.');
      return;
    }

    if (newPasswordVal !== confirmPasswordVal) {
      setForgotError('Passwords do not match! Please re-type correctly.');
      return;
    }

    setAdminPassword(newPasswordVal);
    localStorage.setItem('lux_admin_pwd', newPasswordVal);
    setForgotSuccess('✅ Password successfully updated! You can now log in.');
    setLoginPassword(newPasswordVal);

    setTimeout(() => {
      setForgotModal(false);
      setForgotSuccess('');
      setResetSecurityCode('');
      setNewPasswordVal('');
      setConfirmPasswordVal('');
    }, 1500);
  };

  // Handle Logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      setIsAuthenticated(false);
      localStorage.removeItem('lux_auth');
    }
  };

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [visitDate, setVisitDate] = useState(todayStr);
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidAmountInput, setPaidAmountInput] = useState(''); // Custom paid amount if partial/pending

  // Search inside Dropdown states for Services & Products
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [serviceDropdownSearch, setServiceDropdownSearch] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [productDropdownSearch, setProductDropdownSearch] = useState('');

  // Filter State
  const [filterRange, setFilterRange] = useState('today'); // 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [staffFilter, setStaffFilter] = useState('all'); // Filter visits by staff

  // Modals
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [newSrvModal, setNewSrvModal] = useState(false);
  const [newPrdModal, setNewPrdModal] = useState(false);
  const [editSrvModal, setEditSrvModal] = useState(null); // service object when editing
  const [editPrdModal, setEditPrdModal] = useState(null); // product object when editing
  const [newEmpModal, setNewEmpModal] = useState(false);
  const [editEmpModal, setEditEmpModal] = useState(null); // employee object when editing
  const [viewEmpModal, setViewEmpModal] = useState(null); // employee details preview

  // New catalog item forms
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');

  // Quick Add Service from Billing
  const [quickSrvName, setQuickSrvName] = useState('');
  const [quickSrvPrice, setQuickSrvPrice] = useState('');

  const [newPrdName, setNewPrdName] = useState('');
  const [newPrdPrice, setNewPrdPrice] = useState('');

  // New employee form state
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Senior Stylist');
  const [newEmpAadhaar, setNewEmpAadhaar] = useState('');
  const [newEmpAddress, setNewEmpAddress] = useState('');
  const [newEmpPhoto, setNewEmpPhoto] = useState('');


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
          const mappedVisits = cloudVisits.map(v => {
            const gTotal = Number(v.grand_total) || 0;
            const pAmount = v.paid_amount !== undefined && v.paid_amount !== null ? Number(v.paid_amount) : gTotal;
            const pendAmount = v.pending_amount !== undefined && v.pending_amount !== null ? Number(v.pending_amount) : Math.max(0, gTotal - pAmount);
            return {
              id: v.id,
              customerName: v.customer_name || 'Walk-in Customer',
              customerPhone: v.customer_phone || '',
              date: v.date,
              time: v.time || '',
              services: v.services || [],
              products: v.products || [],
              servicesTotal: Number(v.services_total) || 0,
              productsTotal: Number(v.products_total) || 0,
              discount: Number(v.discount) || 0,
              grandTotal: gTotal,
              paidAmount: pAmount,
              pendingAmount: pendAmount,
              paymentMethod: v.payment_method || 'Cash',
              employeeName: v.employee_name || ''
            };
          });

          // Merge cloud visits with any locally cached visits so no visits are ever lost
          setVisits(prev => {
            const visitMap = new Map();
            // Start with locally stored visits
            prev.forEach(item => visitMap.set(item.id, item));
            // Layer and update with cloud visits
            mappedVisits.forEach(item => visitMap.set(item.id, item));
            return Array.from(visitMap.values()).sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
          });
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

        const { data: cloudEmployees } = await supabase.from('salon_employees').select('*');
        if (cloudEmployees && cloudEmployees.length > 0) {
          setEmployees(prev => {
            const map = new Map(prev.map(e => [e.id, e]));
            cloudEmployees.forEach(e => map.set(e.id, {
              id: e.id,
              name: e.name,
              phone: e.phone || '',
              role: e.role || 'Senior Stylist',
              aadhaarNumber: e.aadhaar_number || '',
              address: e.address || '',
              photoUrl: e.photo_url || ''
            }));
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
    localStorage.setItem('lux_employees', JSON.stringify(employees));
  }, [employees]);

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

  // Paid and Pending calculations
  // If paidAmountInput is empty string, default paid amount is grandTotal
  const effectivePaidAmount = paidAmountInput === '' ? grandTotal : Math.max(0, Number(paidAmountInput) || 0);
  const pendingAmount = Math.max(0, grandTotal - effectivePaidAmount);

  // Today Total in sidebar
  const todayRevenue = visits
    .filter(v => v.date === todayStr)
    .reduce((sum, v) => sum + (v.paidAmount !== undefined ? v.paidAmount : v.grandTotal), 0);

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
      employeeName: assignedEmployee.trim(),
      services: [...selectedServices],
      products: recordedProducts,
      servicesTotal,
      productsTotal,
      discount: Number(discount) || 0,
      grandTotal,
      paidAmount: effectivePaidAmount,
      pendingAmount: pendingAmount,
      paymentMethod
    };

    setVisits([newVisit, ...visits]);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

    // Sync to Supabase in background
    if (isSupabaseConfigured && supabase) {
      const fullPayload = {
        id: newVisit.id,
        customer_name: newVisit.customerName,
        customer_phone: newVisit.customerPhone,
        date: newVisit.date,
        time: newVisit.time,
        employee_name: newVisit.employeeName,
        services: newVisit.services,
        products: newVisit.products,
        services_total: newVisit.servicesTotal,
        products_total: newVisit.productsTotal,
        discount: newVisit.discount,
        grand_total: newVisit.grandTotal,
        payment_method: newVisit.paymentMethod,
        paid_amount: newVisit.paidAmount,
        pending_amount: newVisit.pendingAmount
      };

      supabase.from('salon_visits').insert([fullPayload]).then(({ error }) => {
        if (error) {
          console.warn('Full Supabase insert error, falling back to base columns:', error.message);
          // Fallback to base columns if new schema columns have not yet been migrated in Supabase SQL editor
          const basePayload = {
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
          };
          supabase.from('salon_visits').insert([basePayload]).then(({ error: fallbackErr }) => {
            if (fallbackErr) {
              console.error('Fallback Supabase insert error:', fallbackErr);
            } else {
              console.log('Saved entry to Supabase using base columns.');
            }
          });
        }
      });
    }

    // Success Alert after adding customer
    alert(`✅ Customer Visit Successfully Added!\n\nCustomer: ${newVisit.customerName}\nStylist/Staff: ${newVisit.employeeName || 'Unassigned'}\nTotal Bill: ₹${newVisit.grandTotal}\nPaid Amount: ₹${newVisit.paidAmount}\nPending Amount: ₹${newVisit.pendingAmount}\nPayment Method: ${newVisit.paymentMethod}`);

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setAssignedEmployee('');
    setSelectedServices([]);
    setSelectedProducts({});
    setDiscount('');
    setPaidAmountInput('');
    setIsServiceDropdownOpen(false);
    setIsProductDropdownOpen(false);
    setActiveReceipt(newVisit);

    // Scroll back to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
${visit.employeeName ? `✂️ *Stylist / Served By:* ${visit.employeeName}\n` : ''}💇 *Services & Products:*
${itemsText}
━━━━━━━━━━━━━━━━━━━━
💵 *Subtotal:* ₹${visit.servicesTotal + visit.productsTotal}
${visit.discount > 0 ? `🎁 *Discount Applied:* -₹${visit.discount}\n` : ''}💰 *Grand Total:* ₹${visit.grandTotal}
💳 *Paid Amount:* ₹${visit.paidAmount !== undefined ? visit.paidAmount : visit.grandTotal} (${visit.paymentMethod})
${(visit.pendingAmount > 0) ? `⚠️ *Pending Account Balance:* ₹${visit.pendingAmount}\n` : ''}━━━━━━━━━━━━━━━━━━━━
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

  // Add New Staff with photo, aadhaar, address
  const handleAddNewEmployee = () => {
    if (!newEmpName.trim()) {
      alert('Please enter staff name');
      return;
    }
    if (newEmpPhone && newEmpPhone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number for staff');
      return;
    }

    const newEmpObj = {
      id: 'emp_' + Date.now(),
      name: newEmpName.trim(),
      phone: newEmpPhone.trim(),
      role: newEmpRole.trim() || 'Stylist',
      aadhaarNumber: newEmpAadhaar.trim(),
      address: newEmpAddress.trim(),
      photoUrl: newEmpPhoto.trim()
    };

    setEmployees(prev => [newEmpObj, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('salon_employees').insert([{
        id: newEmpObj.id,
        name: newEmpObj.name,
        phone: newEmpObj.phone,
        role: newEmpObj.role,
        aadhaar_number: newEmpObj.aadhaarNumber,
        address: newEmpObj.address,
        photo_url: newEmpObj.photoUrl
      }]).then(({ error }) => {
        if (error) console.error('Error saving staff to Supabase:', error);
      });
    }

    setNewEmpName('');
    setNewEmpPhone('');
    setNewEmpRole('Senior Stylist');
    setNewEmpAadhaar('');
    setNewEmpAddress('');
    setNewEmpPhoto('');
    setNewEmpModal(false);
    alert(`✅ Staff member "${newEmpObj.name}" added successfully!`);
  };

  // Update Staff Details
  const handleUpdateEmployee = () => {
    if (!editEmpModal.name || !editEmpModal.name.trim()) {
      alert('Please enter staff name');
      return;
    }
    if (editEmpModal.phone && editEmpModal.phone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number for staff');
      return;
    }

    const updatedEmpObj = {
      ...editEmpModal,
      name: editEmpModal.name.trim(),
      phone: (editEmpModal.phone || '').trim(),
      aadhaarNumber: (editEmpModal.aadhaarNumber || '').trim(),
      address: (editEmpModal.address || '').trim(),
      photoUrl: (editEmpModal.photoUrl || '').trim()
    };

    setEmployees(prev => prev.map(e => e.id === updatedEmpObj.id ? updatedEmpObj : e));

    if (isSupabaseConfigured && supabase) {
      supabase.from('salon_employees').upsert([{
        id: updatedEmpObj.id,
        name: updatedEmpObj.name,
        phone: updatedEmpObj.phone,
        role: updatedEmpObj.role || 'Stylist',
        aadhaar_number: updatedEmpObj.aadhaarNumber,
        address: updatedEmpObj.address,
        photo_url: updatedEmpObj.photoUrl
      }]).then(({ error }) => {
        if (error) console.error('Error updating staff in Supabase:', error);
      });
    }

    setEditEmpModal(null);
    alert(`✅ Staff member "${updatedEmpObj.name}" updated successfully!`);
  };

  // Delete Staff
  const handleDeleteEmployee = (empId, empName) => {
    if (confirm(`Are you sure you want to delete staff member "${empName}"?`)) {
      setEmployees(prev => prev.filter(e => e.id !== empId));
      if (isSupabaseConfigured && supabase) {
        supabase.from('salon_employees').delete().eq('id', empId).then();
      }
      if (assignedEmployee === empName) {
        setAssignedEmployee('');
      }
      alert(`🗑️ Staff member "${empName}" deleted.`);
    }
  };

  // Clear Remaining Due for a Visit and update receipt
  const handleClearDue = (visit) => {
    const updatedVisit = {
      ...visit,
      paidAmount: visit.grandTotal,
      pendingAmount: 0
    };

    const updatedVisits = visits.map(v => v.id === visit.id ? updatedVisit : v);
    setVisits(updatedVisits);
    localStorage.setItem('lux_visits', JSON.stringify(updatedVisits));

    if (isSupabaseConfigured && supabase) {
      supabase.from('salon_visits')
        .update({
          paid_amount: visit.grandTotal,
          pending_amount: 0
        })
        .eq('id', visit.id)
        .then(({ error }) => {
          if (error) console.error('Error clearing due in Supabase:', error);
        });
    }

    // Immediately open receipt showing all amount is paid
    setActiveReceipt(updatedVisit);
  };

  // Robust Date Normalizer to 'YYYY-MM-DD'
  const normalizeDateStr = (dateVal) => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      return dateVal;
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal).split('T')[0] || '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Filtering Visits for Reports
  const filteredVisits = visits.filter(v => {
    const vDate = normalizeDateStr(v.date);
    const today = todayStr;

    let dateMatch = true;
    if (filterRange === 'today') {
      dateMatch = vDate === today;
    } else if (filterRange === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      dateMatch = vDate === yStr;
    } else if (filterRange === 'week') {
      const w = new Date();
      w.setDate(w.getDate() - 7);
      const wStr = `${w.getFullYear()}-${String(w.getMonth() + 1).padStart(2, '0')}-${String(w.getDate()).padStart(2, '0')}`;
      dateMatch = vDate >= wStr && vDate <= today;
    } else if (filterRange === 'month') {
      const d = new Date();
      const currentMonthPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      dateMatch = vDate.startsWith(currentMonthPrefix);
    } else if (filterRange === 'custom') {
      if (customStart && customEnd) {
        dateMatch = vDate >= customStart && vDate <= customEnd;
      } else if (customStart) {
        dateMatch = vDate >= customStart;
      } else if (customEnd) {
        dateMatch = vDate <= customEnd;
      }
    } else if (filterRange === 'all') {
      dateMatch = true;
    }

    if (!dateMatch) return false;

    // Staff Filter
    if (staffFilter && staffFilter !== 'all') {
      if ((v.employeeName || '').trim() !== staffFilter.trim()) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (v.customerName && v.customerName.toLowerCase().includes(q)) || 
        (v.customerPhone && v.customerPhone.includes(q)) ||
        (v.employeeName && v.employeeName.toLowerCase().includes(q)) ||
        (v.id && v.id.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Analytics Metrics
  const metricRevenue = filteredVisits.reduce((acc, v) => acc + (Number(v.grandTotal) || 0), 0);
  const metricPaidRevenue = filteredVisits.reduce((acc, v) => acc + (v.paidAmount !== undefined ? Number(v.paidAmount) || 0 : Number(v.grandTotal) || 0), 0);
  const metricPendingTotal = filteredVisits.reduce((acc, v) => acc + (Number(v.pendingAmount) || 0), 0);
  const metricServicesRev = filteredVisits.reduce((acc, v) => acc + (Number(v.servicesTotal) || 0), 0);
  const metricProductsRev = filteredVisits.reduce((acc, v) => acc + (Number(v.productsTotal) || 0), 0);
  const metricDiscountTotal = filteredVisits.reduce((acc, v) => acc + (Number(v.discount) || 0), 0);
  const metricServicesCount = filteredVisits.reduce((acc, v) => acc + (v.services?.length || 0), 0);
  const metricProductsCount = filteredVisits.reduce((acc, v) => acc + (v.products?.reduce((s, p) => s + (Number(p.qty) || 1), 0) || 0), 0);

  // Staff Work Report Aggregation
  // Calculate performance metrics for all staff members based on the active date filter
  const staffWorkReport = employees.map(emp => {
    // We match by employee name (case-insensitive & trimmed)
    const empVisits = filteredVisits.filter(v => 
      (v.employeeName || '').trim().toLowerCase() === emp.name.trim().toLowerCase()
    );
    const totalCustomers = empVisits.length;
    const totalRevenue = empVisits.reduce((sum, v) => sum + (Number(v.grandTotal) || 0), 0);
    const totalPaid = empVisits.reduce((sum, v) => sum + (v.paidAmount !== undefined ? Number(v.paidAmount) || 0 : Number(v.grandTotal) || 0), 0);
    const totalPending = empVisits.reduce((sum, v) => sum + (Number(v.pendingAmount) || 0), 0);
    const totalServicesCount = empVisits.reduce((sum, v) => sum + (v.services?.length || 0), 0);
    const totalProductsCount = empVisits.reduce((sum, v) => sum + (v.products?.reduce((s, p) => s + (Number(p.qty) || 1), 0) || 0), 0);

    return {
      id: emp.id,
      name: emp.name,
      role: emp.role || 'Staff',
      phone: emp.phone,
      totalCustomers,
      totalRevenue,
      totalPaid,
      totalPending,
      totalServicesCount,
      totalProductsCount,
      avgTicket: totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredVisits.length === 0) return alert('No records to export');
    let csv = "Invoice,Date,Time,Customer,Phone,Stylist_Staff,Services,Products,Payment,Discount,Total,Paid_Amount,Pending_Amount\n";
    filteredVisits.forEach(v => {
      const srvs = v.services.map(s => s.name).join(' | ');
      const prds = v.products.map(p => `${p.name} (x${p.qty})`).join(' | ');
      const paid = v.paidAmount !== undefined ? v.paidAmount : v.grandTotal;
      const pending = v.pendingAmount || 0;
      csv += `"${v.id}","${v.date}","${v.time}","${v.customerName}","${v.customerPhone}","${v.employeeName || 'Unassigned'}","${srvs}","${prds}","${v.paymentMethod}","${v.discount}","${v.grandTotal}","${paid}","${pending}"\n`;
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

  // If not authenticated, show professional Login Screen
  if (!isAuthenticated) {
    return (
      <div className="login-screen-wrapper">
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div 
              style={{ 
                width: '68px', 
                height: '68px', 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, var(--gold), #99751e)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 8px 25px var(--gold-glow)',
                marginBottom: '14px',
                overflow: 'hidden'
              }}
            >
              <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', letterSpacing: '1px' }}>
              ASMITA FAMILY SALON
            </h2>
            <p style={{ color: 'var(--gold)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px' }}>
              Management Portal
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {authError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', textAlign: 'center' }}>
                {authError}
              </div>
            )}

            <div className="input-field">
              <label>Username / Login ID</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Enter username (e.g. admin)" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
              </div>
            </div>

            <div className="input-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-gold" 
              style={{ marginTop: '8px', padding: '12px', fontSize: '0.96rem', width: '100%' }}
            >
              <ShieldCheck size={18} /> Sign In & Access Dashboard
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
              🔒 Protected Staff & Admin Portal • Default: <code>admin</code> / <code>admin123</code>
            </div>
          </form>

          {/* FORGOT / RESET PASSWORD MODAL */}
          {forgotModal && (
            <div className="modal-backdrop">
              <div className="modal-card" style={{ maxWidth: '420px', textAlign: 'left' }}>
                <div className="panel-header">
                  <h3>Reset Admin Password</h3>
                  <button className="btn-counter" onClick={() => setForgotModal(false)}>✕</button>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Verify your Salon Security Recovery PIN to set a new password.
                </p>

                {forgotError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '12px' }}>
                    {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '12px' }}>
                    {forgotSuccess}
                  </div>
                )}

                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="input-field">
                    <label>Master Security PIN / Key *</label>
                    <input 
                      type="text" 
                      placeholder="Enter Master PIN (Default: 7788 or ASMITA)"
                      value={resetSecurityCode}
                      onChange={(e) => setResetSecurityCode(e.target.value)}
                      required
                    />
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Default salon recovery key is <strong>7788</strong> or <strong>ASMITA</strong></small>
                  </div>

                  <div className="input-field">
                    <label>New Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        placeholder="Enter new password (min 4 chars)"
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        required
                        style={{ width: '100%', paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="input-field">
                    <label>Confirm New Password *</label>
                    <input 
                      type="password" 
                      placeholder="Re-enter new password"
                      value={confirmPasswordVal}
                      onChange={(e) => setConfirmPasswordVal(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setForgotModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gold">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-counter" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            style={{ width: '36px', height: '36px' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop for sidebar drawer */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

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
          <button 
            className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => { setActiveTab('employees'); setMobileMenuOpen(false); }}
          >
            <Users size={18} />
            <span>Staff ({employees.length})</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button 
            className="btn btn-sm btn-ghost" 
            onClick={handleLogout}
            title="Sign Out / Lock App"
            style={{ width: '100%', justifyContent: 'center', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '9px 12px', gap: '6px', fontSize: '0.82rem', borderRadius: '8px' }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
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
              {activeTab === 'employees' && 'Staff Management'}
            </h1>
            <p>
              {activeTab === 'billing' && 'Select services, assign working staff/stylist, and create instant bills.'}
              {activeTab === 'reports' && 'Filter and view your daily, monthly, or custom customer visits and revenue reports.'}
              {activeTab === 'services' && 'Add new salon services or edit existing prices.'}
              {activeTab === 'products' && 'Add new retail grooming products or update their pricing.'}
              {activeTab === 'employees' && 'Manage salon staff, contact details, and service assignments.'}
            </p>
          </div>
          <div className="header-tools">
            {activeTab !== 'billing' && (
              <button 
                className="btn btn-sm btn-gold" 
                onClick={() => setActiveTab('billing')}
                title="Back to Home / New Entry"
                aria-label="Home"
                style={{ width: '38px', height: '38px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Home size={18} />
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
                <div className="form-grid-2" style={{ marginTop: '16px' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ margin: 0 }}>Mobile Number (10 Digits)</label>
                      {customerPhone && (
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 600,
                          color: customerPhone.length === 10 ? '#34d399' : '#f87171' 
                        }}>
                          {customerPhone.length}/10 {customerPhone.length === 10 ? '✓' : ''}
                        </span>
                      )}
                    </div>
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210" 
                      maxLength={10}
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      style={{ width: '100%' }}
                    />
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
                  <div className="input-field">
                    <label>Assigned Stylist / Staff</label>
                    <select 
                      value={assignedEmployee}
                      onChange={(e) => setAssignedEmployee(e.target.value)}
                    >
                      <option value="">-- Choose Working Staff --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Services Selector Card - Clean dropdown with search inside */}
              <div 
                className="glass-panel" 
                style={{ 
                  marginTop: '20px', 
                  position: 'relative', 
                  zIndex: isServiceDropdownOpen ? 99 : 5,
                  overflow: 'visible' 
                }}
              >
                <div className="panel-header">
                  <div className="panel-title">
                    <Scissors size={18} /> 2. Services Done
                  </div>
                  <span className="badge-pill">{selectedServices.length} Selected</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Searchable Dropdown Component for Services */}
                  <div className="dropdown-search-wrapper" style={{ position: 'relative', zIndex: 100 }}>
                    <div 
                      className="dropdown-trigger-box"
                      onClick={() => {
                        setIsServiceDropdownOpen(prev => !prev);
                        setIsProductDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'rgba(10, 12, 16, 0.85)',
                        border: isServiceDropdownOpen ? '1px solid var(--gold)' : '1px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#fff',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <span style={{ color: selectedServices.length > 0 ? '#fff' : 'var(--text-dim)', fontSize: '0.92rem' }}>
                        Select Services
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gold)', transform: isServiceDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                        ▼
                      </span>
                    </div>

                    {/* Dropdown Menu with Search Inside */}
                    {isServiceDropdownOpen && (
                      <div 
                        className="dropdown-menu-popover"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: 0,
                          right: 0,
                          zIndex: 9999,
                          background: '#121620',
                          border: '1px solid var(--border-gold)',
                          borderRadius: '10px',
                          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        {/* Search input INSIDE dropdown */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          background: 'rgba(255, 255, 255, 0.06)', 
                          padding: '8px 12px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border)' 
                        }}>
                          <Search size={15} color="var(--gold)" />
                          <input 
                            type="text" 
                            placeholder="Search service name (Haircut, Beard, Facial...)" 
                            value={serviceDropdownSearch}
                            onChange={(e) => setServiceDropdownSearch(e.target.value)}
                            autoFocus
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              outline: 'none', 
                              color: '#fff', 
                              fontSize: '0.88rem', 
                              width: '100%' 
                            }}
                          />
                          {serviceDropdownSearch && (
                            <button 
                              type="button" 
                              onClick={() => setServiceDropdownSearch('')}
                              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Filtered Services List */}
                        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {services
                            .filter(s => s.name.toLowerCase().includes(serviceDropdownSearch.toLowerCase()))
                            .map(s => {
                              const isAdded = selectedServices.some(sel => sel.id === s.id);
                              return (
                                <div 
                                  key={s.id}
                                  onClick={() => {
                                    toggleService(s);
                                    setIsServiceDropdownOpen(false);
                                    setServiceDropdownSearch('');
                                  }}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    background: isAdded ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                    cursor: 'pointer',
                                    border: isAdded ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                                    transition: 'background 0.15s'
                                  }}
                                >
                                  <div>
                                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{s.name}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{s.price}</span>
                                    {isAdded ? (
                                      <span style={{ fontSize: '0.75rem', background: '#34d399', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>✓ Added</span>
                                    ) : (
                                      <span style={{ fontSize: '0.75rem', background: 'var(--gold)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>+ Add</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          {services.filter(s => s.name.toLowerCase().includes(serviceDropdownSearch.toLowerCase())).length === 0 && (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                              No services found matching "{serviceDropdownSearch}".
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Services Tags / List */}
                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                      Selected Services ({selectedServices.length}):
                    </label>
                    {selectedServices.length === 0 ? (
                      <div style={{ padding: '12px', background: 'rgba(10, 12, 16, 0.4)', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        No services selected yet. Click the dropdown menu above to select services.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedServices.map(srv => (
                          <div key={srv.id} className="service-pill-tag">
                            <span>{srv.name}</span>
                            <span style={{ color: '#fff', marginLeft: '4px' }}>₹{srv.price}</span>
                            <button 
                              type="button" 
                              onClick={() => toggleService(srv)}
                              title="Remove service"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Retail Products Card - Clean dropdown with search inside */}
              <div 
                className="glass-panel" 
                style={{ 
                  marginTop: '20px', 
                  position: 'relative', 
                  zIndex: isProductDropdownOpen ? 98 : 4,
                  overflow: 'visible' 
                }}
              >
                <div className="panel-header">
                  <div className="panel-title">
                    <ShoppingBag size={18} /> 3. Retail Products Purchased
                  </div>
                  <span className="badge-pill">
                    {Object.values(selectedProducts).reduce((a, b) => a + b, 0)} Items
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Searchable Dropdown Component for Retail Products */}
                  <div className="dropdown-search-wrapper" style={{ position: 'relative', zIndex: 100 }}>
                    <div 
                      className="dropdown-trigger-box"
                      onClick={() => {
                        setIsProductDropdownOpen(prev => !prev);
                        setIsServiceDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'rgba(10, 12, 16, 0.85)',
                        border: isProductDropdownOpen ? '1px solid #34d399' : '1px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#fff',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <span style={{ color: Object.keys(selectedProducts).length > 0 ? '#fff' : 'var(--text-dim)', fontSize: '0.92rem' }}>
                        Select Product
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#34d399', transform: isProductDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                        ▼
                      </span>
                    </div>

                    {/* Dropdown Menu with Search Inside */}
                    {isProductDropdownOpen && (
                      <div 
                        className="dropdown-menu-popover"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: 0,
                          right: 0,
                          zIndex: 9999,
                          background: '#121620',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          borderRadius: '10px',
                          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        {/* Search input INSIDE dropdown */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          background: 'rgba(255, 255, 255, 0.06)', 
                          padding: '8px 12px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border)' 
                        }}>
                          <Search size={15} color="#34d399" />
                          <input 
                            type="text" 
                            placeholder="Search product name (Wax, Serum, Shampoo...)" 
                            value={productDropdownSearch}
                            onChange={(e) => setProductDropdownSearch(e.target.value)}
                            autoFocus
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              outline: 'none', 
                              color: '#fff', 
                              fontSize: '0.88rem', 
                              width: '100%' 
                            }}
                          />
                          {productDropdownSearch && (
                            <button 
                              type="button" 
                              onClick={() => setProductDropdownSearch('')}
                              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Filtered Products List */}
                        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {products
                            .filter(p => p.name.toLowerCase().includes(productDropdownSearch.toLowerCase()))
                            .map(p => {
                              const qty = selectedProducts[p.id] || 0;
                              return (
                                <div 
                                  key={p.id}
                                  onClick={() => {
                                    adjustProductQty(p.id, 1);
                                    setIsProductDropdownOpen(false);
                                    setProductDropdownSearch('');
                                  }}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    background: qty > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                    cursor: 'pointer',
                                    border: qty > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                                    transition: 'background 0.15s'
                                  }}
                                >
                                  <div>
                                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{p.name}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#34d399', fontWeight: 700 }}>₹{p.price}</span>
                                    {qty > 0 ? (
                                      <span style={{ fontSize: '0.75rem', background: '#34d399', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                        Qty: {qty}
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '0.75rem', background: '#34d399', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                        + Add
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          {products.filter(p => p.name.toLowerCase().includes(productDropdownSearch.toLowerCase())).length === 0 && (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                              No products found matching "{productDropdownSearch}".
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Products Tags / Pills with Qty controls */}
                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                      Selected Retail Products ({Object.values(selectedProducts).reduce((a, b) => a + b, 0)}):
                    </label>
                    {Object.entries(selectedProducts).length === 0 ? (
                      <div style={{ padding: '12px', background: 'rgba(10, 12, 16, 0.4)', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        No retail products added. Click the dropdown menu above to select products if customer purchased any.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {Object.entries(selectedProducts).map(([pid, qty]) => {
                          const prod = products.find(p => p.id === pid);
                          if (!prod) return null;
                          return (
                            <div key={pid} className="product-pill-tag">
                              <span>{prod.name}</span>
                              <span style={{ color: '#fff' }}>₹{prod.price * qty}</span>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                                <button 
                                  type="button" 
                                  className="pill-qty-btn"
                                  onClick={() => adjustProductQty(pid, -1)}
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <span style={{ color: '#fff', fontSize: '0.8rem', padding: '0 2px' }}>{qty}</span>
                                <button 
                                  type="button" 
                                  className="pill-qty-btn"
                                  onClick={() => adjustProductQty(pid, 1)}
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                              <button 
                                type="button" 
                                className="remove-btn"
                                onClick={() => adjustProductQty(pid, -qty)}
                                title="Remove product"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
                      type="text" 
                      inputMode="numeric"
                      placeholder="0"
                      value={discount} 
                      onChange={(e) => {
                        const cleanDigits = e.target.value.replace(/\D/g, '');
                        setDiscount(cleanDigits);
                      }}
                      style={{ width: '80px', padding: '4px 8px', textAlign: 'right' }}
                    />
                  </div>
                  <div className="sum-row grand">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal}</span>
                  </div>

                  {/* Paid & Pending Account Rows */}
                  <div className="sum-row" style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ fontWeight: 600, color: '#34d399' }}>Paid Account Amount:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>₹</span>
                      <input 
                        type="number" 
                        min="0"
                        max={grandTotal}
                        placeholder={String(grandTotal)}
                        value={paidAmountInput} 
                        onChange={(e) => setPaidAmountInput(e.target.value)}
                        style={{ 
                          width: '85px', 
                          padding: '4px 8px', 
                          textAlign: 'right', 
                          fontWeight: 700, 
                          color: '#34d399', 
                          background: 'rgba(16, 185, 129, 0.12)', 
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          borderRadius: '6px'
                        }}
                      />
                    </div>
                  </div>

                  <div className="sum-row" style={{ color: pendingAmount > 0 ? '#f87171' : 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 600 }}>Pending Account Amount:</span>
                    <span style={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: pendingAmount > 0 ? '#ef4444' : '#9ca3af',
                      background: pendingAmount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                      padding: pendingAmount > 0 ? '2px 8px' : '0',
                      borderRadius: '4px'
                    }}>
                      ₹{pendingAmount} {pendingAmount > 0 ? '(Due)' : '(Settled)'}
                    </span>
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

        {/* TAB 2: REPORTS (Comprehensive Financial & Staff Work Reports) */}
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

              {/* Staff Member Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Staff:</span>
                <select 
                  value={staffFilter} 
                  onChange={(e) => setStaffFilter(e.target.value)}
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.82rem', 
                    borderRadius: '8px',
                    background: 'rgba(10, 12, 16, 0.8)',
                    color: '#fff',
                    border: '1px solid var(--border)'
                  }}
                >
                  <option value="all">All Staff Members ({employees.length})</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
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

            {/* KPI Cards (Including Paid & Pending Balances) */}
            <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="kpi-box">
                <div className="kpi-ico gold">₹</div>
                <div className="kpi-text">
                  <span>Total Billed</span>
                  <h3>₹{metricRevenue.toLocaleString('en-IN')}</h3>
                  <small>Billed Revenue</small>
                </div>
              </div>

              <div className="kpi-box">
                <div className="kpi-ico emerald">✓</div>
                <div className="kpi-text">
                  <span>Paid Received</span>
                  <h3 style={{ color: '#34d399' }}>₹{metricPaidRevenue.toLocaleString('en-IN')}</h3>
                  <small>Collected Cash/UPI</small>
                </div>
              </div>

              <div className="kpi-box">
                <div className="kpi-ico" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>⚠️</div>
                <div className="kpi-text">
                  <span>Pending Due</span>
                  <h3 style={{ color: metricPendingTotal > 0 ? '#ef4444' : '#9ca3af' }}>₹{metricPendingTotal.toLocaleString('en-IN')}</h3>
                  <small>Unpaid Account Balance</small>
                </div>
              </div>

              <div className="kpi-box">
                <div className="kpi-ico blue"><User size={22} /></div>
                <div className="kpi-text">
                  <span>Customers Served</span>
                  <h3>{filteredVisits.length}</h3>
                  <small>{staffFilter !== 'all' ? `By ${staffFilter}` : 'Total Visits'}</small>
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

            {/* STAFF WORK & PERFORMANCE REPORT SECTION */}
            <div className="glass-panel" style={{ marginTop: '20px' }}>
              <div className="panel-header">
                <div className="panel-title">
                  <UserCheck size={20} /> Staff Work & Performance Report
                </div>
                <span className="badge-pill">
                  {staffWorkReport.filter(s => s.totalCustomers > 0).length} Active Staff in Range
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Comprehensive breakdown of how each staff/stylist worked, customers handled, and revenue generated in the selected period.
              </p>

              <div className="table-wrap">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Staff / Stylist</th>
                      <th style={{ textAlign: 'center' }}>Visits</th>
                      <th style={{ textAlign: 'right' }}>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffWorkReport.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                          No staff members registered.
                        </td>
                      </tr>
                    ) : (
                      staffWorkReport.map(st => (
                        <tr 
                          key={st.id}
                          style={{
                            background: staffFilter === st.name ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => setStaffFilter(prev => prev === st.name ? 'all' : st.name)}
                          title="Click to filter visits by this staff member"
                        >
                          <td>
                            <strong>{st.name}</strong>
                            {staffFilter === st.name && (
                              <span style={{ marginLeft: '8px', fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700 }}>
                                (Filter Active)
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <strong style={{ fontSize: '0.95rem' }}>{st.totalCustomers}</strong> visits
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong style={{ color: 'var(--gold)', fontSize: '0.95rem' }}>₹{st.totalRevenue.toLocaleString('en-IN')}</strong>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Records Table with Paid & Pending Columns */}
            <div className="glass-panel" style={{ marginTop: '20px' }}>
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
                  Showing {filteredVisits.length} Records {staffFilter !== 'all' ? `(Staff: ${staffFilter})` : ''}
                </div>
              </div>

              <div className="table-wrap">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Customer Details</th>
                      <th>Stylist / Staff</th>
                      <th>Services & Products</th>
                      <th>Total Bill</th>
                      <th>Paid Account</th>
                      <th>Pending Account</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisits.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                          No customer entries found for this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredVisits.map(v => {
                        const paid = v.paidAmount !== undefined ? v.paidAmount : v.grandTotal;
                        const pending = v.pendingAmount || 0;
                        return (
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
                              {v.employeeName ? (
                                <span className="badge-tag-staff">
                                  <User size={12} /> {v.employeeName}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Unassigned</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {v.services.length > 0 ? v.services.map(s => (
                                    <span key={s.id} className="badge-tag-srv">{s.name}</span>
                                  )) : <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>No service</span>}
                                </div>
                                {v.products && v.products.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {v.products.map(p => (
                                      <span key={p.id} className="badge-tag-prd">{p.name} ×{p.qty}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--gold)' }}>₹{v.grandTotal}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{v.paymentMethod}</div>
                            </td>
                            <td>
                              <strong style={{ color: '#34d399' }}>₹{paid}</strong>
                            </td>
                            <td>
                              {pending > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ 
                                    color: '#ef4444', 
                                    fontWeight: 700, 
                                    background: 'rgba(239, 68, 68, 0.12)', 
                                    padding: '2px 8px', 
                                    borderRadius: '4px',
                                    fontSize: '0.82rem',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    ₹{pending} Due
                                  </span>
                                  <button
                                    className="btn btn-sm btn-outline-gold"
                                    onClick={() => handleClearDue(v)}
                                    title="Clear remaining due & mark full amount paid"
                                    style={{
                                      padding: '2px 8px',
                                      fontSize: '0.74rem',
                                      lineHeight: '1.2',
                                      borderRadius: '4px',
                                      whiteSpace: 'nowrap',
                                      border: '1px solid var(--gold)',
                                      color: 'var(--gold)',
                                      background: 'rgba(212, 175, 55, 0.1)'
                                    }}
                                  >
                                    Clear Due
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: '#34d399', fontSize: '0.8rem' }}>Settled ✓</span>
                              )}
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
                        );
                      })
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

        {/* TAB 5: EMPLOYEES / STAFF MANAGEMENT TAB */}
        {activeTab === 'employees' && (
          <div className="glass-panel">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div className="panel-title">
                <Users size={20} /> Staff ({employees.length})
              </div>
              <button className="btn btn-sm btn-gold" onClick={() => setNewEmpModal(true)}>
                <Plus size={14} /> Add New Staff
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Manage your salon staff, Aadhaar cards, profile photos, contact numbers, and service assignments.
            </p>

            {employees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                No staff registered yet. Click "+ Add New Staff" to register staff.
              </div>
            ) : (
              <div className="employee-grid">
                {employees.map(emp => (
                  <div key={emp.id} className="employee-card">
                    <div>
                      <div className="emp-card-header">
                        {emp.photoUrl ? (
                          <img 
                            src={emp.photoUrl} 
                            alt={emp.name} 
                            className="emp-avatar" 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                            }}
                          />
                        ) : (
                          <div className="emp-avatar">
                            <User size={28} />
                          </div>
                        )}
                        <div className="emp-info">
                          <h4>{emp.name}</h4>
                          {emp.phone && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              📞 {emp.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="emp-details-list" style={{ marginTop: '14px' }}>
                        <div className="emp-detail-row">
                          <FileText size={14} />
                          <div>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Aadhaar Card:</span><br />
                            <strong>{emp.aadhaarNumber || 'Not Uploaded / Provided'}</strong>
                          </div>
                        </div>
                        <div className="emp-detail-row">
                          <MapPin size={14} />
                          <div>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Address:</span><br />
                            <span>{emp.address || 'Address not added'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <button 
                        className="btn-counter" 
                        onClick={() => setEditEmpModal({ ...emp })}
                        title="Edit Staff"
                        aria-label="Edit Staff"
                        style={{ width: '32px', height: '32px' }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        className="btn-counter" 
                        style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        title="Delete Staff"
                        aria-label="Delete Staff"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {activeReceipt.employeeName && (
                  <div><strong>Stylist / Served By:</strong> {activeReceipt.employeeName}</div>
                )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #ccc' }}>
                  <span>Grand Total:</span>
                  <span>₹{activeReceipt.grandTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>Paid Amount:</span>
                  <span>₹{activeReceipt.paidAmount !== undefined ? activeReceipt.paidAmount : activeReceipt.grandTotal}</span>
                </div>
                {activeReceipt.pendingAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: 700 }}>
                    <span>Pending Account Amount:</span>
                    <span>₹{activeReceipt.pendingAmount} (Due)</span>
                  </div>
                )}
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

      {/* ADD EMPLOYEE MODAL */}
      {newEmpModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="panel-header">
              <h3>Register New Staff</h3>
              <button className="btn-counter" onClick={() => setNewEmpModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '16px 0' }}>
              <div className="input-field">
                <label>Staff Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Vikram Sharma" 
                  value={newEmpName} 
                  onChange={(e) => setNewEmpName(e.target.value)} 
                />
              </div>

              <div className="input-field">
                <label>Mobile Number (10 Digits)</label>
                <input 
                  type="tel" 
                  placeholder="9876543210" 
                  maxLength={10}
                  value={newEmpPhone} 
                  onChange={(e) => setNewEmpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                />
              </div>

              <div className="input-field">
                <label>Aadhaar Card Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1234 5678 9012" 
                  value={newEmpAadhaar} 
                  onChange={(e) => setNewEmpAadhaar(e.target.value)} 
                />
              </div>

              <div className="input-field">
                <label>Full Residential Address</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. House No 12, Gandhi Nagar, Near Main Market"
                  value={newEmpAddress}
                  onChange={(e) => setNewEmpAddress(e.target.value)}
                  style={{
                    background: 'rgba(10, 12, 16, 0.8)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontFamily: 'inherit',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div className="input-field">
                <label>Staff Photo (Upload Image or Paste URL)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Image URL (or select file below)" 
                    value={newEmpPhoto} 
                    onChange={(e) => setNewEmpPhoto(e.target.value)} 
                    style={{ flex: 1 }}
                  />
                  <label 
                    className="btn btn-sm btn-ghost" 
                    style={{ cursor: 'pointer', whiteSpace: 'nowrap', padding: '10px 14px' }}
                  >
                    Upload File
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Please select an image smaller than 2MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setNewEmpPhoto(event.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {newEmpPhoto && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <img 
                      src={newEmpPhoto} 
                      alt="Preview" 
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-gold)' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: '#34d399' }}>✓ Photo attached</span>
                    <button 
                      type="button" 
                      className="btn-counter" 
                      style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}
                      onClick={() => setNewEmpPhoto('')}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-ghost" onClick={() => setNewEmpModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleAddNewEmployee}>Save Staff</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editEmpModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="panel-header">
              <h3>Edit Staff Details</h3>
              <button className="btn-counter" onClick={() => setEditEmpModal(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '16px 0' }}>
              <div className="input-field">
                <label>Staff Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Vikram Sharma" 
                  value={editEmpModal.name || ''} 
                  onChange={(e) => setEditEmpModal({ ...editEmpModal, name: e.target.value })} 
                />
              </div>

              <div className="input-field">
                <label>Mobile Number (10 Digits)</label>
                <input 
                  type="tel" 
                  placeholder="9876543210" 
                  maxLength={10}
                  value={editEmpModal.phone || ''} 
                  onChange={(e) => setEditEmpModal({ ...editEmpModal, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} 
                />
              </div>

              <div className="input-field">
                <label>Aadhaar Card Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1234 5678 9012" 
                  value={editEmpModal.aadhaarNumber || ''} 
                  onChange={(e) => setEditEmpModal({ ...editEmpModal, aadhaarNumber: e.target.value })} 
                />
              </div>

              <div className="input-field">
                <label>Full Residential Address</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. House No 12, Gandhi Nagar, Near Main Market"
                  value={editEmpModal.address || ''}
                  onChange={(e) => setEditEmpModal({ ...editEmpModal, address: e.target.value })}
                  style={{
                    background: 'rgba(10, 12, 16, 0.8)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontFamily: 'inherit',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div className="input-field">
                <label>Staff Photo (Upload Image or Paste URL)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Image URL (or select file below)" 
                    value={editEmpModal.photoUrl || ''} 
                    onChange={(e) => setEditEmpModal({ ...editEmpModal, photoUrl: e.target.value })} 
                    style={{ flex: 1 }}
                  />
                  <label 
                    className="btn btn-sm btn-ghost" 
                    style={{ cursor: 'pointer', whiteSpace: 'nowrap', padding: '10px 14px' }}
                  >
                    Upload File
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Please select an image smaller than 2MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setEditEmpModal(prev => ({ ...prev, photoUrl: event.target.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {editEmpModal.photoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <img 
                      src={editEmpModal.photoUrl} 
                      alt="Preview" 
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-gold)' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: '#34d399' }}>✓ Photo attached</span>
                    <button 
                      type="button" 
                      className="btn-counter" 
                      style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}
                      onClick={() => setEditEmpModal(prev => ({ ...prev, photoUrl: '' }))}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-ghost" onClick={() => setEditEmpModal(null)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleUpdateEmployee}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW EMPLOYEE DETAILS MODAL */}
      {viewEmpModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="panel-header">
              <h3>Staff Profile & ID</h3>
              <button className="btn-counter" onClick={() => setViewEmpModal(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '16px 0', gap: '12px' }}>
              {viewEmpModal.photoUrl ? (
                <img 
                  src={viewEmpModal.photoUrl} 
                  alt={viewEmpModal.name} 
                  style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', border: '3px solid var(--gold)', boxShadow: '0 8px 25px var(--gold-glow)' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                  }}
                />
              ) : (
                <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: 'rgba(212, 175, 55, 0.15)', border: '3px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: varGold => 'var(--gold)' }}>
                  <User size={48} color="var(--gold)" />
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '4px' }}>{viewEmpModal.name}</h3>
              </div>

              <div style={{ width: '100%', background: 'rgba(10, 12, 16, 0.7)', borderRadius: '12px', border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', fontSize: '0.86rem' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Phone Number:</span>
                  <div style={{ fontWeight: 600, color: '#fff', marginTop: '2px' }}>{viewEmpModal.phone || 'Not provided'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Aadhaar Card:</span>
                  <div style={{ fontWeight: 700, color: 'var(--gold)', letterSpacing: '1px', marginTop: '2px' }}>
                    {viewEmpModal.aadhaarNumber || 'Not Uploaded / Provided'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Residential Address:</span>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>
                    {viewEmpModal.address || 'Address not registered'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-gold btn-block" onClick={() => setViewEmpModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`mobile-tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <PlusCircle size={20} />
          <span>New Entry</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText size={20} />
          <span>Reports</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Scissors size={20} />
          <span>Services</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <ShoppingBag size={20} />
          <span>Products</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <Users size={20} />
          <span>Staff</span>
        </button>
      </nav>
    </div>
  );
}
