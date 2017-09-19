<template>
  <transition name="slide">
    <div class="product-wrapper">
      <scroll :data="products" :pullup="pullup" @scrollToEnd="getPageProducts" class="scroll-content">
        <div>
          <div class="list-content clearfix">
            <div v-for="(item,index) in products" @click="selectItem(item,index)" :key="item.code" class="item">
              <div class="inner">
                <div class="inner-content" :style="getImgSyl(item.specimen.pic)"></div>
              </div>
            </div>
            <loading class="loading-wrapper" v-show="hasMore" title=""></loading>
          </div>
        </div>
        <div v-show="!hasMore && !products.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无收藏的样品"></no-result>
        </div>
      </scroll>
      <router-view @update="handleUpdate"></router-view>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import NoResult from 'base/no-result/no-result';
  import {setTitle, formatImg} from 'common/js/util';
  import {getPageCollections} from 'api/biz';
  import {SET_CURRENT_MODEL} from 'store/mutation-types';
  import {mapMutations} from 'vuex';

  const LIMIT = 20;

  export default {
    data() {
      return {
        products: [],
        hasMore: true,
        start: 1
      };
    },
    created() {
      this.pullup = true;
      if (this.shouldGetData()) {
        this.getPageProducts();
      }
    },
    updated() {
      if (this.shouldGetData()) {
        this.getPageProducts();
      }
    },
    methods: {
      shouldGetData() {
        if (this.$route.path === '/user/collection/product') {
          setTitle('样品列表');
          if (this.hasMore && !this.products.length) {
            return true;
          }
          return false;
        }
        return false;
      },
      getPageProducts() {
        if (this.hasMore) {
          getPageCollections(this.start, LIMIT, 5).then((data) => {
            if (data.totalCount <= LIMIT || data.list.length < LIMIT) {
              this.hasMore = false;
            }
            this.start++;
            this.products = this.products.concat(data.list);
          }).catch(() => {
            this.hasMore = false;
          });
        }
      },
      selectItem(item, index) {
        this.curCode = item.code;
        this.curIndex = index;
        if (!item.specimen._advPic) {
          item.specimen._advPic = item.specimen.advPic.split('||');
        }
        this.setCurModel(item.specimen);
        this.$router.push(`/user/collection/product/${item.specimen.code}`);
      },
      handleUpdate(item) {
        if (this.curCode) {
          let _curItem = this.products[this.curIndex];
          if (item.isSC === '1') {
            if (!_curItem || _curItem.specimen.code !== item.code) {
              this.products.splice(this.curIndex, 0, {
                specimen: item,
                code: this.curCode
              });
            }
          } else {
            if (_curItem.specimen.code === item.code) {
              this.products.splice(this.curIndex, 1);
            }
          }
        }
      },
      getImgSyl(imgs) {
        return {
          backgroundImage: `url(${formatImg(imgs)})`
        };
      },
      ...mapMutations({
        'setCurModel': SET_CURRENT_MODEL
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
  @import "~common/scss/mixin";

  .product-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .scroll-content {
      height: 100%;
      position: relative;
      padding: 0 18px;

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
              background-repeat: no-repeat;
              background-size: cover;
              background-position: center;
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
        }
      }
    }
    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
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
