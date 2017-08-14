<template>
  <div class="home-wrapper">
    <scroll ref="scroll" class="home-content">
      <div>
        <div class="slider-wrapper">
          <slider>
            <div v-for="(item,index) in banners" :key="index" class="slider-item">
              <!-- <a :href="item.url"> -->
              <a>
                <!-- <img class="needsclick" @load="loadImage" :src="item.pic | formatImg"/> -->
                <img class="needsclick" @load="loadImage" src="./banner@2x.png"/>
              </a>
            </div>
          </slider>
        </div>
        <div class="home-category">
          <router-link tag="div" class="cate-item cate-material" to="/home/material">
            <h2>高端面料</h2>
          </router-link>
          <router-link tag="div" class="cate-item cate-technology" to="/home/technology">
            <h2>精致工艺</h2>
          </router-link>
        </div>
        <div class="home-list">
          <div class="head clearfix">
            <span>合衣衬衫</span>
            <router-link to="/home/technology">查看全部</router-link>
          </div>
          <div class="list-content clearfix">
            <div class="item">
              <div class="inner">
                <div class="inner-content">
                  <img src="./c1@2x.png" alt="">
                  <div class="like" @click.stop.prevent></div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="inner">
                <div class="inner-content">
                  <img src="./c1@2x.png" alt="">
                  <div class="like" @click.stop.prevent></div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="inner">
                <div class="inner-content">
                  <img src="./c1@2x.png" alt="">
                  <div class="like" @click.stop.prevent></div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="inner">
                <div class="inner-content">
                  <img src="./c1@2x.png" alt="">
                  <div class="like" @click.stop.prevent></div>
                </div>
              </div>
            </div>
          </div>
          <div class="head clearfix">
            <span>H+</span>
            <router-link to="/home/technology">查看全部</router-link>
          </div>
          <div class="list-content clearfix">
            <div class="item">
              <div class="inner">
                <div class="inner-content">
                  <img src="./c1@2x.png" alt="">
                  <div class="like" @click.stop.prevent></div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="inner">
                <div class="inner-content">
                  <img src="./c1@2x.png" alt="">
                  <div class="like" @click.stop.prevent></div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="inner">
                <div class="inner-content">
                  <img src="./c1@2x.png" alt="">
                  <div class="like" @click.stop.prevent></div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="inner">
                <div class="inner-content">
                  <img src="./c1@2x.png" alt="">
                  <div class="like" @click.stop.prevent></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>
<script>
  import Slider from 'base/slider/slider';
  import Scroll from 'base/scroll/scroll';
  import {commonMixin} from 'common/js/mixin';

  export default {
    mixins: [commonMixin],
    data() {
      return {
        banners: [1, 2, 3]
      };
    },
    // mounted() {
    //   setTimeout(() => {
    //     this.$refs.scroll.refresh();
    //   }, 2000);
    // },
    methods: {
      loadImage() {
        if(!this.checkLoaded) {
          this.$refs.scroll.refresh();
          this.checkLoaded = true;
        }
      }
    },
    components: {
      Slider,
      Scroll
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
    bottom: 49px;
    padding: 0 19px 15px;
    width: 100%;
    background: #fff;

    .home-content {
      position: relative;
      height: 100%;
      overflow: hidden;

      .slider-wrapper {
        position: relative;

        .slider {
          padding-top: 15px;
        }

        .slider-item {
          a {
            border-radius: 6px;
            overflow: hidden;
            img {
              border-radius: 6px;
            }
          }
        }
      }

      .home-category {
        margin: 32px 0 9px;
        display: flex;
        .cate-item {
          position: relative;
          flex: 1;
          height: 60px;
          border-radius: 6px;
          color: #fff;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;

          &.cate-material {
            margin-right: 6px;
            @include bg-image('material');
          }
          &.cate-technology {
            margin-left: 6px;
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
        padding-bottom: 4px;

        .head {
          margin-top: 25px;

          span {
            float: left;
            font-size: $font-size-medium;
          }

          a {
            float: right;
            margin-top: 1px;
            font-size: $font-size-small;
            color: #adadad;
          }
        }

        .list-content {
          padding-top: 2px;

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
  }
</style>
