export const QUERY_KEYS = {
  getListPrice: 'getListPrice',
  getListProduct: 'getListProduct',
  getListCategory: 'getListCategory',
  getListOrder: 'getListOrder',
  getMyOrders: 'getMyOrders',
  getMyOrder: 'getMyOrder',
  getListUsers: 'getListUsers',
  getListComments: 'getListComments',
  getListContacts: 'getListContacts',
  getListAddresses: 'getListAddresses',
  getListBranches: 'getListBranches',
  getListFaqs: 'getListFaqs',
  getListBlogs: 'getListBlogs',
  getProvinces: 'getProvinces',
  getWards: 'getWards',
}

export type QUERY_PAGINATION = {
  page?: number
  limit?: number
}

export const PAGE_SIZE = 20
