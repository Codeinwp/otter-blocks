# Form Block Workflow

A guide about how Form workflow works.

## The scope

Allowing the end user to send some data to the website owner. Data can be: text, number, email, date, files, etc. The can be sent to a third party service or to the website owner. It can go via email or internal storage.

When doing this we need to consider the following:
- Bots. We need to prevent bots from sending data.
- Security. We need to prevent malicious data from being sent. Data sanitization, validation, etc. For files we have to consider the numbers, the size and the type.
- 3rd party services. We need to consider the API of the service and how to send the data.

## How it works from the Submit click to the data being sent

When the user clicks on the Submit button, the following happens:
- The data is validated with JS and collected. Then sended to the server via `wp-json/form/frontend` endpoint (definition in `./inc/server/class-form-server.php`).
- The data is validated with PHP via `otter_form_validate_form` filter hook. If the data is invalid, we check if it was sended by a bot with `otter_form_anti_spam_validation` filter hook.
- If all ok, we apply some data preparation `otter_form_data_preparation`. This will add or change the data from the `$form_data` variable.
- If everything goes well, we get the provider (the service that will receive the data) and run with the current data request of `$form_data`.
- At the end we do a `otter_form_after_submit` to trigger extra actions. (deleting files, sending data to 3rd party services, auto-responder, etc.)

You will see in the server a lot of error handling. This is because we need to be sure that the data is sent to the user. If something goes wrong, we need to inform the user or the admin (in critical cases). For the server part, the PHP utility files are in `./inc/integrations/`.

## Where are the options for the form?

As you know, you can not trust the request that come to the server. It might be malicious. When we process a request, we pull the options of the form that send the request with the `get_option` function (the data is saved in WordPress options and you can see the definition in `./inc/plugins/class-options-settings.php` ) and check if request respect the options. If not, we return an error.

If you add a new feature and need to save in options, make sure to change the definition from `./inc/plugins/class-options-settings.php`.

