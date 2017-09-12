<template>
    <div class="rating-box-wrapper" @click.stop>
      <div class="content flex-item" @click="showRating">说说你的看法</div>
      <div class="icons">
        <div class="icon icon-message" @click="goRating"><em class="rating-num">{{num}}</em></div>
        <i class="icon icon-like":class="{active:isSC}" @click="handleCollect"></i>
        <i class="icon icon-share" @click="showMask"></i>
      </div>
      <rating ref="rating" @ratingSuc="ratingSuccess" :user="user" :parentCode="code"></rating>
      <share-mask ref="mask"></share-mask>
    </div>
</template>
<script>
  import Rating from 'components/rating/rating';
  import ShareMask from 'components/share-mask/share-mask';
  import {collection, cancelCollection} from 'api/biz';

  export default {
    props: {
      code: {
        type: String,
        required: true
      },
      user: {
        type: Object
      },
      isSC: {
        type: Boolean,
        default: false
      },
      num: {
        type: Number,
        default: 0
      }
    },
    methods: {
      showRating() {
        this.$refs.rating.show();
      },
      ratingSuccess(info) {
        this.$emit('ratingSuc', info);
      },
      goRating() {
        this.$router.push(`${this.$route.path}/rating`);
      },
      handleCollect() {
        if (this.isSC) {
          cancelCollection(this.$route.params.id).then(() => {
            this.$emit('handleCollect', false);
          }).catch(() => {});
        } else {
          collection(this.$route.params.id).then(() => {
            this.$emit('handleCollect', true);
          }).catch(() => {});
        }
      },
      showMask() {
        this.$refs.mask.show();
      }
    },
    components: {
      Rating,
      ShareMask
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .rating-box-wrapper {
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 42px;
    padding: 6px;
    z-index: 102;
    background-color: #f8f8f8;

    .flex-item {
      flex: 1;
    }

    .content {
      margin-left: 9px;
      padding: 0 5px;
      width: 170px;
      line-height: 30px;
      border: 1px solid $color-border;
      border-radius: 4px;
      font-size: $font-size-medium;
      color: #aaa;
    }

    .icons {
      padding: 0 10px;
      .icon {
        position: relative;
        display: inline-block;
        width: 25px;
        height: 25px;
        margin: 0 14px;
        background-repeat: no-repeat;
        background-size: 25px 25px;
        background-position: center;

        &.icon-message {
          @include bg-image('message');

          .rating-num {
            position: absolute;
            top: -5px;
            left: 12px;
            padding: 0 5px 0 4px;
            border-radius: 12px;
            text-align: center;
            font-size: $font-size-small;
            line-height: 1.2;
            background: $primary-color;
            color: #fff;
          }
        }

        &.icon-like {
          @include bg-image('like');

          &.active {
            @include bg-image('like-act');
          }
        }

        &.icon-share {
          @include bg-image('share');
        }
      }
    }
  }
</style>
