<template>
  <transition name="slide">
    <div class="flow-wrapper">
      <scroll :data="flows" :pullup="pullup" @scrollToEnd="getPageFlow" class="flow-content">
        <div>
          <ul>
            <li v-for="item in flows">
              <div class="time">{{item.createDatetime | formatDate('yy/MM/dd')}}</div>
              <div class="info">
                <p class="note">{{item.bizNote}}</p>
                <p class="trans-amount">积分 {{formatAmount(item.transAmount)}}</p>
              </div>
            </li>
            <loading class="loading" v-show="hasMore" title=""></loading>
          </ul>
        </div>
      </scroll>
      <div v-show="!hasMore && !flows.length" class="no-result-wrapper">
        <no-result title="抱歉，暂无账单"></no-result>
      </div>
    </div>
  </transition>
</template>
<script>
  import {getPageFlow, getAccount} from 'api/account';
  import {mapGetters, mapMutations} from 'vuex';
  import {SET_JF_ACCOUNT} from 'store/mutation-types';
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import NoResult from 'base/no-result/no-result';
  import {commonMixin} from 'common/js/mixin';
  import {formatAmount, setTitle} from 'common/js/util';

  const LIMIT = 20;

  export default {
    mixins: [commonMixin],
    data() {
      return {
        flows: [],
        start: 1,
        hasMore: true
      };
    },
    created() {
      setTitle('积分账单');
      this.pullup = true;
      if (this.jfAccount) {
        this.getPageFlow();
      } else {
        this.getAccount().then(() => {
          this.getPageFlow();
        });
      }
    },
    computed: {
      ...mapGetters([
        'jfAccount'
      ])
    },
    methods: {
      getAccount() {
        return getAccount().then((data) => {
          data.forEach((item) => {
            if (item.currency === 'JF') {
              this.setJFAccount(item);
            }
          });
          return data;
        });
      },
      getPageFlow() {
        if (this.hasMore) {
          return getPageFlow(this.start, LIMIT, this.jfAccount.accountNumber).then((data) => {
            if (data.list.length < LIMIT || data.totalCount <= LIMIT) {
              this.hasMore = false;
            }
            this.flows = this.flows.concat(data.list);
            this.start++;
          });
        }
      },
      formatAmount(amount) {
        let prefix = +amount > 0 ? '+' : '';
        return prefix + formatAmount(amount);
      },
      ...mapMutations({
        'setJFAccount': SET_JF_ACCOUNT
      })
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  };
</script>
<style lang="scss" scoped>
  @import "~common/scss/variable";

  .flow-wrapper{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;

    .flow-content {
      position: relative;
      height: 100%;

      ul {
        padding: 0 18px;

        li {
          display: flex;
          align-items: flex-start;
          padding: 18px 0 18px 18px;
          border-bottom: 1px solid #a1a1a1;

          .time {
            font-size: 13px;
          }

          .info {
            padding-left: 18px;

            .note {
              font-size: 13px;
            }

            .trans-amount {
              padding-top: 7px;
              font-size: $font-size-medium-x;
            }
          }
        }

        .loading {
          padding-top: 20px;
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
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s;
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
