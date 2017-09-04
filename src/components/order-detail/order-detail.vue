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
            <p><label>面料编号</label><span v-html="getMaterialCode()"></span></p>
            <p><label>订单价格</label><span v-if="getOriAmount()" class="ori-amount">{{getOriAmount()}}</span>{{getAmount()}}</p>
          </div>
          <h1>物流信息</h1>
          <div class="order-info">
            <div v-if="currentOrder && currentOrder.logisticsCompany">
              <p><label>物流公司</label>{{getCompany()}}</p>
              <p><label>发货时间</label>{{(currentOrder && currentOrder.deliveryDatetime) | formatDate('yyyy-MM-dd')}}</p>
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
            <div v-if="getTechName('1-01')">
              <p><label>{{getLabelName('1-01')}}</label>{{getTechName('1-01')}}</p>
              <p><label>{{getLabelName('1-03')}}</label>{{getTechName('1-03')}}</p>
              <p><label>{{getLabelName('1-04')}}</label>{{getTechName('1-04')}}</p>
              <p><label>{{getLabelName('1-05')}}</label>{{getTechName('1-05')}}</p>
              <p><label>{{getLabelName('1-06')}}</label>{{getTechName('1-06')}}</p>
              <p><label>{{getLabelName('1-07')}}</label>{{getTechName('1-07')}}</p>
              <p><label>{{getLabelName('1-08')}}</label>{{getTechName('1-08')}}</p>
            </div>
            <div v-else>
              <p>无</p>
            </div>
          </div>
          <h2>刺绣定制信息</h2>
          <div class="order-info1">
            <div v-if="getCXCont()">
              <p><label>刺绣内容</label>{{getCXCont()}}</p>
              <p><label>{{getLabelName('5-03')}}</label>{{getTechName('5-03')}}</p>
              <p><label>{{getLabelName('5-02')}}</label>{{getTechName('5-02')}}</p>
              <p><label>{{getLabelName('5-04')}}</label>{{getTechName('5-04')}}</p>
            </div>
            <div v-else>
              <p>无</p>
            </div>
          </div>
          <h1>备注</h1>
          <div class="remark">
            <p>{{getRemark()}}</p>
          </div>
        </div>
      </scroll>
      <div v-show="loadingFlag" class="loading-container">
        <div class="loading-wrapper">
          <loading :title="loadingText"></loading>
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
  import {getOrder, cancelBook, receiveOrder, getTechMapList} from 'api/biz';
  import {getBizDictMap, getDictList} from 'api/general';
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
        text: '',
        loadingText: ''
      };
    },
    created() {
      setTitle('订单详情');
      this.first = true;
      this.code = this.$route.params.code;
      this.techMap = null;
      this.wlComps = null;
      this.dictMap = null;
      this.fabricYarn = null;
      this.getInitData();
    },
    computed: {
      ...mapGetters([
        'currentOrder',
        'orderList'
      ])
    },
    updated() {
      this.getInitData();
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
          getBizDictMap(),
          getTechMapList(),
          getDictList('wl_company'),
          getDictList('fabric_yarn')
        ]).then(([data, dictMap, techMap, wlComps, fabricYarn]) => {
          if (!this.currentOrder) {
            this.setCurrentOrder(data);
          }
          this.productInfo = data.productList && data.productList.length && data.productList[0] || null;
          this.dictMap = dictMap;
          this.techMap = techMap;
          this.wlComps = wlComps;
          this.fabricYarn = fabricYarn;
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
      getRemark() {
        if (!this.productInfo) {
          return '无';
        }
        let index = this._getIndexFromSpecsList('6-05');
        return ~index ? this.productInfo.productSpecsList[index].code : '无';
      },
      getMaterialCode() {
        if (!this.productInfo) {
          return '无';
        }
        let index = this._getIndexFromSpecsList('1-02');
        if (~index) {
          let _model = this.productInfo.productSpecsList[index];
          let _index = this.fabricYarn.findIndex((item) => {
            return item.dkey === _model.yarn;
          });
          return `${_model.modelNum} &nbsp;${this.fabricYarn[_index].dvalue}`;
        }
        return '无';
      },
      getAmount() {
        if (!this.currentOrder || isUnDefined(this.currentOrder.amount)) {
          return '暂未定价';
        }
        return '¥' + formatAmount(this.currentOrder.amount);
      },
      getOriAmount() {
        if (!this.currentOrder || isUnDefined(this.currentOrder.originalAmount) || this.currentOrder.amount === this.currentOrder.originalAmount) {
          return '';
        } else {
          return '¥' + formatAmount(this.currentOrder.originalAmount);
        }
      },
      getCompany() {
        if (!this.wlComps || !this.currentOrder.logisticsCompany) {
          return '';
        }
        let orderComp = this.currentOrder.logisticsCompany;
        let index = this.wlComps.findIndex((item) => {
          return item.dkey === orderComp;
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
        if (!this.productInfo || !this.currentOrder) {
          return '无';
        }
        return this.productInfo.modelName || '无';
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
      getCXCont() {
        if (!this.productInfo || !this.currentOrder) {
          return '';
        }
        let index = this._getIndexFromSpecsList('5-01');
        if (~index) {
          return this.productInfo.productSpecsList[index].code;
        }
        return '';
      },
      getLabelName(key) {
        if (!this.dictMap) {
          return '';
        }
        return this.dictMap['measure'][key] || '未知';
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
          this.loadingText = '收货中...';
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
          this.loadingText = '取消中';
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

          .ori-amount {
            text-decoration: line-through;
            color: #999;
            padding-right: 4px;
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
