<template>
  <transition name="slide">
    <div class="edit-avatar-wrapper">
      <scroll ref="scroll" :click="click" class="scroll-content">
        <div>
          <div class="avatar-top">
            <div class="avatar">
              <img :src="formatImg(curImg)"/>
            </div>
            <h2>修改您的头像</h2>
          </div>
          <div class="avatar-content clearfix">
            <div v-for="item in files" class="avatar" @click="showChosen(item)">
              <div class="inner-content">
                <img :src="getImg(item)"/>
                <div v-show="item.status!==200" class="inner-loading">
                  <loading class="in-loading" title=""></loading>
                </div>
                <i v-show="curImg===item.key" class="chose-icon"></i>
              </div>
            </div>
            <div v-show="token" class="avatar" ref="fileChose">
              <div class="inner-content">
                <qiniu class="add-icon"
                       :token="token"
                       :uploadUrl="uploadUrl"
                       :multiple="multiple"
                       @upload="onUpload"
                       @drop="onDrop"
                       @error="onUploadError"></qiniu>
                </div>
            </div>
          </div>
        </div>
      </scroll>
      <chosen class="chose-wrapper" ref="chosen">
        <div class="item" @click="deleteAvatar">
          删除图片
        </div>
        <div class="item" @click="choseItem">
          选择图片
        </div>
      </chosen>
      <div v-show="loadingFlag" class="loading-container">
        <div class="loading-wrapper">
          <loading title=""></loading>
        </div>
      </div>
      <toast ref="toast" :text="text"></toast>
    </div>
  </transition>
</template>
<script>
  import Qiniu from 'base/qiniu/qiniu';
  import Scroll from 'base/scroll/scroll';
  import Toast from 'base/toast/toast';
  import Loading from 'base/loading/loading';
  import {formatAvatar} from 'common/js/util';
  import {getQiniuToken} from 'api/general';
  import {getUser, changeAvatar} from 'api/user';
  import {mapGetters, mapMutations, mapActions} from 'vuex';
  import {SET_USER_STATE} from 'store/mutation-types';
  import Chosen from 'components/chosen/chosen';

  export default {
    data() {
      return {
        token: '',
        files: [],
        text: '',
        curImg: '',
        loadingFlag: true
      };
    },
    created() {
      this.click = false;
      this.multiple = false;
      this.uploadUrl = 'http://up-z0.qiniu.com';
      this.currentItem = null;
      this.getInitData();
      this.getQiniuToken();
    },
    computed: {
      ...mapGetters([
        'user',
        'avatars'
      ])
    },
    methods: {
      getInitData() {
        Promise.all([
          this.getUser(),
          this.getQiniuToken()
        ]).then(() => {
          this.loadingFlag = false;
          if (this.user.photo) {
            let _file = {
              status: 200,
              key: this.user.photo
            };
            this.saveAvatarHistory(_file);
            this.files = [...this.avatars];
          }
          this.curImg = this.user.photo;
        }).catch(() => {
          this.loadingFlag = false;
        });
      },
      getUser() {
        if (!this.user) {
          return getUser().then((data) => {
            this.setUser(data);
            return data;
          });
        }
        return Promise.resolve(this.user);
      },
      getQiniuToken() {
        return getQiniuToken().then((data) => {
          this.token = data.uploadToken;
        });
      },
      showChosen(item) {
        this.currentItem = item;
        this.$refs.chosen.show();
      },
      choseItem() {
        if (this.currentItem.status !== 200) {
          this.text = '头像还未上传完成';
          this.$refs.toast.show();
          return;
        }
        this.loadingFlag = true;
        changeAvatar(this.currentItem.key).then(() => {
          this.loadingFlag = false;
          this.curImg = this.currentItem.key;
          this.setUser({
            ...this.user,
            photo: this.currentItem.key
          });
        }).catch(() => {
          this.loadingFlag = false;
        });
      },
      deleteAvatar() {
        let idx = this._findFileIndex(this.currentItem);
        this.files.splice(idx, 1);
        this.deleteAvatarHistory(this.currentItem);
      },
      /**
       * 处理图片上传前的事件
       * @param files    上传图片
       */
      onUpload(files) {
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          file.onprogress = (e) => {
            file.status = e.srcElement.status;
            let idx = this._findFileIndex(file);
            if (idx > -1) {
              this.files.splice(idx, 1, file);
              if (file.status === 200) {
                this.saveAvatarHistory({
                  key: file.key,
                  status: 200
                });
              }
            }
          };
        }
      },
      /**
       * 处理添加图片事件，把新加入的图片拼到files数组里
       * @param newFiles    新加入的图片
       */
      onDrop(newFiles) {
        this.files = this.files.concat(newFiles);
      },
      /**
       * 处理图片上传错误事件
       * @param error 错误信息
       */
      onUploadError(error, file) {
        this.text = error.body && error.body.error || `${error.message}:10M` || '图片上传出错';
        this.$refs.toast.show();
      },
      /**
       * 根据file找到在files里的下标
       * @param file    需要寻找下标的file
       */
      _findFileIndex(file) {
        return this.files.findIndex((item) => {
          return item.key === file.key;
        });
      },
      getImg(item) {
        if (item.status !== 200) {
          return item.preview;
        }
        return formatAvatar(item.key);
      },
      formatImg(img) {
        return formatAvatar(img);
      },
      ...mapMutations({
        'setUser': SET_USER_STATE
      }),
      ...mapActions([
        'saveAvatarHistory',
        'deleteAvatarHistory'
      ])
    },
    watch: {
      files(newFiles) {
        if (newFiles.length >= 9) {
          this.$refs.fileChose.style['position'] = 'absolute';
          this.$refs.fileChose.style['visibility'] = 'hidden';
        } else {
          this.$refs.fileChose.style['position'] = 'relative';
          this.$refs.fileChose.style['visibility'] = 'visible';
        }
        setTimeout(() => {
          this.$refs.scroll.refresh();
        }, 20);
      }
    },
    components: {
      Qiniu,
      Toast,
      Scroll,
      Loading,
      Chosen
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .edit-avatar-wrapper {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .scroll-content {
      position: relative;
      height: 100%;

      .avatar-top {
        border-bottom: 1px solid #a1a1a1;

        .avatar {
          width: 88px;
          height: 88px;
          margin: 40px auto 48px;
          border-radius: 50%;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
          }
        }

        h2 {
          margin-bottom: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: #b3b3b3;
        }
      }

      .avatar-content {
        padding-top: 18px;
        padding-left: 28px;

        .avatar {
          position: relative;
          float: left;
          width: 33%;
          height: 0;
          padding-top: 33%;

          .inner-content {
            position: absolute;
            top: 0;
            left: 0;
            right: 28px;
            bottom: 28px;
            border-radius: 50%;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
            }

            .inner-loading {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: rgba(0, 0, 0, 0.3);

              .in-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate3d(-50%, -50%, 0);
              }
            }

            .chose-icon {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              @include bg-image('chose');
              background-size: contain;
              background-position: center;
              background-repeat: no-repeat;
              background-size: 70%;
            }
          }

          .add-icon {
            display: inline-block;
            width: 100%;
            height: 100%;
            background-size: contain;
            background-repeat: no-repeat;
            @include bg-image('add');
          }
        }
      }
    }

    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      .loading-wrapper {
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translate3d(0, -50%, 0);
      }
    }

    .chose-wrapper {
      .item {
        padding: 14px 10px;
        @include border-bottom-1px($color-border);

        &:last-child {
          @include border-none();
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
