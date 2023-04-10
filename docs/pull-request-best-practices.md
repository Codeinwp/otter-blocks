# Pull Request Best Practices

Making a good pull request is a great way to get your code reviewed and merged quickly.

## Why is this important?

A good redacted pull request can save a lot of time for both the tester and the reviewer.

Let's say your coworker asked you for a feedback on a feature he is working on. You open the pull request and see no screenshot or video about the current state of the feature. 
You have to clone the branch, build the app, and try it out. And while you are trying out you are not sure why some thing does not work and spend like 15 minutes trying to figure it out. You do not succeed and you ask your coworker about it. 
Then he tells you that you need some X setting before trying it out, then you are like "oh, I did not know that, you could have told me that".

Now imagine you are the tester. Without a good description, screenshot or a video you do not know what is the correct behavior and what is not. Sometime you can get the context from the issued linked to the pull request, but sometimes you can't (sometime the issue is long a discussion about what feature to include, and the discussion might not be integral since some information might be on private messages).

Having a clear description on what feature does or what bug does fix, and how to test it, can save a lot of time for everyone.

## How to write a good pull request

We know why it is important to write a good pull request, but how do we do it? How does it look like?

Examples of good pull requests:
- [Otter#1596](https://github.com/Codeinwp/otter-blocks/pull/1596) :: Bug fix
- [Otter#1562](https://github.com/Codeinwp/otter-blocks/pull/1562) :: Feature
- [Otter#1598](https://github.com/Codeinwp/otter-blocks/pull/1598) :: Feature
- [Otter#1529](https://github.com/Codeinwp/otter-blocks/pull/1529) :: Bug fix
- [Otter#1457](https://github.com/Codeinwp/otter-blocks/pull/1457) :: Feature

What do you notice? Let's break it down:
- Summary: a short description of what the pull request does - implemented feature, fixed bug, etc. You can mention what are the changes (using a new function, adding a new filter, etc).
- Screenshots: a screenshot of the feature or bug fix. If you are fixing a bug, you can add a screenshot of the bug and a screenshot of the fix. In case of a feature, you can add a screenshot or a video on how it works.
- Testing instructions: a list of steps that the tester needs to do in order to test the feature or the bug fix.
 - If your PR require a specific setup: 3rd party plugin, theme, API key, etc, -- **mention it in the testing instructions**.
 - If you have a complex workflow to test the feature (like creating Stripe products in Stripe dashboard to test Stripe Checkout Button Block), you can add a video or a gif. You can use [Loom](https://www.loom.com/) or OBS to record your screen. A good video can be worth a thousand words and will result in a faster review and good feedback from QA team.
- Issue link: Every PR has to be linked to an issue (Do not forgot to use Github linking from Sidebar under Development section).

A good rule of thumb is: "Every coworker who is going to see the pull request should be able to understand what it does and how to test it".

And also remember:
- Not everyone is aware of the context of the pull request. Make it clear.
- Do not assume that the tester always knows how to test the feature or the bug fix. The person might be a new person unfamiliar with the project, or might be a person who is not familiar with the feature you are working on.
- If you can not find your words to describe a complex feature, you can make a video to show it and shortly explain some parts of it.