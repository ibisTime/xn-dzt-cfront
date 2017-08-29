<template>
  <transition name="chosen-fade">
    <div class="chosen" v-show="showFlag" @click.stop="hide">
      <div class="chosen-wrapper">
        <div class="chosen-content" ref="choseGroup">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  export default {
    data() {
      return {
        showFlag: false
      };
    },
    methods: {
      show() {
        this.showFlag = true;
      },
      hide() {
        this.showFlag = false;
      }
    }
  };
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .chosen {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 998;
    background-color: $color-background-d;

    &.chosen-fade-enter-active {
      animation: modal-fadein 0.3s;
      .chosen-content {
        animation: modal-zoom 0.3s;
      }
    }

    .chosen-wrapper {
      position: absolute;
      top: 50%;
      left: 15%;
      transform: translateY(-50%);
      width: 70%;
      z-index: 999;

      .chosen-content {
        border-radius: 6px;
        background: $color-highlight-background;
      }
    }
  }
  @keyframes modal-fadein {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes modal-zoom {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
