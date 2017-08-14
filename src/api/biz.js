import fetch from 'common/js/fetch';

// 分页查询订单
export function getPageOrders(start, limit, status) {
  return fetch('', {
    start,
    limit,
    status
  });
}

// 详情查询订单
export function getOrder(code) {
  return fetch('', {
    code
  });
}
