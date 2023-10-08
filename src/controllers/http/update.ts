import createHttpError from 'http-errors'
import yup, { ObjectSchema } from 'yup'
import {
  getRequiredParam,
  httpWrapper,
  response,
  touchUpdated
} from '../../helpers'
import { initRepositories } from '../../repositories'
import {
  Company,
  GatewayHttpEvent,
  GatewayHttpResponse,
  ModifiableCompany
} from '../../types'

/**
 * Request validation
 */
const UpdateCompanySchema: ObjectSchema<ModifiableCompany> = yup.object({
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
type HandlerRequestBody = yup.InferType<typeof UpdateCompanySchema>
type HandlerRequest = GatewayHttpEvent<HandlerRequestBody>
type HandlerResponse = Promise<GatewayHttpResponse<Company>>
const handler = async (event: HandlerRequest): HandlerResponse => {
  const { companyRepository } = initRepositories()

  // extract path params
  const companyId = getRequiredParam(event, 'companyId')
  const userId = event.requestContext.authorizer.principalId

  // get existing company from db
  const company = await companyRepository.find({ id: companyId })
  if (!company) {
    throw new createHttpError.NotFound()
  }

  // check slug is not in use
  const companySlug = await companyRepository.findBySlug(event.body.slug)
  if (companySlug && companySlug.id !== company.id) {
    throw new createHttpError.BadRequest('slug is already in use')
  }

  // apply new data to existing item
  const updatedCompany = Object.assign(company, event.body)
  const touchedCompany = touchUpdated(updatedCompany, userId)

  // save item to db
  await companyRepository.update(touchedCompany)

  // return updated item
  return response(200, touchedCompany)
}

/**
 * Apply middleware
 */
export default httpWrapper(handler, UpdateCompanySchema)
