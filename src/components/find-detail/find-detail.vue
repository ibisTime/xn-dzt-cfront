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
          </div>
        </scroll>
      </div>
      <div v-show="showTitle" class="title fixed" ref="fixedTitle" @click="goRating">
        <label>评论</label>
        <span>{{totalCount}}条评论</span>
        <i class="arrow"></i>
      </div>
      <go-home></go-home>
      <rating-box @handleCollect="handleCollect"
                  @ratingSuc="ratingSuccess"
                  :user="user"
                  :code="code"
                  :isSC="isSC"
                  :num="totalCount"></rating-box>
      <router-view></router-view>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import Slider from 'base/slider/slider';
  import {getArticle, getPageRatings} from 'api/biz';
  import {getUser} from 'api/user';
  import {commonMixin} from 'common/js/mixin';
  import {prefixStyle} from 'common/js/dom';
  import {initShare} from 'common/js/weixin';
  import {getShareImg, setTitle, clearTag} from 'common/js/util';
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_CURRENT_ARTICLE, SET_USER_STATE} from 'store/mutation-types';
  import GoHome from 'components/go-home/go-home';
  import RatingBox from 'components/rating-box/rating-box';

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
        this._refreshScroll();
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
            this._refreshScroll();
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
      handleCollect(flag) {
        this.isSC = flag;
        this.$emit('update', this.currentArticle, flag);
      },
      goRating() {
        if (this.user) {
          this.$router.push(`${this.$route.path}/rating`);
        }
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
        setTimeout(() => {
          let newTop = this.$refs.sliderWrapper.clientHeight + 'px';
          if (this.$refs.scrollWrapper.style.top !== newTop) {
            this.$refs.scrollWrapper.style.top = newTop;
            this.imageHeight = this.$refs.sliderWrapper.clientHeight;
            this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT;
            setTimeout(() => {
              this.$refs.scroll.refresh();
            }, 20);
          }
        }, 20);
      },
      ...mapMutations({
        setCurArticle: SET_CURRENT_ARTICLE,
        setUser: SET_USER_STATE
      })
    },
    watch: {
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
      GoHome,
      RatingBox
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
      height: 0.2rem;
      background: #f2f2f2;
    }

    .head {
      .back {
        position: fixed;
        left: 0;
        top: 0;
        width: 1.24rem;
        height: 1.24rem;
        background-position: center;
        background-repeat: no-repeat;
        background-size: 0.24rem;
        z-index: 102;
        @include bg-image('back');
      }
    }

    .banner-wrapper {
      position: relative;
      font-size: 0;
      overflow: hidden;

      .in-slider {
        min-height: 1.24rem;
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
      bottom: 0.84rem;

      .scroll-content {
        position: relative;
        height: 100%;
      }

      .rating-content {
        .item {
          display: flex;
          align-items: flex-start;
          padding: 0.22rem 0.3rem;
          border-bottom: 1px solid #eee;

          .avatar {
            width: 1rem;
            height: 1rem;
            flex: 0 0 1rem;
            border-radius: 50%;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
            }
          }

          .inner-content {
            flex: 1;
            padding-left: 0.2rem;

            .top {
              display: flex;
              margin-bottom: 0.2rem;

              label {
                flex: 1;
                line-height: 1.1;
                font-size: 0.3rem;
              }

              span {
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
          padding-top: 0.4rem;
        }
      }

      .rating-label {
        margin-top: 0.2rem;
        text-align: right;

        span {
          display: inline-block;
          padding: 0.2rem 0.36rem;
          font-size: $font-size-medium;
          color: #b3b3b3;
        }
      }
    }

    .title {
      position: relative;
      padding: 0 0.36rem;
      height: 0.8rem;
      line-height: 0.8rem;
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
        float: left;
        font-size: 0.3rem;
      }

      span {
        float: right;
        margin-right: 0.28rem;
        font-size: 0.26rem;
        color: #999;
      }

      .arrow {
        position: absolute;
        right: 0;
        top: 0;
        width: 0.68rem;
        height: 100%;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 0.2rem;
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
