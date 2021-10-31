import React, { FC } from 'react'
import { BsFillSquareFill } from 'react-icons/bs'
import { GrCubes } from 'react-icons/gr'

export interface Props {
    size?: number,
    backgroundColor?: string,
    foregroundColor?: string,
}

export const Icon: FC<Props> = ({size = 32, backgroundColor = 'gray-600', foregroundColor = 'gray-100'}) => {
  return (
    <div className="object-center">
        <BsFillSquareFill size={size} className={`absolute text-${backgroundColor}`} />
        <GrCubes size={size * 0.7} className={`absolute text-${foregroundColor}`} />
    </div>
  )
};