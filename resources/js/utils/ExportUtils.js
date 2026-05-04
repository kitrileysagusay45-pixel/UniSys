import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * UniSys Centralized Export Utility
 * Handles professional Excel generation with university branding and styling.
 */
export const exportToExcel = async ({ 
  filename = 'UniSys_Report', 
  title = 'Academic Report', 
  headers = [], 
  data = [],
  academicYear = 'AY 2025-2026',
  semester = '1st Semester'
}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // 1. Add University Header
  worksheet.mergeCells('A1:H1');
  const universityTitle = worksheet.getCell('A1');
  universityTitle.value = 'UNISYS — UNIVERSITY STUDENT INFORMATION SYSTEM';
  universityTitle.font = { name: 'Arial Black', size: 16, color: { argb: 'FF1E293B' } };
  universityTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:H2');
  const reportSubTitle = worksheet.getCell('A2');
  reportSubTitle.value = `${title.toUpperCase()}`;
  reportSubTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF475569' } };
  reportSubTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A3:H3');
  const academicInfo = worksheet.getCell('A3');
  academicInfo.value = `${academicYear} | ${semester}`;
  academicInfo.font = { name: 'Arial', size: 10, italic: true };
  academicInfo.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]); // Spacer

  // 2. Add Table Headers
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' } // Indigo Primary
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // 3. Add Data Rows
  data.forEach(item => {
    const rowValues = headers.map(h => {
      // Map header name to data key (flexible approach)
      const key = h.toLowerCase().replace(/ /g, '_');
      return item[key] !== undefined ? item[key] : '—';
    });
    const row = worksheet.addRow(rowValues);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle' };
    });
  });

  // 4. Auto-fit columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength < 12 ? 12 : maxLength + 2;
  });

  // 5. Generate and Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Specialized Student Report Export
 */
export const exportStudentReport = (students, academicYear) => {
  const headers = ['Student ID', 'Full Name', 'Department', 'Section', 'Year Level', 'Status', 'GWA'];
  const data = students.map(s => ({
    student_id: s.student_id,
    full_name: `${s.first_name} ${s.last_name}`,
    department: s.department,
    section: s.section,
    year_level: s.year_level,
    status: s.status,
    gwa: s.gwa || 'N/A'
  }));
  
  exportToExcel({ 
    filename: 'UniSys_Student_Masterlist', 
    title: 'Institutional Student Masterlist', 
    headers, 
    data,
    academicYear 
  });
};

/**
 * Specialized Faculty Report Export
 */
export const exportFacultyReport = (faculty, academicYear) => {
  const headers = ['Employee ID', 'Full Name', 'Department', 'Position', 'Status', 'Email'];
  const data = faculty.map(f => ({
    employee_id: f.faculty_id,
    full_name: `${f.first_name} ${f.last_name}`,
    department: f.department,
    position: f.position || 'Instructor',
    status: f.status,
    email: f.email
  }));
  
  exportToExcel({ 
    filename: 'UniSys_Faculty_Directory', 
    title: 'Institutional Faculty Directory', 
    headers, 
    data,
    academicYear 
  });
};

/**
 * Specialized Grade Report Export
 */
export const exportGradeReport = (studentName, grades, academicYear) => {
  const headers = ['Code', 'Subject Title', 'Semester', 'Year', 'Units', 'Prelim', 'Midterm', 'Finals', 'Final Grade', 'Remarks'];
  const data = grades.map(g => ({
    code: g.subject_code || (g.subject ? g.subject.code : (g.code || '—')),
    subject_title: g.subject_name || (g.subject ? g.subject.name : (g.name || '—')),
    semester: g.semester || '—',
    year: g.academic_year || academicYear || '—',
    units: g.subject?.units || g.units || 3,
    prelim: g.prelim || '—',
    midterm: g.midterm || g.midterm_grade || '—',
    finals: g.finals || g.final_grade || '—',
    final_grade: g.final_grade || g.overall_grade || '—',
    remarks: (g.remarks || (parseFloat(g.final_grade || g.overall_grade) <= 3.0 ? 'PASSED' : 'FAILED')).toUpperCase()
  }));

  exportToExcel({ 
    filename: `Grades_${studentName.replace(/ /g, '_')}`, 
    title: `Academic Performance Report: ${studentName}`, 
    headers, 
    data,
    academicYear 
  });
};
