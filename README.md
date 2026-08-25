# Jackdaw Customs — GitHub Pages Template

A Jekyll template for the Jackdaw Customs made-to-measure shoemaking
studio (shoes.wtf), ready to deploy on GitHub Pages. The centerpiece is
**The Fitting** page: a scroll-driven walkthrough of the bones of the
foot, the measurements taken during a fitting, and the fitting process
itself.

## Pages

| Page | Path | What it does |
|---|---|---|
| Home | `/` | Hero, feature cards, quote band |
| The Fitting | `/fitting/` | Sticky foot-skeleton diagram (top/side toggle) highlighting bones and girth tape-loops as you scroll, animated measurement diagrams incl. boot fitting, step-by-step process with progress rail |
| The Studio | `/about/` | About / craft philosophy |
| Book a Fitting | `/contact/` | Contact details + what to expect |

## Run locally

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000

## Deploy to GitHub Pages

1. Create a repository and push this folder.
2. In the repo settings, go to **Pages** → set **Source** to *Deploy from a branch*, pick your default branch and `/ (root)`.
3. Done — GitHub builds Jekyll automatically.

### Project sites need `baseurl`

If the site lives at `https://<user>.github.io/<repo-name>`, set in `_config.yml`:

```yaml
baseurl: "/<repo-name>"
```

For a user site (`<user>.github.io`) leave it as `""`.

### Custom domain (shoes.wtf)

A `CNAME` file is already included. To finish wiring it up:

1. Repo settings → **Pages** → **Custom domain** → enter `shoes.wtf`.
2. At your registrar, point DNS at GitHub:
   - Apex `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` CNAME → `<your-github-username>.github.io`
3. Once the DNS check passes, enable **Enforce HTTPS**.

## Customizing

- **Name, address, email, phone** → top of `_config.yml`
- **Colors & fonts** → variables at the top of `assets/css/style.scss`
- **Bone copy / measurements / steps** → `fitting.html`
- **Foot diagrams** → the two SVGs inside `fitting.html`. The top view was
  vector-traced from a color-coded reference image with
  `tools/extract_foot_svg.py`; the side view is hand-fitted over a traced
  silhouette. Bone groups carry `data-bone` attributes wired to the scroll
  cards; the dashed tape loops (`data-girth`) light up on the girth cards.

The contact page is deliberately form-free — email is the booking
channel. Add Formspree or Netlify Forms markup if you ever want a form.
