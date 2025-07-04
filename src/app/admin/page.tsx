
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Pencil, Trash2, PlusCircle, LogIn, LogOut, Star, Phone, Settings, Save, Package, Mail, Loader2, Search, Users, Eye, EyeOff } from 'lucide-react';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { verifyCredentials } from '@/actions/auth';
import { saveEnvSettings } from '@/actions/saveEnv';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAdminSettingsForForm } from '@/actions/getAdminSettings';


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  
  // State for settings
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [contactName, setContactName] = useState('');

  // State for .env settings form
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
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

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

    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadInitialSettings = async () => {
        if (isAuthenticated && !initialSettingsLoaded) {
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
    };
    
    loadInitialSettings();
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
        setError('');
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
    setInitialSettingsLoaded(false); // Reset for next login
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
      // Solo envía la contraseña si se ha ingresado una nueva
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
          
          // Limpiar solo los campos de contraseña del usuario guardado
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

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (!isMounted) {
    return null; // Or a loading spinner
  }

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
          <TabsTrigger value="products"><Package className="mr-2 h-4 w-4" />Gestión de Productos</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Configuración General</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contact"><Phone className="mr-2 h-4 w-4" />Contacto</TabsTrigger>
              <TabsTrigger value="email"><Users className="mr-2 h-4 w-4" />Usuarios y Correo</TabsTrigger>
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
            <TabsContent value="email">
                <div className="mt-6 space-y-6">
                    <div>
                      <CardHeader className="px-0">
                        <CardTitle>Gestión de Usuarios Administradores</CardTitle>
                        <CardDescription>
                            Puedes configurar hasta 3 usuarios. Un campo de contraseña vacío significa que no se cambiará.
                        </CardDescription>
                      </CardHeader>
                      <div className="space-y-4">
                          {adminUsers.map((user, index) => (
                              <Card key={index}>
                                <form onSubmit={(e) => handleSaveUser(e, index)}>
                                  <CardContent className="p-6 space-y-4">
                                      <div>
                                          <Label htmlFor={`admin-username-${index}`}>
                                            Usuario {index + 1} {savedUsernames[index] ? `(${savedUsernames[index]})` : ''}
                                          </Label>
                                          <Input id={`admin-username-${index}`} placeholder="Nombre de usuario" value={user.username} onChange={e => handleUserChange(index, 'username', e.target.value)} className="mt-1" />
                                      </div>
                                      
                                      <div className="space-y-2">
                                          <Label htmlFor={`admin-password-${index}`}>Nueva Contraseña Usuario {index + 1}</Label>
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
                                  </CardContent>
                                  <CardFooter>
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
                      </div>
                    </div>
                    
                    <Card className="mt-6">
                      <form onSubmit={handleSaveSmtp}>
                        <CardHeader>
                          <CardTitle>Configuración de Correo (SMTP)</CardTitle>
                           <CardDescription>
                              Gestiona las credenciales para el envío de correos.
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
                                    Guardar Configuración de Correo
                                </>
                            )}
                          </Button>
                        </CardFooter>
                      </form>
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
                placeholder="Buscar por ID, nombre, marca, modelo..."
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
                    {paginatedAdminProducts.map((product) => (
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
        onSave={handleAddProduct}
        title="Añadir Nuevo Producto"
      />

      {productToEdit && (
         <ProductFormDialog
           isOpen={isEditDialogOpen}
           onOpenChange={setIsEditDialogOpen}
           onSave={handleUpdateProduct}
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
    onSave: (product: any) => void;
    product?: Product | null;
    title: string;
}

function ProductFormDialog({ isOpen, onOpenChange, onSave, product, title }: ProductFormDialogProps) {
    const getInitialFormData = () => ({
        name: '', brand: '', model: '', compatibility: '', price: 0, category: '', isFeatured: false, imageUrl: '',
    });
    
    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            const initialData = product ? { ...product, imageUrl: product.imageUrl || '' } : getInitialFormData();
            setFormData(initialData);
        }
    }, [isOpen, product]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = product ? { ...formData, id: product.id } : formData;
        onSave(dataToSave);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl bg-card">
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="imageUrl" className="text-right">URL de la Imagen</Label>
                            <Input id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.png" className="col-span-3" />
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
