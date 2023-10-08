import { AttributeValue } from '@aws-sdk/client-dynamodb'

export type DynamoPaginationConfig = {
  limit?: number
  exclusiveStartKey?: Record<string, AttributeValue>
}

export type DynamoPaginatedResponse<Entity> = Promise<{
  items: Entity
  lastEvaluatedKey?: Record<string, AttributeValue>
}>
