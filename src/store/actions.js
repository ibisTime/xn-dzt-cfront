import * as types from './mutation-types';

// 添加地址，并设为当前选中的code
export const addAddrAndSetCur = function ({commit, state}, {address}) {
  let addressList = state.addressList.slice();
  addressList.push(address);
  commit(types.SET_ADDRESS_LIST, addressList);
  commit(types.SET_CURRENT_ADDR_CODE, address.code);
};
