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
          <ul>
            <li v-for="(item, index) in materialList" :key="index">
              <p>ifsfs</p>
              <p>ifsfs</p>
              <p>ifsfs</p>
              <p>ifsfs</p>
              <p>ifsfs</p>
              <hr/>
            </li>
            <loading class="material-loading" v-show="hasMore" title=""></loading>
          </ul>
        </div>
        <div v-show="!hasMore && !materialList.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无相关面料"></no-result>
        </div>
      </scroll>
    </div>
  </transition>
</template>
<script>
  import CategoryScroll from 'base/category-scroll/category-scroll';
  import Scroll from 'base/scroll/scroll';
  import NoResult from 'base/no-result/no-result';
  import Loading from 'base/loading/loading';

  const CATEGORYS = [{
    key: 'all',
    value: '全部订单'
  }, {
    key: '0',
    value: '待量体'
  }, {
    key: '1',
    value: '已定价'
  }, {
    key: '2',
    value: '待提交'
  }, {
    key: '3',
    value: '待复核'
  }, {
    key: '4',
    value: '待生产'
  }, {
    key: '5',
    value: '生产中'
  }, {
    key: '6',
    value: '已发货'
  }];

  export default {
    data() {
      return {
        currentIndex: 0,
        categorys: CATEGORYS,
        materialList: [1, 2, 3, 4, 5, 6, 7, 8],
        hasMore: true
      };
    },
    created() {
      this.probeType = 3;
      this.listenScroll = true;
      this.listHeight = [];
      this.getTechList();
    },
    methods: {
      getTechList() {},
      selectCategory(index) {
        this.currentIndex = index;
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

  .material-wrapper {
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

    .material-content {
      position: absolute;
      top: 40px;
      left: 0;
      width: 100%;
      bottom: 0;

      li {
        padding: 30px;
      }

      .material-loading {
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
