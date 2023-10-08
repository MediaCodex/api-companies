import { httpWrapper, initRepositories, response, setPaginationHeaders } from '../../helpers'
import { GatewayHttpResponse, Company, GatewayHttpEvent } from '../../types'

type HandlerRequest = GatewayHttpEvent<any>
type HandlerResponse = Promise<GatewayHttpResponse<Company[]>>

/**
 * Business logic
 */
const handler = async (event: HandlerRequest): HandlerResponse => {
  const { companyRepository } = initRepositories()

  // list all companies
  const companies = await companyRepository.listAll({
    limit: event.pagination?.limit,
    exclusiveStartKey: event.pagination?.token
  })

  // set response headers
  const headers = setPaginationHeaders({}, companies.lastEvaluatedKey)

  // return data
  return response(200, companies.items, headers)
}

/**
 * Apply middleware
 */
export default httpWrapper(handler)
