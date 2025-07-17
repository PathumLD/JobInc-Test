'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  UserPlus, 
  Loader2,
  Home,
  ChevronLeft,
  ChevronRight,
  Star,
  Briefcase,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Sample advertisement banners data for registration
const registrationBanners = [
  {
    id: 1,
    title: "Start Your Career Journey!",
    subtitle: "Join millions of professionals building their future with us",
    bgColor: "from-emerald-600 to-teal-600",
    stats: "Join 2M+ Users",
    icon: UserPlus
  },
  {
    id: 2,
    title: "Connect with Top Employers",
    subtitle: "Get noticed by leading companies actively hiring talent",
    bgColor: "from-blue-600 to-indigo-600",
    stats: "3,000+ Companies",
    icon: Briefcase
  },
  {
    id: 3,
    title: "Secure & Trusted Platform",
    subtitle: "Your data is protected with enterprise-grade security",
    bgColor: "from-purple-600 to-violet-600",
    stats: "100% Secure",
    icon: Shield
  },
  {
    id: 4,
    title: "Fast & Easy Applications",
    subtitle: "Apply to multiple jobs with one click using our smart tools",
    bgColor: "from-orange-600 to-pink-600",
    stats: "Quick Apply",
    icon: Zap
  }
];

const features = [
  { icon: UserPlus, text: "Easy Registration", color: "text-emerald-600" },
  { icon: Globe, text: "Global Opportunities", color: "text-blue-600" },
  { icon: Shield, text: "Secure Platform", color: "text-purple-600" },
  { icon: Star, text: "Trusted by Millions", color: "text-orange-600" }
];

export default function RegisterPage({ role = 'employee' }: { role?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % registrationBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'employee':
        return 'Employee';
      case 'employer':
        return 'Employer';
      case 'mis':
        return 'MIS';
      case 'agency':
        return 'Agency';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role.toLowerCase()) {
      case 'employee':
        return 'Find your dream job and advance your career';
      case 'employer':
        return 'Hire top talent for your organization';
      case 'mis':
        return 'Manage information systems and processes';
      case 'agency':
        return 'Connect talent with opportunities';
      default:
        return 'Join our platform and get started';
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { strength, label: labels[strength - 1] || '' };
  };

  const passwordStrength = getPasswordStrength(password || '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'OTP has been sent. Check your email!' });
        reset();
        setTimeout(() => {
          window.location.href = '/verify-email/?email=' + encodeURIComponent(data.email);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Registration failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % registrationBanners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + registrationBanners.length) % registrationBanners.length);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left Side - Advertisements (2/3) */}
      <div className="w-2/3 relative overflow-hidden">
        {/* Banner Carousel */}
        <div className="relative h-full">
          {registrationBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`h-full bg-gradient-to-br ${banner.bgColor} relative overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-center items-center text-center text-white p-8 lg:p-16">
                  <div className="max-w-2xl">
                    {/* Large Icon */}
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8">
                      <banner.icon className="h-12 w-12 text-white" />
                    </div>
                    
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                      {banner.title}
                    </h1>
                    <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
                      {banner.subtitle}
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block mb-12">
                      <span className="text-lg font-semibold">{banner.stats}</span>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevBanner}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 group"
          >
            <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          <button
            onClick={nextBanner}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 group"
          >
            <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
            {registrationBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentBanner
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Features Strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200">
          <div className="flex justify-around items-center py-6 px-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm font-medium">
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                <span className="text-gray-700 hidden sm:inline">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Register Form (1/3) */}
      <div className="w-1/3 flex flex-col bg-white overflow-hidden">
        {/* Top Navigation */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">JP</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Job Portal</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors duration-200"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Register as {getRoleDisplayName(role)}
              </h2>
              <p className="text-gray-600 text-xs">
                {getRoleDescription(role)}
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`flex items-center gap-2 p-3 mb-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="text-xs font-medium">{message.text}</span>
              </div>
            )}

            {/* Register Form */}
            <div onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email address"
                    className={`pl-10 h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    {...register('email')} 
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className={`pl-10 pr-10 h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    {...register('password')} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                            level <= passwordStrength.strength
                              ? level <= 2 ? 'bg-red-500' : level <= 3 ? 'bg-yellow-500' : 'bg-blue-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p className="text-xs text-gray-600">
                        Strength: <span className="font-medium">{passwordStrength.label}</span>
                      </p>
                    )}
                  </div>
                )}
                
                {errors.password && (
                  <p className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className={`pl-10 pr-10 h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    {...register('confirmPassword')} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {confirmPassword && password && (
                  <div className="flex items-center gap-1 text-xs">
                    {confirmPassword === password ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-blue-600" />
                        <span className="text-blue-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-600" />
                        <span className="text-red-600">Passwords don&#39;t match</span>
                      </>
                    )}
                  </div>
                )}
                
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                onClick={handleSubmit(onSubmit)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 h-9 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}