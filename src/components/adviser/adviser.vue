<template>
  <transition name="slide">
    <div class="message-wrapper">
      <scroll :listenScroll="listenScroll" :probeType="probeType" @scroll="scroll" ref="scroll" :data="messages" class="message-content">
        <div>
          <div v-show="hasMore" class="loading-wrapper">
            <loading title=""></loading>
          </div>
          <div v-for="item in messages" :key="item.code" ref="mesRef">
            <div v-if="item.commenter!==userId" class="message-item message-left clearfix">
              <div class="avatar" @click="showAdviser">
                <img :src="getImg(item)"/>
              </div>
              <div class="item-cont">{{item.content}}</div>
            </div>
            <div v-else class="message-item message-right clearfix">
              <div class="item-cont">{{item.content}}</div>
              <div class="avatar">
                <img :src="getAvatar()"/>
              </div>
            </div>
          </div>
        </div>
      </scroll>
      <div class="message-foot">
        <div class="input-item">
          <input type="text" v-model="content">
        </div>
        <button :disabled="disabled || !content" @click="sendMsg">发送</button>
      </div>
      <confirm :isAlert="isAlert" :isHtml="isHtml" :text="text" ref='confirm'></confirm>
    </div>
  </transition>
</template>
<script>
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_USER_STATE} from 'store/mutation-types';
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import Confirm from 'base/confirm/confirm';
  import {getPageMessages, leaveMessage, getCurAdviser} from 'api/biz';
  import {getUser} from 'api/user';
  import {getUserId, formatImg, setTitle} from 'common/js/util';

  const LIMIT = 20;

  export default {
    data() {
      return {
        messages: [],
        content: '',
        start: 1,
        hasMore: true,
        disabled: false,
        text: ''
      };
    },
    created() {
      setTitle('着装顾问');
      this.isAlert = true;
      this.isHtml = true;
      this.first = true;
      this.listenScroll = true;
      this.probeType = 3;
      this.userId = getUserId();
      this.getInitData();
    },
    computed: {
      ...mapGetters([
        'user'
      ])
    },
    methods: {
      getInitData() {
        Promise.all([
          this.getUser(),
          this.getMessages(),
          this.getCurAdviser()
        ]);
      },
      getUser() {
        if (this.user) {
          return Promise.resolve(this.user);
        }
        return getUser().then((data) => {
          this.setUser(data);
          return data;
        });
      },
      getMessages() {
        return getPageMessages(this.start, LIMIT, 1).then((data) => {
          if (data.list.length < LIMIT || data.totalCount <= LIMIT) {
            this.hasMore = false;
          }
          let _list = data.list.reverse();
          this.messages = _list.concat(this.messages);
          if (this.first) {
            if (this.messages.length) {
              setTimeout(() => {
                this.$refs.scroll.scrollToElement(this.$refs.mesRef[this.messages.length - 1]);
                setTimeout(() => {
                  this.first = false;
                }, 200);
              }, 40);
            } else {
              this.first = false;
            }
          }
          this.start++;
        });
      },
      getCurAdviser() {
        getCurAdviser().then((data) => {
          if (data.ltName) {
            setTitle(data.ltName);
            this.text = `<div>姓名：${data.ltName}</div><div>手机号：${data.ltMobile}</div>`;
          }
        }).catch(() => {
          this.text = '暂时无法获取顾问信息';
        });
      },
      sendMsg() {
        this.disabled = true;
        leaveMessage(this.content, 1).then((data) => {
          this.messages.push({
            code: data.code,
            content: this.content,
            commenter: this.userId
          });
          this.content = '';
          this.disabled = false;
          setTimeout(() => {
            this.$refs.scroll.scrollToElement(this.$refs.mesRef[this.messages.length - 1]);
          }, 40);
        }).catch(() => {
          this.disabled = false;
        });
      },
      showAdviser() {
        this.$refs.confirm.show();
      },
      getAvatar() {
        if (!this.user || !this.user.photo) {
          return require('./avatar1@2x.png');
        }
        return formatImg(this.user.photo);
      },
      getImg(item) {
        if (!item.commentPhoto) {
          return require('./avatar@2x.png');
        }
        return formatImg(item.commentPhoto);
      },
      scroll(pos) {
        if (pos.y > -20 && !this.fetching && !this.first && this.hasMore) {
          this.fetching = true;
          this.getMessages().finally(() => {
            this.fetching = false;
          });
        }
      },
      ...mapMutations({
        'setUser': SET_USER_STATE
      })
    },
    components: {
      Scroll,
      Loading,
      Confirm
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .message-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    bottom: 60px;
    z-index: 101;
    background: #eee;

    .message-content {
      height: 100%;
      overflow: hidden;
      background: #eee;

      .loading-wrapper {
        padding-top: 20px;
      }

      .message-item {
        display: flex;
        padding: 18px;

        .avatar {
          width: 50px;
          flex: 0 0 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .item-cont {
          position: relative;
          border-radius: 6px;
          padding: 14px 14px 12px;
          line-height: 1.4;
          word-break: break-word;
          font-size: $font-size-medium;
          color: #000;
          background: #fff;

          &:before {
            content: '';
            position: absolute;
            top: 20px;
            width: 0;
            height: 0;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
          }
        }

        &.message-left {
          padding-right: 110px;

          .item-cont {
            left: 10px;

            &:before {
              left: -10px;
              border-right: 10px solid #fff;
            }
          }
        }

        &.message-right {
          justify-content: flex-end;
          padding-left: 110px;

          .item-cont {
            right: 10px;

            &:before {
              right: 0;
              transform: translateX(100%);
              border-left: 10px solid #fff;
            }
          }
        }
      }
    }
    .message-foot {
      display: flex;
      align-items: center;
      padding: 0 18px;
      height: 60px;
      font-size: $font-size-medium;
      background: #fff;

      .input-item {
        flex: 1;
        display: flex;
        align-items: center;
        margin-right: 10px;
        padding: 0 6px;
        border: 1px solid #b2b2b2;
        border-radius: 6px;
        height: 40px;
        background-color: rgb(238, 238, 238);

        input {
          width: 100%;
          line-height: 1.4;
          background: transparent;
          font-size: $font-size-medium;
        }
      }

      button {
        width: 60px;
        border-radius: 6px;
        line-height: 40px;
        font-size: $font-size-medium;
        background: $primary-color;
        color: #fff;

        &:disabled {
          background: $color-disable-background;
        }
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
