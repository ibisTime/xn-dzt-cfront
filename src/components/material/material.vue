<template>
  <transition name="slide">
    <div class="material-wrapper">
      <div class="category-wrapper">
        <category-scroll :currentIndex="currentIndex"
                         :categorys="categorys"
                         @select="selectCategory"
                         ref="categoryScroll"></category-scroll>
      </div>
      <scroll ref="scroll" :data="materialList" class="material-content">
        <div>
          <div class="cate-infos clearfix">
            <div class="cate-info">
              <div class="cate">
                <span>色系</span>
                <select v-model="color">
                  <option value="all">全部</option>
                  <option v-for="item in colorList" :value="item.dkey">{{item.dvalue}}</option>
                </select>
                <i class="arrow"></i>
              </div>
            </div>
            <div class="cate-info">
              <div class="cate">
                <span>花色</span>
                <select v-model="design">
                  <option value="all">全部</option>
                  <option v-for="item in designList" :value="item.dkey">{{item.dvalue}}</option>
                </select>
                <i class="arrow"></i>
              </div>
            </div>
            <div class="cate-info">
              <div class="cate">
                <span>成份</span>
                <select v-model="divide">
                  <option value="all">全部</option>
                  <option v-for="item in divideList" :value="item.dkey">{{item.dvalue}}</option>
                </select>
                <i class="arrow"></i>
              </div>
            </div>
            <div class="cate-info">
              <div class="cate">
                <span>纱支</span>
                <select v-model="yarn">
                  <option value="all">全部</option>
                  <option v-for="item in yarnList" :value="item.dkey">{{item.dvalue}}</option>
                </select>
                <i class="arrow"></i>
              </div>
            </div>
          </div>
          <ul class="clearfix">
            <li v-for="(item, index) in currentList" :key="index" @click="selectItem(item)">
              <div class="inner">
                <div class="inner-content">
                  <img v-lazy="formatImg(item.pic)"/>
                </div>
              </div>
            </li>
            <loading class="material-loading" v-show="hasMore" title=""></loading>
          </ul>
        </div>
        <div v-show="!hasMore && !currentList.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无相关面料"></no-result>
        </div>
      </scroll>
      <router-view></router-view>
    </div>
  </transition>
</template>
<script>
  import CategoryScroll from 'base/category-scroll/category-scroll';
  import Scroll from 'base/scroll/scroll';
  import NoResult from 'base/no-result/no-result';
  import Loading from 'base/loading/loading';
  import {formatImg, setTitle, getShareImg} from 'common/js/util';
  import {initShare} from 'common/js/weixin';
  import {getMaterialList} from 'api/biz';
  import {getDictList} from 'api/general';
  import {mapMutations} from 'vuex';
  import {SET_CURRENT_MATERIAL} from 'store/mutation-types';

  export default {
    data() {
      return {
        currentIndex: 0,
        categorys: [{
          key: 'all',
          value: '全部'
        }],
        materialList: [],
        hasMore: true,
        colorList: [],
        color: 'all',
        designList: [],
        design: 'all',
        divideList: [],
        divide: 'all',
        yarn: 'all',
        yarnList: [],
        fetching: false
      };
    },
    created() {
      this.probeType = 3;
      this.listenScroll = true;
      this.listHeight = [];
      this.isWxConfiging = false;
      this.wxData = null;

      if (this.shouldGetData()) {
        this.getInitData();
      }
    },
    computed: {
      currentList() {
        if (!this.materialList.length) {
          return this.materialList;
        }
        let _type = this.categorys[this.currentIndex].key;
        return this.materialList.filter((item) => {
          let typeFlag = _type === 'all' ? true : item.type === _type;
          let colorFlag = this.color === 'all' ? true : this.color === item.color;
          let flowersFlag = this.design === 'all' ? true : this.design === item.flowers;
          let formFlag = this.divide === 'all' ? true : this.divide === item.form;
          let yarnFlag = this.yarn === 'all' ? true : this.yarn === item.yarn;
          return typeFlag && colorFlag && flowersFlag && formFlag && yarnFlag;
        });
      }
    },
    methods: {
      shouldGetData() {
        if (this.$route.path === '/home/material') {
          setTitle('高端面料');
          // 当前页面,并且微信sdk未初始化
          if(!this.isWxConfiging && !this.wxData && !this.hasMore) {
            this.getInitWXSDKConfig();
          }
          if (this.hasMore && !this.materialList.length) {
            return true;
          }
          return false;
        }
        this.isWxConfiging = false;
        this.wxData = null;
        return false;
      },
      getInitData() {
        if (!this.fetching) {
          this.fetching = true;
          Promise.all([
            this.getMaterialList(),
            this.getFabricTypeDict(),
            this.getFabricColorDict(),
            this.getFabricDesignDict(),
            this.getFabricDivideDict(),
            this.getFabricYarnDict()
          ]).then(() => {
            this.fetching = false;
            this.hasMore = false;
          }).catch(() => {
            this.fetching = false;
          });
          this.getInitWXSDKConfig();
        }
      },
      getMaterialList() {
        return getMaterialList().then((data) => {
          this.materialList = data;
        });
      },
      // 面料类型数据字典
      getFabricTypeDict() {
        return getDictList('fabric_type').then((data) => {
          let _arr = data.map((item) => {
            return {
              key: item.dkey,
              value: item.dvalue
            };
          });
          this.categorys = this.categorys.concat(_arr);
        });
      },
      // 色系数据字典
      getFabricColorDict() {
        return getDictList('fabric_color').then((data) => {
          this.colorList = data;
        });
      },
      // 花色数据字典
      getFabricDesignDict() {
        return getDictList('fabric_design').then((data) => {
          this.designList = data;
        });
      },
      // 成份数据字典
      getFabricDivideDict() {
        return getDictList('fabric_divide').then((data) => {
          this.divideList = data;
        });
      },
      // 纱支数据字典
      getFabricYarnDict() {
        return getDictList('fabric_yarn').then((data) => {
          this.yarnList = data;
        });
      },
      formatImg(img) {
        return formatImg(img);
      },
      selectCategory(index) {
        this.currentIndex = index;
        this.$refs.scroll.scrollTo(0, 0);
      },
      selectItem(item) {
        if (!item._color) {
          let index = this.colorList.findIndex((color) => {
            return color.dkey === item.color;
          });
          item._color = this.colorList[index].dvalue;

          index = this.designList.findIndex((flowers) => {
            return flowers.dkey === item.flowers;
          });
          item._flowers = this.designList[index].dvalue;

          index = this.divideList.findIndex((form) => {
            return form.dkey === item.form;
          });
          item._form = this.divideList[index].dvalue;

          index = this.yarnList.findIndex((yarn) => {
            return yarn.dkey === item.yarn;
          });
          item._yarn = this.yarnList[index].dvalue;

          index = this.categorys.findIndex((cate) => {
            return cate.key === item.type;
          });
          item._type = this.categorys[index].value;

          item._advPic = item.advPic.split('||');
        }

        this.setCurMaterial(item);
        this.$router.push(`/home/material/${item.code}`);
      },
      getInitWXSDKConfig() {
        this.isWxConfiging = true;
        initShare({
          title: document.title,
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
        setCurMaterial: SET_CURRENT_MATERIAL
      })
    },
    updated() {
      if (this.shouldGetData()) {
        this.getInitData();
      }
    },
    components: {
      CategoryScroll,
      Scroll,
      NoResult,
      Loading
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .material-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    background-color: #fff;

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

    .material-content {
      position: absolute;
      top: 40px;
      left: 0;
      bottom: 0;
      width: 100%;
      padding: 0 19px 10px;

      .cate-infos {
        padding: 20px 0;

        .cate-info {
          float: left;
          width: 50%;
          margin-bottom: 10px;

          &:nth-child(2n+1) {
            padding-left: 10px;
            padding-right: 10px;
          }

          &:nth-child(2n) {
            padding-left: 20px;
          }

          .cate {
            position: relative;
            display: flex;
            align-items: center;
            font-size: $font-size-medium;

            span {
              padding-right: 14px;
            }

            select {
              flex: 1;
              padding: 6px;
              border-radius: 6px;
              border: 1px solid #9d9d9d;
              font-size: $font-size-medium;
              color: #4d4d4d;
              background: #eee;
            }

            .arrow {
              position: absolute;
              right: 12px;
              background-position: center;
              background-repeat: no-repeat;
              background-size: contain;
              @include bg-image('arrow');
              width: 15px;
              height: 15px;
              top: 50%;
              transform: translate(0, -50%);
            }
          }
        }
      }

      ul {
        li {
          position: relative;
          float: left;
          width: 50%;
          height: 0;
          padding-top: 50%;
          border-radius: 8px;

          &:nth-child(2n+1) {
            .inner {
              padding-right: 10px;
            }
          }

          &:nth-child(2n) {
            .inner {
              padding-left: 10px;
            }
          }

          .inner {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding-bottom: 17px;

            .inner-content {
              width: 100%;
              height: 100%;

              img {
                width: 100%;
                height: 100%;
              }
            }
          }
        }
      }

      .material-loading {
        clear: both;
        padding-top: 20px;
      }

      .no-result-wrapper {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
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
