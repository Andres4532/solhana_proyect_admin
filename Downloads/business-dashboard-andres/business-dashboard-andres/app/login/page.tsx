"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Loader2, Building2, Mail, Lock, User, Phone } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    categoryName: '',
    categoryCode: '',
    companyPrice: 'normal'
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      router.push('/');
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await register(registerData);
    
    if (result.success) {
      router.push('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Business Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your business operations efficiently
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={isLogin ? "login" : "register"} onValueChange={(value) => setIsLogin(value === "login")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="mt-1 block w-full"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="mt-1 block w-full"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="register">
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        required
                        className="mt-1 block w-full"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="mt-1 block w-full"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="mt-1 block w-full"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                        Category Name
                      </Label>
                      <Input
                        id="categoryName"
                        type="text"
                        autoComplete="categoryName"
                        required
                        className="mt-1 block w-full"
                        value={registerData.categoryName}
                        onChange={(e) => setRegisterData({ ...registerData, categoryName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryCode" className="block text-sm font-medium text-gray-700">
                        Category Code
                      </Label>
                      <Input
                        id="categoryCode"
                        type="text"
                        autoComplete="categoryCode"
                        required
                        className="mt-1 block w-full"
                        value={registerData.categoryCode}
                        onChange={(e) => setRegisterData({ ...registerData, categoryCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPrice" className="block text-sm font-medium text-gray-700">
                        Company Price
                      </Label>
                      <select
                        id="companyPrice"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={registerData.companyPrice}
                        onChange={(e) => setRegisterData({ ...registerData, companyPrice: e.target.value })}
                      >
                        <option value="normal">Normal</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
} 