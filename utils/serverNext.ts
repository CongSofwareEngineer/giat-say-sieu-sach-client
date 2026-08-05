import { SITE_CONFIG } from '@/constants/app'

export const generateMetaBase = ({
  dataBase,
  title = null,
  des = null,
  image = null,
  override = false,
  overrideImage = false,
}: {
  dataBase: Record<string, any>
  title?: string | null
  des?: string | null
  image?: string | null
  override?: boolean
  overrideImage?: boolean
}) => {
  const dataClone = JSON.parse(JSON.stringify(dataBase))

  if (title) {
    dataClone.title.absolute = override ? title : `${SITE_CONFIG.title} | ${title}`
    dataClone.openGraph.title = override ? title : `${SITE_CONFIG.title} | ${title}`
    dataClone.twitter.title = override ? title : `${SITE_CONFIG.title} | ${title}`
    dataClone.appleWebApp.title = override ? title : `${SITE_CONFIG.title} | ${title}`
  }

  if (des) {
    dataClone.description = override ? des : `${dataBase.description} - ${des}`
    dataClone.openGraph.description = override ? des : `${dataBase.description} - ${des}`
    dataClone.twitter.description = override ? des : `${dataBase.description} - ${des}`
  }
  if (overrideImage && image) {
    dataClone.openGraph.images = [
      {
        url: image,
      },
    ]
    dataClone.twitter.images = image
  }

  return dataClone
}
