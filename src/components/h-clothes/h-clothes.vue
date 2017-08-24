<template>
  <transition name="slide">
    <div class="clothes-wrapper">
      <scroll :data="products" class="scroll-content">
        <div>
          <div class="list-content clearfix">
            <div v-for="(item,index) in products" @click="selectItem(item)" :key="item.code" class="item">
              <div class="inner">
                <div class="inner-content">
                  <img v-lazy="formatImg(item.pic)"/>
                  <div class="like" :class="{active:item.isSC === '1'}" @click.stop.prevent="handleCollect(item,index)"></div>
                </div>
              </div>
            </div>
            <loading class="loading-wrapper" v-show="hasMore" title=""></loading>
          </div>
        </div>
      </scroll>
      <router-view @update="handleUpdate"></router-view>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import {getPageModel, collection, cancelCollection} from 'api/biz';
  import {getShareImg, setTitle, formatImg} from 'common/js/util';
  import {initShare} from 'common/js/weixin';
  import {SET_CURRENT_MODEL} from 'store/mutation-types';
  import {mapMutations} from 'vuex';

  const LIMIT = 20;
  const TYPE_H = 1;

  export default {
    data() {
      return {
        products: [],
        hasMore: true,
        start: 1
      };
    },
    created() {
      this.fetching = false;
      this.isWxConfiging = false;
      this.wxData = null;
      if (this.shouldGetData()) {
        this.getModelList();
      }
    },
    updated() {
      if (this.shouldGetData()) {
        this.getModelList();
      }
    },
    methods: {
      shouldGetData() {
        if (this.$route.path === '/home/clothes') {
          setTitle('H+');
          // 当前页面,并且微信sdk未初始化
          if(!this.isWxConfiging && !this.wxData) {
            this.getInitWXSDKConfig();
          }
          if (this.hasMore && !this.fetching) {
            return true;
          }
          return false;
        }
        this.isWxConfiging = false;
        this.wxData = null;
        return false;
      },
      getModelList() {
        this.fetching = true;
        return getPageModel(this.start, LIMIT, TYPE_H).then((data) => {
          this.fetching = false;
          if (data.totalCount <= LIMIT || data.list.length < LIMIT) {
            this.hasMore = false;
          }
          this.products = this.products.concat(data.list);
        }).catch(() => {
          this.fetching = false;
        });
      },
      getInitWXSDKConfig() {
        this.isWxConfiging = true;
        initShare({
          title: '合衣定制',
          desc: '合衣定制',
          link: location.href,
          imgUrl: getShareImg()
        }, (data) => {
          this.isWxConfiging = false;
          this.wxData = data;
        }, () => {
          this.isWxConfiging = false;
          this.wxData = null;
        });
      },
      selectItem(item) {
        if (!item._advPic) {
          item._advPic = item.advPic.split('||');
        }
        this.setCurModel(item);
        this.$router.push(`/home/clothes/${item.code}`);
      },
      handleCollect(item, index) {
        if (item.isSC === '1') {
          cancelCollection(item.code).then(() => {
            this.products.splice(index, 1, {
              ...item,
              isSC: '0'
            });
          });
        } else {
          collection(item.code).then(() => {
            this.products.splice(index, 1, {
              ...item,
              isSC: '1'
            });
          });
        }
      },
      handleUpdate(product) {
        let index = this.products.findIndex((item) => {
          return item.code === product.code;
        });
        if (~index) {
          this.products.splice(index, 1, product);
        }
        this.$emit('update', product);
      },
      formatImg(img) {
        return formatImg(img);
      },
      ...mapMutations({
        'setCurModel': SET_CURRENT_MODEL
      })
    },
    components: {
      Scroll,
      Loading
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/mixin";

  .clothes-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .scroll-content {
      height: 100%;
      position: relative;

      .loading-wrapper {
        clear: both;
        padding-top: 20px;
      }

      .list-content {
        padding-bottom: 15px;
        padding-top: 3px;

        .item {
          position: relative;
          float: left;
          width: 50%;
          height: 0;
          padding-top: 75%;
          border-radius: 6px;

          .inner {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            .inner-content {
              position: relative;
              width: 100%;
              height: 100%;
              border-radius: 6px;
              overflow: hidden;
            }
          }

          &:nth-child(even) {
            .inner {
              padding-top: 12px;
              padding-left: 6px;
            }
          }

          &:nth-child(odd) {
            .inner {
              padding-top: 12px;
              padding-right: 6px;
            }
          }

          img {
            width: 100%;
            height: 100%;
          }

          .like {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 36px;
            height: 36px;
            padding: 9px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: 18px;
            @include bg-image('like');

            &.active {
              @include bg-image('like-act');
            }
          }
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
