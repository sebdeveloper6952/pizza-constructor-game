# 🍕 Pizza Constructor

An interactive activity for teaching **classes, objects, constructors, and instantiation** in Java.

A customer places an **order** on the right. The student writes Java on the left to instantiate a
`Pizza` object that matches the order. When their `new Pizza(...)` call builds the right object, the
pizza renders and the order is served.

> Built with SvelteKit + the static adapter, so it deploys for **free** to GitHub Pages.
> Live target URL: **https://sebdeveloper6952.github.io/classes-and-objects/**

## How it works (the important teaching detail)

The app **does not run Java** — GitHub Pages is static hosting, so there's no JVM. Instead, a small,
forgiving parser (`src/lib/parser.ts`) reads the student's `new Pizza(...)` call, extracts the String
arguments, and turns them into an object. This keeps the lesson tightly focused on **one concept — the
constructor** — and gives *instant, specific* feedback (wrong quotes, missing `new`, wrong class name,
too few arguments, …) which become mini teaching moments.

The constructor the students are targeting:

```java
public class Pizza {
    String size;
    String sauce;
    String[] toppings;

    public Pizza(String size, String sauce, String... toppings) { ... }
}
```

So a valid answer looks like:

```java
Pizza pizza = new Pizza("large", "tomato", "pepperoni", "mushroom");
```

Matching is **case-insensitive** and **topping order doesn't matter**, so students aren't punished for
harmless differences — only for building the wrong object.

## Run locally

```bash
npm install
npm run dev        # open the printed http://localhost:5173
```

Other commands:

```bash
npm run build      # production build into ./build
npm run preview    # preview the production build
npm run check      # type-check
```

## Deploy to GitHub Pages

This repo ships a workflow at `.github/workflows/deploy.yml` that builds and deploys automatically to
**https://sebdeveloper6952.github.io/classes-and-objects/**.

1. Create a GitHub repository named **`classes-and-objects`** and push this project to it.
   (A project site is served under a path equal to the repo name, so the repo name **must** be
   `classes-and-objects` for the URL above to work.)
2. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Push to `main`. The workflow builds with `BASE_PATH=/classes-and-objects` and publishes the site.

Locally `BASE_PATH` stays empty, so the app runs at the root during `npm run dev`.

> Renaming later? If you ever change the repo name, update `BASE_PATH` in
> `.github/workflows/deploy.yml` to match the new name.

## Customize the game

Everything content-related lives in `src/lib/pizza.ts`:

- **`ORDERS`** — add / edit / reorder the customer orders (each is one "level").
- **`TOPPINGS`** — add a topping name + its icon (used both in the order chips and on the pizza).
- **`SIZES` / `SAUCES`** — available sizes (affect the rendered diameter) and sauces (affect color).

No other files need to change to add new orders.

## Project layout

```
src/
  lib/
    parser.ts               # reads `new Pizza(...)` -> object (+ friendly errors)
    pizza.ts                # domain: sizes, sauces, toppings, ORDERS, matching
    components/
      OrderCard.svelte      # the customer's order (the target)
      PizzaView.svelte      # SVG pizza rendered from the parsed object
  routes/
    +page.svelte            # the two-pane game UI
    +layout.svelte / .ts    # prerender config + favicon
```
