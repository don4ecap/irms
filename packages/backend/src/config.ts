import fs from 'fs'
import { ConfigIniParser } from 'config-ini-parser'

/** IRMS configuration constants.*/
const IRMS_CONFIG = {
  /** The file path to the iRMS configuration file. Defaults to `/mnt/public/GLibs/FourElementsConfig/iRMS/config.cfg`. */
  CONFIG_FILE_PATH:
    process.env.IRMS_BACKEND_CONFIG_FILE ||
    '/mnt/public/GLibs/FourElementsConfig/iRMS/config.cfg',
  /** iRMS API base path prefix */
  IRMS_API_BASE_PATH_PREFIX: '/api/irms/v1',
  /** iCMS API base path prefix */
  ICMS_API_BASE_PATH_PREFIX: '/api/icms/v1',
}

/**
 * Get the value of a field in the iRMS configuration file.
 * @param fieldName - The name of the field to retrieve.
 * @returns The value of the field as a string.
 */
function getConfig(fieldName: string): string {
  // Read the contents of the configuration file
  const configContent = fs
    .readFileSync(IRMS_CONFIG.CONFIG_FILE_PATH)
    .toString('utf8')

  // Parse the configuration file using the ConfigIniParser library
  const parser = new ConfigIniParser()
  parser.parse(configContent)

  // Get the value of the specified field from the default section
  return parser.getOptionFromDefaultSection(fieldName)
}

export default {
  IRMS_CONFIG,
  getConfig,
}
