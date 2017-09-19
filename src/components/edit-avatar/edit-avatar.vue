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
            <div v-for="item in files" class="avatar needsclick" @click="showChosen(item, $event)">
              <div class="inner-content">
                <img :src="getImg(item)"/>
                <div v-show="!item.ok" class="inner-loading">
                  <loading class="in-loading" title=""></loading>
                </div>
                <i v-show="curImg===item.key" class="chose-icon"></i>
              </div>
            </div>
            <div v-show="token" class="avatar" ref="fileChose">
              <div class="inner-content">
                <qiniu class="add-icon"
                       style="visibility: hidden;position: absolute;"
                       ref="qiniu"
                       :token="token"
                       :uploadUrl="uploadUrl"></qiniu>
                <div class="add-icon">
                  <input class="input-file needsclick"
                         type="file"
                         :multiple="multiple"
                         ref="fileInput"
                         @change="fileChange"
                         accept="image/*"/>
                </div>
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
      <clip-avatar @choseImage="updateAvatar"
                   ref="clipAvatar"
                   @cancel="cancelItem"
                   :imgType="this.currentItem && this.currentItem.type || ''"
                   :imgUrl="this.currentItem && this.currentItem.preview || ''"></clip-avatar>
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
  import ClipAvatar from 'components/clip-avatar/clip-avatar';

  export default {
    data() {
      return {
        token: '',
        files: [],
        text: '',
        curImg: '',
        currentItem: null,
        loadingFlag: true
      };
    },
    created() {
      this.click = true;
      this.multiple = false;
      this.uploadUrl = 'http://up-z0.qiniu.com';
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
              ok: true,
              key: this.user.photo,
              preview: this.getImg(this.user.photo)
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
      showChosen(item, event) {
        if (event._constructed) {
          return;
        }
        if (this.curImg !== item.key) {
          this.currentItem = item;
          this.$refs.chosen.show();
        }
      },
      choseItem() {
        if (this.currentItem.ok) {
          this._changeAvatar(this.currentItem.key);
        }
      },
      cancelItem() {
        let idx = this._findFileIndex(this.currentItem, 'preview');
        this.files.splice(idx, 1);
      },
      fileChange(e) {
        let files;
        if (e.dataTransfer) {
          files = e.dataTransfer.files;
        } else if (e.target) {
          files = e.target.files;
        }
        files = Array.prototype.slice.call(files, 0, 1);
        let file = files[0];
        let preview = URL.createObjectURL(file);
        let item = {
          preview,
          ok: false,
          type: file.type
        };
        this.currentItem = item;
        this.files.push(item);
        this.$refs.clipAvatar.show();
        this.$refs.fileInput.value = null;
      },
      updateAvatar(info) {
        if (info.base64) {
          this.$refs.qiniu.uploadByBase64(info.base64).then((data) => {
            this._changeAvatar(data.body.key);
          }).catch((err) => {
            this.onUploadError(err);
          });
        } else {
          let suffix = `?imageMogr2/auto-orient/thumbnail/${info.outerWidth}x${info.outerHeight}!/crop/!${info.width}x${info.height}a${info.x}a${info.y}`;
          this.loadingFlag = true;
          let index = this.currentItem.key.indexOf('?imageMogr2');
          let _key = this.currentItem.key;
          if (index !== -1) {
            _key = _key.substr(0, index);
          }
          _key += suffix;
          this._changeAvatar(_key);
        }
      },
      _changeAvatar(_key) {
        changeAvatar(_key).then(() => {
          this.loadingFlag = false;
          this.curImg = _key;
          this.currentItem = {
            ...this.currentItem,
            ok: true,
            key: _key
          };
          this.saveAvatarHistory(this.currentItem);
          this.files = [...this.avatars];
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
        if (this.currentItem.ok) {
          this.deleteAvatarHistory(this.currentItem);
        }
      },
      /**
       * 处理图片上传错误事件
       * @param error 错误信息
       */
      onUploadError(error) {
        this.text = error.body && error.body.error || `${error.message}:10M` || '图片上传出错';
        this.$refs.toast.show();
      },
      /**
       * 根据file找到在files里的下标
       * @param file    需要寻找下标的file
       */
      _findFileIndex(file, key = 'key') {
        return this.files.findIndex((item) => {
          return item[key] === file[key];
        });
      },
      getImg(item) {
        if (!item.ok) {
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
      Chosen,
      ClipAvatar
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

            .input-file {
              position: absolute;
              width: 100%;
              height: 100%;
              left: 0;
              top: 0;
              opacity: 0;
              z-index: 1;
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
