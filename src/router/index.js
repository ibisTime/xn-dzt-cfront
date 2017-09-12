import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// 首页
const Home = () => import('components/home/home');
// 精致工艺列表
const Technology = () => import('components/technology/technology');
// 高端面料列表
const Material = () => import('components/material/material');
// 高端面料详情
const MaterialDetail = () => import('components/material-detail/material-detail');
// 衬衫详情页
const ProductDetail = () => import('components/product-detail/product-detail');
// 合衣衬衫列表
const Shirts = () => import('components/shirts/shirts');
// H+列表
const HClothes = () => import('components/h-clothes/h-clothes');

// 预约
const Book = () => import('components/book/book');

// 发现
const Find = () => import('components/find/find');
// 发现详情页
const FindDetail = () => import('components/find-detail/find-detail');
// 评论列表页
const FindRatings = () => import('components/find-ratings/find-ratings');

// 我的
const User = () => import('components/user/user');
// 用户设置
const Setting = () => import('components/setting/setting');
// 修改头像
const EditAvatar = () => import('components/edit-avatar/edit-avatar');
// 修改昵称
const Nickname = () => import('components/nickname/nickname');
// 修改手机号
const ChangeMobile = () => import('components/change-mobile/change-mobile');
// 绑定手机号
const BindMobile = () => import('components/bind-mobile/bind-mobile');
// 支付密码
const TradePwd = () => import('components/trade-pwd/trade-pwd');
// 银行卡列表
const BankCard = () => import('components/bankcard/bankcard');
// 新增、修改银行卡
const BankCardAddEdit = () => import('components/bankcard-addedit/bankcard-addedit');
// 我的账户
const Account = () => import('components/account/account');
// 账户流水
const CnyFlow = () => import('components/cny-flow/cny-flow');
// 积分流水
const JfFlow = () => import('components/jf-flow/jf-flow');
// 合衣币流水
const HybFlow = () => import('components/hyb-flow/hyb-flow');
// 经验流水
// const JyFlow = () => import('components/jy-flow/jy-flow');
// 积分兑换
const JfExchange = () => import('components/jf-exchange/jf-exchange');
// 充值
const Recharge = () => import('components/recharge/recharge');
// 提现
const Withdraw = () => import('components/withdraw/withdraw');
// 积分规则
const JfRules = () => import('components/jf-rules/jf-rules');
// 订单列表
const Orders = () => import('components/orders/orders');
// 订单详情
const OrderDetail = () => import('components/order-detail/order-detail');
// 支付订单
const Pay = () => import('components/pay/pay');
// 客服留言
const Service = () => import('components/service/service');
// 着装顾问
const Adviser = () => import('components/adviser/adviser');
// 常见问题
const Question = () => import('components/question/question');
// 我的收藏
const Collection = () => import('components/collection/collection');
// 收藏的文章
const CollectionFind = () => import('components/collection-find/collection-find');
// 收藏的产品
const CollectionProduct = () => import('components/collection-product/collection-product');
// 收藏的面料
const CollectionMaterial = () => import('components/collection-material/collection-material');
// 收藏的工艺
const CollectionTech = () => import('components/collection-tech/collection-tech');
// 会员中心
const Member = () => import('components/member/member');
// 会员福利
const MemberWelfare = () => import('components/member-welfare/member-welfare');
// 会员介绍
const MemberIntroduce = () => import('components/member-introduce/member-introduce');
// 我的推荐
const Recommend = () => import('components/recommend/recommend');
// 推荐历史
const ChildMembers = () => import('components/child-members/child-members');
// 专属报告
const Report = () => import('components/report/report');
// 关于我们
const Aboutus = () => import('components/aboutus/aboutus');
// 系统消息
const Notice = () => import('components/notice/notice');
// 新增修改地址
// const AddEditAddress = () => import('components/add-edit-address/add-edit-address');

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
          path: 'technology',
          component: Technology
        },
        {
          path: 'material',
          component: Material,
          children: [
            {
              path: ':id',
              component: MaterialDetail
            }
          ]
        },
        {
          path: 'shirt',
          component: Shirts,
          children: [
            {
              path: ':id',
              component: ProductDetail
            }
          ]
        },
        {
          path: 'clothes',
          component: HClothes,
          children: [
            {
              path: ':id',
              component: ProductDetail
            }
          ]
        },
        {
          path: ':id',
          component: ProductDetail
        }
      ]
    },
    {
      path: '/book',
      component: Book
    },
    {
      path: '/find',
      component: Find,
      children: [
        {
          path: ':id',
          component: FindDetail,
          children: [
            {
              path: 'rating',
              component: FindRatings
            }
          ]
        }
      ]
    },
    {
      path: '/user',
      component: User,
      children: [
        {
          path: 'setting',
          component: Setting,
          children: [
            {
              path: 'avatar',
              component: EditAvatar
            },
            {
              path: 'nickname',
              component: Nickname
            },
            {
              path: 'bind-mobile',
              component: BindMobile
            },
            {
              path: 'change-mobile',
              component: ChangeMobile
            },
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
              path: 'bankcard',
              component: BankCard,
              children: [
                {
                  path: 'add',
                  component: BankCardAddEdit
                },
                {
                  path: ':id',
                  component: BankCardAddEdit
                }
              ]
            },
            {
              path: 'aboutus',
              component: Aboutus
            },
            {
              path: 'notice',
              component: Notice
            }
          ]
        },
        {
          path: 'account',
          component: Account,
          children: [
            {
              path: 'cny-flow',
              component: CnyFlow
            },
            {
              path: 'jf-flow',
              component: JfFlow
            },
            {
              path: 'hyb-flow',
              component: HybFlow
            },
            {
              path: 'jf-exchange',
              component: JfExchange
            },
            {
              path: 'recharge',
              component: Recharge
            },
            {
              path: 'withdraw',
              component: Withdraw,
              children: [
                {
                  path: 'add',
                  component: BankCardAddEdit
                }
              ]
            },
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
              path: 'jf-rules',
              component: JfRules
            }
          ]
        },
        {
          path: 'order',
          component: Orders,
          children: [
            {
              path: 'pay',
              component: Pay
            },
            {
              path: 'adviser',
              component: Adviser
            },
            {
              path: ':code',
              component: OrderDetail,
              children: [
                {
                  path: 'pay',
                  component: Pay
                },
                {
                  path: 'adviser',
                  component: Adviser
                }
              ]
            }
          ]
        },
        {
          path: 'service',
          component: Service
        },
        {
          path: 'adviser',
          component: Adviser
        },
        {
          path: 'question',
          component: Question
        },
        {
          path: 'collection',
          component: Collection,
          children: [
            {
              path: 'find',
              component: CollectionFind,
              children: [
                {
                  path: ':id',
                  component: FindDetail
                }
              ]
            },
            {
              path: 'product',
              component: CollectionProduct,
              children: [
                {
                  path: ':id',
                  component: ProductDetail
                }
              ]
            },
            {
              path: 'material',
              component: CollectionMaterial,
              children: [
                {
                  path: ':id',
                  component: MaterialDetail
                }
              ]
            },
            {
              path: 'tech',
              component: CollectionTech
            }
          ]
        },
        {
          path: 'member',
          component: Member,
          children: [
            {
              path: 'welfare',
              component: MemberWelfare
            },
            {
              path: 'introduce',
              component: MemberIntroduce
            }
          ]
        },
        {
          path: 'recommend',
          component: Recommend,
          children: [
            {
              path: 'history',
              component: ChildMembers
            }
          ]
        },
        {
          path: 'report',
          component: Report
        }
      ]
    }
  ]
});
