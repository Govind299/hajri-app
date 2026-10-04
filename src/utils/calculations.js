// Calculations for attendance, earnings, advances, and net balance

export const calculateWorkerFinancials = (worker, attendanceRecords = [], transactions = []) => {
  const workerAttendance = attendanceRecords.filter((a) => a.workerId === worker.id);
  const workerTx = transactions.filter((t) => t.workerId === worker.id);

  let presentCount = 0;
  let halfDayCount = 0;
  let absentCount = 0;
  let totalOtHours = 0;

  workerAttendance.forEach((record) => {
    if (record.status === "present") presentCount += 1;
    else if (record.status === "halfDay") halfDayCount += 1;
    else if (record.status === "absent") absentCount += 1;

    if (record.otHours) {
      totalOtHours += Number(record.otHours) || 0;
    }
  });

  const dailyRate = Number(worker.rate) || 0;
  const otRate = Number(worker.hourlyOtRate) || Math.round(dailyRate / 8);

  const baseWage = presentCount * dailyRate + halfDayCount * (dailyRate / 2);
  const otWage = totalOtHours * otRate;
  const totalEarned = Math.round(baseWage + otWage);

  let totalAdvance = 0;
  let totalSettled = 0;

  workerTx.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === "advance") {
      totalAdvance += amt;
    } else if (tx.type === "settlement") {
      totalSettled += amt;
    }
  });

  // Net Balance Payable (बाकी बकाया)
  const balanceDue = Math.max(0, totalEarned - totalAdvance - totalSettled);

  return {
    presentCount,
    halfDayCount,
    absentCount,
    totalOtHours,
    baseWage,
    otWage,
    totalEarned,
    totalAdvance,
    totalSettled,
    balanceDue
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const getSiteMetrics = (workers = [], attendance = [], transactions = [], dateStr, siteId) => {
  const activeWorkers = workers.filter((w) => (siteId === "all" ? true : w.siteId === siteId) && w.isActive);
  const activeWorkerIds = new Set(activeWorkers.map((w) => w.id));

  const todayAttendance = attendance.filter((a) => a.date === dateStr && activeWorkerIds.has(a.workerId));

  let presentToday = 0;
  let halfDayToday = 0;
  let absentToday = 0;
  let totalWageToday = 0;

  todayAttendance.forEach((rec) => {
    const worker = activeWorkers.find((w) => w.id === rec.workerId);
    if (!worker) return;

    const rate = Number(worker.rate) || 0;
    const otRate = Number(worker.hourlyOtRate) || Math.round(rate / 8);

    if (rec.status === "present") {
      presentToday++;
      totalWageToday += rate;
    } else if (rec.status === "halfDay") {
      halfDayToday++;
      totalWageToday += rate / 2;
    } else if (rec.status === "absent") {
      absentToday++;
    }

    if (rec.otHours) {
      totalWageToday += Number(rec.otHours) * otRate;
    }
  });

  // Calculate total pending balance across all active workers in this site
  let totalPendingBalance = 0;
  activeWorkers.forEach((w) => {
    const fin = calculateWorkerFinancials(w, attendance, transactions);
    totalPendingBalance += fin.balanceDue;
  });

  return {
    totalWorkers: activeWorkers.length,
    presentToday,
    halfDayToday,
    absentToday,
    markedCount: todayAttendance.length,
    unmarkedCount: Math.max(0, activeWorkers.length - todayAttendance.length),
    totalWageToday: Math.round(totalWageToday),
    totalPendingBalance: Math.round(totalPendingBalance)
  };
};
