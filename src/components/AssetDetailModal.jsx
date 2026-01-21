import React from 'react';
import { X, CheckCircle2, AlertCircle, Monitor, Cpu, HardDrive, User, Building, Activity, Calendar } from 'lucide-react';

const AssetDetailModal = ({ asset, onClose }) => {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
          <div className="pr-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
              <Monitor className="w-6 h-6 text-indigo-500" />
              {asset.computerName}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{asset.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Health Status Section */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${asset.healthColor}`}>
                {asset.healthGrade}
             </div>
             <div>
               <h3 className="font-semibold text-slate-800 dark:text-white">สถานะคุณภาพเครื่อง (Health Score)</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                 คะแนนประเมิน: <span className="font-bold text-slate-700 dark:text-slate-300">{asset.healthScore} / 100</span>
               </p>
               <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 w-48">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${asset.healthScore}%`, backgroundColor: asset.healthScore >= 80 ? '#22c55e' : asset.healthScore >= 60 ? '#3b82f6' : asset.healthScore >= 40 ? '#f97316' : '#ef4444' }}
                  ></div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* General Info */}
             <div className="space-y-4">
               <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">ข้อมูลผู้ใช้</h4>
               
               <div className="flex items-start gap-3">
                 <User className="w-5 h-5 text-slate-400 mt-0.5" />
                 <div>
                   <p className="text-xs text-slate-400">ผู้ใช้งาน (User)</p>
                   <p className="text-slate-700 dark:text-slate-200 font-medium">{asset.user}</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-3">
                 <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                 <div>
                   <p className="text-xs text-slate-400">กลุ่มงาน (Department)</p>
                   <p className="text-slate-700 dark:text-slate-200 font-medium">{asset.dept}</p>
                 </div>
               </div>

               
               <div className="flex items-start gap-3">
                 <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                 <div>
                   <p className="text-xs text-slate-400">อายุการใช้งาน (Age)</p>
                   <p className="text-slate-700 dark:text-slate-200 font-medium">{asset.age}</p>
                   <p className="text-xs text-slate-500">วันที่รับ: {asset.receivedDate || '-'}</p>
                 </div>
               </div>
             </div>

             {/* Hardware Spec */}
             <div className="space-y-4">
               <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">สเปกเครื่อง</h4>
               
               <div className="flex items-start gap-3">
                 <Cpu className="w-5 h-5 text-slate-400 mt-0.5" />
                 <div>
                   <p className="text-xs text-slate-400">CPU / OS</p>
                   <p className="text-slate-700 dark:text-slate-200 font-medium">{asset.cpu}</p>
                   <p className="text-sm text-slate-500">{asset.os}</p>
                 </div>
               </div>

               <div className="flex items-start gap-3">
                 <div className="w-5 h-5 flex items-center justify-center font-bold text-[10px] bg-slate-200 dark:bg-slate-700 rounded text-slate-500">RAM</div>
                 <div>
                   <p className="text-xs text-slate-400">Memory (RAM)</p>
                   <p className="text-slate-700 dark:text-slate-200 font-medium">{asset.memory} GB</p>
                 </div>
               </div>

                <div className="flex items-start gap-3">
                 <HardDrive className="w-5 h-5 text-slate-400 mt-0.5" />
                 <div>
                   <p className="text-xs text-slate-400">Storage (Disk 1)</p>
                   <p className="text-slate-700 dark:text-slate-200 font-medium">{asset.hdd1}</p>
                   <p className={`text-xs ${asset.hdd1Hours > 43800 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                     ใช้งาน: {(asset.hdd1Hours || 0).toLocaleString()} ชม.
                   </p>
                 </div>
               </div>
               
                {asset.hdd2 && asset.hdd2 !== '-' && (
                  <>
                    <div className="flex items-start gap-3">
                      <HardDrive className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400">Storage (Disk 2)</p>
                        <p className="text-slate-700 dark:text-slate-200 font-medium">{asset.hdd2}</p>
                        <p className={`text-xs ${asset.hdd2Hours > 43800 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                           ใช้งาน: {(asset.hdd2Hours || 0).toLocaleString()} ชม.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 mt-2">
                       <Activity className="w-5 h-5 text-indigo-500" />
                       <div className="flex-1">
                          <p className="text-xs text-slate-400">รวมชั่วโมงการทำงาน (Total Hours)</p>
                          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                             {asset.totalDiskHours ? asset.totalDiskHours.toLocaleString() : ((asset.hdd1Hours || 0) + (asset.hdd2Hours || 0)).toLocaleString()} ชม.
                          </p>
                       </div>
                    </div>
                  </>
                )}
             </div>
          </div>
          
          {/* Score Breakdown Section */}
        {asset.scoreBreakdown && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6 border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    รายละเอียดคะแนน (Score Breakdown)
                </h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-300">RAM ({asset.memory || 0} GB)</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-600 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-500">
                             + {asset.scoreBreakdown.ramScore}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-300">Disk Type ({asset.hdd1})</span>
                         <span className="font-mono font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-600 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-500">
                             + {asset.scoreBreakdown.diskScore}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-300">OS ({asset.os})</span>
                         <span className="font-mono font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-600 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-500">
                             + {asset.scoreBreakdown.osScore}
                        </span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-300">
                            Age Penalty 
                            <span className="text-xs text-slate-400 ml-1">
                                ({(asset.hdd1Hours || 0).toLocaleString()} hrs)
                            </span>
                        </span>
                        <span className={`font-mono font-medium px-2 py-0.5 rounded border ${
                            asset.scoreBreakdown.penalty < 0 
                            ? 'bg-red-50 text-red-600 border-red-200' 
                            : 'bg-green-50 text-green-600 border-green-200'
                        }`}>
                             {asset.scoreBreakdown.penalty}
                        </span>
                    </div>
                     <div className="border-t border-slate-200 dark:border-slate-600 mt-2 pt-2 flex justify-between items-center font-bold">
                        <span className="text-slate-800 dark:text-white">Total Score</span>
                        <span className={`text-lg ${
                            asset.healthScore >= 80 ? 'text-green-600' :
                            asset.healthScore >= 60 ? 'text-blue-600' :
                            asset.healthScore >= 40 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                            {asset.healthScore} / 100
                        </span>
                    </div>
                </div>
            </div>
        )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
             <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div>
                   <span className="block font-medium mb-1">Type:</span> 
                   {asset.type}
                </div>
                <div>
                   <span className="block font-medium mb-1">GPU:</span> 
                   {asset.gpu}
                </div>
             </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
             onClick={onClose}
             className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailModal;
