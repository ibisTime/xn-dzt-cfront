<template>
  <div class="">
    <div class="home-wrapper">
      <scroll :data="compData" ref="scroll" class="home-content">
        <div>
          <div class="slider-wrapper">
            <slider v-if="banners.length" :showDots="showDots" :loop="loop">
              <div class="home-slider" v-for="item in banners" :key="item.code">
                <a :href="item.url||'javascript:void(0)'" :style="getImgSyl(item.pic)"></a>
              </div>
            </slider>
          </div>
          <div class="home-category">
            <router-link tag="div" class="cate-item cate-material needsclick" to="/home/material">
              <h2>高端面料</h2>
            </router-link>
            <router-link tag="div" class="cate-item cate-technology needsclick" to="/home/technology">
              <h2>精致工艺</h2>
            </router-link>
          </div>
          <div class="home-list">
            <div class="head clearfix">
              <span>合衣衬衫</span>
              <router-link to="/home/shirt" class="needsclick">查看全部</router-link>
            </div>
            <div class="list-content clearfix">
              <div v-for="(item,index) in modelList" @click="selectItem(item)" :key="item.code" class="item needsclick">
                <div class="inner">
                  <div class="inner-content" :style="getImgSyl(item.pic)">
                    <div class="like" :class="{active:item.isSC === '1'}" @click.stop.prevent="handleCollect(item,index, false)"></div>
                  </div>
                </div>
              </div>
              <no-result v-show="!hasMore && !modelList.length" title="抱歉，暂无衬衫数据"></no-result>
              <loading class="loading-wrapper" v-show="hasMore" title=""></loading>
            </div>
            <div class="head clearfix">
              <span>H+</span>
              <router-link to="/home/clothes" class="needsclick">查看全部</router-link>
            </div>
            <div class="list-content clearfix">
              <div v-for="(item,index) in hModelList" @click="selectItem(item)" :key="item.code" class="item needsclick">
                <div class="inner">
                  <div class="inner-content" :style="getImgSyl(item.pic)">
                    <div class="like" :class="{active:item.isSC === '1'}" @click.stop.prevent="handleCollect(item,index,true)"></div>
                  </div>
                </div>
              </div>
              <no-result v-show="!hHasMore && !hModelList.length" title="抱歉，暂无H+数据"></no-result>
              <loading class="loading-wrapper" v-show="hHasMore" title=""></loading>
            </div>
          </div>
          <div class="spilt-div"></div>
        </div>
      </scroll>
    </div>
    <router-view @update="handleUpdate"></router-view>
  </div>
</template>
<script>
  import {mapMutations} from 'vuex';
  import {SET_CURRENT_MODEL} from 'store/mutation-types';
  import Slider from 'base/slider/slider';
  import Loading from 'base/loading/loading';
  import Scroll from 'base/scroll/scroll';
  import NoResult from 'base/no-result/no-result';
  import {commonMixin} from 'common/js/mixin';
  import {formatImg, getShareImg, setTitle} from 'common/js/util';
  import {initShare} from 'common/js/weixin';
  import {getBannerList} from 'api/general';
  import {getPageModel, collection, cancelCollection} from 'api/biz';

  const START = 1;
  const LIMIT = 20;
  const HOT_LOCATION = 1;
  const TYPE_NORMAL = 0;
  const TYPE_H = 1;

  export default {
    mixins: [commonMixin],
    data() {
      return {
        banners: [],
        modelList: [],
        hasMore: true,
        hModelList: [],
        hHasMore: true
      };
    },
    computed: {
      showDots() {
        return this.banners.length > 1;
      },
      loop() {
        return this.banners.length > 1;
      },
      compData() {
        return this.modelList.concat(this.hModelList);
      }
    },
    created() {
      this.fetching = false;
      this.isWxConfiging = false;
      this.wxData = null;
      if (this.shouldGetData()) {
        this.getInitData();
      }
    },
    updated() {
      if (this.shouldGetData()) {
        this.getInitData();
      }
    },
    methods: {
      getInitData() {
        if (!this.fetching) {
          this.fetching = true;
          Promise.all([
            this.getModelList(),
            this.getHModelList(),
            this.getBannerList()
          ]).finally(() => {
            this.hasMore = false;
            this.hHasMore = false;
            this.fetching = false;
          });
        }
      },
      getModelList() {
        return getPageModel(START, LIMIT, TYPE_NORMAL, HOT_LOCATION).then((data) => {
          this.modelList = data.list;
          setTimeout(() => {
            this.$refs.scroll.refresh();
          }, 20);
        });
      },
      getHModelList() {
        return getPageModel(START, LIMIT, TYPE_H, HOT_LOCATION).then((data) => {
          this.hModelList = data.list;
          setTimeout(() => {
            this.$refs.scroll.refresh();
          }, 20);
        });
      },
      getBannerList() {
        return getBannerList().then((data) => {
          this.banners = data;
        });
      },
      shouldGetData() {
        if (this.$route.path === '/home') {
          setTitle('合衣定制');
          // 当前页面,并且微信sdk未初始化
          if(!this.isWxConfiging && !this.wxData) {
            this.getInitWXSDKConfig();
          }
          if (this.hasMore && this.hHasMore && !this.fetching) {
            return true;
          }
          return false;
        }
        this.isWxConfiging = false;
        this.wxData = null;
        return false;
      },
      selectItem(item) {
        if (!item._advPic) {
          item._advPic = item.advPic.split('||');
        }
        this.setCurModel(item);
        this.$router.push(`/home/${item.code}`);
      },
      handleCollect(item, index, isH) {
        if (item.isSC === '1') {
          item.isSC = '0';
          cancelCollection(item.code).catch(() => {
            item.isSC = '1';
          }).finally(() => {
            if (isH) {
              this.hModelList.splice(index, 1, item);
            } else {
              this.modelList.splice(index, 1, item);
            }
          });
        } else {
          item.isSC = '1';
          collection(item.code).catch(() => {
            item.isSC = '0';
          }).finally(() => {
            if (isH) {
              this.hModelList.splice(index, 1, item);
            } else {
              this.modelList.splice(index, 1, item);
            }
          });
        }
      },
      handleUpdate(product) {
        let index = -1;
        index = this.modelList.findIndex((item) => {
          return item.code === product.code;
        });
        if (~index) {
          this.modelList.splice(index, 1, product);
        } else {
          index = this.hModelList.findIndex((item) => {
            return item.code === product.code;
          });
          if (~index) {
            this.hModelList.splice(index, 1, product);
          }
        }
      },
      getImgSyl(imgs) {
        return {
          backgroundImage: `url(${formatImg(imgs)})`
        };
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
      ...mapMutations({
        'setCurModel': SET_CURRENT_MODEL
      })
    },
    components: {
      Slider,
      Scroll,
      Loading,
      NoResult
    }
  };
</script>
<style lang="scss" scoped rel="stylesheet/scss">
  @import "~common/scss/mixin";
  @import "~common/scss/variable";

  .home-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    padding: 0 0.38rem;
    width: 100%;
    background: #fff;

    .home-content {
      position: relative;
      height: 100%;
      overflow: hidden;

      .loading-wrapper {
        clear: both;
        padding-top: 0.4rem;
      }

      .slider-wrapper {
        position: relative;
        height: 4.08rem;

        .slider {
          padding-top: 0.3rem;
          height: 4.08rem;
        }

        .home-slider {
          height: 3.78rem;
        }

        a {
          display: block;
          height: 100%;
          border-radius: 0.12rem;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
        }
      }

      .home-category {
        margin: 0.64rem 0 0.18rem;
        display: flex;
        .cate-item {
          position: relative;
          flex: 1;
          height: 1.2rem;
          border-radius: 0.12rem;
          color: #fff;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;

          &.cate-material {
            margin-right: 0.12rem;
            @include bg-image('material');
          }
          &.cate-technology {
            margin-left: 0.12rem;
            @include bg-image('technology');
          }

          h2 {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate3d(-50%, -50%, 0);
            font-size: $font-size-large;
          }
        }
      }

      .home-list {
        padding-bottom: 0.3rem;

        .head {
          margin-top: 0.5rem;

          span {
            float: left;
            font-size: $font-size-medium;
          }

          a {
            float: right;
            margin-top: 0.02rem;
            font-size: $font-size-small;
            color: #adadad;
          }
        }

        .list-content {
          padding-top: 0.04rem;

          .item {
            position: relative;
            float: left;
            width: 50%;
            height: 0;
            padding-top: 75%;
            border-radius: 0.12rem;

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
                border-radius: 0.12rem;
                overflow: hidden;
                background-repeat: no-repeat;
                background-size: cover;
                background-position: center;
              }
            }

            &:nth-child(even) {
              .inner {
                padding-top: 0.24rem;
                padding-left: 0.12rem;
              }
            }

            &:nth-child(odd) {
              .inner {
                padding-top: 0.24rem;
                padding-right: 0.12rem;
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
              width: 0.72rem;
              height: 0.72rem;
              padding: 0.18rem;
              background-position: center;
              background-repeat: no-repeat;
              background-size: 0.36rem;
              @include bg-image('like');

              &.active {
                @include bg-image('like-act');
              }
            }
          }
        }
      }

      .spilt-div {
        height: 0.98rem;
      }
    }
  }
</style>
