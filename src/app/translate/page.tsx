"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface TranslationDictionary {
  [key: string]: string
}

export default function TranslatePage() {
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [dictionary, setDictionary] = useState<TranslationDictionary>({})
  const [loading, setLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [recentTranslations, setRecentTranslations] = useState<Array<{english: string, filipino: string}>>([])

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const response = await fetch('/data/translations.json')
        if (!response.ok) {
          throw new Error('Failed to load translation dictionary')
        }
        const data = await response.json()
        setDictionary(data)
      } catch (error) {
        console.error('Error loading dictionary:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDictionary()

    // Load recent translations from localStorage
    const saved = localStorage.getItem('recentTranslations')
    if (saved) {
      try {
        setRecentTranslations(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent translations:', error)
      }
    }
  }, [])

  const translateText = async () => {
    if (!inputText.trim()) return

    setTranslating(true)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const words = inputText.toLowerCase().split(/\s+/)
      const translatedWords = words.map(word => {
        // Remove punctuation for lookup
        const cleanWord = word.replace(/[^\w]/g, '')
        const translation = dictionary[cleanWord]
        
        if (translation) {
          // Preserve original punctuation
          return word.replace(cleanWord, translation)
        }
        
        return word
      })

      const result = translatedWords.join(' ')
      setTranslatedText(result)

      // Save to recent translations
      const newTranslation = {
        english: inputText,
        filipino: result
      }

      const updated = [newTranslation, ...recentTranslations.slice(0, 4)]
      setRecentTranslations(updated)
      localStorage.setItem('recentTranslations', JSON.stringify(updated))

    } catch (error) {
      console.error('Translation error:', error)
      setTranslatedText('Translation error occurred. Please try again.')
    } finally {
      setTranslating(false)
    }
  }

  const handleClear = () => {
    setInputText('')
    setTranslatedText('')
  }

  const handleCopyTranslation = async () => {
    if (translatedText) {
      try {
        await navigator.clipboard.writeText(translatedText)
        // You could show a toast notification here
        alert('Translation copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  const commonPhrases = [
    { english: "rice disease", filipino: "sakit ng bigas" },
    { english: "pest control", filipino: "kontrol sa peste" },
    { english: "plant symptoms", filipino: "sintomas ng halaman" },
    { english: "treatment solution", filipino: "solusyon sa gamot" },
    { english: "healthy plant", filipino: "malusog na halaman" },
    { english: "damaged leaf", filipino: "nasirang dahon" }
  ]

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Loading translation dictionary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">English to Filipino</h1>
        <p className="text-gray-600 text-sm">
          Translate agricultural terms and phrases
        </p>
      </div>

      {/* Translation Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-blue-600">
              {Object.keys(dictionary).length}+
            </div>
            <div className="text-xs text-gray-600">Terms Available</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-green-600">📱</div>
            <div className="text-xs text-gray-600">Offline Ready</div>
          </CardContent>
        </Card>
      </div>

      {/* Translation Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>🇺🇸</span>
            <span>English Text</span>
          </CardTitle>
          <CardDescription>
            Enter the text you want to translate to Filipino
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your English text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {inputText.length}/500 characters
            </span>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClear}
                disabled={!inputText}
              >
                Clear
              </Button>
              <Button 
                onClick={translateText}
                disabled={!inputText.trim() || translating}
                size="sm"
              >
                {translating ? 'Translating...' : 'Translate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Output */}
      {translatedText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>🇵🇭</span>
              <span>Filipino Translation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
              <p className="text-gray-900 leading-relaxed">
                {translatedText}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyTranslation}
                className="flex-1"
              >
                📋 Copy Translation
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(translatedText)
                    utterance.lang = 'fil-PH'
                    speechSynthesis.speak(utterance)
                  }
                }}
                className="flex-1"
              >
                🔊 Listen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Phrases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>💬</span>
            <span>Common Agricultural Phrases</span>
          </CardTitle>
          <CardDescription>
            Tap to quickly translate common terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commonPhrases.map((phrase, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setInputText(phrase.english)
                  setTranslatedText(phrase.filipino)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">
                      {phrase.english}
                    </div>
                    <div className="text-sm text-gray-600">
                      {phrase.filipino}
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Translations */}
      {recentTranslations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>🕒</span>
              <span>Recent Translations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTranslations.map((translation, index) => (
                <div 
                  key={index}
                  className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setInputText(translation.english)
                    setTranslatedText(translation.filipino)
                  }}
                >
                  <div className="font-medium text-gray-900 truncate">
                    {translation.english}
                  </div>
                  <div className="text-gray-600 truncate">
                    {translation.filipino}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-base flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Translation Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Works completely offline</li>
            <li>• Focuses on agricultural terminology</li>
            <li>• Preserves punctuation and formatting</li>
            <li>• Unknown words remain in English</li>
            <li>• Translations are saved locally</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
