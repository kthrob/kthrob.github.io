// import { getCollection } from 'astro:content';
import captureWebsite from 'capture-website';
import { getPortafolioData } from '~/components/data/portfolioData.js';


// const portfolioItems = await getCollection('portfolio');

// const portfolioItems = await getPortafolioData();
// console.log('Portfolio Items:', portfolioItems);

// portfolioItems.forEach(async (item) => {
//   const fileName = item.title.toLowerCase().replace(/\s+/g, '_') + '.png';
//   const filePath = `./src/assets/screenshots/${fileName}`;
//   console.log(`Capturing screenshot for ${item.title} at ${item.imgSrc}`);
//   await captureWebsite.file(
//     item.imgSrc,
//     filePath
//   );
// });

// await captureWebsite.file(
// 	'https://bluffslittlethinkers.com',
// 	'screenshot_blt.png',
// 	{
// 		emulateDevice: 'iPhone X'
// 	}
// );