// @flow
type imageStyle = 'thumbnail' | 'medium' | 'big'

/**
 * Optimize an image using build-in ali-oss processes
 */
export const optimize = (src: string, style: imageStyle): string => {
  if (src.indexOf('aliyuncs.com') < 0) return src;
  return `${src}?x-oss-process=style/${style}`
};
