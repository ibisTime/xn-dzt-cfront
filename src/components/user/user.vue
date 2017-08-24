<template>
  <div class="user-wrapper">
    <scroll class="user-content">
      <div>
        <div @click="goSet" class="avatar-wrapper" ref="bgImage">
          <div class="avatar">
            <img :src="(user && user.photo) | formatImg"/>
          </div>
          <div class="user-info">
            <h1>{{user && user.nickname}}</h1>
            <p>
              <span class="rectangle" v-show="user && user.level!=='0'">VIP{{user && user.level}}</span>
              <span>{{getText(user && user.level)}}</span>
            </p>
          </div>
        </div>
        <div class="order-wrapper">
          <div class="user-title" @click="goOrder('', $event)">
            <h2>我的订单</h2>
            <i class="arrow"></i>
          </div>
          <div class="order-types">
            <div class="order-type" @click="goOrder(1)">
              <div class="type order-dlt"></div>
              <p>带量体</p>
            </div>
            <div class="order-type" @click="goOrder(2)">
              <div class="type order-dzf"></div>
              <p>待支付</p>
            </div>
            <div class="order-type" @click="goOrder(7)">
              <div class="type order-dsh"></div>
              <p>待收货</p>
            </div>
            <div class="order-type" @click="goOrder(8)">
              <div class="type order-dpj"></div>
              <p>待评价</p>
            </div>
            <div class="order-type" @click="goOrder(9)">
              <div class="type order-shz"></div>
              <p>售后中</p>
            </div>
          </div>
        </div>
        <div class="split"></div>
        <div class="user-menus">
          <div class="user-title">
            <h2>私人服务</h2>
          </div>
          <div class="service-types">
            <div class="service-type">
              <div class="type service-zsbg"></div>
              <p>专属报告</p>
            </div>
            <div class="service-type" @click="goAdviser">
              <div class="type service-zzgw"></div>
              <p>着装顾问</p>
            </div>
            <div class="service-type" @click="goService">
              <div class="type service-kfts"></div>
              <p>客服投诉</p>
            </div>
            <div class="service-type" @click="goQuestion">
              <div class="type service-cjwt"></div>
              <p>常见问题</p>
            </div>
          </div>
          <div class="user-title" @click="goMember">
            <h2>会员中心</h2>
            <i class="arrow"></i>
          </div>
          <div class="user-title" @click="goAccount">
            <h2>我的账户</h2>
            <i class="arrow"></i>
          </div>
          <div class="user-title" @click="goRecommend">
            <h2>我的推荐</h2>
            <i class="arrow"></i>
          </div>
          <div class="user-title" @click="goCollection">
            <h2>我的收藏</h2>
            <i class="arrow"></i>
          </div>
        </div>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>
<script>
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_USER_STATE} from 'store/mutation-types';
  import {getUser} from 'api/user';
  import {getDictList} from 'api/general';
  import {setTitle, isUnDefined} from 'common/js/util';
  import {commonMixin} from 'common/js/mixin';
  import Scroll from 'base/scroll/scroll';

  export default {
    mixins: [commonMixin],
    created() {
      this.first = true;
      this.levelDict = {};
      this._getUser();
    },
    computed: {
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
            let obj = {};
            levelDict.forEach((item) => {
              obj[item.dkey] = item.dvalue;
            });
            this.levelDict = obj;
            this.setUser(userData);
          }).catch(() => {});
        }
      },
      shouldGetData() {
        if (this.$route.path === '/user') {
          setTitle('我的');
          return this.first;
        }
        return false;
      },
      getText(level) {
        if (isUnDefined(level)) {
          return '';
        }
        if (level === '0') {
          return '普通会员';
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
      goAccount() {
        this.$router.push('/user/account');
      },
      goAdviser() {
        this.$router.push('/user/adviser');
      },
      goService() {
        this.$router.push('/user/service');
      },
      goQuestion() {
        this.$router.push('/user/question');
      },
      goCollection() {
        this.$router.push('/user/collection');
      },
      goMember() {
        this.$router.push('/user/member');
      },
      goRecommend() {
        this.$router.push(`/user/recommend?userReferee=${this.user.userId}`);
      },
      ...mapMutations({
        setUser: SET_USER_STATE
      })
    },
    updated() {
      this._getUser();
    },
    components: {
      Scroll
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
    bottom: 49px;
    background: #fff;

    .user-content{
      position: relative;
      height: 100%;
      overflow: hidden;

      .user-title {
        position: relative;
        height: 39px;
        line-height: 39px;
        padding-left: 12px;
        border-bottom: 1px solid #a1a1a1;
        font-size: $font-size-medium;

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

      .avatar-wrapper {
        display: flex;
        align-items: center;
        height: 128px;
        padding: 0 37px;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        @include bg-image('avatar-bg');

        .avatar {
          width: 75px;
          height: 75px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #fff;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .user-info {
          margin-left: 24px;

          h1 {
            font-size: $font-size-large-xx;
            color: #fff;
          }

          p {
            margin-top: 7px;
            font-size: $font-size-small;
            color: #a89300;

            .rectangle {
              display: inline-block;
              padding: 2px 4px;
              border-radius: 4px;
              background: #a89300;
              color: #fff;
            }
          }
        }
      }

      .order-wrapper {
        padding: 0 18px;

        .order-types {
          height: 68px;
          display: flex;
          align-items: center;

          .order-type {
            flex: 1;
            text-align: center;

            .type {
              height: 32px;
              font-size: 0;
              background-repeat: no-repeat;
              background-position: 50% 0;
              background-size: 20px;

              &.order-dlt {
                @include bg-image('dlt');
              }

              &.order-dzf {
                background-position-y: 20%;
                background-size: 24px;
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

            p {
              font-size: $font-size-small-s;
              color: #333;
            }
          }
        }
      }

      .split {
        height: 6px;
        background-color: #f2f2f2;
      }

      .user-menus {
        padding: 0 18px;

        .service-types {
          height: 68px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #a1a1a1;

          .service-type {
            flex: 1;
            text-align: center;

            .type {
              height: 32px;
              font-size: 0;
              background-repeat: no-repeat;
              background-position: 50% 0;
              background-size: 20px;

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
                background-size: 24px;
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
  }
</style>
