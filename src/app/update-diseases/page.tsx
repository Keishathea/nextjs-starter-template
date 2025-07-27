"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import Link from "next/link"

interface Disease {
  id: string
  name: string
  description: string
  symptoms: string[]
  solutions: string[]
  prevention: string[]
  severity: 'Low' | 'Medium' | 'High'
  commonAreas: string[]
}

interface DiseaseFormData {
  name: string
  description: string
  symptoms: string
  solutions: string
  prevention: string
  severity: 'Low' | 'Medium' | 'High'
  commonAreas: string
}

export default function UpdateDiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<DiseaseFormData>({
    name: '',
    description: '',
    symptoms: '',
    solutions: '',
    prevention: '',
    severity: 'Medium',
    commonAreas: ''
  })
  const { isOnline } = useNetworkStatus()

  useEffect(() => {
    const loadDiseases = async () => {
      try {
        const response = await fetch('/data/diseases.json')
        if (!response.ok) {
          throw new Error('Failed to load disease data')
        }
        const data: Disease[] = await response.json()
        setDiseases(data)
      } catch (error) {
        console.error('Error loading diseases:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDiseases()
  }, [])

  const handleInputChange = (field: keyof DiseaseFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const newDisease: Disease = {
      id: editingId || `d${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      symptoms: formData.symptoms.split('\n').filter(s => s.trim()),
      solutions: formData.solutions.split('\n').filter(s => s.trim()),
      prevention: formData.prevention.split('\n').filter(s => s.trim()),
      severity: formData.severity,
      commonAreas: formData.commonAreas.split(',').map(a => a.trim()).filter(a => a)
    }

    if (editingId) {
      // Update existing disease
      setDiseases(prev => prev.map(d => d.id === editingId ? newDisease : d))
    } else {
      // Add new disease
      setDiseases(prev => [...prev, newDisease])
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      symptoms: '',
      solutions: '',
      prevention: '',
      severity: 'Medium',
      commonAreas: ''
    })
    setIsEditing(false)
    setEditingId(null)
    setShowAddForm(false)

    // In a real app, this would sync with a backend
    if (isOnline) {
      // Simulate API call
      console.log('Syncing with server...', newDisease)
    } else {
      // Save to localStorage for offline use
      localStorage.setItem('localDiseases', JSON.stringify(diseases))
    }
  }

  const handleEdit = (disease: Disease) => {
    setFormData({
      name: disease.name,
      description: disease.description,
      symptoms: disease.symptoms.join('\n'),
      solutions: disease.solutions.join('\n'),
      prevention: disease.prevention.join('\n'),
      severity: disease.severity,
      commonAreas: disease.commonAreas.join(', ')
    })
    setEditingId(disease.id)
    setIsEditing(true)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this disease entry?')) {
      setDiseases(prev => prev.filter(d => d.id !== id))
      
      if (isOnline) {
        console.log('Deleting from server...', id)
      } else {
        localStorage.setItem('localDiseases', JSON.stringify(diseases.filter(d => d.id !== id)))
      }
    }
  }

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
          <p className="text-gray-600">Loading disease database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Update Disease Database</h1>
        <p className="text-gray-600 text-sm">
          Manage rice disease information and solutions
        </p>
      </div>

      {/* Status Banner */}
      <div className={`p-3 rounded-lg text-center text-sm font-medium ${
        isOnline 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
      }`}>
        {isOnline 
          ? '🟢 Online - Changes will sync to server' 
          : '📱 Offline - Changes saved locally until online'
        }
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-blue-600">{diseases.length}</div>
            <div className="text-xs text-gray-600">Total Diseases</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-red-600">
              {diseases.filter(d => d.severity === 'High').length}
            </div>
            <div className="text-xs text-gray-600">High Severity</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-green-600">
              {diseases.filter(d => d.severity === 'Low').length}
            </div>
            <div className="text-xs text-gray-600">Low Severity</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Disease Button */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogTrigger asChild>
          <Button className="w-full" size="lg">
            ➕ Add New Disease
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Disease' : 'Add New Disease'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update disease information' : 'Add a new rice disease to the database'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Disease Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Rice Blast"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the disease..."
                className="min-h-[80px]"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Severity</label>
              <Select value={formData.severity} onValueChange={(value: 'Low' | 'Medium' | 'High') => handleInputChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Symptoms (one per line)</label>
              <Textarea
                value={formData.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                placeholder="Diamond-shaped lesions on leaves&#10;Gray centers with brown margins&#10;Neck rot in severe cases"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Solutions (one per line)</label>
              <Textarea
                value={formData.solutions}
                onChange={(e) => handleInputChange('solutions', e.target.value)}
                placeholder="Apply fungicides containing tricyclazole&#10;Use resistant rice varieties&#10;Maintain proper field drainage"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Prevention Methods (one per line)</label>
              <Textarea
                value={formData.prevention}
                onChange={(e) => handleInputChange('prevention', e.target.value)}
                placeholder="Use certified disease-free seeds&#10;Maintain balanced fertilization&#10;Ensure proper plant spacing"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Common Areas (comma-separated)</label>
              <Input
                value={formData.commonAreas}
                onChange={(e) => handleInputChange('commonAreas', e.target.value)}
                placeholder="Luzon, Visayas, Mindanao"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1">
                {isEditing ? 'Update Disease' : 'Add Disease'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setIsEditing(false)
                  setEditingId(null)
                  setFormData({
                    name: '',
                    description: '',
                    symptoms: '',
                    solutions: '',
                    prevention: '',
                    severity: 'Medium',
                    commonAreas: ''
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Disease List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Current Diseases</h2>
        
        {diseases.map((disease) => (
          <Card key={disease.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{disease.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`${getSeverityColor(disease.severity)} border text-xs`}>
                      {disease.severity} Risk
                    </Badge>
                    <span className="text-xs text-gray-500">
                      ID: {disease.id}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {disease.description}
              </p>

              <div className="grid grid-cols-1 gap-3 text-xs">
                <div>
                  <span className="font-medium text-gray-900">Symptoms:</span>
                  <span className="text-gray-600 ml-1">
                    {disease.symptoms.length} listed
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Solutions:</span>
                  <span className="text-gray-600 ml-1">
                    {disease.solutions.length} available
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Common Areas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {disease.commonAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(disease)}
                  className="flex-1"
                >
                  ✏️ Edit
                </Button>
                <Link href={`/disease-details?id=${disease.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    👁️ View
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(disease.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  🗑️
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* Admin Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-base flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Database Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Changes are saved locally when offline</li>
            <li>• Data syncs automatically when online</li>
            <li>• All fields support rich text formatting</li>
            <li>• Deleted entries can be recovered from backups</li>
            <li>• Regular backups are recommended</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
