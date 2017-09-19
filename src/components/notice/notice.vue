<template>
  <transition name="slide">
    <div class="notice-wrapper">
      <scroll :data="notices" :pullup="pullup" @scrollToEnd="getPageNotices" class="scroll-content">
        <div>
          <div class="list-content clearfix">
            <div v-for="item in notices" class="item border-bottom-1px">
              <div class="img"><i></i></div>
              <div class="content">
                <div class="title">{{item.smsTitle}}</div>
                <div class="date">{{item.pushedDatetime | formatDate}}</div>
                <div class="desc">{{item.smsContent}}</div>
              </div>
            </div>
            <loading class="loading" v-show="hasMore" title=""></loading>
          </div>
        </div>
      </scroll>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import {setTitle} from 'common/js/util';
  import {getPageSysNotices} from 'api/general';
  import {commonMixin} from 'common/js/mixin';

  const LIMIT = 20;

  export default {
    mixins: [commonMixin],
    data() {
      return {
        notices: [],
        hasMore: true,
        start: 1
      };
    },
    created() {
      setTitle('系统消息');
      this.pullup = true;
      this.getPageNotices();
    },
    methods: {
      getPageNotices() {
        if (this.hasMore) {
          getPageSysNotices(this.start, LIMIT).then((data) => {
            if (data.totalCount <= LIMIT || data.list.length < LIMIT) {
              this.hasMore = false;
            }
            this.notices = this.notices.concat(data.list);
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
  @import "~common/scss/mixin";

  .notice-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .scroll-content {
      position: relative;
      height: 100%;

      .list-content {
        padding-left: 18px;

        .item {
          display: flex;
          align-items: top;
          padding: 25px 18px;
          padding-left: 0;
          @include border-bottom-1px($color-border);

          .img {
            width: 32px;
            height: 32px;
            flex: 0 0 32px;

            i {
              display: inline-block;
              width: 100%;
              height: 100%;
              background: url(notice.png) no-repeat;
              background-size: 32px 32px;
            }
          }

          .content {
            flex: 1;
            padding-left: 10px;

            .title {
              font-size: $font-size-medium;
            }

            .date {
              padding-top: 10px;
              font-size: $font-size-small;
              color: #999;
            }

            .desc {
              margin-top: 15px;
              padding: 15px;
              border-radius: 6px;
              line-height: 1.2;
              font-size: $font-size-small;
              color: #999;
              background: #f5f5f5;
            }
          }
        }
      }
    }
  }
</style>
