/** 
 * Notifiers types: tg, sl (NOT_IMPLEMNTED), tw (NOT_IMPLEMENTED) 
 * telegram, slack, twitter
 */


export const config = {
  cowinKey: 'CoWIN@$#&*(!@%^&',
  godChatId: 727080716,
  user: {
    mobile: '9665549658',
    user_id: 'b5cab167-7977-4df1-8027-a63aa144f04e'
  },
  tgBot: {
    token: '1795799332:AAFLBwPpA-sWFjGoY7d7ZKhVV0qFV2043dw'
  },
  districts: [
    {
      id: 383, // Pune 
      notifiers: [
        { type: 'tg', chat_id: -500113783 }
      ]
    },
    {
      id: 391, // Ahmednagar
      notifiers: [
        { type: 'tg', chat_id: -500113783 }
      ]
    },
    {
      id: 393, // Raigad
      notifiers: [
        { type: 'tg', chat_id: -500113783 }
      ]
    },
    {
      id: 155, // Vadodara
      notifiers: [
        { type: 'tg', chat_id: -500113783 }
      ]
    },
    {
      id: 777, // Vadodara Corporation
      notifiers: [
        { type: 'tg', chat_id: -500113783 }
      ]
    },
    {
      id: 312, // Bhopal
      notifiers: [
        { type: 'tg', chat_id: -500113783 }
      ]
    },
    {
      id: 314, // Indore
      notifiers: [
        { type: 'tg', chat_id: -500113783 }
      ]
    }
  ]
}