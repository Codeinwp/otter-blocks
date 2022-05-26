# QA Report
> This is a checklist, you can use it to make sure you did not miss a case.

The can be posted on the PR to have an evidence. Strongly recomended to use portions based on the PR (you can post the checklist for the Flip block if the PR is about the Flip block)

## Checklist Blocks

- [ ] Accordion
  - [ ] Very long text in title
  - [ ] Woking with 4-levels nesting
- [ ] Advanced Heading
  - [ ] Animate the text
  - [ ] Count Animation
  - [ ] Typing Animation
  - [ ] Transform to core Heading only block and vice versa
- [ ] Slider
  - [ ] `slider.js` is loaded if Slider block is present in page
  - [ ] Tranform to core Gallery block and vice versa 
- [ ] Bussines Hour
  - [ ] Works only Pro is enabled. Does not break the page when disabled.
- [ ] Countdown
  - [ ] `countdown.js` is loaded only if Countdown block is present in page
- [ ] Flip
- [ ] Font Awesome Icons
  - [ ] FA and Themeisle icons have the same visual boundary.
- [ ] Form
  - [ ] Test Email is working.
  - [ ] Mailchimp Integration is working.
  - [ ] Sendinblue Integration is working.
  - [ ] An email with the error is send when a problem happen.
  - [ ] Form options are saved.
  - [ ] All inputs options are working.
  - [ ] Consent is rendered when `Submit & Subscribe` action is set.
  - [ ] ReCaptcha is working.
  - [ ] 'form.js' is loaded only if Form block is present in page
- [ ] Google Map
  - [ ] API Key are saved.
  - [ ] Markers are working, including reusable blocks.
- [ ] Map
  - [ ] Markers are working, including reusable blocks.
  - [ ] Leaflet scripts are loaded only if Map block is present in page.
- [ ] Icon List
  - [ ] FA and Themeisle icons have the same visual boundary.
- [ ] Lottie
  - [ ] JSON loading is working.
  - [ ] Lottie script is loaded only if Lottie block is present in page
- [ ] Progress Bar
  - [ ] `progress-bar.js` script is loaded only if Lottie block is present in page
- [ ] Circle Counter
  - [ ] `circle-counter.js` script is loaded only if Lottie block is present in page
- [ ] Tabs
  - [ ] 'tabs.js'  script is loaded only if Tabs block is present in page
  - [ ] Woking with 4-levels nesting
  - [ ] Is working with Countdown, Progress Bar, Circle Counter, Accordion, Flip
- [ ] Popup
- [ ] Sticky
  - [ ] All Stick To options are working.
  - [ ] It does not break the page.
- [ ] Posts
  - [ ] ACF Integration is working only for PRO.
- [ ] Product Review
- [ ] Product Review Comparison
- [ ] Section
  - [ ] Pulling templates from Template Libary is working.
- [ ] Pricing 
- [ ] Woo Comparison
- [ ] Add to cart
- [ ] About Author
- [ ] Group Button

## Checklist Performance

- [ ] Core Web Vitals
  - [ ] Minimum comulative layout shift.
  - [ ] Scripts are defered  (they are present in `<fotter>` with `async` or `defer` attribute) and not affecting First Paint
- [ ] Page is not slowed down when few heavy blocks (e.g: Form, Slider, Icon List, Section) are present (minium 8)
- [ ] Block scripts are not loaded if their respective block is not present. (`form.js` should not be loaded if no Form block is present in page)
