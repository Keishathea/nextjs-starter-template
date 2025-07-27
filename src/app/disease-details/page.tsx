"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'

interface Disease {
  id: string
  name: string
  description: string
  symptoms: string[]
  solutions: string[]
  prevention: string[]
  severity: string
  commonAreas: string[]
}

export default function DiseaseDetailsPage() {
  const [disease, setDisease] = useState<Disease | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const diseaseId = searchParams.get('id')

  useEffect(() => {
    const fetchDiseaseDetails = async () => {
      if (!diseaseId) {
        setError('No disease ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/data/diseases.json')
        if (!response.ok) {
          throw new Error('Failed to load disease data')
        }
        
        const diseases: Disease[] = await response.json()
        const foundDisease = diseases.find(d => d.id === diseaseId)
        
        if (!foundDisease) {
          throw new Error('Disease not found')
        }
        
        setDisease(foundDisease)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDiseaseDetails()
  }, [diseaseId])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Loading disease details...</p>
        </div>
      </div>
    )
  }

  if (error || !disease) {
    return (
      <div className="p-4 space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 text-4xl mb-4">❌</div>
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Disease Details
            </h2>
            <p className="text-red-700 mb-4">
              {error || 'Disease not found'}
            </p>
            <div className="space-y-2">
              <Link href="/disease-scanner">
                <Button variant="outline" className="w-full">
                  🔍 Scan Another Image
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  🏠 Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{disease.name}</h1>
          <Badge className={`${getSeverityColor(disease.severity)} border`}>
            {disease.severity} Risk
          </Badge>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {disease.description}
        </p>
      </div>

      {/* Common Areas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <span>🗺️</span>
            <span>Common Areas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {disease.commonAreas.map((area, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="symptoms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="prevention">Prevention</TabsTrigger>
        </TabsList>

        <TabsContent value="symptoms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>🔍</span>
                <span>Disease Symptoms</span>
              </CardTitle>
              <CardDescription>
                Key signs to identify {disease.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {disease.symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-700 text-sm flex-1">{symptom}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solutions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>💊</span>
                <span>Treatment Solutions</span>
              </CardTitle>
              <CardDescription>
                Recommended treatments for {disease.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {disease.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700 text-sm flex-1">{solution}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Find Vendors Button */}
          <Link href="/vendor-suggestions">
            <Button className="w-full" size="lg">
              🏪 Find Treatment Vendors
            </Button>
          </Link>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>🛡️</span>
                <span>Prevention Methods</span>
              </CardTitle>
              <CardDescription>
                How to prevent {disease.name} in your crops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {disease.prevention.map((method, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">🛡️</span>
                    <span className="text-gray-700 text-sm flex-1">{method}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Emergency Actions */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-800 text-base flex items-center space-x-2">
            <span>⚠️</span>
            <span>Need Immediate Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-orange-700 text-sm">
            If this disease is spreading rapidly or you need expert consultation:
          </p>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-orange-300 text-orange-800 hover:bg-orange-100"
              onClick={() => window.open('tel:+63288444601', '_self')}
            >
              📞 Call DA Hotline: (02) 8844-4601
            </Button>
            <Link href="/report-disease">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-orange-300 text-orange-800 hover:bg-orange-100"
              >
                📋 Report Severe Outbreak
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/disease-scanner">
          <Button variant="outline" className="w-full">
            🔍 Scan Again
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full">
            🏠 Home
          </Button>
        </Link>
      </div>

      {/* Additional Resources */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 text-base flex items-center space-x-2">
            <span>📚</span>
            <span>Additional Resources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Link href="/translate">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-blue-700 hover:bg-blue-100"
              >
                🌐 Translate to Filipino
              </Button>
            </Link>
            <Link href="/vendor-suggestions">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-blue-700 hover:bg-blue-100"
              >
                🏪 Find Local Vendors
              </Button>
            </Link>
            <Link href="/update-diseases">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-blue-700 hover:bg-blue-100"
              >
                📝 Update Disease Info
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
