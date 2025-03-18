# Vite Favicon Manifest

A small library that I always use to both generate favicons correctly and also a manifest.json file

Its dumb! But its all i need

## Usage

vite.config.js

```
import FaviconManifest from 'vite-favicon-manifest';

export default defineConfig({
	plugins: [
    // whatever other plugins

    FaviconManifest({
      icon = "favicon.png", // The source favicon name
      outputDir = "icons", // Your vite public folder is prefixed
      outputIco = "favicon.ico",
      faviconSizes = [128, 64, 32, 24],
      manifestIconSizes = [48, 72, 96, 144, 168, 192],
      iconMaskable = true,

			manifest: {
				name: 'Your Site',
				description: 'Your sites description',

        // You can put anything that will appear in your manifest.json here
			}
		})
  ]
})
```

You need to still manually make reference to the files

```
<svelte:head>
	<link rel="icon" href="/favicon.ico" />
	<link rel="manifest" href="/manifest.json" />
</svelte:head>
```
