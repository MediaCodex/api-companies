export interface BaseEntity {
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

/**
 * Company
 */
export type ModifiableCompany = Omit<Company, keyof BaseEntity | 'id'>
export type CompanyKey = { id: string }
export interface Company extends BaseEntity, CompanyKey {
  name: string
  slug: string
  founded?: string
}
