# Testing List
> This is a checklist, you can use it to make sure you did not miss a case.

In this list we will try to cover the pain point cases when it come to testing a specific block. If you think that we missed something, please add it to the list. 
This should help up to remember the most important cases when testing a block.

Also have in mind [QA Guideline](https://themeisle.notion.site/QA-Rating-16d6511c22854a439c91e9776534cf79)

## :warning: Preparations

 - If you reuse an instance for testing and the page CSS is broken (all blocks on the page are missing their settings for style), go to Settings > Otter > Dashboard and Regenerated the style.
 - Make sure to use the development version of the plugin, so that console errors can be human read.
 - For blocks that are responsive (section, tabs, etc) make sure that they inherit the values: Desktop > Tablet > Mobile. If tablet values are not set, then it will inherit the values from the desktop. Same principle for mobile values, they will inherit the values from the tablet.

## Checklist Blocks

A small checklist for not so obviously testing parts.

- [ ] Section
 - [ ] Working with 4-levels nesting.
 - [ ] Responsive settings are working.
 - [ ] Working with all the blocks.
- [ ] Accordion
  - [ ] Very long text in title
  - [ ] Working with 4-levels nesting
- [ ] Advanced Heading
  - [ ] Animate the text
  - [ ] Count Animation
  - [ ] Typing Animation
  - [ ] Transform to core Heading only block and vice versa
- [ ] Slider
  - [ ] `slider.js` is loaded if Slider block is present in page
  - [ ] Transform to core Gallery block and vice versa 
- [ ] Bushiness Hour
  - [ ] Works only Pro is enabled. Does not break the page when disabled.
- [ ] Countdown
  - [ ] `countdown.js` is loaded only if Countdown block is present in page.
  - [ ] Pro features work only for Pro users.
  - [ ] Check linking with other blocks when time expire.
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
  - [ ] 'form.js' is loaded only if Form block is present in page.
  - [ ] Autoresponder is working.
  - [ ] File Field is working with the given settings.
    - [ ] File size limit.
    - [ ] File type limit.
    - [ ] File upload limit.
  - [ ] It display correct error messages in Console.  
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
  - [ ] Working with 4-levels nesting
  - [ ] Is working with other blocks: Countdown, Progress Bar, Circle Counter, Accordion, Flip, etc.
- [ ] Popup
  - [ ] `popup.js` script is loaded only if Popup block is present in page
  - [ ] Pro features work only for Pro users.
- [ ] Sticky
  - [ ] All Stick To options are working.
  - [ ] It does not break the page.
  - [ ] Pro features work only for Pro users.
- [ ] Posts
  - [ ] ACF Integration is working only for PRO.
- [ ] Product Review
- [ ] Product Review Comparison
- [ ] Section
  - [ ] Pulling templates from Template Libary is working.
- [ ] Pricing 
- [ ] About Author
- [ ] Group Button
- [ ] Dynamic Conditions
  - [ ] It does not break the page.
  - [ ] Pro features work only for Pro users.
- [ ] Dynamic Content
  - [ ] It does not break the page.
  - [ ] Pro features work only for Pro users.
- [ ] Live Search
  - [ ] WooCommerce Integration
  - [ ] Pro features work only for Pro users.    

## Checklist Performance

- [ ] Core Web Vitals
  - [ ] Minimum comulative layout shift.
  - [ ] Scripts are defered  (they are present in `<fotter>` with `async` or `defer` attribute) and not affecting First Paint
- [ ] Page is not slowed down when few heavy blocks (e.g: Form, Slider, Icon List, Section) are present (minium 8)
- [ ] Block scripts are not loaded if their respective block is not present. (`form.js` should not be loaded if no Form block is present in page)
