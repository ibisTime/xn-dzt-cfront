<template>
  <div class="book-wrapper">
    <scroll ref="scroll" :click="canClick" class="scroll-content">
      <div>
        <div class="banner">
          <img src="./book@2x.png" @load="handleLoad"/>
        </div>
        <div class="book-form" :class="{disabled: disabled}">
          <div class="form-item">
            <label>姓名</label>
            <div v-show="disabled" class="input-item">{{name}}</div>
            <input v-show="!disabled" class="input-item" type="text" v-model="name" @change="_nameValid"
                   placeholder="待量体者姓名"/>
            <span class="error">{{nameErr}}</span>
          </div>
          <div class="form-item">
            <label>手机</label>
            <div v-show="disabled" class="input-item">{{telphone}}</div>
            <input v-show="!disabled" class="input-item" type="tel" v-model="telphone" @change="_telValid"
                   placeholder="待量体者手机"/>
            <span class="error">{{telErr}}</span>
          </div>
          <div class="clearfix">
            <div class="average pr">
              <div class="form-item">
                <label>身高</label>
                <div v-show="disabled" class="input-item tc">{{height}}</div>
                <input class="input-item tc" v-show="!disabled" type="tel" v-model="height"/>
                <span>cm</span>
              </div>
            </div>
            <div class="average pl">
              <div class="form-item">
                <label>体重</label>
                <div v-show="disabled" class="input-item tc">{{weight}}</div>
                <input class="input-item tc" v-show="!disabled" type="tel" v-model="weight"/>
                <span>kg</span>
              </div>
            </div>
          </div>
          <div class="form-item">
            <label>量体地址</label>
            <div v-show="disabled" class="input-item">{{province + ' ' + city + ' ' + district}}</div>
            <city-picker class="input-item"
                         v-show="!disabled"
                         :province="province"
                         :city="city"
                         :district="district"
                         @change="updateAddress"></city-picker>
            <span class="error">{{provErr}}</span>
          </div>
          <div class="form-item">
            <label></label>
            <div v-show="disabled" class="input-item">{{address}}</div>
            <input class="input-item" v-show="!disabled" type="text" v-model="address" @change="_addrValid"
                   placeholder="街道门牌信息"/>
            <span class="error">{{addrErr}}</span>
          </div>
          <div class="form-item">
            <label>量体时间</label>
            <div v-show="showTime()" class="input-item">{{year + '-' + month + '-' + day}}</div>
            <date-picker class="input-item"
                         v-show="!showTime()"
                         :year="year"
                         :month="month"
                         :day="day"
                         @change="updateDate"></date-picker>
            <span class="error">{{yearErr}}</span>
          </div>
        </div>
        <div class="book-btns">
          <button :disabled="btnDisabled" v-show="curBtn==='bookBtn'" class="book-btn" @click="_book">提交预约</button>
          <button :disabled="btnDisabled" v-show="curBtn==='cancelBtn'" class="book-btn btn-cancel" @click="_cancel">
            取消预约
          </button>
          <button :disabled="btnDisabled" v-show="curBtn==='reBtn'" class="book-btn btn-fg" @click="_reBook">一键复购</button>
        </div>
        <toast ref="toast" :text="text"></toast>
      </div>
      <div v-show="isLoading" class="loading-container">
        <div class="loading-wrapper">
          <loading title=""></loading>
        </div>
      </div>
    </scroll>
    <confirm text="确定取消预约吗" ref='confirm' @confirm="handleConfirm"></confirm>
  </div>
</template>
<script>
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import DatePicker from 'base/date-picker/date-picker';
  import CityPicker from 'base/city-picker/city-picker';
  import Confirm from 'base/confirm/confirm';
  import Toast from 'base/toast/toast';
  import {book, getLatestOrder, cancelBook, reBook} from 'api/biz';
  import {formatDate, realNameValid, mobileValid, emptyValid, getShareImg, setTitle} from 'common/js/util';
  import {initShare} from 'common/js/weixin';

  export default {
    data () {
      return {
        btnDisabled: false,
        curBtn: 'bookBtn',
        isLoading: true,
        disabled: false,
        canClick: false,
        name: '',
        nameErr: '',
        telphone: '',
        telErr: '',
        height: '',
        weight: '',
        province: '',
        provErr: '',
        city: '',
        district: '',
        address: '',
        addrErr: '',
        year: '',
        yearErr: '',
        month: '',
        day: '',
        text: '',
        orderCode: ''
      };
    },
    created () {
      setTitle('预约');
      initShare({
        title: '预约',
        desc: '合衣定制',
        link: location.href,
        imgUrl: getShareImg()
      });
      this.getLatestOrder();
    },
    methods: {
      getLatestOrder () {
        return getLatestOrder().then((data) => {
          this.isLoading = false;
          this.initData(data);
        }).catch(() => {
          this.isLoading = false;
        });
      },
      initData (data) {
        if (data.order) {
          this.disabled = true;
          this.orderCode = data.order.code;
          this.name = data.order.applyName;
          this.telphone = data.order.applyMobile;
          this.height = data.map['6-02'];
          this.weight = data.map['6-03'];
          this.province = data.order.ltProvince;
          this.city = data.order.ltCity;
          this.district = data.order.ltArea;
          this.address = data.order.ltAddress;
          let ltDatetime = formatDate(data.order.ltDatetime, 'yyyy-MM-dd');
          ltDatetime = ltDatetime.split('-');
          this.year = ltDatetime[0];
          this.month = ltDatetime[1];
          this.day = ltDatetime[2];
          if (data.order.status === '1' || data.order.status === '2') {
            this.curBtn = 'cancelBtn';
          } else if (data.order.status !== '11') {
            this.curBtn = 'reBtn';
          } else {
            this.disabled = false;
          }
        } else {
          this.curBtn = 'bookBtn';
          this.disabled = false;
        }
      },
      _book () {
        if (this.valid()) {
          this.btnDisabled = true;
          this.isLoading = true;
          book({
            applyName: this.name,
            applyMobile: this.telphone,
            map: {
              '6-02': this.height,
              '6-03': this.weight
            },
            ltProvince: this.province,
            ltCity: this.city,
            ltArea: this.district,
            ltAddress: this.address,
            ltDatetime: `${this.year}-${this.month}-${this.day}`
          }).then((data) => {
            this.btnDisabled = false;
            this.isLoading = false;
            this.text = '预约成功';
            this.$refs.toast.show();
            this.orderCode = data.code;
            this.curBtn = 'cancelBtn';
          }).catch(() => {
            this.btnDisabled = false;
            this.isLoading = false;
          });
        }
      },
      _cancel () {
        this.$refs.confirm.show();
      },
      handleConfirm () {
        this.btnDisabled = true;
        this.isLoading = true;
        cancelBook(this.orderCode).then(() => {
          this.getLatestOrder().then(() => {
            this.isLoading = false;
            this.btnDisabled = false;
            this.text = '预约取消成功';
            this.$refs.toast.show();
          });
        }).catch(() => {
          this.isLoading = false;
          this.btnDisabled = false;
        });
      },
      _reBook () {
        this.btnDisabled = true;
        this.isLoading = true;
        reBook(`${this.year}-${this.month}-${this.day}`).then((data) => {
          this.isLoading = false;
          this.btnDisabled = false;
          this.text = '一键复购成功';
          this.$refs.toast.show();
          this.orderCode = data.code;
          this.curBtn = 'cancelBtn';
        }).catch(() => {
          this.isLoading = false;
          this.btnDisabled = false;
        });
      },
      updateDate (year, month, day) {
        this.year = year;
        this.month = month;
        this.day = day;
        return this._yearValid();
      },
      updateAddress (province, city, district) {
        this.province = province;
        this.city = city;
        this.district = district;
        return this._provValid();
      },
      handleLoad () {
        setTimeout(() => {
          this.$refs.scroll.refresh();
        }, 20);
      },
      showTime () {
        return this.disabled && this.curBtn !== 'reBtn';
      },
      valid () {
        let r1 = this._nameValid();
        let r2 = this._telValid();
        let r3 = this._addrValid();
        let r4 = this._provValid();
        let r5 = this._yearValid();
        let r6 = !emptyValid(this.height).err;
        let r7 = !emptyValid(this.weight).err;
        if (r1 && r2 && r3 && r4 && r5) {
          if (r6 && r7) {
            return true;
          }
          if (!r6) {
            this.text = '身高不能为空';
          } else {
            this.text = '体重不能为空';
          }
          this.$refs.toast.show();
          return false;
        } else {
          return false;
        }
      },
      _nameValid () {
        let result = realNameValid(this.name);
        this.nameErr = result.msg;
        return !result.err;
      },
      _telValid () {
        let result = mobileValid(this.telphone);
        this.telErr = result.msg;
        return !result.err;
      },
      _addrValid () {
        let result = emptyValid(this.address);
        this.addrErr = result.msg;
        return !result.err;
      },
      _provValid () {
        let result = emptyValid(this.province);
        this.provErr = result.msg;
        return !result.err;
      },
      _yearValid () {
        let result = emptyValid(this.year);
        this.yearErr = result.msg;
        return !result.err;
      }
    },
    components: {
      Scroll,
      DatePicker,
      CityPicker,
      Toast,
      Loading,
      Confirm
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .book-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0.98rem;
    width: 100%;
    padding: 0.3rem 0.38rem;
    background: #fff;
    /*overflow: scroll;*/

    .scroll-content {
      position: relative;
      height: 100%;
    }

    .banner {
      img {
        width: 100%;
      }
    }

    .book-form {
      padding-top: 0.4rem;

      .form-item {
        border-radius: 0.16rem;
        min-height: 0.8rem;
        padding: 0 0.26rem;
        margin-bottom: 0.2rem;
        border: 1px solid #9d9d9d;
        display: flex;
        align-items: center;
        word-wrap: break-word;
        flex-wrap: wrap;
        background: #eee;

        label {
          font-size: $font-size-medium;
          display: inline-block;
          width: 1.6rem;
          flex: 0 0 1.6rem;
        }

        .input-item {
          font-size: $font-size-medium;
          flex: 1;
          line-height: 1.5;
          width: 100%;
          background: transparent;

          &.tc {
            text-align: center;
          }
        }

        span {
          padding-left: 0.16rem;
          font-size: $font-size-medium;
        }
        .error {
          font-size: $font-size-medium;
          color: #ff0000;
        }
      }

      &.disabled {
        .form-item {
          border-radius: 0;
          border-left: none;
          border-right: none;
          background: transparent;
        }
      }

      .average {
        float: left;
        width: 50%;

        &.pr {
          padding-right: 0.2rem;
        }

        &.pl {
          padding-left: 0.2rem;
        }

        .form-item {
          label {
            width: 0.9rem;
            flex: 0 0 0.9rem;
          }
        }
      }
    }

    .book-btns {
      padding: 0.5rem 0;

      button {
        width: 100%;
        height: 0.8rem;
        line-height: 0.8rem;
        border-radius: 0.12rem;
        color: #fff;
        font-size: $font-size-medium;

        &.book-btn {
          background-color: $primary-color;
        }

        &.btn-cancel {
          background-color: $color-cancel-background;
        }

        &.btn-fg {
          background-color: $primary-color;
        }

        &[disabled] {
          background-color: $color-disable-background;
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
  }
</style>
