'use client';

import Link from "next/link";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FF</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">FutureFit</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Login Button */}
          <Button 
            onClick={() => router.push('/login')}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 transition-colors duration-200"
          >
            Login
          </Button>

          {/* Register Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowRegisterMenu(!showRegisterMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              <span>Register</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showRegisterMenu ? 'rotate-180' : ''}`} />
            </Button>

            {/* Register Dropdown Menu */}
            {showRegisterMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <Link 
                    href="/register/candidate"
                    className="flex flex-col px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                  >
                    <span className="font-medium">Candidate</span>
                    <span className="text-xs text-gray-500 mt-1">Find your dream job</span>
                  </Link>
                  <Link 
                    href="/register/employer"
                    className="flex flex-col px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                  >
                    <span className="font-medium">Employer</span>
                    <span className="text-xs text-gray-500 mt-1">Hire top talent</span>
                  </Link>
                  <Link 
                    href="/register/mis"
                    className="flex flex-col px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                  >
                    <span className="font-medium">MIS</span>
                    <span className="text-xs text-gray-500 mt-1">Management system</span>
                  </Link>
                  <Link 
                    href="/register/agency"
                    className="flex flex-col px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                  >
                    <span className="font-medium">Agency</span>
                    <span className="text-xs text-gray-500 mt-1">Recruitment services</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-6 py-4 space-y-4">
            <Button 
              onClick={() => router.push('/login')}
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 transition-colors duration-200"
            >
              Login
            </Button>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900 mb-3">Register as:</div>
              <Link 
                href="/register/candidate"
                className="block p-3 rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                <div className="font-medium text-gray-900">Candidate</div>
                <div className="text-sm text-gray-500">Find your dream job</div>
              </Link>
              <Link 
                href="/register/employer"
                className="block p-3 rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                <div className="font-medium text-gray-900">Employer</div>
                <div className="text-sm text-gray-500">Hire top talent</div>
              </Link>
              <Link 
                href="/register/mis"
                className="block p-3 rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                <div className="font-medium text-gray-900">MIS</div>
                <div className="text-sm text-gray-500">Management system</div>
              </Link>
              <Link 
                href="/register/agency"
                className="block p-3 rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                <div className="font-medium text-gray-900">Agency</div>
                <div className="text-sm text-gray-500">Recruitment services</div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}