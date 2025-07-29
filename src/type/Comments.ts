import type { Article } from './Article'
import type { UserClass } from './UserClass'

export interface Comments {
  id: number
  documentId: string
  content: string
  createdAt: Date
  updatedAt: Date
  publishedAt: Date
  locale: null
  article: Article
  user: UserClass
}
