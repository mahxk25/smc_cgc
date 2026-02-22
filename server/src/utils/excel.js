import ExcelJS from 'exceljs';

export async function buildStudentsWorkbook(rows, columns) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Students', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 15 }));
  ws.getRow(1).font = { bold: true };
  rows.forEach((r) => ws.addRow(r));
  return wb;
}

export async function buildEventRegistrationsWorkbook(rows, columns) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Registrations', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 18 }));
  ws.getRow(1).font = { bold: true };
  rows.forEach((r) => ws.addRow(r));
  return wb;
}

export async function writeWorkbookToBuffer(wb) {
  return await wb.xlsx.writeBuffer();
}
