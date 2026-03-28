This folder contains the HomeServe PWA icons.

Required files:
- icon-192.png  (192x192 pixels)
- icon-512.png  (512x512 pixels)

To add icons, copy the generated icon image from the AI artifact to this folder and rename it.
Or run this PowerShell command:

  mkdir -Force public\icons
  Copy-Item "<path-to-icon>" public\icons\icon-192.png
  Copy-Item "<path-to-icon>" public\icons\icon-512.png
