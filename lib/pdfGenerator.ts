import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Assignment {
  date: string;
  address: string;
  notes: string;
}

interface PDFOptions {
  gardenerName: string;
  monthTitle: string;
  assignments: Assignment[];
  stats: {
    totalDays: number;
    totalAddresses: number;
    withNotes: number;
    busiestDay: { date: string; count: number } | null;
  };
}

export async function generateProfessionalPDF(options: PDFOptions): Promise<jsPDF> {
  const { gardenerName, monthTitle, assignments, stats } = options;
  
  // Create PDF with better settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;

  // Helper function to add text with RTL support
  const addRTLText = (text: string, x: number, y: number, options: { style?: string; fontSize?: number; align?: string } = {}) => {
    pdf.setFont('helvetica', options.style || 'normal');
    pdf.setFontSize(options.fontSize || 12);
    
    if (options.align === 'center') {
      pdf.text(text, pageWidth / 2, y, { align: 'center' });
    } else if (options.align === 'right') {
      pdf.text(text, pageWidth - margin, y, { align: 'right' });
    } else {
      pdf.text(text, x, y);
    }
  };

  // Header with gradient effect (simulated with rectangles)
  pdf.setFillColor(34, 197, 94); // Green-500
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  // Header content
  pdf.setTextColor(255, 255, 255);
  addRTLText('דו"ח עבודה חודשי', pageWidth / 2, 15, { 
    fontSize: 20, 
    style: 'bold', 
    align: 'center' 
  });
  addRTLText(`${gardenerName} - ${monthTitle}`, pageWidth / 2, 25, { 
    fontSize: 14, 
    align: 'center' 
  });
  addRTLText(`תאריך הפקה: ${format(new Date(), 'dd/MM/yyyy', { locale: he })}`, 
    pageWidth - margin, 35, { 
    fontSize: 10, 
    align: 'right' 
  });

  yPosition = 55;

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // Statistics section
  addRTLText('סיכום נתונים', margin, yPosition, { 
    fontSize: 16, 
    style: 'bold' 
  });
  yPosition += 10;

  // Stats boxes (simulated)
  const statBoxes = [
    { label: 'ימי עבודה', value: stats.totalDays.toString(), color: [59, 130, 246] }, // blue
    { label: 'כתובות שונות', value: stats.totalAddresses.toString(), color: [34, 197, 94] }, // green  
    { label: 'עם הערות', value: stats.withNotes.toString(), color: [168, 85, 247] }, // purple
    { label: 'יום עמוס ביותר', value: stats.busiestDay?.count.toString() || '0', color: [249, 115, 22] } // orange
  ];

  const boxWidth = contentWidth / 4 - 5;
  let xPos = margin;

  statBoxes.forEach((stat) => {
    // Draw box
    pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2], 0.1);
    pdf.rect(xPos, yPosition, boxWidth, 20, 'F');
    
    // Draw left border
    pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    pdf.rect(xPos, yPosition, 2, 20, 'F');
    
    // Add text
    pdf.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    addRTLText(stat.label, xPos + boxWidth - 5, yPosition + 8, { 
      fontSize: 9, 
      align: 'right' 
    });
    addRTLText(stat.value, xPos + boxWidth - 5, yPosition + 16, { 
      fontSize: 14, 
      style: 'bold', 
      align: 'right' 
    });
    
    xPos += boxWidth + 5;
  });

  yPosition += 35;
  pdf.setTextColor(0, 0, 0);

  // Calendar section
  addRTLText('לוח עבודה חודשי', margin, yPosition, { 
    fontSize: 16, 
    style: 'bold' 
  });
  yPosition += 15;

  // Calendar grid
  const cellWidth = contentWidth / 7;
  const cellHeight = 25;
  
  // Days of week header
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  
  daysOfWeek.forEach((day, index) => {
    const x = margin + (index * cellWidth);
    pdf.setFillColor(243, 244, 246); // gray-100
    pdf.rect(x, yPosition, cellWidth, 8, 'F');
    pdf.setTextColor(55, 65, 81); // gray-700
    addRTLText(day, x + cellWidth / 2, yPosition + 6, { 
      fontSize: 9, 
      style: 'bold', 
      align: 'center' 
    });
  });
  
  yPosition += 8;

  // Process calendar data (simplified for PDF)
  const month = Number(monthTitle.split(' ')[0] === 'ינואר' ? 1 : 
                     monthTitle.split(' ')[0] === 'פברואר' ? 2 :
                     monthTitle.split(' ')[0] === 'מרץ' ? 3 : 1); // simplified - would need proper month parsing
  
  const year = Number(monthTitle.split(' ')[1]);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Group assignments by date
  const byDate: Record<string, Assignment[]> = {};
  assignments.forEach(a => {
    (byDate[a.date] ||= []).push(a);
  });

  // Draw calendar cells
  let currentWeek = 0;
  let dayOfWeek = firstDay;
  
  for (let day = 1; day <= daysInMonth; day++) {
    if (dayOfWeek === 7) {
      dayOfWeek = 0;
      currentWeek++;
    }
    
    const x = margin + (dayOfWeek * cellWidth);
    const y = yPosition + (currentWeek * cellHeight);
    
    // Check if we need a new page
    if (y + cellHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      currentWeek = 0;
    }
    
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAssignments = byDate[dateKey] || [];
    const hasWork = dayAssignments.length > 0;
    
    // Draw cell
    if (hasWork) {
      pdf.setFillColor(240, 253, 244); // green-50
      pdf.rect(x, y, cellWidth, cellHeight, 'F');
      pdf.setDrawColor(34, 197, 94); // green-500
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235); // gray-200
    }
    
    pdf.rect(x, y, cellWidth, cellHeight, 'D');
    
    // Add day number
    pdf.setTextColor(hasWork ? 34 : (dayOfWeek === 0 || dayOfWeek === 6 ? 156 : 75), 
                     hasWork ? 197 : (dayOfWeek === 0 || dayOfWeek === 6 ? 163 : 85), 
                     hasWork ? 94 : (dayOfWeek === 0 || dayOfWeek === 6 ? 175 : 99));
    addRTLText(day.toString(), x + 3, y + 8, { 
      fontSize: 10, 
      style: 'bold' 
    });
    
    // Add assignment count if any
    if (hasWork) {
      pdf.setFillColor(34, 197, 94);
      pdf.circle(x + cellWidth - 8, y + 8, 4, 'F');
      pdf.setTextColor(255, 255, 255);
      addRTLText(dayAssignments.length.toString(), x + cellWidth - 8, y + 10, { 
        fontSize: 8, 
        align: 'center' 
      });
    }
    
    // Add first assignment address if space allows
    if (hasWork && cellHeight > 15) {
      pdf.setTextColor(75, 85, 99);
      const address = dayAssignments[0].address;
      const truncated = address.length > 15 ? address.substring(0, 15) + '...' : address;
      addRTLText(truncated, x + cellWidth - 2, y + 18, { 
        fontSize: 7, 
        align: 'right' 
      });
    }
    
    dayOfWeek++;
  }
  
  // Footer
  const finalY = Math.max(yPosition + ((currentWeek + 1) * cellHeight) + 20, pageHeight - 30);
  pdf.setDrawColor(229, 231, 235);
  pdf.line(margin, finalY - 10, pageWidth - margin, finalY - 10);
  
  pdf.setTextColor(107, 114, 128);
  addRTLText('דו"ח זה הופק אוטומטיקית על ידי מערכת ניהול הגננים', 
    pageWidth / 2, finalY - 5, { 
    fontSize: 9, 
    align: 'center' 
  });
  addRTLText(`נוצר ב: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: he })}`, 
    pageWidth / 2, finalY + 2, { 
    fontSize: 8, 
    align: 'center' 
  });

  return pdf;
}
