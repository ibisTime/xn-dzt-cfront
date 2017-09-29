<template>
  <transition name="slide">
    <div class="technology-wrapper">
      <scroll :data="techList"
              :pullup="pullup"
              @scrollToEnd="getPageTechs"
              class="technology-content">
        <div>
          <ul class="tech-content">
            <li v-for="(tech,index) in techList" class="needsclick" :key="tech.code" @click="selectItem(tech,index)">
              <div class="inner">
                <div class="inner-content">
                  <img v-lazy="formatImg(tech.craft.pic)"/>
                </div>
              </div>
            </li>
            <loading class="tech-loading" v-show="hasMore" title=""></loading>
          </ul>
        </div>
        <div v-show="!hasMore && !techList.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无收藏的工艺"></no-result>
        </div>
      </scroll>
      <modal ref="modal">
        <div class="modal-wrap">
          <img :src="formatImg(currentItem && currentItem.craft.pic)"/>
          <div @click="handleCollection" class="icon" :class="{active:currentLike}"></div>
        </div>
      </modal>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import NoResult from 'base/no-result/no-result';
  import Loading from 'base/loading/loading';
  import Modal from 'base/modal/modal';
  import {formatImg, setTitle} from 'common/js/util';
  import {getPageCollections, collection, cancelCollection} from 'api/biz';

  const LIMIT = 20;

  export default {
    data() {
      return {
        techList: [],
        hasMore: true,
        currentLike: false,
        currentItem: null,
        start: 1
      };
    },
    created() {
      setTitle('工艺列表');
      this.pullup = true;
      this.getPageTechs();
    },
    methods: {
      getPageTechs() {
        if (this.hasMore) {
          getPageCollections(this.start, LIMIT, 4).then((data) => {
            if (data.totalCount <= LIMIT || data.list.length < LIMIT) {
              this.hasMore = false;
            }
            this.start++;
            this.techList = this.techList.concat(data.list);
          }).catch(() => {
            this.hasMore = false;
          });
        }
      },
      handleCollection() {
        if (this.currentLike) {
          this.currentLike = false;
          cancelCollection(this.currentItem.craft.code).then(() => {
            this.techList.splice(this.curIndex, 1);
          }).catch(() => {
            this.currentLike = true;
          });
        } else {
          this.currentLike = true;
          collection(this.currentItem.craft.code).then(() => {
            this.techList.splice(this.curIndex, 0, this.currentItem);
          }).catch(() => {
            this.currentLike = false;
          });
        }
      },
      formatImg(img) {
        return formatImg(img);
      },
      selectItem(item, index) {
        this.currentItem = item;
        this.currentLike = true;
        this.curIndex = index;
        this.$refs.modal.show();
      }
    },
    components: {
      Scroll,
      NoResult,
      Loading,
      Modal
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .technology-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .technology-content {
      height: 100%;

      .tech-content {
        padding: 0.2rem 0.28rem 0.2rem 0.38rem;

        li {
          position: relative;
          float: left;
          width: 25%;
          height: 0;
          padding-top: 25%;
          border-radius: 0.12rem;

          .inner {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding-right: 0.1rem;
            padding-top: 0.1rem;

            .inner-content {
              position: relative;
              width: 100%;
              height: 100%;
              border: 1px solid #e5e5e5;
              border-radius: 0.12rem;
              box-shadow: 1px 1px 1px #e5e5e5;

              img {
                width: 100%;
                height: 100%;
              }

              .text {
                position: absolute;
                bottom: 0;
                right: 0;
                border-bottom-right-radius: 0.12rem;
                border-top-left-radius: 0.12rem;
                max-width: 100%;
                text-align: right;
                font-size: $font-size-small-s;
                color: #fff;
                padding: 0.08rem;
                background-color: $primary-color;
                @include no-wrap;
              }
            }
          }
        }
      }

      .tech-loading {
        padding-top: 0.4rem;
      }

      .no-result-wrapper {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .modal-wrap {
      height: 100%;

      img {
        width: 100%;
        height: 100%;
      }

      .text {
        position: absolute;
        bottom: 0;
        right: 0;
        border-bottom-right-radius: 0.26rem;
        border-top-left-radius: 0.26rem;
        max-width: 100%;
        text-align: right;
        font-size: $font-size-large-x;
        color: #fff;
        padding: 0.2rem;
        background-color: $primary-color;
        @include no-wrap;
      }

      .icon {
        position: absolute;
        top: 0;
        left: 0;
        width: 1rem;
        height: 1rem;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 0.4rem;
        @include bg-image('like');

        &.active {
          @include bg-image('like-act');
        }
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
