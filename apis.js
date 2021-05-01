import SmsAndroid from 'react-native-get-sms-android';
import CryptoJS from "react-native-crypto-js";
import { sha256 } from 'react-native-sha256';


export const getSecret = (userId) => {
  const key = 'CoWIN@$#&*(!@%^&';

  return CryptoJS.AES.encrypt(userId, key).toString();
}

export const requestOTP = (mobile, userId) => {
  const secret = getSecret(userId);
  return new Promise((resolve, reject) => {
    fetch('https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mobile, secret })
    })
    .then(response => response.json())
    .then(json => {
      if (json && json.txnId) resolve(json.txnId);
      else reject();
    })
    .catch(e => reject(e));
  }) 
}

export const validateOTP = async (otp, txnId) => {
  const hash = await sha256(otp);
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
    .catch(e => reject(e));
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
          minDate: Date.now() - (1000 * 60 * 20), // change last number to change mins.
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