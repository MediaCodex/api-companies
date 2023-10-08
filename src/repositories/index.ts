import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import CompanyRepository from './company'
import config from '../config'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export const initRepositories = () => {
  const ddbClient = new DynamoDBClient({ region: config.awsRegion })
  const ddbDocumentClient = DynamoDBDocumentClient.from(ddbClient)

  return {
    companyRepository: CompanyRepository(ddbDocumentClient)
  }
}

export default {
  CompanyRepository
}