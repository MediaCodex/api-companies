import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput
} from '@aws-sdk/lib-dynamodb'
import { tables } from '../config'
import {
  Company,
  CompanyKey,
  DynamoPaginatedResponse,
  DynamoPaginationConfig
} from '../types'

export default (ddbClient: DynamoDBDocumentClient) => ({
  create: async (company: Company): Promise<void> => {
    const params: PutCommandInput = {
      TableName: tables.companies.name,
      Item: company,
      ConditionExpression: 'attribute_not_exists(id)'
    }

    await ddbClient.send(new PutCommand(params))
  },

  update: async (company: Company): Promise<void> => {
    const params: PutCommandInput = {
      TableName: tables.companies.name,
      Item: company,
      ConditionExpression: 'attribute_exists(id)'
    }

    await ddbClient.send(new PutCommand(params))
  },

  listAll: async(
    pagination: DynamoPaginationConfig
  ): DynamoPaginatedResponse<Company[]> => {
    const params: ScanCommandInput = {
      TableName: tables.companies.name,
      Limit: pagination.limit,
      ExclusiveStartKey: pagination.exclusiveStartKey
    }

    const res = await ddbClient.send(new ScanCommand(params))
    return {
      items: res.Items as Company[],
      lastEvaluatedKey: res.LastEvaluatedKey
    }
  },

  find: async (key: CompanyKey): Promise<Company | undefined> => {
    const params: GetCommandInput = {
      TableName: tables.companies.name,
      Key: key
    }

    const res = await ddbClient.send(new GetCommand(params))

    return res.Item as Company
  },

  findBySlug: async (slug: Company['slug']): Promise<Company | undefined> => {
    const params: QueryCommandInput = {
      TableName: tables.companies.name,
      IndexName: tables.companies.slugIndex,
      KeyConditionExpression: '#slug = :slug',
      ExpressionAttributeNames: {
        '#slug': 'slug'
      },
      ExpressionAttributeValues: {
        ':slug': slug
      }
    }

    const res = await ddbClient.send(new QueryCommand(params))
    return res.Items?.[0] as Company
  }
})
