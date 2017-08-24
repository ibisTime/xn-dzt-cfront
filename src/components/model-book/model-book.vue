<template>
  <transition name="slide-up">
    <div v-show="showFlag" class="model-book-wrapper" @click.stop>
      <div class="content">
        <div class="close" @click="hide">
          <i class="close-icon close-icon0"></i>
          <i class="close-icon close-icon1"></i>
        </div>
        <div class="book-form">
          <div class="form-item">
            <label>姓名</label>
            <input class="input-item" type="text" v-model="name" @change="_nameValid" placeholder="待量体者姓名"/>
            <span class="error">{{nameErr}}</span>
          </div>
          <div class="form-item">
            <label>手机</label>
            <input class="input-item" type="tel" v-model="telphone" @change="_telValid" placeholder="待量体者手机"/>
            <span class="error">{{telErr}}</span>
          </div>
          <div class="clearfix">
            <div class="average pr">
              <div class="form-item">
                <label>身高</label>
                <input class="input-item tc" type="number" v-model="height"/>
                <span>cm</span>
              </div>
            </div>
            <div class="average pl">
              <div class="form-item">
                <label>体重</label>
                <input class="input-item tc" type="number" v-model="weight"/>
                <span>kg</span>
              </div>
            </div>
          </div>
          <div class="form-item">
            <label>量体地址</label>
            <city-picker class="input-item"
                         :province="province"
                         :city="city"
                         :district="district"
                         @change="updateAddress"></city-picker>
            <span class="error">{{provErr}}</span>
          </div>
          <div class="form-item">
            <label></label>
            <input class="input-item" type="text" v-model="address" @change="_addrValid" placeholder="街道门牌信息"/>
            <span class="error">{{addrErr}}</span>
          </div>
          <div class="form-item">
            <label>量体时间</label>
            <date-picker class="input-item"
                         :year="year"
                         :month="month"
                         :day="day"
                         @change="updateDate"></date-picker>
            <span class="error">{{yearErr}}</span>
          </div>
        </div>
        <div class="book-btns">
          <button class="book-btn" :disabled="disabled" @click="_book">提交预约</button>
        </div>
        <toast ref="toast" :text="text"></toast>
      </div>
    </div>
  </transition>
</template>
<script>
  import DatePicker from 'base/date-picker/date-picker';
  import CityPicker from 'base/city-picker/city-picker';
  import Toast from 'base/toast/toast';
  import {book} from 'api/biz';
  import {realNameValid, mobileValid, emptyValid} from 'common/js/util';

  export default {
    data() {
      return {
        showFlag: false,
        disabled: false,
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
        text: ''
      };
    },
    props: {
      productCode: {
        type: String,
        default: ''
      }
    },
    methods: {
      show() {
        this.showFlag = true;
      },
      hide() {
        this.showFlag = false;
      },
      _book() {
        if (this.valid()) {
          this.disabled = true;
          book({
            applyName: this.name,
            applyMobile: this.telphone,
            map: {
              '6-2': this.height,
              '6-3': this.weight
            },
            ltProvince: this.province,
            ltCity: this.city,
            ltArea: this.district,
            ltAddress: this.address,
            ltDatetime: `${this.year}-${this.month}-${this.day}`,
            productCode: this.productCode
          }).then((data) => {
            this.text = '预约成功';
            this.disabled = false;
            this.$refs.toast.show();
            setTimeout(() => {
              this.showFlag = false;
            }, 1000);
          }).catch(() => {
            this.disabled = false;
          });
        }
      },
      updateDate(year, month, day) {
        this.year = year;
        this.month = month;
        this.day = day;
        return this._yearValid();
      },
      updateAddress(province, city, district) {
        this.province = province;
        this.city = city;
        this.district = district;
        return this._provValid();
      },
      valid() {
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
      _nameValid() {
        let result = realNameValid(this.name);
        this.nameErr = result.msg;
        return !result.err;
      },
      _telValid() {
        let result = mobileValid(this.telphone);
        this.telErr = result.msg;
        return !result.err;
      },
      _addrValid() {
        let result = emptyValid(this.address);
        this.addrErr = result.msg;
        return !result.err;
      },
      _provValid() {
        let result = emptyValid(this.province);
        this.provErr = result.msg;
        return !result.err;
      },
      _yearValid() {
        let result = emptyValid(this.year);
        this.yearErr = result.msg;
        return !result.err;
      }
    },
    components: {
      Toast,
      DatePicker,
      CityPicker
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";

  .model-book-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 103;
    background: #fff;

    .content {
      height: 100%;
      padding: 15px 19px;

      .close {
        position: absolute;
        width: 40px;
        height: 40px;

        .close-icon {
          position: absolute;
          width: 3px;
          height: 30px;
          background: #666;
          left: 18px;

          &.close-icon0 {
            transform: rotateZ(45deg);
          }

          &.close-icon1 {
            transform: rotateZ(-45deg);
          }
        }
      }

      .book-form {
        margin-top: 50px;

        .form-item {
          border-radius: 8px;
          height: 40px;
          padding: 0 13px;
          margin-bottom: 10px;
          border: 1px solid #9d9d9d;
          display: flex;
          align-items: center;
          background: #eee;

          label {
            font-size: $font-size-medium;
            display: inline-block;
            width: 80px;
            flex: 0 0 80px;
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
            padding-left: 8px;
          }
          .error {
            font-size: 14px;
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
            padding-right: 10px;
          }

          &.pl {
            padding-left: 10px;
          }

          .form-item {
            label {
              width: 45px;
              flex: 0 0 45px;
            }
          }
        }
      }

      .book-btns {
        padding: 25px 0;

        button {
          width: 100%;
          height: 40px;
          line-height: 40px;
          border-radius: 6px;
          color: #fff;
          font-size: $font-size-medium;

          &.book-btn {
            background-color: $primary-color;
          }

          &[disabled] {
            background-color: $color-disable-background;
          }
        }
      }
    }
  }

  .slide-up-enter-active, .slide-up-leave-active {
    transition: all 0.3s;
  }

  .slide-up-enter, .slide-up-leave-to {
    transform: translate3d(0, 100%, 0);
  }
</style>
