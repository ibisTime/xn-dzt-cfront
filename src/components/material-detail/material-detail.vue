<template>
  <transition name="slide">
    <div class="material-detail-wrapper">
      <scroll class="scroll-wrapper" ref="scroll">
        <div>
          <div class="table-wrapper">
            <table>
              <tbody>
              <tr>
                <th>品牌</th>
                <td>{{currentMaterial && currentMaterial.brand || '--'}}</td>
              </tr>
              <tr>
                <th>分类</th>
                <td>{{currentMaterial && currentMaterial._type || '--'}}</td>
              </tr>
              <tr>
                <th>标号</th>
                <td>{{currentMaterial && currentMaterial.modelNum || '--'}}</td>
              </tr>
              <tr>
                <th>成份</th>
                <td>{{currentMaterial && currentMaterial._form || '--'}}</td>
              </tr>
              <tr>
                <th>纱支</th>
                <td>{{currentMaterial && currentMaterial._yarn || '--'}}</td>
              </tr>
              <tr>
                <th>克重</th>
                <td>{{currentMaterial && currentMaterial.weight || '--'}}</td>
              </tr>
              <tr>
                <th>色系</th>
                <td>{{currentMaterial && currentMaterial._color || '--'}}</td>
              </tr>
              <tr>
                <th>花色</th>
                <td>{{currentMaterial && currentMaterial._flowers || '--'}}</td>
              </tr>
              <tr>
                <th>产地</th>
                <td>{{currentMaterial && currentMaterial.area || '--'}}</td>
              </tr>
              </tbody>
            </table>
            <i class="like" :class="{active:isSC,needsclick:true}" @click="handleCollect"></i>
          </div>
          <div v-if="currentMaterial" class="description" ref="description">
            <img v-for="item in currentMaterial._advPic" width="100%" :src="item | formatImg" />
          </div>
        </div>
      </scroll>
      <div class="footer">
        <button :disabled="disabled" v-show="curBtn==='bookBtn'" class="f-btn btn-yy" @click="_book">提交预约</button>
        <button :disabled="disabled" v-show="curBtn==='cancelBtn'" class="f-btn btn-cancel" @click="_cancel">取消预约</button>
        <button :disabled="disabled" v-show="curBtn==='reBtn'" class="f-btn btn-fg" @click="_reBook">一键复购</button>
      </div>
      <div v-show="loading" class="loading-container">
        <div class="loading-wrapper">
          <loading></loading>
        </div>
      </div>
      <model-book v-if="latestOrder"
                  ref="modelBook"
                  :latestOrder="latestOrder"
                  :productCode="$route.params.id"
                  @bookSuc="handleBook"
                  @bookCancel="handleCancelBook"></model-book>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import {commonMixin} from 'common/js/mixin';
  import {initShare} from 'common/js/weixin';
  import {getShareImg, setTitle} from 'common/js/util';
  import {mapGetters, mapMutations} from 'vuex';
  import {getMaterial, collection, cancelCollection, getLatestOrder} from 'api/biz';
  import {getDictList} from 'api/general';
  import {SET_CURRENT_MATERIAL} from 'store/mutation-types';
  import ModelBook from 'components/model-book/model-book';

  export default {
    mixins: [commonMixin],
    data() {
      return {
        isOrder: false,
        isSC: false,
        loading: true,
        disabled: false,
        latestOrder: null,
        curBtn: 'bookBtn'
      };
    },
    created() {
      setTitle('面料详情');
      if (!this.currentMaterial) {
        Promise.all([
          this.getInitData(),
          this._getLatestOrder()
        ]).then(() => {
          this._refreshScroll();
          this.loading = false;
        });
      } else {
        this._refreshScroll();
        Promise.all([
          this.getMaterial(),
          this._getLatestOrder()
        ]).then(() => {
          this.loading = false;
        });
      }
    },
    computed: {
      ...mapGetters([
        'currentMaterial'
      ])
    },
    methods: {
      getInitData() {
        return Promise.all([
          this.getMaterial(),
          this.getFabricTypeDict(),
          this.getFabricColorDict(),
          this.getFabricDesignDict(),
          this.getFabricDivideDict(),
          this.getFabricYarnDict()
        ]).then(([material, typeList, colorList, designList, divideList, yarnList]) => {
          let index = typeList.findIndex((item) => {
            return item.dkey === material.type;
          });
          material._type = typeList[index].dvalue;

          index = colorList.findIndex((item) => {
            return item.dkey === material.color;
          });
          material._color = colorList[index].dvalue;

          index = designList.findIndex((item) => {
            return item.dkey === material.flowers;
          });
          material._flowers = designList[index].dvalue;

          index = divideList.findIndex((item) => {
            return item.dkey === material.form;
          });
          material._form = divideList[index].dvalue;

          index = yarnList.findIndex((yarn) => {
            return yarn.dkey === material.yarn;
          });
          material._yarn = yarnList[index].dvalue;

          material._advPic = material.advPic.split('||');

          this.setCurMaterial(material);
        }).catch(() => {});
      },
      getMaterial() {
        return getMaterial(this.$route.params.id).then((data) => {
          if (data.isSC === '1') {
            this.isSC = true;
          }
          data = data.cloth;
          initShare({
            title: document.title,
            desc: '合衣定制',
            link: location.href,
            imgUrl: getShareImg(data.pic)
          });
          return data;
        });
      },
      _getLatestOrder() {
        return getLatestOrder().then((data) => {
          this.latestOrder = data;
          if (data.order) {
            if (data.order.status === '1' || data.order.status === '2') {
              this.curBtn = 'cancelBtn';
            } else if (data.order.status !== '11') {
              this.curBtn = 'reBtn';
            }
          }
        });
      },
      // 面料类型数据字典
      getFabricTypeDict() {
        return getDictList('fabric_type');
      },
      // 色系数据字典
      getFabricColorDict() {
        return getDictList('fabric_color');
      },
      // 花色数据字典
      getFabricDesignDict() {
        return getDictList('fabric_design');
      },
      // 成份数据字典
      getFabricDivideDict() {
        return getDictList('fabric_divide');
      },
      // 纱支数据字典
      getFabricYarnDict() {
        return getDictList('fabric_yarn');
      },
      handleCollect(event) {
        if (!event._constructed) {
          return;
        }
        if (this.isSC) {
          this.isSC = false;
          cancelCollection(this.$route.params.id).then(() => {
            this.$emit('update', this.currentMaterial, false);
          }).catch(() => {
            this.isSC = true;
          });
        } else {
          this.isSC = true;
          collection(this.$route.params.id).then(() => {
            this.$emit('update', this.currentMaterial, true);
          }).catch(() => {
            this.isSC = false;
          });
        }
      },
      _book() {
        this.$refs.modelBook.show();
      },
      _cancel() {
        this.$refs.modelBook.show();
      },
      _reBook() {
        this.$refs.modelBook.show();
      },
      handleBook(code) {
        this.curBtn = 'cancelBtn';
      },
      handleCancelBook(order, curBtn) {
        this.latestOrder = order;
        this.curBtn = curBtn;
      },
      _refreshScroll() {
        setTimeout(() => {
          let imgs = this.$refs.description.getElementsByTagName('img');
          for (let i = 0; i < imgs.length; i++) {
            let _img = imgs[i];
            if (_img.complete) {
              setTimeout(() => {
                this.$refs.scroll.refresh();
              }, 20);
              continue;
            }
            _img.onload = () => {
              setTimeout(() => {
                this.$refs.scroll.refresh();
              }, 20);
            };
          }
        }, 20);
      },
      ...mapMutations({
        setCurMaterial: SET_CURRENT_MATERIAL
      })
    },
    components: {
      Scroll,
      Loading,
      ModelBook
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/mixin";
  @import "~common/scss/variable";

  .material-detail-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    z-index: 101;

    .scroll-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      bottom: 64px;
    }

    .table-wrapper {
      padding: 9.5px 0 13.5px;

      table {
        margin: 0 auto;

        tr {
          line-height: 25px;

          th {
            padding-right: 16px;
            color: $primary-color;
            font-size: $font-size-medium;
          }

          td {
            color: #333;
            font-size: $font-size-medium;
          }
        }
      }

      .like {
        position: absolute;
        right: 0;
        top: 0;
        width: 40px;
        height: 40px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 20px;
        @include bg-image('like');

        &.active {
          @include bg-image('like-act');
        }
      }
    }

    .description {
      padding: 20px;

      img {
        max-width: 100%;
      }
    }

    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 64px;
      display: flex;
      align-items: center;
      background: #fff;

      .f-btn {
        flex: 1;
        margin: 0 19px;
        padding: 0;
        height: 40px;
        line-height: 40px;
        border-radius: 6px;
        font-size: $font-size-medium-x;
        color: #fff;

        &.btn-yy {
          background: $primary-color;
        }

        &.btn-fg {
          background: rgb(167, 149, 47);
        }

        &.btn-cancel {
          background: $color-cancel-background;
        }

        &[disabled] {
          background-color: $color-disable-background;
        }
      }
    }

    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);

      .loading-wrapper {
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translate3d(0, -50%, 0);
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
