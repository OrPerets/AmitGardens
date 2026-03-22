'use client';

import { useState, useCallback, useMemo } from 'react';

export interface BulkRow {
  date: string;
  address: string;
  notes?: string;
}

export default function BulkPasteDialog({
  onConfirm,
}: {
  onConfirm: (rows: BulkRow[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Real-time preview of parsed data
  const previewRows = useMemo(() => {
    if (!text.trim()) return [];
    
    const rows: BulkRow[] = [];
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    
    lines.slice(0, 5).forEach((line) => { // Show max 5 preview items
      const parts = line.split(/[|,\t]/).map((s) => s.trim());
      const [date, address, notes] = parts;
      
      if (date && address) {
        rows.push({ 
          date, 
          address, 
          notes: notes || undefined 
        });
      }
    });
    
    return rows;
  }, [text]);

  const totalRows = useMemo(() => {
    if (!text.trim()) return 0;
    return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).length;
  }, [text]);

  const parse = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      const rows: BulkRow[] = [];
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      
      lines.forEach((line) => {
        const parts = line.split(/[|,\t]/).map((s) => s.trim());
        const [date, address, notes] = parts;
        
        if (date && address) {
          rows.push({ 
            date, 
            address, 
            notes: notes || undefined 
          });
        }
      });
      
      if (rows.length) {
        // Add haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 100]);
        }
        
        onConfirm(rows);
        setText('');
        setOpen(false);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [text, onConfirm]);

  const handlePasteExample = useCallback(() => {
    const example = `2024-01-15|רחוב הנשיא 12, תל אביב|בוקר מוקדם
2024-01-16|כיכר רבין 5, תל אביב
2024-01-17|שדרות רוטשילד 100, תל אביב|ערב מאוחר`;
    setText(example);
  }, []);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-secondary"
        aria-label="פתח חלון הדבקה מרשימה"
      >
        📋 הדבקה מרשימה
      </button>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className="card-elevated w-full max-w-lg animate-slide-up">
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-2 sm:hidden">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>
        
        <div className="card-header flex items-center gap-2">
          <span>📋</span>
          <span className="text-hebrew">הדבקה מרשימה</span>
        </div>
        
        <div className="card-body space-y-4">
          {/* Instructions */}
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
            <p className="font-medium mb-1 text-hebrew">פורמט נתונים:</p>
            <p className="text-xs text-hebrew">
              תאריך|כתובת|הערות (כל רשומה בשורה נפרדת)
            </p>
            <p className="text-xs mt-1">
              ניתן להפריד גם באמצעות פסיק או Tab
            </p>
            
            <button
              type="button"
              onClick={handlePasteExample}
              className="text-xs text-primary hover:underline mt-2 text-hebrew"
            >
              📄 הדבק דוגמה
            </button>
          </div>
          
          {/* Text area */}
          <div className="space-y-2">
            <label htmlFor="bulk-textarea" className="label text-hebrew">
              נתונים להדבקה
            </label>
            <textarea
              id="bulk-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 sm:h-40 input text-sm"
              placeholder="הדבק כאן את הנתונים שלך..."
              dir="rtl"
              disabled={isProcessing}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{totalRows} שורות</span>
              <span>{text.length} תווים</span>
            </div>
          </div>
          
          {/* Preview */}
          {previewRows.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <p className="label text-hebrew">תצוגה מקדימה:</p>
              <div className="bg-muted/30 rounded-xl p-3 max-h-24 overflow-y-auto">
                {previewRows.map((row, idx) => (
                  <div key={idx} className="text-xs py-1 text-hebrew">
                    <span className="font-medium">{row.date}</span>
                    <span className="mx-2">←</span>
                    <span>{row.address}</span>
                    {row.notes && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-muted-foreground">{row.notes}</span>
                      </>
                    )}
                  </div>
                ))}
                {totalRows > 5 && (
                  <div className="text-xs text-muted-foreground pt-1 border-t mt-2">
                    ועוד {totalRows - 5} שורות...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              className={`btn btn-primary flex-1 ${isProcessing || previewRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={parse}
              disabled={isProcessing || previewRows.length === 0}
            >
              {isProcessing ? '🔄 מעבד...' : `✅ הדבק ${previewRows.length} רשומות`}
            </button>
            <button
              type="button"
              className="btn btn-ghost sm:px-6"
              onClick={() => {
                setText('');
                setOpen(false);
              }}
              disabled={isProcessing}
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
