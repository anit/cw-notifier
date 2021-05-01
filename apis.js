export const generateOTP = (secret, mobile) => {
  return fetch('https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mobile, secret })
  });
}