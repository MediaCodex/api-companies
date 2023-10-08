import { AttributeValue } from '@aws-sdk/client-dynamodb'
import {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2
} from 'aws-lambda'

export type HttpHandler = (
  event: GatewayHttpEvent<any>
) => GatewayHttpResponse<any> | Promise<GatewayHttpResponse<any>>

export type GatewayEventWithPagination = APIGatewayProxyEventV2WithJWTAuthorizer & {
  pagination?: {
    limit?: number
    token?: Record<string, AttributeValue>
  }
}

export enum PaginationEncoding {
  Base64Json = 'base64Json'
}

/**
 * Request / Response
 */
export type GatewayHttpEvent<Body> = Omit<GatewayEventWithPagination, 'body'> & {
  body: Body
  rawBody?: string
}

export type GatewayHttpResponse<Body> = Omit<APIGatewayProxyStructuredResultV2, 'body'> & {
  body: Body
}
