import {formatDate, formatAmount} from 'common/js/util';

export const commonMixin = {
  filters: {
    formatImg(imgs, suffix = '?imageMogr2/auto-orient') {
      if(!imgs) {
        return '';
      }
      let img = imgs.split(/\|\|/)[0];
      if (!/^http/i.test(img)) {
        img = PIC_PREFIX + img + suffix;
      }
      return img;
    },
    formatDate(date, format = 'yyyy-MM-dd') {
      if (!date) {
        return '--';
      }
      return formatDate(date, format);
    },
    formatAmount(price) {
      return formatAmount(price);
    }
  }
};
