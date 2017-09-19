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
        <div class="member-infos">
          <router-link to="/user/member/jf-flow" class="needsclick info" tag="div">
            <h3>会员积分</h3>
            <p>{{getJF()}}</p>
          </router-link>
          <div class="info">
            <h3>会员经验</h3>
            <p>{{getJY()}}</p>
          </div>
          <div class="info">
            <h3>升级需经验</h3>
            <p>{{sjjy}}</p>
          </div>
        </div>
        <div class="menus">
          <router-link class="menu border-bottom-1px border-top-1px needsclick" tag="div" to="/user/member/introduce">
            <h1>会员介绍</h1>
            <i class="arrow"></i>
          </router-link>
          <router-link class="menu border-bottom-1px needsclick" tag="div" to="/user/member/welfare">
            <h1>会员福利</h1>
            <i class="arrow"></i>
          </router-link>
        </div>
      </scroll>
      <div v-show="loadingFlag" class="loading-container">
        <div class="loading-wrapper">
          <loading title=""></loading>
        </div>
      </div>
      <router-view></router-view>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_USER_STATE, SET_JF_ACCOUNT, SET_CNY_ACCOUNT, SET_JY_ACCOUNT} from 'store/mutation-types';
  import {setTitle, isUnDefined, formatAmount} from 'common/js/util';
  import {commonMixin} from 'common/js/mixin';
  import {getUser} from 'api/user';
  import {getAccount} from 'api/account';
  import {getDictList, getPageBizSysConfig} from 'api/general';

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
          getPageBizSysConfig(1)
        ]).then(([userData, levelDict, accounts, levelJY]) => {
          levelJY = levelJY.list;
          this.loadingFlag = false;
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
              this.sjjy = Math.floor((+maxValue) - (+this.jyAccount.amount / 1000));
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
        return formatAmount(this.jfAccount.amount, 0);
      },
      getJY() {
        if (!this.jyAccount) {
          return '-';
        }
        return formatAmount(this.jyAccount.amount, 0);
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
      Loading
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
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            font-size: $font-size-large-xx;
            color: #fff;
          }

          h3 {
            margin-top: 7.5px;
            text-align: center;
            font-size: $font-size-medium;
            color: $second-color;
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
          font-size: $font-size-medium;
          @include border-bottom-1px(#d8d8d8);


          &:first-child {
            @include border-top-1px(#d8d8d8);
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
