<template>
  <transition name="slide">
    <div class="account-wrappers">
      <scroll class="scroll-content">
        <div>
          <section class="account-item">
            <router-link to="/user/account/hyb-flow" tag="div" class="title hyb-title needsclick">
              <label>合衣币账户</label>
              <span>{{hybAmount}}</span>
            </router-link>
            <div class="main">
              <div class="item">
                <h2>历史充值总额</h2>
                <p>{{hybInTotalAmount}}</p>
              </div>
              <div class="item">
                <h2>已消费金额</h2>
                <p>{{hybOutTotalAmount}}</p>
              </div>
              <div class="item">
                <h2>最近一笔消费</h2>
                <p>{{hybZjConsume}}</p>
              </div>
            </div>
          </section>
          <section class="account-item">
            <router-link to="/user/account/cny-flow" tag="div" class="title cny-title needsclick">
              <label>人民币账户</label>
              <span>¥ {{cnyAmount}}</span>
            </router-link>
            <div class="main">
              <div class="item">
                <h2>已消费金额</h2>
                <p>¥{{cnyOutTotalAmount}}</p>
              </div>
              <div class="item">
                <h2>已提现金额</h2>
                <p>¥{{cnyTxTotalAmount}}</p>
              </div>
              <div class="item">
                <h2>最近一笔提现</h2>
                <p>¥{{cnyZjCash}}</p>
              </div>
            </div>
          </section>
          <section class="account-item">
            <router-link to="/user/account/jf-flow" tag="div" class="title jf-title needsclick">
              <label>积分账户</label>
              <span>{{jfAmount}}</span>
            </router-link>
            <div class="main jf-main">
              <router-link to="/user/account/jf-rules" tag="div" class="jf-item needsclick">积分规则</router-link>
              <router-link to="/user/account/jf-flow" tag="div" class="jf-item needsclick">积分账单</router-link>
              <router-link to="/user/account/jf-exchange" tag="div" class="jf-item needsclick">积分兑换</router-link>
            </div>
          </section>
        </div>
      </scroll>
      <div class="acc-btns">
        <button @click="goRecharge">充值</button>
        <button @click="goWithdraw">提现</button>
      </div>
      <div v-show="!account || !user || !accountInfo || loadingFlag" class="loading-container">
        <div class="loading-wrapper">
          <loading></loading>
        </div>
      </div>
      <confirm ref="confirm" text="未设置支付密码" :isAlert="isAlert" @confirm="goTrade"></confirm>
      <router-view @amountUpdate="amountUpdate"></router-view>
    </div>
  </transition>
</template>
<script>
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_CNY_ACCOUNT, SET_USER_STATE, SET_JF_ACCOUNT, SET_HYB_ACCOUNT} from 'store/mutation-types';
  import {getUser} from 'api/user';
  import {getAccount, getAccountInfo} from 'api/account';
  import {formatAmount, setTitle} from 'common/js/util';
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import Confirm from 'base/confirm/confirm';

  export default {
    data() {
      return {
        account: null,
        accountInfo: null,
        loadingFlag: false,
        cnyAmount: '',
        hybAmount: '',
        jfAmount: '',
        hybInTotalAmount: '',
        hybOutTotalAmount: '',
        hybZjConsume: '',
        cnyOutTotalAmount: '',
        cnyTxTotalAmount: '',
        cnyZjCash: ''
      };
    },
    created() {
      this.isAlert = true;
      if (this.shouldGetData()) {
        this._getAccountAndUser();
      }
    },
    updated() {
      if (this.shouldGetData()) {
        this._getAccountAndUser();
      }
    },
    methods: {
      shouldGetData() {
        if (this.$route.path === '/user/account') {
          setTitle('我的账户');
          return !this.account;
        }
        return false;
      },
      _getAccountAndUser() {
        Promise.all([
          this._getAccount(),
          this._getUser()
        ]).catch(() => {});
      },
      _getAccount() {
        if (this.cnyAccount && this.account) {
          return this._getAccountInfo(this.cnyAccount.accountNumber);
        }
        return getAccount().then((data) => {
          data.forEach((item) => {
            if (item.currency === 'CNY') {
              this._getAccountInfo(item.accountNumber);
              this.setCnyAccount(item);
              this.account = item;
              this.cnyAmount = formatAmount(item.amount);
            } else if (item.currency === 'JF') {
              this.setJfAccount(item);
              this.jfAmount = formatAmount(item.amount, 0);
            } else if (item.currency === 'HYB') {
              this._getHYBAccountInfo(item.accountNumber);
              this.setHybAccount(item);
              this.hybAmount = formatAmount(item.amount);
            }
          });
        });
      },
      _getUser() {
        if (!this.user) {
          return getUser().then((data) => {
            this.setUser(data);
            return data;
          });
        }
        return Promise.resolve(this.user);
      },
      _getAccountInfo(accountNumber) {
        return getAccountInfo(accountNumber).then((data) => {
          this.accountInfo = data;
          this.cnyOutTotalAmount = formatAmount(data.outTotalAmount);
          this.cnyTxTotalAmount = formatAmount(data.txTotalAmount);
          this.cnyZjCash = formatAmount(data.zjCash);
        });
      },
      _getHYBAccountInfo(accountNumber) {
        return getAccountInfo(accountNumber).then((data) => {
          this.accountInfo = data;
          this.hybInTotalAmount = formatAmount(data.inTotalAmount);
          this.hybOutTotalAmount = formatAmount(data.outTotalAmount);
          this.hybZjConsume = formatAmount(data.zjConsume);
        });
      },
      amountUpdate() {
        if (this.cnyAccount && this.hybAccount && this.account) {
          this.loadingFlag = true;
          Promise.all([
            getAccount(),
            this._getAccountInfo(this.cnyAccount.accountNumber),
            this._getHYBAccountInfo(this.hybAccount.accountNumber)
          ]).then(([data]) => {
            data.forEach((item) => {
              if (item.currency === 'CNY') {
                this.setCnyAccount(item);
                this.account = item;
                this.cnyAmount = formatAmount(item.amount);
              } else if (item.currency === 'JF') {
                this.setJfAccount(item);
              } else if (item.currency === 'HYB') {
                this.setHybAccount(item);
              }
            });
            this.loadingFlag = false;
          }).catch(() => {
            this.loadingFlag = false;
          });
        }
      },
      _formatAmount(amount) {
        return formatAmount(amount);
      },
      goRecharge() {
        this.$router.push('/user/account/recharge');
      },
      goWithdraw() {
        if (!this.user.tradepwdFlag) {
          this.$refs.confirm.show();
        } else {
          this.$router.push('/user/account/withdraw');
        }
      },
      goTrade() {
        this.$router.push('/user/account/set-tradepwd');
      },
      ...mapMutations({
        setCnyAccount: SET_CNY_ACCOUNT,
        setJfAccount: SET_JF_ACCOUNT,
        setHybAccount: SET_HYB_ACCOUNT,
        setUser: SET_USER_STATE
      })
    },
    computed: {
      ...mapGetters([
        'cnyAccount',
        'hybAccount',
        'user'
      ])
    },
    components: {
      Scroll,
      Confirm,
      Loading
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .account-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0 19px;
    background: #fff;
    z-index: 101;

    .account-content {
      position: absolute;
      top: 0;
      left: 19px;
      right: 19px;
      bottom: 64px;
      overflow: hidden;

      .top-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 195px;
        height: 195px;
        margin: 30px auto;
        border-radius: 50%;
        text-align: center;
        background: $primary-color;

        h1 {
          font-size: $font-size-large;
          color: #fff;
        }

        p {
          padding: 18px 0;
          font-size: 36px;
          color: #a89300;

          span {
            padding-left: 6px;
          }
        }

        div {
          padding-top: 2.5px;
          font-size: $font-size-medium;
          color: #adadad;
        }
      }

      .cates {
        border-top: 1px solid #a1a1a1;
        font-size: $font-size-medium;

        .cate-item {
          height: 58px;
          line-height: 58px;
          padding: 0 41px;
          border-bottom: 1px solid #a1a1a1;

          h1 {
            float: left;
          }

          p {
            float: right;

            span {
              padding-left: 4px;
            }
          }
        }
      }
    }

    .acc-btns {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 12px 18px;
      display: flex;
      align-items: center;

      button {
        height: 40px;
        line-height: 40px;
        flex: 1;
        border-radius: 8px;
        font-size: $font-size-medium;
        color: #fff;
        background: $primary-color;

        &:nth-child(1) {
          margin-right: 10px;
        }

        &:nth-child(2) {
          margin-left: 10px;
        }
      }
    }

    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);

      .loading-wrapper {
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translate3d(0, -50%, 0);
      }
    }
  }

  .account-wrappers {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0 19px;
    background: #fff;
    z-index: 101;

    .scroll-content {
      position: absolute;
      top: 4px;
      left: 18px;
      right: 18px;
      bottom: 64px;
      overflow: hidden;

      .account-item {
        padding-top: 24px;

        .title {
          height: 58px;
          line-height: 58px;
          border-radius: 30px;
          padding: 0 41px;

          label {
            font-weight: bold;
            font-size: $font-size-medium;
          }

          span {
            font-size: $font-size-large-xx;
            float: right;
          }

          &.hyb-title {
            background: $primary-color;

            label, span {
              color: #fff;
            }
          }

          &.cny-title {
            background: $second-color;

            label, span {
              color: #000;
            }
          }

          &.jf-title {
            background: #4d4d4d;

            label, span {
              color: #fff;
            }
          }
        }

        .main {
          display: flex;
          justify-content: space-between;
          padding: 18px 46px 0;

          .item {
            text-align: center;
            h2 {
              padding-bottom: 13px;
              font-size: 10.5px;
            }

            p {
              font-size: $font-size-medium;
            }
          }

          &.jf-main {
            padding: 18px 17px;

            .jf-item {
              border: 1px solid #797979;
              border-radius: 20px;
              padding: 10px 20px;
              text-align: center;
              font-size: 10.5px;
            }
          }
        }
      }
    }

    .acc-btns {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 12px 18px;
      display: flex;
      align-items: center;

      button {
        height: 40px;
        line-height: 40px;
        flex: 1;
        border-radius: 8px;
        font-size: $font-size-medium;
        color: #fff;
        background: $primary-color;

        &:nth-child(1) {
          margin-right: 10px;
        }

        &:nth-child(2) {
          margin-left: 10px;
        }
      }
    }

    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);

      .loading-wrapper {
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translate3d(0, -50%, 0);
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
