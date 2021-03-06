<template>
  <transition name="slide">
    <div class="form-wrapper">
      <div class="form-item">
        <div class="item-label">充值金额</div>
        <div class="item-input-wrapper">
          <input type="number" class="item-input" v-model="amount" @change="_amountValid" placeholder="充值金额最多两位小数">
          <span v-show="amountErr" class="error-tip">{{amountErr}}</span>
        </div>
      </div>

      <div class="form-btn">
        <button :disabled="setting" @click="_recharge">确认充值</button>
      </div>
      <div v-show="!user || !cnyAccount || setting" class="loading-container">
        <div class="loading-wrapper">
          <loading></loading>
        </div>
      </div>
      <toast ref="toast" :text="text"></toast>
    </div>
  </transition>
</template>
<script>
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_USER_STATE, SET_CNY_ACCOUNT} from 'store/mutation-types';
  import {getUser} from 'api/user';
  import {getAccount, recharge} from 'api/account';
  import {amountValid, setTitle} from 'common/js/util';
  import {initPay} from 'common/js/weixin';
  import Toast from 'base/toast/toast';
  import Loading from 'base/loading/loading';

  export default {
    data() {
      return {
        text: '充值成功',
        setting: false,
        amount: '',
        amountErr: ''
      };
    },
    created() {
      setTitle('充值');
      this.getInitData();
    },
    computed: {
      ...mapGetters([
        'user',
        'cnyAccount'
      ])
    },
    methods: {
      getInitData() {
        Promise.all([
          this._getAccount(),
          this._getUser()
        ]).then(() => {}).catch(() => {});
      },
      weixinPay(config) {
        initPay(config, () => {
          this.setting = false;
          this.text = '充值成功';
          this.$refs.toast.show();
          this.$emit('amountUpdate');
          setTimeout(() => {
            this.$router.back();
          }, 1000);
        }, () => {
          this.setting = false;
          this.text = '充值失败';
          this.$refs.toast.show();
        }, () => {
          this.setting = false;
        });
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
      _getUser() {
        if (!this.user) {
          return getUser().then((data) => {
            this.setUser(data);
            return data;
          }).catch(() => {});
        }
        return Promise.resolve(this.user);
      },
      _recharge() {
        if (this._amountValid()) {
          this.setting = true;
          recharge({
            amount: +this.amount * 1000,
            openId: this.user.h5OpenId
          }).then((data) => {
            this.weixinPay(data);
          }).catch(() => {
            this.setting = false;
          });
        }
      },
      _amountValid() {
        let result = amountValid(this.amount);
        this.amountErr = result.msg;
        return !result.err;
      },
      ...mapMutations({
        setUser: SET_USER_STATE,
        setCnyAccount: SET_CNY_ACCOUNT
      })
    },
    components: {
      Toast,
      Loading
    }
  };
</script>
<style lang="scss" scoped rel="stylesheet/scss">
  .form-wrapper {
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
