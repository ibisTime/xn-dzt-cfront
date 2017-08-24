import fetch from 'common/js/fetch';
import {getUserId} from 'common/js/util';

// 列表查询面料
export function getMaterialList() {
  return fetch(620032, {
    orderColumn: 'order_no',
    orderDir: 'asc',
    status: 1
  });
}

// 详情查询面料
export function getMaterial(code) {
  return fetch(620033, {
    code,
    userId: getUserId()
  });
}

// 列表查询工艺
export function getTechnologyList(cache) {
  return fetch(620052, {
    orderColumn: 'order_no',
    orderDir: 'asc',
    status: 1
  });
}

// 端列表查（map）
export function getTechMapList() {
  if (getTechnologyList.data) {
    return Promise.resolve(getTechnologyList.data);
  }
  return fetch(620054, {
    orderColumn: 'order_no',
    orderDir: 'asc',
    status: 1
  }).then((data) => {
    getTechnologyList.data = data;
    return Promise.resolve(data);
  });
}

// 详情查询工艺
export function getTechnology(code) {
  return fetch(620053, {
    code,
    userId: getUserId()
  });
}

// 分页查询文章
export function getPageArticle(start, limit) {
  return fetch(620120, {
    start,
    limit,
    orderColumn: 'order_no',
    orderDir: 'asc',
    status: 1
  });
}

// 详情查询文章
export function getArticle(code) {
  return fetch(620123, {
    code,
    userId: getUserId()
  });
}

// 收藏
export function collection(objectCode) {
  return fetch(620130, {
    objectCode,
    operator: getUserId()
  });
}

// 取消收藏
export function cancelCollection(objectCode) {
  return fetch(620131, {
    objectCode,
    operator: getUserId()
  });
}

// 分页查询我的收藏
export function getPageCollections(start, limit, category) {
  return fetch(620135, {
    start,
    limit,
    operator: getUserId(),
    type: 1,
    category
    // orderColumn,
    // orderDir
  });
}

// 分页查询型号
export function getPageModel(start, limit, type, location) {
  return fetch(620010, {
    start,
    limit,
    type,
    location,
    userId: getUserId(),
    orderColumn: 'order_no',
    orderDir: 'asc'
  });
}
// 列表查询型号
export function getModelList(cache) {
  if (cache && getModelList.cache) {
    return Promise.resolve(getModelList.cache);
  }
  return fetch(620012, {}).then((data) => {
    if (cache) {
      getModelList.cache = data;
    }
    return Promise.resolve(data);
  });
}

// 详情查询型号
export function getModel(code) {
  return fetch(620013, {
    code,
    userId: getUserId()
  });
}

/**
 * 预约
 * @param params: {address, applyMobile, applyName, ltArea, ltCity, ltProvince, ltDatetime, map, productCode?}
 */
export function book(params) {
  return fetch(620200, {
    applyUser: getUserId(),
    updater: getUserId(),
    ...params
  });
}

// 取消预约
export function cancelBook(orderCode) {
  return fetch(620216, {
    orderCode,
    updater: getUserId()
  });
}

// 一键复购
export function reBook(productCode) {
  return fetch(620201, {
    productCode,
    applyUser: getUserId()
  });
}

// 获取最后一个订单信息
export function getLatestOrder() {
  return fetch(620218, {
    applyUser: getUserId()
  });
}

// 确认收货
export function receiveOrder(orderCode) {
  return fetch(620213, {
    orderCode,
    updater: getUserId()
  });
}

// 订单支付
export function payOrder(orderCode, payType) {
  return fetch(620206, {
    orderCode,
    payType
  });
}

// 分页查询订单
export function getPageOrders(start, limit, status) {
  return fetch(620233, {
    start,
    limit,
    status,
    applyUser: getUserId(),
    orderColumn: 'apply_datetime',
    orderDir: 'desc'
  });
}

// 详情查询订单
export function getOrder(code) {
  return fetch(620231, {
    code
  });
}

// 评论
export function ratingOrder(orderCode, content) {
  return fetch(620214, {
    orderCode,
    content,
    commenter: getUserId()
  });
}

// 留言
export function leaveMessage(content, type) {
  return fetch(620140, {
    content,
    type,
    commenter: getUserId()
  });
}

// 分页查询我的留言
export function getPageMessages(start, limit, type) {
  return fetch(620147, {
    start,
    limit,
    type,
    lookUser: getUserId(),
    orderColumn: 'create_datetime',
    orderDir: 'desc'
  });
}
