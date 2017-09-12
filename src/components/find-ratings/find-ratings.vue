<template>
  <transition name="slide">
    <scroll ref="scroll"
            :data="ratingList"
            :pullup="pullup"
            @scrollToEnd="getPageRatings"
            class="rating-wrapper">
      <div>
        <div class="rating-content">
          <div v-for="item in ratingList" class="item">
            <div class="avatar">
              <img :src="item.photo | formatAvatar"/>
            </div>
            <div class="inner-content">
              <div class="top">
                <label>{{item.commerRealName}}</label>
                <span>{{item.commentDatetime | formatDate}}</span>
              </div>
              <div class="bottom">{{item.content}}</div>
            </div>
          </div>
          <loading class="find-loading" v-show="hasMore" title=""></loading>
        </div>
      </div>
      <div v-show="!hasMore && !ratingList.length" class="no-result-wrapper">
        <no-result title="抱歉，暂无评论"></no-result>
      </div>
    </scroll>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import NoResult from 'base/no-result/no-result';
  import {getPageRatings} from 'api/biz';
  import {commonMixin} from 'common/js/mixin';

  const LIMIT = 20;

  export default {
    mixins: [commonMixin],
    data() {
      return {
        ratingList: [],
        hasMore: true,
        start: 1
      };
    },
    created() {
      this.pullup = true;
      let result = /find\/([^/]+)\/rating/.exec(this.$route.path);
      this.code = result[1];
      this.getPageRatings();
    },
    methods: {
      getPageRatings() {
        if (this.hasMore) {
          getPageRatings(this.code, this.start, LIMIT).then((data) => {
            if (data.totalCount <= LIMIT || data.list.length < LIMIT) {
              this.hasMore = false;
            }
            this.ratingList = this.ratingList.concat(data.list);
          });
        }
      }
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

  .rating-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 121;
    background: #fff;

    .rating-content {
      .item {
        display: flex;
        align-items: top;
        padding: 11px 15px;
        border-bottom: 1px solid #eee;

        .avatar {
          width: 50px;
          height: 50px;
          flex: 0 0 50px;
          border-radius: 50%;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .inner-content {
          flex: 1;
          padding-left: 10px;

          .top {
            display: flex;
            margin-bottom: 10px;

            label {
              flex: 1;
              line-height: 1.1;
              font-size: 15px;
            }

            span {
              font-size: $font-size-small;
              color: #999;
            }
          }

          .bottom {
            font-size: $font-size-medium;
            line-height: 1.3;
          }
        }
      }

      .find-loading {
        padding-top: 20px;
      }
    }

    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
