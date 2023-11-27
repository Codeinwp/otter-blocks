# Adding Onboarding Support to Your FSE Theme

## Overview
Integrate Otter Onboarding support in your Full Site Editing (FSE) theme by defining layout and page templates. This process requires specific theme support with defined templates.

## Integration Code

Add the following code to integrate Otter Onboarding:

```php
add_theme_support(
    'otter-onboarding',
    array(
        'templates' => array(
            'archive' => array(
                'archive-modern' => array(
                    'file'  => 'path/to/archive-modern.html',
                    'title' => 'Modern Archive',
                ),
                'archive-classic' => array(
                    'file'  => 'path/to/archive-classic.html',
                    'title' => 'Classic Archive',
                ),
            ),
            'single' => array(
                'single-feature-rich' => array(
                    'file'  => 'path/to/single-feature-rich.html',
                    'title' => 'Feature Rich Single Post',
                ),
                'single-minimal' => array(
                    'file'  => 'path/to/single-minimal.html',
                    'title' => 'Minimal Single Post',
                ),
            ),
            'front-page' => array(
                'front-page-landing' => array(
                    'file'     => 'path/to/front-page-landing.html',
                    'title' => 'Landing Page',
                ),
                'front-page-blog' => array(
                    'file'     => 'path/to/front-page-blog.html',
                    'title' => 'Blog Homepage',
                ),
            ),
        ),
        'page_templates' => array(
            'about-us' => array(
                'file'     => 'path/to/about-us.html',
                'title'    => 'About Us',
                'template' => 'about-template', // Optional, specifies page template to use
            ),
            'contact-page' => array(
                'file'     => 'path/to/contact-page.html',
                'title'    => 'Contact Us',
                // If 'template' is not defined, the default template will be used
            ),
        ),
    )
);
```

## Parameters Explanation

### `templates`
Define layout templates for different page types.

- **Key**: Template type (e.g., `archive`, `single`, `front-page`).
- **Value**: Array of template options with `file` (template file path) and `title` (localized display title).

### `page_templates`
Specify page templates for onboarding import.

- **Key**: Page name (e.g., `about-us`, `contact-page`).
- **Value**: Array including `file` (path to template file), `title` (localized page title), and optionally `template` (specifies the page template to use).

## Notes

- Modify file paths and titles to suit your theme's structure and branding.
- Localize titles for translation readiness.
- Adhere to the array structure for proper recognition and import by the onboarding process.
