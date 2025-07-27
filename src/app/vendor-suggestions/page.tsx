"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

interface Vendor {
  id: string
  name: string
  address: string
  contact: string
  email: string
  services: string
  specialties: string[]
  rating: number
  verified: boolean
  region: string
}

export default function VendorSuggestionsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const { isOnline } = useNetworkStatus()

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const response = await fetch('/data/vendors.json')
        if (!response.ok) {
          throw new Error('Failed to load vendor data')
        }
        const data: Vendor[] = await response.json()
        setVendors(data)
        setFilteredVendors(data)
      } catch (error) {
        console.error('Error loading vendors:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVendors()
  }, [])

  useEffect(() => {
    // Get user location if online
    if (isOnline && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          setLocationError('Location access denied or unavailable')
          console.error('Geolocation error:', error)
        }
      )
    }
  }, [isOnline])

  useEffect(() => {
    // Filter vendors based on search and region
    let filtered = vendors

    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.services.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(vendor => vendor.region === selectedRegion)
    }

    setFilteredVendors(filtered)
  }, [vendors, searchTerm, selectedRegion])

  const regions = Array.from(new Set(vendors.map(vendor => vendor.region)))

  const handleCall = (contact: string) => {
    window.open(`tel:${contact}`, '_self')
  }

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self')
  }

  const handleDirections = (address: string) => {
    if (isOnline) {
      const encodedAddress = encodeURIComponent(address)
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank')
    } else {
      alert('Directions require an internet connection')
    }
  }

  const getRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐')
    }
    if (hasHalfStar) {
      stars.push('⭐')
    }
    return stars.join('')
  }

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Loading vendor information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Suggestions</h1>
        <p className="text-gray-600 text-sm">
          Find legitimate vendors for pest control solutions
        </p>
      </div>

      {/* Status Banner */}
      <div className={`p-3 rounded-lg text-center text-sm font-medium ${
        isOnline 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-blue-50 text-blue-800 border border-blue-200'
      }`}>
        {isOnline ? '🟢 Online - Maps and directions available' : '📱 Offline - Contact info available'}
      </div>

      {/* Location Status */}
      {userLocation && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <span>📍</span>
              <span className="text-green-800 text-sm font-medium">
                Location detected - Showing nearby vendors first
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {locationError && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span className="text-yellow-800 text-sm">
                {locationError}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search vendors, services, or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-gray-600">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </div>
        </CardContent>
      </Card>

      {/* Vendors List */}
      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No vendors found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedRegion('all')
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>{vendor.name}</span>
                      {vendor.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          ✓ Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {getRatingStars(vendor.rating)} {vendor.rating}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {vendor.region}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex items-start space-x-2">
                  <span className="text-gray-400 mt-1">📍</span>
                  <span className="text-sm text-gray-700 flex-1">
                    {vendor.address}
                  </span>
                </div>

                {/* Services */}
                <div className="flex items-start space-x-2">
                  <span className="text-gray-400 mt-1">🛠️</span>
                  <span className="text-sm text-gray-700 flex-1">
                    {vendor.services}
                  </span>
                </div>

                {/* Specialties */}
                <div className="flex items-start space-x-2">
                  <span className="text-gray-400 mt-1">⭐</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1">
                      {vendor.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCall(vendor.contact)}
                    className="text-xs"
                  >
                    📞 Call
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEmail(vendor.email)}
                    className="text-xs"
                  >
                    ✉️ Email
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDirections(vendor.address)}
                    disabled={!isOnline}
                    className="text-xs"
                  >
                    🗺️ Directions
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{vendor.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium truncate ml-2">{vendor.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Emergency Contact */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-800 text-base flex items-center space-x-2">
            <span>🚨</span>
            <span>Emergency Agricultural Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-red-700 text-sm mb-3">
            For urgent pest control needs or agricultural emergencies:
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-red-300 text-red-800 hover:bg-red-100"
            onClick={() => handleCall('+63288444601')}
          >
            📞 Call DA Emergency Hotline: (02) 8844-4601
          </Button>
        </CardContent>
      </Card>

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

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-base flex items-center space-x-2">
            <span>💡</span>
            <span>Vendor Selection Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Look for verified vendors with good ratings</li>
            <li>• Compare prices from multiple vendors</li>
            <li>• Ask about product certifications and safety</li>
            <li>• Check if they provide technical support</li>
            <li>• Verify business licenses and permits</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
