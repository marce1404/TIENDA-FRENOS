
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import type { Product } from '@/lib/types';
import { getProducts } from '@/lib/products';
import { saveProduct, deleteProduct } from '@/actions/saveProductsToServer';
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
import { Pencil, Trash2, PlusCircle, LogIn, LogOut, Star, Phone, Settings, Save, Package, Mail, Loader2, Search, Users, Eye, EyeOff, Upload, Image as ImageIcon, Percent, Cloud } from 'lucide-react';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { verifyCredentials } from '@/actions/auth';
import { saveEnvSettings } from '@/actions/saveEnv';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAdminSettingsForForm } from '@/actions/getAdminSettings';
import Image from 'next/image';
import { uploadImage } from '@/actions/uploadImage';
import { Badge } from '@/components/ui/badge';
import { BrakePadIcon } from '@/components/icons/BrakePadIcon';
import { BrakeDiscIcon } from '@/components/icons/BrakeDiscIcon';

// Helper function to convert a File to a Base64 Data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [contactName, setContactName] = useState('');

  const [isSavingUser, setIsSavingUser] = useState<Record<number, boolean>>({});
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [adminUsers, setAdminUsers] = useState(() => Array(3).fill(null).map(() => ({ username: '', password: '', repeatPassword: '' })));
  const [savedUsernames, setSavedUsernames] = useState<(string | undefined)[]>([]);
  const [initialSettingsLoaded, setInitialSettingsLoaded] = useState(false);
  const [showPasswords, setShowPasswords] = useState([false, false, false]);
  const [showRepeatPasswords, setShowRepeatPasswords] = useState([false, false, false]);
  
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpRecipients, setSmtpRecipients] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  
  // Hardcoded URLs for default image previews in the admin panel
  const DEFAULT_PASTILLA_IMAGE_URL = 'https://res.cloudinary.com/repufrenos/image/upload/v1716335805/repufrenos/defaults/default_pastilla.png';
  const DEFAULT_DISCO_IMAGE_URL = 'https://res.cloudinary.com/repufrenos/image/upload/v1716335805/repufrenos/defaults/default_disco.png';

  useEffect(() => {
    async function fetchProducts() {
      const dbProducts = await getProducts();
      setProducts(dbProducts);
    }
    fetchProducts();

    const authStatus = sessionStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
        setIsAuthenticated(true);
    }
    
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
        setContactName('Ventas');
        setWhatsappNumber('56912345678');
    }

  }, []);

  useEffect(() => {
    const loadAdminData = async () => {
        if (isAuthenticated) {
            if (!initialSettingsLoaded) {
                try {
                    const settings = await getAdminSettingsForForm();

                    const serverUsers = settings.users || [];
                    const usernamesFromServer: (string | undefined)[] = [];
                    const formStateForUsers: { username: string; password: string; repeatPassword: string; }[] = [];

                    for (let i = 0; i < 3; i++) {
                        const user = serverUsers[i];
                        usernamesFromServer.push(user?.username);
                        formStateForUsers.push({
                            username: user?.username || '',
                            password: '',
                            repeatPassword: ''
                        });
                    }
                    
                    setSavedUsernames(usernamesFromServer);
                    setAdminUsers(formStateForUsers);

                    setSmtpHost(settings.smtp.host || '');
                    setSmtpPort(settings.smtp.port || '');
                    setSmtpUser(settings.smtp.user || '');
                    setSmtpRecipients(settings.smtp.recipients || '');
                    setSmtpSecure(settings.smtp.secure || false);

                    setInitialSettingsLoaded(true);
                } catch (error) {
                    console.error("Failed to load admin settings", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "No se pudieron cargar las configuraciones del administrador.",
                    });
                }
            }
        }
    };
    
    loadAdminData();
  }, [isAuthenticated, initialSettingsLoaded, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const isValid = await verifyCredentials(username, password);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        setInitialSettingsLoaded(false); 
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Ocurrió un error al verificar las credenciales.');
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setInitialSettingsLoaded(false); 
    setError('');
  };

  const handleSaveWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappInfo = {
        name: contactName,
        number: whatsappNumber,
    };
    localStorage.setItem('whatsappInfo', JSON.stringify(whatsappInfo));
    window.dispatchEvent(new Event('storage')); // Notificar a otros componentes
    alert('Configuración de contacto actualizada.');
  };

  const handleUserChange = (index: number, field: 'username' | 'password' | 'repeatPassword', value: string) => {
    setAdminUsers(currentUsers => {
      const newUsers = [...currentUsers];
      newUsers[index] = { ...newUsers[index], [field]: value };
      return newUsers;
    });
  };

  const handleSaveUser = async (e: React.FormEvent, index: number) => {
      e.preventDefault();
      const user = adminUsers[index];

      if (user.password && user.password !== user.repeatPassword) {
          toast({
              variant: "destructive",
              title: "Error de Contraseña",
              description: `Las contraseñas para el usuario ${index + 1} no coinciden.`,
          });
          return;
      }

      setIsSavingUser(prev => ({ ...prev, [index]: true }));

      const settings: any = {};
      settings[`ADMIN_USER_${index + 1}_USERNAME`] = user.username;
      
      if (user.password) {
          settings[`ADMIN_USER_${index + 1}_PASSWORD`] = user.password;
      }

      const result = await saveEnvSettings(settings);

      setIsSavingUser(prev => ({ ...prev, [index]: false }));

      if (result.success) {
          toast({
              title: `¡Usuario ${index + 1} Guardado!`,
              description: "Los cambios se han guardado correctamente.",
          });
          
          setSavedUsernames(prev => {
              const newNames = [...prev];
              newNames[index] = user.username || undefined;
              return newNames;
          });
          
          setAdminUsers(currentUsers => {
            const newUsers = [...currentUsers];
            newUsers[index] = { ...newUsers[index], password: '', repeatPassword: '' };
            return newUsers;
          });

      } else {
          toast({
              variant: "destructive",
              title: "Error al Guardar",
              description: result.error || "Ocurrió un problema al guardar la configuración.",
          });
      }
  };
  
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    
    const settings = {
      SMTP_HOST: smtpHost,
      SMTP_PORT: smtpPort,
      SMTP_USER: smtpUser,
      SMTP_PASS: smtpPass,
      SMTP_RECIPIENTS: smtpRecipients,
      SMTP_SECURE: smtpSecure.toString(),
    };

    const result = await saveEnvSettings(settings);
    setIsSavingSmtp(false);

    if (result.success) {
        toast({
            title: "¡Configuración de Correo Guardada!",
            description: "Tus cambios se han guardado y aplicado.",
        });
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

  const handleAddOrUpdateProduct = (product: Product) => {
    startTransition(async () => {
        const result = await saveProduct(product);
        if (result.success) {
            const dbProducts = await getProducts();
            setProducts(dbProducts);
            toast({
                title: productToEdit ? "¡Producto Actualizado!" : "¡Producto Creado!",
                description: "Tus cambios se han guardado en la base de datos.",
            });
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setProductToEdit(null);
        } else {
            toast({
                variant: "destructive",
                title: "Error al Guardar",
                description: result.error,
            });
        }
    });
};

  const handleDeleteProduct = (productId: number) => {
    startTransition(async () => {
        const result = await deleteProduct(productId);
        if (result.success) {
            const dbProducts = await getProducts();
            setProducts(dbProducts);
            toast({
                title: "¡Producto Eliminado!",
                description: "El producto ha sido eliminado de la base de datos.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error al Eliminar",
                description: result.error,
            });
        }
    });
  };

  const handleToggleFeatured = (product: Product) => {
    const updatedProduct = { ...product, isFeatured: !product.isFeatured };
    handleAddOrUpdateProduct(updatedProduct);
  };

  const handleToggleOnSale = (product: Product) => {
    const updatedProduct = { 
        ...product, 
        isOnSale: !product.isOnSale, 
        salePrice: !product.isOnSale ? (product.salePrice || product.price) : undefined 
    };
    handleAddOrUpdateProduct(updatedProduct);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!adminSearchTerm) {
        return true;
      }
      const lowercasedTerm = adminSearchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(lowercasedTerm) ||
        p.brand.toLowerCase().includes(lowercasedTerm) ||
        p.model.toLowerCase().includes(lowercasedTerm) ||
        (p.code && p.code.toLowerCase().includes(lowercasedTerm)) ||
        p.compatibility.toLowerCase().includes(lowercasedTerm) ||
        p.id.toString().includes(lowercasedTerm)
      );
    });
  }, [products, adminSearchTerm]);

  const paginatedAdminProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, currentPage, productsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const nextProductId = useMemo(() => {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
  }, [products]);


  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm mx-auto">
          <form onSubmit={handleLogin} className="bg-card p-8 rounded-lg shadow-lg border border-border">
            <h1 className="text-2xl font-bold text-center mb-4">Acceso de Administrador</h1>
            <p className="text-muted-foreground text-center mb-6">Ingresa tus credenciales para continuar.</p>
            <div className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
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
              {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </div>
            <Button type="submit" className="w-full mt-6" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
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
          <TabsTrigger value="products"><Package className="mr-2 h-4 w-4" />Gestión de Productos</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Configuración General</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contact"><Phone className="mr-2 h-4 w-4" />Contacto</TabsTrigger>
              <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Usuarios</TabsTrigger>
              <TabsTrigger value="services"><Mail className="mr-2 h-4 w-4" />Correo</TabsTrigger>
              <TabsTrigger value="images"><ImageIcon className="mr-2 h-4 w-4" />Imágenes por Defecto</TabsTrigger>
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
            <TabsContent value="users">
                <div className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Gestión de Usuarios Administradores</CardTitle>
                        <CardDescription>
                            Puedes configurar hasta 3 usuarios. Un campo de contraseña vacío significa que no se cambiará.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          {adminUsers.map((user, index) => (
                              <Card key={index} className="p-4">
                                <form onSubmit={(e) => handleSaveUser(e, index)}>
                                  <div className="space-y-4">
                                      <div>
                                          <Label htmlFor={`admin-username-${index}`}>
                                            Usuario {index + 1} {savedUsernames[index] ? `(${savedUsernames[index]})` : ''}
                                          </Label>
                                          <Input id={`admin-username-${index}`} placeholder="Nombre de usuario" value={user.username} onChange={e => handleUserChange(index, 'username', e.target.value)} className="mt-1" />
                                      </div>
                                      
                                      <div className="space-y-2">
                                          <Label htmlFor={`admin-password-${index}`}>Nueva Contraseña</Label>
                                          <div className="relative">
                                              <Input
                                                  id={`admin-password-${index}`}
                                                  type={showPasswords[index] ? 'text' : 'password'}
                                                  placeholder="Dejar en blanco para no cambiar"
                                                  value={user.password}
                                                  onChange={e => handleUserChange(index, 'password', e.target.value)}
                                                  className="pr-10"
                                              />
                                              <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                                                  onClick={() => setShowPasswords(p => { const newP = [...p]; newP[index] = !newP[index]; return newP; })}
                                              >
                                                  {showPasswords[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                  <span className="sr-only">Toggle password visibility</span>
                                              </Button>
                                          </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                          <Label htmlFor={`admin-repeat-password-${index}`}>Repetir Contraseña</Label>
                                           <div className="relative">
                                              <Input
                                                  id={`admin-repeat-password-${index}`}
                                                  type={showRepeatPasswords[index] ? 'text' : 'password'}
                                                  placeholder="Repite la nueva contraseña"
                                                  value={user.repeatPassword}
                                                  onChange={e => handleUserChange(index, 'repeatPassword', e.target.value)}
                                                  className="pr-10"
                                                  disabled={!user.password}
                                              />
                                               <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                                                  onClick={() => setShowRepeatPasswords(p => { const newP = [...p]; newP[index] = !newP[index]; return newP; })}
                                                  disabled={!user.password}
                                                >
                                                  {showRepeatPasswords[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                  <span className="sr-only">Toggle password visibility</span>
                                              </Button>
                                          </div>
                                          {user.password && user.repeatPassword && user.password !== user.repeatPassword && (
                                              <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>
                                          )}
                                      </div>
                                  </div>
                                  <CardFooter className="px-0 pt-6 pb-0">
                                     <Button type="submit" disabled={isSavingUser[index] || !initialSettingsLoaded}>
                                        {isSavingUser[index] ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Guardar Usuario {index + 1}
                                            </>
                                        )}
                                      </Button>
                                  </CardFooter>
                                </form>
                              </Card>
                          ))}
                      </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="services">
                <Card className="mt-6">
                  <form onSubmit={handleSaveSmtp}>
                    <CardHeader>
                      <CardTitle>Configuración de Correo (SMTP)</CardTitle>
                        <CardDescription>
                          Credenciales para el envío de correos desde los formularios de contacto. Compatible con Gmail (usando Contraseñas de Aplicación).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isSavingSmtp || !initialSettingsLoaded}>
                        {isSavingSmtp ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Configuración SMTP
                            </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
            </TabsContent>
            <TabsContent value="images">
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                      <CardTitle>Imagen por Defecto para Pastillas</CardTitle>
                      <CardDescription>
                        Esta imagen se usa si un producto de la categoría "Pastillas" no tiene su propia imagen. Se gestiona desde el código.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Vista previa actual</Label>
                        <div className="h-32 w-full bg-muted rounded-md flex items-center justify-center border">
                            <Image src={DEFAULT_PASTILLA_IMAGE_URL} alt="Vista previa de imagen para pastillas" width={128} height={128} className="object-contain h-32 w-32" />
                        </div>
                      </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                      <CardTitle>Imagen por Defecto para Discos</CardTitle>
                       <CardDescription>
                        Esta imagen se usa si un producto de la categoría "Discos" no tiene su propia imagen. Se gestiona desde el código.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Vista previa actual</Label>
                        <div className="h-32 w-full bg-muted rounded-md flex items-center justify-center border">
                           <Image src={DEFAULT_DISCO_IMAGE_URL} alt="Vista previa de imagen para discos" width={128} height={128} className="object-contain h-32 w-32" />
                        </div>
                      </div>
                    </CardContent>
                </Card>
              </div>
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
            
            <div className="relative mb-6">
              <Input
                placeholder="Buscar por ID, código, nombre, marca..."
                className="pl-10"
                value={adminSearchTerm}
                onChange={(e) => setAdminSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[100px]">Imagen</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Compatibilidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Oferta</TableHead>
                    <TableHead className="text-center">Destacado</TableHead>
                    <TableHead className="w-[120px] text-center">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedAdminProducts.length > 0 ? paginatedAdminProducts.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.id}</TableCell>
                        <TableCell>
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={`Imagen de ${product.name}`}
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                              data-ai-hint={product.category === 'Pastillas' ? 'brake pad' : 'brake disc'}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                              {product.category === 'Pastillas' ? <BrakePadIcon className="h-6 w-6" /> : <BrakeDiscIcon className="h-6 w-6" />}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.compatibility}</TableCell>
                        <TableCell className="text-right">
                          {product.isOnSale && typeof product.salePrice === 'number' && product.salePrice > 0 ? (
                              <div className='flex flex-col items-end'>
                                <span className="line-through text-muted-foreground text-xs">{formatPrice(product.price)}</span>
                                <span className="text-primary font-bold">{formatPrice(product.salePrice)}</span>
                              </div>
                            ) : (
                              formatPrice(product.price)
                            )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleOnSale(product)}>
                            <Percent className={cn("h-5 w-5", product.isOnSale ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                            <span className="sr-only">Toggle Oferta</span>
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(product)}>
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
                    )) : (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                          {products.length === 0 ? "No hay productos para mostrar. Intenta añadirlos." : "No se encontraron productos con el término de búsqueda."}
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Anterior
                    </Button>
                    <span className="text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                    >
                        Siguiente
                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}
        </TabsContent>
      </Tabs>

      <ProductFormDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddOrUpdateProduct}
        title="Añadir Nuevo Producto"
        nextProductId={nextProductId}
      />

      {productToEdit && (
         <ProductFormDialog
           isOpen={isEditDialogOpen}
           onOpenChange={setIsEditDialogOpen}
           onSave={handleAddOrUpdateProduct}
           product={productToEdit}
           title="Editar Producto"
         />
      )}
    </div>
  );
}

interface ProductFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (product: Product) => void;
    product?: Product | null;
    title: string;
    nextProductId?: number;
}

function ProductFormDialog({ isOpen, onOpenChange, onSave, product, title, nextProductId }: ProductFormDialogProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const getInitialFormData = () => ({
        id: product ? product.id : nextProductId || 0,
        code: product?.code || '',
        name: product?.name || '',
        brand: product?.brand || '',
        model: product?.model || '',
        compatibility: product?.compatibility || '',
        price: product ? String(product.price) : '',
        category: product?.category || 'Pastillas',
        isFeatured: product?.isFeatured || false,
        imageUrl: product?.imageUrl || '',
        isOnSale: product?.isOnSale || false,
        salePrice: product?.salePrice != null ? String(product.salePrice) : '',
    });
    
    const [formData, setFormData] = useState(getInitialFormData());
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // This now correctly resets the form state each time the dialog opens.
            const initialData = {
                id: product ? product.id : nextProductId || 0,
                code: product?.code || '',
                name: product?.name || '',
                brand: product?.brand || '',
                model: product?.model || '',
                compatibility: product?.compatibility || '',
                price: product ? String(product.price) : '',
                category: product?.category || 'Pastillas',
                isFeatured: product?.isFeatured || false,
                imageUrl: product?.imageUrl || '',
                isOnSale: product?.isOnSale || false,
                salePrice: product?.salePrice != null ? String(product.salePrice) : '',
            };
            setFormData(initialData);
            setImagePreview(product?.imageUrl || null);
            setImageFile(null); 
        }
    }, [isOpen, product, nextProductId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        
        if (id === 'price' || id === 'salePrice') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                [id]: numericValue,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [id]: value
            }));
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCategoryChange = (value: string) => {
        if (value) {
            setFormData(prev => ({ ...prev, category: value }));
        }
    };
    
    const handleSwitchChange = (id: 'isFeatured' | 'isOnSale', checked: boolean) => {
        setFormData(prev => ({ 
            ...prev, 
            [id]: checked,
            // Reset sale price if sale is toggled off
            ...(id === 'isOnSale' && !checked && { salePrice: '' }) 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalImageUrl: string | null = formData.imageUrl || null;
    
        if (imageFile) {
            setIsUploading(true);
            if (!formData.code) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'El código del producto es obligatorio para subir una imagen.',
                });
                setIsUploading(false);
                return;
            }
            
            try {
                const fileAsDataUrl = await fileToDataUrl(imageFile);
                const result = await uploadImage({
                    fileAsDataUrl,
                    fileName: formData.code,
                    uploadDir: 'repufrenos/products'
                });

                if (result.success) {
                    finalImageUrl = result.filePath;
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Error al Subir Imagen',
                        description: result.error,
                    });
                    setIsUploading(false);
                    return;
                }
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: 'Error de Archivo',
                    description: 'No se pudo procesar el archivo para la subida.',
                });
                setIsUploading(false);
                return;
            }
        }

        const productToSave: Product = {
            ...formData,
            id: product ? product.id : nextProductId!,
            price: Number(formData.price) || 0,
            salePrice: formData.isOnSale ? (Number(formData.salePrice) || undefined) : undefined,
            imageUrl: finalImageUrl,
        };

        setIsUploading(false);
        onSave(productToSave);
    };

    const isSaving = isUploading || isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl bg-card">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="id" className="text-right">ID</Label>
                            <Input id="id" type="number" value={formData.id} onChange={handleChange} required className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">Código</Label>
                            <Input id="code" value={formData.code} onChange={handleChange} required className="col-span-3" />
                        </div>
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
                            <Input id="price" type="text" value={formData.price} onChange={handleChange} required className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="image" className="text-right pt-2">Imagen</Label>
                            <div className="col-span-3 flex items-center gap-4">
                               {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Vista previa de la imagen"
                                        width={64}
                                        height={64}
                                        className="rounded-md object-cover h-16 w-16"
                                    />
                                ) : (
                                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                                        <Cloud className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <Input id="image" type="file" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="col-span-3" />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Estado</Label>
                            <div className="col-span-3 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                  <Switch
                                      id="isFeatured"
                                      checked={formData.isFeatured}
                                      onCheckedChange={(c) => handleSwitchChange('isFeatured', c)}
                                  />
                                  <Label htmlFor="isFeatured">Destacado</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                      id="isOnSale"
                                      checked={!!formData.isOnSale}
                                      onCheckedChange={(c) => handleSwitchChange('isOnSale', c)}
                                  />
                                  <Label htmlFor="isOnSale">En Oferta</Label>
                                </div>
                            </div>
                        </div>
                        {formData.isOnSale && (
                           <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="salePrice" className="text-right">Precio de Oferta</Label>
                              <Input id="salePrice" type="text" value={formData.salePrice} onChange={handleChange} required={!!formData.isOnSale} className="col-span-3" />
                          </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

    