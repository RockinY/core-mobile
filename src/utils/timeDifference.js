// @flow
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60000;
const MS_PER_HOUR = 3600000;
const MS_PER_DAY = 86400000;
const MS_PER_YEAR = 31536000000;

export function timeDifferenceShort(current: number, previous: number) {
  const elapsed = current - previous;

  if (elapsed < MS_PER_MINUTE) {
    return Math.round(elapsed / MS_PER_SECOND) + '秒';
  } else if (elapsed < MS_PER_HOUR) {
    return Math.round(elapsed / MS_PER_MINUTE) + '分钟';
  } else if (elapsed < MS_PER_DAY) {
    return Math.round(elapsed / MS_PER_HOUR) + '小时';
  } else if (elapsed < MS_PER_YEAR) {
    return Math.round(elapsed / MS_PER_DAY) + '天';
  } else {
    return Math.round(elapsed / MS_PER_YEAR) + '年';
  }
}

export function timeDifference(current: number, previous: ?number): string {
  if (!previous) return '';

  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  let elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return '刚才';
  } else if (elapsed < msPerHour) {
    const now = Math.round(elapsed / msPerMinute);
    if (now === 1) {
      return '1分钟之前';
    } else {
      return `${now}分钟之前`;
    }
  } else if (elapsed < msPerDay) {
    const now = Math.round(elapsed / msPerHour);
    if (now === 1) {
      return '1小时之前';
    } else {
      return `${now}小时之前`;
    }
  } else if (elapsed < msPerMonth) {
    const now = Math.round(elapsed / msPerDay);
    if (now === 1) {
      return '昨天';
    } else if (now >= 7 && now <= 13) {
      return '1周之前';
    } else if (now >= 14 && now <= 20) {
      return '2周之前';
    } else if (now >= 21 && now <= 28) {
      return '3周之前';
    } else {
      return `${now}天之前`;
    }
  } else if (elapsed < msPerYear) {
    const now = Math.round(elapsed / msPerMonth);
    if (now === 1) {
      return '1个月之前';
    } else {
      return `${now}个月之前`;
    }
  } else {
    const now = Math.round(elapsed / msPerYear);
    if (now === 1) {
      return '1年之前';
    } else {
      return `${now}年之前`;
    }
  }
}
