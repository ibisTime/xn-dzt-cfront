import * as types from './mutation-types';
import {saveAvatar, deleteAvatar, clearAvatar} from 'common/js/cache';

function _getOrderList(state, code, prevStatus, nextStatus) {
  let allList = null;
  let prevList = null;
  let nextList = null; // 置空下个状态

  // 如果有all的数据，并且有这个订单，则改变状态
  if (state.orderList.all) {
    allList = {
      ...state.orderList.all
    };
    let index = allList.data.findIndex((order) => {
      return order.code === code;
    });
    if (index !== -1) {
      allList.data = allList.data.slice();
      let _item = {
        ...allList.data[index],
        status: nextStatus
      };
      allList.data.splice(index, 1, _item);
    }
  }

  if (prevStatus === '3' || prevStatus === '4' || prevStatus === '5' || prevStatus === '6') {
    prevStatus = '3||4||5||6';
  }
  if (nextStatus === '3' || nextStatus === '4' || nextStatus === '5' || nextStatus === '6') {
    nextStatus = '3||4||5||6';
  }
  // 如果有当前状态的数据，则删除这条订单
  if (state.orderList[prevStatus]) {
    prevList = {
      ...state.orderList[prevStatus]
    };
    let index = prevList.data.findIndex((order) => {
      return order.code === code;
    });
    if (index !== -1) {
      prevList.data = prevList.data.slice();
      prevList.data.splice(index, 1);
    }
  }
  let _orderList = {
    ...state.orderList,
    [prevStatus]: prevList,
    [nextStatus]: nextList,
    all: allList
  };
  return _orderList;
}

// 新增银行卡
export const addBankCard = function({commit, state}, {bankcard}) {
  let bankcardList = state.bankcardList.slice();
  bankcardList.unshift(bankcard);
  commit(types.SET_BANKCARD_LIST, bankcardList);
};

// 删除银行卡
export const deleteBankCard = function({commit, state}, {code}) {
  let bankcardList = state.bankcardList.slice();
  let index = bankcardList.findIndex((item) => {
    return item.code === code;
  });
  bankcardList.splice(index, 1);
  commit(types.SET_BANKCARD_LIST, bankcardList);
};

// 修改银行卡
export const editBankCard = function({commit, state}, {bankcard}) {
  let bankcardList = state.bankcardList.slice();
  let index = bankcardList.findIndex((item) => {
    return item.code === bankcard.code;
  });
  bankcardList.splice(index, 1, bankcard);
  commit(types.SET_BANKCARD_LIST, bankcardList);
};

// 取消订单后，改变orderList
export const editOrderListByCancel = function({commit, state}, {prevStatus, code}) {
  let nextStatus = '11';
  let _orderList = _getOrderList(state, code, prevStatus, nextStatus);
  commit(types.SET_ORDER_LIST, _orderList);
};

// 支付订单后，改变orderList
export const editOrderListByPay = function({commit, state}, {code}) {
  let prevStatus = '2';
  let nextStatus = '3';

  let _orderList = _getOrderList(state, code, prevStatus, nextStatus);
  commit(types.SET_ORDER_LIST, _orderList);

  if (state.currentOrder && state.currentOrder.code === code) {
    let _order = {
      ...state.currentOrder
    };
    _order.status = nextStatus;
    commit(types.SET_CURRENT_ORDER, _order);
  }
};

// 评论成功后，改变orderList
export const editOrderListByRating = function({commit, state}, {code}) {
  let prevStatus = '8';
  let nextStatus = '9';

  let _orderList = _getOrderList(state, code, prevStatus, nextStatus);
  commit(types.SET_ORDER_LIST, _orderList);
};

// 收货成功后，改变orderList
export const editOrderListByReceived = function({commit, state}, {code}) {
  let prevStatus = '7';
  let nextStatus = '8';

  let _orderList = _getOrderList(state, code, prevStatus, nextStatus);
  commit(types.SET_ORDER_LIST, _orderList);
};

// 添加地址，并设为当前选中的code
export const addAddrAndSetCur = function({commit, state}, {address}) {
  let addressList = state.addressList.slice();
  addressList.push(address);
  commit(types.SET_ADDRESS_LIST, addressList);
  commit(types.SET_CURRENT_ADDR_CODE, address.code);
};
// 设置头像的列表，并保存到localStorage
export const saveAvatarHistory = function ({commit}, avatars) {
  commit(types.SET_AVATARS, saveAvatar(avatars));
};
// 删除头像的列表中的某条数据，并保存到localStorage
export const deleteAvatarHistory = function ({commit}, avatars) {
  commit(types.SET_AVATARS, deleteAvatar(avatars));
};
// 删除头像的列表，并保存到localStorage
export const clearAvatarHistory = function ({commit}) {
  commit(types.SET_AVATARS, clearAvatar());
};
