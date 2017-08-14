import fetch from 'common/js/fetch';
import {getUserId, calculateSecurityLevel} from 'common/js/util';

// 获取用户详情
export function getUser() {
  return fetch('805056', {
    userId: getUserId()
  });
}

// 绑定手机号
export function bindMobile(mobile, smsCaptcha, code) {
  return fetch('805151', {
    mobile,
    smsCaptcha,
    code,
    userId: getUserId()
  });
}

// 修改手机号
export function changeMobile(newMobile, smsCaptcha) {
  return fetch('805047', {
    newMobile,
    smsCaptcha,
    userId: getUserId()
  });
}

// 设置支付密码
export function setTradePwd(tradePwd, smsCaptcha) {
  return fetch('805045', {
    tradePwd,
    smsCaptcha,
    tradePwdStrength: calculateSecurityLevel(tradePwd),
    userId: getUserId()
  });
}

/**
 * 新增收件地址
 * @param params {addressee, mobile, province, city, district, detailAddress, isDefault?}
 */
export function addAddress(params) {
  return fetch('805160', {
    userId: getUserId(),
    ...params
  });
}

// 删除收件地址
export function deleteAddress(code) {
  return fetch('805161', {code});
}

/**
 * 修改收件地址
 * @param  params {code, addressee, mobile, province, city, district, detailAddress, isDefault?}
 */
export function editAddress(params) {
  return fetch('805162', {
    userId: getUserId(),
    ...params
  });
}

// 列表查询地址
export function getAddressList() {
  return fetch('805165', {
    userId: getUserId()
  });
}

// 详情查询地址
export function getAddress(code) {
  return fetch('805166', {code});
}
