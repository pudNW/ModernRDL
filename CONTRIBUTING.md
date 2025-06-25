# Contributing to ModernRDL

First off, thank you for considering contributing to ModernRDL! It's people like you that make this project such a great tool. We are thrilled to have you here.

This document provides guidelines for contributing to the project. Please feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by the [ModernRDL Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

There are many ways to contribute, from writing code and documentation to submitting bug reports and feature requests. Every contribution is appreciated!

### Reporting Bugs

If you find a bug, please ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/pudNW/ModernRDL/issues).

If you're unable to find an open issue addressing the problem, please [open a new one](https://github.com/pudNW/ModernRDL/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample or an executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for an enhancement, please first search the [Issues](https://github.com/pudNW/ModernRDL/issues) to see if it has been discussed before. If not, feel free to [open a new feature request](https://github.com/pudNW/ModernRDL/issues/new).

Please provide a clear description of the enhancement, why it would be useful, and if possible, a high-level plan for implementation.

### Your First Code Contribution

Unsure where to begin contributing to ModernRDL? You can start by looking through these `good first issue` and `help wanted` issues:

* **Good first issues** - issues which should only require a few lines of code, and a test or two.
* **Help wanted** - issues which should be a bit more involved than `good first issue` issues.

## Pull Request Process

We follow the standard GitHub "fork-and-pull" workflow.

1.  **Fork the repository** to your own GitHub account.
2.  **Clone the project** to your machine: `git clone https://github.com/pudNW/ModernRDL.git`
3.  **Create a new branch** for your changes. Please use a descriptive name.
    ```bash
    git checkout -b feat/my-awesome-feature
    # or
    git checkout -b fix/bug-in-rendering
    ```
    and use `npm install` in 3 different folders, ModernRDL itself, client and server.
4.  **Make your changes** in the new branch.
5.  **Commit your changes**. Please follow our commit message conventions (see below).
    ```bash
    git add .
    git commit -m "feat: Add support for rounded corners on textboxes"
    ```
6.  **Push your branch** to your fork on GitHub.
    ```bash
    git push origin feat/my-awesome-feature
    ```
7.  **Open a Pull Request (PR)** from your fork to our `main` branch.
8.  In the PR description, provide a clear explanation of the changes and **link to the issue** it resolves (e.g., `Closes #123`).
9.  Wait for a project maintainer to review your PR. We will do our best to provide feedback promptly. We may ask for changes before merging.

## Style Guides

### Git Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for our commit messages. This helps us automate changelogs and makes the commit history easier to read. Please follow this format:

`<type>[optional scope]: <description>`

* **`feat`**: A new feature
* **`fix`**: A bug fix
* **`docs`**: Documentation only changes
* **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
* **`refactor`**: A code change that neither fixes a bug nor adds a feature
* **`test`**: Adding missing tests or correcting existing tests
* **`chore`**: Changes to the build process or auxiliary tools

Example: `feat(renderer): Add support for linear gradients`

#### Code Style

To ensure a consistent code style across the project, we use **ESLint** for code quality and **Prettier** for code formatting.

* **ESLint** helps us find potential bugs and enforce best practices.
* **Prettier** automatically formats the code to maintain a uniform style.

Configuration files (`.eslintrc.json`, `.prettierrc`) are included in the root of this repository. Most code editors can be configured to use these automatically.

**Please run the linter and formatter before committing your changes** to ensure your contribution aligns with the project's style. You can do this by running:

```bash
npm run lint
npm run format
```
(This section can be updated to include .NET styling guidelines if a C# backend is added in the future.)

---

Thank you again for your interest in making ModernRDL better! We can't wait to see your contributions.
