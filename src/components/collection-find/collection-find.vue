<template>
  <transition name="slide">
    <div class="find-wrapper">
      <scroll :data="findList" :pullup="pullup" @scrollToEnd="getPageArticle" class="find-content">
        <div>
          <ul>
            <li v-for="(item,index) in findList" class="needsclick" @click="selectItem(item,index)" :key="item.code">
              <div class="img">
                <div :style="getImgSyl(item.article.pic)"></div>
              </div>
              <h2>{{item.article.title}}</h2>
            </li>
            <loading class="find-loading" v-show="hasMore" title=""></loading>
          </ul>
        </div>
        <div v-show="!hasMore && !findList.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无收藏的文章"></no-result>
        </div>
      </scroll>
      <router-view @update="handleUpdate"></router-view>
    </div>
  </transition>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import NoResult from 'base/no-result/no-result';
  import {formatImg, setTitle} from 'common/js/util';
  import {getPageCollections} from 'api/biz';
  import {mapMutations} from 'vuex';
  import {SET_CURRENT_ARTICLE} from 'store/mutation-types';

  const LIMIT = 20;

  export default {
    data() {
      return {
        findList: [],
        hasMore: true,
        start: 1
      };
    },
    created() {
      this.pullup = true;
      if (this.shouldGetData()) {
        this.getPageArticle();
      }
    },
    updated() {
      if (this.shouldGetData()) {
        this.getPageArticle();
      }
    },
    methods: {
      shouldGetData() {
        if (this.$route.path === '/user/collection/find') {
          setTitle('文章列表');
          if (this.hasMore && !this.findList.length) {
            return true;
          }
          return false;
        }
        return false;
      },
      getPageArticle() {
        if (this.hasMore) {
          getPageCollections(this.start, LIMIT, 1).then((data) => {
            if (data.totalCount <= LIMIT || data.list.length < LIMIT) {
              this.hasMore = false;
            }
            this.start++;
            this.findList = this.findList.concat(data.list);
          }).catch(() => {
            this.hasMore = false;
          });
        }
      },
      selectItem(item, index) {
        this.curIndex = index;
        this.curCode = item.code;
        if (!item.article._advPic) {
          item.article._advPic = item.article.advPic.split('||');
        }
        this.setCurArticle(item.article);
        this.$router.push(`/user/collection/find/${item.article.code}`);
      },
      handleUpdate(item, isSC) {
        if (this.curCode) {
          let _curItem = this.findList[this.curIndex];
          if (isSC) {
            if (!_curItem || _curItem.article.code !== item.code) {
              this.findList.splice(this.curIndex, 0, {
                article: item,
                code: this.curCode
              });
            }
          } else {
            if (_curItem.article.code === item.code) {
              this.findList.splice(this.curIndex, 1);
            }
          }
        }
      },
      getImgSyl(imgs) {
        return {
          backgroundImage: `url(${formatImg(imgs)})`
        };
      },
      ...mapMutations({
        setCurArticle: SET_CURRENT_ARTICLE
      })
    },
    components: {
      Loading,
      Scroll,
      NoResult
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .find-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 19px 19px 0;
    background: #fff;

    &.slide-enter-active, &.slide-leave-active {
      transition: all 0.3s;
    }

    &.slide-enter, &.slide-leave-to {
      transform: translate3d(100%, 0, 0);
    }

    .find-content{
      position: relative;
      height: 100%;
      overflow: hidden;
    }

    ul {
      li {
        padding-bottom: 18px;

        .img {
          width: 100%;
          height: 0;
          padding-top: 40%;
          position: relative;

          div {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 6px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
          }
        }

        h2 {
          margin-top: 10px;
          line-height: 1.2;
          font-size: $font-size-medium;
        }
      }
    }

    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }
</style>
