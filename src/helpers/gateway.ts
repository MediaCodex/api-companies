import { AttributeValue } from '@aws-sdk/client-dynamodb'
import middy, { MiddlewareObj, MiddyfiedHandler } from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import jsonBodyParser from '@middy/http-json-body-parser'
import httpResponseSerializer from '@middy/http-response-serializer'
import inputOutputLogger from '@middy/input-output-logger'
import createHttpError from 'http-errors'
import { AnySchema } from 'yup'
import config, { yupOptions } from '../config'
import {
  GatewayEventWithPagination,
  GatewayHttpEvent,
  HttpHandler,
  PaginationEncoding
} from '../types'
import { decodePaginationToken, encodePaginationToken } from './database'

const serializerConfig = {
  defaultContentType: 'application/json',
  serializers: [
    {
      regex: /^application\/json$/,
      serializer: ({ body }: { body: any }) => JSON.stringify(body)
    }
  ]
}

/**
 * pagination
 */
export const paginationParser = (): MiddlewareObj<GatewayEventWithPagination> => ({
  before: (req) => {
    const { maxLimit, defaultLimit, limitHeader, tokenHeader, encodingHeader } = config.pagination

    // get pagination from headers
    const rawLimit = req.event.headers[limitHeader] || `${defaultLimit}`
    const encoding = req.event.headers[encodingHeader] || 'base64'
    const rawToken = req.event.headers[tokenHeader]
    const token = rawToken !== undefined ? decodePaginationToken(encoding, rawToken) : rawToken

    // parse pagination limit
    const limit = Number.parseInt(rawLimit, 10)
    if (Number.isNaN(limit) || limit > maxLimit) {
      throw new createHttpError.BadRequest('pagination limit is too high, or NaN')
    }

    // bind pagination to event
    req.event.pagination = {
      limit,
      token
    }
  }
})

export const setPaginationHeaders = (
  headers: { [header: string]: string },
  evaluatedKey?: Record<string, AttributeValue>,
  encoding: PaginationEncoding = PaginationEncoding.Base64Json
) => {
  const { tokenHeader, encodingHeader } = config.pagination
  return {
    ...headers,
    ...(evaluatedKey !== undefined && {
      [encodingHeader]: encoding,
      [tokenHeader]: encodePaginationToken(encoding, evaluatedKey)
    })
  }
}

/**
 * Validation
 */
export const validationMiddleware = (
  requestSchema?: AnySchema,
  responseSchema?: AnySchema
): MiddlewareObj<GatewayEventWithPagination> => ({
  before: async (req) => {
    if (!!requestSchema && !!req.event.body) {
      try {
        await requestSchema.validate(req.event.body, yupOptions)
      } catch (err) {
        throw new createHttpError.BadRequest('request body validation failed')
      }
    }
  },

  after: async (req) => {
    if (!!responseSchema && !!req.response.body) {
      try {
        await responseSchema.validate(req.response.body, yupOptions)
      } catch (err) {
        throw new createHttpError.BadRequest('request body validation failed')
      }
    }
  }
})

/**
 * Middy handler with default middleware
 */
export const httpWrapper = (handler: HttpHandler, requestSchema?: AnySchema): MiddyfiedHandler => {
  return middy(handler)
    .use(inputOutputLogger())
    .use(httpErrorHandler())
    .use(jsonBodyParser())
    .use(paginationParser())
    .use(validationMiddleware(requestSchema))
    .use(httpResponseSerializer(serializerConfig))
}

/**
 * Request
 */
export const getRequiredParam = (
  event: GatewayHttpEvent<any>,
  name: string
) => {
  const param = event.pathParameters?.[name]
  if (!param) {
    throw new createHttpError.BadRequest(`missing '${name} in path parameters'`)
  }
  return param
}

/**
 * Response
 */
export const response = (status: number, body: any, headers?: { [key: string]: string }) => ({
  statusCode: status,
  body,
  headers
})
