/* ==========================================================================
   PORTFOLIO CONFIGURATION
   Edit this file to update your content. No other file needs to change for:
   profile photo, availability, email, social links, skills, projects, photos.

   Rule for links: leave a URL as "" (empty) when it isn't ready yet.
   The matching button is then disabled (projects/contact) or hidden (footer).
   ========================================================================== */

window.PORTFOLIO_CONFIG = {
  owner: {
    name: "Youssef Ayash",
    // Replace with your own photo, e.g. "assets/images/profile.jpg"
    profileImage: "assets/images/profile-placeholder.svg",
    profileAlt: "Profile photo of Youssef Ayash"
  },

  // Small status pill in the hero. Set show to false to hide it.
  // state: "neutral" (blue) | "available" (green) | "busy" (amber)
  availability: {
    show: true,
    state: "neutral",
    text: "Learning and building new projects"
  },

  contact: {
    // Your public email address, e.g. "name@example.com". Leave "" until you add it.
    email: "",
    // Optional: a form service URL (for example a Formspree endpoint).
    // If set, the form sends through it. If empty, the form opens the visitor's
    // email app (mailto) addressed to the email above.
    formEndpoint: ""
  },

  // Leave url as "" until you have the real link.
  // Items with optional: true only appear once a url is added.
  socials: [
    { id: "github", label: "GitHub", url: "" },
    { id: "linkedin", label: "LinkedIn", url: "" },
    { id: "instagram", label: "Instagram", url: "", optional: true },
    { id: "x", label: "X (Twitter)", url: "", optional: true }
  ],

  skills: [
    {
      category: "Core Web",
      description: "The foundations of everything I build.",
      items: ["HTML5", "CSS3", "JavaScript"]
    },
    {
      category: "Design & Layout",
      description: "Making interfaces work on every screen.",
      items: ["Responsive Web Design"]
    },
    {
      category: "Interactivity",
      description: "Bringing pages to life in the browser.",
      items: ["DOM Manipulation", "JavaScript Events"]
    },
    {
      category: "Async & Data",
      description: "Working with data from APIs.",
      items: ["Fetch API", "Async/Await"]
    },
    {
      category: "Tools",
      description: "Version control and collaboration.",
      items: ["Git", "GitHub"]
    }
  ],

  /* Projects
     - liveUrl / sourceUrl: leave "" until you have the real link.
     - image / screenshots: replace the placeholder paths with your own files.
     - technologies: edit so they match what you actually used. */
  projects: [
    {
      id: "al-masai-school",
      name: "Al-Masai School Website",
      summary: "A school website with Arabic RTL support, responsive pages, registration features, and a backend connected to PostgreSQL.",
      image: "assets/images/projects/al-masai-1.webp",
      imageAlt: "Home page of the Al-Masai School Website with an Arabic right-to-left layout",
      technologies: ["HTML5", "CSS3", "JavaScript", "PostgreSQL"],
      liveUrl: "",
      sourceUrl: "",
      overview: "A website for a school that supports Arabic with a right-to-left (RTL) layout. It has responsive pages and registration features, backed by a server that stores data in a PostgreSQL database.",
      features: [
        "Arabic content with full right-to-left (RTL) layout support",
        "Responsive pages that adapt to different screen sizes",
        "Registration features for the school",
        "Backend connected to a PostgreSQL database"
      ],
      screenshots: [
        { src: "assets/images/projects/al-masai-1.webp", alt: "Home page hero of the Al-Masai School Website in Arabic" },
        { src: "assets/images/projects/al-masai-2.webp", alt: "About page of the Al-Masai School Website with vision, mission, and values cards" },
        { src: "assets/images/projects/al-masai-3.webp", alt: "Admission and registration form page of the Al-Masai School Website" }
      ],
      learnings: [
        "Designing and testing right-to-left layouts for Arabic content",
        "Connecting a front-end registration flow to a backend and database",
        "Keeping pages usable across phones, tablets, and desktops"
      ]
    },
    {
      id: "urban-cart",
      name: "Urban Cart",
      summary: "An e-commerce project featuring product browsing, categories, cart functionality, and checkout-related interfaces.",
      image: "assets/images/projects/urban-cart-1.webp",
      imageAlt: "Home page of the Urban Cart e-commerce project",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      liveUrl: "",
      sourceUrl: "",
      overview: "An e-commerce project that covers the main shopping journey on the front end: browsing products, moving between categories, using a cart, and going through checkout-related screens.",
      features: [
        "Product browsing",
        "Product categories",
        "Cart functionality",
        "Checkout-related interfaces"
      ],
      screenshots: [
        { src: "assets/images/projects/urban-cart-1.webp", alt: "Urban Cart home page with the hero section and main navigation" },
        { src: "assets/images/projects/urban-cart-2.webp", alt: "Urban Cart wishlist page showing saved products" },
        { src: "assets/images/projects/urban-cart-3.webp", alt: "Urban Cart shop page with product filters and a product grid" }
      ],
      learnings: [
        "Handling cart interactions with JavaScript and DOM updates",
        "Organizing products and categories into clear, browsable layouts",
        "Designing the interface steps of a checkout flow"
      ]
    },
    {
      id: "ai-vision",
      name: "AI Vision",
      summary: "A modern AI-themed web interface focused on presenting features and product information.",
      image: "assets/images/projects/ai-vision-1.webp",
      imageAlt: "Hero section of the AI Vision web interface",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      liveUrl: "",
      sourceUrl: "",
      overview: "A modern, AI-themed web interface built to present a product's features and information in a clear and engaging way.",
      features: [
        "Modern AI-inspired visual theme",
        "Clear presentation of features",
        "Product information laid out for easy reading"
      ],
      screenshots: [
        { src: "assets/images/projects/ai-vision-1.webp", alt: "AI Vision hero section with an animated orbit graphic" },
        { src: "assets/images/projects/ai-vision-2.webp", alt: "AI Vision features section with four capability cards" },
        { src: "assets/images/projects/ai-vision-3.webp", alt: "AI Vision contact section with a message form" }
      ],
      learnings: [
        "Building a consistent, modern visual theme",
        "Structuring feature and product information so it is easy to scan"
      ]
    },
    {
      id: "greenbasket-hypermarket",
      name: "GreenBasket Hypermarket",
      summary: "A modern hypermarket website with a clean layout and a green visual identity.",
      image: "assets/images/projects/greenbasket-1.webp",
      imageAlt: "Home page of the GreenBasket Hypermarket website",
      technologies: ["HTML5", "CSS3", "JavaScript"],
      liveUrl: "",
      sourceUrl: "",
      overview: "A modern website for a hypermarket, designed around a clean layout and a fresh green visual identity.",
      features: [
        "Clean, easy-to-read layout",
        "Green visual identity",
        "Modern, responsive design"
      ],
      screenshots: [
        { src: "assets/images/projects/greenbasket-1.webp", alt: "GreenBasket Hypermarket home page with the hero banner" },
        { src: "assets/images/projects/greenbasket-2.webp", alt: "GreenBasket Hypermarket About Us page" },
        { src: "assets/images/projects/greenbasket-3.webp", alt: "GreenBasket Hypermarket Contact Us page with a message form" }
      ],
      learnings: [
        "Applying a consistent color identity across a whole site",
        "Keeping layouts clean and readable on different screen sizes"
      ]
    }
  ],

  // Your own photos (jpg, png, webp). Add more entries or change the order freely.
  // caption is optional and shown under the photo in the viewer.
  photos: [
    {
      src: "assets/images/photos/photo-1.jpg",
      alt: "Youssef Ayash in a light pink polo shirt against a deep blue background",
      caption: ""
    },
    {
      src: "assets/images/photos/photo-2.jpg",
      alt: "Youssef Ayash standing in a cream lattice garden structure, wearing a black t-shirt and light blue jeans",
      caption: ""
    }
  ]
};
