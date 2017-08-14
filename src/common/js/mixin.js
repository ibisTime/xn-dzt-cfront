export const commonMixin = {
  filters: {
    formatImg(imgs, suffix) {
      if(!imgs) {
        return '';
      }
      let img = imgs.split(/\|\|/)[0];
      if (!/^http/i.test(img)) {
        suffix = suffix || '?imageMogr2/auto-orient';
        // img = PIC_PREFIX + img + suffix;
        img = img + suffix;
      }
      return img;
    }
  }
};
