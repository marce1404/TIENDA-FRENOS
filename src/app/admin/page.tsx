
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { products as initialProducts } from '@/data/products';
import type { Product } from '@/lib/types';
import { getProducts, saveProducts } from '@/lib/products';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import { Pencil, Trash2, PlusCircle, LogIn, LogOut, Star, Phone, Settings, Image as ImageIcon, Save, Package, Mail, Loader2 } from 'lucide-react';
import { verifyPassword } from '@/actions/auth';
import { saveEnvSettings } from '@/actions/saveEnv';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  
  // State for settings
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [homeImageUrl, setHomeImageUrl] = useState('https://placehold.co/600x400.png');
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  // State for .env settings form
  const [isSavingEnv, setIsSavingEnv] = useState(false);
  const [adminPasswordForEnv, setAdminPasswordForEnv] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpRecipients, setSmtpRecipients] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const allCategories = ['Pastillas', 'Discos'];

  useEffect(() => {
    setProducts(getProducts());
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
  
  const handleHomeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHomeImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCategoryImages = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('categoryImages', JSON.stringify(categoryImages));
    alert('Imágenes de categoría actualizadas.');
  };

  const handleCategoryImagesChange = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCategoryImages(prev => ({ ...prev, [category]: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEnv(true);
    const settings = {
        ADMIN_PASSWORD: adminPasswordForEnv,
        SMTP_HOST: smtpHost,
        SMTP_PORT: smtpPort,
        SMTP_USER: smtpUser,
        SMTP_PASS: smtpPass,
        SMTP_RECIPIENTS: smtpRecipients,
        SMTP_SECURE: smtpSecure.toString(),
    };
    const result = await saveEnvSettings(settings);
    setIsSavingEnv(false);
    if (result.success) {
        toast({
            title: "¡Configuración Guardada!",
            description: "Para que los cambios tomen efecto, por favor reinicia el servidor de la aplicación.",
            duration: 9000
        });
        // Clear password fields after saving
        setAdminPasswordForEnv('');
        setSmtpPass('');
    } else {
        toast({
            variant: "destructive",
            title: "Error al Guardar",
            description: result.error || "Ocurrió un problema al guardar la configuración.",
        });
    }
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    setProducts(prev => {
      const newProduct = { ...newProductData, id: prev.length > 0 ? Math.max(...prev.map(p => p.id)) + 1 : 1 };
      const updatedProducts = [...prev, newProduct];
      saveProducts(updatedProducts);
      return updatedProducts;
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => {
      const updatedProducts = prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      saveProducts(updatedProducts);
      return updatedProducts;
    });
    setIsEditDialogOpen(false);
    setProductToEdit(null);
  };
  
  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => {
      const updatedProducts = prev.filter(p => p.id !== productId);
      saveProducts(updatedProducts);
      return updatedProducts;
    });
  };

  const handleToggleFeatured = (productId: number) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(p =>
        p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
      );
      saveProducts(updatedProducts);
      return updatedProducts;
    });
  };
  
  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
      </div>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Configuración General</TabsTrigger>
          <TabsTrigger value="products"><Package className="mr-2 h-4 w-4" />Gestión de Productos</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contact"><Phone className="mr-2 h-4 w-4" />Contacto</TabsTrigger>
              <TabsTrigger value="appearance"><ImageIcon className="mr-2 h-4 w-4" />Apariencia</TabsTrigger>
              <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" />Correo</TabsTrigger>
            </TabsList>
            <TabsContent value="contact">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Contacto de WhatsApp</CardTitle>
                  <CardDescription>
                      Define el nombre y número que se usará para el botón de contacto de WhatsApp.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveWhatsapp}>
                  <CardContent>
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
                  <CardFooter>
                    <Button type="submit">Guardar Contacto</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="appearance">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Imagen de Portada (Home)</CardTitle>
                  <CardDescription>
                    Cambia la imagen principal que se muestra en la página de inicio.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveHomeImage}>
                  <CardContent className="space-y-2">
                    <Label htmlFor="home-image-file">Seleccionar Imagen</Label>
                    <Input
                      id="home-image-file"
                      type="file"
                      accept="image/*"
                      onChange={handleHomeImageChange}
                    />
                    {homeImageUrl && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Vista previa actual:</p>
                        <Image
                          src={homeImageUrl}
                          alt="Vista previa de imagen de portada"
                          width={200}
                          height={120}
                          className="rounded-md object-cover"
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Guardar Imagen de Portada</Button>
                  </CardFooter>
                </form>
              </Card>
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Imágenes de Categoría por Defecto</CardTitle>
                  <CardDescription>
                    Asigna una imagen predeterminada a cada categoría. Se usará si un producto no tiene su propia imagen.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveCategoryImages}>
                  <CardContent className="space-y-4">
                    {allCategories.map(category => (
                      <div key={category} className="space-y-2">
                        <Label htmlFor={`category-image-${category}`}>{category}</Label>
                        <Input
                          id={`category-image-${category}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCategoryImagesChange(category, e)}
                          className="mt-1"
                        />
                        {categoryImages[category] && (
                          <Image
                            src={categoryImages[category]}
                            alt={`Vista previa de ${category}`}
                            width={100}
                            height={100}
                            className="mt-2 rounded-md object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Guardar Imágenes de Categoría</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="email">
                <Card className="mt-6">
                  <form onSubmit={handleSaveEnv}>
                    <CardHeader>
                      <CardTitle>Configuración de Correo y Seguridad</CardTitle>
                      <CardDescription>
                          Introduce las credenciales para el envío de correos y la contraseña de administrador. Los campos vacíos no se actualizarán.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="admin-password">Nueva Contraseña de Administrador (ADMIN_PASSWORD)</Label>
                          <Input id="admin-password" type="password" placeholder="Dejar en blanco para no cambiar" value={adminPasswordForEnv} onChange={(e) => setAdminPasswordForEnv(e.target.value)} />
                          <p className="text-xs text-muted-foreground">
                             Establece o cambia la contraseña para acceder a este panel. Déjalo en blanco para no modificarla.
                          </p>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="smtp-host">Host del Servidor (SMTP_HOST)</Label>
                          <Input id="smtp-host" placeholder="smtp.example.com" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="smtp-port">Puerto (SMTP_PORT)</Label>
                          <Input id="smtp-port" placeholder="587" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)}/>
                      </div>
                       <div className="flex items-center space-x-2 mt-2">
                          <Switch id="smtp-secure" checked={smtpSecure} onCheckedChange={setSmtpSecure} />
                          <Label htmlFor="smtp-secure">Usar cifrado SSL/TLS (SMTP_SECURE)</Label>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="smtp-user">Usuario (SMTP_USER)</Label>
                          <Input id="smtp-user" placeholder="user@example.com" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="smtp-pass">Contraseña (SMTP_PASS)</Label>
                          <Input id="smtp-pass" type="password" placeholder="Dejar en blanco para no cambiar" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)}/>
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="smtp-recipients">Correos de Destino (SMTP_RECIPIENTS)</Label>
                          <Input id="smtp-recipients" placeholder="correo1@example.com, correo2@example.com" value={smtpRecipients} onChange={(e) => setSmtpRecipients(e.target.value)}/>
                           <p className="text-xs text-muted-foreground">
                              Importante: Esta es la lista de correos que recibirán los mensajes. Sepáralos por comas.
                          </p>
                      </div>
                       <p className="mt-4 text-sm text-destructive">
                          <span className="font-bold">Importante:</span> Después de guardar, debes reiniciar el servidor para que los cambios tomen efecto.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isSavingEnv}>
                        {isSavingEnv ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : 'Guardar Configuración'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Lista de Productos</h2>
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
        </TabsContent>
      </Tabs>

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
        name: '', brand: '', model: '', compatibility: '', price: 0, category: '', imageUrl: '', isFeatured: false,
    });
    
    const [formData, setFormData] = useState(getInitialFormData());
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            const initialData = product ? { ...product } : getInitialFormData();
            setFormData(initialData);

            let previewUrl = initialData.imageUrl;
            if (!previewUrl || !previewUrl.startsWith('data:image')) {
                previewUrl = categoryImages[initialData.category] || 'https://placehold.co/400x400.png';
            }
            setImagePreview(previewUrl);
        }
    }, [isOpen, product, categoryImages]);

    useEffect(() => {
        if (!isOpen) return;

        if (!formData.imageUrl || !formData.imageUrl.startsWith('data:image')) {
            const newDefaultPreview = categoryImages[formData.category] || 'https://placehold.co/400x400.png';
            setImagePreview(newDefaultPreview);
        }
    }, [formData.category, formData.imageUrl, isOpen, categoryImages]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleCategoryChange = (value: string) => {
        if (value) {
            setFormData(prev => ({ ...prev, category: value }));
        }
    };
    
    const handleFeaturedChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isFeatured: checked }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setFormData(prev => ({ ...prev, imageUrl: result }));
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = product ? { ...formData, id: product.id } : formData;
        onSave(dataToSave);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nombre</Label>
                            <Input id="name" value={formData.name} onChange={handleChange} required className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="brand" className="text-right">Marca</Label>
                            <Input id="brand" value={formData.brand} onChange={handleChange} required className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="model" className="text-right">Modelo</Label>
                            <Input id="model" value={formData.model} onChange={handleChange} required className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Categoría</Label>
                            <Select
                                value={formData.category}
                                onValueChange={handleCategoryChange}
                                required
                            >
                                <SelectTrigger id="category" className="col-span-3">
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pastillas">Pastillas</SelectItem>
                                    <SelectItem value="Discos">Discos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="compatibility" className="text-right">Compatibilidad</Label>
                            <Input id="compatibility" value={formData.compatibility} onChange={handleChange} required className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Precio</Label>
                            <Input id="price" type="number" value={formData.price} onChange={handleChange} required className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="imageFile" className="text-right pt-2">Imagen</Label>
                            <div className="col-span-3 space-y-2">
                               <Input id="imageFile" type="file" accept="image/*" onChange={handleFileChange} />
                               {imagePreview && (
                                  <div>
                                      <Label className="text-xs text-muted-foreground">Vista previa actual:</Label>
                                      <Image
                                          src={imagePreview}
                                          alt="Vista previa del producto"
                                          width={100}
                                          height={100}
                                          className="mt-2 rounded-md object-cover"
                                      />
                                  </div>
                               )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="isFeatured" className="text-right">Destacado</Label>
                          <div className="col-span-3 flex items-center">
                            <Switch
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onCheckedChange={handleFeaturedChange}
                            />
                          </div>
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

    