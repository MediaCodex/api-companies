import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { atob, btoa } from 'buffer'
import createError from 'http-errors'
import { DateTime } from 'luxon'
import { BaseEntity, PaginationEncoding } from '../types'

/**
 * change tracking
 */
export const touchCreated = <Entity extends BaseEntity>(
  entity: Entity | any,
  userId: string
): Entity => {
  entity.created_by = userId
  entity.created_at = DateTime.now().toUTC().toISO()!
  return entity
}

export const touchUpdated = <Entity extends BaseEntity>(
  entity: Entity,
  userId: string
): Entity => {
  entity.updated_by = userId
  entity.updated_at = DateTime.now().toUTC().toISO()!
  return entity
}

/**
 * pagination
 */
export const decodePaginationToken = (
  encoding: string = PaginationEncoding.Base64Json,
  token: string
): Record<string, AttributeValue> => {
  switch (encoding) {
    case PaginationEncoding.Base64Json:
      return JSON.parse(atob(token))
    default:
      throw new createError.BadRequest('unsupported pagination encoding')
  }
}

export const encodePaginationToken = (
  encoding: string = PaginationEncoding.Base64Json,
  evaluatedKey: Record<string, AttributeValue>
): string => {
  switch (encoding) {
    case PaginationEncoding.Base64Json:
      return btoa(JSON.stringify(evaluatedKey))
    default:
      throw new createError.BadRequest('unsupported pagination encoding')
  }
}
