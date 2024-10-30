##### [Version 3.0.5](https://github.com/Codeinwp/otter-blocks/compare/v3.0.4...v3.0.5) (2024-10-30)

- Improve strings structure for translation workflow
- Enhanced security
- Update internal dependencies

##### [Version 3.0.4](https://github.com/Codeinwp/otter-blocks/compare/v3.0.3...v3.0.4) (2024-10-08)

- Fixed styling that was breaking Otters notice
- Fixed PHP fatal error appearing in some edge cases
- Fixed border width and border-radius not working for Button Group block
- Enhanced security
- Fixed an issue with the user survey display

##### [Version 3.0.3](https://github.com/Codeinwp/otter-blocks/compare/v3.0.2...v3.0.3) (2024-08-28)

### Bug Fixes

- **Fix WP Compatibility**: Fixed compatibility with versions of WordPress 6.5 or earlier.
- **Fix Popup Block Recurring Dismission**: Fixed Popup Block not dismissing recurring visitors option.

##### [Version 3.0.2](https://github.com/Codeinwp/otter-blocks/compare/v3.0.1...v3.0.2) (2024-08-19)

### Bug Fixes
- **Revert Slider Overflow**: Reverts a previous Slider fix that breaks overflow in Section Block.

##### [Version 3.0.1](https://github.com/Codeinwp/otter-blocks/compare/v3.0.0...v3.0.1) (2024-08-19)

### Bug Fixes
- **Fix items getting cut off in Section Block on Mobile**: Fixes the regression caused by the last release that makes some items hidden in mobile that are children of Section block.

#### [Version 3.0.0](https://github.com/Codeinwp/otter-blocks/compare/v2.6.13...v3.0.0) (2024-08-12)

### New Features
- **Patterns Library in Otter**: Added a new Patterns Library to Otter, including dozens of new patterns.
- **Content Timeline Block**: Added a new Content Timeline Block for enhanced content structuring.
- **New Tiled Layout for Posts Block**: Added a new tiled layout option to the Posts Block, providing more versatility in content presentation.
- **Additional WooCommerce Conditions in Block Conditions**: Added more WooCommerce conditions to Block Conditions, including Product Category (has/has not), Product Tag, and Product Attribute.
- **Modal Block in Pro Version**: Introduced a new Modal Block in the Pro version for creating modals.
- **Mailchimp Merge Fields in Form Block**: Added the ability to link the value of the fields with some types for Mailchimp Merge Fields in the Form Block.
- **Responsive Controls for Column Width in Section Block**: Enabled responsive controls for column width in the Section Block.
- **Custom Text for Button in WooCommerce Add to Cart Block**: Allowed using custom text for buttons in the WooCommerce Add to Cart Block.
- **Search Within Categories for Posts in Live Search Extension**: Enabled searching within categories for posts in the Live Search extension.
- **Image Ratio Settings for Posts Block**: Improved the handling of images in the Posts Block with the addition of new Image Ratio settings, allowing for better control over image presentation.

### Improvements
- **OpenAI API Validation Key**: Added a validation key step in the settings for the OpenAI API.
- **Visual Improvements to AI Block Variation Picker**: Enhanced the visual appearance and user interface of the AI Block Variation picker for a smoother user experience.
- **Changes to Default Settings for Posts Block**: Updated the default settings for the Posts Block to optimize performance and ease of use.
- **Dynamic Data Feature in Block Toolbar**: Relocated the Dynamic Data feature to the Block Toolbar for easier access and streamlined workflow.
- **Increase Height for Popup in Editor on Auto Mode**: Increased the height for the popup in the editor when in auto mode.
- **Block Tools Display by Default**: Changed Block tools settings to show them by default.
- **Improved Error Messages in Form Block**: Enhanced error messages when the tester is an admin in the Form Block.
- **Twitter Icon to X in Sharing Block**: Updated the Twitter icon to X in the Sharing Block.
- **Disable Content AI Actions in Sidebar**: Added a setting in the dashboard to disable Content AI actions from the sidebar.
- **ESC Key to Close Popup Block**: Added the option to close popups using the ESC key in the Popup Block.
- **Various Quality of Life Improvements**: Ongoing enhancements to improve overall user experience.

### Bug Fixes
- **Removal of Copy/Paste Styles Feature**: Removed the Copy/Paste Styles feature to simplify the user interface and reduce potential conflicts.
- **Padding Fix in Advanced Heading Block**: Fixed the issue where padding was not working correctly on mobile in the Advanced Heading block.
- **Slider Width in Section Column**: Fixed the issue where the slider inside a section column was ignoring the width setting.
- **Fix Blocks Using Empty ID**: Corrected the issue where blocks could use an empty ID.
- **Blocks Not Working as Widgets**: Resolved the problem where blocks were not working properly when used as widgets.
- **Replace Option in AI Block**: Fixed the issue where the replace option in the AI block was not working.
- **Tabs and Accordion Block Scrolling**: Fixed the issue in the Tabs and Accordion Block where it was scrolling when the content exceeded one screen, adding a jump effect.
- **Section Block Margin and Padding Inheritance**: Fixed the default inheritance for margin and padding in the Section Block.
- **Flip Card Image Background Size**: Corrected the issue where the flip card image background size wasnt working on the frontend.

##### [Version 2.6.13](https://github.com/Codeinwp/otter-blocks/compare/v2.6.12...v2.6.13) (2024-07-17)

- Fixed Button Group block - Appearance, Letter case, and Line height options are now working
- Fixed issue where some characters were not supported in the category of the posts block
- Fixed typo on the default label of the consent checkbox

##### [Version 2.6.12](https://github.com/Codeinwp/otter-blocks/compare/v2.6.11...v2.6.12) (2024-05-02)

- Enhanced security

##### [Version 2.6.11](https://github.com/Codeinwp/otter-blocks/compare/v2.6.10...v2.6.11) (2024-04-26)

- Fixed issue of HTML code appearing on the front-end by allowing partial HTML tag rendering for Multiple Choice Label
- Fix fatal crash in Block Conditions when rendering condition is set to false 
- Fixed issue with multiple instances of Pattern Upsell appearing on the same page
- Updated internal dependencies

##### [Version 2.6.10](https://github.com/Codeinwp/otter-blocks/compare/v2.6.9...v2.6.10) (2024-04-16)

### Fixes
- **Updated internal dependencies:​** Enhanced performance and security.

##### [Version 2.6.9](https://github.com/Codeinwp/otter-blocks/compare/v2.6.8...v2.6.9) (2024-04-10)

### Improvements
**Updated internal dependencies​:** for enhanced performance and security

##### [Version 2.6.8](https://github.com/Codeinwp/otter-blocks/compare/v2.6.7...v2.6.8) (2024-04-05)

### Improvements
**Updated internal dependencies​:** for enhanced performance and stability.

##### [Version 2.6.7](https://github.com/Codeinwp/otter-blocks/compare/v2.6.6...v2.6.7) (2024-04-03)

### Improvements
- **Updated internal dependencies**: for enhanced performance and stability.

##### [Version 2.6.6](https://github.com/Codeinwp/otter-blocks/compare/v2.6.5...v2.6.6) (2024-03-27)

### Bug Fixes
- **Harden Security in SSR Blocks**: Improve SSR block sanitization to protect against security vulnerabilities.
### Bug Fixes
- **Harden Security in SSR Blocks**: Improve SSR block sanitization to protect against security vulnerabilities.

##### [Version 2.6.5](https://github.com/Codeinwp/otter-blocks/compare/v2.6.4...v2.6.5) (2024-03-13)

### Bug Fixes

- **Fix NPS Survey**: Fixed survey appearing instantly when theme installed programmatically.
- **Fix Google Maps Block ID Escaping**: Fixes ID of Google Maps block not being escaped properly.

##### [Version 2.6.4](https://github.com/Codeinwp/otter-blocks/compare/v2.6.3...v2.6.4) (2024-02-26)

### Improvements
- **Improved Re-Loading Behaviour Between FSE Onboarding Steps**: Enhances the user experience by streamlining transitions and re-loading behavior between steps in the Full Site Editing (FSE) onboarding process.

### Bug Fixes
- **Resolves Compatibility Issue with Blocks on WordPress.com**: Fixes a critical issue to ensure the plugin now works seamlessly on WordPress.com.
- **Hardens Security in Form Block**: Enhances sanitization of SVG files uploaded through the Form Block to protect against security vulnerabilities.
- **Hardens Security in Pro Form Blocks**: Improves sanitization processes in Pro Form Blocks to bolster security measures.

##### [Version 2.6.3](https://github.com/Codeinwp/otter-blocks/compare/v2.6.2...v2.6.3) (2024-02-14)

### Improvements

- **Blocks CSS Module Performance**: Enhanced the performance of the Blocks CSS module.
- **New Hook Introduced**: Introduced the otter_blocks_posts_author hook for extending functionality.

### Bug Fixes

- **Maps Rendering in Tabs Block**: Corrected the issue where maps were not being rendered inside the Tabs block.
- **Console Errors Due to Older React Methods**: Fixed console errors that were caused by the use of outdated React methods.

##### [Version 2.6.2](https://github.com/Codeinwp/otter-blocks/compare/v2.6.1...v2.6.2) (2023-12-26)

### Bug Fixes
- **Fixes form submit button issue**: Fixes an issue when the form submit button accepts line-breaks in the editor.
- **Fixes animation trigger for large elements**: Fixes an issue where animation does not trigger for large elements on the screen.

##### [Version 2.6.1](https://github.com/Codeinwp/otter-blocks/compare/v2.6.0...v2.6.1) (2023-12-19)

### Bug Fixes
- **Fixes infinite redirect loop**: Fixes an issue where activating Raft leads to an infinite loop.
- **Fixes third-party style conflicts**: Fixes CSS messing up styles of some third-party plugins.
- **Fixes Woo products conditions not working**: Fixes Woo conditions in the Block Conditions module not working correctly.

#### [Version 2.6.0](https://github.com/Codeinwp/otter-blocks/compare/v2.5.2...v2.6.0) (2023-12-18)

### New Features
- **New Onboarding Wizard for Raft Theme**: Introduced a New Onboarding Wizard to enhance the setup experience for the Raft theme.

### Bug Fixes
- **Button Group Error on Nofollow Disable**: Resolved an issue where disabling Add Nofollow and refreshing the page caused errors in the Button group.
- **Block Conditions PHP Array Issue**: Fixed a problem where block conditions were throwing a PHP array error.
- **Styling Loss in Widgets Area with Elementor**: Addressed the issue where blocks added in the widgets area lost styling when Elementor was activated.
- **Slider Images in Neves Header Not Rendering**: Fixed a bug where slider images were not being rendered if added in Neves header.

##### [Version 2.5.2](https://github.com/Codeinwp/otter-blocks/compare/v2.5.1...v2.5.2) (2023-11-22)

### Bug Fixes
- **Fixes Performance Issue**: Fixes an issue with Otter making repeated calls to Rest API and slowing down the editor.

##### [Version 2.5.1](https://github.com/Codeinwp/otter-blocks/compare/v2.5.0...v2.5.1) (2023-11-18)

### Bug Fixes
- **Fixes Posts Block Query**: Fixed Posts Block category selection not working.
- **Fixes Blocks Animation**: Fixed Blocks Animation module not working as a standalone plugin.

#### [Version 2.5.0](https://github.com/Codeinwp/otter-blocks/compare/v2.4.1...v2.5.0) (2023-11-16)

### New Features
- **AI Patterns Layout Generator**: Introducing a new AI-driven utility for designing layouts with Otter Patterns.
- **Block Management Page**: A new centralized page to manage all Otter blocks visibility.
- **Pagination in Posts Block**: Adds pagination functionality for better navigation.
- **Enhanced Block Animations**: Customizable delay/speed, animation offset, and hover controls for dynamic block animations.
- **Export Option in Form Submission**: Facilitates exporting form submissions to CSV for easier data management.
- **New Block Visibility Conditions**: Option to hide blocks depending on the device used.

### Improvements
- **Form Marketing Enhancements**: Improved Marketing Action explanations and email field detection.
- **Advanced Heading Enhancements**: New Bottom Margin option added to the Advanced Heading block.

### Bug Fixes
- **Fix Maps Block Compatibility with Neve**: Resolved integration issues with Neve.
- **Fix Live Search Styling**: Corrected CSS calculation problems in Live Search Popup.
- **Fix RankMath Compatibility**: Addressed a recent regression affecting Otters functionality with RankMath.
- **Fix Form Generating Error**: Removed outdated base64 checks in Form File validation.
- **Fix Count Animation Settings**: Adjusted delay and speed settings for consistent Count Animation performance.

##### [Version 2.4.1](https://github.com/Codeinwp/otter-blocks/compare/v2.4.0...v2.4.1) (2023-10-25)

### New Features
- **Live Search Extension Asset Loading**: Now allows you to load assets required for live search with a hook.
- **Rank Math Compatibility**: Added support for Rank Maths internal links detection in Posts Block.

### Improvements
- **Enhancement for Tabs Block**: Makes it easier to switch between tabs in the editor.
- **Decrease Delay in Dashboard Options**: This PR decreases the delay in enabling/disabling dashboard options.
- **State Consistency for Dashboard Buttons**: Improved the state consistency of buttons in the Dashboard.
- **Typography Control Enhancements**: Made enhancements to typography controls for better user experience.
- **Black Friday Preparations**: Getting set for upcoming Black Friday updates.

### Bug Fixes
- **Widget Assets**: Fixed the issue where assets for widgets appeared even in pages where the asset doesn’t exist.
- **Typing Animation Cursor Color**: Addressed the issue with the typing animation cursor color not being correct.
- **Build Files Placement**: Resolved the problem of build files being added to unnecessary places.

#### [Version 2.4.0](https://github.com/Codeinwp/otter-blocks/compare/v2.3.4...v2.4.0) (2023-09-21)

- Introducing Otter AI Block With Form AI & Content AI Support
- Added Webhooks Integration to Form Block
- Added Hidden Field to Form Block
- Circle Counter Block Enhancements
- Adding RequestAnimationFrame() to Scroll Sniffing for Better Performance
- Added Stripe Field to Form Block
- Add Link Target Setting in Product Review Block
- Fix Slider Block Image Arrangement Behaving Weirdly
- Fix CSS Not Generating When Switching to FSE Theme
- Fix Visual Issues in Section’s Background & Overlay Controls
- Fix Box Shadow Not Changing on Section Columns
- Fix Block Settings Panel Being Visible for Non-Admins
- Fix Form Block Not Saving Changes in FSE Templates
- Fix Multiple Otter Notices Appearing at Once
- Various Small Fixes

##### [Version 2.3.4](https://github.com/Codeinwp/otter-blocks/compare/v2.3.3...v2.3.4) (2023-08-23)

- Fix z-index with Shape Divider in Section
- Fix Tabs Block Resetting Editor Sidebar When Changing Viewport
- Fix Fatal Error in Form Submission Page in Certain Cases If Viewed as Super Admin
- Fix Progress Bar Height for Mobile Devices
- Fix Stripe Block Not Working Correctly in WP 5.9
- Fix Form Submit Messages Not Working

##### [Version 2.3.3](https://github.com/Codeinwp/otter-blocks/compare/v2.3.2...v2.3.3) (2023-08-11)

- WordPress 6.3 Compatibility

##### [Version 2.3.2](https://github.com/Codeinwp/otter-blocks/compare/v2.3.1...v2.3.2) (2023-07-17)

- Added Autoresponder to Stripe Block
- Adding Alternative Style to Review Block
- Improvements to Dynamic Value Module
- Fix Form Redirection Not Working Correctly
- Fix Bow Shadow Not Visible in the Editor

##### [Version 2.3.1](https://github.com/Codeinwp/otter-blocks/compare/v2.3.0...v2.3.1) (2023-06-20)

- Added Option to Allow Block Tools to Be Enabled by Default
- Improvements for Social Sharing Block
- Improvements to Posts Block’s Handling of WooCommerce Products
- Fix Dynamic Tags Not Working with Neve Pro Custom Layouts
- Fix Wrong Defaults in Form
- Fix Form Submissions Not Saving to Database If SMTP Fails
- Fix the Option to save Google Fonts Locally Not Working
- Fix Form Option Not Saving
- Fix Illegal String Offset on Minimal Version Check
- Fix the Issue with Otter Menu Pointing to the Old URL
- Fix Form Submission Email Being Used as Post Title of Form Submissions

#### [Version 2.3.0](https://github.com/Codeinwp/otter-blocks/compare/v2.2.7...v2.3.0) (2023-05-25)

- Add Custom Taxonomy Support to Dynamic Values
- Add More New Fields to Form Block
- Add Option to Store Form Block Emails to WordPress Dashboard
- Add Api Field in Stripe Block
- Add Support for HTML in Stripe Block Messages
- Add CDN Links in Patterns
- Various Form Block Enhancements
- Bump Minimum PHP Compatibility to 5.6
- Fix Dynamic Tags Not Working in Widgets
- Fix Review Comparison Table Not Taking Reusable Review Blocks into Consideration
- Fix Unused Assets Being Loaded When a Block Is Removed from Widgets
- Fix Custom CSS Module Not Working with FSE
- Fix Accordion Block Schema Conflicts with Neve PRO Performance Module and Lazy-loading Off-screen Elements

##### [Version 2.2.7](https://github.com/Codeinwp/otter-blocks/compare/v2.2.6...v2.2.7) (2023-05-08)

- Add Width Option to Form Block
- Improve Stripe Block Error Handling
- Fix the Issue with SVG Logos Not Being Able to Get Picked Logo
- Fix Background Color Detection
- Fix Shape Divider Covering Section Block
- Fix Accordion Block Schema Not Being Removed

##### [Version 2.2.6](https://github.com/Codeinwp/otter-blocks/compare/v2.2.5...v2.2.6) (2023-04-26)

- Hardening Dynamic Content security

##### [Version 2.2.5](https://github.com/Codeinwp/otter-blocks/compare/v2.2.4...v2.2.5) (2023-04-21)

- Fixes a bug with the new WP release causing blocks to crash during transformation

##### [Version 2.2.4](https://github.com/Codeinwp/otter-blocks/compare/v2.2.3...v2.2.4) (2023-03-30)

- Add Preview for Dynamic Data in the Popover Control
- Add New Patterns & Templates
- Add New Closing/Opening Anchor Actions in Popup
- Add Autoresponder Option to Form Block
- WordPress 6.2 Compatibility Testing & Fixes
- Fix CSS Class Not Being Removed If Custom CSS Is Empty
- Fix Custom CSS Not Reflected on Front-end When Used with FSE
- Fix Block Styles Not Loading with Custom Layouts
- Fix WooCommerce Blocks Not Working with the Latest Version of Woo

##### [Version 2.2.3](https://github.com/Codeinwp/otter-blocks/compare/v2.2.2...v2.2.3) (2023-03-06)

- Button Group Block Enhancements
- Tabs Block Enhancements
- Add Better Onboarding & Placeholders for Content Blocks
- Add Unlinked Margin Option for the Icon Block
- Add Live Font Preview in Font Picker
- Add In-build Spam Protection in Form Block
- Fix i18n Compatibilities
- Fix Mailchimp Integration in Form Not Getting All Lists
- Fix the Issue with the Line Heading in Advanced Heading
- Fix Issue with Block ID Duplicating When Duplicating Block
- Fix the Wrong Author in Review Block Schema in Certain Cases
- Fix Weird Behaviour When Removing CSS Class in CSS Extension
- Fix Block CSS Not Loading for Dynamic Content

##### [Version 2.2.2](https://github.com/Codeinwp/otter-blocks/compare/v2.2.1...v2.2.2) (2023-02-06)

- Fix Social Sharing Links When Used with FSE
- Fix the Compatibility of the Posts Block with FIFU Plugin
- Fix Animation Module Breaking FSE Mobile Menu
- Fix Section Block Breaking When Changing Theme
- Simplify Dynamic Value Preview
- Copy Animations with Copy-paste Style

##### [Version 2.2.1](https://github.com/Codeinwp/otter-blocks/compare/v2.2.0...v2.2.1) (2023-01-30)

- Form Block Redesign & Enhancements
- Introduce Pro Patterns
- Improve how content blocks behave with darker backgrounds
- Fix Popup behaviour with Sticky elements
- Fix Sticky feature not working properly with Tabs Block
- Fix some minor issues with various themes
- Fix PHP 8.2 issues

#### [Version 2.2.0](https://github.com/Codeinwp/otter-blocks/compare/v2.1.6...v2.2.0) (2023-01-10)

- Added Stripe Block
- Added hCaptcha Integration
- Added Live Search Addon
- Added Parameter Based Dynamic Value
- Added a Country Location for Dynamic Value & Conditions
- Added Cookie-based Block Conditions
- Added Copy/Paste-keyboard Shortcuts
- Added New Otter Block Icons
- Added Image Size Option to Review Block
- Added Option to Show Last Updated Date in the Posts Block
- Redesigned Global Defaults UI & Block Visibility Controls
- Redesigned UI for Block Extensions
- Allow Non-standard Characters in Anchor
- Allow Description for Product Review Block
- Improve Query String-Based Visibility Conditions
- Improve Evergreen Countdown
- Fix Popup Position Not Being Changed
- Fix Popup Width Not Being Responsive on Mobile
- Fix Button Group Styles Not Working in FSE Editor
- Fix Advanced Heading Margin Control
- Fix Lotties Console Error
- Fix Slider Block Not Working in RTL
- Fix the Form Block Not Working Inside a Popup

##### [Version 2.1.6](https://github.com/Codeinwp/otter-blocks/compare/v2.1.5...v2.1.6) (2022-12-09)

- Add option to show Sticky Posts in Posts Block
- Add min font-size & height for the Process Bar Block
- Disable Section onboarding by default
- Add default transition timer to Section
- Various fixes in Dynamic Values
- Fix Review Block schema issue
- Fix Image alignment in Review Block
- Fix Form Block not working in Templates
- Fix Sticky Float option not sticking to Left
- Deprecate older blocks

##### [Version 2.1.5](https://github.com/Codeinwp/otter-blocks/compare/v2.1.4...v2.1.5) (2022-11-23)

- Fix Black Friday deal notice not dismissing; sorry for that.

##### [Version 2.1.4](https://github.com/Codeinwp/otter-blocks/compare/v2.1.3...v2.1.4) (2022-11-21)

- Advanced Heading Enhancements
- Fix the Widgets page not loading with Otter on Chrome
- Fix Custom CSS work with FSE
- Fix the Button Color Issue
- Migrate WooCommerce Comparison to Sparks Plugin
- Fix Flip Block not saving Responsive Attributes

##### [Version 2.1.3](https://github.com/Codeinwp/otter-blocks/compare/v2.1.2...v2.1.3) (2022-11-10)

 - Fixed a crash issue for users with PHP8.0 & PHP8.1 with WP version lower than 6.1

##### [Version 2.1.2](https://github.com/Codeinwp/otter-blocks/compare/v2.1.1...v2.1.2) (2022-11-09)

- Section Enhancements
- Flip Block Enhancements
- Accordion Block Enhancements
- Popup Block Enhancements
- Icon List Block Enhancements
- New Copy & Paste Style Feature
- Add .lottie files support to Lottie Block
- Add Background Overlay to Column Block
- Add Text Color option to Section & Column Block
- Add Structured FAQ Data option to Accordion Block
- Fix some Lottie features not working in Reverse Mode
- Fix Sharing Icon inconsistency in Editor/Frontend
- Fix Shape Divider not working in Section Block when used in a particular way
- Fix Evergreen Countdown stopping after sometime

##### [Version 2.1.1](https://github.com/Codeinwp/otter-blocks/compare/v2.1.0...v2.1.1) (2022-11-01)

- Fix Media Modal not appearing properly if used inside a Popup
- Fix Sharing Block CSS not being generated

#### [Version 2.1.0](https://github.com/Codeinwp/otter-blocks/compare/v2.0.16...v2.1.0) (2022-10-19)

- Add Otter Patterns
- Add Live Preview of Dynamic Values
- Add Post Content option to Dynamic Values
- Add Closing feature to Sticky Extension
- Add class to body when some element is active in Sticky
- Posts Block Redesign
- WordPress 6.1 Compatibility
- Fix Review Block padding not affecting Pros/Cons
- Fix type in Review Block
- Fix Border/Icon color inheritance in Blocks
- Fix Section inconsistency in Global Settings
- Fix Otter allowed_html for Forms
- Fix the Welcome Modal showing more than once
- Fix Section Vertical alignment not working on Mobile
- Fix Tabs Block remove option not working
- Fix Dynamic Image crashing when Woo value is used, and then Woo is deactivated
- More bug fixes

##### [Version 2.0.16](https://github.com/Codeinwp/otter-blocks/compare/v2.0.15...v2.0.16) (2022-09-27)

- Minor fixes.

##### [Version 2.0.15](https://github.com/Codeinwp/otter-blocks/compare/v2.0.14...v2.0.15) (2022-09-27)

- Icon Block Enhancements
- Product Review Block Enhancements
- Add Evergreen Countdown Option to Countdown Block
- Add finishing actions to Countdown Block
- Add Dynamic Link control to Button Blocks
- Add Otter Feedback Option
- Fix Slider Block not working inside Section in the Editor
- Fix unintended border in some blocks when used as non-Admin role.
- Fix Padding control crashing the Section Block
- Fix error in Widgets Screen
- Fix stretched image in Safari

##### [Version 2.0.14](https://github.com/Codeinwp/otter-blocks/compare/v2.0.13...v2.0.14) (2022-09-12)

- Adding an onboarding experience in Otter
- Add Dynamic Links feature
- Progress Bar Block Enhancements
- Animation Extension Enhancements
- Add UI control for the input background color to Form Block
- Add edit link option for Button Group
- Add Float to Top/Bottom mode to Sticky Extension
- Fix Review Comparison Table not accessing reviews from inside Section Block
- Fix ThemeIsle Icons in Button Group not aligning to the text in Editor
- Fix CSS Editor listing not being able to override
- Fix Icon Block padding on ThemeIsle Icons library
- Fix animated elements in viewport flashing before animating
- Fix Flip Block not working correctly in Firefox
- Fix Google Fonts not working in responsive views in the Editor
- Remove AggregateRating from Review Block Schema

##### [Version 2.0.13](https://github.com/Codeinwp/otter-blocks/compare/v2.0.12...v2.0.13) (2022-08-27)

- Fix JS being loaded everywhere even when not required

##### [Version 2.0.12](https://github.com/Codeinwp/otter-blocks/compare/v2.0.11...v2.0.12) (2022-08-25)

- Fix Custom CSS not working with certain selectors
- Disable Author Block for WordPress 5.9 or above; use Core’s block instead
- Small Dynamic Text enhancements
- Add separator alignment option in Countdown block
- Fix Category not shown on Featured Post in Posts Lock
- Fix Alignment control breaking in Section & Posts block

##### [Version 2.0.11](https://github.com/Codeinwp/otter-blocks/compare/v2.0.10...v2.0.11) (2022-08-17)

- Add Option to remove Product Review schema in Product Review block
- Add Pros/Cons Schema to Product Review Block
- Add FSE compatibility to Otter
- Add Docs link to Dashboard & readme
- Fix certain blocks not working inside the Query Loop block
- Fix Visibility Conditions not working for Widgets in the Customizer
- Fix Icon List block not working properly when adding new items
- Fix border issues in Countdown Block
- Fix Color & Gradient picker opening together
- Fix alignment inheritance in Countdown Block
- Fix undefined variable warning when Animations are used in Dynamic Blocks
- Fix Alignment control not appearing in Button Group in FSE
- Fix Countdown & Form blocks not working properly for non-Super Admins in Network sites
- Fix Dynamic Values modal not opening in Advanced Heading block
- Fix Plugin Card not behaving nicely when added into smaller spaces

##### [Version 2.0.10](https://github.com/Codeinwp/otter-blocks/compare/v2.0.9...v2.0.10) (2022-08-04)

- Fix Section Spacing inheritance issue
- Only load Animations on front-end which are being used

##### [Version 2.0.9](https://github.com/Codeinwp/otter-blocks/compare/v2.0.8...v2.0.9) (2022-07-29)

- Add Dynamic Image Module
- Load CSS inline if possible to reduce page load time
- Fix Dynamic Content not working in Query Loop
- Countdown Block Improvements
- Add notice in the Custom CSS editor when CSS has errors that can break the page
- Add Logged-in user meta condition to Block Conditions module
- Add AggregateRating to schema.org of Review Block
- Fix the Sticky feature not working
- Fix CSS inheritance in the editor
- Fix default margin not working in Icon block
- Fix Pro users seeing upsell message
- Fix camelCase CSS variables
- Fix Review Block only accepting absolute numbers
- Remove Height automatic change on Circle Counter
- Add Block Previews
- Bump minimum compatibility to 5.8

##### [Version 2.0.8](https://github.com/Codeinwp/otter-blocks/compare/v2.0.7...v2.0.8) (2022-07-14)

- Fip Block styling issue
- Fix styles & scripts not loading in FSE & responsive mode in the editor
- Fix editor slowness
- Add single column option to Section
- Fix Font Module failing in specific scenarios
- Fix WooCommerce Product Select component keeps spinning when no products are available

##### [Version 2.0.7](https://github.com/Codeinwp/otter-blocks/compare/v2.0.6...v2.0.7) (2022-07-04)

- Fix Google Fonts not loading in certain cases

##### [Version 2.0.6](https://github.com/Codeinwp/otter-blocks/compare/v2.0.5...v2.0.6) (2022-07-01)

- Redesigned Form Block with new styling and options
- Optimize Animations Module
- Optimized front-end loading of scripts
- New Dynamic Content Extension
- Add Local Fonts Module in Otter Pro
- Add static background to Maps Block until in loading state
- Allow device-based alignment on Button Group Block
- Add Full Width option in Button Group Block
- Remove Template Library from Otter
- Fix Gallery Block not Converting to Slider Block
- Fix Sections width not being controlled in Single column
- Fix issue with multiple Tabs Blocks not working on the same page
- Fix Flip Block width on hover
- Fix Advanced Heading block not splitting properly when pressed Enter
- Fix alignment not working when Advanced Heading is set to Span
- Fix columns not working properly in Posts Block in the Editor mode

##### [Version 2.0.5](https://github.com/Codeinwp/otter-blocks/compare/v2.0.4...v2.0.5) (2022-05-27)

- Fix CSS notifications appearing multiple times
- Fix excerptLength not being persistent in Posts Block
- Sharing Icons Block Revamp
- Fix ACF extension for Posts not working
- Fix Icon Block style inheritance issue
- Fix Dashboard integration fields losing focus on each keypress
- Fix Accordion title going outside the container
- Improve Masonry Block responsiveness
- Improve Product Review Comparison Block placeholder text

##### [Version 2.0.4](https://github.com/Codeinwp/otter-blocks/compare/v2.0.3...v2.0.4) (2022-05-16)

- Fix slider breaks and throws errors when swiping on desktop
- Flip Card border error
- Otter Pro related UI changes

##### [Version 2.0.3](https://github.com/Codeinwp/otter-blocks/compare/v2.0.2...v2.0.3) (2022-05-12)

- Add Otter Pro support
- Reduce front-end JS dependencies
- Enabled SVG/JSON upload by default
- Add max-width option for Popup Block
- Update Leaflet to latest version
- Fix section related issue with used with Media & Text Block
- Fix word-breaks for Chinese charactersDevelopment

##### [Version 2.0.2](https://github.com/Codeinwp/otter-blocks/compare/v2.0.1...v2.0.2) (2022-04-22)

- Improvements in Lottie Animations Block
- Improvements in About Author Block
- Fix Section Margin/Padding values not migration properly
- Fix Global Defaults causing PHP errors
- Add option to choose default tab in Tabs Block
- Remove “out” animations from Animation Module
- Fix vertical alignment not working in Section
- Add some API validation in Google Maps
- Add default animation to Popup block
- Option to toggle Block Conditions module off
- Performance improvements
- Fix sticky module conflict with third party themes
- Add web support to Section background
- Fix Posts Block responsive issues
- Fix Tabs and Masonry Blocks breaking in certain conditions
- Fix infinite loop while generating block IDs when used inside Reusable blocks

##### [Version 2.0.1](https://github.com/Codeinwp/otter-blocks/compare/v2.0.0...v2.0.1) (2022-03-10)

- Fix styles not loaded for Reusable Blocks
- Fix Accordion block not centering on Twenty Twenty
- Disable Block Animations for [@media](https://github.com/media) print
- Fix use of undefined constant OTTER_BLOCKS_PATH in Blocks Animation

#### [Version 2.0.0](https://github.com/Codeinwp/otter-blocks/compare/v1.7.5...v2.0.0) (2022-03-08)

- Add Flip Block
- Add Block Conditions Extension
- Add Count Animation Extension
- Add Typing Animation Extension
- Add Sticky Block Extension
- Add Global Defaults Sync
- Add Pricing Section Block
- Upgrade to Block Registration API V2
- Simplify Section's Sizing Controls
- Allow Image/SVG Icons in Icon List
- Allow reset in Section Max Width
- Posts Block Revamp
- Update animate.css to latest version
- Improve Web Vitals
- Use CSS Variables in generated CSS
- Reduce SCSS nesting
- Remove unnecessary post types from Posts block
- Fix empty slider freezing the website
- Fix Widgets screen crashing if used alongside WooCommerce
- Fix fatal error when FS mode isn't set to direct
- Fix Overlay background not working in Section Block

##### [Version 1.7.5](https://github.com/Codeinwp/otter-blocks/compare/v1.7.4...v1.7.5) (2022-02-07)

- Increase Section's Max Width
- Fix vertical alignment not working in Section block
- Improve CSS Animation module
- Fix CSS Animation conflicting with third-party plugins
- Disable CSS Editor for Site Editor
- Fix errors occurring with WordPress 5.9
- Fix child tabs block not working properly

##### [Version 1.7.4](https://github.com/Codeinwp/otter-blocks/compare/v1.7.3...v1.7.4) (2021-12-02)

- Fix Leaflet scripts not loading properly
- Fix blocks causing errors on widgets
- Fix Blocks CSS not working properly
- Fix Blocks Animation causing the debugging error

##### [Version 1.7.3](https://github.com/Codeinwp/otter-blocks/compare/v1.7.2...v1.7.3) (2021-11-18)


- Plus a lot more features from 1.7.2: https://github.com/Codeinwp/otter-blocks/blob/master/CHANGELOG.md#version-172-2021-11-18

##### [Version 1.7.2](https://github.com/Codeinwp/otter-blocks/compare/v1.7.1...v1.7.2) (2021-11-18)

- Add Duplicate/Move/Delete options to Section Block’s Columns
- Add Edit option in Lottie Block
- Optimize JavaScript loading
- Fix Pro/Cons leaving focus in Review Block
- Form Block Improvements
- Advance Heading Improvements
- Add Alignment option to Icon List Block
- Reduce Build Size
- Fix Button Group spacing on Mobile
- Fix edge cases of Widget screen breaking
- Icon List block improvements

##### [Version 1.7.1](https://github.com/Codeinwp/otter-blocks/compare/v1.7.0...v1.7.1) (2021-10-25)

- Development changes
- Development changes

#### [Version 1.7.0](https://github.com/Codeinwp/otter-blocks/compare/v1.6.9...v1.7.0) (2021-10-11)

- Add Masonry Variation to Gallery
- Add Countdown Block
- Add Popup Block
- Add Contact Form Block
- Add Box Shadow extension for Image Block
- Add Review Comparison Table Block for Neve Pro
- Add Block Conditions Extension for Neve Pro
- Add WooCommerce Extension to Review Block for Neve Pro
- Add Add to Cart Block for Neve Pro
- Add Business Hours Block for Neve Pro
- Add WooCommerce Comparison Table Block for Neve Pro
- Use date format specified in general WordPress settings
- Remove duplicate category picker from Posts Block
- Allow Decimal ratings in Product Review Block
- Fix Accordion Block Styles
- Fix blocks not working on Widgets Editor
- Fix wp_enqueue_script() was called incorrectly error
- Fix price not removing in Product Review Block
- Fix Font Awesome Styles loading on all Dynamic Blocks
- Improve Review Block styles for Mobile Devices
- CSS loading improvements

##### [Version 1.6.9](https://github.com/Codeinwp/otter-blocks/compare/v1.6.8...v1.6.9) (2021-07-02)

- Fix links in Review Block
- Fix block defaults not working in Default Section
- Allow Custom sizes in Posts Block
- Add filter to Posts Block's query
- Add Tabs Block
- Add rel attribute to Review Block's Button
- Fix CSS Module breaking the editor
- Add translation support

##### [Version 1.6.8](https://github.com/Codeinwp/otter-blocks/compare/v1.6.7...v1.6.8) (2021-06-11)

* add JS translation compatibility

##### [Version 1.6.7](https://github.com/Codeinwp/otter-blocks/compare/v1.6.6...v1.6.7) (2021-06-11)

* Enhance translation compatibility

##### [Version 1.6.6](https://github.com/Codeinwp/otter-blocks/compare/v1.6.5...v1.6.6) (2021-05-24)

- Fix Product Review Block conflict with WooCommerce

##### [Version 1.6.5](https://github.com/Codeinwp/otter-blocks/compare/v1.6.4...v1.6.5) (2021-05-21)

- Add Product Review Block
- Make blocks AMP-ready
- Fix the post excerpt becoming corrupted when containing multi-byte character
- Fix Section's Overlay Gradient not working
- Fix Icon List reset on refresh
- Add Product Review Block
- Make blocks AMP-ready
- Fix the post excerpt becoming corrupted when containing multi-byte character
- Fix Section's Overlay Gradient not working
- Fix Icon List reset on refresh

##### [Version 1.6.4](https://github.com/Codeinwp/otter-blocks/compare/v1.6.3...v1.6.4) (2021-04-12)

- Fix button not centering
- Fix custom CSS not working on Leaflet Map Block
- Fix Columns width resetting
- Fix Resizer in Columns

##### [Version 1.6.3](https://github.com/Codeinwp/otter-blocks/compare/v1.6.2...v1.6.3) (2021-03-29)

- Fix Columns range crashing in Section Block.
- Fix Progress Blocks not loading on the front-end.

##### [Version 1.6.2](https://github.com/Codeinwp/otter-blocks/compare/v1.6.1...v1.6.2) (2021-03-26)

- Fix Button Groups alignment
- Don't enqueue empty CSS
- Adds new Accordion Block
- CPT support to Posts Block

##### [Version 1.6.1](https://github.com/Codeinwp/otter-blocks/compare/v1.6.0...v1.6.1) (2021-03-02)

- Fix CSS Extensions causing Reusable Blocks to crash.
- Add new Map Block
- Various fixes

#### [Version 1.6.0](https://github.com/Codeinwp/otter-blocks/compare/v1.5.12...v1.6.0) (2021-01-06)

- New Icon List Block.
- Allow editing text in Progress Bar Block.
- Reuse Gradient Control from Core.
- Fix Font Awesome loading when the non-Icon button is being used.
- Improve Server-Side CSS Method

##### [Version 1.5.12](https://github.com/Codeinwp/otter-blocks/compare/v1.5.11...v1.5.12) (2020-12-12)

- Fix ThemeIsle icons not appearing on WebKit browsers

##### [Version 1.5.11](https://github.com/Codeinwp/otter-blocks/compare/v1.5.10...v1.5.11) (2020-11-25)

- Do not add the background image to the Section when the URL is not set.
- WordPress 5.6 update chores.

##### [Version 1.5.10](https://github.com/Codeinwp/otter-blocks/compare/v1.5.9...v1.5.10) (2020-11-22)

- Responsive Images in Posts Block.
- Fix Progress Blocks.
- Don't enqueue CSS on Classic Editor posts.
- Change the Highlight tag.

##### [Version 1.5.9](https://github.com/Codeinwp/otter-blocks/compare/v1.5.8...v1.5.9) (2020-11-18)

- WordPress 5.6 compatibility.
- Fix duplicate posts appear in Posts block when using WPML.
- Fox Sharing Icons block links.
- Improve Font Awesome Icons background.
- Fix Progress Bar percentage animation.
- Add ThemeIsle Icons to Buttons & Font Awesome Icons Block.
- Rename Font Awesome Icons Block to Icon Block.
- Add Circular Progress Block.
- Allow zero value for borderSize in Button Block.

##### [Version 1.5.8](https://github.com/Codeinwp/otter-blocks/compare/v1.5.7...v1.5.8) (2020-09-14)

- Add Lottie Animations Block.
- Add Progress Bar Block.
- Prevent old custom CSS from being cached.
- Fix Slider in Section's Vertical Alignment on AMP.
- Consensual Tracking Data.

##### [Version 1.5.7](https://github.com/Codeinwp/otter-blocks/compare/v1.5.6...v1.5.7) (2020-08-12)

- Fix Button Group Block borders
- Fix Plugin Card failing with additional attributes
- Fix permission callback missing in REST API Route

##### [Version 1.5.6](https://github.com/Codeinwp/otter-blocks/compare/v1.5.5...v1.5.6) (2020-08-03)

- Button Group Improvements
- Fixed Caption field missing from Slider Block
- Image management in Slider & Gallery Block
- Fix issue with CSS inline loading twice
- Fix Posts Block offset bug
- Remove default font size from Posts Block
- Improve Animation Picker

##### [Version 1.5.5](https://github.com/Codeinwp/otter-blocks/compare/v1.5.4...v1.5.5) (2020-06-22)

- Dropped support for WordPress 5.4
- Store images locally when importing templates
- The improved template import mechanism
- Fix CSS file is not enqueued for posts outside the main loop
- Drop support for WordPress 5.3
- Add backward compatibility to Template Library import
- Fix category filter in Posts Section
- Add new Block Templates

##### [Version 1.5.4](https://github.com/Codeinwp/otter-blocks/compare/v1.5.3...v1.5.4) (2020-05-26)

- Use WP File System in Template Import
- Fix CSS Regeneration
- Add TinyMCE in Map Marker
- Use ServerSideLoader in Author & Sharing Blocks
- Fix Posts Block for Gutenberg 8.0
- Display template name in Template Library
- Add AMP Support to Slider Block
- Remove Section Outline
- Add AMP Support to Google Maps Block
- Fix Horizontal/Vertical Alignment
- Add Template Preview in Template Library
- Fix issue with Color resetting in Button Group & Section
- Fix Font Awesome not loading on Index Pages
- Add two new templates
- Fix SVG issue in Slider & Section Block
- Add Menu Icons Module

##### [Version 1.5.3](https://github.com/Codeinwp/otter-blocks/compare/v1.5.2...v1.5.3) (2020-04-10)

- Remove Icons from Range Controls
- Add ColorIndicator to Color Controls
- Move Vertical Alignment to Toolbar
- Fix Button Hover Color not saving
- Fix Responsive Controls not working
- Regenerate CSS file if it doesn't exist
- Update Font Awesome to the latest version

##### [Version 1.5.2](https://github.com/Codeinwp/otter-blocks/compare/v1.5.1...v1.5.2) (2020-03-30)

- Improve Responsiveness Control
- Remove Popover from Sizing Control
- Add Button Border to Global Defaults
- Fix issue with CSS not saving properly

##### [Version 1.5.1](https://github.com/Codeinwp/otter-blocks/compare/v1.5.0...v1.5.1) (2020-03-20)

- Adds compatibility with WordPress 5.4
- Fixed release issue with 1.5.0

#### [Version 1.5.0](https://github.com/Codeinwp/otter-blocks/compare/v1.4.1...v1.5.0) (2020-03-20)

- Adds compatibility with WordPress 5.4
- Adds compatibility with WordPress 5.4

##### [Version 1.4.1](https://github.com/Codeinwp/otter-blocks/compare/v1.4.0...v1.4.1) (2020-02-29)

- Fix issue with Button Group & Global Defaults
- Add Offset to Posts Block
- Allow custom IDs in Section & Advanced Heading Block
- Add speed option in Slider Block
- Fix issue with Overlay Gradient not working in Section Block

#### [Version 1.4.0](https://github.com/Codeinwp/otter-blocks/compare/v1.3.3...v1.4.0) (2020-02-23)

- Add Column Width control to Sidebar
- Remove Inline CSS from Blocks
- Fix Block ID Mechanism
- Add Global Defaults
- Improve Vertical Alignment to Section Block
- Add option to disable Arrows/Bullets in Slider Block
- Option to reverse columns in Section
- Add theme_support for global defaults
- Inherit Sizing values
- Button Group consistency with Button Block
- Add Anchor field to Advanced Heading Block

##### [Version 1.3.3](https://github.com/Codeinwp/otter-blocks/compare/v1.3.2...v1.3.3) (2020-01-19)

Fix issue with Custom CSS module not working

##### [Version 1.3.2](https://github.com/Codeinwp/otter-blocks/compare/v1.3.1...v1.3.2) (2020-01-10)

- Add Slider Transforms [#142](https://github.com/Codeinwp/otter-blocks/issues/142)
- Improve Onboarding Experience & New Icons: [#144](https://github.com/Codeinwp/otter-blocks/issues/144)
- Remove deprecated blocks: [#103](https://github.com/Codeinwp/otter-blocks/issues/103)
- React Hooks: [#145](https://github.com/Codeinwp/otter-blocks/issues/145)
- Remove background from Posts Block: [#149](https://github.com/Codeinwp/otter-blocks/issues/149)
- Allow changing Title tag in Posts Block: [#147](https://github.com/Codeinwp/otter-blocks/issues/147)
- Change Category from H6 to Span: [#148](https://github.com/Codeinwp/otter-blocks/issues/148)
- Option to remove the image's box-shadow: [#146](https://github.com/Codeinwp/otter-blocks/issues/146)
- Fix domino effect in Sizing Component: [#151](https://github.com/Codeinwp/otter-blocks/issues/151)
- Add tracking toggle to Option Page
- Use React Hooks for Option Panel

### v1.3.1 - 2019-12-03 
 **Changes:** 
 * - Added Slider Block
* - Fixed issue with extensions failing with ServerSideRenderer
 
 ### v1.3.0 - 2019-11-05 
 **Changes:** 
 * Lazy load Font Awesome Picker to improve load time.
* Fixed link fetching in WP 5.0
* Added Style Switcher to Block Controls
* Added Map Styles to Google Map Block
* Improved CSS handling for blocks
* Added block navigator to Section block
* Added inserter to Button Group
* Fixed Marker Modal closing on search
* Fixed sizing control focus
* Fixed post excerpt now showing in Posts Grid
* Added meta control options to Posts Block
* Added improved Gradient Picker control
 
 ### v1.2.5 - 2019-09-10 
 **Changes:** 
 * Fix AMP compatibility errors.
 
 ### v1.2.4 - 2019-07-30 
 **Changes:** 
 * Fix Internet Explorer incompatibility
* Add option to choose Marker color for Google Map block
* Refreshed "New Marker" UI for Google Map block
 
 ### v1.2.3 - 2019-05-24 
 **Changes:** 
 * Add BlockInserter
* Google Maps Improvements
* Link Component Improvements
* Fix Sizing Control value type
 
 ### v1.2.2 - 2019-05-08 
 **Changes:** 
 * Add HTML Anchor to Section Block.
* Change Default Section setting.
* Fix resizer styles.
* Add Link Component.
* Add Marker button to Map.
* Remove Padding Resizer.
* Better UI for Sizing Control.
* Fix Dynamic CSS not rendering on reusable blocks.
* Validate blocks before importing.
 
 ### v1.2.1 - 2019-04-20 
 **Changes:** 
 * Update version
 
 ### v1.2.0 - 2019-04-18 
 **Changes:** 
 * Added Otter Option page
* Added update notice on Template Library
* Redesigned Google Map block
* Redesigned Post Grid block
* Removed Handsontable from Chart block
 
 ### v1.1.5 - 2019-03-08 
 **Changes:** 
 * Redesign Template Library
* Added Dynamic Column Resizing
* Added option to Auto Display Columns on Pages
* Added Section Outline to make it easier to edit sections
* Added Hover and Link settings to Font Awesome Block
* Removed Google + icon from Sharing Icons Block
* Fixed alignment controls
* Fixed issue with non-editors not being able to use inline CSS and template library.
* Fixed Button Group errors
* Fixed Sharing Icons block having wrong icon order in front-end
 
 ### v1.1.4 - 2019-01-31 
 **Changes:** 
 * Fix Font Awesome Block update path
* Show selected font in Google Font picker
* Fix Font Awesome Picker component being case-sensitive
 
 ### v1.1.3 - 2019-01-30 
 **Changes:** 
 * Adds Feedback for Button Group Switch
* Fixes Post Grid throwing an error
* Fixes issue with multiple block templates being inserted on the same post
* Fixes Font Awesome block alignment on the backend
 
 ### v1.1.2 - 2019-01-28 
 **Changes:** 
 * Fix Button Group Migration
* Revamped Font Awesome Icon Picker
 
 ### v1.1.1 - 2019-01-25 
 **Changes:** 
 * Added Developer Documentation
* Added Typography Option to Block Toolbar
* Fixed Padding Resizer
* Made Template Library Responsive
* Fixed Close Icon Alignment on Chrome
* Fixed Alignment with Span Tag in Advanced Heading Block
* Added Line Height Option to Button Group
* Added Option to Collapse Buttons
* Fixed Icon Issue in Button Group
* Increased Maximum Font Size Limit
* Fixed Font Weight Value Error
* Fixed Fatal Error Caused by Gutenberg Plugin
* Fixed Unescaped Character Preview in Post Grid
* Improved Handling of Unique Block IDs
* Added Left/Right Margin Options to Section Column
* Added Controls for Responsive Alignment to Advanced Heading Block
* Fixed Vertical Alignment in Section Block
* Fixed Alignment Issue in Social Sharing Block
 
 ### v1.1.0 - 2019-01-18 
 **Changes:** 
 * Added Section Block, with Template Library
* Added Advanced Heading Block
* Added Button Group Block
* Deprecated Notice, Click to Tweet, Chart, Accordion, blocks
 
 ### v1.0.4 - 2018-12-07 
 **Changes:** 
 * - Fixed dependencies issue
 
 ### v1.0.3 - 2018-12-07 
 **Changes:** 
 * - Fixes issue with Posts Grid block displaying wrong author
 
 ### v1.0.2 - 2018-12-05 
 **Changes:** 
 * - Fixed Notice Block and Font Awesome Icons
* - Optimized build size
 
 ### v1.0.1 - 2018-10-29 
 **Changes:** 
 * - Bug fixed with Google Map block.
 
 ### v1.0.0 - 2018-10-17 
 **Changes:** 
 * Adds docker env.
* Adds hash back.
