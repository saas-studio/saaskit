import { Gif, Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'

import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

// use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
const gf = new GiphyFetch(process.env.GIPHY_KEY ?? '')

// configure your fetch: fetch 10 gifs at a time as the user scrolls (offset is handled by the grid)
const fetchGifs = (offset: number) => gf.trending({ offset, limit: 10 })


import React from 'react';
import {Video} from 'remotion';
import playerDemo from './remotion-player.webm';
import { IGif } from '@giphy/js-types';

export const GIF: React.FC<{id: string}> = ({id}) => {
	
	const [gif, setGif] = useState<IGif>();
	const [handle] = useState(() => delayRender());
   
	const fetchData = async () => {
		const { data } = await gf.gif(id)
		setGif(data)
   
	  continueRender(handle);
	};
   
	useEffect(() => {
	  fetchData();
	}, []);

	return (
		<div
			style={{
				backgroundColor: 'white',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flex: 1,
			}}
		>
			{/* <Video src={playerDemo} style={{height: 900, borderRadius: 15}} /> */}
            {/* <Grid width={1920} columns={3} fetchGifs={fetchGifs} /> */}
			{gif && <Gif gif={gif} width={1200} />}
		</div>
	);
};
