
'use client';

import { useState, useEffect } from 'react';
import { products as initialProducts } from '@/data/products';
import type { Product } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, PlusCircle, LogIn, LogOut, Star, Phone, Settings, Image as ImageIcon, Save, Package } from 'lucide-react';
import { verifyPassword } from '@/actions/auth';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // State for settings
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [homeImageUrl, setHomeImageUrl] = useState('https://placehold.co/600x400.png');
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const allCategories = [...new Set(products.map(p => p.category))];

  useEffect(() => {
    setProducts(initialProducts);
    const authStatus = sessionStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
        setIsAuthenticated(true);
    }
    // Load contact info
    const savedInfo = localStorage.getItem('whatsappInfo');
    if (savedInfo) {
        try {
            const { name, number } = JSON.parse(savedInfo);
            setContactName(name || 'Ventas');
            setWhatsappNumber(number || '56912345678');
        } catch (e) {
            setContactName('Ventas');
            setWhatsappNumber('56912345678');
        }
    } else {
        const savedNumber = localStorage.getItem('whatsappNumber') || '56912345678';
        setContactName('Ventas');
        setWhatsappNumber(savedNumber);
    }
    
    // Load appearance settings
    const savedHomeImage = localStorage.getItem('homeImageUrl');
    if (savedHomeImage) setHomeImageUrl(savedHomeImage);
    
    const savedCategoryImages = localStorage.getItem('categoryImages');
    if (savedCategoryImages) {
        try {
            setCategoryImages(JSON.parse(savedCategoryImages));
        } catch (e) {
            console.error('Error parsing category images from localStorage', e);
        }
    }

    setIsMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        setError('');
      } else {
        setError('Contraseña incorrecta.');
      }
    } catch (err) {
      setError('Ocurrió un error al verificar la contraseña.');
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleSaveWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappInfo = {
        name: contactName,
        number: whatsappNumber,
    };
    localStorage.setItem('whatsappInfo', JSON.stringify(whatsappInfo));
    localStorage.removeItem('whatsappNumber'); 
    alert('Configuración de contacto actualizada.');
  };

  const handleSaveHomeImage = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('homeImageUrl', homeImageUrl);
    alert('Imagen de portada actualizada.');
  };

  const handleSaveCategoryImages = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('categoryImages', JSON.stringify(categoryImages));
    alert('Imágenes de categoría actualizadas.');
  };

  const handleCategoryImagesChange = (category: string, url: string) => {
    setCategoryImages(prev => ({ ...prev, [category]: url }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct = { ...newProductData, id: prev.length > 0 ? Math.max(...prev.map(p => p.id)) + 1 : 1 };
    if (!newProduct.imageUrl) {
        newProduct.imageUrl = categoryImages[newProduct.category] || 'https://placehold.co/400x400.png';
    }
    setProducts(prev => [...prev, newProduct]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setIsEditDialogOpen(false);
    setProductToEdit(null);
  };
  
  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleToggleFeatured = (productId: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
      )
    );
  };
  
  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-sm mx-auto">
            <form onSubmit={handleLogin} className="bg-card p-8 rounded-lg shadow-lg border border-border">
              <h1 className="text-2xl font-bold text-center mb-4">Acceso de Administrador</h1>
              <p className="text-muted-foreground text-center mb-6">Ingresa la contraseña para continuar.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full mt-6" disabled={isLoggingIn}>
                {isLoggingIn ? 'Verificando...' : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Ingresar
                  </>
                )}
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
        </div>

        <Accordion type="single" collapsible className="w-full mb-8">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Configuración General</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent>
                <Card className="border-none">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Phone className="h-5 w-5" />
                            <span>Contacto de WhatsApp</span>
                        </CardTitle>
                        <CardDescription>
                            Define el nombre y número que se usará para el botón de contacto de WhatsApp.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSaveWhatsapp}>
                        <CardContent className="p-0">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="contact-name">Nombre del Contacto</Label>
                                    <Input
                                        id="contact-name"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                        placeholder="Ej: Ventas"
                                        className="mt-2"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Un nombre para tu referencia en el panel. No es visible para los clientes.
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="whatsapp-number">Número de Teléfono</Label>
                                    <Input
                                        id="whatsapp-number"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        placeholder="Ej: 56912345678"
                                        className="mt-2"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Incluye código de país, sin el símbolo '+' ni espacios.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-0 pt-6">
                            <Button type="submit">Guardar Contacto</Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="mt-8 border-x-0 border-b-0 rounded-none">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ImageIcon className="h-5 w-5" />
                            <span>Imagen de Portada (Home)</span>
                        </CardTitle>
                        <CardDescription>
                           Cambia la imagen principal que se muestra en la página de inicio.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSaveHomeImage}>
                        <CardContent className="p-0">
                             <Label htmlFor="home-image-url">URL de la Imagen</Label>
                              <Input
                                id="home-image-url"
                                value={homeImageUrl}
                                onChange={(e) => setHomeImageUrl(e.target.value)}
                                placeholder="https://ejemplo.com/imagen.png"
                                className="mt-2"
                              />
                        </CardContent>
                        <CardFooter className="p-0 pt-6">
                            <Button type="submit">Guardar Imagen de Portada</Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="mt-8 border-x-0 border-b-0 rounded-none">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Package className="h-5 w-5" />
                            <span>Imágenes de Categoría por Defecto</span>
                        </CardTitle>
                        <CardDescription>
                           Asigna una imagen predeterminada a cada categoría. Se usará si un producto no tiene su propia imagen.
                        </CardDescription>
                    </CardHeader>
                     <form onSubmit={handleSaveCategoryImages}>
                        <CardContent className="p-0 space-y-4">
                             {allCategories.map(category => (
                                <div key={category}>
                                    <Label htmlFor={`category-image-${category}`}>{category}</Label>
                                    <Input
                                        id={`category-image-${category}`}
                                        value={categoryImages[category] || ''}
                                        onChange={(e) => handleCategoryImagesChange(category, e.target.value)}
                                        placeholder={`https://ejemplo.com/imagen-${category.toLowerCase()}.png`}
                                        className="mt-2"
                                    />
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="p-0 pt-6">
                            <Button type="submit">Guardar Imágenes de Categoría</Button>
                        </CardFooter>
                    </form>
                </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gestión de Productos</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2" />
            Añadir Producto
          </Button>
        </div>
        
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Compatibilidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Destacado</TableHead>
                <TableHead className="w-[120px] text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.model}</TableCell>
                  <TableCell>{product.compatibility}</TableCell>
                  <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(product.id)}>
                      <Star className={cn("h-5 w-5", product.isFeatured ? "fill-primary text-primary" : "text-muted-foreground")} />
                      <span className="sr-only">Toggle Destacado</span>
                    </Button>
                  </TableCell>
                  <TableCell className="flex justify-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setProductToEdit(product); setIsEditDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="icon">
                           <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Eliminar</span>
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      
      <ProductFormDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddProduct}
        title="Añadir Nuevo Producto"
        categoryImages={categoryImages}
      />

      {productToEdit && (
         <ProductFormDialog
           isOpen={isEditDialogOpen}
           onOpenChange={setIsEditDialogOpen}
           onSave={handleUpdateProduct}
           product={productToEdit}
           title="Editar Producto"
           categoryImages={categoryImages}
         />
      )}
    </div>
  );
}

interface ProductFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (product: any) => void;
    product?: Product | null;
    title: string;
    categoryImages: Record<string, string>;
}

function ProductFormDialog({ isOpen, onOpenChange, onSave, product, title, categoryImages }: ProductFormDialogProps) {
    const getInitialFormData = () => ({
        name: '',
        brand: '',
        model: '',
        compatibility: '',
        price: 0,
        category: '',
        imageUrl: '',
        isFeatured: false,
    });
    
    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name,
                    brand: product.brand,
                    model: product.model,
                    compatibility: product.compatibility,
                    price: product.price,
                    category: product.category,
                    imageUrl: product.imageUrl,
                    isFeatured: product.isFeatured,
                });
            } else {
                 const initialData = getInitialFormData();
                 if (initialData.category && categoryImages[initialData.category]) {
                    initialData.imageUrl = categoryImages[initialData.category];
                 } else {
                    initialData.imageUrl = 'https://placehold.co/400x400.png';
                 }
                 setFormData(initialData);
            }
        }
    }, [product, isOpen, categoryImages]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        const newFormData = { ...formData, [id]: type === 'number' ? parseFloat(value) || 0 : value };
        
        if (id === 'category' && !product) {
            const defaultImageUrl = categoryImages[value] || 'https://placehold.co/400x400.png';
            if (formData.imageUrl === 'https://placehold.co/400x400.png' || (formData.category && categoryImages[formData.category] === formData.imageUrl)) {
                 newFormData.imageUrl = defaultImageUrl;
            }
        }
        
        setFormData(newFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = product ? { ...formData, id: product.id } : formData;
        onSave(dataToSave);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nombre</Label>
                            <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="brand" className="text-right">Marca</Label>
                            <Input id="brand" value={formData.brand} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="model" className="text-right">Modelo</Label>
                            <Input id="model" value={formData.model} onChange={handleChange} className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Categoría</Label>
                            <Input id="category" value={formData.category} onChange={handleChange} className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="compatibility" className="text-right">Compatibilidad</Label>
                            <Input id="compatibility" value={formData.compatibility} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Precio</Label>
                            <Input id="price" type="number" value={formData.price} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="imageUrl" className="text-right">URL Imagen</Label>
                            <Input id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="col-span-3" placeholder="https://..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
