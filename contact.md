---
layout: default
permalink: /contact/
title: Book a Fitting
---

<section class="page-head">
  <div class="shell">
    <p class="kicker">Say hello</p>
    <h1>Book a fitting.</h1>
    <p class="lede">Fittings run about ninety minutes, Tue&ndash;Sat.
    Bring the shoes you love and the shoes you never wear &mdash; both are
    evidence.</p>
  </div>
</section>

<section class="contact-section">
  <div class="shell contact-grid">
    <div class="contact-card" data-reveal>
      <h2>Write to us</h2>
      <p><a href="mailto:{{ site.email }}">{{ site.email }}</a></p>
      <p><a href="tel:{{ site.phone | remove: ' ' }}">{{ site.phone }}</a></p>
      <p>{{ site.address }}<br>{{ site.city }}</p>
      <p><strong>Have an orthopedist?</strong> Have them contact us directly
      &mdash; orthoses, lifts, and rocker soles are routine work here.</p>
      <p class="contact-card__fine">We answer within two working days,
      usually with questions about your feet.</p>
    </div>

    <form class="contact-form" action="mailto:{{ site.email }}" method="post" enctype="text/plain" data-reveal>
      <label>Name<input type="text" name="name" required></label>
      <label>Email<input type="email" name="email" required></label>
      <label>What are you dreaming of?
        <textarea name="message" rows="5" placeholder="Everyday derbies, wedding boots, a replacement for the pair you wore out&hellip;"></textarea>
      </label>
      <button class="btn" type="submit">Send</button>
      <p class="contact-card__fine">This demo form opens your email client;
      wire it to Formspree or Netlify Forms when you deploy.</p>
    </form>
  </div>
</section>
