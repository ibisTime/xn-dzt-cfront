<template>
  <transition name="slide">
    <div class="form-wrapper">
      <div class="form-item">
        <div class="item-label">银行卡</div>
        <div class="item-input-wrapper">
          <select v-if="bankcardList" class="item-input" v-model="payCardNo">
            <option v-for="bankcard in bankcardList" :key="bankcard.code" :value="bankcard">
              {{bankcard.bankcardNumber}}
            </option>
          </select>
          <i class="arrow"></i>
        </div>
      </div>
      <div class="form-item">
        <div class="item-label">可用金额</div>
        <div class="item-input-wrapper">
          <input type="number" disabled class="item-input" :value="_formatAmount()">
        </div>
      </div>
      <div class="form-item">
        <div class="item-label">提现金额</div>
        <div class="item-input-wrapper">
          <input type="number" class="item-input" v-model="amount" @change="_amountValid" placeholder="提现金额最多两位小数">
          <span v-show="amountErr" class="error-tip">{{amountErr}}</span>
        </div>
      </div>
      <div class="form-item">
        <div class="item-label">支付密码</div>
        <div class="item-input-wrapper">
          <input type="password" class="item-input" v-model="tradePwd" @change="_tradePwdValid" placeholder="请输入支付密码">
          <span v-show="tradeErr" class="error-tip">{{tradeErr}}</span>
        </div>
      </div>

      <div class="form-btn">
        <button :disabled="setting" @click="_withdraw">提现</button>
      </div>
      <div v-show="!bankcardList || !cnyAccount" class="loading-container">
        <div class="loading-wrapper">
          <loading></loading>
        </div>
      </div>
      <confirm ref="confirm" :isAlert="isAlert" text="未设置银行卡" @confirm="goAddBankCard"></confirm>
      <toast ref="toast" text="提现成功"></toast>
      <router-view></router-view>
    </div>
  </transition>
</template>
<script>
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_BANKCARD_LIST, SET_CNY_ACCOUNT} from 'store/mutation-types';
  import {getAccount, withdraw, getBankCardList} from 'api/account';
  import {amountValid, tradeValid, formatAmount, setTitle} from 'common/js/util';
  import Toast from 'base/toast/toast';
  import Loading from 'base/loading/loading';
  import Confirm from 'base/confirm/confirm';

  export default {
    data() {
      return {
        payCardNo: '',
        amount: '',
        amountErr: '',
        tradePwd: '',
        tradeErr: '',
        setting: false
      };
    },
    created() {
      this.isAlert = true;
      if (this.shouldGetData()) {
        this.getInitData();
      }
    },
    computed: {
      ...mapGetters([
        'cnyAccount',
        'bankcardList'
      ])
    },
    updated() {
      if (this.shouldGetData()) {
        this.getInitData();
      }
    },
    methods: {
      shouldGetData() {
        if (this.$route.path === '/user/account/withdraw') {
          setTitle('提现');
          return !this.cnyAccount || !this.bankcardList || !this.bankcardList.length;
        }
      },
      getInitData() {
        Promise.all([
          this._getAccount(),
          this._getBankCardList()
        ]).then(([account, cardList]) => {
          if (!cardList.length) {
            this.$refs.confirm.show();
          }
        }).catch(() => {});
      },
      _getAccount() {
        if (!this.cnyAccount) {
          return getAccount().then((data) => {
            let index = data.findIndex((item) => {
              return item.currency === 'CNY';
            });
            this.setCnyAccount(data[index]);
            return data[index];
          });
        }
        return Promise.resolve(this.cnyAccount);
      },
      _getBankCardList() {
        if (!this.bankcardList) {
          return getBankCardList().then((data) => {
            this.setBankCardList(data);
            return data;
          });
        } else {
          this.payCardNo = this.bankcardList[0];
          return Promise.resolve(this.bankcardList);
        }
      },
      _formatAmount() {
        let _amount = this.cnyAccount && this.cnyAccount.amount || 0;
        return formatAmount(_amount);
      },
      goAddBankCard() {
        this.$router.push('/user/account/withdraw/add');
      },
      _withdraw() {
        if (this.valid()) {
          this.setting = true;
          withdraw({
            payCardNo: this.payCardNo.bankcardNumber,
            payCardInfo: this.payCardNo.bankCode,
            amount: +this.amount * 1000,
            tradePwd: this.tradePwd,
            accountNumber: this.cnyAccount.accountNumber
          }).then(() => {
            this.$refs.toast.show();
            this.setCnyAccount(null);
            setTimeout(() => {
              this.$router.back();
            }, 1000);
          }).catch(() => {
            this.setting = false;
          });
        }
      },
      valid() {
        let r1 = this._payCardNoValid();
        let r2 = this._amountValid();
        let r3 = this._tradePwdValid();
        return r1 && r2 && r3;
      },
      _payCardNoValid() {
        if (!this.bankcardList || !this.bankcardList.length) {
          this.$refs.confirm.show();
          return false;
        } else if (this.payCardNo) {
          return true;
        }
        return false;
      },
      _amountValid() {
        let result = amountValid(this.amount);
        this.amountErr = result.msg;
        if (!result.err) {
          let enable = +this.cnyAccount.amount;
          let wAmount = +this.amount * 1000;
          if (wAmount > enable) {
            this.amountErr = '不能大于可用金额';
            return false;
          }
          return true;
        } else {
          return false;
        }
      },
      _tradePwdValid() {
        let result = tradeValid(this.tradePwd);
        this.tradeErr = result.msg;
        return !result.err;
      },
      ...mapMutations({
        setBankCardList: SET_BANKCARD_LIST,
        setCnyAccount: SET_CNY_ACCOUNT
      })
    },
    watch: {
      bankcardList(newList) {
        this.payCardNo = newList[0];
      }
    },
    components: {
      Toast,
      Loading,
      Confirm
    }
  };
</script>
<style lang="scss" scoped rel="stylesheet/scss">
  @import "~common/scss/mixin";

  .form-wrapper {
    .arrow {
      position: absolute;
      right: 12px;
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      @include bg-image('arrow');
      width: 15px;
      height: 15px;
      top: 50%;
      transform: translate(0, -50%);
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
