<template>
  <transition name="confirm-fade">
    <div class="loading-module-cont" v-show="showFlag">
      <span class="loading-module-text">{{text}}</span>
    </div>
  </transition>
</template>
<script>
export default {
  props: {
    text: {
      type: String,
      default: ''
    },
    delay: {
      type: Number,
      default: 1500
    }
  },
  data() {
    return {
      showFlag: false
    };
  },
  methods: {
    show() {
      if(this.timer) {
        clearTimeout(this.timer);
      }
      this.showFlag = true;
      this.timer = setTimeout(() => {
        this.showFlag = false;
      }, this.delay);
    },
    hide() {
      this.showFlag = false;
    }
  }
};
</script>
<style lang="scss" scoped>
  .loading-module-cont {
    min-width: 60px;
    border-radius: 4px;
    color: #fff;
    background-color: rgba(58,58,58,.9);
    line-height: 1.5;
    padding: 9px 15px;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    max-width: 50%;
    z-index: 998;

    &.toast-fade-enter-active {
      animation: toast-fadein 0.3s;
      .toast-content {
        animation: toast-zoom 0.3s;
      }
    }

    .loading-module-text{
      font-size: 14px;
    }
  }
  @keyframes toast-fadein {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes toast-zoom {
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
