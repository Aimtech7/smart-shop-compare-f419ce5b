import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, CheckCircle, XCircle, Sparkles, Loader2, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { djangoSeller } from '@/services/django';
import { DJANGO_CONFIG } from '@/services/django/client';

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'name',          label: 'Product Name',   required: true,  eg: 'Apple MacBook Pro M3' },
  { key: 'make',          label: 'Make / Brand',   required: true,  eg: 'Apple' },
  { key: 'type',          label: 'Type',           required: true,  eg: 'Laptop' },
  { key: 'model',         label: 'Model',          required: true,  eg: 'MacBook Pro M3' },
  { key: 'category',      label: 'Category',       required: false, eg: 'Electronics' },
  { key: 'price',         label: 'Price (USD)',     required: true,  eg: '1299.99' },
  { key: 'stock_qty',     label: 'Stock Qty',      required: true,  eg: '50' },
  { key: 'delivery_days', label: 'Delivery Days',  required: false, eg: '3' },
  { key: 'SKU',           label: 'SKU',            required: false, eg: 'APL-LAP-MBP-M3-001' },
  { key: 'description',   label: 'Description',    required: false, eg: 'Powerful laptop with M3 chip...' },
  { key: 'specs',         label: 'Specs',          required: false, eg: '8GB RAM, 512GB SSD, 14 inch' },
];

// ── AI description generator ──────────────────────────────────────────────────
function aiDesc(make: string, type: string, model: string, specs: string): string {
  const s = specs ? `\n\nSpecs: ${specs}` : '';
  return `The ${make} ${model} is a premium ${type} built for performance and reliability. Designed for professionals and enthusiasts alike, it combines cutting-edge technology with exceptional build quality.${s}\n\nTrusted by customers worldwide, the ${model} delivers an outstanding experience in its class.`;
}

// ── Row interface ─────────────────────────────────────────────────────────────
interface Row {
  id: number;
  name: string; make: string; type: string; model: string;
  category: string; price: string; stock_qty: string;
  delivery_days: string; SKU: string; description: string; specs: string;
  _errors: string[]; _status: 'pending' | 'success' | 'error' | 'uploading';
}

function emptyRow(id: number): Row {
  return { id, name:'', make:'', type:'', model:'', category:'', price:'', stock_qty:'',
    delivery_days:'3', SKU:'', description:'', specs:'', _errors:[], _status:'pending' };
}

function validateRow(r: Row): string[] {
  const errs: string[] = [];
  if (!r.name.trim())      errs.push('Name required');
  if (!r.make.trim())      errs.push('Make required');
  if (!r.type.trim())      errs.push('Type required');
  if (!r.model.trim())     errs.push('Model required');
  if (!r.price || isNaN(Number(r.price)) || Number(r.price) <= 0) errs.push('Valid price required');
  if (!r.stock_qty || isNaN(Number(r.stock_qty))) errs.push('Valid stock required');
  return errs;
}

// ── Download CSV template ─────────────────────────────────────────────────────
function downloadTemplate() {
  const header = COLUMNS.map(c => c.label).join(',');
  const example = COLUMNS.map(c => `"${c.eg}"`).join(',');
  const instructions = COLUMNS.map(c => `"${c.required ? 'REQUIRED' : 'optional'}"`).join(',');
  const csv = [header, instructions, example].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'tha_buyer_bulk_template.csv'; a.click();
}

// ── Parse CSV ─────────────────────────────────────────────────────────────────
function parseCSV(text: string): Row[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase().replace(/ /g,'_').replace(/\(usd\)/,'').replace(/_usd/,'').trim());
  const colMap: Record<string, string> = {
    'product_name': 'name', 'make_/_brand': 'make', 'make/brand': 'make',
    'price_': 'price', 'stock_qty': 'stock_qty', 'delivery_days': 'delivery_days',
  };
  const normalised = headers.map(h => colMap[h] || h);

  return lines.slice(1).map((line, i) => {
    if (line.startsWith('"REQUIRED') || line.startsWith('"optional')) return null as any;
    const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || [];
    const clean = vals.map(v => v.replace(/^"|"$/g, '').trim());
    const r = emptyRow(i + 1);
    normalised.forEach((col, ci) => { if (col in r) (r as any)[col] = clean[ci] || ''; });
    r._errors = validateRow(r);
    r._status = r._errors.length > 0 ? 'error' : 'pending';
    return r;
  }).filter(Boolean);
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BulkUploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1|2|3>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{created:number; errors:any[]}>({ created:0, errors:[] });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) { toast.error('No valid rows found'); return; }
      setRows(parsed);
      setStep(2);
      toast.success(`Parsed ${parsed.length} rows`);
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const generateAI = (id: number) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const desc = aiDesc(r.make, r.type, r.model, r.specs);
      return { ...r, description: desc };
    }));
    toast.success('✨ Description generated');
  };

  const generateAllAI = () => {
    setRows(prev => prev.map(r => ({
      ...r,
      description: r.description || aiDesc(r.make, r.type, r.model, r.specs),
    })));
    toast.success('✨ All descriptions generated');
  };

  const updateCell = (id: number, key: string, val: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [key]: val };
      updated._errors = validateRow(updated);
      updated._status = updated._errors.length > 0 ? 'error' : 'pending';
      return updated;
    }));
  };

  const addRow = () => setRows(prev => [...prev, emptyRow(prev.length + 1)]);
  const removeRow = (id: number) => setRows(prev => prev.filter(r => r.id !== id));

  const submit = async () => {
    const invalid = rows.filter(r => r._errors.length > 0);
    if (invalid.length > 0) { toast.error(`Fix ${invalid.length} row(s) with errors first`); return; }
    setUploading(true);
    setStep(3);
    let created = 0; const errors: any[] = [];

    for (const row of rows) {
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, _status: 'uploading' } : r));
      try {
        const fd = new FormData();
        fd.append('name', `${row.make} ${row.model} ${row.type}`);
        fd.append('description', row.description || aiDesc(row.make, row.type, row.model, row.specs));
        fd.append('price', row.price);
        fd.append('stock_qty', row.stock_qty);
        fd.append('delivery_days', row.delivery_days || '3');
        fd.append('SKU', row.SKU || `${row.make.slice(0,3).toUpperCase()}-${row.type.slice(0,3).toUpperCase()}-${Date.now()}`);
        await djangoSeller.createProduct(fd);
        created++;
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, _status: 'success' } : r));
        await new Promise(r => setTimeout(r, 120));
      } catch (e: any) {
        errors.push({ row: row.id, error: e?.message || 'Failed' });
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, _status: 'error' } : r));
      }
    }
    setResults({ created, errors });
    setUploading(false);
    if (created > 0) toast.success(`${created} product(s) uploaded!`);
    if (errors.length > 0) toast.error(`${errors.length} failed`);
  };

  const validCount = rows.filter(r => r._errors.length === 0).length;
  const errorCount = rows.filter(r => r._errors.length > 0).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container-main flex items-center gap-4 py-4">
          <button onClick={() => navigate('/seller')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold">Bulk Product Upload</h1>
            <p className="text-xs text-muted-foreground">Upload multiple products at once via CSV</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {/* Step indicators */}
            {[1,2,3].map(s => (
              <div key={s} className={`flex items-center gap-2 text-xs font-medium ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step > s ? 'bg-primary border-primary text-primary-foreground' : step === s ? 'border-primary text-primary' : 'border-border'}`}>
                  {step > s ? '✓' : s}
                </div>
                {['Template', 'Preview & Edit', 'Submit'][s-1]}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-main py-8 max-w-6xl">

        {/* STEP 1 — Template */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Column reference */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Required Columns</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Download the template to get started</p>
                </div>
                <button onClick={downloadTemplate}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  <Download className="w-4 h-4" /> Download CSV Template
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      {['Column', 'Required', 'Example Value', 'Notes'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {COLUMNS.map(c => (
                      <tr key={c.key} className="hover:bg-secondary/30">
                        <td className="px-5 py-3 font-mono text-xs font-semibold">{c.label}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.required ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-secondary text-muted-foreground'}`}>
                            {c.required ? 'Required' : 'Optional'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{c.eg}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {c.key === 'SKU' && 'Auto-generated if blank'}
                          {c.key === 'description' && 'AI can generate this for you'}
                          {c.key === 'delivery_days' && 'Defaults to 3 days'}
                          {c.key === 'specs' && 'e.g. 8GB RAM, 512GB SSD'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upload zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-secondary/30'}`}
            >
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-semibold text-lg mb-1">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">or click to browse · CSV files only</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            <div className="text-center">
              <button onClick={() => { setRows(Array.from({length:3}, (_,i) => emptyRow(i+1))); setStep(2); }}
                className="text-sm text-muted-foreground hover:text-foreground underline transition-colors">
                Skip template — enter products manually →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Preview & Edit */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-3">
              <div className="flex items-center gap-6 text-sm">
                <span className="text-muted-foreground">{rows.length} rows</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />{validCount} valid
                </span>
                {errorCount > 0 && (
                  <span className="text-red-500 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />{errorCount} errors
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={generateAllAI}
                  className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" /> AI Fill All Descriptions
                </button>
                <button onClick={addRow}
                  className="text-xs font-medium text-primary border border-border px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors">
                  + Add Row
                </button>
                <button onClick={() => rows.filter(r => r._errors.length === 0).length > 0 && submit()}
                  disabled={validCount === 0}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                  <Upload className="w-3.5 h-3.5" /> Upload {validCount} Products
                </button>
              </div>
            </div>

            {/* Editable rows */}
            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div key={row.id} className={`bg-card border rounded-2xl p-5 transition-all ${row._errors.length > 0 ? 'border-red-300 dark:border-red-800' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Row {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => generateAI(row.id)}
                        className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity">
                        <Sparkles className="w-3 h-3" /> AI Desc
                      </button>
                      <button onClick={() => removeRow(row.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors">✕ Remove</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['name','make','type','model','category','price','stock_qty','delivery_days','SKU'].map(key => {
                      const col = COLUMNS.find(c => c.key === key)!;
                      return (
                        <div key={key} className={key === 'name' ? 'md:col-span-2' : ''}>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">
                            {col?.label || key} {col?.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            value={(row as any)[key]}
                            onChange={e => updateCell(row.id, key, e.target.value)}
                            placeholder={col?.eg || ''}
                            className="w-full text-sm border border-input rounded-lg px-2.5 py-1.5 bg-background outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      );
                    })}
                    <div className="md:col-span-4">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={row.description}
                        onChange={e => updateCell(row.id, 'description', e.target.value)}
                        placeholder="Product description (or use AI)"
                        className="w-full text-sm border border-input rounded-lg px-2.5 py-1.5 bg-background outline-none focus:border-primary transition-colors resize-none"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Specs (optional)</label>
                      <input
                        value={row.specs}
                        onChange={e => updateCell(row.id, 'specs', e.target.value)}
                        placeholder="e.g. 8GB RAM, 512GB SSD, 14 inch"
                        className="w-full text-sm border border-input rounded-lg px-2.5 py-1.5 bg-background outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {row._errors.length > 0 && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-red-500">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {row._errors.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Results */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <CheckCircle className="w-6 h-6 text-emerald-500" />}
                <div>
                  <h2 className="font-semibold">{uploading ? 'Uploading…' : 'Upload Complete'}</h2>
                  <p className="text-sm text-muted-foreground">{results.created} created · {results.errors.length} failed</p>
                </div>
              </div>

              {/* Progress per row */}
              <div className="space-y-2">
                {rows.map((row, i) => (
                  <div key={row.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-6 shrink-0">
                      {row._status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      {row._status === 'success'   && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {row._status === 'error'     && <XCircle className="w-4 h-4 text-red-500" />}
                      {row._status === 'pending'   && <div className="w-4 h-4 rounded-full border-2 border-border" />}
                    </div>
                    <span className="text-sm flex-1">{row.make} {row.model} {row.type}</span>
                    <span className="text-xs text-muted-foreground">Row {i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            {!uploading && (
              <div className="flex gap-3">
                <button onClick={() => navigate('/seller')}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
                  Back to Dashboard
                </button>
                <button onClick={() => { setStep(1); setRows([]); setResults({created:0, errors:[]}); }}
                  className="flex-1 border border-border py-3 rounded-xl font-medium hover:bg-secondary transition-colors">
                  Upload More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
