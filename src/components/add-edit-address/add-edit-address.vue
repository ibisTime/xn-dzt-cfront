<template>
  <transition name="slide">
    <div class="form-wrapper">
      <div class="form-item">
        <div class="item-label">姓名</div>
        <div class="item-input-wrapper">
          <input type="text" class="item-input" v-model="name" @change="_nameValid" placeholder="请输入姓名">
          <span v-show="nameErr" class="error-tip">{{nameErr}}</span>
        </div>
      </div>
      <div class="form-item">
        <div class="item-label">手机号</div>
        <div class="item-input-wrapper">
          <input type="tel" class="item-input" v-model="mobile" @change="_mobileValid" placeholder="请输入手机号">
          <span v-show="mobErr" class="error-tip">{{mobErr}}</span>
        </div>
      </div>
      <div class="form-item">
        <div class="item-label">省市区</div>
        <div class="item-input-wrapper">
          <template v-if="code && province || !code">
            <city-picker class="item-input"
                         :province="province"
                         :city="city"
                         :district="district"
                         @change="cityChange">
            </city-picker>
          </template>
          <span v-show="provErr" class="error-tip">{{provErr}}</span>
        </div>
      </div>
      <div class="form-item is-textarea">
        <div class="item-label">详细地址</div>
        <div class="item-input-wrapper">
          <textarea v-model="address" @change="_addressValid" rows="2" class="item-input" placeholder="请输入详细地址"></textarea>
          <span v-show="addressErr" class="error-tip">{{addressErr}}</span>
        </div>
      </div>

      <div class="form-btn">
        <button :disabled="setting" @click="saveAddress">保存地址</button>
      </div>
      <div v-show="showLoading" class="loading-container">
        <div class="loading-wrapper">
          <loading></loading>
        </div>
      </div>
      <toast ref="toast" :text="toastText"></toast>
    </div>
  </transition>
</template>
<script>
  import {addAddress, editAddress, getAddressList} from 'api/user';
  import {mobileValid, setTitle} from 'common/js/util';
  import {mapGetters, mapMutations, mapActions} from 'vuex';
  import {SET_ADDRESS_LIST} from 'store/mutation-types';
  import CityPicker from 'base/city-picker/city-picker';
  import Loading from 'base/loading/loading';
  import Toast from 'base/toast/toast';

  export default {
    data() {
      return {
        setting: false,
        name: '',
        nameErr: '',
        mobile: '',
        mobErr: '',
        province: '',
        city: '',
        district: '',
        provErr: '',
        address: '',
        addressErr: '',
        isDefault: '0',
        showLoading: true,
        isAlert: true,
        toastText: ''
      };
    },
    created() {
      this.code = this.$route.query.code || '';
      if (this.code) {
        setTitle('修改地址');
        this.getAddress();
      } else {
        setTitle('新增地址');
        this._getAddressList();
      }
    },
    computed: {
      ...mapGetters([
        'addressList',
        'currentAddrCode'
      ])
    },
    methods: {
      getAddress() {
        let index = this.addressList.findIndex((item) => {
          return item.code === this.code;
        });
        if (!~index) {
          this._getAddressList();
        } else {
          this._initPageData(this.addressList[index]);
        }
      },
      _getAddressList() {
        getAddressList().then((data) => {
          this.setAddressList(data);
          if (this.code) {
            let index = data.findIndex((item) => {
              return item.code === this.code;
            });
            if (!~index) {
              this.toastText = '地址编号错误';
              this.$refs.toast.show();
            } else {
              this._initPageData(data[index]);
            }
          } else {
            this.showLoading = false;
          }
        }).catch(() => {
          this.showLoading = false;
        });
      },
      _initPageData(addr) {
        this.showLoading = false;
        this.name = addr.addressee;
        this.mobile = addr.mobile;
        this.address = addr.detailAddress;
        this.isDefault = addr.isDefault;
        this.province = addr.province;
        this.city = addr.city;
        this.district = addr.district;
      },
      cityChange(prov, city, district) {
        this.province = prov;
        this.city = city;
        this.district = district;
        this._provinceValid();
      },
      saveAddress() {
        if (this._valid()) {
          this.setting = true;
          let param = {
            addressee: this.name,
            mobile: this.mobile,
            province: this.province,
            city: this.city,
            district: this.district,
            detailAddress: this.address
          };
          if (this.code) {
            param.code = this.code;
            this._editAddress(param);
          } else {
            this._addAddress(param);
          }
        }
      },
      _editAddress(param) {
        editAddress(param).then(() => {
          this.setting = false;
          this.toastText = '修改成功';
          this.$refs.toast.show();
          let addressList = this.addressList.slice();
          let index = addressList.findIndex((item) => {
            return item.code === this.code;
          });
          addressList.splice(index, 1, param);
          this.setAddressList(addressList);
          setTimeout(() => {
            this.$router.back();
          }, 1000);
        }).catch(() => {
          this.setting = false;
        });
      },
      _addAddress(param) {
        addAddress(param).then((data) => {
          this.setting = false;
          this.toastText = '新增成功';
          this.$refs.toast.show();
          if (this.$route.query.lt) {
            this.addAddrAndSetCur({
              address: {
                code: data.code,
                ...param
              }
            });
          } else {
            let addressList = this.addressList.slice();
            addressList.push({
              code: data.code,
              ...param
            });
            this.setAddressList(addressList);
          }
          setTimeout(() => {
            this.$router.back();
          }, 1000);
        }).catch(() => {
          this.setting = false;
        });
      },
      _valid() {
        let r1 = this._nameValid();
        let r2 = this._mobileValid();
        let r3 = this._provinceValid();
        let r4 = this._addressValid();
        return r1 && r2 && r3 && r4;
      },
      _nameValid() {
        if (!this.name) {
          this.nameErr = '不能为空';
          return false;
        }
        return true;
      },
      _mobileValid() {
        let result = mobileValid(this.mobile);
        this.mobErr = result.msg;
        return !result.err;
      },
      _provinceValid() {
        if (!this.province) {
          this.provErr = '不能为空';
          return false;
        }
        return true;
      },
      _addressValid() {
        if (!this.address) {
          this.addressErr = '不能为空';
          return false;
        }
        return true;
      },
      ...mapMutations({
        setAddressList: SET_ADDRESS_LIST
      }),
      ...mapActions([
        'addAddrAndSetCur'
      ])
    },
    components: {
      CityPicker,
      Loading,
      Toast
    }
  };
</script>
<style lang="scss" scoped rel="stylesheet/scss">
  .form-wrapper {
    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);

      .loading-wrapper {
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translate3d(0, -50%, 0);
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
