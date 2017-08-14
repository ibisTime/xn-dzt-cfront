import {setCookie, getCookie, delCookie} from './cookie';

// 获取userId
export function getUserId() {
  return getCookie('userId') || '';
}

// 保存用户登录信息
export function setUser(data) {
  setCookie('userId', data.userId);
  setCookie('token', data.token);
}

// 删除用户登录信息
export function clearUser() {
  delCookie('userId');
  delCookie('token');
}

// 计算密码强度
export function calculateSecurityLevel(password) {
  var strengthL = 0;
  var strengthM = 0;
  var strengthH = 0;

  for (var i = 0; i < password.length; i++) {
    var code = password.charCodeAt(i);
    // 数字
    if (code >= 48 && code <= 57) {
      strengthL++;
      // 小写字母 大写字母
    } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      strengthM++;
      // 特殊符号
    } else if ((code >= 32 && code <= 47) || (code >= 58 && code <= 64) || (code >= 94 && code <= 96) || (code >= 123 && code <= 126)) {
      strengthH++;
    }
  }
  // 弱
  if ((strengthL === 0 && strengthM === 0) || (strengthL === 0 && strengthH === 0) || (strengthM === 0 && strengthH === 0)) {
    return '1';
  }
  // 强
  if (strengthL !== 0 && strengthM !== 0 && strengthH !== 0) {
    return '3';
  }
  // 中
  return '2';
}

// 微信设置页面标题
export function setTitle(title) {
  document.title = title;
  let iframe = document.createElement('iframe');
  iframe.src = '//m.baidu.com/favicon.ico';
  iframe.style.display = 'none';
  iframe.onload = () => {
    setTimeout(() => {
      iframe.remove();
    }, 9);
  };
  document.body.appendChild(iframe);
}

// 校验短信验证码
export function captValid(capt) {
  let result = {
    err: 0,
    msg: ''
  };
  if (!capt) {
    result.err = 1;
    result.msg = '不能为空';
  } else if (!/^\d{4}$/.test(capt)) {
    result.err = 1;
    result.msg = '格式错误';
  }
  return result;
}

// 校验手机号
export function mobileValid(mobile) {
  let result = {
    err: 0,
    msg: ''
  };
  if (!mobile) {
    result.err = 1;
    result.msg = '不能为空';
  } else if (!/^1[3|4|5|7|8]\d{9}$/.test(mobile)) {
    result.err = 1;
    result.msg = '格式错误';
  }
  return result;
}

// 交易密码校验
export function tradeValid(trade) {
  let result = {
    err: 0,
    msg: ''
  };
  if (!trade) {
    result.err = 1;
    result.msg = '不能为空';
  } else if (trade.length < 6) {
    result.err = 1;
    result.msg = '长度不能小于6位';
  }
  return result;
}

// 校验第二次密码是否和第一次相同
export function rePwdValid(rePwd, pwd) {
  let result = {
    err: 0,
    msg: ''
  };
  if (!rePwd) {
    result.err = 1;
    result.msg = '不能为空';
  } else if (pwd !== rePwd) {
    result.err = 1;
    result.msg = '两次密码不同';
  }
  return result;
}
