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
  getAdminBranches: 'getAdminBranches',
  getAdminFaqs: 'getAdminFaqs',
  getListPromotions: 'getListPromotions',
  getListBlogs: 'getListBlogs',
  getProvinces: 'getProvinces',
  getWards: 'getWards',
  getNotifications: 'getNotifications',
}

export type QUERY_PAGINATION = {
  page?: number
  limit?: number
}

export const PAGE_SIZE = 20
