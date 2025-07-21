'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { signIn } from 'next-auth/react';
import { jwtDecode } from 'jwt-decode';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Home, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Chrome,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  Briefcase,
  TrendingUp
} from 'lucide-react';

// Sample advertisement banners data
const advertisementBanners = [
  {
    id: 1,
    title: "Find Your Dream Job Today!",
    subtitle: "Join thousands of professionals who found their perfect career match",
    image: "/api/placeholder/600/400",
    bgColor: "from-blue-600 to-purple-600",
    stats: "50,000+ Jobs Available"
  },
  {
    id: 2,
    title: "Top Companies Are Hiring",
    subtitle: "Connect with leading employers in tech, finance, healthcare and more",
    image: "/api/placeholder/600/400", 
    bgColor: "from-green-600 to-teal-600",
    stats: "2,000+ Partner Companies"
  },
  {
    id: 3,
    title: "Advance Your Career",
    subtitle: "Access premium job opportunities and career development resources",
    image: "/api/placeholder/600/400",
    bgColor: "from-purple-600 to-pink-600", 
    stats: "95% Success Rate"
  },
  {
    id: 4,
    title: "Remote Work Opportunities",
    subtitle: "Discover flexible remote positions from companies worldwide",
    image: "/api/placeholder/600/400",
    bgColor: "from-orange-600 to-red-600",
    stats: "30,000+ Remote Jobs"
  }
];

const features = [
  { icon: Briefcase, text: "50,000+ Active Jobs", color: "text-blue-600" },
  { icon: Users, text: "2M+ Job Seekers", color: "text-green-600" },
  { icon: TrendingUp, text: "95% Success Rate", color: "text-purple-600" },
  { icon: Star, text: "4.9/5 User Rating", color: "text-orange-600" }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % advertisementBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced function to check if candidate has completed profile
  const checkCandidateProfileStatus = async (token: string) => {
    try {
      const response = await fetch('/api/candidate/profile/display-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        // Profile doesn't exist
        return { hasProfile: false, isCreated: false };
      }
      
      if (response.ok) {
        const profileData = await response.json();
        // Check if profile exists and is_created is true
        return { 
          hasProfile: true, 
          isCreated: profileData.is_created === true 
        };
      }
      
      // If other error, assume no profile
      return { hasProfile: false, isCreated: false };
    } catch (error) {
      console.error('Error checking profile status:', error);
      return { hasProfile: false, isCreated: false };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        
        const payload = jwtDecode<{ role: string; userId: string }>(data.token);
        let dashboardPath = '/dashboard';
        let redirectMessage = 'Login successful! Redirecting...';
        
        if (payload.role === 'candidate') {
          // For candidates, check both API response and profile status
          const profileStatus = await checkCandidateProfileStatus(data.token);
          
          console.log('Profile check results:', {
            apiResponse: data.is_created,
            profileCheck: profileStatus
          });

          // Redirect to profile creation if:
          // 1. API says profile is not created (is_created === false), OR
          // 2. Profile check shows no profile or incomplete profile
          if (data.is_created === false || !profileStatus.hasProfile || !profileStatus.isCreated) {
            dashboardPath = '/candidate/profile/create-profile';
            redirectMessage = 'Welcome! Let\'s create your profile...';
            setMessage({ type: 'success', text: redirectMessage });
          } else {
            // Profile exists and is complete
            dashboardPath = '/candidate/dashboard';
            setMessage({ type: 'success', text: redirectMessage });
          }
        } else if (payload.role === 'employer') {
          dashboardPath = '/employer/dashboard';
          setMessage({ type: 'success', text: redirectMessage });
        } else if (payload.role === 'mis') {
          dashboardPath = '/mis/dashboard';
          setMessage({ type: 'success', text: redirectMessage });
        } else if (payload.role === 'agency') {
          dashboardPath = '/agency/dashboard';
          setMessage({ type: 'success', text: redirectMessage });
        } else {
          setMessage({ type: 'success', text: redirectMessage });
        }
        
        // Redirect after showing success message
        setTimeout(() => {
          window.location.href = dashboardPath;
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { 
        callbackUrl: '/auth/callback' // You might want to handle Google OAuth callback separately
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      setMessage({ type: 'error', text: 'Google sign-in failed. Please try again.' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % advertisementBanners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + advertisementBanners.length) % advertisementBanners.length);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left Side - Advertisements (2/3) */}
      <div className="w-2/3 relative overflow-hidden">
        {/* Banner Carousel */}
        <div className="relative h-full">
          {advertisementBanners.map((banner, index) => (
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
            {advertisementBanners.map((_, index) => (
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

      {/* Right Side - Login Form (1/3) */}
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
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm">
              Sign in to access your account
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`flex items-center gap-3 p-4 mb-6 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <a 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </a>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 h-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 h-10"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Chrome className="h-4 w-4 mr-2" />
                  Sign in with Google
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
      </div>
  );
}