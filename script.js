/**
 * 24x7 Productions - Dynamic Masonry Gallery
 * Loads images 1.jpg, 2.jpg... from /images folder until sequence breaks.
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('masonry-grid');
    const loader = document.getElementById('loader');
    const imageFolder = 'images/';
    const maxConsecutiveErrors = 3; // Stop after 3 missing files

    let imageIndex = 1;
    let consecutiveErrors = 0;
    let images = [];
    let isLoading = true;

    // Show loader
    loader.style.display = 'block';

    /**
     * Attempts to load an image by index.
     * Use a recursive approach to load sequentially or semi-sequentially.
     * To ensure we get ALL images before rendering (for randomization), 
     * we'll fetch them all first.
     */
    function fetchNextImage() {
        const img = new Image();
        const currentIndex = imageIndex;
        const src = `${imageFolder}${currentIndex}.jpg`;

        img.onload = () => {
            // Success
            consecutiveErrors = 0;
            images.push({ src: src, element: img });
            imageIndex++;
            fetchNextImage();
        };

        img.onerror = () => {
            // Failed to load (likely 404)
            consecutiveErrors++;
            // Try next one just in case a number was skipped, up to limit
            if (consecutiveErrors < maxConsecutiveErrors) {
                imageIndex++;
                fetchNextImage();
            } else {
                // Should be done
                finishLoading();
            }
        };

        img.src = src;
    }

    function finishLoading() {
        isLoading = false;
        loader.style.display = 'none';

        if (images.length === 0) {
            grid.innerHTML = '<p style="text-align:center; padding:2rem;">No images found in /images folder.</p>';
            return;
        }

        // Randomize
        shuffleArray(images);

        // Render
        renderGrid();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('close-btn');

    // Lightbox Logic
    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.style.display = 'flex';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        lightboxImg.src = ''; // Clear source
    }

    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox(); // Close when clicking outside image
        }
    });

    function renderGrid() {
        const fragment = document.createDocumentFragment();

        images.forEach(imgObj => {
            const item = document.createElement('div');
            item.className = 'grid-item';

            const img = imgObj.element;
            img.setAttribute('loading', 'lazy'); // Native lazy loading
            img.alt = `Portfolio Image`;

            // Fade in effect
            img.onload = () => img.classList.add('loaded');
            // If already cached/loaded (which it is from our fetch)
            if (img.complete) {
                img.classList.add('loaded');
            }

            // Add click listener for lightbox
            img.addEventListener('click', () => {
                openLightbox(img.src);
            });

            item.appendChild(img);
            fragment.appendChild(item);
        });

        grid.appendChild(fragment);
    }

    // Start fetching
    fetchNextImage();
});
