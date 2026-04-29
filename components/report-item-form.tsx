'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { Category } from '@/lib/types'
import Image from 'next/image'

interface ReportItemFormProps {
  categories: Category[]
}

export function ReportItemForm({ categories }: ReportItemFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photos.length > 5) {
      setError('You can upload a maximum of 5 photos')
      return
    }
    
    setPhotos([...photos, ...files])
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls])
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index])
    setPhotos(photos.filter((_, i) => i !== index))
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create the item
      const { data: item, error: itemError } = await supabase
        .from('items')
        .insert({
          name: formData.get('title') as string,
          description: formData.get('description') as string,
          category_id: formData.get('category') as string,
          location: formData.get('location') as string,
          date_found: formData.get('dateFound') as string,
          reporter_id: user.id,
          status: 'active',
        })
        .select()
        .single()

      if (itemError) throw itemError

      // Upload photos if any
      if (photos.length > 0 && item) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i]
          const fileExt = photo.name.split('.').pop()
          const fileName = `${item.id}/${Date.now()}-${i}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('item-photos')
            .upload(fileName, photo)

          if (uploadError) {
            console.error('Photo upload error:', uploadError)
            continue
          }

          const { data: { publicUrl } } = supabase.storage
            .from('item-photos')
            .getPublicUrl(fileName)

          await supabase.from('item_photos').insert({
            item_id: item.id,
            photo_url: publicUrl,
          })
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Item Reported Successfully</h2>
          <p className="text-muted-foreground">
            Thank you for helping reunite items with their owners!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Item Title</FieldLabel>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Blue Backpack, iPhone 15, Student ID Card"
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Select name="category" required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the item in detail - color, brand, distinguishing features..."
                rows={4}
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="location">Location Found</FieldLabel>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Library 2nd Floor, Cafeteria, Building A Room 101"
                required
                disabled={isLoading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dateFound">Date Found</FieldLabel>
              <Input
                id="dateFound"
                name="dateFound"
                type="date"
                required
                disabled={isLoading}
                max={new Date().toISOString().split('T')[0]}
              />
            </Field>

            <Field>
              <FieldLabel>Photos (optional, max 5)</FieldLabel>
              <div className="space-y-3">
                {photoPreviewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {photoPreviewUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted"
                      >
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {photos.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload photos
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
            </Field>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Report Item'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
