import React, { FC } from 'react'
import { BsFillSquareFill } from 'react-icons/bs';

export interface Props {
    size?: string,
}

export const Icon: FC<Props> = ({}) => {
  return (
    <div>
        <BsFillSquareFill  />
    </div>
  )
};
