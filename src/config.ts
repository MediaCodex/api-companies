import { ValidateOptions } from "yup"

export const tables = {
  companies: {
    name: process.env.DYNAMODB_TABLE_COMPANIES || 'companies',
    slugIndex: 'slug'
  }
}

export const yupOptions: ValidateOptions = {
  strict: true,
  stripUnknown: true
}

export default {
  tables,

  // aws config
  awsRegion: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  eventBus: process.env.EVENTBRIDGE_BUS || 'default',

  // pagination
  pagination: {
    defaultLimit: 50,
    maxLimit: 1000,
    limitHeader: 'x-pagination-limit',
    tokenHeader: 'x-pagination-token',
    encodingHeader: 'x-pagination-token-encoding'
  }
}
