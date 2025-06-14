(function(){
    function escListener(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    }

    function initModal() {
        const imageModalEl = document.getElementById('imageModal');
        if (imageModalEl) {
            imageModalEl.addEventListener('click', function (e) {
                if (e.target === imageModalEl) {
                    window.closeImageModal();
                }
            });
        }
    }

    window.openImageModal = function(src, alt = '') {
        const modal = document.getElementById('imageModal');
        const img = document.getElementById('imageModalImg');
        if (modal && img) {
            img.src = src;
            img.alt = alt;
            modal.classList.add('active');
            document.addEventListener('keydown', escListener);
        }
    };

    window.closeImageModal = function() {
        const modal = document.getElementById('imageModal');
        if (modal) modal.classList.remove('active');
        document.removeEventListener('keydown', escListener);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModal);
    } else {
        initModal();
    }
})();
