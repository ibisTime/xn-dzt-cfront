import fetch from 'common/js/fetch';

// 获取微信sdk初始化的参数
export function getInitWXSDKConfig() {
  return fetch(805952, {
    url: location.href.split('#')[0]
  });
}

// 获取用户的系统参数
export function getUserSystemConfig(ckey) {
  if (getUserSystemConfig[ckey]) {
    return Promise.resolve(getUserSystemConfig[ckey]);
  }
  return fetch(805917, {
    ckey
  }).then((data) => {
    getUserSystemConfig[ckey] = data;
    return Promise.resolve(data);
  });
}

// 获取业务的系统参数
export function getBizSystemConfig(ckey) {
  if (getBizSystemConfig[ckey]) {
    return Promise.resolve(getBizSystemConfig[ckey]);
  }
  return fetch(620917, {
    ckey
  }).then((data) => {
    getBizSystemConfig[ckey] = data;
    return Promise.resolve(data);
  });
}

// 分页获取业务的系统参数
export function getPageBizSysConfig(type) {
  if (getPageBizSysConfig[type]) {
    return Promise.resolve(getPageBizSysConfig[type]);
  }
  return fetch(620915, {
    type,
    start: 1,
    limit: 100
  }).then((data) => {
    getPageBizSysConfig[type] = data;
    return Promise.resolve(data);
  });
}

// 获取appId
export function getAppId() {
  return getUserSystemConfig('WX_H5_ACCESS_KEY');
}

// 获取七牛token
export function getQiniuToken() {
  return fetch(805951, {});
}

// 发送验证码
export function sendCaptcha(mobile, bizType) {
  return fetch(805950, {
    bizType,
    mobile,
    kind: 'f1'
  });
}

// 列表查寻数据字典
export function getDictList(parentKey) {
  if (getDictList[parentKey]) {
    return Promise.resolve(getDictList[parentKey]);
  }
  return fetch(805906, {
    parentKey
  }).then((data) => {
    getDictList[parentKey] = data;
    return Promise.resolve(data);
  });
}

// 获取banner
export function getBannerList() {
  return fetch(805806, {
    type: 2
  });
}
