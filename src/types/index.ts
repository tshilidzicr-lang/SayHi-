export interface User {
  id: string
  name: string
  bio: string | null
  age: number | null
  photo_url: string | null
  location: { lat: number; lng: number } | null
  created_at: string
}

export interface Like {
  id: string
  from_user_id: string
  to_user_id: string
  created_at: string
}

export interface Match {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  other_user?: User
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  text: string
  created_at: string
}
