<template>
  <transition name="slide">
    <div class="pay-wrapper">
      <div class="title">支付方式</div>
      <div class="pay-types">
        <div class="pay-item" @click="choseType(0)">
          <i class="icon icon-wx"></i>
          <div>微信支付</div>
          <i class="icon-chose" :class="{act:currentIndex===0}"></i>
        </div>
        <div class="pay-item" @click="choseType(1)">
          <i class="icon icon-cny"></i>
          <div>余额支付 (余额：¥<label>{{(cnyAccount && cnyAccount.amount) | formatAmount}}</label>)</div>
          <i class="icon-chose" :class="{act:currentIndex===1}"></i>
        </div>
        <div class="pay-item" @click="choseType(2)">
          <i class="icon icon-hy"></i>
          <div>合衣币支付 (余额：<label>{{(hybAccount && hybAccount.amount) | formatAmount}}</label>)</div>
          <i class="icon-chose" :class="{act:currentIndex===2}"></i>
        </div>
      </div>
      <div class="split"></div>
      <div class="foot">
        <div class="amount-wrap">
          <span>金额</span><span class="amount">¥{{(order && order.amount) | formatAmount}}</span>
        </div>
        <button @click="confirm">立即支付</button>
      </div>
      <div v-show="loadingFlag" class="loading-container">
        <div class="loading-wrapper">
          <loading title=""></loading>
        </div>
      </div>
      <toast ref="toast" :text="text"></toast>
      <confirm ref="confirm" :text="text" :isAlert="!isAlert" :isHtml="isHtml" @confirm="payOrder()" confirmBtnText="确认"></confirm>
    </div>


  </transition>
</template>
<script>
  import {payOrder, getOrder} from 'api/biz';
  import {getAccount} from 'api/account';
  import Loading from 'base/loading/loading';
  import Toast from 'base/toast/toast';
  import Confirm from 'base/confirm/confirm';
  import {mapGetters, mapMutations, mapActions} from 'vuex';
  import {SET_CNY_ACCOUNT, SET_HYB_ACCOUNT} from 'store/mutation-types';
  import {commonMixin} from 'common/js/mixin';
  import {initPay} from 'common/js/weixin';

  const HYBPAY = '3';  // 合衣币支付
  const WXPAY = '2';  // 微信支付
  const YEPAY = '1';  // 余额支付

  export default {
    mixins: [commonMixin],
    data() {
      return {
        loadingFlag: true,
        currentIndex: 0,
        order: null,
        text: '',
        isAlert: true,
        isHtml: true
      };
    },
    created() {
      Promise.all([
        this.getAccount(),
        this.getOrder()
      ]).finally(() => {
        this.loadingFlag = false;
      });
    },
    computed: {
      ...mapGetters([
        'cnyAccount',
        'hybAccount'
      ])
    },
    methods: {
      getOrder() {
        return getOrder(this.$route.query.code).then((data) => {
          this.order = data;
          return data;
        });
      },
      getAccount() {
        if (!this.cnyAccount) {
          return getAccount().then((data) => {
            let index0 = data.findIndex((item) => {
              return item.currency === 'CNY';
            });
            let index1 = data.findIndex((item) => {
              return item.currency === 'HYB';
            });
            this.setCnyAccount(data[index0]);
            this.setHybAccount(data[index1]);
            return Promise.resolve(data[index0], data[index1]);
          });
        }
        return Promise.resolve(this.cnyAccount, this.hybAccount);
      },
      choseType(type) {
        this.currentIndex = type;
      },
      confirm() {
        this.text = '确定要支付订单吗';
        this.$refs.confirm.show();
      },
      payOrder() {
        this.loadingFlag = true;
        let code = this.$route.query.code;
        if (this.currentIndex === 0) {
          payOrder(code, WXPAY).then((data) => {
            this.wxPay(data, code);
          }).catch(() => {
            this.loadingFlag = false;
          });
        } else {
          payOrder(code, this.currentIndex === 1 ? YEPAY : HYBPAY).then(() => {
            this.loadingFlag = false;
            this.text = '支付成功';
            this.$refs.toast.show();
            this.editOrderListByPay({code});
            this.$emit('updateNum', 'toPayOrder');
            setTimeout(() => {
              this.$router.back();
            }, 1000);
          }).catch(() => {
            this.loadingFlag = false;
          });
        }
      },

      wxPay(data, code) {
        if (data && data.signType) {
          initPay(data, () => {
            this.loadingFlag = false;
            this.text = '支付成功';
            this.$refs.toast.show();
            this.editOrderListByPay({code});
            this.$emit('updateNum', 'toPayOrder');
            setTimeout(() => {
              this.$router.back();
            }, 1000);
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
      ...mapMutations({
        'setCnyAccount': SET_CNY_ACCOUNT,
        'setHybAccount': SET_HYB_ACCOUNT
      }),
      ...mapActions([
        'editOrderListByPay'
      ])
    },
    components: {
      Loading,
      Toast,
      Confirm
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .pay-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0 0.36rem;
    z-index: 102;
    background: #fff;

    .title {
      padding: 0.24rem 0;
      border-bottom: 1px solid #a1a1a1;
      font-size: $font-size-medium-x;
      color: #062745;
    }

    .pay-types {
      .pay-item {
        display: flex;
        align-items: center;
        padding: 0.12rem;

        .icon {
          display: inline-block;
          width: 0.64rem;
          height: 0.64rem;
          background-size: 0.64rem 0.64rem;

          &.icon-wx {
            @include bg-image('weixin');
          }

          &.icon-cny {
            @include bg-image('cny');
          }

          &.icon-hy {
            @include bg-image('hyb');
          }
        }

        .icon-chose {
          display: inline-block;
          width: 0.44rem;
          height: 0.44rem;
          background-size: 0.44rem 0.44rem;
          @include bg-image('un-select');

          &.act {
            @include bg-image('selected');
          }
        }

        div {
          padding-left: 0.2rem;
          flex: 1;
          font-size: 0.32rem;
        }
      }
    }

    .split {
      position: absolute;
      bottom: 0.9rem;
      left: 0;
      width: 100%;
      height: 0.2rem;
      background: #f5f5f5;
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

    .foot {
      display: flex;
      align-items: center;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 0.9rem;
      padding: 0 0 0 0.36rem;
      font-size: $font-size-medium-x;

      .amount-wrap {
        flex: 1;

        .amount {
          padding-left: 0.2rem;
          font-size: $font-size-large;
          color: $primary-color;
        }
      }

      button {
        height: 0.9rem;
        line-height: 0.9rem;
        padding: 0 0.6rem;
        font-size: $font-size-medium-x;
        color: #fff;
        background: $primary-color;
      }
    }
  }

  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
