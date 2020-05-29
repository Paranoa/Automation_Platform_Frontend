import defaultSettings from '@/settings'

const title = defaultSettings.title || '接口测试平台'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
