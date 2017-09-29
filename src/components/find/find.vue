<template>
  <div>
    <div class="find-wrapper">
      <scroll :data="findList" :pullup="pullup" @scrollToEnd="getPageArticle" class="find-content">
        <div>
          <ul>
            <li class="needsclick" @click="selectItem(item)" v-for="(item,index) in findList" :key="item.code">
              <div class="img">
                <div :style="getImgSyl(item.pic)"></div>
              </div>
              <h2>{{item.title}}</h2>
            </li>
            <loading class="find-loading" v-show="hasMore" title=""></loading>
          </ul>
          <div class="spilt-div"></div>
        </div>
        <div v-show="!hasMore && !findList.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无内容"></no-result>
        </div>
      </scroll>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import NoResult from 'base/no-result/no-result';
  import {formatImg, getShareImg, setTitle} from 'common/js/util';
  import {initShare} from 'common/js/weixin';
  import {getPageArticle} from 'api/biz';
  import {mapMutations} from 'vuex';
  import {SET_CURRENT_ARTICLE} from 'store/mutation-types';

  export default {
    data() {
      return {
        findList: [],
        start: 1,
        limit: 10,
        hasMore: true
      };
    },
    created() {
      this.pullup = true;
      this.isWxConfiging = false;
      this.wxData = null;
      if (this.shouldGetData()) {
        this.getInitData();
      }
    },
    updated() {
      if (this.shouldGetData()) {
        this.getInitData();
      }
    },
    methods: {
      getInitData() {
        this.getPageArticle();
        this.getInitWXSDKConfig();
      },
      shouldGetData() {
        if (this.$route.path === '/find') {
          setTitle('发现');
          // 当前页面,并且微信sdk未初始化
          if(!this.isWxConfiging && !this.wxData && (!this.hasMore || this.start !== 1)) {
            this.getInitWXSDKConfig();
          }
          if (this.hasMore && !this.findList.length) {
            return true;
          }
          return false;
        }
        this.isWxConfiging = false;
        this.wxData = null;
        return false;
      },
      getPageArticle() {
        if (this.hasMore) {
          getPageArticle(this.start, this.limit).then((data) => {
            if (data.totalCount <= this.limit || data.list.length < this.limit) {
              this.hasMore = false;
            }
            this.start++;
            this.findList = this.findList.concat(data.list);
          }).catch(() => {
            this.hasMore = false;
          });
        }
      },
      getInitWXSDKConfig() {
        this.isWxConfiging = true;
        initShare({
          title: '发现',
          desc: '合衣定制',
          link: location.href,
          imgUrl: getShareImg()
        }, (data) => {
          this.isWxConfiging = false;
          this.wxData = data;
        }, () => {
          this.isWxConfiging = false;
          this.wxData = null;
        });
      },
      selectItem(item) {
        if (!item._advPic) {
          item._advPic = item.advPic.split('||');
        }
        this.setCurArticle(item);
        this.$router.push(`/find/${item.code}`);
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
    bottom: 0;
    padding: 0 0.38rem;
    background: #fff;

    .find-content{
      position: relative;
      height: 100%;
      overflow: hidden;
    }

    ul {
      padding-top: 0.38rem;

      li {
        padding-bottom: 0.36rem;

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
            border-radius: 0.12rem;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
          }
        }

        h2 {
          margin-top: 0.2rem;
          line-height: 1.2;
          font-size: $font-size-medium;
        }
      }
    }

    .spilt-div {
      height: 0.98rem;
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
