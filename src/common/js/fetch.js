import {SYSTEM_CODE} from './config';
import {getCookie} from './cookie';
import Message from 'base/message/message';
import axios from 'axios';

const ERR_OK = '0';
const ERR_TIME_OUT = '4';

const message = new Message();

export default function fetch(code, param) {
  const url = '/api';

  const data = {
    systemCode: SYSTEM_CODE,
    companyCode: SYSTEM_CODE,
    token: getCookie('token'),
    ...param
  };

  param = 'code=' + code + '&json=' + encodeURIComponent(JSON.stringify(data));

  return axios.post(url, param, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then((res) => {
    res = res.data;
    if (res.errorCode === ERR_TIME_OUT) {
      message.show('登录超时，请重新登录');
      return Promise.reject('登录超时，请重新登录');
    }
    if(res.errorCode !== ERR_OK) {
      message.show(res.errorInfo.toString());
      return Promise.reject(res.errorInfo);
    }
    return Promise.resolve(res.data);
  });
}
