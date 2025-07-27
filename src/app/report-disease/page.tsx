"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import Link from "next/link"
import Image from "next/image"

interface ReportFormData {
  farmerName: string
  contactNumber: string
  email: string
  farmLocation: string
  region: string
  diseaseName: string
  description: string
  symptoms: string
  affectedArea: string
  firstNoticed: string
  spreadingRate: 'slow' | 'moderate' | 'fast'
  previousTreatments: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  consentToContact: boolean
  consentToShare: boolean
}

export default function ReportDiseasePage() {
  const [formData, setFormData] = useState<ReportFormData>({
    farmerName: '',
    contactNumber: '',
    email: '',
    farmLocation: '',
    region: '',
    diseaseName: '',
    description: '',
    symptoms: '',
    affectedArea: '',
    firstNoticed: '',
    spreadingRate: 'moderate',
    previousTreatments: '',
    urgencyLevel: 'medium',
    consentToContact: false,
    consentToShare: false
  })
  
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isOnline } = useNetworkStatus()

  const regions = [
    'National Capital Region (NCR)',
    'Cordillera Administrative Region (CAR)',
    'Region I (Ilocos Region)',
    'Region II (Cagayan Valley)',
    'Region III (Central Luzon)',
    'Region IV-A (CALABARZON)',
    'Region IV-B (MIMAROPA)',
    'Region V (Bicol Region)',
    'Region VI (Western Visayas)',
    'Region VII (Central Visayas)',
    'Region VIII (Eastern Visayas)',
    'Region IX (Zamboanga Peninsula)',
    'Region X (Northern Mindanao)',
    'Region XI (Davao Region)',
    'Region XII (SOCCSKSARGEN)',
    'Region XIII (Caraga)',
    'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)'
  ]

  const handleInputChange = (field: keyof ReportFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (images.length + files.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`)
        return false
      }
      return true
    })

    setImages(prev => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = (): string | null => {
    if (!formData.farmerName.trim()) return 'Farmer name is required'
    if (!formData.contactNumber.trim()) return 'Contact number is required'
    if (!formData.farmLocation.trim()) return 'Farm location is required'
    if (!formData.region) return 'Region is required'
    if (!formData.diseaseName.trim()) return 'Disease name is required'
    if (!formData.description.trim()) return 'Disease description is required'
    if (!formData.symptoms.trim()) return 'Symptoms are required'
    if (!formData.consentToContact) return 'Consent to contact is required'
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }

    if (!isOnline) {
      alert('Internet connection required to submit reports')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real app, this would send data to the Department of Agriculture API
      const reportData = {
        ...formData,
        images: images.map(img => img.name),
        submittedAt: new Date().toISOString(),
        reportId: `RPT-${Date.now()}`
      }

      console.log('Report submitted:', reportData)
      
      // Simulate successful submission
      setSubmitted(true)
      
    } catch (error) {
      setSubmitError('Failed to submit report. Please try again.')
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (submitted) {
    return (
      <div className="p-4 space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">
              Report Submitted Successfully
            </h2>
            <p className="text-green-700 mb-4">
              Your disease report has been sent to the Department of Agriculture. 
              You will receive a confirmation email shortly.
            </p>
            <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
              <div className="text-sm text-gray-600">
                <strong>Report ID:</strong> RPT-{Date.now()}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Submitted:</strong> {new Date().toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => {
                  setSubmitted(false)
                  setFormData({
                    farmerName: '',
                    contactNumber: '',
                    email: '',
                    farmLocation: '',
                    region: '',
                    diseaseName: '',
                    description: '',
                    symptoms: '',
                    affectedArea: '',
                    firstNoticed: '',
                    spreadingRate: 'moderate',
                    previousTreatments: '',
                    urgencyLevel: 'medium',
                    consentToContact: false,
                    consentToShare: false
                  })
                  setImages([])
                  setImagePreviews([])
                }}
                className="w-full"
              >
                📋 Submit Another Report
              </Button>
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
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Report Unknown Disease</h1>
        <p className="text-gray-600 text-sm">
          Help the Department of Agriculture track and respond to new rice diseases
        </p>
      </div>

      {/* Status Banner */}
      <div className={`p-3 rounded-lg text-center text-sm font-medium ${
        isOnline 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {isOnline 
          ? '🟢 Online - Ready to submit reports' 
          : '🔴 Offline - Internet connection required for submission'
        }
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Farmer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>👤</span>
              <span>Farmer Information</span>
            </CardTitle>
            <CardDescription>
              Your contact details for follow-up communication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name *</label>
                <Input
                  value={formData.farmerName}
                  onChange={(e) => handleInputChange('farmerName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Contact Number *</label>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farm Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>📍</span>
              <span>Farm Location</span>
            </CardTitle>
            <CardDescription>
              Location details of the affected farm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Farm Address *</label>
              <Textarea
                value={formData.farmLocation}
                onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                placeholder="Complete farm address including barangay, municipality, and province"
                className="min-h-[80px]"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Region *</label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Disease Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>🦠</span>
              <span>Disease Information</span>
            </CardTitle>
            <CardDescription>
              Detailed information about the unknown disease
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Disease Name/Type *</label>
              <Input
                value={formData.diseaseName}
                onChange={(e) => handleInputChange('diseaseName', e.target.value)}
                placeholder="What do you call this disease or what type do you think it is?"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Detailed Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the disease in detail - what does it look like, how does it behave, etc."
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Symptoms Observed *</label>
              <Textarea
                value={formData.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                placeholder="List all symptoms you've observed (leaf discoloration, spots, wilting, etc.)"
                className="min-h-[80px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Affected Area</label>
                <Input
                  value={formData.affectedArea}
                  onChange={(e) => handleInputChange('affectedArea', e.target.value)}
                  placeholder="e.g., 2 hectares"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">First Noticed</label>
                <Input
                  type="date"
                  value={formData.firstNoticed}
                  onChange={(e) => handleInputChange('firstNoticed', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Spreading Rate</label>
                <Select value={formData.spreadingRate} onValueChange={(value: 'slow' | 'moderate' | 'fast') => handleInputChange('spreadingRate', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Urgency Level</label>
                <Select value={formData.urgencyLevel} onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => handleInputChange('urgencyLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Previous Treatments Tried</label>
              <Textarea
                value={formData.previousTreatments}
                onChange={(e) => handleInputChange('previousTreatments', e.target.value)}
                placeholder="List any treatments, pesticides, or remedies you've already tried"
                className="min-h-[60px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>📷</span>
              <span>Disease Photos</span>
            </CardTitle>
            <CardDescription>
              Upload clear photos of the affected plants (max 5 images, 5MB each)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <Button 
              type="button"
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={images.length >= 5}
            >
              📁 Select Images ({images.length}/5)
            </Button>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={preview}
                        alt={`Disease photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 w-6 h-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>📋</span>
              <span>Consent & Permissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent-contact"
                checked={formData.consentToContact}
                onCheckedChange={(checked) => handleInputChange('consentToContact', checked as boolean)}
              />
              <label htmlFor="consent-contact" className="text-sm text-gray-700 leading-relaxed">
                I consent to be contacted by the Department of Agriculture or their representatives 
                regarding this disease report for follow-up questions or site visits. *
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent-share"
                checked={formData.consentToShare}
                onCheckedChange={(checked) => handleInputChange('consentToShare', checked as boolean)}
              />
              <label htmlFor="consent-share" className="text-sm text-gray-700 leading-relaxed">
                I consent to sharing this information with agricultural researchers and extension 
                workers to help develop solutions for this disease.
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-12" 
            size="lg"
            disabled={!isOnline || isSubmitting || !formData.consentToContact}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Submitting Report...
              </>
            ) : (
              '📤 Submit Disease Report'
            )}
          </Button>
        </div>
      </form>

      {/* Navigation */}
      <div className="flex space-x-3">
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">
            🏠 Home
          </Button>
        </Link>
        <Link href="/disease-scanner" className="flex-1">
          <Button variant="outline" className="w-full">
            🔍 Scanner
          </Button>
        </Link>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-base flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Important Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Reports are sent directly to the Department of Agriculture</li>
            <li>• You may be contacted for additional information</li>
            <li>• Critical cases receive priority response</li>
            <li>• All information is kept confidential</li>
            <li>• False reports may result in penalties</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
