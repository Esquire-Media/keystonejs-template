import { type AdminConfig } from '@keystone-6/core/types'
import { Branding } from './components/Branding'
import SiteMap from './components/SiteMap'

export const components: AdminConfig['components'] = {
  Logo: Branding,
  Navigation: SiteMap,
}