# Fourier PowerPoint Demos

A small, self-contained GitHub Pages package containing two interactive Fourier demonstrations for use alongside a PowerPoint presentation:

1. **Combined sine-wave decomposition**
   - Canvas ID: `combo-sine-wave-split`
2. **Square-wave Fourier build-up**
   - Canvas ID: `square-wave-build-up`
   - Slider ID: `square-wave-build-up-slider`
   - Button ID: `square-wave-button`

The visualizations are adapted from **Introduction to Fourier Transforms** by Jez Swanson:

- Original site: https://www.jezzamon.com/fourier/
- Original source: https://github.com/Jezzamonn/fourier

The original source is licensed under the MIT License. See `LICENSE`.

## Upload to GitHub

1. Create a new GitHub repository, for example `fourier-powerpoint`.
2. Upload **all files in this folder** to the root of that repository:
   - `index.html`
   - `styles.css`
   - `fourier-demo.js`
   - `README.md`
   - `LICENSE`
3. Commit the files.
4. Open **Settings > Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Choose branch **main** and folder **/(root)**, then save.
7. GitHub Pages will give you a URL similar to:
   `https://YOUR-USERNAME.github.io/fourier-powerpoint/`

There is **no npm install, Webpack, package.json, or build step**.

## Useful presentation URLs

Assuming your GitHub Pages URL is:

`https://YOUR-USERNAME.github.io/fourier-powerpoint/`

Use these variants:

- Full page:
  `https://YOUR-USERNAME.github.io/fourier-powerpoint/`
- Only the combined sine-wave demo:
  `https://YOUR-USERNAME.github.io/fourier-powerpoint/?demo=combo&clean=1`
- Only the square-wave demo:
  `https://YOUR-USERNAME.github.io/fourier-powerpoint/?demo=square&clean=1`

The `clean=1` option hides the page heading and footer, which is useful when opening the demo from a presentation.

## Files

- `index.html` — contains the exact requested canvas/input/button IDs.
- `styles.css` — responsive presentation-friendly styling.
- `fourier-demo.js` — all Fourier math, animation, slider logic, and Web Audio playback. It has no external JavaScript dependencies.
- `LICENSE` — original MIT license notice.

## PowerPoint note

A normal PowerPoint hyperlink can open the GitHub Pages demo in the browser. If you use a PowerPoint/web-view add-in to display a webpage inside a slide, whether audio and interaction work inside the embedded view depends on that add-in and your organization's PowerPoint security settings.
