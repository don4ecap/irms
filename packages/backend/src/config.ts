import fs from 'fs'
import { ConfigIniParser } from 'config-ini-parser'

const configFilePath =
  process.env.IRMS_BACKEND_CONFIG_FILE ||
  '/mnt/public/GLibs/FourElementsConfig/iRMS/config.cfg'

function getConfig(fieldName: string): string {
  const configContent = fs.readFileSync(configFilePath).toString('utf8')

  const parser = new ConfigIniParser()
  parser.parse(configContent)

  return parser.getOptionFromDefaultSection(fieldName)
}

export default {
  getConfig,
  configFilePath,
}
