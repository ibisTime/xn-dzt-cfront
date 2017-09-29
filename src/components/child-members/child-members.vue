<template>
  <transition name="slide">
    <div class="child-wrapper">
      <scroll :data="users" :pullup="pullup" @scrollToEnd="getPageChildren" class="scroll-content">
        <div>
          <ul>
            <li v-for="item in users">
              <div class="avatar">
                <img :src="formatImg(item.photo)"/>
              </div>
              <div class="info">
                <h2>{{item.nickname}}</h2>
                <p>加入时间：{{formatDate(item.createDatetime)}}</p>
              </div>
            </li>
          </ul>
          <loading class="loading" v-show="hasMore" title=""></loading>
        </div>
      </scroll>
      <div v-show="!hasMore && !users.length" class="no-result-wrapper">
        <no-result title="抱歉，暂无推荐"></no-result>
      </div>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import NoResult from 'base/no-result/no-result';
  import {setTitle, formatDate, formatImg} from 'common/js/util';
  import {getPageChildren} from 'api/user';

  const LIMIT = 20;

  export default {
    data() {
      return {
        start: 1,
        hasMore: true,
        users: []
      };
    },
    created() {
      this.pullup = true;
      setTitle('推荐列表');
      this.getPageChildren();
    },
    methods: {
      getPageChildren() {
        if (this.hasMore) {
          getPageChildren(this.start, LIMIT).then((data) => {
            if (data.list.length < LIMIT || data.totalCount <= LIMIT) {
              this.hasMore = false;
            }
            this.users = this.users.concat(data.list);
            this.start++;
          });
        }
      },
      formatImg(img) {
        if (!img) {
          return require('./avatar@2x.png');
        }
        return formatImg(img);
      },
      formatDate(date) {
        return formatDate(date, 'yyyy-MM-dd hh:mm');
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

  .child-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .scroll-content {
      position: relative;
      height: 100%;

      ul {
        li {
          display: flex;
          align-items: center;
          height: 1.5rem;
          padding: 0 0.3rem;
          border-bottom: 1px solid #a1a1a1;

          &:last-child {
            border-bottom: none;
          }

          .avatar {
            width: 0.9rem;
            height: 0.9rem;
            flex: 0 0 0.9rem;
            border-radius: 50%;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
            }
          }

          .info {
            padding-left: 0.2rem;

            h2 {
              font-size: $font-size-medium;
            }

            p {
              margin-top: 0.2rem;
              font-size: $font-size-small;
              color: #999;
            }
          }
        }
      }

      .loading {
        padding-top: 0.4rem;
      }
    }
    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }

  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
