# Contributing to DataLens Studio

First off, thank you for considering contributing to DataLens Studio! It's people like you that make DataLens Studio such a great tool.

## Where do I go from here?

If you've noticed a bug or have a question, [search the issue tracker](#) to see if someone else in the community has already created a ticket. If not, go ahead and [make one](#)!

## Fork & create a branch

If this is something you think you can fix, then [fork DataLens Studio](#) and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```bash
git checkout -b 325-add-new-scaling-method
```

## Setup the Development Environment

Please follow the installation instructions in the [README.md](README.md) to get the three services running (Frontend, Backend, and Engine). Make sure all three are running and interacting properly before executing tests or adding new code.

## Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first.

If you are adding a new preprocessing method to the **Python Engine**, make sure to:
1. Update `main.py` in the `/api/preprocess` endpoint.
2. Add the corresponding frontend select option in the `PreprocessingView.jsx` component.

## Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with DataLens Studio's master branch:

```bash
git remote add upstream git@github.com:yourusername/datalens-studio.git
git checkout main
git pull upstream main
```

Then update your feature branch from your local copy of master, and push it!

```bash
git checkout 325-add-new-scaling-method
git rebase main
git push --set-upstream origin 325-add-new-scaling-method
```

Finally, go to GitHub and [make a Pull Request](#) with a clear description of what you just accomplished and how to test it.

## Code Style

- **Frontend**: We use ESLint and Prettier. Please ensure your React code follows modern hooks paradigms and matches the Shadcn/Tailwind aesthetic.
- **Backend**: Standard Node.js conventions apply.
- **Engine**: We follow standard PEP 8 formatting for Python code.

Thank you for contributing!
