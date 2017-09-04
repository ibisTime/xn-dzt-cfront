<template>
  <transition name="slide">
    <div class="report-wrapper">
      <scroll :data="report" class="scroll-content">
        <div>
          <div class="top">
            <div class="avatar">
              <img :src="formatImg()">
            </div>
            <h2>{{user && user.nickname || ''}}</h2>
            <p>专属量体形象报告</p>
          </div>
          <div class="info">
            <div class="title">量体信息</div>
            <div class="content">
              <div v-show="ltReport.length" class="detail clearfix">
                <div v-for="item in ltReport" class="item">
                  <label>{{item.cvalue}}</label>
                  <div class="text">{{item.dkey}}</div>
                </div>
              </div>
              <no-result v-show="!loadingFlag && !ltReport.length" title="抱歉，暂无量体数据"></no-result>
              <loading v-show="loadingFlag" title=""></loading>
            </div>
            <div class="title">形体信息</div>
            <div class="content">
              <div v-show="xtReport.length" class="detail clearfix">
                <div v-for="item in xtReport" class="item">
                  <label>{{item.cvalue}}</label>
                  <div class="text">{{item.dvalue}}</div>
                </div>
              </div>
              <no-result v-show="!loadingFlag && !xtReport.length" title="抱歉，暂无形体数据"></no-result>
              <loading v-show="loadingFlag" title=""></loading>
            </div>
          </div>
        </div>
      </scroll>
    </div>
  </transition>
</template>
<script>
  import {getOwnerReport} from 'api/biz';
  import {getUser} from 'api/user';
  import {setTitle, formatAvatar} from 'common/js/util';
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_USER_STATE} from 'store/mutation-types';
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import NoResult from 'base/no-result/no-result';

  export default {
    data() {
      return {
        ltReport: [],
        xtReport: [],
        report: [],
        loadingFlag: true
      };
    },
    created() {
      setTitle('专属报告');
      Promise.all([
        this.getReport(),
        this.getUser()
      ]).then(() => {
        this.loadingFlag = false;
      });
    },
    computed: {
      ...mapGetters([
        'user'
      ])
    },
    methods: {
      getReport() {
        return getOwnerReport().then((data) => {
          data.forEach((item) => {
            let ckey = item.ckey.split('-')[0];
            if (ckey === '4') {
              this.xtReport.push(item);
            } else {
              if (item.ckey === '6-02') {
                item.cvalue = item.cvalue + '(cm)';
              } else if (item.ckey === '6-03') {
                item.cvalue = item.cvalue + '(kg)';
              }
              this.ltReport.push(item);
            }
          });
          this.report = data;
        });
      },
      getUser() {
        if (this.user) {
          return Promise.resolve(this.user);
        }
        return getUser().then((data) => {
          this.setUser(data);
          return data;
        });
      },
      formatImg() {
        return formatAvatar(this.user && this.user.photo || '');
      },
      ...mapMutations({
        setUser: SET_USER_STATE
      })
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .report-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    &.slide-enter-active, &.slide-leave-active {
      transition: all 0.3s;
    }

    &.slide-enter, &.slide-leave-to {
      transform: translate3d(100%, 0, 0);
    }

    .scroll-content {
      position: relative;
      height: 100%;

      .top {
        height: 178px;
        padding-top: 23px;
        background-repeat: no-repeat;
        background-size: cover;
        @include bg-image('bg');

        .avatar {
          width: 75px;
          height: 75px;
          margin: 0 auto;
          border-radius: 50%;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
          }
        }

        h2 {
          margin-top: 14px;
          text-align: center;
          font-size: $font-size-large-xx;
          color: #fff;
        }

        p {
          margin-top: 8px;
          text-align: center;
          font-size: $font-size-small;
          color: #a99400;
        }
      }

      .info {
        .title {
          padding-left: 34px;
          line-height: 50px;
          border-bottom: 1px solid #a1a1a1;
          font-size: $font-size-medium;
          color: $primary-color;
        }

        .content {
          padding: 18px 30px;

          .detail {
            .item {
              display: flex;
              float: left;
              margin-bottom: 7.5px;
              padding-right: 7.5px;
              width: 50%;
              line-height: 1.5;
              font-size: $font-size-small;

              label {
                display: inline-block;
                padding-right: 15px;
                width: 82px;
                text-align: right;
                color: $primary-color;
              }

              .text {
                display: inline-block;
                flex: 1;
                padding-left: 7.5px;
                border-bottom: 1px solid #d5d5d5;
                color: #333;
              }
            }
          }
        }
      }
    }
  }
</style>
