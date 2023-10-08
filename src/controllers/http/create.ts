import createHttpError from 'http-errors'
import {
  InferType,
  ObjectSchema,
  object as yupObject,
  string as yupString
} from 'yup'
import {
  getUserId,
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
const CreateCompanySchema: ObjectSchema<ModifiableCompany> = yupObject({
  name: yupString().max(255).trim().required(),
  slug: yupString()
    .min(3)
    .max(255)
    .matches(/^[a-zA-Z0-9-]+$/)
    .required(),
  description: yupString().optional(),
  founded: yupString().optional()
})

/**
 * Business logic
 */
type HandlerRequestBody = InferType<typeof CreateCompanySchema>
type HandlerRequest = GatewayHttpEvent<HandlerRequestBody>
type HandlerResponse = Promise<GatewayHttpResponse<Company>>
const handler = async (event: HandlerRequest): HandlerResponse => {
  const { companyRepository } = initRepositories()
  const userId = getUserId(event)

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
