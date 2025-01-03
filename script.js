(function () {
    const LOCAL_STORAGE_KEY = "carouselProducts";

    const init = () => {
        // HTML yapısını oluştur
        const htmlContent = `
        <div class="product-detail"></div>`;
        document.body.innerHTML = htmlContent;

        // Carousel'i başlat
        if (!isProductPage()) return;

        const PRODUCT_API_URL =
            "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json";
        const products = getProducts(PRODUCT_API_URL);
        products.then((data) => {
            data.forEach((product) => (product.currency = "TRY"));
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
        document.querySelector(".product-detail").insertAdjacentHTML("afterend", containerHTML);
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
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    };

    const setEvents = (products) => {
        const $track = document.querySelector(".carousel-track");
        const $items = document.querySelectorAll(".carousel-item");
        let currentOffset = 0;
        const itemWidth = $items[0].offsetWidth;

        document.querySelector(".carousel-nav.left").addEventListener("click", () => {
            if (currentOffset < 0) {
                currentOffset += itemWidth;
                $track.style.transform = `translateX(${currentOffset}px)`;
            }
        });

        document.querySelector(".carousel-nav.right").addEventListener("click", () => {
            const maxOffset = -(itemWidth * ($items.length - 6.5));
            if (currentOffset > maxOffset) {
                currentOffset -= itemWidth;
                $track.style.transform = `translateX(${currentOffset}px)`;
            }
        });

        document.querySelectorAll(".heart-icon").forEach((icon) =>
            icon.addEventListener("click", function () {
                const id = this.closest(".carousel-item").dataset.id;
                this.classList.toggle("favorited");
                const productIndex = products.findIndex((product) => product.id === id);
                if (productIndex !== -1) {
                    products[productIndex].isFavorited = this.classList.contains("favorited");
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
                    displayFavorites();
                }
            })
        );
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
            const favoriteProducts = products.filter((product) => product.isFavorited);

            if (favoriteProducts.length > 0) {
                let favoritesHTML = `
                  <div class="favorites-container">
                      <h2>Favorilerim</h2>
                      ${favoriteProducts
                          .map(
                              (product) => `
                          <div class="favorite-item">
                              <img src="${product.img}" alt="${product.name}" />
                              <p>${product.name}</p>
                          </div>`
                          )
                          .join("")}
                  </div>`;
                if (!document.querySelector(".favorites-container")) {
                    document
                        .querySelector(".carousel-container")
                        .insertAdjacentHTML("afterend", favoritesHTML);
                } else {
                    document.querySelector(".favorites-container").innerHTML = favoritesHTML;
                }
            } else {
                const favoritesContainer = document.querySelector(".favorites-container");
                if (favoritesContainer) favoritesContainer.remove();
            }
        }
    };

    init();
})();
