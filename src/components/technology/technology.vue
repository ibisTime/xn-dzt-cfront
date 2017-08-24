<template>
  <transition name="slide">
    <div class="technology-wrapper">
      <div class="category-wrapper">
        <category-scroll :currentIndex="currentIndex"
                         :categorys="categorys"
                         @select="selectCategory"
                         ref="categoryScroll"></category-scroll>
      </div>
      <scroll ref="scroll"
              @scroll="scroll"
              :listen-scroll="listenScroll"
              :probe-type="probeType"
              :data="categorys"
              :scrollEnd="scrollEnd"
              @scrollToEnd="scrollToEnd"
              class="technology-content">
        <div>
          <ul class="tech-content">
            <li v-for="(item, index) in categorys" class="tech-item" ref="techCate" :key="index">
              <div class="head">{{item.value}}</div>
              <ul class="clearfix">
                <li v-for="tech in techList[item.key]" :key="tech.code" @click="selectItem(tech)">
                  <div class="inner">
                    <div class="inner-content">
                      <img v-lazy="formatImg(tech.advPic || tech.pic)"/>
                      <!-- <div class="text">{{tech.name}}</div> -->
                    </div>
                  </div>
                </li>
              </ul>
            </li>
            <loading class="tech-loading" v-show="hasMore" title=""></loading>
          </ul>
        </div>
        <div v-show="!hasMore && !categorys.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无相关工艺"></no-result>
        </div>
      </scroll>
      <modal ref="modal">
        <div class="modal-wrap">
          <img :src="formatImg(currentItem && (currentItem.advPic || currentItem.pic))"/>
          <!-- <div class="text">{{currentItem && currentItem.name}}</div> -->
          <div @click="handleCollection" class="icon" :class="{active:currentLike}"></div>
        </div>
      </modal>
    </div>
  </transition>
</template>
<script>
  import CategoryScroll from 'base/category-scroll/category-scroll';
  import Scroll from 'base/scroll/scroll';
  import NoResult from 'base/no-result/no-result';
  import Loading from 'base/loading/loading';
  import Modal from 'base/modal/modal';
  import {formatImg, getShareImg, setTitle} from 'common/js/util';
  import {initShare} from 'common/js/weixin';
  import {getTechnologyList, getTechnology, collection, cancelCollection} from 'api/biz';
  import {getDictList} from 'api/general';

  export default {
    data() {
      return {
        currentIndex: 0,
        scrollY: -1,
        categorys: [],
        techList: null,
        hasMore: true,
        isScrolling: false,
        scrollEnd: true,
        currentLike: false,
        currentItem: null
      };
    },
    created() {
      setTitle('精致工艺');
      this.probeType = 3;
      this.listenScroll = true;
      this.listHeight = [];
      this.getInitData();
      initShare({
        title: document.title,
        desc: '精致工艺',
        link: location.href,
        imgUrl: getShareImg()
      });
    },
    methods: {
      getInitData() {
        Promise.all([
          this.getTechList(),
          this.getCraftTypeDict()
        ]).then(([techList, craftList]) => {
          let craftObj = {};
          craftList.forEach((item) => {
            craftObj[item.dkey] = {
              use: false,
              key: item.dkey,
              value: item.dvalue
            };
          });
          let cateList = [];
          let techObj = {};
          techList.forEach((item) => {
            if (craftObj[item.type]) {
              if (!craftObj[item.type].use) {
                craftObj[item.type].use = true;
                cateList.push(craftObj[item.type]);
                techObj[item.type] = [];
              }
              techObj[item.type].push(item);
            }
          });
          this.categorys = cateList;
          this.techList = techObj;
          this.hasMore = false;
        }).catch(() => {
          this.hasMore = false;
        });
      },
      // 工艺数据获取
      getTechList() {
        return getTechnologyList();
      },
      // 工艺类型数据字典
      getCraftTypeDict() {
        return getDictList('craftwork_type');
      },
      // 详情获取工艺
      getTechnology(code) {
        getTechnology(code).then((data) => {
          if (code === this.currentItem.code) {
            this.currentLike = data.isSC === '1';
          }
        });
      },
      handleCollection() {
        if (this.currentLike) {
          this.currentLike = false;
          cancelCollection(this.currentItem.code).catch(() => {
            this.currentLike = true;
          });
        } else {
          this.currentLike = true;
          collection(this.currentItem.code).catch(() => {
            this.currentLike = false;
          });
        }
      },
      formatImg(img) {
        return formatImg(img);
      },
      selectItem(item) {
        this.getTechnology(item.code);
        this.currentItem = item;
        this.$refs.modal.show();
      },
      selectCategory(index) {
        this.currentIndex = index;
        this.isScrolling = true;
        this.$refs.scroll.scrollToElement(this.$refs.techCate[index]);
      },
      scroll(pos) {
        this.scrollY = pos.y;
      },
      scrollToEnd() {
        if (this.scrollToEnd) {
          this.isScrolling = false;
        }
      },
      _calculateHeight() {
        this.listHeight = [];
        const list = this.$refs.techCate;
        let height = 0;
        this.listHeight.push(height);
        for (let i = 0; i < list.length; i++) {
          let item = list[i];
          height += item.clientHeight;
          this.listHeight.push(height);
        }
      }
    },
    watch: {
      scrollY(newY) {
        if (this.isScrolling) {
          return;
        }
        const listHeight = this.listHeight;
        if (newY > 0) {
          this.currentIndex = 0;
          return;
        }
        for (let i = 0; i < listHeight.length - 2; i++) {
          let height1 = listHeight[i];
          let height2 = listHeight[i + 1];
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i;
            return;
          }
        }
        this.currentIndex = listHeight.length - 2;
      },
      currentIndex(newIndex) {
        this.$refs.categoryScroll.scrollToEleByIndex(newIndex);
      },
      techList() {
        setTimeout(() => {
          this._calculateHeight();
        }, 20);
      }
    },
    components: {
      CategoryScroll,
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
    background: #f5f5f5;

    .category-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 100;
      overflow: hidden;
      height: 40px;
      line-height: 40px;
      background: $primary-color;
    }

    .technology-content {
      position: absolute;
      top: 40px;
      left: 0;
      width: 100%;
      bottom: 0;
      background-color: #fff;

      .tech-content {
        padding: 10px 14px 10px 19px;

        .tech-item {
          .head {
            margin-top: 25px;
            margin-bottom: 4px;
            padding-left: 7px;
            font-size: $font-size-medium;
          }
          ul {
            li {
              position: relative;
              float: left;
              width: 25%;
              height: 0;
              padding-top: 25%;
              border-radius: 6px;

              .inner {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                padding-right: 5px;
                padding-top: 5px;

                .inner-content {
                  position: relative;
                  width: 100%;
                  height: 100%;
                  border: 1px solid #e5e5e5;
                  border-radius: 6px;
                  box-shadow: 1px 1px 1px #e5e5e5;

                  img {
                    width: 100%;
                    height: 100%;
                  }

                  .text {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    border-bottom-right-radius: 6px;
                    border-top-left-radius: 6px;
                    max-width: 100%;
                    text-align: right;
                    font-size: $font-size-small-s;
                    color: #fff;
                    padding: 4px;
                    background-color: $primary-color;
                    @include no-wrap;
                  }
                }
              }
            }
          }
        }
      }

      .tech-loading {
        padding-top: 20px;
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
        border-bottom-right-radius: 13px;
        border-top-left-radius: 13px;
        max-width: 100%;
        text-align: right;
        font-size: $font-size-large-x;
        color: #fff;
        padding: 10px;
        background-color: $primary-color;
        @include no-wrap;
      }

      .icon {
        position: absolute;
        top: 0;
        left: 0;
        width: 50px;
        height: 50px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 20px;
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
