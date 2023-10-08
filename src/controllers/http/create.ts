import createHttpError from 'http-errors'
import yup, { ObjectSchema } from 'yup'
import {
  httpWrapper,
  response,
  safeNanoid,
  touchCreated,
  touchUpdated
} from '../../helpers'
import { initRepositories } from '../../repositories'
import {
  Company,
  CompanyKey,
  GatewayHttpEvent,
  GatewayHttpResponse,
  ModifiableCompany
} from '../../types'

/**
 * Request validation
 */
const CreateCompanySchema: ObjectSchema<ModifiableCompany> = yup.object({
  name: yup.string().max(255).trim().required(),
  slug: yup
    .string()
    .min(3)
    .max(255)
    .matches(/^[a-zA-Z0-9-]+$/)
    .required(),
  founded: yup.string().optional()
})

/**
 * Business logic
 */
type HandlerRequestBody = yup.InferType<typeof CreateCompanySchema>
type HandlerRequest = GatewayHttpEvent<HandlerRequestBody>
type HandlerResponse = Promise<GatewayHttpResponse<Company>>
const handler = async (event: HandlerRequest): HandlerResponse => {
  const { companyRepository } = initRepositories()
  const userId = event.requestContext.authorizer.principalId

  // check slug is not in use
  const companySlug = await companyRepository.findBySlug(event.body.slug)
  if (companySlug) {
    throw new createHttpError.BadRequest('slug is already in use')
  }

  // convert request body to entity
  const baseCompany: ModifiableCompany & CompanyKey = {
    ...event.body,
    id: safeNanoid()
  }
  const company: Company = touchUpdated(
    touchCreated(baseCompany, userId),
    userId
  )

  // save item to db
  await companyRepository.create(company)

  // return updated item
  return response(200, company)
}

/**
 * Apply middleware
 */
export default httpWrapper(handler, CreateCompanySchema)
