let now = new Date();

const _DAYS1 = (() => {
  return Array.apply(null, { length: 28 }).map((item, index) => {
    return {
      text: `${index + 1}日`,
      value: index + 1
    };
  });
})();

const _DAYS2 = (() => {
  return Array.apply(null, { length: 29 }).map((item, index) => {
    return {
      text: `${index + 1}日`,
      value: index + 1
    };
  });
})();

const _DAYS3 = (() => {
  return Array.apply(null, { length: 30 }).map((item, index) => {
    return {
      text: `${index + 1}日`,
      value: index + 1
    };
  });
})();

const _DAYS4 = (() => {
  return Array.apply(null, { length: 31 }).map((item, index) => {
    return {
      text: `${index + 1}日`,
      value: index + 1
    };
  });
})();

const _MONTH2DAYS = {
  '1': _DAYS4,
  '2': _DAYS1,
  '3': _DAYS4,
  '4': _DAYS3,
  '5': _DAYS4,
  '6': _DAYS3,
  '7': _DAYS4,
  '8': _DAYS4,
  '9': _DAYS3,
  '10': _DAYS4,
  '11': _DAYS3,
  '12': _DAYS4
};

// 获取年份的列表
export function getYears() {
  let current = now.getFullYear();
  let min = current - 100;
  let max = current + 100;
  let years = [];
  for(let i = min; i <= max; i++) {
    years.push({
      text: `${i}年`,
      value: i
    });
  }
  return years;
}

export function getMonths() {
  let result = [];
  for(let i = 1; i <= 12; i++) {
    result.push({
      text: `${i}月`,
      value: i
    });
  }
  return result;
}

export function getDays(year, month) {
  if (month !== 2) {
    return _MONTH2DAYS[month];
  } else {
    if (_isLeapYear(year)) {
      return _DAYS2;
    } else {
      return _DAYS1;
    }
  }
}

// 获取当天的数据
export function getCurDatas() {
  return {
    selectedIndex: [100, now.getMonth(), now.getDate() - 1],
    datas: [getYears(), getMonths(), getDays(now.getFullYear(), now.getMonth() + 1)]
  };
}

function _isLeapYear(year) {
  return !!(!(year % 400) || (!(year % 4) && year % 100));
}
