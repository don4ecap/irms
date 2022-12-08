import fs from 'fs'
import { ConfigIniParser } from 'config-ini-parser'

function getConfig(fieldName: string): string {
  const configContent = fs
    .readFileSync('/mnt/public/GLibs/FourElementsConfig/iRMS/config.cfg')
    .toString('utf8')

  const parser = new ConfigIniParser()
  parser.parse(configContent)

  return parser.getOptionFromDefaultSection(fieldName)
}

export default {
  getConfig,
}
