import * as types from './mutation-types';

function findIndex(list, code) {
  return list.findIndex((item) => {
    return item.code === code;
  });
}

const mutations = {
  [types.SET_USER_STATE](state, user) {
    state.user = user;
  },
  [types.SET_USER_MOBILE](state, mobile) {
    let user = state.user || {};
    user.mobile = mobile;
    state.user = user;
  },
  [types.SET_USER_NICKNAME](state, nickname) {
    let user = state.user || {};
    user.nickname = nickname;
    state.user = user;
  },
  [types.SET_USER_TRADE_PWD_FLAG](state, tradepwdFlag) {
    let user = state.user || {};
    user.tradepwdFlag = tradepwdFlag;
    state.user = user;
  },
  [types.SET_ADDRESS_LIST](state, list) {
    state.addressList = list;
  },
  [types.SET_CURRENT_ADDR_CODE](state, code) {
    let index = findIndex(state.addressList);
    state.currentAddrCode = ~index ? state.addressList[0].code : code;
  },
  [types.SET_ORDER_LIST](state, list) {
    state.orderList = list;
  },
  [types.SET_CURRENT_ORDER](state, order) {
    state.currentOrder = order;
  },
  [types.SET_BANKCARD_LIST](state, list) {
    state.bankcardList = list;
  },
  [types.SET_CNY_ACCOUNT](state, account) {
    state.cnyAccount = account;
  },
  [types.SET_JF_ACCOUNT](state, account) {
    state.jfAccount = account;
  },
  [types.SET_JY_ACCOUNT](state, account) {
    state.jyAccount = account;
  },
  [types.SET_CURRENT_MATERIAL](state, material) {
    state.currentMaterial = material;
  },
  [types.SET_CURRENT_MODEL](state, model) {
    state.currentModel = model;
  },
  [types.SET_CURRENT_ARTICLE](state, model) {
    state.currentArticle = model;
  }
};

export default mutations;
