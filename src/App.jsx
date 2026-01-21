import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, Monitor, Server, HardDrive, Activity, 
  RefreshCw, Sun, Moon, Search, X, AlertCircle, CheckCircle2, MemoryStick 
} from 'lucide-react';
import StatCard from './components/StatCard';
import FilterSection from './components/FilterSection';
import AssetDetailModal from './components/AssetDetailModal';
import { parseCSV, COLORS } from './utils/dataHelpers';

const GOOGLE_SHEET_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL;

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    type: [],
    os: [],
    cpu: [],
    memory: [],
    gpu: [],
    hdd1: [],
    hdd2: [],
    dept: [],
  });
  


  const fetchData = async () => {
    setLoading(true);
    setError(null);

    if (!GOOGLE_SHEET_CSV_URL) {
      setError("ไม่พบการตั้งค่า Environment Variable (VITE_GOOGLE_SHEET_CSV_URL)");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      const parsedData = parseCSV(text);
      setData(parsedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("ไม่สามารถดึงข้อมูลจาก Google Sheets ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Extract unique values
  const uniqueValues = useMemo(() => {
    const getUnique = (key) => [...new Set(data.map(item => item[key]?.trim()))]
      .filter(val => 
        val && 
        val !== '' && 
        val.toLowerCase() !== 'unknown' && 
        val !== '-' && 
        val.toLowerCase() !== 'n/a'
      ) 
      .sort(); 
      
    // สำหรับ Memory เรียงตามค่าตัวเลข
    const memoryOptions = getUnique('memory').sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
    });

    return {
      type: getUnique('type'),
      os: getUnique('os'),
      cpu: getUnique('cpu'),
      memory: memoryOptions,
      gpu: getUnique('gpu'),
      hdd1: getUnique('hdd1'),
      hdd2: getUnique('hdd2'),
      dept: getUnique('dept'),
    };
  }, [data]);

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Text Search
      const matchesSearch = 
        item.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.computerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Checkbox Filters
      const matchesType = filters.type.length === 0 || filters.type.includes(item.type);
      const matchesOS = filters.os.length === 0 || filters.os.includes(item.os);
      const matchesCPU = filters.cpu.length === 0 || filters.cpu.includes(item.cpu);
      const matchesMemory = filters.memory.length === 0 || filters.memory.includes(item.memory);
      const matchesGPU = filters.gpu.length === 0 || filters.gpu.includes(item.gpu);
      const matchesHDD1 = filters.hdd1.length === 0 || filters.hdd1.includes(item.hdd1);
      const matchesHDD2 = filters.hdd2.length === 0 || filters.hdd2.includes(item.hdd2);
      const matchesDept = filters.dept.length === 0 || filters.dept.includes(item.dept);

      return matchesType && matchesOS && matchesCPU && matchesMemory && matchesGPU && matchesHDD1 && matchesHDD2 && matchesDept;
    });
  }, [data, searchTerm, filters]);

  // Aggregated Data
  const stats = useMemo(() => {
    // OS Distribution
    // OS Distribution (Grouped by Version)
    const osCounts = { 'Windows 11': 0, 'Windows 10': 0, 'Others': 0 };
    filteredData.forEach(d => { 
      const os = (d.os || '').toLowerCase();
      if (os.includes('11')) {
        osCounts['Windows 11']++;
      } else if (os.includes('10')) {
        osCounts['Windows 10']++;
      } else {
        // Count others if not empty/unknown
        if (d.os && d.os !== '-' && os !== 'unknown' && os !== 'n/a') {
           osCounts['Others']++;
        }
      }
    });

    // Remove 'Others' if 0 to keep chart clean
    if (osCounts['Others'] === 0) delete osCounts['Others'];

    const osChartData = Object.entries(osCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0) // Filter out 0 counts
      .sort((a, b) => b.value - a.value);

    // Health Grade Counts (Instead of Dept)
    const gradeCounts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
    filteredData.forEach(d => {
      if (d.healthGrade) {
        gradeCounts[d.healthGrade] = (gradeCounts[d.healthGrade] || 0) + 1;
      }
    });
    const gradeChartData = Object.entries(gradeCounts)
      .map(([name, value]) => ({ name: `เกรด ${name}`, value, grade: name }))
      // Sort A -> D
      .sort((a, b) => a.grade.localeCompare(b.grade));

    // HDD Type Counts
    const hddCounts = {};
    filteredData.forEach(d => { 
        if(d.hdd1 && d.hdd1 !== '-' && d.hdd1.toLowerCase() !== 'unknown' && d.hdd1 !== '') hddCounts[d.hdd1] = (hddCounts[d.hdd1] || 0) + 1;
        if(d.hdd2 && d.hdd2 !== '-' && d.hdd2.toLowerCase() !== 'unknown' && d.hdd2 !== '') hddCounts[d.hdd2] = (hddCounts[d.hdd2] || 0) + 1;
    });
    const hddChartData = Object.entries(hddCounts).map(([name, value]) => ({ name, value }));

    return { osChartData, gradeChartData, hddChartData };
  }, [filteredData]);

  // Handlers
  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300`}>
      
      {/* Sidebar - Filter Menu */}
      <aside className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed h-full z-20 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">IT Asset Filter</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">กรองข้อมูลฮาร์ดแวร์คอมพิวเตอร์</p>
        </div>

        <div className="p-4 space-y-2 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <RefreshCw className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              {/* Filters */}
              <FilterSection title="กลุ่มงาน (Department)" options={uniqueValues.dept} selected={filters.dept} onChange={(v) => toggleFilter('dept', v)} isOpenDefault={true} />
              <FilterSection title="ลักษณะเครื่อง (Type)" options={uniqueValues.type} selected={filters.type} onChange={(v) => toggleFilter('type', v)} />
              <FilterSection title="ระบบปฏิบัติการ (OS)" options={uniqueValues.os} selected={filters.os} onChange={(v) => toggleFilter('os', v)} />
              <FilterSection title="หน่วยประมวลผล (CPU)" options={uniqueValues.cpu} selected={filters.cpu} onChange={(v) => toggleFilter('cpu', v)} />
              <FilterSection title="หน่วยความจำ (Memory)" options={uniqueValues.memory} selected={filters.memory} onChange={(v) => toggleFilter('memory', v)} />
              <FilterSection title="กราฟิก (Graphics)" options={uniqueValues.gpu} selected={filters.gpu} onChange={(v) => toggleFilter('gpu', v)} />
              <FilterSection title="HDD ตัวที่ 1" options={uniqueValues.hdd1} selected={filters.hdd1} onChange={(v) => toggleFilter('hdd1', v)} />
              <FilterSection title="HDD ตัวที่ 2" options={uniqueValues.hdd2} selected={filters.hdd2} onChange={(v) => toggleFilter('hdd2', v)} />
              

            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
           <button 
             onClick={() => {
                setFilters({ type: [], os: [], cpu: [], memory: [], gpu: [], hdd1: [], hdd2: [], dept: [] });
                setSearchTerm('');
             }}
             className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
           >
             <X size={16} /> ล้างตัวกรองทั้งหมด
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              ภาพรวมครุภัณฑ์คอมพิวเตอร์
            </h2>
            <div className="flex items-center gap-2 text-xs mt-1">
               {loading ? (
                 <span className="text-indigo-500 flex items-center gap-1"><RefreshCw size={12} className="animate-spin"/> กำลังโหลดข้อมูล...</span>
               ) : error ? (
                 <span className="text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {error}</span>
               ) : (
                 <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> 
                    เชื่อมต่อ Google Sheet แล้ว 
                    <span className="text-slate-400 dark:text-slate-500 ml-2">
                       (อัปเดตล่าสุด: {lastUpdated ? lastUpdated.toLocaleTimeString('th-TH') : '-'})
                    </span>
                 </span>
               )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="text-sm">รีเฟรชข้อมูล</span>
            </button>
            
            <button onClick={toggleDarkMode} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && data.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <RefreshCw className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
              <p>กำลังดึงข้อมูลจาก Google Sheets...</p>
           </div>
        ) : (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="จำนวนเครื่องทั้งหมด" 
                value={filteredData.length} 
                subtext="รายการที่ค้นพบ"
                icon={Monitor} 
                color="bg-blue-500" 
              />
               <StatCard 
                title="Windows 11" 
                value={filteredData.filter(d => d.os && d.os.toLowerCase().includes('11')).length} 
                subtext={`${((filteredData.filter(d => d.os && d.os.toLowerCase().includes('11')).length / (filteredData.length || 1)) * 100).toFixed(1)}% ของทั้งหมด`}
                icon={Server} 
                color="bg-indigo-500" 
              />
              <StatCard 
                title="SSD / M.2" 
                value={filteredData.filter(d => (d.hdd1 && (d.hdd1.includes('SSD') || d.hdd1.includes('M.2'))) || (d.hdd2 && (d.hdd2.includes('SSD') || d.hdd2.includes('M.2')))).length} 
                subtext="เครื่องที่มี Disk ความเร็วสูง"
                icon={HardDrive} 
                color="bg-green-500" 
              />
              <StatCard 
                title="ชั่วโมงทำงานเฉลี่ย" 
                value={filteredData.length > 0 ? (filteredData.reduce((acc, curr) => acc + curr.hdd1Hours, 0) / filteredData.length).toFixed(0) : 0} 
                subtext="ชั่วโมงการใช้งาน HDD หลัก"
                icon={Activity} 
                color="bg-orange-500" 
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* OS Distribution Pie Chart */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">สัดส่วนระบบปฏิบัติการ (OS)</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.osChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.osChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderColor: darkMode ? '#334155' : '#e2e8f0' }} 
                        itemStyle={{ color: darkMode ? '#fff' : '#1e293b' }}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '10px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Health Grade Bar Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">จำนวนเครื่องแยกตามระดับเกรด (Tiers)</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.gradeChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis type="number" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderColor: darkMode ? '#334155' : '#e2e8f0' }} 
                        itemStyle={{ color: darkMode ? '#fff' : '#1e293b' }}
                      />
                      <Bar dataKey="value" name="จำนวนเครื่อง" radius={[4, 4, 0, 0]} barSize={40}>
                        {
                          stats.gradeChartData.map((entry, index) => {
                            let fillColor = '#94a3b8';
                            if (entry.grade === 'A') fillColor = '#22c55e'; // Green
                            else if (entry.grade === 'B') fillColor = '#2563eb'; // Blue
                            else if (entry.grade === 'C') fillColor = '#f97316'; // Orange
                            else if (entry.grade === 'D') fillColor = '#ef4444'; // Red
                            return <Cell key={`cell-${index}`} fill={fillColor} />;
                          })
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">รายการครุภัณฑ์ (Asset List)</h3>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="ค้นหาชื่อ, รหัส, ผู้ใช้..." 
                      className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 w-full sm:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-slate-200 dark:border-slate-700">
                       <th className="pb-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">รหัสครุภัณฑ์</th>
                       <th className="pb-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">ผู้ใช้งาน/ชื่อเครื่อง</th>
                       <th className="pb-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">OS / CPU / RAM</th>
                       <th className="pb-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Disk 1 / Disk 2</th>
                       <th className="pb-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-center">คุณภาพ</th>
                       <th className="pb-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">ชม.ทำงาน</th>
                       <th className="pb-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">กลุ่มงาน</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                     {filteredData.length > 0 ? (
                       filteredData.slice(0, 100).map((item, idx) => (
                         <tr 
                           key={idx} 
                           onClick={() => setSelectedAsset(item)}
                           className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                         >
                           <td className="py-3 px-2 font-medium text-indigo-600 dark:text-indigo-400">{item.id}</td>
                           <td className="py-3 px-2">
                             <div className="text-slate-800 dark:text-slate-200 font-medium">{item.user}</div>
                             <div className="text-slate-500 text-xs">{item.computerName}</div>
                           </td>
                           <td className="py-3 px-2">
                             <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-600 dark:text-slate-300 mr-1 block w-fit mb-1">{item.os || '-'}</span>
                             <div className="text-slate-500 text-xs mb-1">{item.cpu || '-'}</div>
                             {item.memory && (
                               <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-mono bg-slate-50 dark:bg-slate-800 w-fit px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                 <MemoryStick size={10} className="text-indigo-500" />
                                 {item.memory} GB
                               </div>
                             )}
                           </td>
                           <td className="py-3 px-2 text-slate-600 dark:text-slate-400 text-xs">
                             <div className="flex items-center gap-1 mb-1">
                               <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span> <span className="truncate max-w-[120px]" title={item.hdd1}>{item.hdd1 || '-'}</span>
                             </div>
                             {item.hdd2 && item.hdd2 !== '-' && (
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0"></span> <span className="truncate max-w-[120px]" title={item.hdd2}>{item.hdd2}</span>
                                </div>
                             )}
                           </td>
                           <td className="py-3 px-2 text-center">
                             <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border ${item.healthColor}`}>
                               {item.healthGrade}
                             </span>
                             <div className="text-[10px] text-slate-400 mt-1">{item.healthScore} คะแนน</div>
                           </td>
                           <td className="py-3 px-2 text-right">
                             <div className={`font-mono font-medium ${
                                item.hdd1Hours > 20000 ? 'text-red-500' : 
                                item.hdd1Hours > 10000 ? 'text-yellow-500' : 'text-green-500'
                             }`}>
                               {item.hdd1Hours.toLocaleString()}
                             </div>
                             <div className="text-[10px] text-slate-400">ชม.</div>
                           </td>
                           <td className="py-3 px-2 text-slate-600 dark:text-slate-400 truncate max-w-[150px]" title={item.dept}>
                             {item.dept || '-'}
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={7} className="py-8 text-center text-slate-400">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
                 {filteredData.length > 100 && (
                   <div className="text-center py-4 text-xs text-slate-400">
                     แสดง 100 รายการแรกจาก {filteredData.length} รายการ
                   </div>
                 )}
               </div>
            </div>
          </>
        )}

      </main>

      {/* Asset Detail Modal */}
      <AssetDetailModal 
        asset={selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
      />
    </div>
  );
}

export default App;
