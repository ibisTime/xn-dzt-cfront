<template>
  <div class="rating-box-wrapper" @click.stop>
    <div class="content flex-item" @click="showRating">说说你的看法</div>
    <div class="icons">
      <div class="icon icon-message" @click="goRating">
        <div v-show="num" class="rating-num">
          <badge :text="num+''"></badge>
        </div>
      </div>
      <i class="icon icon-like":class="{active:isSC}" @click="handleCollect"></i>
      <i class="icon icon-share" @click="showMask"></i>
    </div>
    <rating ref="rating" @ratingSuc="ratingSuccess" :user="user" :parentCode="code"></rating>
    <share-mask ref="mask"></share-mask>
  </div>
</template>
<script>
  import Badge from 'base/badge/badge';
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
      ShareMask,
      Badge
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
    height: 0.84rem;
    padding: 0.12rem;
    z-index: 102;
    background-color: #f8f8f8;

    .flex-item {
      flex: 1;
    }

    .content {
      margin-left: 0.18rem;
      padding: 0 0.1rem;
      width: 3.4rem;
      line-height: 0.6rem;
      border: 1px solid $color-border;
      border-radius: 0.08rem;
      font-size: $font-size-medium;
      color: #aaa;
    }

    .icons {
      padding: 0 0.2rem;
      height: 0.5rem;
      font-size: 0;

      .icon {
        position: relative;
        display: inline-block;
        width: 0.5rem;
        height: 0.5rem;
        margin: 0 0.28rem;
        background-repeat: no-repeat;
        background-size: 0.5rem 0.5rem;
        background-position: center;

        &.icon-message {
          @include bg-image('message');

          .rating-num {
            position: absolute;
            top: -0.1rem;
            left: 0.24rem;
            font-size: 0;
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
