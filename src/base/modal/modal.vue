<template>
  <transition name="modal-fade">
    <div class="modal" v-show="showFlag" @click.stop>
      <div class="modal-wrapper">
        <div class="modal-content">
          <div class="close" @click="hide"></div>
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

  .modal {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 998;
    background-color: $color-background-d;

    &.modal-fade-enter-active {
      animation: modal-fadein 0.3s;
      .modal-content {
        animation: modal-zoom 0.3s;
      }
    }

    .modal-wrapper {
      position: absolute;
      top: 50%;
      left: 5%;
      transform: translateY(-50%);
      width: 90%;
      height: 0;
      padding-top: 80%;
      z-index: 999;

      .modal-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 13px;
        background: $color-highlight-background;

        .close {
          position: absolute;
          top: 0;
          right: 0;
          width: 50px;
          height: 50px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: 20px;
          @include bg-image('close');
        }
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
