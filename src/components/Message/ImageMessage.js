import React from 'react';
import { Dimensions } from 'react-native'
import AutoHeightImage from 'react-native-auto-height-image'
import { ImageWrapper } from './style'
import { optimize } from '../../utils/images'

export const ImageWidth = Dimensions.get('window').width / 2 - 32

export default ({ src }) => {
  const uri = optimize(src, 'medium')

  return (
    <ImageWrapper>
      <AutoHeightImage width={ImageWidth} source={{uri}} />
    </ImageWrapper>
  )
}