export interface BaseEntity {
  created_at: string
  created_by: string
  updated_at?: string
  updated_by?: string
}

/**
 * Company
 */
export type ModifiableCompany = Omit<Company, keyof BaseEntity | 'id'>
export type CompanyKey = { id: string }
export interface Company extends BaseEntity, CompanyKey {
  name: string
  slug: string
  description?: string
  founded?: String
}
