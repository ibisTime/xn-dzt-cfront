<template>
  <div class="form-wrapper">
    <div class="form-btn">
      <router-link tag="button" to='/home/technology'>设置</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
  export default {
    data() {
      return {
      };
    },
    methods: {
    }
  };
</script>
<style lang="scss" scoped rel="stylesheet/scss">
  @import "~common/scss/mixin";
  @import "~common/scss/variable";

  .form-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: $color-background;

    .form-item {
      display: flex;
      align-items: center;
      padding: 0 15px;
      min-height: 48px;
      @include border-bottom-1px($color-border);
      font-size: $font-size-medium-x;
      background: #fff;

      .item-label {
        width: 75px;
        flex: 0 0 75px;
      }

      .item-input-wrapper {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;

        .item-input {
          flex: 1;
          line-height: 1.6;
        }

        .error-tip {
          font-size: $font-size-medium;
          color: #ff0000;
          white-space: nowrap;
          position: absolute;
          right: 0;
        }
      }
      .item-btn {
        padding-left: 10px;

        button {
          min-width: 90px;
          padding: 4px 10px;
          white-space: nowrap;
          border-radius: 6px;
          font-size: $font-size-medium;
          background: $primary-color;
          color: #fff;

          &[disabled] {
            background: $color-disable-background;
          }
        }
      }
    }

    .form-btn {
      margin-top: 40px;
      padding: 0 15px;
      width: 100%;

      button {
        display: block;
        width: 100%;
        line-height: 40px;
        border-radius: 6px;
        font-size: $font-size-large;
        background: $primary-color;
        color: #fff;
      }
    }
  }
</style>
