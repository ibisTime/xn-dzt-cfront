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
    </scroll>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
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
      Loading
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
    z-index: 103;
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
            margin-bottom: 10px;

            label {
              font-size: 15px;
            }

            span {
              float: right;
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
  }
</style>
