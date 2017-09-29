<template>
  <transition name="slide">
    <div class="material-wrapper">
      <div class="category-wrapper">
        <category-scroll :currentIndex="currentIndex"
                         :categorys="categorys"
                         @select="selectCategory"
                         ref="categoryScroll"></category-scroll>
      </div>
      <scroll ref="scroll" :data="currentList" class="material-content">
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
            <div class="cate-info">
              <div class="cate">
                <span>产地</span>
                <select v-model="area">
                  <option value="all">全部</option>
                  <option v-for="item in areaList" :value="item.dkey">{{item.dvalue}}</option>
                </select>
                <i class="arrow"></i>
              </div>
            </div>
            <!--<div class="form-item">-->
              <!--<div class="item-label">产地</div>-->
              <!--<div class="item-input-wrapper"><input type="text" placeholder="请输入面料产地" v-model="area" class="item-input"></div>-->
            <!--</div>-->
          </div>
          <ul class="clearfix">
            <li v-for="(item,index) in currentList" :key="index" class="needsclick" @click="selectItem(item)">
              <div class="inner">
                <div class="inner-content">
                  <img v-lazy="formatImg(item.pic)"/>
                </div>
              </div>
            </li>
            <loading class="material-loading" v-show="loadingFlag" title=""></loading>
          </ul>
        </div>
        <div v-show="!currentList.length && !loadingFlag" class="no-result-wrapper">
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
  import {getMaterialList, getProductList} from 'api/biz';
  import {getDictList} from 'api/general';
  import {mapMutations} from 'vuex';
  import {SET_CURRENT_MATERIAL} from 'store/mutation-types';

  export default {
    data() {
      return {
        currentIndex: 0,
        categorys: [],
        materialMapData: {},
        materialList: [],
        colorList: [],
        color: 'all',
        designList: [],
        design: 'all',
        divideList: [],
        divide: 'all',
        yarn: 'all',
        yarnList: [],
        area: 'all',
        areaList: [],
        fetching: false,
        loadingFlag: true
      };
    },
    created() {
      this.fabricTypeList = [];
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
        return this.materialList.filter((item) => {
          let colorFlag = this.color === 'all' ? true : this.color === item.color;
          let flowersFlag = this.design === 'all' ? true : this.design === item.flowers;
          let formFlag = this.divide === 'all' ? true : this.divide === item.form;
          let yarnFlag = this.yarn === 'all' ? true : this.yarn === item.yarn;
          let areaFlag = this.area === 'all' ? true : this.area === item.area;
          return colorFlag && flowersFlag && formFlag && yarnFlag && areaFlag;
        });
      }
    },
    methods: {
      shouldGetData() {
        if (this.$route.path === '/home/material') {
          setTitle('高端面料');
          // 当前页面,并且微信sdk未初始化
          if(!this.isWxConfiging && !this.wxData && !this.loadingFlag) {
            this.getInitWXSDKConfig();
          }
          if (this.loadingFlag && !this.materialList.length) {
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
            this.getProductList(),
            this.getFabricTypeDict(),
            this.getFabricColorDict(),
            this.getFabricDesignDict(),
            this.getFabricDivideDict(),
            this.getFabricYarnDict(),
            this.getAreaDict()
          ]).then(() => {
            this.getMaterialList();
          }).catch(() => {
            this.loadingFlag = false;
            this.fetching = false;
          });
          this.getInitWXSDKConfig();
        }
      },
      getProductList() {
        return getProductList().then((data) => {
          let _arr = [];
          data.forEach((item) => {
            if (item.kind === '0') {
              _arr.push({
                key: item.code,
                value: item.name + '面料'
              });
            }
          });
          this.categorys = _arr;
        });
      },
      getMaterialList() {
        let modelCode = this.categorys[this.currentIndex].key;
        if (this.materialMapData[modelCode]) {
          this.materialList = this.materialMapData[modelCode];
          this.loadingFlag = false;
          this.fetching = false;
        } else {
          this.loadingFlag = true;
          this.fetching = true;
          this.materialList = [];
          return getMaterialList(modelCode).then((data) => {
            this.fetching = false;
            this.loadingFlag = false;
            this.materialList = this.materialMapData[modelCode] = data;
          }).catch(() => {
            this.loadingFlag = false;
            this.fetching = false;
          });
        }
      },
      // 面料类型数据字典
      getFabricTypeDict() {
        return getDictList('fabric_type').then((data) => {
          this.fabricTypeList = data;
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
      // 产地数据字典
      getAreaDict() {
        return getDictList('produce_area').then((data) => {
          this.areaList = data;
        });
      },
      formatImg(img) {
        return formatImg(img);
      },
      selectCategory(index) {
        this.currentIndex = index;
        this.getMaterialList();
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

          index = this.fabricTypeList.findIndex((cate) => {
            return cate.dkey === item.type;
          });
          item._type = this.fabricTypeList[index].dvalue;

          index = this.areaList.findIndex((area) => {
            return area.dkey === item.area;
          });
          item._area = this.areaList[index].dvalue;

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
      height: 0.8rem;
      line-height: 0.8rem;
      background: $primary-color;
    }

    .material-content {
      position: absolute;
      top: 0.8rem;
      left: 0;
      bottom: 0;
      width: 100%;
      padding: 0 0.38rem 0.2rem;

      .cate-infos {
        padding: 0.4rem 0;

        .cate-info {
          float: left;
          width: 50%;
          margin-bottom: 0.2rem;

          &:nth-child(2n+1) {
            padding-left: 0.2rem;
            padding-right: 0.2rem;
          }

          &:nth-child(2n) {
            padding-left: 0.4rem;
          }

          .cate {
            position: relative;
            display: flex;
            align-items: center;
            font-size: $font-size-medium;

            span {
              padding-right: 0.28rem;
            }

            select {
              flex: 1;
              padding: 0.12rem;
              border-radius: 0.12rem;
              border: 1px solid #9d9d9d;
              font-size: $font-size-medium;
              color: #4d4d4d;
              background: #eee;
            }

            .arrow {
              position: absolute;
              right: 0.24rem;
              background-position: center;
              background-repeat: no-repeat;
              background-size: contain;
              @include bg-image('arrow');
              width: 0.3rem;
              height: 0.3rem;
              top: 50%;
              transform: translate(0, -50%);
            }
          }
        }

        .form-item {
          display: flex;
          align-items: center;
          position: relative;
          padding-left: 0.2rem;
          font-size: 0.28rem;

          .item-label {
            padding-right: 0.28rem;
          }

          .item-input-wrapper {
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;
            height: 0.8rem;
            border: 1px solid #9d9d9d;
            border-radius: 0.16rem;
            padding: 0 0.16rem;
            background: #eee;
            min-width: 2.56rem;

            .item-input {
              flex: 1;
              line-height: 1.6;
              background: transparent;
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
          border-radius: 0.16rem;

          &:nth-child(2n+1) {
            .inner {
              padding-right: 0.2rem;
            }
          }

          &:nth-child(2n) {
            .inner {
              padding-left: 0.2rem;
            }
          }

          .inner {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding-bottom: 0.34rem;

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
        padding-top: 0.4rem;
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
