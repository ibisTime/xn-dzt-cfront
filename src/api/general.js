import fetch from 'common/js/fetch';

export function sendCaptcha(mobile, bizType) {
  return fetch(805904, {
    bizType,
    mobile,
    kind: 'f1'
  });
}
