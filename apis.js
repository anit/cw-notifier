import SmsAndroid from 'react-native-get-sms-android';
import CryptoJS from "react-native-crypto-js";
import sha256 from 'crypto-js/sha256';
import { config } from './config';
import { tgMessage } from './templates';


export const extractToken = async () => {
  return new Promise(async (resolve, reject) => {
      const txnId = await requestOTP();
      const otp = txnId && await readOtpFromSms();

      if (!otp || !txnId) reject(`No otp or txnId found: ${txnId} ${otp}`);
      const token = await validateOTP(otp, txnId);

      if (!otp || !txnId) reject(`No token found: ${token}`);

      resolve(token);
  });
}


export const getSecret = () => {
  return CryptoJS.AES.encrypt(config.user.user_id, config.cowinKey).toString();
}

export const requestOTP = () => {
  const secret = getSecret();
  return new Promise((resolve, reject) => {
    console.log('Fetching otp for ', { mobile: config.user.mobile, secret })
    fetch('https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mobile: config.user.mobile, secret })
    })
    .then(response => response.json())
    .then(json => {
      if (json && json.txnId) resolve(json.txnId);
      else reject('TxnId was not found here');
    })
    .catch(e => { console.log('Error retrieving otp: ', e); reject(e); });
  }) 
}

export const validateOTP = async (otp, txnId) => {
  const hash = sha256(otp).toString()
  return new Promise((resolve, reject) => {
    fetch('https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ otp: hash, txnId })
    })
    .then(response => response.json())
    .then(json => {
      if (json) resolve(json);
      else reject();
    })
    .catch(e => { console.log('Error validating otp: ', e); reject(e); });
  }) 
}

export const readOtpFromSms = () => {
  const regex = /OTP .{0,} CoWIN is (.*)\. It will be valid/i;
  var retries = 0;
  var maxRetry = 300;

  return new Promise((resolve, reject) => { 
    var interval = setInterval(() => {
      retries++;
      SmsAndroid.list(
        JSON.stringify({
          minDate: Date.now() - (1000 * 60 * 2), // change last number to change mins.
          maxDate: Date.now,
          bodyRegex: '(.*)Your OTP to register\/access CoWIN(.*)', // content regex to match
          maxCount: 1
        }),
        (fail) => { manageRetry(); console.log('sms read fail: ' + fail); },
        (count, resp) => {
          let sms = JSON.parse(resp);
          if (!sms[0] || !sms[0].body) return;
  
          const otp = regex.exec(sms[0].body)[1];

          // Otp found. Moving ahead.
          if (otp) {
            clearInterval(interval);
            resolve(otp);
          }

          manageRetry()
        },
      );
    }, 2000);

    const manageRetry = () => {
      // Reject after a certain retries. We are not gonna get anything  now.
      if (retries >= maxRetry) {
        clearInterval(interval);
        reject();
      }
    }
  })
}


export const getAvailableCenters = (token, districtId, date, minAge = 18) => {
  return new Promise((resolve, reject) => {
    fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${districtId}&date=${date}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(json => {
      if (json) resolve(parseAvailableCenters(json, minAge));
      else reject('Something went wrong in making json of available centers');
    })
    .catch(e => { console.log('Error getting available centers: ', e); reject(e); });
  });
};


export const parseAvailableCenters = (json, minAge) => {
  return json.centers.reduce((allCenters, center) => {
    return allCenters.concat(...center.sessions.filter(x => {
      return x.min_age_limit == minAge && x.available_capacity >= 1;
    }).map(x => {
      return { center: center.name, district: center.district_name, pincode: center.pincode, date: x.date, vaccine: x.vaccine, available: x.available_capacity }
    }));
  }, []);
};


export const notifyTelegram = (json, chat_id) => {
  var reply_markup =  {
    inline_keyboard: [[
      {
        text: 'Open Cowin',
        url: 'https://selfregistration.cowin.gov.in'            
      }]
    ]
  };

  const text = tgMessage(json);
  return fetch(`https://api.telegram.org/bot${config.tgBot.token}/sendMessage?parse_mode=html`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ chat_id, text, reply_markup })
  });
}

export const  pingTelegram = (chat_id) => {
  const text = 'Test Ping';
  return fetch(`https://api.telegram.org/bot${config.tgBot.token}/sendMessage`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ chat_id, text })
  });
}

// export const pingGod = (text) => {
//   console.log('pinging god...', text, config.tgBot.token)
//   return fetch(`https://api.telegram.org/bot${config.tgBot.token}/sendMessage`, {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ chat_id: config.godChatId, text })
//   });
// }

export const pingGod = (text) => {
  var json = [1,2,3,4];

  var reply_markup =  {
    "inline_keyboard": [[
        {
            "text": "Open Cowin",
            "url": "https://selfregistration.cowin.gov.in"            
        }]
    ]
};

  text = [
    '<b>New available slots</b> \n\n',
    ...json.map(x => [
      `Pin Code <b>211223</b>`,
      `🏥 Location`,
      `🪑 Available <b>140</b>`, 
      `🗓 12-3-2021`,
      `💉 COVISHIELD\n\n`
    ].join('\n')),
    '•••••\n\n',
  ].join('');

  return fetch(`https://api.telegram.org/bot${config.tgBot.token}/sendMessage?parse_mode=html`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ chat_id: config.godChatId, text, reply_markup })
  });
}