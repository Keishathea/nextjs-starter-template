"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { analyzeImage, validateImage, type ImageAnalysisResult } from "@/lib/tensorflow"
import Link from "next/link"
import Image from "next/image"

export default function DiseaseScannerPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isOnline } = useNetworkStatus()

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate image
    const validation = validateImage(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setSelectedImage(file)
    setAnalysisResult(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setProgress(0)
    setAnalysisResult(null)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      const result = await analyzeImage(selectedImage)
      setAnalysisResult(result)
      setProgress(100)
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysisResult({
        success: false,
        results: [],
        error: 'Failed to analyze image. Please try again.',
        processingTime: 0
      })
      setProgress(100)
    } finally {
      setIsAnalyzing(false)
      clearInterval(progressInterval)
    }
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setAnalysisResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200'
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Disease Scanner</h1>
        <p className="text-gray-600 text-sm">
          Upload or capture an image of rice plants to detect diseases
        </p>
      </div>

      {/* Status Banner */}
      <div className={`p-3 rounded-lg text-center text-sm font-medium ${
        isOnline 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-blue-50 text-blue-800 border border-blue-200'
      }`}>
        {isOnline ? '🟢 Online Mode - Full accuracy' : '📱 Offline Mode - Local processing available'}
      </div>

      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Image</CardTitle>
          <CardDescription>
            Choose an image from your device or take a photo with your camera
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="h-12"
            >
              📁 Choose File
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCameraCapture}
              className="h-12"
            >
              📷 Take Photo
            </Button>
          </div>

          {imagePreview && (
            <div className="space-y-3">
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Selected image"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-sm text-gray-600 text-center">
                File: {selectedImage?.name} ({(selectedImage?.size || 0 / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Section */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis</CardTitle>
            <CardDescription>
              Process the image to detect rice diseases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAnalyzing && !analysisResult && (
              <Button 
                onClick={handleAnalyze} 
                className="w-full h-12"
                size="lg"
              >
                🔍 Analyze Image
              </Button>
            )}

            {isAnalyzing && (
              <div className="space-y-3">
                <div className="text-center text-sm text-gray-600">
                  Analyzing image... {Math.round(progress)}%
                </div>
                <Progress value={progress} className="w-full" />
                <div className="text-xs text-gray-500 text-center">
                  Processing with AI disease detection model
                </div>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4">
                {analysisResult.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        ✅ Analysis Complete
                      </span>
                      <span className="text-xs text-gray-500">
                        {analysisResult.processingTime}ms
                      </span>
                    </div>

                    {analysisResult.results.map((result, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">
                                {result.diseaseName}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(result.severity)}`}>
                                {result.severity}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Confidence:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${result.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {Math.round(result.confidence * 100)}%
                              </span>
                            </div>

                            <p className="text-sm text-gray-600">
                              {result.description}
                            </p>

                            <Link href={`/disease-details?id=${result.diseaseId}`}>
                              <Button variant="outline" size="sm" className="w-full mt-2">
                                View Details & Solutions →
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="text-red-600 font-medium">
                      ❌ Analysis Failed
                    </div>
                    <p className="text-sm text-gray-600">
                      {analysisResult.error}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleAnalyze}
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="flex-1"
          disabled={isAnalyzing}
        >
          🔄 Reset
        </Button>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">
            🏠 Home
          </Button>
        </Link>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-base">📋 Tips for Better Results</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Take photos in good lighting conditions</li>
            <li>• Focus on affected plant parts (leaves, stems)</li>
            <li>• Avoid blurry or distant shots</li>
            <li>• Include multiple symptoms if visible</li>
            <li>• Clean the camera lens before taking photos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
