<template>
  <transition name="slide">
    <div class="material-wrapper">
      <scroll :data="materialList" :pullup="pullup" @scrollToEnd="getPageMaterials" class="material-content">
        <div>
          <ul class="clearfix">
            <li v-for="(item, index) in materialList" class="needsclick" :key="index" @click="selectItem(item,index)">
              <div class="inner">
                <div class="inner-content">
                  <img v-lazy="formatImg(item.cloth.pic)"/>
                </div>
              </div>
            </li>
            <loading class="material-loading" v-show="hasMore" title=""></loading>
          </ul>
        </div>
        <div v-show="!hasMore && !materialList.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无收藏的面料"></no-result>
        </div>
      </scroll>
      <router-view @update="handleUpdate"></router-view>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import NoResult from 'base/no-result/no-result';
  import Loading from 'base/loading/loading';
  import {formatImg, setTitle} from 'common/js/util';
  import {getPageCollections} from 'api/biz';
  import {mapMutations} from 'vuex';
  import {SET_CURRENT_MATERIAL} from 'store/mutation-types';

  const LIMIT = 20;

  export default {
    data() {
      return {
        materialList: [],
        hasMore: true,
        start: 1
      };
    },
    created() {
      this.pullup = true;
      if (this.shouldGetData()) {
        this.getPageMaterials();
      }
    },
    methods: {
      shouldGetData() {
        if (this.$route.path === '/user/collection/material') {
          setTitle('面料列表');
          if (this.hasMore && !this.materialList.length) {
            return true;
          }
          return false;
        }
        return false;
      },
      getPageMaterials() {
        if (this.hasMore) {
          getPageCollections(this.start, LIMIT, 3).then((data) => {
            if (data.totalCount <= LIMIT || data.list.length < LIMIT) {
              this.hasMore = false;
            }
            this.start++;
            this.materialList = this.materialList.concat(data.list);
          }).catch(() => {
            this.hasMore = false;
          });
        }
      },
      selectItem(item, index) {
        this.curCode = item.code;
        this.curIndex = index;
        this.setCurMaterial(null);
        this.$router.push(`/user/collection/material/${item.cloth.code}`);
      },
      handleUpdate(item, isSC) {
        if (this.curCode) {
          let _curItem = this.materialList[this.curIndex];
          if (isSC) {
            if (!_curItem || _curItem.cloth.code !== item.code) {
              this.materialList.splice(this.curIndex, 0, {
                cloth: item,
                code: this.curCode
              });
            }
          } else {
            if (_curItem.cloth.code === item.code) {
              this.materialList.splice(this.curIndex, 1);
            }
          }
        }
      },
      formatImg(img) {
        return formatImg(img);
      },
      ...mapMutations({
        'setCurMaterial': SET_CURRENT_MATERIAL
      })
    },
    updated() {
      if (this.shouldGetData()) {
        this.getPageMaterials();
      }
    },
    components: {
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

    .material-content {
      height: 100%;
      padding: 0.4rem;

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
