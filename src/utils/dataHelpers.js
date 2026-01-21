export const parseCSV = (text) => {
  const rows = text.split('\n');
  const newData = [];
  
  // Start at i = 1 to skip Header Row
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue;
    
    // Regex Split to handle commas inside quotes
    const col = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const cleanCol = col.map(c => c.replace(/^"|"$/g, '').trim());

    if (cleanCol.length < 5) continue;
    
    const health = calculateHealthScore({
      memory: cleanCol[9],
      hdd1: cleanCol[12],
      os: cleanCol[5],
      hdd1Hours: parseInt(cleanCol[15]?.replace(/,/g, '')) || 0
    });

    newData.push({
      id: cleanCol[1] || '',
      user: cleanCol[26] || '',
      computerName: cleanCol[2] || '',
      type: cleanCol[4] || '',
      os: cleanCol[5] || '',
      cpu: cleanCol[7] || '',
      memory: cleanCol[9] || '',
      gpu: cleanCol[10] || '',
      hdd1: cleanCol[12] || '',
      hdd1Hours: parseInt(cleanCol[15]?.replace(/,/g, '')) || 0,
      hdd2: cleanCol[16] || '',
      hdd2Hours: parseInt(cleanCol[19]?.replace(/,/g, '')) || 0,
      totalDiskHours: parseInt(cleanCol[20]?.replace(/,/g, '')) || 0,
      dept: cleanCol[28]?.replace('\r', '').trim() || '',
      healthScore: health.score,
      healthGrade: health.grade,
      healthColor: health.color
    });
  }
  
  return newData.filter(item => item.id || item.computerName);
};

const calculateHealthScore = ({ memory, hdd1, os, hdd1Hours }) => {
  let score = 0;

  // 1. RAM Score (Max 30)
  const ramVal = parseInt(memory) || 0;
  if (ramVal >= 16) score += 30;
  else if (ramVal >= 8) score += 20;
  else score += 5;

  // 2. Disk Type Score (Max 40) - Check HDD1
  const diskType = (hdd1 || '').toLowerCase();
  if (diskType.includes('nvme') || diskType.includes('m.2')) score += 40;
  else if (diskType.includes('ssd')) score += 30;
  else score += 10; // HDD or others

  // 3. OS Score (Max 30)
  const osName = (os || '').toLowerCase();
  if (osName.includes('windows 11')) score += 30;
  else if (osName.includes('windows 10')) score += 20;
  
  // 4. Usage Penalty
  if (hdd1Hours > 43800) score -= 20;

  // Clamp score 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine Grade
  let grade = 'D';
  let color = 'text-red-500 bg-red-50 border-red-200';
  
  if (score >= 80) {
    grade = 'A';
    color = 'text-green-600 bg-green-50 border-green-200';
  } else if (score >= 60) {
    grade = 'B';
    color = 'text-blue-600 bg-blue-50 border-blue-200';
  } else if (score >= 40) {
    grade = 'C';
    color = 'text-orange-500 bg-orange-50 border-orange-200';
  }

  return { score, grade, color };
};

export const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
