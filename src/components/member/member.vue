<template>
  <transition name="slide">
    <div class="member-wrapper">
      <i class="icon-back" @click="back"></i>
      <scroll class="member-content">
        <div class="top-wrapper">
          <div class="content">
            <div class="avatar-wrapper">
              <img :src="(user && user.photo) | formatAvatar"/>
            </div>
            <h1>{{user && user.nickname}}</h1>
            <h3>{{getText(user && user.level)}}</h3>
          </div>
        </div>
        <div v-show="user && user.level!=='1'" class="member-infos">
          <div class="info">
            <h3>会员积分</h3>
            <p>{{getJF()}}</p>
          </div>
          <div class="info">
            <h3>会员经验</h3>
            <p>{{getJY()}}</p>
          </div>
          <div class="info">
            <h3>升级需经验</h3>
            <p>{{sjjy}}</p>
          </div>
        </div>
        <div v-show="user && user.level==='1'" class="member-infos">
          <div class="price">购买会员只需{{hyf}}元</div><button @click="showChosen">购买会员</button>
        </div>
        <div class="menus">
          <router-link class="menu" tag="div" to="/user/member/introduce">
            <h1>会员介绍</h1>
            <i class="arrow"></i>
          </router-link>
          <router-link class="menu" tag="div" to="/user/member/welfare">
            <h1>会员福利</h1>
            <i class="arrow"></i>
          </router-link>
          <router-link class="menu" tag="div" to="/user/member/flow">
            <h1>积分账单</h1>
            <i class="arrow"></i>
          </router-link>
          <router-link class="menu" tag="div" to="/user/member/jy-flow">
            <h1>经验明细</h1>
            <i class="arrow"></i>
          </router-link>
        </div>
      </scroll>
      <chosen class="chose-wrapper" ref="chosen">
        <div class="item" @click="weixinPay">
          微信支付
        </div>
        <div class="item" @click="yePay">
          余额支付（¥{{getAmount()}})
        </div>
      </chosen>
      <div v-show="loadingFlag" class="loading-container">
        <div class="loading-wrapper">
          <loading title=""></loading>
        </div>
      </div>
      <toast ref="toast" :text="text"></toast>
      <router-view></router-view>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import Toast from 'base/toast/toast';
  import Chosen from 'components/chosen/chosen';
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_USER_STATE, SET_JF_ACCOUNT, SET_CNY_ACCOUNT, SET_JY_ACCOUNT} from 'store/mutation-types';
  import {setTitle, isUnDefined, formatAmount} from 'common/js/util';
  import {commonMixin} from 'common/js/mixin';
  import {initPay} from 'common/js/weixin';
  import {getUser, buyVIP} from 'api/user';
  import {getAccount} from 'api/account';
  import {getDictList, getBizSystemConfig, getPageBizSysConfig} from 'api/general';

  const JF_CKEY = {
    '2': 'ONE',
    '3': 'TWO',
    '4': 'THREE',
    '5': 'FOUR'
  };

  export default {
    mixins: [commonMixin],
    data() {
      return {
        hyf: '',
        sjjy: '-',
        text: '',
        loadingFlag: true,
        jfAccount: null,
        jyAccount: null,
        cnyAccount: null
      };
    },
    created() {
      this.first = true;
      if (this.shouldGetData()) {
        this.getUser();
      }
    },
    computed: {
      ...mapGetters([
        'user'
      ])
    },
    methods: {
      shouldGetData() {
        if (this.$route.path === '/user/member') {
          setTitle('会员中心');
          return this.first;
        }
        return false;
      },
      getUser() {
        this.first = false;
        Promise.all([
          getUser(),
          getDictList('user_level'),
          getAccount(),
          getBizSystemConfig('HYF'),
          getPageBizSysConfig(1)
        ]).then(([userData, levelDict, accounts, hyf, levelJY]) => {
          levelJY = levelJY.list;
          this.loadingFlag = false;
          this.hyf = hyf.cvalue;
          let obj = {};
          levelDict.forEach((item) => {
            obj[item.dkey] = item.dvalue;
          });
          this.levelDict = obj;
          accounts.forEach((item) => {
            if (item.currency === 'JF') {
              this.jfAccount = item;
              this.setJFAccount(item);
            } else if (item.currency === 'JY') {
              this.jyAccount = item;
              this.setJYAccount(item);
            } else if (item.currency === 'CNY') {
              this.cnyAccount = item;
              this.setCnyAccount(item);
            }
          });
          this.levelJY = levelJY;
          if (userData.level !== '1' && userData.level !== '0') {
            if (userData.level === '5') {
              this.sjjy = '-';
            } else {
              let ckey = JF_CKEY[userData.level];
              let index = levelJY.findIndex((item) => {
                return item.ckey === ckey;
              });
              let maxValue = +levelJY[index].cvalue + 1;
              this.sjjy = Math.ceil((+maxValue) - (+this.jyAccount.amount / 1000));
            }
          }
          this.setUser(userData);
        }).catch(() => {
          this.loadingFlag = false;
        });
      },
      getText(level) {
        if (isUnDefined(level) || !this.levelDict) {
          return '';
        }
        return this.levelDict[level];
      },
      getJF() {
        if (!this.jfAccount) {
          return '-';
        }
        return (+this.jfAccount.amount / 1000).toFixed(0);
      },
      getJY() {
        if (!this.jyAccount) {
          return '-';
        }
        return (+this.jyAccount.amount / 1000).toFixed(0);
      },
      getAmount() {
        if (this.cnyAccount) {
          return formatAmount(this.cnyAccount.amount);
        } else {
          return '--';
        }
      },
      showChosen() {
        this.$refs.chosen.show();
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
        let index = this.levelJY.findIndex((item) => {
          return item.ckey === JF_CKEY['2'];
        });
        this.sjjy = this.levelJY[index].cvalue;
        let _user = {
          ...this.user,
          level: '2'
        };
        this.setUser(_user);
      },
      back() {
        this.$router.back();
      },
      ...mapMutations({
        'setUser': SET_USER_STATE,
        'setJFAccount': SET_JF_ACCOUNT,
        'setCnyAccount': SET_CNY_ACCOUNT,
        'setJYAccount': SET_JY_ACCOUNT
      })
    },
    updated() {
      if (this.shouldGetData()) {
        this.getUser();
      }
    },
    components: {
      Scroll,
      Loading,
      Toast,
      Chosen
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .member-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;

    .icon-back {
      position: absolute;
      top: 0;
      left: 0;
      height: 50px;
      width: 50px;
      z-index: 1;
      background-position: center;
      background-size: 12px;
      background-repeat: no-repeat;
      @include bg-image('back');
    }

    .member-content {
      position: relative;
      height: 100%;

      .top-wrapper {
        position: relative;
        height: 0;
        padding-top: 67%;

        .content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          @include bg-image('bb');

          .avatar-wrapper {
            margin: 70px auto 0;
            width: 88px;
            height: 88px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #fff;

            img {
              width: 100%;
              height: 100%;
            }
          }

          h1 {
            margin-top: 17px;
            text-align: center;
            font-size: $font-size-large-xx;
            color: #fff;
          }

          h3 {
            margin-top: 7.5px;
            text-align: center;
            font-size: $font-size-medium;
            color: #a89300;
          }
        }
      }

      .member-infos {
        display: flex;
        align-items: center;
        height: 83px;
        padding: 0 42.5px;

        .info {
          flex: 1;
          text-align: center;

          h3 {
            font-size: $font-size-small;
            color: #b3b3b3;
          }

          p {
            margin-top: 11px;
            font-size: $font-size-large;
          }
        }

        .price {
          font-size: $font-size-medium;
        }

        button {
          display: block;
          margin-left: 40px;
          width: 100px;
          height: 30px;
          line-height: 30px;
          border: 1px solid #d2d2d2;
          border-radius: 14px;
          font-size: $font-size-medium;
          color: #062745;
          background-color: #fff;
        }
      }

      .menus {
        padding: 0 18px;

        .menu {
          position: relative;
          height: 59px;
          line-height: 59px;
          padding-left: 10px;
          border-bottom: 1px solid #a1a1a1;
          font-size: $font-size-medium;

          &:first-child {
            border-top: 1px solid #a1a1a1;
          }

          .arrow {
            position: absolute;
            right: 0;
            top: 0;
            width: 34px;
            height: 100%;
            background-repeat: no-repeat;
            background-position: center;
            background-size: 10px;
            @include bg-image('more');
          }
        }
      }
    }

    .chose-wrapper {
      .item {
        padding: 14px 10px;
        border-bottom: 1px solid #a1a1a1;

        &:last-child {
          border-bottom: none;
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
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
