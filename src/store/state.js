import {loadAvatar} from 'common/js/cache';

const state = {
  user: null,
  addressList: [],
  currentAddrCode: '',
  orderList: {},
  currentOrder: null,
  bankcardList: null,
  cnyAccount: null,
  jfAccount: null,
  jyAccount: null,
  hybAccount: null,
  currentMaterial: null,
  currentModel: null,
  currentArticle: null,
  avatars: loadAvatar()
};

export default state;
