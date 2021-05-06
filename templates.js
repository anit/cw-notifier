/**
  text = [
    '<b>New available slots</b> \n\n',
    ...json.map(x => [
      `📍 Pin Code <b>211223</b>`,
      `🏥 Location`,
      `🪑 Available <b>140</b>`, 
      `🗓 12-3-2021`,
      `💉 \n\n`
    ].join('\n')),
    '•••••\n\n'
  ].join('');
 */

import { capitalize } from "./utils"

export const tgMessage = (json) => [
  '<b>New available slots</b> \n\n',
  ...json.map(x => [
    `📍 Pin Code <b>${x.pincode}</b>`,
    `🪑 Available <b>${x.available}</b>`, 
    `🗓 ${x.date}`,
    `💉 ${capitalize(x.vaccine) || '?'}`,
    `🏥 ${x.location}\n\n`,
  ].join('\n')),
  '•••••\n\n'
].join('');