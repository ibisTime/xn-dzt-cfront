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
              </tbody>
            </table>
            <i class="like" :class="{active:isSC}" @click="handleCollect"></i>
          </div>
          <div v-if="currentMaterial" class="description" ref="description">
            <img v-for="item in currentMaterial._advPic" width="100%" :src="item | formatImg" />
          </div>
        </div>
      </scroll>
      <div class="footer">
        <button class="f-btn btn-yy" v-show="!isOrder" @click="_book">立即预约</button>
        <button class="f-btn btn-fg" :disabled="disabled" v-show="isOrder" @click="_reBook">一键复购</button>
      </div>
      <div v-show="loading" class="loading-container">
        <div class="loading-wrapper">
          <loading></loading>
        </div>
      </div>
      <toast ref="toast" text="一键复购成功"></toast>
      <model-book ref="modelBook" :productCode="$route.params.id"></model-book>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import Toast from 'base/toast/toast';
  import {commonMixin} from 'common/js/mixin';
  import {initShare} from 'common/js/weixin';
  import {getShareImg, setTitle} from 'common/js/util';
  import {mapGetters, mapMutations} from 'vuex';
  import {getMaterial, collection, cancelCollection, reBook} from 'api/biz';
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
        disabled: false
      };
    },
    created() {
      setTitle('面料详情');
      if (!this.currentMaterial) {
        this.getInitData();
      } else {
        this.getMaterial().then(() => {
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
        Promise.all([
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
          this.loading = false;
        }).catch(() => {});
      },
      getMaterial() {
        return getMaterial(this.$route.params.id).then((data) => {
          if (data.isOrder === '1') {
            this.isOrder = true;
          }
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
      handleCollect() {
        if (this.isSC) {
          this.isSC = false;
          cancelCollection(this.$route.params.id).catch(() => {
            this.isSC = true;
          });
        } else {
          this.isSC = true;
          collection(this.$route.params.id).catch(() => {
            this.isSC = false;
          });
        }
      },
      _book() {
        this.$refs.modelBook.show();
      },
      _reBook() {
        this.disabled = true;
        reBook(this.$route.params.id).then((data) => {
          this.disabled = false;
          this.$refs.toast.show();
        }).catch(() => {
          this.disabled = false;
        });
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
    watch: {
      currentMaterial() {
        this._refreshScroll();
      }
    },
    components: {
      Scroll,
      Loading,
      ModelBook,
      Toast
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
