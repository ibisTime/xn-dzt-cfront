<template>
  <transition name="slide">
    <div class="order-detail-wrapper">
      <scroll ref="scroll" class="order-content">
        <div>
          <h1>订单信息</h1>
          <div class="order-info">
            <p><label>订单编号</label>{{currentOrder && currentOrder.code}}</p>
            <p><label>下单时间</label>{{(currentOrder && currentOrder.createDatetime) | formatDate('yyyy-MM-dd hh:mm')}}</p>
            <p><label>订单状态</label><span class="status">{{(currentOrder && currentOrder.status) | formatStatus}}</span></p>
            <p v-show="showCancelBtn() || showPayBtn() || showRatingBtn() || showReceiveBtn()">
              <label>订单操作</label>
              <span class="btn cancel" v-show="showCancelBtn()" @click="_cancelOrder">取消订单</span>
              <span class="btn" v-show="showPayBtn()" @click="payOrder">立即支付</span>
              <span class="btn" v-show="showRatingBtn()" @click="ratingOrder">立即评价</span>
              <span class="btn" v-show="showReceiveBtn()" @click="receiveOrder">确认收货</span>
            </p>
          </div>
          <div class="order-info">
            <p><label>下单产品</label>{{getModel()}}</p>
            <p><label>面料编号</label>{{getMaterialCode()}}</p>
            <p><label>订单价格</label>{{getAmount()}}</p>
          </div>
          <h1>物流信息</h1>
          <div class="order-info">
            <div v-if="currentOrder && currentOrder.logisticsCompany">
              <p><label>物流公司</label>{{getCompany()}}</p>
              <p><label>发货时间</label>{{(currentOrder && currentOrder.deliveryDatetime) | formatDate('yyyy-MM-dd hh:mm')}}</p>
              <p><label>快递单号</label>{{currentOrder && currentOrder.logisticsCode}}</p>
              <p><label>收货确认</label>{{isReceived()}}</p>
            </div>
            <div v-else>
              <p>无</p>
            </div>
          </div>
          <h1>定制信息</h1>
          <h2>衬衫定制信息</h2>
          <div class="order-info1">
            <div v-if="productInfo && productInfo.productSpecsList && productInfo.productSpecsList.length">
              <p><label>规格</label>{{getTechName('1-1')}}</p>
              <p><label>领型</label>{{getTechName('1-3')}}</p>
              <p><label>袖型</label>{{getTechName('1-4')}}</p>
              <p><label>门襟</label>{{getTechName('1-5')}}</p>
              <p><label>下摆</label>{{getTechName('1-6')}}</p>
              <p><label>收省</label>{{getTechName('1-7')}}</p>
              <p><label>领口颜色</label>{{getTechName('1-8')}}</p>
              <p><label>口袋</label>{{getTechName('1-9')}}</p>
              <p><label>纽扣</label>{{getTechName('1-10')}}</p>
              <p><label>纽扣颜色</label>{{getTechName('1-11')}}</p>
            </div>
            <div v-else>
              <p>无</p>
            </div>
          </div>
          <h2>刺绣定制信息</h2>
          <div class="order-info1">
            <div v-if="getCXCont()">
              <p><label>刺绣内容</label>{{getCXCont()}}</p>
              <p><label>刺绣字体</label>{{getTechName('5-3')}}</p>
              <p><label>刺绣位置</label>{{getCXLocation()}}</p>
              <p><label>刺绣颜色</label>{{getTechName('5-4')}}</p>
            </div>
            <div v-else>
              <p>无</p>
            </div>
          </div>
          <h1>备注</h1>
          <div class="remark">
            <p>{{currentOrder && currentOrder.remark || '无'}}</p>
          </div>
        </div>
      </scroll>
      <div v-show="loadingFlag" class="loading-container">
        <div class="loading-wrapper">
          <loading title="取消中..."></loading>
        </div>
      </div>
      <confirm ref="confirm" :text="text" @confirm="handleConfirm"></confirm>
      <rating ref="rating" @ratingSuc="ratingSuccess" :orderCode="code"></rating>
      <router-view></router-view>
    </div>
  </transition>
</template>
<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex';
  import Scroll from 'base/scroll/scroll';
  import Confirm from 'base/confirm/confirm';
  import Loading from 'base/loading/loading';
  import {getOrder, cancelBook, receiveOrder, getTechMapList, getModelList} from 'api/biz';
  import {getDictList} from 'api/general';
  import {SET_CURRENT_ORDER} from 'store/mutation-types';
  import {ORDER_STATUS} from '../orders/config';
  import {isUnDefined, formatAmount, setTitle} from 'common/js/util';
  import {commonMixin} from 'common/js/mixin';
  import Rating from 'components/rating/rating';

  export default {
    mixins: [commonMixin],
    data() {
      return {
        loadingFlag: true,
        productInfo: null,
        text: ''
      };
    },
    created() {
      setTitle('订单详情');
      this.first = true;
      this.code = this.$route.params.code;
      this.techMap = null;
      this.wlComps = null;
      this.ztLocas = null;
      this.modelList = null;
      this.getInitData();
    },
    computed: {
      ...mapGetters([
        'currentOrder',
        'orderList'
      ])
    },
    methods: {
      getInitData() {
        if (this.shouldGetData()) {
          this.first = false;
          this._getOrder();
        }
      },
      _getOrder() {
        Promise.all([
          getOrder(this.code),
          getDictList('wl_company'),
          getDictList('5-2'),
          getTechMapList(),
          getModelList(true)
        ]).then(([data, wlComps, ztLocas, techMap, modelList]) => {
          if (!this.currentOrder) {
            this.setCurrentOrder(data);
          }
          this.productInfo = data.productList && data.productList.length && data.productList[0] || null;
          this.wlComps = wlComps;
          this.ztLocas = ztLocas;
          this.techMap = techMap;
          this.modelList = modelList;
          this.loadingFlag = false;
          setTimeout(() => {
            this.$refs.scroll.refresh();
          }, 20);
        }).catch(() => {
          this.loadingFlag = false;
        });
      },
      showPayBtn() {
        if (!this.currentOrder) {
          return false;
        }
        if (this.currentOrder.status === '2') {
          return true;
        }
        return false;
      },
      showCancelBtn() {
        if (!this.currentOrder) {
          return false;
        }
        if (this.currentOrder.status === '1' || this.currentOrder.status === '2') {
          return true;
        }
        return false;
      },
      showRatingBtn() {
        if (!this.currentOrder) {
          return false;
        }
        if (this.currentOrder.status === '8') {
          return true;
        }
        return false;
      },
      showReceiveBtn(status) {
        if (!this.currentOrder) {
          return false;
        }
        if (this.currentOrder.status === '7') {
          return true;
        }
        return false;
      },
      getMaterialCode() {
        if (!this.productInfo) {
          return '无';
        }
        let index = this._getIndexFromSpecsList('1-2');
        if (~index) {
          return this.productInfo.productSpecsList[index].code;
        }
        return '无';
      },
      getAmount() {
        if (!this.currentOrder || isUnDefined(this.currentOrder.amount)) {
          return '暂未定价';
        }
        return '¥' + formatAmount(this.currentOrder.amount);
      },
      getCompany() {
        if (!this.wlComps || !this.currentOrder.logisticsCompany) {
          return '';
        }
        let orderComp = this.currentOrder.logisticsCompany;
        let index = this.wlComps.findIndex((item) => {
          return orderComp === item.dkey;
        });
        return ~index ? this.wlComps[index].dvalue : '未知';
      },
      isReceived() {
        if (!this.currentOrder) {
          return '未知';
        }
        if (this.currentOrder.status === '8' || this.currentOrder.status === '9' || this.currentOrder.status === '10') {
          return '已收货';
        } else {
          return '未收货';
        }
      },
      getModel() {
        if (!this.productInfo || !this.currentOrder || !this.modelList) {
          return '无';
        }
        let modelCode = this.productInfo.modelCode;
        if (!modelCode) {
          return '无';
        }
        let index = this.modelList.findIndex((item) => {
          return item.code === modelCode;
        });
        return this.modelList[index].name;
      },
      getTechName(key) {
        if (!this.productInfo || !this.currentOrder || !this.techMap) {
          return '';
        }
        let index = this._getIndexFromSpecsList(key);
        if (~index) {
          let code = this.productInfo.productSpecsList[index].code;
          let keyList = this.techMap[key];
          if (!keyList) {
            return '';
          }
          let _index = keyList.findIndex((item) => {
            return item.code === code;
          });
          if (~_index) {
            return keyList[_index].name;
          }
          return '';
        }
        return '';
      },
      getCXLocation() {
        if (!this.productInfo || !this.currentOrder || !this.ztLocas) {
          return '';
        }
        let index = this._getIndexFromSpecsList('5-2');
        if (~index) {
          let code = this.productInfo.productSpecsList[index].code;
          let _index = this.ztLocas.findIndex((item) => {
            return item.dkey === code;
          });
          if (~_index) {
            return this.ztLocas[_index].dvalue;
          }
          return '';
        }
        return '';
      },
      getCXCont() {
        if (!this.productInfo || !this.currentOrder) {
          return '';
        }
        let index = this._getIndexFromSpecsList('5-1');
        if (~index) {
          return this.productInfo.productSpecsList[index].code;
        }
        return '';
      },
      _getIndexFromSpecsList(type) {
        let specList = this.productInfo.productSpecsList;
        return specList.findIndex((item) => {
          return item.type === type;
        });
      },
      _cancelOrder() {
        this.text = '确定取消订单吗';
        this.$refs.confirm.show();
      },
      handleConfirm() {
        this.loadingFlag = true;
        if (this.currentOrder.status === '7') {
          receiveOrder(this.code).then(() => {
            this.loadingFlag = false;
            var _order = {
              ...this.currentOrder,
              status: '8'
            };
            this.setCurrentOrder(_order);
            if (this.orderList) {
              this.editOrderListByReceived({
                code: this.code
              });
            }
          }).catch(() => {
            this.loadingFlag = false;
          });
        } else {
          cancelBook(this.code).then(() => {
            this.loadingFlag = false;
            let prevStatus = this.currentOrder.status;
            var _order = {
              ...this.currentOrder,
              status: '11'
            };
            this.setCurrentOrder(_order);
            if (this.orderList) {
              this.editOrderListByCancel({
                prevStatus,
                code: this.code
              });
            }
          }).catch(() => {
            this.loadingFlag = false;
          });
        }
      },
      payOrder() {
        this.$router.push(`${this.$route.path}/pay?code=${this.code}`);
      },
      ratingOrder() {
        this.$refs.rating.show();
      },
      receiveOrder() {
        this.text = '确认收货';
        this.$refs.confirm.show();
      },
      shouldGetData() {
        if (/\/user\/order\/[^/]+$/.test(this.$route.path) && this.first) {
          return true;
        }
        return false;
      },
      ratingSuccess(code) {
        var _order = {
          ...this.currentOrder
        };
        _order.status = '9';
        this.setCurrentOrder(_order);
        if (this.orderList) {
          this.editOrderListByRating({code});
        }
      },
      ...mapMutations({
        'setCurrentOrder': SET_CURRENT_ORDER
      }),
      ...mapActions([
        'editOrderListByRating',
        'editOrderListByCancel',
        'editOrderListByReceived'
      ])
    },
    filters: {
      formatStatus(status) {
        if (isUnDefined(status)) {
          return '未知';
        }
        return ORDER_STATUS[status];
      }
    },
    components: {
      Scroll,
      Confirm,
      Loading,
      Rating
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .order-detail-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 101;
    background: #fff;

    .order-content {
      height: 100%;
      position: relative;
      overflow: hidden;
      padding: 0 18px;

      h1 {
        padding: 12px 16px 10px;
        font-size: $font-size-medium-x;
        color: $primary-color;
      }

      .order-info {
        padding-left: 30px;
        padding-bottom: 14px;
        border-top: 1px solid #a1a1a1;
        font-size: $font-size-medium;

        p {
          padding-top: 16px;
          padding-bottom: 2px;
          color: #333;

          label {
            padding-right: 16px;
            color: $primary-color;
          }

          .btn {
            display: inline-block;
            padding: 2.5px 10.5px 3.5px;
            margin-right: 10px;
            border: 1px solid #d2d2d2;
            border-radius: 14px;
            color: $primary-color;

            &.cancel {
              color: #b3b3b3;
            }
          }
        }
      }

      h2 {
        width: 100%;
        height: 30px;
        line-height: 30px;
        border-radius: 8px;
        text-align: center;
        font-size: $font-size-medium-x;
        color: #fff;
        background: $primary-color;
      }

      .order-info1 {
        padding-bottom: 15px;
        font-size: $font-size-medium;
        color: #333;

        p {
          padding: 16px 0 14px 16px;
          border-bottom: 1px solid #d2d2d2;

          label {
            display: inline-block;
            padding-right: 19px;
            min-width: 80px;
            color: $primary-color;
          }
        }
      }

      .remark {
        border-top: 1px solid #d2d2d2;
        padding: 21.5px 16px;
        font-size: $font-size-medium;

        p {
          padding-bottom: 2px;
          line-height: 1.2;
          border-bottom: 1px solid #d6d6d6;
        }
      }
    }

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
