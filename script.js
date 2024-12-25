(function () {
    const LOCAL_STORAGE_KEY = "carouselProducts";

    const init = () => {
      if (!isProductPage()) return;

      const serverUrlLocal = "http://127.0.0.1:8080";  // Local Server URL
      const serverUrlExternal = "http://192.168.1.103:8080";  // External Server URL
      
      const PRODUCT_API_URL = "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json"
      const products = getProducts(PRODUCT_API_URL);
      products.then((data) => {
        data.forEach((product) => product.currency = 'TRY'); // manipulating the data to set the currency as a "TRY"
        // You can delete here and use the currency which is existing in data. Now, there is no currency data in PRODUCT_API_URL.
        console.log('data',data);
        buildHTML(data);
        buildCSS();
        setEvents(data);
        displayFavorites();
      });
    };

    const isProductPage = () => {
      return document.querySelector(".product-detail") !== null;
    };

    const getProducts = async (url) => {
      const cachedProducts = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedProducts) {
        return JSON.parse(cachedProducts);
      }

      const response = await fetch(url);
      const products = await response.json();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
      return products;
    };

    const buildHTML = (products) => {
      // <span>${product.price} ${product.currency ? product.currency : 'TRY'}</span>  means if currency data is null , set this data as a TRY. 
      const containerHTML = `
        <div class="carousel-container">
          <h1>You Might Also Like</h1>
          <div class="carousel-wrapper">
            <button class="carousel-nav left">&#x2039;</button>
            <div class="carousel-track">
              ${products
                .map(
                  (product) => `
                <div class="carousel-item" data-id="${product.id}">
                  <a href="${product.url}" target="_blank">
                    <img src="${product.img}" alt="${product.name}" />
                    <p>${product.name}</p>
                    <span>${product.price} ${product.currency ? product.currency : 'TRY'}</span> 
                  </a>
                  <div class="heart-icon ${isFavorited(product.id) ? 'favorited' : ''}">&#x2764;</div>
                </div>`
                )
                .join("")}
            </div>
            <button class="carousel-nav right">&#x203A;</button>
          </div>
        </div>`;

      $(".product-detail").after(containerHTML);
    };

    const buildCSS = () => {
      const css = `
      a{text-decoration : none;}
      .carousel-container {
        margin: 20px 0;
        font-family: Arial, sans-serif;
        }

        .carousel-wrapper {
        position: relative;
        overflow: hidden;
        }

        .carousel-track {
        display: flex;
        transition: transform 0.3s ease;
        }

        .carousel-item {
        flex: 0 0 calc(100% / 6.5);
        box-sizing: border-box;
        padding: 10px;
        text-align: center;
        position: relative;
        }

        .carousel-item img {
        max-width: 100%;
        height: auto;
        border-radius: 5px;
        object-fit: cover;
        }

        .carousel-item p {
        color : black;
        margin: 5px 0;
        font-size: 14px;
        }

        .carousel-item span {
        font-weight: bold;
        color: blue;
        }

        .carousel-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 1;
        padding: 10px;
        }

        .carousel-nav.left {
        left: 0;
        }

        .carousel-nav.right {
        right: 0;
        }

        .heart-icon {
        font-size: 18px;
        cursor: pointer;
        position: absolute;
        top: 5px;
        right: 5px;
        color: white; 
        background-color: rgba(0, 0, 0, 0.6); 
        border-radius: 50%; 
        width: 30px; 
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        }

        .heart-icon.favorited {
        color: red; 
        }

        @media (max-width: 768px) {
        .carousel-item {
            flex: 0 0 calc(100% / 3.5);
        }
        }

        @media (max-width: 480px) {
        .carousel-item {
            flex: 0 0 calc(100% / 2.5);
        }
        }
        .favorites-container img {
        width: 40px;
        height: 40px;
        border-radius: 5px;
        object-fit: cover;
}

       `;

      $("<style>").addClass("carousel-style").html(css).appendTo("head");
    };

    const setEvents = (products) => {
      const $track = $(".carousel-track");
      const $items = $(".carousel-item");

      let currentOffset = 0;
      const itemWidth = $items.outerWidth(true);

      $(".carousel-nav.left").on("click", () => {
        if (currentOffset < 0) {
          currentOffset += itemWidth;
          $track.css("transform", `translateX(${currentOffset}px)`);
        }
      });

      $(".carousel-nav.right").on("click", () => {
        const maxOffset = -(itemWidth * ($items.length - 6.5));
        if (currentOffset > maxOffset) {
          currentOffset -= itemWidth;
          $track.css("transform", `translateX(${currentOffset}px)`);
        }
      });

      $(".heart-icon").on("click", function () {
        const $icon = $(this);
        $icon.toggleClass("favorited");
        const id = $icon.closest(".carousel-item").data("id");

        const productIndex = products.findIndex((product) => product.id === id);
        if (productIndex !== -1) {
          products[productIndex].isFavorited = $icon.hasClass("favorited");
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
          displayFavorites();
        }
      });
    };

    const isFavorited = (id) => {
      const cachedProducts = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedProducts) {
        const products = JSON.parse(cachedProducts);
        const product = products.find((p) => p.id === id);
        return product ? product.isFavorited : false;
      }
      return false;
    };
    const displayFavorites = () => {
      const cachedProducts = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedProducts) {
          const products = JSON.parse(cachedProducts);
          const favoriteProducts = products.filter(product => product.isFavorited);

          if (favoriteProducts.length > 0) {
              if (!$(".favorites-container").length) {
                  const favoritesHTML = `
                      <div class="favorites-container">
                          <h2>Favorilerim</h2>
                          ${favoriteProducts.map(
                              product => `
                              <div class="favorite-item">
                                  <img src="${product.img}" alt="${product.name}" />
                                  <p>${product.name}</p>
                              </div>`
                          ).join('')}
                      </div>`;

                  $(".carousel-container").after(favoritesHTML);
              } else {
                  $(".favorites-container").html(`
                      <h2>Favorilerim</h2>
                      ${favoriteProducts.map(
                          product => `
                          <div class="favorite-item">
                              <img src="${product.img}" alt="${product.name}" />
                              <p>${product.name}</p>
                          </div>`
                      ).join('')}
                  `);
              }
          } else {
              $(".favorites-container").remove();
          }
      }
  };
    init();
})();
