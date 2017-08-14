import Vue from 'vue';
import Router from 'vue-router';
import Home1 from 'components/home1/home1';
import ChangeMobile from 'components/change-mobile/change-mobile';
import BindMobile from 'components/bind-mobile/bind-mobile';
import TradePwd from 'components/trade-pwd/trade-pwd';
import AddEditAddress from 'components/add-edit-address/add-edit-address';
import Orders from 'components/orders/orders';
import Technology from 'components/technology/technology';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      component: Home1,
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
