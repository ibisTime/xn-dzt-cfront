<template>
  <div class="category" ref="category">
    <div class="category-group" ref="categoryGroup">
      <div
        v-for="(item, index) in categorys"
        :key="index"
        ref="cate"
        @click="_selectItem(index)"
        class="category-item"
        :class="{active: index === currentIndex}">
        {{item.value}}
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll';

  export default {
    props: {
      categorys: {
        type: Array,
        default: []
      },
      currentIndex: {
        type: Number,
        default: 0
      }
    },
    mounted() {
      setTimeout(() => {
        this._setSliderWidth();
        this._initSlider();
      }, 20);

      window.addEventListener('resize', () => {
        if(!this.scroll) {
          return;
        }
        this._setSliderWidth();
      });
    },
    methods: {
      _selectItem(index) {
        this.scroll.scrollToElement(this.$refs.cate[index], 200, true);
        this.$emit('select', index);
      },
      scrollToEleByIndex(index) {
        this.scroll.scrollToElement(this.$refs.cate[index], 200, true);
      },
      _setSliderWidth() {
        let width = 0;
        let cates = this.$refs.cate;
        for(let i = 0; i < this.categorys.length; i++) {
          width += cates[i].clientWidth;
        }
        this.$refs.categoryGroup.style.width = width + 1 + 'px';
        if (this.scroll) {
          setTimeout(() => {
            this.scroll.refresh();
          }, 20);
        }
      },
      _initSlider() {
        this.scroll = new BScroll(this.$refs.category, {
          scrollX: true,
          scrollY: false
        });
      }
    },
    watch: {
      categorys() {
        this._setSliderWidth();
      }
    }
  };
</script>

<style scoped lang="scss">
  @import "~common/scss/variable";

  .category {
    min-height: 1px;

    .category-group {
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      color: #fff;
      background: $primary-color;

      .category-item {
        float: left;
        text-align: center;
        font-size: $font-size-medium;
        padding: 0 10px;

        &.active {
          color: rgb(178,160,46);
        }
      }
    }
  }
</style>
