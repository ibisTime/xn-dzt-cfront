<template>
  <transition name="slide-up">
    <div v-show="showFlag" class="rating-wrapper" @click.stop>
      <div class="close" @click="hide">
        <i class="close-icon close-icon0"></i>
        <i class="close-icon close-icon1"></i>
      </div>
      <div class="rating-form">
        <div class="item">
          <textarea placeholder="请输入评价内容" v-model="content" @input="valid" rows="5"></textarea>
          <span class="error">{{contErr}}</span>
        </div>
        <div class="btn">
          <button :disabled="disabled" @click="rating">提交</button>
        </div>
      </div>
      <toast ref="toast" :text="text"></toast>
    </div>
  </transition>
</template>
<script>
  import {ratingOrder} from 'api/biz';
  import Toast from 'base/toast/toast';
  import {isUnDefined} from 'common/js/util';

  export default {
    data() {
      return {
        content: '',
        contErr: '',
        disabled: false,
        showFlag: false,
        text: ''
      };
    },
    props: {
      orderCode: {
        type: String,
        default: ''
      }
    },
    methods: {
      show() {
        this.showFlag = true;
      },
      hide() {
        this.showFlag = false;
      },
      rating() {
        if (this.valid()) {
          this.disabled = true;
          ratingOrder(this.orderCode, this.content).then((data) => {
            this.disabled = false;
            if (/;filter/.test(data.code)) {
              this.text = '您的评论存在敏感词，我们将进行审核';
            } else {
              this.text = '评价成功';
            }
            this.$refs.toast.show();
            this.$emit('ratingSuc', this.orderCode);
            setTimeout(() => {
              this.showFlag = false;
            }, 1000);
          }).catch(() => {
            this.disabled = false;
          });
        }
      },
      valid() {
        if (isUnDefined(this.content)) {
          this.contErr = '不能为空';
          return false;
        }
        if (this.content.length > 200) {
          this.contErr = '长度不能超过200位';
          return false;
        }
        this.contErr = '';
        return true;
      }
    },
    components: {
      Toast
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .rating-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 18px;
    z-index: 102;
    background: #fff;

    .close {
      position: absolute;
      width: 40px;
      height: 40px;

      .close-icon {
        position: absolute;
        width: 3px;
        height: 30px;
        background: #666;
        left: 18px;

        &.close-icon0 {
          transform: rotateZ(45deg);
        }

        &.close-icon1 {
          transform: rotateZ(-45deg);
        }
      }
    }

    .rating-form {
      margin-top: 50px;

      .item {
        position: relative;
        margin-top: 15px;

        textarea {
          border: 1px solid #9d9d9d;
          border-radius: 4px;
          width: 100%;
          line-height: 1.3;
          font-size: $font-size-medium;
          padding: 6px;
        }

        .error {
          display: inline-block;
          padding-top: 6px;
          font-size: $font-size-medium;
          color: #ff0000;
        }
      }

      .btn {
        margin-top: 20px;

        button {
          display: block;
          width: 100%;
          line-height: 40px;
          border-radius: 6px;
          font-size: $font-size-medium-x;
          background: #9ba9b5;
          color: #fff;

          &[disabled] {
            background: $color-disable-background;
          }
        }
      }
    }
  }

  .slide-up-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }

  .slide-up-enter, .slide-leave-to {
    transform: translate3d(0, 100%, 0);
  }
</style>
