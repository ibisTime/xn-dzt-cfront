<template>
  <transition name="slide">
    <div class="technology-wrapper">
      <div class="category-wrapper">
        <category-scroll :currentIndex="currentIndex"
                         :categorys="categorys"
                         @select="selectCategory"
                         ref="categoryScroll"></category-scroll>
      </div>
      <scroll ref="scroll" :data="techList.categorys" class="technology-content">
        <div>
          <ul class="tech-content">
            <li v-for="(item, index) in techList.categorys" class="tech-item" :key="index">
              <div class="head">{{typeList[item].dvalue}}</div>
              <ul class="clearfix">
                <li v-for="tech in techList[item]" :key="tech.code" class="needsclick" @click="selectItem(tech)">
                  <div class="inner">
                    <div class="inner-content">
                      <img v-lazy="formatImg(tech.pic)"/>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
            <loading class="tech-loading" v-show="loadingFlag" title=""></loading>
          </ul>
        </div>
        <div v-show="!loadingFlag && !techList.categorys.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无相关工艺"></no-result>
        </div>
      </scroll>
      <modal ref="modal">
        <div class="modal-wrap">
          <img :src="formatImg(currentItem && currentItem.pic)"/>
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
  import {getTechnologyList, getTechnology, collection, cancelCollection, getProductList, getTechTypeList} from 'api/biz';

  export default {
    data() {
      return {
        techMapData: {},
        currentIndex: 0,
        categorys: [],
        techList: {
          categorys: []
        },
        hasMore: true,
        currentLike: false,
        currentItem: null,
        loadingFlag: true
      };
    },
    created() {
      this.typeList = {};
      setTitle('精致工艺');
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
          this.getProductList(),
          this.getTypeList()
        ]).then(() => {
          this.getTechnologyList(this.categorys[0].key);
        }).catch(() => {
          this.loadingFlag = false;
        });
      },
      getProductList() {
        return getProductList().then((data) => {
          let _arr = [];
          data.forEach((item) => {
            if (item.kind === '0') {
              _arr.push({
                key: item.code,
                value: item.name + '工艺'
              });
            }
          });
          this.categorys = _arr;
        });
      },
      getTypeList() {
        return getTechTypeList().then((data) => {
          data.forEach((item) => {
            this.typeList[item.dkey] = item;
          });
          console.log(this.typeList);
        });
      },
      getTechnologyList() {
        let modelCode = this.categorys[this.currentIndex].key;
        if (this.techMapData[modelCode]) {
          this.techList = this.techMapData[modelCode];
        } else {
          this.loadingFlag = true;
          this.techList = [];
          getTechnologyList(modelCode).then((data) => {
            this.loadingFlag = false;
            let _list = {
              categorys: []
            };
            data.forEach((item) => {
              if (!_list[item.type]) {
                _list[item.type] = [];
                _list.categorys.push(item.type);
              }
              _list[item.type].push(item);
            });
            this.techList = this.techMapData[modelCode] = _list;
          }).catch(() => {
            this.loadingFlag = false;
            this.techList = this.techMapData[modelCode] = [];
          });
        }
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
        this.getTechnologyList();
        this.$refs.scroll.scrollTo(0, 0);
      }
    },
    watch: {
      currentIndex(newIndex) {
        this.$refs.categoryScroll.scrollToEleByIndex(newIndex);
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
    z-index: 2;
    background: #f5f5f5;

    .category-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 100;
      overflow: hidden;
      height: 0.8rem;
      line-height: 0.8rem;
      background: $primary-color;
    }

    .technology-content {
      position: absolute;
      top: 0.8rem;
      left: 0;
      width: 100%;
      bottom: 0;
      background-color: #fff;

      .tech-content {
        padding: 0.2rem 0.28rem 0.2rem 0.38rem;

        .tech-item {
          .head {
            margin-top: 0.5rem;
            margin-bottom: 0.08rem;
            padding-left: 0.14rem;
            font-size: $font-size-medium;
          }
          ul {
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
