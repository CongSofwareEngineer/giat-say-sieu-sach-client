import BaseAPI from '@/config/baseApi'

export type ContactItem = {
  id: string
  userId?: string
  name: string
  phone: string
  email?: string
  subject: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

export type CreateContactPayload = {
  name: string
  phone: string
  email?: string
  subject: string
  message: string
}

type ListResponse = {
  data: ContactItem[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ContactApi extends BaseAPI {
  async createContact(payload: CreateContactPayload): Promise<ContactItem> {
    const response = await this.post<{ data: ContactItem }>('', payload, { isUseAuth: false })

    return response.data
  }

  async getContacts(params?: { page?: number; limit?: number; status?: string }): Promise<ListResponse> {
    const query = new URLSearchParams()

    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.status) query.set('status', params.status)

    const response = await this.get<ListResponse>(query.toString() ? `?${query.toString()}` : '', { isUseAuth: true })

    return response
  }

  async deleteContact(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`, { isUseAuth: true })
  }

  async updateContactStatus(id: string, status: string): Promise<ContactItem> {
    const response = await this.patch<{ data: ContactItem }>(`/${id}/status?status=${status}`, {}, { isUseAuth: true })

    return response.data
  }

  async updateContact(
    id: string,
    payload: { name?: string; phone?: string; email?: string; subject?: string; message?: string; status?: string }
  ): Promise<ContactItem> {
    const response = await this.patch<{ data: ContactItem }>(`/${id}`, payload, { isUseAuth: true })

    return response.data
  }
}

const ContactService = new ContactApi('contacts')

export default ContactService
