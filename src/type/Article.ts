import type { Category } from './Category'
import type { UserClass } from './UserClass'

export interface Article {
  id: number
  documentId: string
  title: string
  description: string
  cover_image_url: string
  createdAt: Date
  updatedAt: Date
  publishedAt: Date
  user: UserClass
  locale: null
  category: Category | null
}
