import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Info, 
  ArrowRightLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  RefreshCw,
  Wallet,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'overview' | 'monthly' | 'biweekly' | 'annual' | 'budgeting';

export default function App() {
  const [exchangeRate, setExchangeRate] = useState<number>(11.09);
  const [baseSalary, setBaseSalary] = useState<number>(334.00);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchExchangeRate = useCallback(async () => {
    setIsLoadingRate(true);
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      if (data && data.rates && data.rates.GHS) {
        setExchangeRate(parseFloat(data.rates.GHS.toFixed(2)));
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    } finally {
      setIsLoadingRate(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  const calculations = useMemo(() => {
    const ghsBase = baseSalary * exchangeRate;
    const ssnitAmount = ghsBase * 0.055;
    const taxableIncome = ghsBase - ssnitAmount;

    // PAYE Calculation
    const bands = [
      { start: 0, end: 490, rate: 0.00 },
      { start: 490, end: 600, rate: 0.05 },
      { start: 600, end: 730, rate: 0.10 },
      { start: 730, end: 3896.67, rate: 0.175 },
      { start: 3896.67, end: 19896.67, rate: 0.25 },
      { start: 19896.67, end: 50416.67, rate: 0.30 },
      { start: 50416.67, end: Infinity, rate: 0.35 }
    ];

    let payeAmount = 0;
    for (const band of bands) {
      if (taxableIncome <= band.start) break;
      const amountInBand = Math.min(taxableIncome, band.end) - band.start;
      if (amountInBand > 0) {
        payeAmount += amountInBand * band.rate;
      }
    }

    const totalDeductions = ssnitAmount + payeAmount;
    const netSalary = ghsBase - totalDeductions;

    return {
      ghsBase,
      ssnitAmount,
      taxableIncome,
      payeAmount,
      totalDeductions,
      netSalary,
      biweekly: {
        gross: ghsBase / 2,
        ssnit: ssnitAmount / 2,
        paye: payeAmount / 2,
        net: netSalary / 2
      },
      annual: {
        gross: ghsBase * 12,
        ssnit: ssnitAmount * 12,
        paye: payeAmount * 12,
        deductions: totalDeductions * 12,
        net: netSalary * 12
      },
      budget: {
        needs: netSalary * 0.5,
        wants: netSalary * 0.3,
        savings: netSalary * 0.2
      }
    };
  }, [exchangeRate, baseSalary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-6 md:py-20 overflow-x-hidden">
      {/* Header */}
      <header className="mb-8 md:mb-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-apple-blue rounded-2xl flex items-center justify-center shadow-lg shadow-apple-blue/20 mb-1">
            <Calculator className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#334870]">CediNet</h1>
          <div className="h-px w-12 bg-apple-blue/20 mx-auto" />
          <p className="text-[10px] text-apple-gray-400 font-bold uppercase tracking-[0.3em]">Salary Infrastructure</p>
        </div>
      </header>

      {/* Settings Card */}
      <section className="apple-card mb-6 md:mb-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="text-apple-blue w-5 h-5" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-gray-400">Salary Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-bold text-apple-gray-500">Base Salary (USD)</p>
              <p className="text-xs text-apple-gray-400">Monthly contract amount</p>
            </div>
            
            <div className="relative group">
              <input 
                type="number" 
                value={baseSalary}
                onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                className="w-full bg-apple-gray-100 rounded-2xl px-6 py-4 text-3xl font-bold text-apple-gray-500 focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all text-right pr-16"
                step="1"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-apple-gray-400 text-xl font-bold">$</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-apple-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <ArrowRightLeft className="w-5 h-5 text-apple-blue" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-gray-400">Exchange Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://www.bog.gov.gh/treasury-and-the-markets/daily-interbank-fx-rates/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-apple-gray-100 rounded-2xl group transition-all hover:bg-apple-gray-200"
              >
                <ChevronRight className="w-3 h-3 text-apple-blue group-hover:translate-x-0.5 transition-transform" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-apple-blue">Bank of Ghana</span>
              </a>

              <button 
                onClick={fetchExchangeRate}
                disabled={isLoadingRate}
                className="flex items-center justify-center gap-2 py-3 bg-apple-gray-100 rounded-2xl group transition-all hover:bg-apple-gray-200 disabled:opacity-30"
              >
                <RefreshCw className={`w-3 h-3 text-apple-blue ${isLoadingRate ? 'animate-spin' : ''}`} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-apple-blue">
                  {isLoadingRate ? 'Syncing...' : 'Sync Market'}
                </span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-bold text-apple-gray-500">USD to GHS Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-apple-gray-400">
                    {lastUpdated ? `Last market update: ${lastUpdated}` : 'Manual conversion override'}
                  </p>
                  <div className="group relative">
                    <Info className="w-3 h-3 text-apple-gray-300 cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-apple-gray-500 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed shadow-xl">
                      Official Bank of Ghana rates are recommended for accurate statutory payroll.
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <input 
                  type="number" 
                  value={exchangeRate}
                  onChange={(e) => {
                    setExchangeRate(parseFloat(e.target.value) || 0);
                    setLastUpdated(null);
                  }}
                  className={`w-full rounded-2xl px-6 py-4 text-2xl font-bold transition-all text-right pr-20 focus:outline-none focus:ring-2 focus:ring-apple-blue/20 ${
                    !lastUpdated 
                    ? 'bg-white border-2 border-apple-blue/30 text-apple-blue' 
                    : 'bg-apple-gray-100 text-apple-gray-500'
                  }`}
                  step="0.01"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-apple-gray-400 text-lg font-bold">GHS</span>
              </div>
            </div>
            
            <p className="text-[9px] text-apple-gray-400 italic leading-relaxed text-center px-4">
              *Global market data is synced for convenience. Statutory compliance requires the official BoG rate.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="relative mb-8 group/nav">
        <nav className="relative flex p-1 bg-apple-gray-200/80 backdrop-blur-md rounded-[22px] overflow-x-auto no-scrollbar snap-x snap-mandatory ring-1 ring-apple-gray-300/10">
          {(['overview', 'monthly', 'biweekly', 'annual', 'budgeting'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[110px] py-3 text-[11px] md:text-sm font-bold rounded-[18px] transition-all whitespace-nowrap snap-center mx-0.5 relative z-10 ${
                activeTab === tab 
                  ? 'text-white' 
                  : 'text-apple-gray-400 hover:text-apple-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-apple-blue rounded-[18px] -z-10 shadow-lg shadow-apple-blue/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>
        
        {/* Horizontal scroll hint indicator */}
        <motion.div 
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none md:hidden z-20"
        >
          <div className="w-1.5 h-1.5 bg-apple-blue rounded-full shadow-sm" />
          <ChevronRight className="w-4 h-4 text-apple-blue drop-shadow-sm" />
        </motion.div>

        {/* Gradient fades for scroll depth */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-apple-gray-200/50 to-transparent pointer-events-none rounded-r-[22px] md:hidden z-10" />
      </div>

      {/* Content Area */}
      <main className="relative min-h-[300px] md:min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-apple-blue p-6 md:p-8 rounded-[32px] text-white shadow-2xl shadow-apple-blue/20 text-center">
                  <p className="text-white/70 font-semibold text-[10px] md:text-sm uppercase tracking-widest mb-2">Net Monthly Salary</p>
                  <h3 className="text-3xl md:text-5xl font-bold mb-4 break-words">{formatCurrency(calculations.netSalary)}</h3>
                  <p className="text-white/60 text-xs md:text-sm">Take-home after all statutory deductions</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="apple-card p-5">
                    <p className="text-xs font-semibold text-apple-gray-400 uppercase mb-1">Gross Monthly</p>
                    <p className="text-xl font-bold">{formatCurrency(calculations.ghsBase)}</p>
                  </div>
                  <div className="apple-card p-5">
                    <p className="text-xs font-semibold text-apple-gray-400 uppercase mb-1">Total Deductions</p>
                    <p className="text-xl font-bold text-apple-gray-400">{formatCurrency(calculations.totalDeductions)}</p>
                  </div>
                </div>

                <div className="apple-card">
                  <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-apple-blue" />
                    Deduction Breakdown
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-apple-gray-400 text-sm">SSNIT Contribution (5.5%)</span>
                      <span className="font-semibold">{formatCurrency(calculations.ssnitAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-apple-gray-400 text-sm">PAYE Income Tax</span>
                      <span className="font-semibold">{formatCurrency(calculations.payeAmount)}</span>
                    </div>
                    {calculations.payeAmount === 0 && (
                      <div className="bg-apple-gray-100 p-4 rounded-xl flex gap-3">
                        <Info className="w-5 h-5 text-apple-blue shrink-0" />
                        <p className="text-xs text-apple-gray-400 leading-relaxed">
                          Your salary is below the PAYE tax threshold (GHS 490), so you pay 0% income tax. Only SSNIT is deducted.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monthly' && (
              <div className="space-y-6">
                <div className="apple-card border-l-4 border-apple-gray-400">
                  <h4 className="text-sm font-bold mb-6 flex items-center gap-2 text-apple-gray-400">
                    <DollarSign className="w-4 h-4" />
                    Gross Salary Components
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-apple-gray-100 gap-2">
                      <span className="text-apple-gray-400 text-sm shrink-0">Base Salary (Contract)</span>
                      <span className="font-semibold truncate">{formatUSD(baseSalary)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-apple-gray-100 gap-2">
                      <span className="text-apple-gray-400 text-sm shrink-0">Exchange Rate</span>
                      <span className="font-semibold truncate">{exchangeRate.toFixed(2)} GHS/USD</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 gap-2">
                      <span className="font-bold shrink-0">Total Gross (GHS)</span>
                      <span className="text-xl font-bold text-apple-blue truncate">{formatCurrency(calculations.ghsBase)}</span>
                    </div>
                  </div>
                </div>

                <div className="apple-card border-l-4 border-apple-blue">
                  <h4 className="text-sm font-bold mb-6 flex items-center gap-2 text-apple-blue">
                    <TrendingUp className="w-4 h-4" />
                    Statutory Deductions
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">SSNIT (5.5%)</span>
                        <span className="font-bold text-apple-gray-400">{formatCurrency(calculations.ssnitAmount)}</span>
                      </div>
                      <p className="text-[10px] text-apple-gray-400">Employee pension contribution. Employer pays additional 13%.</p>
                    </div>
                    
                    <div className="pt-4 border-t border-apple-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-apple-gray-400 text-sm">Taxable Income</span>
                        <span className="font-semibold">{formatCurrency(calculations.taxableIncome)}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">PAYE Income Tax</span>
                        <span className="font-bold text-apple-gray-400">{formatCurrency(calculations.payeAmount)}</span>
                      </div>
                      <p className="text-[10px] text-apple-gray-400">Progressive tax based on Ghana Revenue Authority bands.</p>
                    </div>

                    <div className="bg-apple-gray-50 p-4 rounded-2xl flex justify-between items-center">
                      <span className="font-bold">Net Monthly</span>
                      <span className="text-2xl font-bold text-apple-blue">{formatCurrency(calculations.netSalary)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'biweekly' && (
              <div className="space-y-6">
                <div className="apple-card border-l-4 border-apple-gray-300">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-apple-gray-300 w-5 h-5" />
                    <h4 className="text-sm font-bold text-apple-gray-300">Payment Schedule</h4>
                  </div>
                  <p className="text-xs text-apple-gray-400 mb-6">Payments on the 15th and last day of each month</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-apple-gray-100 p-6 rounded-2xl border border-apple-gray-300/10">
                      <p className="text-[10px] font-bold text-apple-gray-300 uppercase mb-1">1st Payment (15th)</p>
                      <p className="text-2xl font-bold text-apple-blue">{formatCurrency(calculations.biweekly.net)}</p>
                    </div>
                    <div className="bg-apple-gray-100 p-6 rounded-2xl border border-apple-gray-300/10">
                      <p className="text-[10px] font-bold text-apple-gray-300 uppercase mb-1">2nd Payment (End)</p>
                      <p className="text-2xl font-bold text-apple-blue">{formatCurrency(calculations.biweekly.net)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-apple-gray-400">Gross per payment</span>
                      <span className="font-medium">{formatCurrency(calculations.biweekly.gross)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-apple-gray-400">SSNIT (5.5%)</span>
                      <span className="font-medium text-apple-gray-400">-{formatCurrency(calculations.biweekly.ssnit)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-apple-gray-400">PAYE Tax</span>
                      <span className="font-medium text-apple-gray-400">-{formatCurrency(calculations.biweekly.paye)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'annual' && (
              <div className="space-y-6">
                <div className="bg-apple-gray-300 p-6 md:p-10 rounded-[32px] md:rounded-[40px] text-white text-center shadow-xl shadow-apple-gray-300/30">
                  <p className="text-white/80 font-semibold text-[10px] md:text-xs uppercase tracking-[0.2em] mb-3">Annual Net Income</p>
                  <h3 className="text-3xl md:text-5xl font-bold mb-4 break-words">{formatCurrency(calculations.annual.net)}</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 rounded-full text-[10px] font-medium">
                    <Info className="w-3 h-3" />
                    Based on current exchange rate
                  </div>
                </div>

                <div className="apple-card border-l-4 border-apple-gray-300">
                  <div className="space-y-5">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-apple-gray-300/10 rounded-lg flex items-center justify-center shrink-0">
                          <TrendingUp className="w-4 h-4 text-apple-gray-300" />
                        </div>
                        <span className="text-sm font-medium truncate">Annual Gross</span>
                      </div>
                      <span className="font-bold shrink-0 text-apple-blue">{formatCurrency(calculations.annual.gross)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-apple-gray-400/10 rounded-lg flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4 text-apple-gray-400" />
                        </div>
                        <span className="text-sm font-medium truncate text-apple-gray-400">Annual SSNIT</span>
                      </div>
                      <span className="font-bold text-apple-gray-400 shrink-0">-{formatCurrency(calculations.annual.ssnit)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-apple-gray-400/10 rounded-lg flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4 text-apple-gray-400" />
                        </div>
                        <span className="text-sm font-medium truncate text-apple-gray-400">Annual PAYE</span>
                      </div>
                      <span className="font-bold text-apple-gray-400 shrink-0">-{formatCurrency(calculations.annual.paye)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'budgeting' && (
              <div className="space-y-6">
                <div className="apple-card border-apple-blue shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <PieChart className="text-apple-blue w-6 h-6" />
                    <h4 className="text-lg font-bold">50/30/20 Budgeting Rule</h4>
                  </div>
                  
                  <p className="text-sm text-apple-gray-400 leading-relaxed mb-8">
                    The 50/30/20 rule is a simple budgeting framework that divides after-tax income into 50% for Needs (essential expenses like housing and food), 30% for Wants (discretionary spending), and 20% for Savings and debt repayment. This method provides a structured approach to managing finances efficiently without complex tracking.
                  </p>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-6 rounded-[24px] bg-apple-blue/5 border border-apple-blue/10">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-apple-blue uppercase tracking-widest mb-1">50% Needs</p>
                          <h5 className="text-2xl font-bold text-apple-blue">{formatCurrency(calculations.budget.needs)}</h5>
                        </div>
                        <span className="text-xs text-apple-blue/60 font-medium">Essentials & Housing</span>
                      </div>
                      <div className="w-full bg-apple-blue/10 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="bg-apple-blue h-full" 
                          initial={{ width: 0 }} 
                          animate={{ width: '50%' }} 
                        />
                      </div>
                    </div>

                    <div className="p-6 rounded-[24px] bg-apple-gray-400/5 border border-apple-gray-400/10">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-apple-gray-400 uppercase tracking-widest mb-1">30% Wants</p>
                          <h5 className="text-2xl font-bold text-apple-gray-500">{formatCurrency(calculations.budget.wants)}</h5>
                        </div>
                        <span className="text-xs text-apple-gray-400 font-medium">Discretionary Spending</span>
                      </div>
                      <div className="w-full bg-apple-gray-400/10 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="bg-apple-gray-400 h-full" 
                          initial={{ width: 0 }} 
                          animate={{ width: '30%' }} 
                        />
                      </div>
                    </div>

                    <div className="p-6 rounded-[24px] bg-green-500/5 border border-green-500/10">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">20% Savings</p>
                          <h5 className="text-2xl font-bold text-green-600">{formatCurrency(calculations.budget.savings)}</h5>
                        </div>
                        <span className="text-xs text-green-600/60 font-medium">Wealth Building & Debt</span>
                      </div>
                      <div className="w-full bg-green-500/10 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="bg-green-500 h-full" 
                          initial={{ width: 0 }} 
                          animate={{ width: '20%' }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer / Contract Details */}
      <footer className="mt-8 md:mt-12 space-y-4">
        <div className="flex items-center gap-2 text-apple-gray-400 mb-4 px-2">
          <Briefcase className="w-4 h-4" />
          <h5 className="text-xs font-bold uppercase tracking-widest">Contractual Terms</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Deductions', desc: 'Only SSNIT (5.5%) and PAYE tax apply. No hidden charges.' },
            { title: 'Exchange Rate', desc: 'Converted at official BoG rate on each payment date.' },
            { title: 'Quarterly Review', desc: 'Purchasing power protection through periodic reviews.' },
            { title: 'Renegotiation', desc: 'Triggered if GHS depreciates 15%+ from baseline.' }
          ].map((item, i) => (
            <div key={i} className="bg-white/50 border border-black/[0.03] p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-apple-gray-500 uppercase mb-1">{item.title}</p>
              <p className="text-[11px] text-apple-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="pt-8 text-center space-y-2">
          <p className="text-[10px] text-apple-gray-300 font-medium">
            &copy; 2026 CediNet. All statutory calculations based on GRA 2026 Tax Bands.
          </p>
        </div>
      </footer>
    </div>
  );
}
