// @ts-nocheck
import fs from "node:fs";
import path from "node:path";

import ico from "sharp-ico";
import sharp from "sharp";

const DEFAULT_MANIFEST = async (root) => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf-8")
  );

  return {
    name: pkg.name,
    short_name: pkg.name,
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#fff",
    description: pkg.default?.description ?? "",
  };
};

const ICON_SIZES = [48, 72, 96, 144, 168, 192].reverse();

function generateIco(
  sharpNode,
  iconName = "favicon.ico",
  sizes = [128, 64, 32, 24]
) {
  return ico.sharpsToIco([sharpNode], iconName, {
    sizes,
  });
}

export default function manifestPlugin({
  icon = "favicon.png",
  outputDir = "icons",
  outputIco = "favicon.ico",
  faviconSizes = [128, 64, 32, 24],
  manifestIconSizes = ICON_SIZES,
  iconMaskable = true,
  manifest = {},
} = {}) {
  let viteConfig;

  return {
    name: "build-manifest", // required, will show up in warnings and errors

    configResolved(config) {
      viteConfig = config;
    },

    async buildStart() {
      const defaultManifest = await DEFAULT_MANIFEST(viteConfig.root);

      if (fs.existsSync(path.join(viteConfig.publicDir, icon))) {
        if (!fs.existsSync(path.join(viteConfig.publicDir, outputDir))) {
          fs.mkdirSync(path.join(viteConfig.publicDir, outputDir), {
            recursive: true,
          });
        }

        const iconNode = sharp(path.join(viteConfig.publicDir, icon));

        console.log(`Generating .ico file`);
        await generateIco(
          iconNode,
          path.join(viteConfig.publicDir, outputIco),
          faviconSizes
        );

        console.log(`Generating icons`);
        await Promise.all(
          manifestIconSizes.map((size) =>
            iconNode
              .toFormat("png")
              .resize(size, size)
              .toFile(
                path.join(
                  viteConfig.publicDir,
                  outputDir,
                  [size, path.basename(icon)].join(".")
                )
              )
          )
        );

        const finalManifest = {
          ...defaultManifest,
          ...manifest,
          short_name:
            manifest?.short_name ??
            manifest?.name ??
            defaultManifest.short_name,
          icons: manifestIconSizes.map((size) => ({
            src: `/${path.join(
              outputDir,
              [size, path.basename(icon)].join(".")
            )}`,
            sizes: `${size}x${size}`,
            type: `image/png`,
            purpose: iconMaskable ? "maskable any" : "any",
          })),
        };

        console.log(`Writing manifest file`);
        fs.writeFileSync(
          path.join(viteConfig.publicDir, "manifest.json"),
          JSON.stringify(finalManifest, null, 2),
          "utf-8"
        );
      } else {
        console.error(
          "No icon found at:",
          path.join(viteConfig.publicDir, icon)
        );
      }
    },
  };
}
