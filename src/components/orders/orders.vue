<template>
  <transition name="slide">
    <div class="orders-wrapper">
      <div class="category-wrapper">
        <category-scroll :currentIndex="currentIndex" :categorys="categorys" @select="selectCategory"></category-scroll>
      </div>
      <scroll ref="scroll"
              :data="currentList.data"
              :pullup="pullup"
              @scrollToEnd="getPageOrders"
              class="orders-content">
        <div>
          <ul v-if="currentList">
            <li v-for="(item, index) in currentList.data" :key="index">
              <p>ifsfs</p>
              <p>ifsfs</p>
              <p>ifsfs</p>
              <p>ifsfs</p>
              <p>ifsfs</p>
              <hr/>
            </li>
            <loading class="orders-loading" v-show="currentList.hasMore" title=""></loading>
          </ul>
        </div>
        <div v-show="!currentList.hasMore && !(currentList.data && currentList.data.length)" class="no-result-wrapper">
          <no-result title="抱歉，暂无订单"></no-result>
        </div>
      </scroll>
    </div>
  </transition>
</template>
<script>
  import {CATEGORYS, LIMIT} from './config';
  import CategoryScroll from 'base/category-scroll/category-scroll';
  import Scroll from 'base/scroll/scroll';
  import NoResult from 'base/no-result/no-result';
  import Loading from 'base/loading/loading';
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_ORDER_LIST} from 'store/mutation-types';

  export default {
    data() {
      return {
        pullup: true,
        categorys: CATEGORYS,
        currentIndex: +this.$route.query.index || 0
      };
    },
    created() {
      // 清除缓存的订单列表数据
      this.setOrderList({});
      this.getPageOrders();
    },
    computed: {
      currentList() {
        let _curListObj = this.orderList[this.categorys[this.currentIndex].key];
        if (!_curListObj) {
          _curListObj = {
            start: 1,
            limit: LIMIT,
            hasMore: true,
            data: []
          };
        }
        return _curListObj;
      },
      ...mapGetters(['orderList'])
    },
    methods: {
      getPageOrders() {
        let orders = this.currentList.data.concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        let _currentList = {
          ...this.currentList
        };
        _currentList.data = orders;
        let _orderList = {
          ...this.orderList,
          [this.categorys[this.currentIndex]['key']]: _currentList
        };
        this.setOrderList(_orderList);
      },
      selectCategory(index) {
        this.currentIndex = index;
        this.$refs.scroll.scrollTo(0, 0);
        if (!this.currentList.data.length && this.currentList.hasMore) {
          this.getPageOrders();
        }
      },
      ...mapMutations({
        'setOrderList': SET_ORDER_LIST
      })
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

  .orders-wrapper {
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

    .orders-content {
      position: absolute;
      top: 40px;
      left: 0;
      width: 100%;
      bottom: 0;

      li {
        padding: 30px;
      }

      .orders-loading {
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
