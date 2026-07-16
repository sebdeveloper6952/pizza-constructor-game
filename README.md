# 🍕 Pizza Constructor

An interactive activity for teaching **classes, objects, constructors, instantiation, and multiple
instances** in Java.

A customer places an **order** on the right (e.g. "one large BBQ pizza and two colas"). The student
writes Java on the left, creating **one object per item** — `new Pizza(...)` and `new Drink(...)`. Each
object appears as a tile on a serving tray, labelled with its variable name. When the bag of objects
they built matches the order, it's served.

Two classes are involved:

- `Pizza(String size, String sauce, String... toppings)`
- `Drink(String flavor)`

Quantity is expressed by **repeated `new` statements** — writing `new Pizza(...)` twice makes two
objects — which is the whole point: a class is a mold you can pour many objects from.

> Built with SvelteKit + the static adapter, so it deploys for **free** to GitHub Pages.
> Live target URL: **https://sebdeveloper6952.github.io/pizza-constructor-game/**

## How it works (the important teaching detail)

The app **does not run Java** — GitHub Pages is static hosting, so there's no JVM. Instead, a small,
forgiving parser (`src/lib/parser.ts`) scans the student's code for **every** `new Pizza(...)` /
`new Drink(...)` call, captures each object's variable name and String arguments, and turns them into
objects. This keeps the lesson tightly focused on **constructors and instantiation** and gives
*instant, specific* feedback per statement (wrong quotes, missing `new`, unknown class, too few
arguments, …) which become mini teaching moments.

So a valid answer to "one large BBQ pizza and two colas" looks like:

```java
Pizza p1 = new Pizza("large", "bbq", "chicken", "onion", "bacon");
Drink d1 = new Drink("cola");
Drink d2 = new Drink("cola");
```

Matching is a **multiset compare**: it's **case-insensitive**, **topping order doesn't matter**, and it
counts quantities — so feedback can say things like *"Missing: 1× Cola"* or *"Remove: 1× medium pizza"*.
Students aren't punished for harmless differences, only for building the wrong set of objects.

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
**https://sebdeveloper6952.github.io/pizza-constructor-game/**.

1. Create a GitHub repository named **`pizza-constructor-game`** and push this project to it.
   (A project site is served under a path equal to the repo name, so the repo name **must** be
   `pizza-constructor-game` for the URL above to work.)
2. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Push to `master`. The workflow builds with `BASE_PATH=/pizza-constructor-game` and publishes the site.

Locally `BASE_PATH` stays empty, so the app runs at the root during `npm run dev`.

> Renaming later? If you ever change the repo name, update `BASE_PATH` in
> `.github/workflows/deploy.yml` to match the new name.

## Customize the game

Everything content-related lives in `src/lib/pizza.ts`:

- **`ORDERS`** — add / edit / reorder the customer orders (each is one "level"). An order is a list of
  line-items, each with a `count`, so "2 colas" is just `{ kind: 'Drink', count: 2, flavor: 'cola' }`.
- **`TOPPINGS`** — add a topping name + its icon (used in the order chips and on the pizza).
- **`SIZES` / `SAUCES`** — sizes (affect the rendered diameter) and sauces (affect color).
- **`DRINKS`** — drink flavors + the color of the cup.

No other files need to change to add new orders.

## Project layout

```
src/
  lib/
    parser.ts               # scans for all new Pizza(...) / new Drink(...) -> objects (+ errors)
    pizza.ts                # domain: sizes, sauces, toppings, drinks, ORDERS, multiset matching
    components/
      OrderCard.svelte      # the customer's order with quantities (the target)
      InstanceTile.svelte   # one tile per object (var name + class + state)
      PizzaView.svelte      # SVG pizza; DrinkView.svelte — SVG cup
      CodeEditor.svelte     # CodeMirror editor (editable + read-only modes)
  routes/
    +page.svelte            # the two-pane game UI + serving tray
    +layout.svelte / .ts    # prerender config + favicon
```
