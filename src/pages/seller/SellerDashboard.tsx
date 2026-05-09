import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Plus, Pencil, Trash2, DollarSign, ShoppingBag, TrendingUp, Clock, Copy, Check, Sparkles, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { ComboboxInput } from '@/components/ComboboxInput';
import { api } from '@/services/api';
import { djangoSeller, http } from '@/services/django';
import { DJANGO_CONFIG } from '@/services/django/client';
import { toast } from 'sonner';
import { generateProductCode, MAKES, TYPES } from '@/lib/productCode';
import type { Product, StoreListing } from '@/types';
import { Link } from 'react-router-dom';

// Common brand suggestions (user can always type their own)
const BRAND_SUGGESTIONS = [
  'Apple','Samsung','Dell','HP','Lenovo','Asus','Acer','Sony','LG','Microsoft',
  'Huawei','Xiaomi','OnePlus','Google','Motorola','Nokia','Oppo','Vivo','Realme',
  'Canon','Nikon','Fujifilm','Panasonic','Philips','Bosch','Dyson','Nike','Adidas',
  ...MAKES
].filter((v,i,a) => a.indexOf(v) === i);

const TYPE_SUGGESTIONS = [
  'Laptop','Desktop','Smartphone','Tablet','Smartwatch','Headphones','Earbuds',
  'Camera','Printer','Monitor','Keyboard','Mouse','Speaker','Charger','Cable',
  'Router','Hard Drive','SSD','RAM','GPU','CPU','TV','Refrigerator','Washing Machine',
  'Microwave','Air Conditioner','Vacuum Cleaner','Blender','Shoes','T-Shirt','Dress',
  'Jeans','Jacket','Bag','Watch','Perfume','Skincare','Supplement','Book',
  ...TYPES
].filter((v,i,a) => a.indexOf(v) === i);

// AI-powered description generator (template-based, works offline)
function generateAIDescription(make: string, type: string, model: string, specs: string): string {
  const specList = specs ? specs.split(',').map(s => s.trim()).filter(Boolean) : [];
  const specText = specList.length > 0 ? `\n\nKey Specifications:\n${specList.map(s => `• ${s}`).join('\n')}` : '';
  const templates = [
    `Introducing the ${make} ${model} ${type} — engineered for performance and built to last. Whether you're a professional or a power user, this device delivers an exceptional experience.${specText}\n\nDesigned with precision, the ${make} ${model} combines sleek aesthetics with powerful internals. A must-have for anyone who demands the best.`,
    `The ${make} ${model} redefines what a ${type} should be. Packed with cutting-edge technology and a premium build, it's designed to keep up with your most demanding tasks.${specText}\n\nWith ${make}'s proven reliability and the latest innovations, the ${model} stands out as a top-tier choice in its class.`,
    `Experience the next level with the ${make} ${model} ${type}. Combining powerful performance, elegant design, and long-lasting durability — it's crafted for those who refuse to compromise.${specText}\n\nTrusted by millions worldwide, ${make} continues to deliver excellence. The ${model} is no exception.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

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
  const [aiLoading, setAiLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);

  const toggle2FA = async () => {
    setIs2FALoading(true);
    try {
      const res = await http.post('/users/toggle-2fa/', { enabled: !is2FAEnabled });
      setIs2FAEnabled(res.is_2fa_enabled);
      toast.success(res.is_2fa_enabled ? '2FA Enabled!' : '2FA Disabled');
    } catch {
      toast.error('Failed to update 2FA status');
    } finally {
      setIs2FALoading(false);
    }
  };
  // Categories fetched from Django: [{id, name, slug}]
  const [categories, setCategories] = useState<{id: string; name: string}[]>([]);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const watchCategory = watch('category');
  const watchMake = watch('make');
  const watchType = watch('type');
  const watchModel = watch('model');
  const watchSpecs = watch('specs');

  // Fetch categories from Django on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        if (DJANGO_CONFIG.enabled) {
          const res = await http.get<any>('/products/categories/');
          const data = Array.isArray(res) ? res : res.results || res.data || [];
          setCategories(data);
        }
      } catch {
        // Fall back to empty — user can still type category name
      }
    }
    loadCategories();
  }, []);

  const handleAIGenerate = async () => {
    const make = watchMake || '';
    const type = watchType || '';
    const model = watchModel || '';
    const specs = watchSpecs || '';
    if (!make && !type && !model) {
      toast.error('Fill in Make, Type and Model first');
      return;
    }
    setAiLoading(true);
    try {
      if (DJANGO_CONFIG.enabled) {
        const res = await http.post<any>('/products/ai-describe/', { make, type, model, specs });
        setValue('description', res.description);
        toast.success('✨ Description generated!');
      } else {
        setTimeout(() => {
          const desc = generateAIDescription(make, type, model, specs);
          setValue('description', desc);
          toast.success('✨ Description generated!');
        }, 800);
      }
    } catch {
      toast.error('Failed to generate description');
    } finally {
      setAiLoading(false);
    }
  };

  const handleEnhanceImage = async () => {
    const images = watch('images');
    const imageUrl = images && images.length > 0 ? images[0] : '';
    if (!imageUrl) {
      toast.error('Add an image URL first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await http.post('/ai/enhance-image/', { image_url: imageUrl });
      if (res.optimizations) {
        toast.success('AI Analysis Complete!', {
          description: res.optimizations.join(' • '),
        });
      }
    } catch {
      toast.error('AI Enhancement failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    try {
      const res = await djangoSeller.createCategory(newCatName);
      const newCat = { id: res.id, name: res.name };
      setCategories(prev => [...prev, newCat]);
      setValue('category', res.name);
      setCatDialogOpen(false);
      setNewCatName('');
      toast.success('Category created!');
    } catch (err: any) {
      toast.error('Failed to create category');
    } finally {
      setCatLoading(false);
    }
  };

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
          const [p, d, o, a] = await Promise.all([
            djangoSeller.products(),
            djangoSeller.dashboard(),
            djangoSeller.orders(),
            djangoSeller.analytics().catch(() => null),
          ]);
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
          setOrders(o || []);
          setAnalytics(a);
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await http.patch(`/orders/${orderId}/status/`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    const code = generateProductCode({
      category: data.category,
      make: data.make,
      type: data.type,
      model: data.model,
      specs: data.specs,
    });

    const fullDescription = `${data.description}\n\nMake: ${data.make} | Type: ${data.type} | Model: ${data.model}${data.specs ? ` | Specs: ${data.specs}` : ''}`;

    try {
      if (DJANGO_CONFIG.enabled) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', fullDescription);
        // Send category UUID if we have it, otherwise send name (Django will handle)
        const catMatch = categories.find(c => c.name.toLowerCase() === data.category.toLowerCase());
        if (catMatch) {
          formData.append('category', catMatch.id);
        } else {
          formData.append('category', data.category);
        }
        formData.append('price', data.price);
        formData.append('stock_qty', data.stock);
        formData.append('delivery_days', '3');
        formData.append('SKU', code);
        
        const fileInput = document.getElementById('product-images') as HTMLInputElement;
        if (fileInput && fileInput.files) {
          for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('uploaded_images', fileInput.files[i]);
          }
        }

        if (editingProduct) {
          await djangoSeller.updateProduct(editingProduct.id, formData);
          toast.success(`Product updated! Code: ${code}`);
        } else {
          await djangoSeller.createProduct(formData);
          toast.success(`Product added! Code: ${code}`);
        }
        
        // Refresh products
        const [p, d] = await Promise.all([
          djangoSeller.products(),
          djangoSeller.dashboard(),
        ]);
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
        // Mock fallback
        if (editingProduct) {
          setProducts(products.map(p => p.id === editingProduct.id
            ? { ...p, name: data.name, description: data.description, category: data.category, sku: code }
            : p));
          toast.success(`Product updated! Code: ${code}`);
        } else {
          const newProd: Product & { listings: StoreListing[] } = {
            id: `p-${Date.now()}`,
            name: data.name,
            description: fullDescription,
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
      }
      
      setDialogOpen(false);
      setEditingProduct(null);
      reset();
      setGeneratedCode('');
    } catch (err: any) {
      toast.error('Failed to save product: ' + (err.message || 'Unknown error'));
    }
  };

  const deleteProduct = async (id: string) => {
    if (DJANGO_CONFIG.enabled) {
      try {
        await djangoSeller.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product deleted');
      } catch (err) {
        toast.error('Failed to delete product');
      }
    } else {
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    }
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    // Parse back the description if it has appended stuff, but for now just use it
    setValue('description', product.description.split('\n\nMake:')[0]);
    setValue('category', product.category);
    // Setting price and stock from first listing if it exists
    if (product.listings && product.listings.length > 0) {
      setValue('price', String(product.listings[0].price));
      setValue('stock', String(product.listings[0].stock));
    }
    setDialogOpen(true);
  };

  return (
    <div className="container-main py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold">Seller Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/seller/bulk-upload">
            <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Bulk Upload</Button>
          </Link>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingProduct(null); reset(); setGeneratedCode(''); } }}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Product</Button></DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">

                {/* Product Name */}
                <div>
                  <Label>Product Name</Label>
                  <Input {...register('name')} placeholder="e.g. Samsung Galaxy S24 Ultra" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>

                {/* Description + AI button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Description</Label>
                    <button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {aiLoading ? 'Generating…' : '✨ AI Generate'}
                    </button>
                  </div>
                  <Textarea {...register('description')} rows={4} placeholder="Detailed product description… or click AI Generate above" />
                  {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label>Category</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[10px] gap-1 text-primary"
                          onClick={() => setCatDialogOpen(true)}
                        >
                          <Plus className="w-3 h-3" /> New
                        </Button>
                      </div>
                      <ComboboxInput
                        value={watchCategory || ''}
                        onChange={v => setValue('category', v)}
                        suggestions={categories.length > 0 ? categories.map(c => c.name) : ['Electronics','Fashion','Home & Garden','Sports','Books','Automotive','Health','Beauty','Toys','Food']}
                        placeholder="e.g. Electronics"
                        error={!!errors.category}
                      />
                      {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
                    </div>
                  <div>
                    <Label>Make / Brand</Label>
                    <ComboboxInput
                      value={watchMake || ''}
                      onChange={v => setValue('make', v)}
                      suggestions={BRAND_SUGGESTIONS}
                      placeholder="e.g. Apple"
                      error={!!errors.make}
                    />
                    {errors.make && <p className="text-xs text-destructive mt-1">{errors.make.message}</p>}
                  </div>
                </div>

                {/* Type + Model — both free text */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <ComboboxInput
                      value={watchType || ''}
                      onChange={v => setValue('type', v)}
                      suggestions={TYPE_SUGGESTIONS}
                      placeholder="e.g. Laptop"
                      error={!!errors.type}
                    />
                    {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input {...register('model')} placeholder="e.g. MacBook Pro M3" />
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
                <div>
                  <Label>Product Images (URLs)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Paste image URL..." 
                      {...register('images.0')} 
                      className={errors.images?.[0] ? 'border-destructive' : ''}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="shrink-0 text-primary border-primary/20 hover:bg-primary/10"
                      onClick={handleEnhanceImage}
                      disabled={aiLoading}
                      title="AI Image Enhancer"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors.images?.[0] && <p className="text-xs text-destructive mt-1">{errors.images[0].message}</p>}
                </div>
                <Button type="submit" className="w-full">{editingProduct ? 'Update' : 'Add'} Product</Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* New Category Dialog */}
          <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">Category Name</Label>
                  <Input 
                    id="catName" 
                    value={newCatName} 
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Smart Home"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreateCategory}
                  disabled={catLoading || !newCatName.trim()}
                >
                  {catLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Category
                </Button>
              </div>
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
          <div key={label} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2"><Icon className={`w-5 h-5 ${color}`} /><TrendingUp className="w-4 h-4 text-success" /></div>
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary/30 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-bold mb-4">Recent Sales Trend</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.daily_sales || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#a78bfa' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-bold mb-4">Category Mix</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.category_sales || []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics?.category_sales?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            {/* The table content goes here (previously implemented) */}
            <div className="p-4 border-b bg-secondary/10 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg">Inventory Management</h2>
                <p className="text-xs text-muted-foreground">Manage your product details, pricing, and stock levels.</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {products.length} Products Total
                </span>
              </div>
            </div>
            {/* ... rest of the table logic ... */}

        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading your inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-base mb-1">No products found</h3>
            <p className="text-sm text-muted-foreground mb-6">You haven't added any products to your store yet.</p>
            <Button onClick={() => setDialogOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">SKU / Code</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-md shrink-0 overflow-hidden border">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-secondary/50">
                              <Package className="w-5 h-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate max-w-[200px]">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground">Updated {new Date(product.updatedAt || '').toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <code className="text-[10px] font-mono bg-primary/5 text-primary px-1.5 py-0.5 rounded">
                        {product.sku}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-sm text-success">${Number(product.listings?.[0]?.price || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${Number(product.listings?.[0]?.stock || 0) > 5 ? 'bg-success' : 'bg-destructive'}`} />
                        <p className="text-xs font-medium">{product.listings?.[0]?.stock || 0} left</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-info hover:text-info hover:bg-info/10"
                          onClick={() => editProduct(product)}
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteProduct(product.id)}
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TabsContent>

    <TabsContent value="orders">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-secondary/10">
          <h2 className="font-display font-bold text-lg">Order Management</h2>
          <p className="text-xs text-muted-foreground">Process and track customer orders for your products.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-4">
                    <code className="text-[10px] font-mono">#{order.id.slice(0, 8)}</code>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium">{order.buyer_name || 'Customer'}</p>
                    <p className="text-[10px] text-muted-foreground">{order.buyer_email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs">{order.items?.length} items</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-success">${Number(order.seller_total || 0).toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-xs bg-secondary border-none rounded px-2 py-1 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-[10px]">View Details</Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center text-muted-foreground">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="analytics">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-bold mb-4">Daily Sales Revenue</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.daily_sales || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#8b5cf610'}}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-bold mb-4">Category Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.category_sales || []}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics?.category_sales?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </TabsContent>
    <TabsContent value="settings">
      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${is2FAEnabled ? 'text-success' : 'text-muted-foreground'}`}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <Button 
                variant={is2FAEnabled ? "destructive" : "default"}
                size="sm"
                onClick={toggle2FA}
                disabled={is2FALoading}
              >
                {is2FALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (is2FAEnabled ? 'Disable' : 'Enable')}
              </Button>
            </div>
          </div>
          {is2FAEnabled && (
            <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/40">
              <p className="text-xs">Your account is secured with TOTP. Use an app like Google Authenticator or Authy.</p>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  </Tabs>

    </div>
  );
}
