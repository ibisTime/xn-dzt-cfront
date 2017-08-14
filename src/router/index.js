import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const Home = () => import('components/home/home');
// 修改手机号
const ChangeMobile = () => import('components/change-mobile/change-mobile');
// 绑定手机号
const BindMobile = () => import('components/bind-mobile/bind-mobile');
// 交易密码
const TradePwd = () => import('components/trade-pwd/trade-pwd');
// 新增修改地址
const AddEditAddress = () => import('components/add-edit-address/add-edit-address');
// 订单列表
const Orders = () => import('components/orders/orders');
// 精致工艺列表
const Technology = () => import('components/technology/technology');
// 高端面料列表
const Material = () => import('components/material/material');

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      component: Home,
      children: [
        {
          path: 'set-tradepwd',
          component: TradePwd,
          children: [
            {
              path: 'bind-mobile',
              component: BindMobile
            }
          ]
        },
        {
          path: 'add-edit-addr',
          component: AddEditAddress
        },
        {
          path: 'orders',
          component: Orders
        },
        {
          path: 'technology',
          component: Technology
        },
        {
          path: 'material',
          component: Material
        }
      ]
    },
    {
      path: '/change-mobile',
      component: ChangeMobile
    },
    {
      path: '/bind-mobile',
      component: BindMobile
    },
    {
      path: '/set-tradepwd',
      component: TradePwd,
      children: [
        {
          path: 'bind-mobile',
          component: BindMobile
        }
      ]
    }
  ]
});
