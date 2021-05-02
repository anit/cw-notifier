export const tgMessage = (json) => [
  'Alert! Just found out new available centers: \n\n\n',
  ...json.map(x => `${x.location}. \nAvailable: ${x.available}. \nOn: ${x.date}. ${x.vaccine}`)
].join('\n\n');