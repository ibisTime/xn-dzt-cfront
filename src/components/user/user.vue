<template>
  <div class="user-wrapper">
    <scroll class="user-content">
      <div>
        <div @click="goSet" class="avatar-wrapper needsclick" ref="bgImage">
          <div class="avatar">
            <img :src="(user && user.photo) | formatAvatar"/>
          </div>
          <div class="user-info">
            <h1>{{user && user.nickname}}</h1>
            <p>
              <span>{{getText(user && user.level)}}</span>
            </p>
          </div>
        </div>
        <div class="order-wrapper">
          <div class="user-main-title needsclick" @click="goOrder(0)">
            <div class="title border-top-1px border-bottom-1px">
              <h2>我的订单</h2>
            </div>
          </div>
          <div class="order-types">
            <div class="order-type needsclick" @click="goOrder(1)">
              <div class="type order-dlt"></div>
              <div v-show="toMeasureOrder" class="badge-text"><badge :text="toMeasureOrder"></badge></div>
              <p>待量体</p>
            </div>
            <div class="order-type needsclick" @click="goOrder(2)">
              <div class="type order-dzf"></div>
              <div v-show="toPayOrder" class="badge-text"><badge :text="toPayOrder"></badge></div>
              <p>待支付</p>
            </div>
            <div class="order-type needsclick" @click="goOrder(4)">
              <div class="type order-dsh"></div>
              <div v-show="toReceiverOrder" class="badge-text"><badge :text="toReceiverOrder"></badge></div>
              <p>待收货</p>
            </div>
            <div class="order-type needsclick" @click="goOrder(5)">
              <div class="type order-dpj"></div>
              <div v-show="toCommentOrder" class="badge-text"><badge :text="toCommentOrder"></badge></div>
              <p>待评价</p>
            </div>
            <div class="order-type needsclick" @click="goOrder(6)">
              <div class="type order-shz"></div>
              <p>售后中</p>
            </div>
          </div>
        </div>
        <div class="split"></div>
        <div class="user-menus">
          <div class="user-main-title">
            <div class="title border-top-1px border-bottom-1px">
              <h2>私人服务</h2>
            </div>
          </div>
          <div class="service-types">
            <router-link class="service-type needsclick" tag="div" to="/user/report">
              <div class="type service-zsbg"></div>
              <p>专属报告</p>
            </router-link>
            <router-link to="/user/adviser" class="service-type needsclick" tag="div">
              <div class="type service-zzgw"></div>
              <p>着装顾问</p>
            </router-link>
            <router-link to="/user/service" class="service-type needsclick" tag="div">
              <div class="type service-kfts"></div>
              <p>客服投诉</p>
            </router-link>
            <router-link to="/user/question" class="service-type needsclick" tag="div">
              <div class="type service-cjwt"></div>
              <p>常见问题</p>
            </router-link>
          </div>
          <router-link v-if="user && user.level!=='1'" to="/user/member" class="user-title border-bottom-1px user-title-top border-top-1px needsclick" tag="div">
            <h2>会员中心</h2>
            <i class="arrow"></i>
          </router-link>
          <div v-else class="join-member needsclick" @click="getVIPMoney">加入会员</div>
          <router-link to="/user/account" class="user-title border-bottom-1px needsclick" tag="div">
            <h2>我的账户</h2>
            <i class="arrow"></i>
          </router-link>
          <router-link to="/user/recommend" class="user-title border-bottom-1px needsclick" tag="div">
            <h2>我的推荐</h2>
            <i class="arrow"></i>
          </router-link>
          <router-link to="/user/collection" class="user-title border-bottom-1px needsclick" tag="div">
            <h2>我的收藏</h2>
            <i class="arrow"></i>
          </router-link>
        </div>
      </div>
    </scroll>
    <toast ref="toast" :text="text"></toast>
    <confirm :isAlert="!isAlert" :isHtml="isHtml" :text="text" confirmBtnText="确认" ref='confirm' @confirm="showChosen()"></confirm>
    <chosen class="chose-wrapper" ref="chosen">
      <div class="item border-bottom-1px" @click="weixinPay">
        微信支付
      </div>
      <div class="item border-bottom-1px" @click="yePay">
        余额支付（¥{{getAmount('cnyAccount')}}）
      </div>
      <div class="item border-bottom-1px" @click="hybPay">
        合衣币支付（{{getAmount('hybAccount')}}）
      </div>
    </chosen>
    <div v-show="loadingFlag" class="loading-container">
      <div class="loading-wrapper">
        <loading title=""></loading>
      </div>
    </div>
    <router-view @updateNum="handleUpdateNum"></router-view>
  </div>
</template>
<script>
  import Chosen from 'components/chosen/chosen';
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_USER_STATE, SET_CNY_ACCOUNT, SET_HYB_ACCOUNT} from 'store/mutation-types';
  import {getUser, buyVIP} from 'api/user';
  import {getDictList, getBizSystemConfig} from 'api/general';
  import {getAccount} from 'api/account';
  import {getOrderNum} from 'api/biz';
  import {setTitle, formatAmount, isUnDefined} from 'common/js/util';
  import {commonMixin} from 'common/js/mixin';
  import {initPay} from 'common/js/weixin';
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import Toast from 'base/toast/toast';
  import Confirm from 'base/confirm/confirm';
  import Badge from 'base/badge/badge';

  export default {
    mixins: [commonMixin],
    data() {
      return {
        text: '',
        loadingFlag: true,
        cnyAccount: null,
        hybAccount: null,
        isAlert: true,
        isHtml: true,
        orderNum: null
      };
    },
    created() {
      this.first = true;
      this.hasLoad = false;
      this.fetching = false;
      this.levelDict = {};
      this._getUser();
    },
    computed: {
      toMeasureOrder() {
        return (this.orderNum && this.orderNum.toMeasureOrder || '') + '';
      },
      toPayOrder() {
        return (this.orderNum && this.orderNum.toPayOrder || '') + '';
      },
      toReceiverOrder() {
        return (this.orderNum && this.orderNum.toReceiverOrder || '') + '';
      },
      toCommentOrder() {
        return (this.orderNum && this.orderNum.toCommentOrder || '') + '';
      },
      ...mapGetters([
        'user'
      ])
    },
    methods: {
      _getUser() {
        if (this.shouldGetData()) {
          this.first = false;
          Promise.all([
            getUser(),
            getDictList('user_level')
          ]).then(([userData, levelDict]) => {
            this.loadingFlag = false;
            let obj = {};
            levelDict.forEach((item) => {
              obj[item.dkey] = item.dvalue;
            });
            this.levelDict = obj;
            this.setUser(userData);
          }).catch(() => {
            this.loadingFlag = false;
          });
        }
      },
      shouldGetData() {
        if (this.$route.path === '/user') {
          setTitle('我的');
          if (!this.hasLoad && !this.fetching) {
            this.getOrderNum();
          }
          return this.first;
        }
        if (this.hasLoad) {
          this.hasLoad = false;
        }
        return false;
      },
      getOrderNum() {
        this.fetching = true;
        getOrderNum().then((data) => {
          this.orderNum = data;
          this.hasLoad = true;
          this.fetching = false;
        }).catch(() => {
          this.hasLoad = true;
          this.fetching = false;
        });
      },
      getText(level) {
        if (isUnDefined(level)) {
          return '';
        }
        return this.levelDict[level];
      },
      goOrder(index) {
        if (index) {
          this.$router.push(`/user/order?index=${index}`);
        } else {
          this.$router.push('/user/order');
        }
      },
      goSet() {
        this.$router.push('/user/setting');
      },
      showChosen() {
        this.loadingFlag = true;
        getAccount().then((data) => {
          this.loadingFlag = false;
          data.forEach((item) => {
            if (item.currency === 'CNY') {
              this.cnyAccount = item;
              this.setCnyAccount(item);
            } else if (item.currency === 'HYB') {
              this.hybAccount = item;
              this.setHybAccount(item);
            };
          });
          this.$refs.chosen.show();
        }).catch(() => {
          this.loadingFlag = false;
        });
      },
      buyVIP(payType) {
        this.loadingFlag = true;
        buyVIP(payType).then((data) => {
          if (payType === 2) {
            this.wxPay(data);
          } else {
            this.paySuc();
          }
        }).catch(() => {
          this.loadingFlag = false;
        });
      },
      weixinPay() {
        this.buyVIP(2);
      },
      yePay() {
        this.buyVIP(1);
      },
      hybPay() {
        this.buyVIP(3);
      },
      wxPay(data) {
        if (data && data.signType) {
          initPay(data, () => {
            this.paySuc();
          }, () => {
            this.loadingFlag = false;
            this.text = '支付失败';
            this.$refs.toast.show();
          }, () => {
            this.loadingFlag = false;
          });
        } else {
          this.loadingFlag = false;
          this.text = '支付失败';
          this.$refs.toast.show();
        }
      },
      paySuc() {
        this.loadingFlag = false;
        this.text = '支付成功';
        this.$refs.toast.show();
        let _user = {
          ...this.user,
          level: '2'
        };
        this.setUser(_user);
      },
      getAmount(item) {
        if (item === 'cnyAccount' && this.cnyAccount) {
          return formatAmount(this.cnyAccount.amount);
        } else if(item === 'hybAccount' && this.hybAccount) {
          return formatAmount(this.hybAccount.amount);
        } else {
          return '--';
        }
      },
      getVIPMoney() {
        getBizSystemConfig('HYF').then((data) => {
          this.text = `<div>确认支付¥${data.cvalue}成为会员吗？</div>`;
          this.$refs.confirm.show();
        });
      },
      handleUpdateNum(type) {
        if (this.orderNum) {
          if (type === 'toPayOrder') {
            let ori = this.orderNum['toPayOrder'] || 1;
            ori -= 1;
            this.orderNum['toPayOrder'] = ori;
          } else if (type === 'toMeasureOrder') {
            let ori = this.orderNum['toMeasureOrder'] || 1;
            ori -= 1;
            this.orderNum['toMeasureOrder'] = ori;
          } else if (type === 'toReceiverOrder') {
            let ori = this.orderNum['toReceiverOrder'] || 1;
            ori -= 1;
            this.orderNum['toReceiverOrder'] = ori;
            ori = this.orderNum['toCommentOrder'] || 0;
            ori += 1;
            this.orderNum['toCommentOrder'] = ori;
          } else if (type === 'toCommentOrder') {
            let ori = this.orderNum['toCommentOrder'] || 1;
            ori -= 1;
            this.orderNum['toCommentOrder'] = ori;
          }
        }
      },
      ...mapMutations({
        setCnyAccount: SET_CNY_ACCOUNT,
        setHybAccount: SET_HYB_ACCOUNT,
        setUser: SET_USER_STATE
      })
    },
    updated() {
      this._getUser();
    },
    components: {
      Scroll,
      Loading,
      Chosen,
      Toast,
      Confirm,
      Badge
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .user-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    bottom: 0.98rem;
    z-index: 2;
    background: #fff;

    .user-content{
      position: relative;
      height: 100%;
      overflow: hidden;

      .user-main-title {
        position: relative;
        height: 0.78rem;
        line-height: 0.78rem;
        text-align: center;
        font-size: $font-size-medium;

        h2 {
          font-weight: bold;
          font-size: 0.28rem;
        }

        .title {
          position: relative;
          margin: 0 auto;
          width: 2.6rem;

          &:before {
            content: '';
            position: absolute;
            top: 0.38rem;
            left: 0;
            width: 0.52rem;
            border-bottom: 1px solid $color-border;
          }

          &:after {
            content: '';
            position: absolute;
            top: 0.38rem;
            right: 0;
            width: 0.52rem;
            border-bottom: 1px solid $color-border;
          }
        }
      }

      .user-title {
        position: relative;
        height: 0.78rem;
        line-height: 0.78rem;
        padding-left: 0.24rem;
        font-size: $font-size-medium;
        @include border-bottom-1px($color-border);

        &.user-title-top {
          @include border-top-1px(#a1a1a1);
        }

        h2 {
          font-weight: bold;
          font-size: 0.28rem;
        }

        .arrow {
          position: absolute;
          right: 0;
          top: 0;
          width: 0.68rem;
          height: 100%;
          background-repeat: no-repeat;
          background-position: center;
          background-size: 0.2rem;
          @include bg-image('more');
        }
      }

      .join-member {
        height: 0.76rem;
        margin-top: 0.2rem;
        line-height: 0.76rem;
        border-radius: 0.4rem;
        text-align: center;
        font-size: 0.4rem;
        color: #fff;
        background: $second-color;
      }

      .avatar-wrapper {
        display: flex;
        align-items: center;
        height: 2.56rem;
        padding: 0 0.74rem;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        @include bg-image('avatar-bg');

        .avatar {
          width: 1.5rem;
          height: 1.5rem;
          flex: 0 0 1.5rem;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #fff;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .user-info {
          margin-left: 0.48rem;

          h1 {
            line-height: 1.1;
            font-size: $font-size-large-xx;
            color: #fff;
          }

          p {
            margin-top: 0.14rem;
            font-size: $font-size-small;
            color: #fff;
          }
        }
      }

      .order-wrapper {
        padding: 0 0.36rem;

        .order-types {
          height: 1.36rem;
          display: flex;
          align-items: center;

          .order-type {
            flex: 1;
            text-align: center;
            position: relative;

            .type {
              height: 0.64rem;
              font-size: 0;
              background-repeat: no-repeat;
              background-position: 50% 0;
              background-size: 0.4rem;

              &.order-dlt {
                @include bg-image('dlt');
              }

              &.order-dzf {
                background-position-y: 20%;
                background-size: 0.48rem;
                @include bg-image('dzf');
              }

              &.order-dsh {
                @include bg-image('dsh');
              }

              &.order-dpj {
                @include bg-image('dpj');
              }

              &.order-shz {
                @include bg-image('shz');
              }
            }

            .badge-text {
              position: absolute;
              top: -0.1rem;
              right: 50%;
              padding-left: 0.4rem;
              transform: translateX(50%);
              font-size: 0;
            }

            p {
              font-size: $font-size-small-s;
              color: #333;
            }
          }
        }
      }

      .split {
        height: 0.12rem;
        background-color: #f2f2f2;
      }

      .user-menus {
        padding: 0 0.36rem;

        .service-types {
          height: 1.36rem;
          display: flex;
          align-items: center;

          .service-type {
            flex: 1;
            text-align: center;

            .type {
              height: 0.64rem;
              font-size: 0;
              background-repeat: no-repeat;
              background-position: 50% 0;
              background-size: 0.4rem;

              &.service-zsbg {
                @include bg-image('zsbg');
              }

              &.service-zzgw {
                @include bg-image('zzgw');
              }

              &.service-kfts {
                @include bg-image('kfts');
              }

              &.service-cjwt {
                background-size: 0.48rem;
                @include bg-image('cjwt');
              }
            }
            p {
              font-size: $font-size-small-s;
              color: #333;
            }
          }
        }
      }
    }

    .chose-wrapper {
      .item {
        padding: 0.28rem 0.2rem;
        @include border-bottom-1px($color-border);
        font-size: 0.32rem;

        &:last-child {
          @include border-none();
        }
      }
    }

    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      .loading-wrapper {
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translate3d(0, -50%, 0);
      }
    }
  }
</style>
