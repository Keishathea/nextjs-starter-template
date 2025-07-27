"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const features = [
    {
      title: "Scan for Diseases",
      description: "Detect rice diseases through image scanning",
      href: "/disease-scanner",
      icon: "📱"
    },
    {
      title: "Translate Text",
      description: "English to Filipino translation for farming terms",
      href: "/translate",
      icon: "🌐"
    },
    {
      title: "Find Vendors",
      description: "Locate legitimate pest control solution vendors",
      href: "/vendor-suggestions",
      icon: "🏪"
    },
    {
      title: "Update Diseases",
      description: "Manage rice disease database",
      href: "/update-diseases",
      icon: "📝"
    },
    {
      title: "Report Disease",
      description: "Report unknown diseases to authorities",
      href: "/report-disease",
      icon: "📋"
    }
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Status Banner */}
      <div className={`p-3 rounded-lg text-center text-sm font-medium ${
        isOnline 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {isOnline ? '🟢 Online - All features available' : '🔴 Offline - Limited features available'}
      </div>

      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome to AgriScan
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Your comprehensive mobile solution for rice disease detection, 
          treatment guidance, and agricultural support.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-green-600">5+</div>
            <div className="text-xs text-gray-600">Diseases</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-blue-600">8+</div>
            <div className="text-xs text-gray-600">Vendors</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-purple-600">100+</div>
            <div className="text-xs text-gray-600">Translations</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Features */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Main Features
        </h3>
        
        {features.map((feature, index) => (
          <Link key={index} href={feature.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1">
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </div>
                  <span className="text-gray-400 text-lg">›</span>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Emergency Contact */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-800 text-base flex items-center space-x-2">
            <span>🚨</span>
            <span>Emergency Support</span>
          </CardTitle>
          <CardDescription className="text-red-700 text-sm">
            For urgent agricultural concerns, contact the Department of Agriculture:
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-red-300 text-red-800 hover:bg-red-100"
            onClick={() => window.open('tel:+63288444601', '_self')}
          >
            Call DA Hotline: (02) 8844-4601
          </Button>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-base flex items-center space-x-2">
            <span>💡</span>
            <span>Quick Tip</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-blue-700 text-sm">
            For best disease detection results, take clear photos of affected plant parts 
            in good lighting conditions. Multiple angles help improve accuracy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
