# SHKAF — Wardrobe Blog

**SHKAF** is a fashion blog where a user can explore inspirational selected fashion content from runway shows and archives and save favorite pieces into their personal favorites.<br>
The website is built using **Node.js**, **Express**, and the **Liquid** templating engine. All data is dynamically loaded from JSON files. Check out the website on this link (it can take up to 10 seconds to load): https://shkaf.onrender.com. 

<img width="1167" alt="image" src="https://github.com/user-attachments/assets/df0d51bc-fe6d-47b5-9fb9-a3561cac39f9" />

---

## Functionalities

- [x] Inlogpagina (gebruiker geeft naam en e-mail op)
- [x] Welkomstpagina met persoonlijke begroeting
- [x] Dynamische blogpagina met filterbare categorieën
- [x] Favorietenfunctionaliteit (toevoegen/verwijderen)
- [x] Individuele blogposts met extra info en afbeeldingen
- [x] Donker/licht modus (via button)
- [x] Data-driven: blogposts komen uit `data.json`, favorieten uit `favorites.json`

### How to use  
1. Login on the homepage by entering your name and email.
2. You will be redirected to the landing page with a personalized greeting and introduction.
3. From there, explore the blog, filter by categories, and add favorites.
4. Visit the Favorites page to see your saved looks.
5. Use the dark mode toggle to switch between light and dark themes. 

---

## Structure

<img width="615" alt="image" src="https://github.com/user-attachments/assets/e1371f05-5a72-48d0-ba5a-d7c3c4f86b28" />

---

## Used technologies

| Technology      | Purpose                                             |
|-----------------|-----------------------------------------------------|
| Node.js         | Server-side JavaScript                              |
| Express.js      | Routing and backend-framework                       |
| LiquidJS        | Templating engine for HTML rendering                |
| HTML/CSS        | Structuur en styling                                |
| JavaScript      | Client-side interaction (favorites/ category filter)|
| JSON            | Data format for blog posts and user storage         |
| Nodemon         | Development server for live-reloading               |

---

## Installation and usage

1. Clone this repository:

```
git clone https://github.com/your-username/wardrobe_blog.git
cd wardrobe_blog
```

2. Install dependencies:

```
npm install
```

3. Start the server:

```
npm run dev
```

4. Open locally in your browser:

```
Server started on http://localhost:2000
```

