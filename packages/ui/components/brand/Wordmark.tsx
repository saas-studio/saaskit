import React, { FC } from 'react'
import { useGoogleFonts, GoogleFontsStatus } from "@flayyer/use-googlefonts";

export interface Props {
  name?: string,
  color?: string,
  fontFamily?: string,
  nameLeft?: string,
  nameRight?: string,
  fontLeft?: string,
  fontRight?: string,
}

export const Wordmark: FC<Props> = ({name = 'SaaS.Dev', color = 'gray-900', fontFamily = 'Cabin'}) => {
    const font = useGoogleFonts([
        {
            family: fontFamily, // Family Name
            styles: [
            "600..700", // Range, if family supports it.
            "100..200italic", // Range with italic
            "300italic", // Weight with italic
            "regular", // Shortcut to 400
            "italic", // Shortcut to 400 Italic
            "500", // Regular with weight
            444, // Regular weight for variable font
            ],
        },
        {
            family: "Roboto", // Family Name - Roboto doesn't support ranges
            styles: [
            "300italic", // Weight with italic
            "regular", // Shortcut to 400
            "italic", // Shortcut to 400 Italic
            "500",
            100,
            ],
        },
    ]);

    if (font.status === GoogleFontsStatus.FAILED) {
        console.log(font.error);
    }

  return (
    <h1 className={color} style={{ fontFamily: `'${fontFamily}', sans-serif` }}>
        {name}
    </h1>
  )
};
