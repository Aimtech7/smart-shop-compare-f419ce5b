import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Plus, Pencil, Trash2, DollarSign, ShoppingBag, TrendingUp, Clock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BulkUploadDialog } from '@/components/BulkUploadDialog';
import { api } from '@/services/api';
import { djangoSeller } from '@/services/django';
import { DJANGO_CONFIG } from '@/services/django/client';
import { toast } from 'sonner';
import { generateProductCode, CATEGORIES, MAKES, TYPES } from '@/lib/productCode';
import type { Product, StoreListing } from '@/types';

const productSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(10).max(2000),
  price: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Valid price required'),
  category: z.string().min(1, 'Category required'),
  make: z.string().min(1, 'Make/Brand required'),
  type: z.string().min(1, 'Type required'),
  model: z.string().min(1, 'Model required'),
  specs: z.string().optional(),
  stock: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Valid stock required'),
});

type ProductForm = z.infer<typeof productSchema>;

export default function SellerDashboard() {
  const [products, setProducts] = useState<(Product & { listings: StoreListing[] })[]>([]);
  const [metrics, setMetrics] = useState({ totalProducts: 0, totalOrders: 0, revenue: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const watchCategory = watch('category');
  const watchMake = watch('make');
  const watchType = watch('type');
  const watchModel = watch('model');
  const watchSpecs = watch('specs');

  // Auto-generate code when fields change
  useEffect(() => {
    if (watchCategory && watchMake && watchType && watchModel) {
      const code = generateProductCode({
        category: watchCategory,
        make: watchMake,
        type: watchType,
        model: watchModel,
        specs: watchSpecs,
      });
      setGeneratedCode(code);
    } else {
      setGeneratedCode('');
    }
  }, [watchCategory, watchMake, watchType, watchModel, watchSpecs]);

  useEffect(() => {
    const load = async () => {
      try {
        if (DJANGO_CONFIG.enabled) {
          const [p, d] = await Promise.all([
            djangoSeller.products(),
            djangoSeller.dashboard(),
          ]);
          // Adapt Django products to UI shape (attach empty listings if backend doesn't include them)
          setProducts(
            (p as any[]).map((prod) => ({
              ...prod,
              listings: (prod as any).listings ?? [],
            })) as (Product & { listings: StoreListing[] })[]
          );
          setMetrics({
            totalProducts: d.totalProducts ?? 0,
            totalOrders: d.totalOrders ?? 0,
            revenue: d.revenue ?? 0,
            pendingOrders: d.pendingOrders ?? 0,
          });
        } else {
          const [p, m] = await Promise.all([
            api.getSellerProducts('s1'),
            api.getSellerMetrics(),
          ]);
          setProducts(p);
          setMetrics(m);
        }
      } catch (err) {
        console.error('Failed to load seller dashboard:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const onSubmit = (data: ProductForm) => {
    const code = generateProductCode({
      category: data.category,
      make: data.make,
      type: data.type,
      model: data.model,
      specs: data.specs,
    });

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id
        ? { ...p, name: data.name, description: data.description, category: data.category, sku: code }
        : p));
      toast.success(`Product updated! Code: ${code}`);
    } else {
      const newProd: Product & { listings: StoreListing[] } = {
        id: `p-${Date.now()}`,
        name: data.name,
        description: `${data.description}\n\nMake: ${data.make} | Type: ${data.type} | Model: ${data.model}${data.specs ? ` | Specs: ${data.specs}` : ''}`,
        category: data.category,
        images: [],
        sku: code,
        createdAt: new Date().toISOString(),
        listings: [{
          id: `l-${Date.now()}`, productId: `p-${Date.now()}`, sellerId: 's1',
          storeName: 'My Store', price: Number(data.price), stock: Number(data.stock), sellerRating: 4.5,
        }],
      };
      setProducts([newProd, ...products]);
      toast.success(`Product added! Code: ${code}`);
    }
    setDialogOpen(false);
    setEditingProduct(null);
    reset();
    setGeneratedCode('');
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('category', product.category);
    setDialogOpen(true);
  };

  return (
    <div className="container-main py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold">Seller Dashboard</h1>
        <div className="flex gap-2">
          <BulkUploadDialog />
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingProduct(null); reset(); setGeneratedCode(''); } }}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Product</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div><Label>Product Name</Label><Input {...register('name')} placeholder="e.g. Samsung Galaxy S24 Ultra" />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}</div>
                <div><Label>Description</Label><Textarea {...register('description')} placeholder="Detailed product description..." />{errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}</div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select onValueChange={(v) => setValue('category', v)} defaultValue="">
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
                  </div>
                  <div>
                    <Label>Make / Brand</Label>
                    <Select onValueChange={(v) => setValue('make', v)} defaultValue="">
                      <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                      <SelectContent>
                        {MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.make && <p className="text-xs text-destructive mt-1">{errors.make.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select onValueChange={(v) => setValue('type', v)} defaultValue="">
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input {...register('model')} placeholder="e.g. S24 Ultra" />
                    {errors.model && <p className="text-xs text-destructive mt-1">{errors.model.message}</p>}
                  </div>
                </div>

                <div>
                  <Label>Specifications (optional)</Label>
                  <Input {...register('specs')} placeholder="e.g. 8GB RAM, Core i5, 512GB SSD, 15.6 inch, Black" />
                  <p className="text-[10px] text-muted-foreground mt-1">Enter RAM, processor, storage, screen size, color etc. for auto-coding</p>
                </div>

                {/* Auto-generated code preview */}
                {generatedCode && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Auto-Generated Product Code</p>
                        <p className="font-mono text-sm font-bold mt-1">{generatedCode}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={copyCode} className="gap-1">
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedCode ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Price ($)</Label><Input type="number" step="0.01" {...register('price')} />{errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}</div>
                  <div><Label>Stock</Label><Input type="number" {...register('stock')} /></div>
                </div>
                <div><Label>Images</Label><Input type="file" accept="image/*" multiple className="cursor-pointer" /></div>
                <Button type="submit" className="w-full">{editingProduct ? 'Update' : 'Add'} Product</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Products', value: metrics.totalProducts, icon: Package, color: 'text-primary' },
          { label: 'Orders', value: metrics.totalOrders, icon: ShoppingBag, color: 'text-info' },
          { label: 'Revenue', value: `$${metrics.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-success' },
          { label: 'Pending', value: metrics.pendingOrders, icon: Clock, color: 'text-warning' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2"><Icon className={`w-5 h-5 ${color}`} /><TrendingUp className="w-4 h-4 text-success" /></div>
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Product List */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-display font-semibold">Products</h2>
          <p className="text-xs text-muted-foreground">{products.length} items</p>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="font-medium text-sm">No products yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first product or upload a catalog</p>
          </div>
        ) : (
          <div className="divide-y">
            {products.map(product => (
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition">
                <div className="w-12 h-12 bg-secondary rounded-lg shrink-0 overflow-hidden">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><Package className="w-6 h-6 text-muted-foreground/30" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <p className="text-[10px] font-mono text-primary/80 mt-0.5">Code: {product.sku}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-sm">${product.listings[0]?.price}</p>
                  <p className="text-xs text-muted-foreground">Stock: {product.listings[0]?.stock}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => editProduct(product)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
