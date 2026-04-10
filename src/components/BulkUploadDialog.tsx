import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { generateProductCode, resetCodeCounter } from '@/lib/productCode';

interface ParsedRow {
  row: number;
  name: string;
  description: string;
  price: string;
  category: string;
  make: string;
  type: string;
  model: string;
  specs: string;
  stock: string;
  generatedCode: string;
  errors: string[];
}

export function BulkUploadDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validateRow = (row: string[], index: number): ParsedRow => {
    const [name, description, price, category, make, type, model, specs, stock] = row;
    const errors: string[] = [];
    if (!name || name.length < 2) errors.push('Name required');
    if (!description || description.length < 10) errors.push('Description too short');
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errors.push('Invalid price');
    if (!category) errors.push('Category required');
    if (!make) errors.push('Make/Brand required');
    if (!type) errors.push('Type required');
    if (!model) errors.push('Model required');
    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) errors.push('Invalid stock');

    let generatedCode = '';
    if (errors.length === 0) {
      generatedCode = generateProductCode({ category, make, type, model, specs: specs || '' });
    }

    return {
      row: index + 2, name: name || '', description: description || '',
      price: price || '', category: category || '', make: make || '',
      type: type || '', model: model || '', specs: specs || '',
      stock: stock || '', generatedCode, errors,
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }
    setFile(f);
    resetCodeCounter();

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const rows = lines.slice(1).map((line, i) => validateRow(line.split(',').map(c => c.trim()), i));
      setParsedData(rows);
    };
    reader.readAsText(f);
  };

  const hasErrors = parsedData.some(r => r.errors.length > 0);
  const validCount = parsedData.filter(r => r.errors.length === 0).length;
  const errorCount = parsedData.filter(r => r.errors.length > 0).length;

  const handleUpload = () => {
    if (hasErrors) { toast.error('Please fix all errors before uploading'); return; }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast.success(`${validCount} products uploaded with auto-generated codes!`);
      setOpen(false);
      setFile(null);
      setParsedData([]);
    }, 1500);
  };

  const downloadTemplate = () => {
    const header = 'Name,Description,Price,Category,Make,Type,Model,Specs,Stock';
    const sample = 'Samsung Galaxy S24,Flagship phone with AI features,999.99,Electronics,Samsung,Phone,S24 Ultra,8GB RAM 256GB Storage Black,50';
    const blob = new Blob([header + '\n' + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'product_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const resetter = () => { setFile(null); setParsedData([]); if (fileRef.current) fileRef.current.value = ''; };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetter(); }}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Bulk Upload</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Bulk Catalog Upload</DialogTitle></DialogHeader>

        {!file ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition cursor-pointer" onClick={() => fileRef.current?.click()}>
              <FileSpreadsheet className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-sm mb-1">Drop your file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports CSV and Excel (.xlsx, .xls)</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm font-medium mb-2">Required Columns:</p>
              <code className="text-xs text-muted-foreground block">Name, Description, Price, Category, Make, Type, Model, Specs, Stock</code>
              <p className="text-[10px] text-muted-foreground mt-2">
                <strong>Specs format:</strong> "8GB RAM, Core i5, 512GB SSD, 15.6 inch, Black" — the system will auto-parse these into the product code.
              </p>
              <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={downloadTemplate}>
                <Download className="w-3.5 h-3.5" /> Download Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <button onClick={resetter}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>{validCount} valid</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorCount} with errors</span>
                </div>
              )}
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/30">
                    <th className="text-left p-2 font-medium">Row</th>
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Category</th>
                    <th className="text-left p-2 font-medium">Make</th>
                    <th className="text-left p-2 font-medium">Model</th>
                    <th className="text-left p-2 font-medium">Price</th>
                    <th className="text-left p-2 font-medium">Generated Code</th>
                    <th className="text-left p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row) => (
                    <tr key={row.row} className={`border-b last:border-0 ${row.errors.length > 0 ? 'bg-destructive/5' : ''}`}>
                      <td className="p-2 text-muted-foreground">{row.row}</td>
                      <td className="p-2 truncate max-w-[120px]">{row.name || '—'}</td>
                      <td className="p-2">{row.category || '—'}</td>
                      <td className="p-2">{row.make || '—'}</td>
                      <td className="p-2">{row.model || '—'}</td>
                      <td className="p-2">${row.price || '—'}</td>
                      <td className="p-2 font-mono text-xs text-primary">{row.generatedCode || '—'}</td>
                      <td className="p-2">
                        {row.errors.length === 0 ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <span className="text-xs text-destructive">{row.errors.join('; ')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetter}>Choose Different File</Button>
              <Button onClick={handleUpload} disabled={uploading || parsedData.length === 0}>
                {uploading ? 'Uploading...' : `Upload ${validCount} Products`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
