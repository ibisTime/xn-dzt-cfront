<template>
  <transition name="slide">
    <div class="find-detail-wrapper">
      <div class="banner-wrapper" ref="sliderWrapper">
        <slider class="in-slider" v-if="currentArticle" :showDots="showDots" :loop="loop">
          <div v-for="item in currentArticle._advPic">
            <img :src="item | formatImg" @load="loadImage"/>
          </div>
        </slider>
        <div class="head">
          <i class="back" @click="back"></i>
          <i class="like" :class="{active:isSC}" @click="handleCollect"></i>
        </div>
        <div class="filter" ref="filter" v-show="!loop"></div>
      </div>
      <div class="split"></div>
      <div class="bg-layer" ref="layer"></div>
      <div ref="scrollWrapper" class="scroll-wrapper">
        <scroll class="scroll-content"
                ref="scroll"
                @scroll="scroll"
                :data="ratingList"
                :listen-scroll="listenScroll"
                :probe-type="probeType">
          <div>
            <div class="rich-text-description">
              <loading class="find-loading" v-show="!currentArticle" title=""></loading>
              <div ref="description" v-html="currentArticle && currentArticle.description || ''"></div>
            </div>
            <div class="split"></div>
            <div class="title" ref="rTitle" @click="goRating">
              <label>评论</label>
              <span>{{totalCount}}条评论</span>
              <i class="arrow"></i>
            </div>
            <div class="rating-content">
              <div v-for="item in ratingList" class="item">
                <div class="avatar">
                  <img :src="item.photo | formatAvatar"/>
                </div>
                <div class="inner-content">
                  <div class="top">
                    <label>{{item.commerRealName}}</label>
                    <span>{{item.commentDatetime | formatDate}}</span>
                  </div>
                  <div class="bottom">{{item.content}}</div>
                </div>
              </div>
              <loading class="find-loading" v-show="hasMore" title=""></loading>
            </div>
            <div class="rating-label" ref="ratingLabel">
              <span @click="showRating">评论</span>
            </div>
          </div>
        </scroll>
      </div>
      <div v-show="showTitle" class="title fixed" ref="fixedTitle" @click="goRating">
        <label>评论</label>
        <span>{{totalCount}}条评论</span>
        <i class="arrow"></i>
      </div>
      <go-home></go-home>
      <rating ref="rating" @ratingSuc="ratingSuccess" :user="user" :parentCode="code"></rating>
      <router-view></router-view>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import Slider from 'base/slider/slider';
  import {getArticle, collection, cancelCollection, getPageRatings} from 'api/biz';
  import {getUser} from 'api/user';
  import {commonMixin} from 'common/js/mixin';
  import {prefixStyle} from 'common/js/dom';
  import {initShare} from 'common/js/weixin';
  import {getShareImg, setTitle, clearTag} from 'common/js/util';
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_CURRENT_ARTICLE, SET_USER_STATE} from 'store/mutation-types';
  import Rating from 'components/rating/rating';
  import GoHome from 'components/go-home/go-home';

  const RESERVED_HEIGHT = 0;
  const transform = prefixStyle('transform');
  const backdrop = prefixStyle('backdrop-filter');

  export default {
    mixins: [commonMixin],
    data() {
      return {
        isSC: false,
        scrollY: 0,
        ratingList: [],
        hasMore: true,
        totalCount: 0,
        showTitle: false
      };
    },
    created() {
      this.code = this.$route.params.id;
      this.showDots = false;
      this.probeType = 3;
      this.listenScroll = true;
      if (this.currentArticle) {
        setTitle(this.currentArticle.title);
      }
      this.getArticle();
      this.getPageRatings();
      this.getUser();
    },
    mounted() {
      setTimeout(() => {
        let _maxHeight = window.innerWidth;
        this.$refs.sliderWrapper.style.maxHeight = _maxHeight + 'px';
      }, 20);
    },
    computed: {
      loop() {
        return this.currentArticle && this.currentArticle._advPic && this.currentArticle._advPic.length > 1;
      },
      ...mapGetters([
        'currentArticle',
        'user'
      ])
    },
    methods: {
      getArticle() {
        getArticle(this.$route.params.id).then((data) => {
          initShare({
            title: data.article.title,
            desc: clearTag(data.article.description),
            link: location.href,
            imgUrl: getShareImg(data.article.advPic)
          });
          this.isSC = data.isSC === '1';
          if (!this.currentArticle) {
            setTitle(data.article.title);
            data.article._advPic = data.article.advPic.split('||');
            this.setCurArticle(data.article);
          }
        });
      },
      getPageRatings() {
        getPageRatings(this.$route.params.id, 1, 10).then((data) => {
          this.ratingList = data.list;
          this.totalCount = data.totalCount;
          this.hasMore = false;
        });
      },
      getUser() {
        if (!this.user) {
          getUser().then((data) => {
            this.setUser(data);
          });
        }
      },
      handleCollect() {
        if (this.isSC) {
          this.isSC = false;
          cancelCollection(this.$route.params.id).then(() => {
            this.$emit('update', this.currentArticle, false);
          }).catch(() => {
            this.isSC = true;
            this.$emit('update', this.currentArticle);
          });
        } else {
          this.isSC = true;
          collection(this.$route.params.id).then(() => {
            this.$emit('update', this.currentArticle, true);
          }).catch(() => {
            this.isSC = false;
          });
        }
      },
      goRating() {
        if (this.user) {
          this.$router.push(`${this.$route.path}/rating`);
        }
      },
      showRating() {
        this.$refs.rating.show();
      },
      ratingSuccess(info) {
        this.ratingList.unshift(info);
        this.totalCount++;
        setTimeout(() => {
          this.$refs.scroll.scrollToElement(this.$refs.ratingLabel);
        }, 40);
      },
      _refreshScroll() {
        setTimeout(() => {
          let imgs = this.$refs.description.getElementsByTagName('img');
          for (let i = 0; i < imgs.length; i++) {
            let _img = imgs[i];
            if (_img.complete) {
              setTimeout(() => {
                this.$refs.scroll.refresh();
              }, 20);
              continue;
            }
            _img.onload = () => {
              setTimeout(() => {
                this.$refs.scroll.refresh();
              }, 20);
            };
          }
        }, 20);
      },
      scroll(pos) {
        this.scrollY = pos.y;
      },
      back() {
        this.$router.back();
      },
      loadImage() {
        if(!this.checkLoaded) {
          setTimeout(() => {
            this.$refs.scrollWrapper.style.top = this.$refs.sliderWrapper.clientHeight + 'px';
            this.checkLoaded = true;
            this.imageHeight = this.$refs.sliderWrapper.clientHeight;
            this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT;
            setTimeout(() => {
              this.$refs.scroll.refresh();
            }, 20);
          }, 40);
        }
      },
      ...mapMutations({
        setCurArticle: SET_CURRENT_ARTICLE,
        setUser: SET_USER_STATE
      })
    },
    watch: {
      currentArticle() {
        this._refreshScroll();
      },
      scrollY(newY) {
        let _title = this.$refs.rTitle.getBoundingClientRect();
        if (_title.top <= 0) {
          this.showTitle = true;
        } else {
          this.showTitle = false;
        }
        let translateY = Math.max(this.minTranslateY, newY);
        let zIndex = 0;
        let scale = 1;
        let blur = 0;
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`;
        const percent = Math.abs(newY / this.imageHeight);
        if (newY > 0) {
          scale = 1 + percent;
          zIndex = 10;
        } else {
          blur = Math.min(20 * percent, 20);
        }
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`;
        if (newY < this.minTranslateY) {
          zIndex = 10;
          this.$refs.sliderWrapper.style.height = `${RESERVED_HEIGHT}px`;
        } else {
          this.$refs.sliderWrapper.style.height = 'auto';
        }
        this.$refs.sliderWrapper.style.zIndex = zIndex;
        this.$refs.sliderWrapper.style[transform] = `scale(${scale})`;
      }
    },
    components: {
      Scroll,
      Loading,
      Slider,
      Rating,
      GoHome
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/mixin";
  @import "~common/scss/variable";

  .find-detail-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    z-index: 101;

    .bg-layer {
      position: relative;
      height: 100%;
      background: #fff;
    }

    .split {
      height: 10px;
      background: #f2f2f2;
    }

    .head {
      .back {
        position: fixed;
        left: 0;
        top: 0;
        width: 62px;
        height: 62px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 12px;
        z-index: 102;
        @include bg-image('back');
      }

      .like {
        position: fixed;
        right: 0;
        top: 0;
        width: 62px;
        height: 62px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 20px;
        z-index: 102;
        @include bg-image('like');

        &.active {
          @include bg-image('like-act');
        }
      }
    }

    .banner-wrapper {
      position: relative;
      font-size: 0;
      overflow: hidden;

      .in-slider {
        min-height: 62px;
      }

      img {
        width: 100%;
      }
      .filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.02);
      }
    }

    .scroll-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      bottom: 0;

      .scroll-content {
        position: relative;
        height: 100%;
      }

      .rating-content {
        .item {
          display: flex;
          align-items: top;
          padding: 11px 15px;
          border-bottom: 1px solid #eee;

          .avatar {
            width: 50px;
            height: 50px;
            flex: 0 0 50px;
            border-radius: 50%;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
            }
          }

          .inner-content {
            flex: 1;
            padding-left: 10px;

            .top {
              margin-bottom: 10px;

              label {
                font-size: 15px;
              }

              span {
                float: right;
                font-size: $font-size-small;
                color: #999;
              }
            }

            .bottom {
              font-size: $font-size-medium;
              line-height: 1.3;
            }
          }
        }
        .find-loading {
          padding-top: 20px;
        }
      }

      .rating-label {
        margin-top: 10px;
        text-align: right;

        span {
          display: inline-block;
          padding: 10px 18px;
          font-size: $font-size-medium;
          color: #b3b3b3;
        }
      }
    }

    .title {
      position: relative;
      padding: 0 18px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #eee;
      background: #fff;

      &.fixed {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 120;
      }

      label {
        font-size: 15px;
      }

      span {
        float: right;
        margin-right: 14px;
        font-size: 13px;
        color: #999;
      }

      .arrow {
        position: absolute;
        right: 0;
        top: 0;
        width: 34px;
        height: 100%;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 10px;
        @include bg-image('more');
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
