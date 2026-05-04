# Blokes Mini Golf

A standalone golf game for Industrious Blokes.

## Files

- `index.html` - the page to open or embed
- `styles.css` - the visual styling
- `game.js` - the game logic

## Easiest Website Setup

Upload this folder to any simple static host, then embed the hosted `index.html` URL in Google Sites.

Good free options:

- GitHub Pages
- Netlify Drop
- Cloudflare Pages

## Google Sites Embed

1. Publish the game somewhere that gives you a public URL.
2. In Google Sites, choose Insert.
3. Choose Embed.
4. Paste the game URL.
5. Stretch the embed wide.
6. Set the desktop height around 760-820 px.
7. Check the mobile preview. If the game feels cramped, increase the embed height to 820-900 px.

Suggested iframe size:

```html
<iframe
  src="YOUR_GAME_URL_HERE"
  width="100%"
  height="820"
  style="border:0;"
  loading="lazy">
</iframe>
```

The game now scales to the iframe height, so the embed height is the main control inside Google Sites.

## Install On Phone

After uploading the folder to Netlify, open the Netlify game link on your phone.

### iPhone

1. Open the game link in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Name it Blokes Golf.
5. Tap Add.

### Android

1. Open the game link in Chrome.
2. Tap the three-dot menu.
3. Tap Add to Home screen or Install app.
4. Confirm.

This works after the game is hosted at an HTTPS URL, such as Netlify. It will not install properly from a local `file://` link.

## Offline Mode

The game is now offline-first after it is hosted.

1. Upload the full folder to Netlify.
2. Open the Netlify link once while you have internet.
3. Install it to your phone home screen.
4. After that, the game should open and play without internet.

Important: the first load must happen from the hosted HTTPS link. Offline mode cannot fully activate from the local `file://` preview.
