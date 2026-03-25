import ExcelJS from 'exceljs';

/** Format a value for Excel: null/undefined -> '', dates -> ISO string, BigInt -> Number */
function clean(val) {
  if (val == null) return '';
  if (typeof val === 'bigint') return Number(val);
  if (val instanceof Date) return val.toISOString();
  return val;
}

function addSheet(wb, sheetName, columns, rows, options = {}) {
  const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }], ...options });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 16 }));
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  rows.forEach((r) => ws.addRow(r));
  return ws;
}

export async function buildStudentsWorkbook(rows, columns) {
  const wb = new ExcelJS.Workbook();
  const cleaned = rows.map((r) => {
    const out = {};
    columns.forEach((c) => { out[c.key] = clean(r[c.key]); });
    return out;
  });
  addSheet(wb, 'Students', columns, cleaned);
  return wb;
}

export async function buildEventRegistrationsWorkbook(rows, columns) {
  const wb = new ExcelJS.Workbook();
  const cleaned = rows.map((r) => {
    const out = {};
    columns.forEach((c) => { out[c.key] = clean(r[c.key]); });
    return out;
  });
  addSheet(wb, 'Registrations', columns, cleaned);
  return wb;
}

/** Single-sheet workbook from columns + rows (keys must match column keys) */
export async function buildGenericWorkbook(sheetName, columns, rows) {
  const wb = new ExcelJS.Workbook();
  const cleaned = rows.map((r) => {
    const out = {};
    columns.forEach((c) => { out[c.key] = clean(r[c.key]); });
    return out;
  });
  addSheet(wb, sheetName, columns, cleaned);
  return wb;
}

export async function buildCompaniesWorkbook(rows) {
  const columns = [
    { header: 'Name', key: 'name', width: 28 },
    { header: 'Industry', key: 'industry', width: 18 },
    { header: 'Contact Person', key: 'contactPerson', width: 22 },
    { header: 'Contact Email', key: 'contactEmail', width: 28 },
    { header: 'Contact Phone', key: 'contactPhone', width: 16 },
    { header: 'Salary Package', key: 'salaryPackage', width: 14 },
    { header: 'Job Description', key: 'jobDescription', width: 40 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];
  return buildGenericWorkbook('Companies', columns, rows);
}

export async function buildDrivesWorkbook(rows) {
  const columns = [
    { header: 'Company', key: 'companyName', width: 26 },
    { header: 'Role', key: 'role', width: 24 },
    { header: 'CTC', key: 'ctc', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Eligibility', key: 'eligibility', width: 36 },
    { header: 'Deadline', key: 'deadline', width: 20 },
    { header: 'Timeline Start', key: 'timelineStart', width: 20 },
    { header: 'Timeline End', key: 'timelineEnd', width: 20 },
  ];
  return buildGenericWorkbook('Drives', columns, rows);
}

export async function buildPlacementReportWorkbook(data) {
  const wb = new ExcelJS.Workbook();
  const totals = data.totals || {};
  const byDept = data.byDepartment || [];
  const byCompany = data.byCompany || [];
  const placedStudents = data.placedStudents || [];

  // Sheet 1: Summary
  const summaryRows = [
    { metric: 'Total Students', value: clean(totals.totalStudents) },
    { metric: 'Placed', value: clean(totals.placed) },
  ];
  addSheet(wb, 'Summary', [
    { header: 'Metric', key: 'metric', width: 22 },
    { header: 'Value', key: 'value', width: 14 },
  ], summaryRows);

  // Sheet 2: By Department
  const deptRows = byDept.map((r) => ({
    department: r.department ?? '',
    placed: clean(r.placed),
    total: clean(r.total),
  }));
  addSheet(wb, 'By Department', [
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Placed', key: 'placed', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
  ], deptRows);

  // Sheet 3: By Company
  const companyRows = byCompany.map((r) => ({
    companyName: r.companyName ?? '',
    role: r.role ?? '',
    selectedCount: clean(r.selectedCount),
  }));
  addSheet(wb, 'By Company', [
    { header: 'Company', key: 'companyName', width: 28 },
    { header: 'Role', key: 'role', width: 24 },
    { header: 'Selected', key: 'selectedCount', width: 12 },
  ], companyRows);

  // Sheet 4: Placed Students (detailed)
  const placedRows = placedStudents.map((r) => ({
    deptNo: r.deptNo ?? '',
    studentName: r.studentName ?? '',
    department: r.department ?? '',
    cgpa: clean(r.cgpa),
    email: r.email ?? '',
    phone: r.phone ?? '',
    companyName: r.companyName ?? '',
    companyIndustry: r.companyIndustry ?? '',
    companySalaryPackage: r.companySalaryPackage ?? '',
    driveRole: r.driveRole ?? '',
    driveCtc: r.driveCtc ?? '',
    driveStatus: r.driveStatus ?? '',
    roundsConducted: clean(r.roundsConducted),
    roundNames: r.roundNames ?? '',
    applicationStatus: r.applicationStatus ?? '',
    currentRoundNumber: clean(r.currentRoundNumber),
    appliedAt: clean(r.appliedAt),
    statusUpdatedAt: clean(r.statusUpdatedAt),
    offerDecision: r.offerDecision ?? '',
    offerDeadline: clean(r.offerDeadline),
    offerPdfPath: r.offerPdfPath ?? '',
  }));
  addSheet(wb, 'Placed Students', [
    { header: 'Dept No', key: 'deptNo', width: 16 },
    { header: 'Student Name', key: 'studentName', width: 22 },
    { header: 'Department', key: 'department', width: 14 },
    { header: 'CGPA', key: 'cgpa', width: 8 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Phone', key: 'phone', width: 14 },
    { header: 'Company', key: 'companyName', width: 24 },
    { header: 'Industry', key: 'companyIndustry', width: 16 },
    { header: 'Salary Package (Company)', key: 'companySalaryPackage', width: 18 },
    { header: 'Role', key: 'driveRole', width: 20 },
    { header: 'CTC (Drive)', key: 'driveCtc', width: 12 },
    { header: 'Drive Status', key: 'driveStatus', width: 12 },
    { header: 'Rounds Conducted', key: 'roundsConducted', width: 16 },
    { header: 'Round Names', key: 'roundNames', width: 40 },
    { header: 'Application Status', key: 'applicationStatus', width: 16 },
    { header: 'Current Round #', key: 'currentRoundNumber', width: 14 },
    { header: 'Applied At', key: 'appliedAt', width: 20 },
    { header: 'Status Updated At', key: 'statusUpdatedAt', width: 20 },
    { header: 'Offer Decision', key: 'offerDecision', width: 14 },
    { header: 'Offer Deadline', key: 'offerDeadline', width: 20 },
    { header: 'Offer PDF', key: 'offerPdfPath', width: 22 },
  ], placedRows);

  return wb;
}

export async function writeWorkbookToBuffer(wb) {
  return await wb.xlsx.writeBuffer();
}
