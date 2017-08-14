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
  [types.SET_USER_TRADE_PWD_FLAG](state, pwdStrength) {
    let user = state.user || {};
    user.trade_pwd_strength = pwdStrength;
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
  }
};

export default mutations;
