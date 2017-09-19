<template>
  <transition name="opacity">
    <div v-show="showFlag" ref="wrapper" class="clip-wrapper">
      <img class="origin" :src="imgSrc"/>
      <img ref="clipImg" :src="imgSrc"/>
      <div ref="clipBox"
           class="clip-box"
           @touchstart="handleTouchStart"
           @touchmove.stop.prevent="handleTouchMove"></div>
      <div class="bottom">
        <span class="cancel" @click.stop="hide">取消</span><span class="chose" @click.stop="choseImg">完成</span>
      </div>
    </div>
  </transition>
</template>
<script>
  export default {
    props: {
      imgUrl: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        showFlag: false
      };
    },
    computed: {
      imgSrc() {
        let index = this.imgUrl.indexOf('?imageMogr2');
        let url = this.imgUrl;
        if(index !== -1) {
          url = this.imgUrl.substr(0, index);
        }
        return url;
      }
    },
    created() {
      this.touch = {};
      this.maxTop = 0;
      this.minTop = 0;
      this.clipX = 0;
      this.clipY = 0;
    },
    methods: {
      show() {
        this.showFlag = true;
        setTimeout(() => {
          this.$refs.clipBox.style.top = (this.$refs.wrapper.offsetHeight - this.$refs.clipBox.offsetHeight) / 2 + 'px';
          setTimeout(() => {
            let top = this.$refs.clipBox.offsetTop;
            let right = this.$refs.clipBox.offsetWidth;
            let bottom = this.$refs.clipBox.offsetHeight + top;
            if (this.$refs.clipImg.offsetHeight < this.$refs.clipBox.offsetHeight) {
              this.maxTop = (this.$refs.wrapper.offsetHeight - this.$refs.clipImg.offsetHeight) / 2;
              this.minTop = this.maxTop - (this.$refs.clipBox.offsetHeight - this.$refs.clipImg.offsetHeight);
              top = 0;
              bottom = this.$refs.clipImg.offsetHeight;
            } else {
              this.minTop = (this.$refs.wrapper.offsetHeight - this.$refs.clipImg.offsetHeight) / 2;
              this.maxTop = this.minTop + this.$refs.clipImg.offsetHeight - this.$refs.clipBox.offsetHeight;
              top -= (this.$refs.wrapper.offsetHeight - this.$refs.clipImg.offsetHeight) / 2;
              bottom -= (this.$refs.wrapper.offsetHeight - this.$refs.clipImg.offsetHeight) / 2;
            }
            this.$refs.clipImg.style.clip = `rect(${top}px,${right}px,${bottom}px,0)`;
          }, 20);
        }, 20);
      },
      hide() {
        this.showFlag = false;
      },
      handleTouchStart(e) {
        console.log('start');
        let firstTouch = e.touches[0];
        this.touch.y1 = firstTouch.pageY;
      },
      handleTouchMove(e) {
        let firstTouch = e.touches[0];
        this.touch.y2 = firstTouch.pageY;
        let delta = (this.touch.y2 - this.touch.y1) / 10;
        let origTop = Number.parseFloat(this.$refs.clipBox.style.top);
        let newTop = Math.min(this.maxTop, Math.max(this.minTop, origTop + delta));
        if (newTop === this.minTop || newTop === this.maxTop) {
          this.touch.y1 = this.touch.y2;
        }
        this.$refs.clipBox.style.top = newTop + 'px';
        let top = newTop;
        let right = this.$refs.clipBox.offsetWidth;
        let bottom = this.$refs.clipBox.offsetHeight + top;
        if (this.$refs.clipImg.offsetHeight < this.$refs.clipBox.offsetHeight) {
          top = 0;
          bottom = this.$refs.clipImg.offsetHeight;
        } else {
          top -= (this.$refs.wrapper.offsetHeight - this.$refs.clipImg.offsetHeight) / 2;
          bottom -= (this.$refs.wrapper.offsetHeight - this.$refs.clipImg.offsetHeight) / 2;
        }
        this.clipY = top;
        this.$refs.clipImg.style.clip = `rect(${top}px,${right}px,${bottom}px,0)`;
      },
      choseImg() {
        let outerHeight = this.$refs.clipImg.offsetHeight;
        let outerWidth = this.$refs.clipImg.offsetWidth;
        let width = outerWidth;
        let height = this.$refs.clipBox.offsetHeight;
        this.hide();
        this.$emit('choseImage', {
          outerWidth,
          outerHeight,
          width,
          height,
          x: this.clipX,
          y: this.clipY
        });
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .clip-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 200;
    background: #000;

    img {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      max-height: 100%;
      transform: translate(0, -50%);
      z-index: 2;

      &.origin {
        opacity: 0.7;
        z-index: 1;
      }
    }

    .clip-box {
      position: absolute;
      left: 1px;
      right: 1px;
      height: 0;
      padding-top: 100%;
      border: 1px solid #fff;
      z-index: 3;
    }

    .bottom {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 40px;
      line-height: 40px;
      font-weight: bold;
      background: rgba(0,0,0,0.4);
      z-index: 4;

      span {
        padding: 0 30px;
        font-size: $font-size-medium;
        color: #fff;

        &.chose {
          float: right;
        }
      }
    }
  }
  .opacity-enter-active, .opacity-leave-active {
    transition: all 0.3s;
  }

  .opacity-enter, .opacity-leave-to {
    opacity: 0;
  }
</style>
