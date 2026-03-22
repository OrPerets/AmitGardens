'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, format, getDaysInMonth } from 'date-fns';
import { he } from 'date-fns/locale';
import AdminGuard from '@/components/AdminGuard';
import { useSearchParams } from 'next/navigation';
import { Calendar, MapPin, FileText, Clock, Users, BarChart3 } from 'lucide-react';

interface Assignment {
  date: string;
  address: string;
  notes: string;
}

export default function GardenerReportPage({
  params,
}: {
  params: { yyyymm: string; gardenerId: string };
}) {
  const yyyymmParam = params.yyyymm;
  const plan = yyyymmParam.includes('-')
    ? yyyymmParam
    : `${yyyymmParam.slice(0, 4)}-${yyyymmParam.slice(4, 6)}`;
  const gardenerId = params.gardenerId;
  const [title, setTitle] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const search = useSearchParams();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch(
        `/api/admin/report?plan=${plan}&g=${gardenerId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      if (res.ok) {
        const data = await res.json();
        setTitle(`${data.gardener.name} – ${plan}`);
        setAssignments(data.assignments);
        // If download flag present, generate a PDF automatically after render
        const shouldDownload = search.get('download') === '1';
        const useDirectPDF = search.get('method') === 'direct';
        
        if (shouldDownload) {
          setTimeout(async () => {
            try {
              if (useDirectPDF) {
                // Use direct PDF generation for better quality and control
                const { generateProfessionalPDF } = await import('@/lib/pdfGenerator');
                const pdf = await generateProfessionalPDF({
                  gardenerName: data.gardener.name,
                  monthTitle: calendar.title,
                  assignments,
                  stats
                });
                const computedTitle = `${plan}-${gardenerId}`;
                const safeTitle = computedTitle.replace(/[^\w\-א-ת ]+/g, '');
                pdf.save(`gardener-${safeTitle}-pro.pdf`);
                if (window.opener) setTimeout(() => window.close(), 300);
              } else {
                // Use HTML-to-canvas method for visual accuracy
                const [{ jsPDF }, html2canvasModule] = await Promise.all([
                  import('jspdf'),
                  import('html2canvas'),
                ]);
                const html2canvas = html2canvasModule.default;
                const el = containerRef.current;
                if (!el) return;
                const canvas = await html2canvas(el, {
                  scale: 2,
                  useCORS: true,
                  backgroundColor: '#ffffff',
                  windowWidth: el.scrollWidth,
                  windowHeight: el.scrollHeight,
                  logging: false,
                  allowTaint: true,
                  foreignObjectRendering: true,
                });
                canvas.toDataURL('image/png', 0.95);
                const pdf = new jsPDF({ 
                  orientation: 'portrait', 
                  unit: 'pt', 
                  format: 'a4',
                  compress: true 
                });
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pageWidth - 40; // Add margins
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                let currentHeight = imgHeight;
                let yOffset = 0;
                const pageContentHeight = pageHeight - 40; // Account for margins
                
                while (currentHeight > 0) {
                  const pageImgHeight = Math.min(currentHeight, pageContentHeight);
                  const canvasSection = document.createElement('canvas');
                  canvasSection.width = canvas.width;
                  canvasSection.height = (pageImgHeight / imgHeight) * canvas.height;
                  
                  const ctx = canvasSection.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(
                      canvas,
                      0, (yOffset / imgHeight) * canvas.height,
                      canvas.width, canvasSection.height,
                      0, 0,
                      canvas.width, canvasSection.height
                    );
                    
                    const sectionData = canvasSection.toDataURL('image/png', 0.95);
                    
                    if (yOffset > 0) pdf.addPage();
                    pdf.addImage(sectionData, 'PNG', 20, 20, imgWidth, pageImgHeight);
                  }
                  
                  currentHeight -= pageContentHeight;
                  yOffset += pageContentHeight;
                }
                
                const computedTitle = `${plan}-${gardenerId}`;
                const safeTitle = computedTitle.replace(/[^\w\-א-ת ]+/g, '');
                pdf.save(`gardener-${safeTitle}.pdf`);
                if (window.opener) setTimeout(() => window.close(), 300);
              }
            } catch (error) {
              console.error('PDF generation failed:', error);
              // fallback to print if something failed
              setTimeout(() => window.print(), 200);
            }
          }, 250);
        } else {
          // default: open print dialog
          setTimeout(() => window.print(), 200);
        }
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, gardenerId, search]);

  const calendar = useMemo(() => {
    const month = Number(plan.slice(5, 7));
    const year = Number(plan.slice(0, 4));
    const first = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
    const count = getDaysInMonth(first);
    const firstDay = first.getDay(); // Sunday=0
    const byDate: Record<string, Assignment[]> = {};
    
    for (const a of assignments) {
      (byDate[a.date] ||= []).push(a);
    }
    
    const cells: Array<{ key: string; d: Date; items: Assignment[] } | null> = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    
    for (let i = 0; i < count; i++) {
      const d = addDays(first, i);
      const key = format(d, 'yyyy-MM-dd');
      cells.push({ key, d, items: byDate[key] || [] });
    }
    
    while (cells.length % 7 !== 0) cells.push(null);
    const title = format(first, 'LLLL yyyy', { locale: he });
    
    return { cells, title };
  }, [assignments, plan]);

  const stats = useMemo(() => {
    const totalDays = assignments.length;
    const totalAddresses = new Set(assignments.map(a => a.address)).size;
    const withNotes = assignments.filter(a => a.notes).length;
    const busiest = assignments.reduce((acc, curr) => {
      acc[curr.date] = (acc[curr.date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const busiestDay = Object.entries(busiest)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalDays,
      totalAddresses, 
      withNotes,
      busiestDay: busiestDay ? {
        date: busiestDay[0],
        count: busiestDay[1]
      } : null
    };
  }, [assignments]);

  if (loading) return <div className="p-6 text-center">טוען...</div>;

  return (
    <AdminGuard>
      <div ref={containerRef} className="min-h-screen bg-white print:p-0">
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-white/20 p-3 rounded-full">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold print:text-xl">דו&quot;ח עבודה חודשי</h1>
                <p className="text-green-100 font-medium">{title || calendar.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-100 text-sm">תאריך הפקה</div>
              <div className="font-semibold">{format(new Date(), 'dd/MM/yyyy', { locale: he })}</div>
            </div>
          </div>
        </div>

        <div className="p-6 print:p-4">
          {/* Summary Statistics */}
          <div className="mb-6 print:mb-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <BarChart3 className="w-5 h-5 ml-2" />
              סיכום נתונים
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">ימי עבודה</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.totalDays}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">כתובות שונות</p>
                    <p className="text-2xl font-bold text-green-800">{stats.totalAddresses}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">עם הערות</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.withNotes}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">יום עמוס ביותר</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {stats.busiestDay?.count || 0}
                    </p>
                    {stats.busiestDay && (
                      <p className="text-xs text-orange-600 mt-1">
                        {format(new Date(stats.busiestDay.date), 'dd/MM', { locale: he })}
                      </p>
                    )}
                  </div>
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Calendar */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <Calendar className="w-5 h-5 ml-2" />
              לוח עבודה חודשי
            </h2>
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map(day => (
                <div key={day} className="bg-gray-100 p-2 text-center text-sm font-semibold text-gray-700 rounded-t">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendar.cells.map((cell, idx) => {
                if (!cell) {
                  return (
                    <div key={`blank-${idx}`} className="border border-gray-200 rounded p-2 min-h-[140px] bg-gray-50/50" />
                  );
                }
                
                const isWeekend = cell.d.getDay() === 0 || cell.d.getDay() === 6;
                const hasWork = cell.items.length > 0;
                
                return (
                  <div 
                    key={cell.key} 
                    className={`
                      calendar-cell border-2 rounded-lg p-3 min-h-[140px] break-inside-avoid transition-all page-break-inside-avoid
                      ${hasWork 
                        ? 'border-green-300 bg-green-50' 
                        : isWeekend 
                          ? 'border-gray-200 bg-gray-50' 
                          : 'border-gray-200 bg-white'
                      }
                      ${hasWork ? 'shadow-sm' : ''}
                    `}
                  >
                    {/* Date Header */}
                    <div className={`
                      flex items-center justify-between mb-2 pb-1 border-b
                      ${hasWork ? 'border-green-200' : 'border-gray-200'}
                    `}>
                      <div className={`
                        text-lg font-bold
                        ${hasWork ? 'text-green-800' : isWeekend ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        {format(cell.d, 'dd')}
                      </div>
                      {hasWork && (
                        <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {cell.items.length} משימות
                        </div>
                      )}
                    </div>

                    {/* Assignments */}
                    {cell.items.length === 0 ? (
                      <div className="text-xs text-gray-400 italic">אין משימות</div>
                    ) : (
                      <div className="space-y-2">
                        {cell.items.slice(0, 3).map((assignment, i) => (
                          <div key={i} className="bg-white rounded-md p-2 border border-green-200 shadow-sm">
                            <div className="flex items-start space-x-2 space-x-reverse">
                              <MapPin className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {assignment.address}
                                </p>
                                {assignment.notes && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {assignment.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {cell.items.length > 3 && (
                          <div className="text-xs text-green-600 font-medium text-center bg-green-100 rounded p-1">
                            +{cell.items.length - 3} משימות נוספות
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-center text-sm text-gray-500">
            <p>דו&quot;ח זה הופק אוטומטיקית על ידי מערכת ניהול הגננים</p>
            <p className="mt-1">נוצר ב: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: he })}</p>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
