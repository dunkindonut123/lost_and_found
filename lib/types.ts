export type ItemStatus = 'active' | 'pending' | 'approved' | 'completed'
export type ClaimStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  username: string
  student_id: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface Item {
  id: string
  name: string
  description: string | null
  category_id: string | null
  location: string
  date_found: string
  status: ItemStatus
  reporter_id: string
  created_at: string
  updated_at: string
  // Joined fields
  categories?: Category
  item_photos?: ItemPhoto[]
  profiles?: Profile
}

export interface ItemPhoto {
  id: string
  item_id: string
  photo_url: string
  created_at: string
}

export interface Claim {
  id: string
  item_id: string
  claimant_id: string
  description: string
  status: ClaimStatus
  rejection_reason: string | null
  created_at: string
  updated_at: string
  // Joined fields
  item?: Item
  claimant?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  read: boolean
  claim_id: string | null
  created_at: string
  // Joined fields
  claim?: Claim
}

export interface Admin {
  id: string
  user_id: string
  created_at: string
}

// Type alias for items with joined data
export type ItemWithDetails = Item
