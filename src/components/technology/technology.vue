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
              :data="techList"
              :scrollEnd="scrollEnd"
              @scrollToEnd="scrollToEnd"
              class="technology-content">
        <div>
          <ul>
            <li v-for="(item, index) in techList" ref="techCate" :key="index">
              <p>ifsfs</p>
              <p>ifsfs</p>
              <p>ifsfs</p>
              <p>ifsfs</p>
              <p>ifsfs</p>
              <hr/>
              <ul>
                <li>
                  <p>aaaaa</p>
                  <p>aaaaa</p>
                  <p>aaaaa</p>
                  <p>aaaaa</p>
                  <p>aaaaa</p>
                  <hr/>
                </li>
                <li>
                  <p>aaaaa</p>
                  <p>aaaaa</p>
                  <p>aaaaa</p>
                  <p>aaaaa</p>
                  <p>aaaaa</p>
                  <hr/>
                </li>
              </ul>
            </li>
            <loading class="tech-loading" v-show="hasMore" title=""></loading>
          </ul>
        </div>
        <div v-show="!hasMore && !techList.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无相关工艺"></no-result>
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
        scrollY: -1,
        categorys: CATEGORYS,
        techList: [1, 2, 3, 4, 5, 6, 7, 8],
        hasMore: true,
        isScrolling: false,
        scrollEnd: true
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
    mounted() {
      setTimeout(() => {
        this._calculateHeight();
      }, 20);
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

      li {
        padding: 30px;
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
  }
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
