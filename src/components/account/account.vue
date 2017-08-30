<template>
  <transition name="slide">
    <div class="account-wrapper">
      <scroll class="account-content">
        <div>
          <div class="top-wrapper">
            <h1>账户余额</h1>
            <p>¥<span>{{_formatAmount(account && account.amount || 0)}}</span></p>
            <router-link to="/user/account/flow" tag="div">点击查看明细</router-link>
          </div>
          <div class="cates">
            <div class="cate-item">
              <h1>消费金额</h1>
              <p>¥<span>{{_formatAmount(accountInfo && accountInfo.outAmount || 0)}}</span></p>
            </div>
            <div class="cate-item">
              <h1>充值金额</h1>
              <p>¥<span>{{_formatAmount(accountInfo && accountInfo.rechargeAmount || 0)}}</span></p>
            </div>
            <div class="cate-item">
              <h1>已提现金额</h1>
              <p>¥<span>{{_formatAmount(accountInfo && accountInfo.withdrawAmount || 0)}}</span></p>
            </div>
          </div>
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
  import {SET_CNY_ACCOUNT, SET_USER_STATE} from 'store/mutation-types';
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
        loadingFlag: false
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
          let index = data.findIndex((item) => {
            return item.currency === 'CNY';
          });
          this._getAccountInfo(data[index].accountNumber);
          this.setCnyAccount(data[index]);
          this.account = data[index];
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
        });
      },
      amountUpdate() {
        if (this.cnyAccount && this.account) {
          this.loadingFlag = true;
          Promise.all([
            getAccount(),
            this._getAccountInfo(this.cnyAccount.accountNumber)
          ]).then(([data]) => {
            let index = data.findIndex((item) => {
              return item.currency === 'CNY';
            });
            this.setCnyAccount(data[index]);
            this.account = data[index];
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
        setUser: SET_USER_STATE
      })
    },
    computed: {
      ...mapGetters([
        'cnyAccount',
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
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
